import EliteFour from '../elitefour';

const meta = {
  battletype: 'anythinggoes'
};

export default class Steven extends EliteFour {
  constructor() {
    super(meta);
  }

  getTeam() {
    return `
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
`;
  }

}
