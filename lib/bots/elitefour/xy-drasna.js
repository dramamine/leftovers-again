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

var Drasna = function (_EliteFour) {
  _inherits(Drasna, _EliteFour);

  function Drasna() {
    _classCallCheck(this, Drasna);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Drasna).call(this));

    _this.meta = meta;
    return _this;
  }

  return Drasna;
}(_elitefour2.default);

exports.default = Drasna;


var meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Drasna x',
  team: '\nDragalge\nAbility: Poison Point\n- Sludge Bomb\n- Surf\n- Thunderbolt\n- Dragon Pulse\n\nAltaria\nAbility: Natural Cure\n- Dragon Pulse\n- Moonblast\n- Sing\n- Cotton Guard\n\nDruddigon\nAbility: Rough Skin\n- Dragon Tail\n- Revenge\n- Retaliate\n- Chip Away\n\nNoivern\nAbility: Frisk\n- Flamethrower\n- Boomburst\n- Air Slash\n- Dragon Pulse\n'
};