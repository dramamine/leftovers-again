/**
 *
 *
 */

import EliteFour from '../elitefour';

const meta = {
  battletype: 'anythinggoes'
};

export default class Diantha extends EliteFour {
  constructor() {
    super(meta);
  }

  getTeam() {
    // NOTES:
    // 'curse' is weird, might want to check target's ghost-ness.
    // 'earthquake': def. use if the opponent used Dig
    return `
Hawlucha
Ability: Limber
- Poison Jab
- Flying Press
- Swords Dance
- X-Scissor

Tyrantrum
Ability: Strong Jaw
- Head Smash
- Dragon Claw
- Earthquake
- Crunch

Aurorus
Ability: Refrigerate
- Thunder
- Blizzard
- Reflect
- Light Screen

Gourgeist
Ability: PickUp
- Trick-or-Treat
- Phantom Force
- Seed Bomb
- Shadow Sneak

Goodra
Ability: Sap Sipper
- Focus Blast
- Dragon Pulse
- Fire Blast
- Muddy Water

Gardevoir @ Gardevoirite
Ability: Synchronize
- Thunderbolt
- Moonblast
- Psychic
- Shadow Ball
`;
  }

}
