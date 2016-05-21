'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Malva extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}

exports.default = Malva;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Malva x',
  team: `
Pyroar
Ability: Rivalry
- Hyper Voice
- Noble Roar
- Flamethrower
- Wild Charge

Torkoal
Ability: White Smoke
- Curse
- Flame Wheel
- Stone Edge
- Earthquake

Chandelure
Ability: Flame Body
- Flamethrower
- Confuse Ray
- Confide
- Shadow Ball

Talonflame
Ability: Flame Body
- Quick Attack
- Brave Bird
- Flare Blitz
- Flail
`
};