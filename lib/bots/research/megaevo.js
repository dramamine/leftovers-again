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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * See if this guy mega-evolves. Or not! Check shouldMegaEvo to see what
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * you're doing
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * npm run develop -- --bot=research/megaevo
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var moveId = 'scald';

var MegaEvo = function (_AI) {
  _inherits(MegaEvo, _AI);

  function MegaEvo() {
    _classCallCheck(this, MegaEvo);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MegaEvo).call(this));

    _this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes'
    };

    _this.ctr = -1;
    return _this;
  }

  _createClass(MegaEvo, [{
    key: 'team',
    value: function team() {
      return '\nBlastoise @ Blastoisinite\nAbility: Rain Dish\nEVs: 184 HP / 252 SpA / 72 Spe\nModest Nature\n- Rapid Spin\n- Scald\n- Dark Pulse\n- Ice Beam\n\n';
    }
  }, {
    key: 'decide',
    value: function decide(state) {
      if (state.teamPreview || state.forceSwitch || !this.can(state)) {
        this.ctr = this.ctr + 1;
        // will crash out when ctr >= 7;
        return new _decisions.SWITCH(this.ctr);
      }
      var move = new _decisions.MOVE(moveId);
      // set to false to see if we DON'T mega-evolve
      move.shouldMegaEvo = false;
      return move;
    }
  }, {
    key: 'can',
    value: function can(state) {
      if (!state.self.active) return false;
      if (!state.self.active.moves) return false;
      var move = state.self.active.moves.find(function (m) {
        return m.id === moveId;
      });
      if (move.disabled) return false;
      return true;
    }
  }]);

  return MegaEvo;
}(_ai2.default);

exports.default = MegaEvo;