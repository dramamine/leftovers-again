const EliteFour = require('./elitefour');

module.exports = class Kahili extends EliteFour {
  constructor() {
    super();
    this.meta = {
      format: 'gen7pokebankou',
      accepts: 'ALL',
      nickname: 'la-sm-kahili',
      team: `
Skarmory
Ability: Keen Eye
- Steel Wing
- Night Slash
- Rock Slide
- Spikes

Crobat
Ability: Inner Focus
IVs: 0 Atk
- Air Slash
- Shadow Ball
- Dark Pulse
- Sludge Bomb

Oricorio
Ability: Dancer
IVs: 0 Atk
- Revelation Dance
- Teeter Dance
- Air Slash
- Feather Dance

Mandibuzz
Ability: Big Pecks
IVs: 0 Atk
- Snarl
- Air Slash
- Roost
- Toxic

Toucannon @ Flyinium Z
Ability: Skill Link
- Bullet Seed
- Rock Blast
- Beak Blast
- Brick Break
`
    };
  }
}
