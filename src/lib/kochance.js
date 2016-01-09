import typeChart from './typechart';
import Damage from './damage';

class KO {
  /**
   * Predicts the number of turns it will take to KO a Pokemon, if we
   * continuously use the same move on said Pokemon.
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

    if (!defender.maxhp || defender.maxhp === defender.hppct) {
      //  HP = ((Base * 2 + IV + EV/4) * Level / 100) + Level + 10
      const evBonus = Math.floor(252 / 4);
      const addThis = defender.level + 10;
      defender.maxHP = (defender.baseStats.hp * 2 + 31 + evBonus) *
        (defender.level / 100) + addThis;
    } else {
      defender.maxHP = defender.maxhp;
    }

    if (damage[0] >= defender.maxHP) {
      return {
        turns: 1,
        chance: 100
      };
    }

    let hazards = 0;
    if (field.isSR && defender.ability !== 'Magic Guard') {
      const effectiveness = typeChart.Rock[defender.type1] * (defender.type2 ? typeChart.Rock[defender.type2] : 1);
      hazards += Math.floor(effectiveness * defender.maxHP / 8);
    }
    if ([defender.type1, defender.type2].indexOf('Flying') === -1 &&
      ['Magic Guard', 'Levitate'].indexOf(defender.ability) === -1 &&
      defender.item !== 'Air Balloon') {
      if (field.spikes === 1) {
        hazards += Math.floor(defender.maxHP / 8);
      } else if (field.spikes === 2) {
        hazards += Math.floor(defender.maxHP / 6);
      } else if (field.spikes === 3) {
        hazards += Math.floor(defender.maxHP / 4);
      }
    }
    if (isNaN(hazards)) {
      hazards = 0;
    }

    let eot = 0;
    if (field.weather === 'Sun') {
      if (defender.ability === 'Dry Skin' || defender.ability === 'Solar Power') {
        eot -= Math.floor(defender.maxHP / 8);
      }
    } else if (field.weather === 'Rain') {
      if (defender.ability === 'Dry Skin') {
        eot += Math.floor(defender.maxHP / 8);
      } else if (defender.ability === 'Rain Dish') {
        eot += Math.floor(defender.maxHP / 16);
      }
    } else if (field.weather === 'Sand') {
      if (['Rock', 'Ground', 'Steel'].indexOf(defender.type1) === -1 &&
            ['Rock', 'Ground', 'Steel'].indexOf(defender.type2) === -1 &&
            ['Magic Guard', 'Overcoat', 'Sand Force', 'Sand Rush', 'Sand Veil'].indexOf(defender.ability) === -1 &&
            defender.item !== 'Safety Goggles') {
        eot -= Math.floor(defender.maxHP / 16);
      }
    } else if (field.weather === 'Hail') {
      if (defender.ability === 'Ice Body') {
        eot += Math.floor(defender.maxHP / 16);
      } else if (defender.type1 !== 'Ice' && defender.type2 !== 'Ice' &&
            ['Magic Guard', 'Overcoat', 'Snow Cloak'].indexOf(defender.ability) === -1 &&
            defender.item !== 'Safety Goggles') {
        eot -= Math.floor(defender.maxHP / 16);
      }
    }
    if (defender.item === 'Leftovers') {
      eot += Math.floor(defender.maxHP / 16);
    } else if (defender.item === 'Black Sludge') {
      if (defender.type1 === 'Poison' || defender.type2 === 'Poison') {
        eot += Math.floor(defender.maxHP / 16);
      } else if (defender.ability !== 'Magic Guard' && defender.ability !== 'Klutz') {
        eot -= Math.floor(defender.maxHP / 8);
      }
    }
    if (field.terrain === 'Grassy') {
      if (field.isGravity || (defender.type1 !== 'Flying' && defender.type2 !== 'Flying' &&
          defender.item !== 'Air Balloon' && defender.ability !== 'Levitate')) {
        eot += Math.floor(defender.maxHP / 16);
      }
    }
    let toxicCounter = 0;
    if (defender.status === 'Poisoned') {
      if (defender.ability === 'Poison Heal') {
        eot += Math.floor(defender.maxHP / 8);
      } else if (defender.ability !== 'Magic Guard') {
        eot -= Math.floor(defender.maxHP / 8);
      }
    } else if (defender.status === 'Badly Poisoned') {
      if (defender.ability === 'Poison Heal') {
        eot += Math.floor(defender.maxHP / 8);
      } else if (defender.ability !== 'Magic Guard' && defender.toxicCounter) {
        toxicCounter = defender.toxicCounter;
      }
    } else if (defender.status === 'Burned') {
      if (defender.ability === 'Heatproof') {
        eot -= Math.floor(defender.maxHP / 16);
      } else if (defender.ability !== 'Magic Guard') {
        eot -= Math.floor(defender.maxHP / 8);
      }
    } else if (defender.status === 'Asleep' && isBadDreams && defender.ability !== 'Magic Guard') {
      eot -= Math.floor(defender.maxHP / 8);
    }

    // multi-hit moves have too many possibilities for brute-forcing to work,
    // so reduce it to an approximate distribution
    if (hits > 1) {
      // this WAS squashMultihit, but let's just approximate hard
      damage = damage.map( dmg => dmg * hits ); // eslint-disable-line
    }

    for (let i = 1; i <= 9; i++) {
      const c = KO._getKOChance(damage, defender.maxHP - hazards, eot, i, defender.maxHP, toxicCounter);
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

  static _getKOChance(damage, hp, eot, hits, maxHP, toxicCounter) {
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
