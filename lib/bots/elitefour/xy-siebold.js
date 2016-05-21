'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Siebold extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}

exports.default = Siebold;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Sieboldx',
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