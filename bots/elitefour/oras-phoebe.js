import EliteFour from './elitefour';

export default class Phoebe extends EliteFour {
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
Banette
- Shadow Ball
- Grudge
- Toxic
- Psychic

Mismagius
- Shadow Ball
- Power Gem
- Thunderbolt
- Pain Split

Drifblim
- Phantom Force
- Psychic
- Icy Wind
- Acrobatics

Chandelure
- Hex
- Flamethrower
- Energy Ball
- Dark Pulse

Dusknoir
- Hex
- Fire Punch
- Ice Punch
- Thunder Punch

Sableye @ Sablenite
- Shadow Claw
- Foul Play
- Power Gem
- Fake Out
`
};
