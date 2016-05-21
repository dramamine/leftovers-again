'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Steven extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}

exports.default = Steven;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Steven x',
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