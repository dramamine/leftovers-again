const EliteFour = require('./elitefour');

module.exports = class Drake extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'ubers',
  accepts: 'ALL',
  nickname: 'la-oras-drake',
  description: 'If you\'re reading this it\'s too late.',
  team: `
Altaria
Ability: Natural Cure
Serious Nature
- Aerial Ace
- Cotton Guard
- Dragon Pulse
- Moonblast

Dragalge
Ability: Poison Point
Serious Nature
- Dragon Pulse
- Hydro Pump
- Sludge Wave
- Thunderbolt

Kingdra
Ability: Swift Swim
Serious Nature
- Dragon Pulse
- Surf
- Yawn
- Ice Beam

Flygon
Ability: Levitate
Serious Nature
- Flamethrower
- Boomburst
- Dragon Pulse
- Screech

Haxorus
Ability: Rivalry
Serious Nature
- Dragon Claw
- Earthquake
- X-Scissor
- Shadow Claw

Salamence @ Salamencite
Ability: Intimidate
Serious Nature
- Dragon Rush
- Zen Headbutt
- Crunch
- Thunder Fang
`
};
