import EliteFour from './elitefour';

export default class Drasna extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

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
