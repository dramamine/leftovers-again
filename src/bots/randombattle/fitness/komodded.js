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
