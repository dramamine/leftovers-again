const EliteFour = require('./elitefour');

module.exports = class Olivia extends EliteFour {
  constructor() {
    super();
    this.meta = {
      format: 'gen7pokebankru',
      accepts: 'ALL',
      nickname: 'la-sm-olivia',
      team: `
Relicanth
Ability: Swift Swim
- Head Smash
- Waterfall
- Yawn
- Earthquake

Carbink
Ability: Clear Body
- Power Gem
- Moonblast
- Reflect
- Stealth Rock

Golem
Ability: Rock Head
- Thunder Punch
- Stone Edge
- Earthquake
- Heavy Slam

Probopass
Ability: Sturdy
- Earth Power
- Power Gem
- Dazzling Gleam
- Flash Cannon

Lycanroc @ Rockium Z
Ability: Keen Eye
- Crunch
- Stone Edge
- Brick Break
- Rock Climb
`
    };
  }
}
