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
Altaria
- Aerial Ace
- Cotton Guard
- Dragon Pulse
- Moonblast

Dragalge
- Dragon Pulse
- Hydro Pump
- Sludge Wave
- Thunderbolt

Kingdra
- Dragon Pulse
- Surf
- Yawn
- Ice Beam

Flygon
- Flamethrower
- Boomburst
- Dragon Pulse
- Screech

Haxorus
- Dragon Claw
- Earthquake
- X-Scissor
- Shadow Claw

Salamence @ Salamencite
- Dragon Rush
- Zen Headbutt
- Crunch
- Thunder Fang
`;
  }

}
