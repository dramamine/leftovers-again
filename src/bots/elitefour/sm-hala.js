const EliteFour = require('./elitefour');

module.exports = class Hala extends EliteFour {
  constructor() {
    super();
    this.meta = {
      format: 'gen7pokebankuu',
      accepts: 'ALL',
      nickname: 'la-sm-hala',
      team: `
Hariyama
Ability: Thick Fat
- Fake Out
- Close Combat
- Knock Off
- Heavy Slam

Primeape
Ability: Vital Spirit
- Cross Chop
- Rock Slide
- Punishment
- Stomping Tantrum

Bewear
Ability: Fluffy
- Hammer Arm
- Brutal Swing
- Dragon Claw
- Shadow Claw

Poliwrath
Ability: Water Absorb
- Waterfall
- Brick Break
- Poison Jab
- Payback

Crabominable @ Fightinium Z
Ability: Hyper Cutter
- Ice Hammer
- Close Combat
- Stone Edge
- Earthquake
`
    };
  }
}
