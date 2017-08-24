const EliteFour = require('./elitefour');

module.exports = class Phoebe extends EliteFour {
  constructor() {
    super();
    this.meta = meta;
  }
}
const meta = {
  format: 'ou',
  accepts: 'ALL',
  nickname: 'la-oras-phoebe',
  team: `
Banette
Ability: Frisk
- Shadow Ball
- Grudge
- Toxic
- Psychic

Mismagius
Ability: Levitate
- Shadow Ball
- Power Gem
- Thunderbolt
- Pain Split

Drifblim
Ability: Aftermath
- Phantom Force
- Psychic
- Icy Wind
- Acrobatics

Chandelure
Ability: Flame Body
- Hex
- Flamethrower
- Energy Ball
- Dark Pulse

Dusknoir
Ability: Pressure
- Hex
- Fire Punch
- Ice Punch
- Thunder Punch

Sableye @ Sablenite
Ability: Keen Eye
- Shadow Claw
- Foul Play
- Power Gem
- Fake Out
`
};
