'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Wikstrom extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}

exports.default = Wikstrom;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFouroWikstrom',
  team: `
Klefki
Ability: Prankster
- Spikes
- Torment
- Dazzling Gleam
- Flash Cannon

Probopass
Ability: Sturdy
- Power Gem
- Earth Power
- Flash Cannon
- Discharge

Scizor
Ability: Technician
- X-Scissor
- Iron Head
- Bullet Punch
- Night Slash

Aegislash
Ability: Stance Change
- Sacred Sword
- Iron Head
- King's Shield
- Shadow Claw
`
};