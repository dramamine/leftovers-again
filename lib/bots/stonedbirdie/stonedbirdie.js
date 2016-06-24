'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * StonedBirdie
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var StonedBirdie = function (_AI) {
  _inherits(StonedBirdie, _AI);

  function StonedBirdie() {
    _classCallCheck(this, StonedBirdie);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StonedBirdie).call(this));
  }

  _createClass(StonedBirdie, [{
    key: 'team',
    value: function team() {
      return '\nTyranny (Tyranitar) @ Choice Band\nAbility: Sand Stream\nEVs: 100 HP / 252 Atk / 156 Spe\nAdamant Nature\n- Stone Edge\n- Crunch\n- Superpower\n- Pursuit\n\nBranny (Tyranitar) @ Choice Band\nAbility: Sand Stream\nEVs: 100 HP / 252 Atk / 156 Spe\nAdamant Nature\n- Stone Edge\n- Crunch\n- Superpower\n- Pursuit\n\nCranny (Tyranitar) @ Choice Band\nAbility: Sand Stream\nEVs: 100 HP / 252 Atk / 156 Spe\nAdamant Nature\n- Stone Edge\n- Crunch\n- Superpower\n- Pursuit\n\nDanny (Tyranitar) @ Choice Band\nAbility: Sand Stream\nEVs: 100 HP / 252 Atk / 156 Spe\nAdamant Nature\n- Stone Edge\n- Crunch\n- Superpower\n- Pursuit\n\nFannie (Tyranitar) @ Choice Band\nAbility: Sand Stream\nEVs: 100 HP / 252 Atk / 156 Spe\nAdamant Nature\n- Stone Edge\n- Crunch\n- Superpower\n- Pursuit\n\nGranny (Tyranitar) @ Choice Band\nAbility: Sand Stream\nEVs: 100 HP / 252 Atk / 156 Spe\nAdamant Nature\n- Stone Edge\n- Crunch\n- Superpower\n- Pursuit\n';
    }

    /**
     * Here's the main loop of your bot. Please read the documentation for more
     * details.
     *
     * @param  {Object} state The current state of the game.
     *
     * @return {Decision}     A decision object.
     */

  }, {
    key: 'decide',
    value: function decide(state) {
      console.log(state);
      if (state.forceSwitch || state.teamPreview) {
        var myMon = this._pickOne(state.self.reserve.filter(function (mon) {
          return !mon.dead;
        }));
        return new _decisions.SWITCH(myMon);
      }

      // const myMove = this._pickOne(
      //   state.self.active.moves.filter( move => !move.disabled )
      // );
      return new _decisions.MOVE('stoneedge');
    }
  }, {
    key: '_pickOne',
    value: function _pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return StonedBirdie;
}(_ai2.default);

exports.default = StonedBirdie;