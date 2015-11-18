import EliteFour from '../elitefour';

const meta = {
  battletype: 'anythinggoes'
};

export default class Diantha extends EliteFour {
  constructor() {
    super(meta);
  }

  getTeam() {
    return `
Abomasnow
- Blizzard
- Wood Hammer
- Ice Shard
- Earthquake

Beartic
- Icicle Crash
- Slash
- Shadow Claw
- Brick Break

Froslass
- Draining Kiss
- Blizzard
- Hail
- Shadow Ball

Vanilluxe
- Ice Beam
- Mirror Coat
- Freeze-Dry
- Signal Beam

Walrein
- Surf
- Body Slam
- Blizzard
- Sheer Cold

Glalie @ Glalitite
- Protect
- Ice Shard
- Hail
- Freeze-Dry
`;
  }

}
