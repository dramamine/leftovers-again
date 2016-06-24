'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _damage = require('../../game/damage');

var _damage2 = _interopRequireDefault(_damage);

var _kochance = require('../../game/kochance');

var _kochance2 = _interopRequireDefault(_kochance);

var _typechart = require('../../game/typechart');

var _typechart2 = _interopRequireDefault(_typechart);

var _formats = require('../../data/formats');

var _formats2 = _interopRequireDefault(_formats);

var _log = require('../../log');

var _log2 = _interopRequireDefault(_log);

var _pokeutil = require('../../pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Get some helpful info about pokemon & their moves
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Infodump = function (_AI) {
  _inherits(Infodump, _AI);

  function Infodump() {
    _classCallCheck(this, Infodump);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Infodump).call(this));
  }

  _createClass(Infodump, [{
    key: 'decide',
    value: function decide(state) {
      _log2.default.info('infodumps state:: ', state);
      _damage2.default.assumeStats(state.opponent.active);
      if (state.forceSwitch) {
        // our pokemon died :(
        // choose a random one
        //
        var possibleMons = state.self.reserve.filter(function (mon) {
          if (mon.condition === '0 fnt') return false;
          if (mon.active) return false;
          return true;
        });
        var myMon = this.pickOne(possibleMons);
        return new _decisions.SWITCH(myMon);
      }

      // check each move
      var maxDamage = 0;
      var bestMove = 0;

      state.self.active.moves.forEach(function (move, idx) {
        if (move.disabled) return;
        if (move.pp === 0) return;
        var est = -1;
        try {
          est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move, { weather: state.weather });
        } catch (e) {
          _log2.default.error(e);
          _log2.default.error(state.self.active, state.opponent.active, move);
        }
        _log2.default.info('estimated ' + est + ' for move ' + move.name);
        if (est > maxDamage) {
          maxDamage = est;
          bestMove = idx;
        }
      });

      return new _decisions.MOVE(bestMove);
    }
  }, {
    key: 'getHelp',
    value: function getHelp(state) {
      // console.log('infodumps help state:: ', state);
      _damage2.default.assumeStats(state.opponent.active);

      var extra = {};

      try {
        extra.moves = this._moves(state);
      } catch (e) {
        _log2.default.error(e);
        _log2.default.error(JSON.stringify(state));
      }
      try {
        extra.switches = this._switches(state);
      } catch (e) {
        _log2.default.error(e);
        _log2.default.error(JSON.stringify(state));
      }

      return extra;
    }
  }, {
    key: '_moves',
    value: function _moves(state) {
      var extra = [];
      // this'll be null during forceSwitch
      if (state.self.active && state.self.active.moves) {
        state.self.active.moves.forEach(function (move) {
          var est = [-1];
          if (!move.disabled) {
            try {
              est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move, { weather: state.weather });
            } catch (e) {
              _log2.default.error(e);
            }
          }
          var ko = _kochance2.default.predictKO(est, state.opponent.active);
          extra.push({
            name: move.name,
            dmgMin: est[0],
            dmgMax: est[est.length - 1],
            koTurn: ko.turns || null,
            koChance: ko.chance || null
          });
        });
      }
      return extra;
    }
  }, {
    key: '_switches',
    value: function _switches(state) {
      _log2.default.log('input:');
      _log2.default.log(JSON.stringify(state));
      // query for moves
      var formatData = _formats2.default[_pokeutil2.default.toId(state.opponent.active.species)];
      var possibleMoves = formatData.randomBattleMoves;
      if (!possibleMoves) {
        return {
          error: 'couldnt find species in random moves dictionary: ' + state.opponent.active.species
        };
      }
      // for each of my pokemons...
      var results = state.self.reserve.map(function (mon) {
        // see how the opponent would fare against this mon of mine.
        var yourMoves = possibleMoves.map(function (move) {
          // check damage from each of the opponent's moves against this mon.
          var est = [-1];
          try {
            est = _damage2.default.getDamageResult(state.opponent.active, mon, move, { weather: state.weather });
          } catch (e) {
            _log2.default.error(e, state.opponent.active, mon, move);
          }
          return {
            name: move, // this is just the ID of a move
            dmg: est,
            against: mon
          };
        }).sort(function (a, b) {
          return a.dmg[0] < b.dmg[0];
        });

        // see how my moves would fare against the opponent's current mon.
        var myMoves = mon.moves.map(function (move) {
          var est = [-1];
          try {
            est = _damage2.default.getDamageResult(mon, // my mon
            state.opponent.active, move, // my move
            { weather: state.weather });
            _log2.default.info('my ' + mon.species + ' uses ' + move.name + ' against ' + state.opponent.active.species + ':', est);
          } catch (e) {
            _log2.default.error(e);
          }

          return {
            name: move.id, // this is a move object
            dmg: est,
            against: state.opponent.active
          };
        }).sort(function (a, b) {
          return a.dmg[0] < b.dmg[0];
        });

        // also check type advantage of mons in general
        var strength = false;
        var weakness = false;
        var attacks = [];
        var defenses = [];
        state.opponent.active.types.forEach(function (yourtype) {
          mon.types.forEach(function (mytype) {
            attacks.push(_typechart2.default.compare(mytype, yourtype));
            defenses.push(_typechart2.default.compare(yourtype, mytype));
          });
        });

        var maxatk = Math.max.apply(Math, attacks);
        var maxdef = Math.max.apply(Math, defenses);
        if (maxatk > 1) strength = true;
        if (maxdef > 1) weakness = true;

        // console.log(mon);

        var yourBest = yourMoves[0];
        _log2.default.info('predicting KO..', yourBest.dmg, yourBest.against);
        var yourKO = _kochance2.default.predictKO(yourBest.dmg, yourBest.against);

        var myBest = myMoves[0];
        _log2.default.info('predicting KO..', myBest.dmg, myBest.against);
        var myKO = _kochance2.default.predictKO(myBest.dmg, myBest.against);

        return {
          species: mon.species,
          active: mon.active,
          yourBest: {
            name: yourBest.name,
            dmgMin: yourBest.dmg[0],
            dmgMax: yourBest.dmg[yourBest.dmg.length - 1],
            koTurns: yourKO.turns,
            koChance: yourKO.chance
          },
          myBest: {
            name: myBest.name,
            dmgMin: myBest.dmg[0],
            dmgMax: myBest.dmg[myBest.dmg.length - 1],
            koTurns: myKO.turns,
            koChance: myKO.chance
          },
          strength: strength,
          weakness: weakness
        };
      });
      _log2.default.log('output:');
      _log2.default.log(results);
      return results;
    }
  }, {
    key: 'pickOne',
    value: function pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return Infodump;
}(_ai2.default);

exports.default = Infodump;