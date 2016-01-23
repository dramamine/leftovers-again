// import typeChart from './typechart';
// import Damage from './damage';
import KO from '../../../lib/kochance';
// import Gaussian from './gaussian';

import distributions from './probability-distributions';

class KOModded extends KO {
  static _simpleGetKOChance(damage, hp, eot, hits, maxHP, toxicCounter,
    isNatureKnown = false) {
    //
    const dmgTarget = hp - (eot * hits);
    // confirm it's in the range
    if (dmgTarget <= damage * 0.82 * hits) {
      return 1;
    }
    if (dmgTarget >= damage * 1.21 * hits) {
      return 0;
    }

    // normalized: how many of this 100% max damage must we do to kill?
    const dmgPct = 100 * hp / dmgTarget;
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

  static _normalize(dmgPct) {
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
    const distribution = new Gaussian(0.5, 0.05);
    return distribution.cdf(dmgPct);
  }
}
export default KOModded;
