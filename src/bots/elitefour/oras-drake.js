import EliteFour from './elitefour';

export default class Drake extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'ubers',
  accepts: 'ALL',
  nickname: 'oras-drake',
  description: 'If you\'re reading this it\'s too late.',
  team: `
Altaria
Ability: Natural Cure
- Aerial Ace
- Cotton Guard
- Dragon Pulse
- Moonblast

Dragalge
Ability: Poison Point
- Dragon Pulse
- Hydro Pump
- Sludge Wave
- Thunderbolt

Kingdra
Ability: Swift Swim
- Dragon Pulse
- Surf
- Yawn
- Ice Beam

Flygon
Ability: Levitate
- Flamethrower
- Boomburst
- Dragon Pulse
- Screech

Haxorus
Ability: Rivalry
- Dragon Claw
- Earthquake
- X-Scissor
- Shadow Claw

Salamence @ Salamencite
Ability: Intimidate
- Dragon Rush
- Zen Headbutt
- Crunch
- Thunder Fang
`
};
