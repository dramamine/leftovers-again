const EliteFour = require('./elitefour');

module.exports = class Wikstrom extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'xy-wikstrom',
  team: `
Klefki
Ability: Prankster
- Spikes
- Torment
- Dazzling Gleam
- Flash Cannon

Probopass
Ability: Sturdy
- Power Gem
- Earth Power
- Flash Cannon
- Discharge

Scizor
Ability: Technician
- X-Scissor
- Iron Head
- Bullet Punch
- Night Slash

Aegislash
Ability: Stance Change
- Sacred Sword
- Iron Head
- King's Shield
- Shadow Claw
`
};
