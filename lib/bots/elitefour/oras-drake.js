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

var Drake = function (_EliteFour) {
  _inherits(Drake, _EliteFour);

  function Drake() {
    _classCallCheck(this, Drake);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Drake).call(this));

    _this.meta = meta;
    return _this;
  }

  return Drake;
}(_elitefour2.default);

exports.default = Drake;


var meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Drake x',
  description: 'If you\'re reading this it\'s too late.',
  team: '\nAltaria\nAbility: Natural Cure\n- Aerial Ace\n- Cotton Guard\n- Dragon Pulse\n- Moonblast\n\nDragalge\nAbility: Poison Point\n- Dragon Pulse\n- Hydro Pump\n- Sludge Wave\n- Thunderbolt\n\nKingdra\nAbility: Swift Swim\n- Dragon Pulse\n- Surf\n- Yawn\n- Ice Beam\n\nFlygon\nAbility: Levitate\n- Flamethrower\n- Boomburst\n- Dragon Pulse\n- Screech\n\nHaxorus\nAbility: Rivalry\n- Dragon Claw\n- Earthquake\n- X-Scissor\n- Shadow Claw\n\nSalamence @ Salamencite\nAbility: Intimidate\n- Dragon Rush\n- Zen Headbutt\n- Crunch\n- Thunder Fang\n'
};