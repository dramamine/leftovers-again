const EliteFour = require('./elitefour');

module.exports = class Siebold extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'ou',
  accepts: 'ALL',
  nickname: 'la-xy-siebold',
  team: `
Clawitzer
Ability: Mega Launcher
- Dragon Pulse
- Water Pulse
- Aura Sphere
- Dark Pulse

Starmie
Ability: Illuminate
- Psychic
- Light Screen
- Surf
- Dazzling Gleam

Gyarados
Ability: Intimidate
- Waterfall
- Ice Fang
- Dragon Dance
- Earthquake

Barbaracle
Ability: Tough Claws
- Stone Edge
- Razor Shell
- Cross Chop
- X-Scissor
`
};
