/**
 *
 *
 */

import EliteFour from '../elitefour';

const meta = {
  battletype: 'anythinggoes'
};

export default class Siebold extends EliteFour {
  constructor() {
    super(meta);
  }

  getTeam() {
    // NOTES:
    // 'curse' is weird, might want to check target's ghost-ness.
    // 'earthquake': def. use if the opponent used Dig
    return `
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
`;
  }

}
