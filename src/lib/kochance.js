import typeChart from './typechart';
import Damage from './damage';
// import Gaussian from './gaussian';

class KO {
  /**
   * Predicts the number of turns it will take to KO a Pokemon, if we
   * continuously use the same move on said Pokemon.
   *
   * This uses current HP, not maximum HP as you usually see on the official
   * damage calculator.
   *
   * @param  {[number]} damage An array of possible damage amounts, from low
   * to high.
   * @param  {Pokemon} defender The targer Pokemon. Should have the following
   * properties:
   *   maxHP (required): the mon's maximum HP
   *   type1: the mon's primary type
   *   type2: the mon's secondary type
   *   item: the defender's item
   *   ability: the defender's ability
   *   toxicCounter: the number of times this mon has taken poison damage
   * @param  {string} field The field
   * @param  {number} hits The number of hits done by this move
   * @param  {booleam} isBadDreams True if the move is bad dreams(?)
   *
   * @return {object} An object with the following properties:
   * turns: the number of turns it will take to possibly KO the opponent
   * chance: the chance the opponent will be KO'ed after that many turns, as
   * a percentage (1-100)
   */
  static predictKO(damage, defender, field = '', hits = 1, isBadDreams = false) {
    if (isNaN(damage[0])) {
      return {
        turns: null,
        chance: null
      };
    }
    if (damage[damage.length - 1] === 0) {
      return {
        turns: null,
        chance: null
      };
    }

    if(!defender.hp || !defender.maxhp) {
      defender = Damage.assumeStats(defender);
    }

    if (damage[0] >= defender.hp) {
      return {
        turns: 1,
        chance: 100
      };
    }

    let hazards = 0;
    if (field.isSR && defender.ability !== 'Magic Guard') {
      const effectiveness = typeChart.Rock[defender.type1] * (defender.type2 ? typeChart.Rock[defender.type2] : 1);
      hazards += Math.floor(effectiveness * defender.maxhp / 8);
    }
    if ([defender.type1, defender.type2].indexOf('Flying') === -1 &&
      ['Magic Guard', 'Levitate'].indexOf(defender.ability) === -1 &&
      defender.item !== 'Air Balloon') {
      if (field.spikes === 1) {
        hazards += Math.floor(defender.maxhp / 8);
      } else if (field.spikes === 2) {
        hazards += Math.floor(defender.maxhp / 6);
      } else if (field.spikes === 3) {
        hazards += Math.floor(defender.maxhp / 4);
      }
    }
    if (isNaN(hazards)) {
      hazards = 0;
    }

    let eot = 0;
    if (field.weather === 'Sun') {
      if (defender.ability === 'Dry Skin' || defender.ability === 'Solar Power') {
        eot -= Math.floor(defender.maxhp / 8);
      }
    } else if (field.weather === 'Rain') {
      if (defender.ability === 'Dry Skin') {
        eot += Math.floor(defender.maxhp / 8);
      } else if (defender.ability === 'Rain Dish') {
        eot += Math.floor(defender.maxhp / 16);
      }
    } else if (field.weather === 'Sand') {
      if (['Rock', 'Ground', 'Steel'].indexOf(defender.type1) === -1 &&
            ['Rock', 'Ground', 'Steel'].indexOf(defender.type2) === -1 &&
            ['Magic Guard', 'Overcoat', 'Sand Force', 'Sand Rush', 'Sand Veil'].indexOf(defender.ability) === -1 &&
            defender.item !== 'Safety Goggles') {
        eot -= Math.floor(defender.maxhp / 16);
      }
    } else if (field.weather === 'Hail') {
      if (defender.ability === 'Ice Body') {
        eot += Math.floor(defender.maxhp / 16);
      } else if (defender.type1 !== 'Ice' && defender.type2 !== 'Ice' &&
            ['Magic Guard', 'Overcoat', 'Snow Cloak'].indexOf(defender.ability) === -1 &&
            defender.item !== 'Safety Goggles') {
        eot -= Math.floor(defender.maxhp / 16);
      }
    }
    if (defender.item === 'Leftovers') {
      eot += Math.floor(defender.maxhp / 16);
    } else if (defender.item === 'Black Sludge') {
      if (defender.type1 === 'Poison' || defender.type2 === 'Poison') {
        eot += Math.floor(defender.maxhp / 16);
      } else if (defender.ability !== 'Magic Guard' && defender.ability !== 'Klutz') {
        eot -= Math.floor(defender.maxhp / 8);
      }
    }
    if (field.terrain === 'Grassy') {
      if (field.isGravity || (defender.type1 !== 'Flying' && defender.type2 !== 'Flying' &&
          defender.item !== 'Air Balloon' && defender.ability !== 'Levitate')) {
        eot += Math.floor(defender.maxhp / 16);
      }
    }
    let toxicCounter = 0;
    if (defender.status === 'Poisoned') {
      if (defender.ability === 'Poison Heal') {
        eot += Math.floor(defender.maxhp / 8);
      } else if (defender.ability !== 'Magic Guard') {
        eot -= Math.floor(defender.maxhp / 8);
      }
    } else if (defender.status === 'Badly Poisoned') {
      if (defender.ability === 'Poison Heal') {
        eot += Math.floor(defender.maxhp / 8);
      } else if (defender.ability !== 'Magic Guard' && defender.toxicCounter) {
        toxicCounter = defender.toxicCounter;
      }
    } else if (defender.status === 'Burned') {
      if (defender.ability === 'Heatproof') {
        eot -= Math.floor(defender.maxhp / 16);
      } else if (defender.ability !== 'Magic Guard') {
        eot -= Math.floor(defender.maxhp / 8);
      }
    } else if (defender.status === 'Asleep' && isBadDreams && defender.ability !== 'Magic Guard') {
      eot -= Math.floor(defender.maxhp / 8);
    }

    // multi-hit moves have too many possibilities for brute-forcing to work,
    // so reduce it to an approximate distribution
    if (hits > 1) {
      // this WAS squashMultihit, but let's just approximate hard
      damage = damage.map( dmg => dmg * hits ); // eslint-disable-line
    }

    for (let i = 1; i <= 5; i++) {
      // console.log('using hits counter ' + i);
      const c = KO._getKOChance(damage, defender.hp - hazards, eot, i, defender.maxhp, toxicCounter);
      if (c > 0 && c <= 1) {
        return {
          turns: i,
          chance: Math.round(c * 1000) / 10
        };
      }
    }

    return {
      turns: null,
      chance: null
    };
  }

  // static _simpleGetKOChance(damage, hp, eot, hits, maxHP, toxicCounter) {

  //   // find index of the smallest amount of damage that will consistently kill.
  //   // idx is set to damage.length because that will mean chance = 0 and the
  //   // while loop won't get hit.
  //   // let idx = damage.length;
  //   // let i = damage.length - 1;
  //   // while ( (damage[i] + eot) * hits >= hp) {
  //   //   idx = i;
  //   //   i--;
  //   // }
  //   // console.log(idx, damage, hits, hp);
  //   const dmgTarget = hp - (eot * hits);
  //   // confirm it's in the range
  //   if (dmgTarget <= damage[0] * hits) {
  //     return 1;
  //   }
  //   if (dmgTarget >= damage[damage.length - 1] * hits) {
  //     return 0;
  //   }

  //   // say we have damage arrays like this:
  //   // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  //   // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  //   // and the opponent has 10 hp.
  //   // idx = 4
  //   // The formula for doing 10 dmg is not simply (3/4)*(3/4), since that
  //   // ignores combinations such as (7+1) and (3+9). so we need to look at the
  //   // distributions of sums.
  //   // There are 16^2 possibilities. The sums and the # of possibilities are
  //   // as such: {2: 1, 3: 2, 4: 3, ..., 16: 15, 17: 16, 18: 15, ... 31: 2, 32: 1}
  //   if (hits === 1) {
  //     let idx = damage.length;
  //     let i = damage.length - 1;
  //     while ( damage[i] * hits >= dmgTarget) {
  //       idx = i;
  //       i--;
  //     }
  //     return (damage.length - idx) / damage.length;
  //   }

  //   // for now
  //   // return 0.5;

  //   const dmgMin = damage[0] * hits;
  //   const dmgMax = damage[damage.length - 1] * hits;
  //   // ex. if we need to do 10 dmg, (10 - 2) / (32 - 2) = 8/30 = .26666
  //   const dmgPct = (dmgTarget - dmgMin) / (dmgMax - dmgMin);
  //   console.log('calculations:', dmgMin, dmgMax, dmgTarget, dmgPct);
  //   return this._normalize(dmgPct);

  //   // find the chance that 'idx' or greater will occur
  //   // const chance = (damage.length - idx) / damage.length;
  //   // console.log('returning result ' + Math.pow(chance, hits) + 'from chance ' + chance);
  //   // return Math.pow(chance, hits);
  // }

  // static _normalize(dmgPct) {
  //   // const mean = min + (max - min) / 2;
  //   // let variance = 5.8333;
  //   // switch (hits) {
  //   // case 2:
  //   //   variance = 5.8333;
  //   // }
  //   // console.log(mean, variance, target);
  //   // const distribution = new Gaussian(mean, variance);
  //   // return distribution.cdf(target);
  //   //
  //   const distribution = new Gaussian(0.5, 0.05);
  //   return distribution.cdf(dmgPct);
  // }


  static _getKOChance(damage, hp, eot, hits, maxHP, toxicCounter) {
    // console.log('_getKOChance:', damage, hp, eot, hits, maxHP, toxicCounter);
    if ( isNaN(hp) || hp < 0 || isNaN(hits) || hits < 0 || isNaN(maxHP) || maxHP < 0) {
      console.error('bailing out!', damage.length, hp, eot, hits, maxHP, toxicCounter);
      return 0;
    }
    // console.log('_getKOChance called.', damage.length, hp, eot, hits, maxHP, toxicCounter);
    const n = damage.length;
    const minDamage = damage[0];
    const maxDamage = damage[damage.length - 1];
    let i;
    if (hits === 1) {
      if (maxDamage < hp) {
        return 0;
      }
      for (i = 0; i < n; i++) {
        if (damage[i] >= hp) {
          return (n - i) / n;
        }
      }
    }
    if (KO._predictTotal(maxDamage, eot, hits, toxicCounter, maxHP) < hp) {
      return 0;
    } else if (KO._predictTotal(minDamage, eot, hits, toxicCounter, maxHP) >= hp) {
      return 1;
    }

    let toxicDamage = 0;
    if (toxicCounter > 0) {
      toxicDamage = Math.floor(toxicCounter * maxHP / 16);
      toxicCounter++; // eslint-disable-line
    }
    let sum = 0;
    for (i = 0; i < n; i++) {

      const c = KO._getKOChance(damage, hp - damage[i] + eot - toxicDamage, eot,
        hits - 1, maxHP, toxicCounter);
      if (c === 1) {
        sum += (n - i);
        break;
      } else {
        sum += c;
      }
    }
    // console.log('returning ', sum / n);
    return sum / n;
  }

  static _predictTotal(damage, eot, hits, toxicCounter, maxHP) {
    let toxicDamage = 0;
    if (toxicCounter > 0) {
      for (let i = 0; i < hits - 1; i++) {
        toxicDamage += Math.floor((toxicCounter + i) * maxHP / 16);
      }
    }
    return (damage * hits) - (eot * (hits - 1)) + toxicDamage;
  }
}
export default KO;
