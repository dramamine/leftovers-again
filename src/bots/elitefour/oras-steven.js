const EliteFour = require('./elitefour');

module.exports = class Steven extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}

const meta = {
  format: 'ou',
  accepts: 'ALL',
  nickname: 'la-oras-steeven',
  team: `
Skarmory
Ability: Sturdy
- Toxic
- Aerial Ace
- Spikes
- Steel Wing

Claydol
Ability: Levitate
- Reflect
- Light Screen
- Extrasensory
- Earth Power

Carbink
Ability: Clear Body
- Moonblast
- Power Gem
- Psychic
- Earth Power

Aerodactyl
Ability: Rock Head
- Rock Slide
- Ice Fang
- Thunder Fang
- Fire Fang

Aggron
Ability: Sturdy
- Stone Edge
- Earthquake
- Iron Tail
- Dragon Claw

Metagross @ Metagrossite
Ability: Clear Body
- Bullet Punch
- Zen Headbutt
- Meteor Mash
- Giga Impact
`
};
