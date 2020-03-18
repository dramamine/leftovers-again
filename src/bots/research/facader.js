/**
 * Try casting 'Facade' to test out our damage calculator.
 * Against the 'Rooster' Talonflame, we should do this amt of damage:
 * Facade: 70 Normal
 * (84, 85, 87, 87, 88, 90, 90, 91, 93, 93, 94, 96, 96, 97, 99, 100)
 *
 * If you feel like testing other moves:
 *
 * Covet: 60 Normal Physical
 * (73, 73, 75, 76, 76, 78, 78, 79, 79, 81, 82, 82, 84, 84, 85, 87)
 *
 * Aquatail: 90 Water Physical (2x strength)
 * (146, 146, 148, 150, 152, 154, 156, 158, 158, 160, 162, 164, 166, 168, 170, 172)
 *
 * Seed Bomb: 80 Grass Physical (4x weak)
 * (16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 19)
 *
 * npm run develop -- --bot=anythinggoes/tester/facader.js
 */

const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');
const Damage = require('@la/game/damage');
const Log = require('@la/log');

module.exports = class Facader extends AI {
  constructor() {
    super();
    this.meta = {
      accepts: 'anythinggoes',
      format: 'anythinggoes'
    };
    this.ctr = -1;
    this.hasLogged = false;
  }

  team() {
    return `
Cinccino
Ability: Skill Link
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Facade
- Slam
- Aqua Tail
- Seed Bomb

Cinccino
Ability: Skill Link
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Facade
- Slam
- Aqua Tail
- Seed Bomb

Cinccino
Ability: Skill Link
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Facade
- Slam
- Aqua Tail
- Seed Bomb

Cinccino
Ability: Skill Link
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Facade
- Slam
- Aqua Tail
- Seed Bomb

Cinccino
Ability: Skill Link
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Facade
- Slam
- Aqua Tail
- Seed Bomb

Cinccino
Ability: Skill Link
Level: 100
EVs: 84 HP / 84 Atk / 84 Def / 84 SpA / 84 SpD / 84 Spe
Serious Nature
- Facade
- Slam
- Aqua Tail
- Seed Bomb
`;
  }

  decide(state) {
    console.log(state);
    if (state.forceSwitch || !this.canFacade(state)) {
      this.ctr = this.ctr + 1;
      // will crash out when ctr >= 7;

      return new SWITCH(this.ctr);
    }
    if (!state.opponent.active || state.opponent.active.length === 0) {
      console.log('NO ACTIVE OPPONENT OH NO');
      return new MOVE('facade');
    }

    state.self.active.nature = 'serious';
    state.self.active.level = 100;
    state.opponent.active.nature = 'serious';
    state.opponent.active.level = 100;

    Damage.assumeStats(state.self.active);
    Damage.assumeStats(state.opponent.active);

    if (!this.hasLogged) {
      const est = Damage.getDamageResult(
        state.self.active,
        state.opponent.active,
        'facade'
      );
      Log.toFile('damagerangetest', '\n' + JSON.stringify(est) + '\n');
      this.hasLogged = true;
    }

    return new MOVE('facade');
  }

  canFacade(state) {
    if (!state.self.active) return false;
    if (!state.self.active.moves) return false;
    const facade = state.self.active.moves.find(move => move.id === 'facade');
    if (facade.pp === 0) return false;
    if (facade.disabled) return false;
    return true;
  }
}
