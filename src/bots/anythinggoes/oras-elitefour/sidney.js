import EliteFour from '../elitefour';

const meta = {
  battletype: 'anythinggoes'
};

export default class Sidney extends EliteFour {
  constructor() {
    super(meta);
  }

  getTeam() {
    // NOTES:
    // 'curse' is weird, might want to check target's ghost-ness.
    // 'earthquake': def. use if the opponent used Dig
    return `
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
`;
  }
}
