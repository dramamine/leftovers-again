import EliteFour from './elitefour';

export default class Malva extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  battletype: 'anythinggoes',
  accepts: 'ALL',
  format: 'anythinggoes',
  team: `
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
`
};
