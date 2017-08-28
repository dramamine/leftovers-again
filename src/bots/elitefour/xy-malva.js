const EliteFour = require('./elitefour');

module.exports = class Malva extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'ou',
  accepts: 'ALL',
  nickname: 'xy-malva',
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
