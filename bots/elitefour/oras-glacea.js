import EliteFour from './elitefour';

export default class Glacea extends EliteFour {
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
`
};
