const EliteFour = require('./elitefour');

module.exports = class Acerola extends EliteFour {
  constructor() {
    super();
    this.meta = {
      format: 'gen7pokebankuu',
      accepts: 'ALL',
      nickname: 'la-sm-acerola',
      team: `
Sableye
Ability: Keen Eye
- Shadow Claw
- Zen Headbutt
- Brick Break
- Fake Out

Drifblim
Ability: Aftermath
IVs: 0 Atk
- Shadow Ball
- Thunderbolt
- Psychic
- Will-O-Wisp

Dhelmise
Ability: Steelworker
- Phantom Force
- Heavy Slam
- Earthquake
- Brutal Swing

Froslass
Ability: Snow Cloak
- Blizzard
- Shadow Ball
- Thunderbolt
- Ice Shard

Palossand @ Ghostium Z
Ability: Water Compaction
IVs: 0 Atk
- Shadow Ball
- Earth Power
- Sludge Bomb
- Giga Drain
`
    };
  }
}
