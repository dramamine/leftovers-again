/**
 *
 *
 */

import EliteFour from '../elitefour';

const meta = {
  battletype: 'anythinggoes'
};

export default class Drasna extends EliteFour {
  constructor() {
    super(meta);
  }

  getTeam() {
    // NOTES:
    // 'curse' is weird, might want to check target's ghost-ness.
    // 'earthquake': def. use if the opponent used Dig
    return `
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
`;
  }

}
