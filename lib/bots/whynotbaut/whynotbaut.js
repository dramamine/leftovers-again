'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

var _pokeutil = require('../../pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Whynotbaut
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var Whynotbaut = function (_AI) {
  _inherits(Whynotbaut, _AI);

  function Whynotbaut() {
    _classCallCheck(this, Whynotbaut);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Whynotbaut).call(this));
  }

  _createClass(Whynotbaut, [{
    key: 'team',
    value: function team() {
      return '\nWhynaut (Wynaut) @ Berry Juice\nLevel: 100\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Destiny Bond\n\nWhybaut (Wynaut) @ Berry Juice\nLevel: 100\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Destiny Bond\n\nWhybot (Wynaut) @ Berry Juice\nLevel: 100\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Destiny Bond\n\nWheybot (Wynaut) @ Berry Juice\nLevel: 100\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Destiny Bond\n\nWobot (Wynaut) @ Berry Juice\nLevel: 100\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Destiny Bond\n\nWy (Wynaut) @ Berry Juice\nLevel: 100\nAbility: Shadow Tag\nEVs: 236 HP / 132 Def / 132 SpD\nBold Nature\n- Encore\n- Counter\n- Mirror Coat\n- Destiny Bond\n\n';
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
      if (state.forceSwitch || state.teamPreview) {
        var myMon = this._pickOne(state.self.reserve.filter(function (mon) {
          return !mon.dead;
        }));
        return new _decisions.SWITCH(myMon);
      }

      var move = '';
      var myHp = state.self.active.hppct;

      if (myHp > 80 && myHp < 100 && state.self.active.lastMove !== 'encore') {
        move = 'encore';
      } else if (myHp < 25) {
        move = 'destinybond';
      } else {
        move = this._pickMirrorCoatOrCounter(state);
      }

      return new _decisions.MOVE(move);
    }
  }, {
    key: '_pickMirrorCoatOrCounter',
    value: function _pickMirrorCoatOrCounter(state) {
      var theirMove = state.opponent.active.lastMove;
      if (theirMove) {
        var theirMoveObject = _pokeutil2.default.researchMoveById(theirMove);
        switch (theirMoveObject.category) {
          case 'Physical':
            return 'counter';
          case 'Special':
            return 'mirrorcoat';
          default:
            break;
        }
      }

      if (state.opponent.active.baseStats.atk > state.opponent.active.baseStats.spa) {
        return 'counter';
      }
      return 'mirrorcoat';
    }
  }, {
    key: '_pickOne',
    value: function _pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return Whynotbaut;
}(_ai2.default);

exports.default = Whynotbaut;