/**
 *
 *
 */

import EliteFour from '../elitefour';

const meta = {
  battletype: 'anythinggoes'
};

export default class Malva extends EliteFour {
  constructor() {
    super(meta);
  }

  getTeam() {
    // NOTES:
    // 'curse' is weird, might want to check target's ghost-ness.
    // 'earthquake': def. use if the opponent used Dig
    return `
Pyroar
Ability: Rivalry
- Hyper Voice
- Noble Roar
- Flamethrower
- Wild Charge

Torkoal
Ability: White Smoke
- Curse
- Flame Wheel
- Stone Edge
- Earthquake

Chandelure
Ability: Flame Body
- Flamethrower
- Confuse Ray
- Confide
- Shadow Ball

Talonflame
Ability: Flame Body
- Quick Attack
- Brave Bird
- Flare Blitz
- Flail
`;
  }

}
