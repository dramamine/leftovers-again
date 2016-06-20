'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _elitefour = require('./elitefour');

var _elitefour2 = _interopRequireDefault(_elitefour);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Glacia extends _elitefour2.default {
  constructor() {
    super();
    this.meta = meta;
  }
}

exports.default = Glacia;
const meta = {
  format: 'anythinggoes',
  accepts: 'ALL',
  nickname: 'EliteFour Glacia x',
  team: `
Abomasnow
Ability: Snow Warning
- Blizzard
- Wood Hammer
- Ice Shard
- Earthquake

Beartic
Ability: Snow Cloak
- Icicle Crash
- Slash
- Shadow Claw
- Brick Break

Froslass
Ability: Snow Cloak
- Draining Kiss
- Blizzard
- Hail
- Shadow Ball

Vanilluxe
Ability: Ice Body
- Ice Beam
- Mirror Coat
- Freeze-Dry
- Signal Beam

Walrein
Ability: Thick Fat
- Surf
- Body Slam
- Blizzard
- Sheer Cold

Glalie @ Glalitite
Ability: Inner Focus
- Protect
- Ice Shard
- Hail
- Freeze-Dry
`
};