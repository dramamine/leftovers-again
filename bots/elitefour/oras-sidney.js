import EliteFour from './elitefour';

export default class Sidney extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}
const meta = {
  battletype: 'anythinggoes',
  accepts: 'ALL',
  format: 'anythinggoes',
  team: `
Scrafty
- Crunch
- Brick Break
- Poison Jab
- Dragon Claw

Shiftry
- Fake Out
- Feint Attack
- Extrasensory
- Leaf Blade

Sharpedo
- Crunch
- Poison Fang
- Aqua Jet
- Slash Night

Zoroark
- Slash
- Shadow Claw
- Dark Pulse
- Flamethrower

Mandibuzz
- Brave Bird
- Bone Rush
- Feint Attack
- Tailwind

Absol @ Absolite
- Aerial Ace
- Night Slash
- Psycho Cut
- Slash
`
};
