'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Malva = function (_EliteFour) {
  _inherits(Malva, _EliteFour);

  function Malva() {
    _classCallCheck(this, Malva);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Malva).call(this));

    _this.meta = meta;
    return _this;
  }

  return Malva;
}(_elitefour2.default);

exports.default = Malva;


var meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Malva x',
  team: '\nPyroar\nAbility: Rivalry\n- Hyper Voice\n- Noble Roar\n- Flamethrower\n- Wild Charge\n\nTorkoal\nAbility: White Smoke\n- Curse\n- Flame Wheel\n- Stone Edge\n- Earthquake\n\nChandelure\nAbility: Flame Body\n- Flamethrower\n- Confuse Ray\n- Confide\n- Shadow Ball\n\nTalonflame\nAbility: Flame Body\n- Quick Attack\n- Brave Bird\n- Flare Blitz\n- Flail\n'
};