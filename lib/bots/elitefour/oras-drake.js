'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Drake extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}

exports.default = Drake;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Drake x',
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