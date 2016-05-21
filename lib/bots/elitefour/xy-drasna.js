'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Drasna extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}

exports.default = Drasna;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Drasna x',
  team: `
Dragalge
Ability: Poison Point
- Sludge Bomb
- Surf
- Thunderbolt
- Dragon Pulse

Altaria
Ability: Natural Cure
- Dragon Pulse
- Moonblast
- Sing
- Cotton Guard

Druddigon
Ability: Rough Skin
- Dragon Tail
- Revenge
- Retaliate
- Chip Away

Noivern
Ability: Frisk
- Flamethrower
- Boomburst
- Air Slash
- Dragon Pulse
`
};