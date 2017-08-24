const EliteFour = require('./elitefour');

module.exports = class Drasna extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'uu',
  accepts: 'ALL',
  nickname: 'la-xy-drasna',
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
