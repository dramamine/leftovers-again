'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _typechart = require('../../game/typechart');

var _typechart2 = _interopRequireDefault(_typechart);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

/**
 * This is used in calculating randomness. If the exponent is 1, you'll end
 * up using flat weight numbers; at higher exponents you will more often favor
 * the moves that you decided you're more likely to use. Ex. if we have a super
 * effective move, we want the chance that we'll use it to be REALLY high.
 *
 */
var randomnessExponent = 2;

var weights = {
  effectiveness: {
    weight: 10,
    // check typechart for all possibilities
    value: function value(val) {
      return {
        0: 0,
        0.5: 1,
        1: 2,
        2: 10,
        4: 20
      }[val];
    }
  },
  // boolean
  stabby: {
    weight: 10
  },
  // this # is the chance that the effect will happen (ex. 10% or 100%)
  status: {
    weight: 10
  },
  unboost: {
    weight: 10
  },
  prioritykill: {
    weight: 15
  },
  recoil: {
    weight: -5
  },
  // for whatever random stuff we wanna throw in here.
  bonus: {
    weight: 1
  }

};

var EliteFour = function (_AI) {
  _inherits(EliteFour, _AI);

  function EliteFour(meta) {
    _classCallCheck(this, EliteFour);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EliteFour).call(this, meta));

    _this.lastMove = null;
    _this.weights = weights;
    _this.randomnessExponent = randomnessExponent;
    return _this;
  }

  _createClass(EliteFour, [{
    key: 'decide',
    value: function decide(state) {
      var _this2 = this;

      if (state.forceSwitch) {
        // our pokemon died :(
        // choose a random one
        var possibleMons = state.self.reserve.filter(function (mon) {
          if (mon.condition === '0 fnt') return false;
          if (mon.active) return false;
          return true;
        });
        var myMon = this.pickOne(possibleMons);
        return new _decisions.SWITCH(myMon);
      }

      if (state.teamPreview) {
        // always pick the first mon
        return new _decisions.SWITCH(0);
      }

      var fitness = {};
      var totalFitness = {};
      state.self.active.moves.forEach(function (move) {
        if (move.disabled) return;
        fitness[move.id] = {};

        // favor super-effective moves, disfavor ineffective / weak moves
        fitness[move.id].effectiveness = _typechart2.default.compare(move.type, state.opponent.active.types);

        fitness[move.id].stabby = !!state.self.active.types.indexOf(move.type);

        // favor unboosting moves on non-unboosted opponents,
        // as long as we didn't just try this move.
        if (move.category === 'Status' && move.id !== _this2.lastMove && move.boosts) {
          ['atk', 'spa', 'spd', 'spe', 'def'].forEach(function (type) {
            if (!move.boosts[type]) return;

            if (state.opponent.active.boosts && state.opponent.active.boosts[type] && state.opponent.active.boosts[type] < 0) return;

            // OK, we're in the clear here.
            fitness[move.id].unboost = true;
          });
        }

        // favor status moves on non-statused opponents,
        // as long as we didn't just try this move.
        if (move.secondary && move.id !== _this2.lastMove) {
          if (!state.opponent.active.conditions || !state.opponent.active.conditions.indexOf(move.secondary.status) >= 0) {
            fitness[move.id].status = move.secondary.chance;
          }
        }
        // @TODO check volatileStatus for moves like Confuse Ray

        // priority moves
        if (move.priority > 0 && state.opponent.active.hp < 25) {
          fitness[move.id].prioritykill = true;
        }

        // unfavor moves that leave me dead
        // @TODO I don't like that hppct and active opponent's hp are both percent fields
        if (move.recoil && state.self.active.hppct < 33) {
          fitness[move.id].recoil = true;
        }

        if (move.id === 'flail' && state.self.active.hppct < 33) {
          fitness[move.id].bonus = 20;
        }

        totalFitness[move.id] = _this2.sumFitness(fitness[move.id]);
      });

      // pick a move from total fitness
      var myMove = this.pickMoveByFitness(totalFitness);
      return new _decisions.MOVE(myMove);
    }
  }, {
    key: 'sumFitness',
    value: function sumFitness(obj) {
      var sum = 0;
      for (var key in obj) {
        if (weights[key]) {
          // run the value function if it exists;
          // else, convert the value to a number and use that.
          var value = weights[key].value ? weights[key].value(obj[key]) : +obj[key];

          sum = sum + weights[key].weight * value;
        }
      }
      return sum;
    }
  }, {
    key: 'pickMoveByFitness',
    value: function pickMoveByFitness(moveArr) {
      var total = 0;
      var weighted = {};
      for (var move in moveArr) {
        if ({}.hasOwnProperty.call(moveArr, move)) {
          weighted[move] = moveArr[move] >= 0 ? Math.pow(moveArr[move], randomnessExponent) : 0;
          total = total + weighted[move];
        }
      }
      var myVal = Math.random() * total;
      var accum = 0;
      for (var _move in weighted) {
        if ({}.hasOwnProperty.call(weighted, _move)) {
          accum = accum + weighted[_move];
          if (accum > myVal) return _move;
        }
      }
      // something went wrong
      return false;
    }

    // random

  }, {
    key: 'pickOne',
    value: function pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return EliteFour;
}(_ai2.default);

exports.default = EliteFour;