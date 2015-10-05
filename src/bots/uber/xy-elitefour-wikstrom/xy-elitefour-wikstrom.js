/**
 *
 *
 */

import EliteFour from '../elitefour';

const meta = {
  battletype: 'anythinggoes'
};

export default class Wikstrom extends EliteFour {
  constructor() {
    super(meta);
  }

  getTeam() {
    // NOTES:
    // 'curse' is weird, might want to check target's ghost-ness.
    // 'earthquake': def. use if the opponent used Dig
    return `
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
`;
  }

}
