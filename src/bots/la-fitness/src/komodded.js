import Gaussian from './gaussian';
import Damage from 'lib/damage';
import Typechart from 'lib/typechart';

import distributions from './probability-distributions';

class KOModded {
  static predictKO(damage, defender, field = '', hits = 1, isBadDreams = false) {
    if (isNaN(damage)) {
      return {
        turns: null,
        chance: null
      };
    }
    if (!defender.hp || !defender.maxhp) {
      defender = Damage.assumeStats(defender); // eslint-disable-line
    }

    if (!defender.ability) defender.ability = '';
    // console.log('predictKO trace:', damage, defender);

    let hazards = 0;
    if (field.isSR && defender.ability !== 'Magic Guard') {
      const effectiveness = Typechart.compare('Rock', defender.types);
      hazards += Math.floor(effectiveness * defender.maxhp / 8);
    }
    if (defender.types.indexOf('Flying') === -1 &&
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
      if (['Rock', 'Ground', 'Steel'].indexOf(defender.types[0]) === -1 &&
            ['Rock', 'Ground', 'Steel'].indexOf(defender.types[1] || null) === -1 &&
            ['Magic Guard', 'Overcoat', 'Sand Force', 'Sand Rush', 'Sand Veil'].indexOf(defender.ability) === -1 &&
            defender.item !== 'Safety Goggles') {
        eot -= Math.floor(defender.maxhp / 16);
      }
    } else if (field.weather === 'Hail') {
      if (defender.ability === 'Ice Body') {
        eot += Math.floor(defender.maxhp / 16);
      } else if (defender.types.indexOf('Ice') === -1 &&
            ['Magic Guard', 'Overcoat', 'Snow Cloak'].indexOf(defender.ability) === -1 &&
            defender.item !== 'Safety Goggles') {
        eot -= Math.floor(defender.maxhp / 16);
      }
    }
    if (defender.item === 'Leftovers') {
      eot += Math.floor(defender.maxhp / 16);
    } else if (defender.item === 'Black Sludge') {
      if (defender.types.indexOf('Poison') >= 0) {
        eot += Math.floor(defender.maxhp / 16);
      } else if (defender.ability !== 'Magic Guard' && defender.ability !== 'Klutz') {
        eot -= Math.floor(defender.maxhp / 8);
      }
    }
    if (field.terrain === 'Grassy') {
      if (field.isGravity || (defender.types.indexOf('Flying') >= 0 &&
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

    for (let i = 1; i <= 9; i++) {
      const c = KOModded._getKOChance(damage, i, defender.hp - hazards, eot, defender.maxhp, toxicCounter);
      if (c > 0.05 && c <= 1) {
        return {
          turns: i,
          chance: c
        };
      }
    }
    return {
      turns: null,
      chance: null
    };
  }

  static _getKOChance(damage, hits, hp, eot = 0, maxHP = 400,
    toxicCounter = 0, isNatureKnown = false) {
    // console.log(damage, hits, hp, eot, maxHP, toxicCounter, isNatureKnown);

    const dmgTarget = hp - (eot * hits);
    // confirm it's in the range
    // if it's under bad nature * 85%
    if (dmgTarget <= damage * 0.702479339 * hits) {
      return 1;
    }
    if (dmgTarget >= damage * 1.21 * hits) {
      return 0;
    }

    // normalized: how many of this 100% max damage must we do to kill?
    const dmgPct = 100 * hp / damage;
    // console.log('calculations:', damage, hp, dmgTarget, dmgPct);
    const {mean, variance} = this._getDistribution(hits, isNatureKnown);
    return this._normalize(dmgPct, mean, variance);

    // find the chance that 'idx' or greater will occur
    // const chance = (damage.length - idx) / damage.length;
    // console.log('returning result ' + Math.pow(chance, hits) + 'from chance ' + chance);
    // return Math.pow(chance, hits);
  }

  static _getDistribution(hits, isNatureKnown) {
    return distributions.find(distro => distro.hits === hits
      && !!distro.nature === isNatureKnown
      && !distro.crits);
  }

  static _softCritCalc(dmgPct, hits, mean, variance) {
    const distribution = new Gaussian(mean, variance);
    // ex. if dmgPct = 100, we can do 66
    //     if dmgPct = 150, we can do 100
    // but for hits = 2...
    //     if dmgPct = 200, we can do ~160
    //     ex. 80 normal, 80->120 crit
    //     ex. 85 normal, 75->112 crit, wouldn't work but 75% is unlikely.
    // for hits = 3
    //     if dmgPct = 300, we can do 8/9*300 = 266
    //     and the chance of at least one crit is 1 - (1 - .0625)^3

    // this is the dmgPct target if we know we are going to get at least 1 crit
    const dmgPctWithCrit = dmgPct * (hits * 3 - 1) / (hits * 3);

    // this is the percent of hits that fall within the range where getting
    // at least 1 crit would be the marginal difference btwn killing and not.
    const hitsWithinRange = distribution.cdf(dmgPct) - distribution.cdf(dmgPctWithCrit);

    // percent chance of getting at least one crit
    const critChance = 1 - Math.pow(15 / 16, hits);
    // console.log('_softCritCalc debug:', dmgPctWithCrit, hitsWithinRange, critChance);
    return hitsWithinRange * critChance;
  }

  static _normalize(dmgPct, mean, variance) {
    // const mean = min + (max - min) / 2;
    // let variance = 5.8333;
    // switch (hits) {
    // case 2:
    //   variance = 5.8333;
    // }
    // console.log(mean, variance, target);
    // const distribution = new Gaussian(mean, variance);
    // return distribution.cdf(target);
    //
    const distribution = new Gaussian(mean, variance);
    return 1 - distribution.cdf(dmgPct);
  }
}
export default KOModded;
