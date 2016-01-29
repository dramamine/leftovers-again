import EliteFour from './elitefour';

export default class Steven extends EliteFour {
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
Skarmory
- Toxic
- Aerial Ace
- Spikes
- Steel Wing

Claydol
- Reflect
- Light Screen
- Extrasensory
- Earth Power

Carbink
- Moonblast
- Power Gem
- Psychic
- Earth Power

Aerodactyl
- Rock Slide
- Ice Fang
- Thunder Fang
- Fire Fang

Aggron
- Stone Edge
- Earthquake
- Iron Tail
- Dragon Claw

Metagross @ Metagrossite
- Bullet Punch
- Zen Headbutt
- Meteor Mash
- Giga Impact
`
};
