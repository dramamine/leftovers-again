/**
 *
 *
 */

const AI = require('@la/ai');
const Typechart = require('@la/game/typechart');

const { MOVE, SWITCH } = require('@la/decisions');

/**
 * This is used in calculating randomness. If the exponent is 1, you'll end
 * up using flat weight numbers; at higher exponents you will more often favor
 * the moves that you decided you're more likely to use. Ex. if we have a super
 * effective move, we want the chance that we'll use it to be REALLY high.
 *
 */
const randomnessExponent = 2;

const weights = {
  effectiveness: {
    weight: 10,
    // check typechart for all possibilities
    value: (val) => {
      return {
        0: 0,
        0.5: 1,
        1: 2,
        2: 10,
        4: 20
      }[val];
    }
  },
  // boolean
  stabby: {
    weight: 10,
  },
  // this # is the chance that the effect will happen (ex. 10% or 100%)
  status: {
    weight: 10,
  },
  unboost: {
    weight: 10,
  },
  prioritykill: {
    weight: 15,
  },
  recoil: {
    weight: -5
  },
  // for whatever random stuff we wanna throw in here.
  bonus: {
    weight: 1
  }

};

module.exports = class EliteFour extends AI {
  constructor(meta) {
    super(meta);

    this.lastMove = null;
    this.weights = weights;
    this.randomnessExponent = randomnessExponent;
  }

  decide(state) {
    if (state.forceSwitch) {
      // our pokemon died :(
      // choose a random one
      const possibleMons = state.self.reserve.filter((mon) => {
        if (mon.condition === '0 fnt') return false;
        if (mon.active) return false;
        return true;
      });
      const myMon = this.pickOne(possibleMons);
      return new SWITCH(myMon);
    }

    if (state.teamPreview) {
      // always pick the first mon
      return new SWITCH(0);
    }

    const fitness = {};
    const totalFitness = {};
    state.self.active.moves.forEach((move) => {
      if (move.disabled) return;
      fitness[move.id] = {};

      // favor super-effective moves, disfavor ineffective / weak moves
      fitness[move.id].effectiveness = Typechart.compare(move.type,
        state.opponent.active.types);

      fitness[move.id].stabby = !!state.self.active.types.indexOf(move.type);

      // favor unboosting moves on non-unboosted opponents,
      // as long as we didn't just try this move.
      if (move.category === 'Status' && move.id !== this.lastMove &&
      move.boosts) {
        ['atk', 'spa', 'spd', 'spe', 'def'].forEach((type) => {
          if (!move.boosts[type]) return;

          if (state.opponent.active.boosts && state.opponent.active.boosts[type] &&
          state.opponent.active.boosts[type] < 0) return;

          // OK, we're in the clear here.
          fitness[move.id].unboost = true;
        });
      }

      // favor status moves on non-statused opponents,
      // as long as we didn't just try this move.
      if (move.secondary && move.id !== this.lastMove) {
        if (!state.opponent.active.conditions ||
          !state.opponent.active.conditions.indexOf(move.secondary.status) >= 0) {
          fitness[move.id].status = move.secondary.chance;
        }
      }
      // @TODO check volatileStatus for moves like Confuse Ray

      // priority moves
      if (move.priority > 0 && state.opponent.active.hp < 25) {
        fitness[move.id].prioritykill = true;
      }

      // unfavor moves that leave me dead
      // @TODO I don't like that hppct and active opponent's hp are both percent fields
      if (move.recoil && state.self.active.hppct < 33) {
        fitness[move.id].recoil = true;
      }

      if (move.id === 'flail' && state.self.active.hppct < 33) {
        fitness[move.id].bonus = 20;
      }

      totalFitness[move.id] = this.sumFitness(fitness[move.id]);
    });

    // pick a move from total fitness
    const myMove = this.pickMoveByFitness(totalFitness);
    return new MOVE(myMove);
  }

  sumFitness(obj) {
    let sum = 0;
    for (const key in obj) {
      if (weights[key]) {
        // run the value function if it exists;
        // else, convert the value to a number and use that.
        const value = weights[key].value
          ? weights[key].value(obj[key])
          : +obj[key];

        sum = sum + weights[key].weight * value;
      }
    }
    return sum;
  }

  pickMoveByFitness(moveArr) {
    let total = 0;
    const weighted = {};
    for (const move in moveArr) {
      if ({}.hasOwnProperty.call(moveArr, move)) {
        weighted[move] = moveArr[move] >= 0
          ? Math.pow(moveArr[move], randomnessExponent)
          : 0;
        total += weighted[move];
      }
    }
    const myVal = Math.random() * total;
    let accum = 0;
    for (const move in weighted) {
      if ({}.hasOwnProperty.call(weighted, move)) {
        accum += weighted[move];
        if (accum > myVal) return move;
      }
    }
    // something went wrong
    return false;
  }

  // random
  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
