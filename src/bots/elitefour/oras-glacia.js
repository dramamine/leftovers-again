const EliteFour = require('./elitefour');

module.exports = class Glacia extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'uu',
  accepts: 'ALL',
  nickname: 'la-oras-glacia',
  team: `
Abomasnow
Ability: Snow Warning
EVs: 248 HP / 252 Atk / 8 SpA
Lonely Nature
- Blizzard
- Wood Hammer
- Ice Shard
- Earthquake

Beartic
Ability: Snow Cloak
EVs: 252 HP / 252 Atk / 4 SpD
Adamant Nature
- Icicle Crash
- Slash
- Shadow Claw
- Brick Break

Froslass
Ability: Snow Cloak
EVs: 252 SpA / 4 SpD / 252 Spe
Timid Nature
- Draining Kiss
- Blizzard
- Hail
- Shadow Ball

Vanilluxe
Ability: Ice Body
EVs: 252 HP / 252 SpA / 4 SpD
Modest Nature
- Ice Beam
- Mirror Coat
- Freeze-Dry
- Signal Beam

Walrein @ Leftovers
Ability: Thick Fat
EVs: 248 HP / 8 Atk / 252 SpA
Mild Nature
- Surf
- Body Slam
- Blizzard
- Toxic

Glalie @ Glalitite
Ability: Inner Focus
EVs: 248 HP / 8 Atk / 252 SpD
Gentle Nature
- Protect
- Ice Shard
- Hail
- Freeze-Dry
`
};
