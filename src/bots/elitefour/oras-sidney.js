const EliteFour = require('./elitefour');

module.exports = class Sidney extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}
const meta = {
  format: 'uu',
  accepts: 'ALL',
  nickname: 'la-oras-sidney',
  team: `
Scrafty
Ability: Moxie
- Crunch
- Brick Break
- Poison Jab
- Dragon Claw

Shiftry
Ability: Chlorophyll
- Fake Out
- Feint Attack
- Extrasensory
- Leaf Blade

Sharpedo
Ability: Rough Skin
- Crunch
- Poison Fang
- Aqua Jet
- Night Slash

Zoroark
Ability: Illusion
- Night Slash
- Shadow Claw
- Dark Pulse
- Flamethrower

Mandibuzz
Ability: Big Pecks
- Brave Bird
- Bone Rush
- Feint Attack
- Tailwind

Absol @ Absolite
Ability: Pressure
- Aerial Ace
- Night Slash
- Psycho Cut
- Slash
`
};
