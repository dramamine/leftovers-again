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

var Wikstrom = function (_EliteFour) {
  _inherits(Wikstrom, _EliteFour);

  function Wikstrom() {
    _classCallCheck(this, Wikstrom);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Wikstrom).call(this));

    _this.meta = meta;
    return _this;
  }

  return Wikstrom;
}(_elitefour2.default);

exports.default = Wikstrom;


var meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFouroWikstrom',
  team: '\nKlefki\nAbility: Prankster\n- Spikes\n- Torment\n- Dazzling Gleam\n- Flash Cannon\n\nProbopass\nAbility: Sturdy\n- Power Gem\n- Earth Power\n- Flash Cannon\n- Discharge\n\nScizor\nAbility: Technician\n- X-Scissor\n- Iron Head\n- Bullet Punch\n- Night Slash\n\nAegislash\nAbility: Stance Change\n- Sacred Sword\n- Iron Head\n- King\'s Shield\n- Shadow Claw\n'
};