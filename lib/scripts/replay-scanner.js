'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _battlestore = require('../src/model/battlestore');

var _battlestore2 = _interopRequireDefault(_battlestore);

var _report = require('../src/report');

var _report2 = _interopRequireDefault(_report);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mongourl = 'mongodb://localhost:27017/test';
var BATCH_SIZE = 1000;
var BATCH_WAIT = 1000;
var lastResearched = void 0;
var stack = 0;
var completed = 0;
var mongo = void 0;

// 18:36 => xx:xx with 1000/1000

_mongodb.MongoClient.connect(mongourl, function (err, db) {
  if (err) return console.error(err);
  console.log('db loaded.');
  mongo = db;

  lookupLastResearched();
});

var ReplayScanner = function () {
  function ReplayScanner() {
    _classCallCheck(this, ReplayScanner);
  }

  _createClass(ReplayScanner, [{
    key: 'processFile',
    value: function processFile(data, file) {
      var _this = this;

      var store = new _battlestore2.default();
      store.myId = 'p1';

      data.split('\n').forEach(function (line) {
        var splits = line.split('|');
        if (splits.length <= 2) return;
        var type = splits[1];
        var message = splits.slice(2);
        store.handle(type, message);

        if (type === 'win') {
          var report = _report2.default.win(message[0], store, file.split('/').pop());
          _this.handleResults(report);
        }
      });
    }
  }, {
    key: 'handleResults',
    value: function handleResults(report) {
      var ref = arguments.length <= 1 || arguments[1] === undefined ? this : arguments[1];

      if (!mongo) {
        console.error('db not ready.');
        setTimeout(ref.handleResults, 1000, report, this);
        return;
      }
      var justone = report;
      var dbentry = Object.assign({}, {
        matchid: justone.matchid,
        won: justone.won,
        damageDone: justone.damageDone,
        damageTaken: justone.damageTaken,
        me: justone.me,
        you: justone.you,
        mine: justone.mine,
        yours: justone.yours
      });

      mongo.collection('randombattle').insertOne(dbentry, function (err, result) {
        if (err) return console.error(err);
        // console.log(result.insertedId);
        // console.log('saved a randombattle result.');
      });
      // console.log('using this as ref:', ref);
      ref.saveEvents(justone.events, justone.matchid);
    }
  }, {
    key: 'saveEvents',
    value: function saveEvents(events, matchid) {
      // console.log(matchid + ': saving results');

      var filtered = events.filter(function (event) {
        return event.type !== 'damage';
      });
      var modded = filtered.map(function (event) {
        event.matchid = matchid;
        return event;
      });

      mongo.collection('events').insert(modded, function (err, result) {
        if (err) {
          return console.error(err, result);
        }
        // console.log('event inserted:', result);
      });
    }
  }]);

  return ReplayScanner;
}();

var fileReader = function fileReader(file) {
  // console.log('gonna read file ', file);
  var rs = new ReplayScanner(file);
  _fs2.default.readFile(file, 'ascii', function (err, data) {
    if (err) {
      throw err;
    }
    rs.processFile(data, file);
    // console.log('done reading file ', file);
    completed++;
    stack--;
  });
};

var lookupLastResearched = function lookupLastResearched() {
  var options = { 'sort': [['matchid', 'desc']] };
  mongo.collection('randombattle').findOne({}, options, function (err, doc) {
    // ex. if collection doesn't exist yet
    if (doc) {
      lastResearched = doc.matchid;
    }

    globForReplays();
  });
};

var globForReplays = function globForReplays() {
  (0, _glob2.default)('replays/replays/randombattle-*', [], function (err, replays) {
    if (err) return console.log(err);
    var startWith = 0;
    if (lastResearched) {
      startWith = replays.findIndex(function (replay) {
        return replay.indexOf(lastResearched) > 0;
      }) + 1; // solves our -1 issue and skips the one we found!
    }

    var stagger = function stagger(idx) {
      if (stack > 1500) {
        // come back later
        console.log('coming back later.');
        setTimeout(stagger, BATCH_WAIT, idx);
        return;
      }

      console.log('stagger called with ', idx);
      if (idx >= replays.length) return;
      for (var i = idx; i < replays.length && i < idx + BATCH_SIZE; i++) {
        stack++;
        fileReader(replays[i]);
      }
      console.log('waiting ' + BATCH_WAIT + 'ms with stack ' + stack + ' and idx ' + idx + ' and completed ' + completed);
      setTimeout(stagger, BATCH_WAIT, idx + BATCH_SIZE);
    };

    stagger(startWith);
  });
};