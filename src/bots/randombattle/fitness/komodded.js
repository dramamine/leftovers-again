// import typeChart from './typechart';
// import Damage from './damage';
import KO from '../../../lib/kochance';
import Gaussian from '../../../lib/gaussian';

import distributions from './probability-distributions';

class KOModded extends KO {
  static _simpleGetKOChance(damage, hits, hp, eot = 0, maxHP = 400,
    toxicCounter = 0, isNatureKnown = false) {
    //
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
    console.log('calculations:', damage, hp, dmgTarget, dmgPct);
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
    console.log('_softCritCalc debug:', dmgPctWithCrit, hitsWithinRange, critChance);
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
