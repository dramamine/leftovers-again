'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Phoebe extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}
exports.default = Phoebe;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Phoebe x',
  team: `
Banette
Ability: Frisk
- Shadow Ball
- Grudge
- Toxic
- Psychic

Mismagius
Ability: Levitate
- Shadow Ball
- Power Gem
- Thunderbolt
- Pain Split

Drifblim
Ability: Aftermath
- Phantom Force
- Psychic
- Icy Wind
- Acrobatics

Chandelure
Ability: Flame Body
- Hex
- Flamethrower
- Energy Ball
- Dark Pulse

Dusknoir
Ability: Pressure
- Hex
- Fire Punch
- Ice Punch
- Thunder Punch

Sableye @ Sablenite
Ability: Keen Eye
- Shadow Claw
- Foul Play
- Power Gem
- Fake Out
`
};