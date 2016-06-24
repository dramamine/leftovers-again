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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * SplashBot
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var SplashBot = function (_AI) {
  _inherits(SplashBot, _AI);

  function SplashBot() {
    _classCallCheck(this, SplashBot);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SplashBot).call(this));

    _this.ctr = -1;
    return _this;
  }

  _createClass(SplashBot, [{
    key: 'team',
    value: function team() {
      return '\nMagikarpA (Magikarp) @ Leftovers\nAbility: Swift Swim\nLevel: 100\nEVs: 252 HP / 4 SpD / 252 Spe\nTimid Nature\n- Splash\n\nMagikarpB (Magikarp) @ Leftovers\nAbility: Swift Swim\nLevel: 100\nEVs: 252 HP / 4 SpD / 252 Spe\nTimid Nature\n- Splash\n\nMagikarpC (Magikarp) @ Leftovers\nAbility: Swift Swim\nLevel: 100\nEVs: 252 HP / 4 SpD / 252 Spe\nTimid Nature\n- Splash\n\nMagikarpD (Magikarp) @ Leftovers\nAbility: Swift Swim\nLevel: 100\nEVs: 252 HP / 4 SpD / 252 Spe\nTimid Nature\n- Splash\n\nMagikarpE (Magikarp) @ Leftovers\nAbility: Swift Swim\nLevel: 100\nEVs: 252 HP / 4 SpD / 252 Spe\nTimid Nature\n- Splash\n\nMagikarpF (Magikarp) @ Leftovers\nAbility: Swift Swim\nLevel: 100\nEVs: 252 HP / 4 SpD / 252 Spe\nTimid Nature\n- Splash\n';
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
      // console.log(state);
      console.log('how many alive?' + state.self.reserve.filter(function (mon) {
        return !mon.dead;
      }).length);
      console.log('how many dead?' + state.self.reserve.filter(function (mon) {
        return mon.dead;
      }).length);
      if (state.forceSwitch || state.teamPreview || state.self.active.length === 0) {
        this.ctr++;
        var possibleMons = state.self.reserve.filter(function (mon) {
          if (mon.condition === '0 fnt') return false;
          if (mon.active) return false;
          if (mon.dead) return false;
          return true;
        });
        var myMon = this._pickOne(possibleMons);
        console.log('switching to: ', myMon);
        console.log(JSON.stringify(state));
        return new _decisions.SWITCH(this.ctr);
      }
      console.log('doing this move: (splash)');
      // console.log(JSON.stringify(state));
      return new _decisions.MOVE(0); // splash
    }
  }, {
    key: '_pickOne',
    value: function _pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return SplashBot;
}(_ai2.default);

exports.default = SplashBot;