'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Diantha extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}

exports.default = Diantha;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Diantha',
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