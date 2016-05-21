'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _log = require('log');

var _log2 = _interopRequireDefault(_log);

var _iterator = require('./iterator');

var _iterator2 = _interopRequireDefault(_iterator);

var _nodeReporter = require('./nodeReporter');

var _nodeReporter2 = _interopRequireDefault(_nodeReporter);

var _decisions = require('decisions');

var _team = require('lib/team');

var _team2 = _interopRequireDefault(_team);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_iterator2.default.prepare();

class Main {
  decide(state) {
    // won't happen for randombattles, but lazily handle for anythinggoes
    if (state.teamPreview) {
      return new _decisions.SWITCH(0);
    }

    return new Promise((resolve, reject) => {
      this.branchPicker(state).then(node => {
        console.log('found my node.');
        if (!node.myChoice) {
          _log2.default.error('well, this is troubling. no myChoice in the node.');
          console.log(node);
        }
        if (node.myChoice.move) {
          return resolve(new _decisions.MOVE(node.myChoice.id));
        } else if (node.myChoice.species) {
          console.log('Gonna switch into ' + node.myChoice.id);
          return resolve(new _decisions.SWITCH(node.myChoice.id));
        }

        _log2.default.error('couldnt read the result of my search.');
        console.log(node);
        reject(node);
      });
    });
  }

  team() {
    console.log('OK, my team function was called.');
    // if this gets called use a predetermined random team.
    return _team2.default.random();
  }

  branchPicker(state) {
    return new Promise(resolve => {
      _iterator2.default.iterateMultiThreaded(state, 3).then(nodes => {
        console.log('im back from iterating. ', nodes.length);
        // console.log(nodes);
        // root node has no choice made. not sure I need this check though.
        const futures = nodes.filter(node => node.myChoice && node.terminated).sort((a, b) => b.fitness - a.fitness); // highest fitness first
        const future = futures[0];

        // console.log('best future?', future);
        // to reach this future, we must reach through the past, and find the
        // choice we originally made to get us here.

        // console.log(JSON.stringify(futures));
        // console.log('(all evaluated nodes in sorted order)');

        console.log(_nodeReporter2.default.report(future));

        let node = future;
        while (node.prevNode && node.prevNode.prevNode) {
          node = node.prevNode;
        }
        console.log(_nodeReporter2.default.report(node));
        resolve(node);
      });
    });
  }
}
exports.default = Main;