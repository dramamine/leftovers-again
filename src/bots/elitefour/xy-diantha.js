const EliteFour = require('./elitefour');

module.exports = class Diantha extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'ou',
  accepts: 'ALL',
  nickname: 'la-xy-diantha',
  team: `
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
`
};
