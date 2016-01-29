import typeChart from 'lib/typechart';
import util from 'pokeutil';

const AT = 'atk';
const DF = 'def';
const SA = 'spa';
const SD = 'spd';
const SP = 'spe';
const HP = 'hp';
const gen = 6;

const STATS = [AT, DF, SA, SD, SP, HP];

const ASSUME_LEVEL = 75;

const NATURES = {
  'adamant': [AT, SA],
  'bashful': [null, null],
  'bold': [DF, AT],
  'brave': [AT, SP],
  'calm': [SD, AT],
  'careful': [SD, SA],
  'docile': [null, null],
  'gentle': [SD, DF],
  'hardy': [null, null],
  'hasty': [SP, DF],
  'impish': [DF, SA],
  'jolly': [SP, SA],
  'lax': [DF, SD],
  'lonely': [AT, DF],
  'mild': [SA, DF],
  'modest': [SA, AT],
  'naive': [SP, SD],
  'naughty': [AT, SD],
  'quiet': [SA, SP],
  'quirky': [null, null],
  'rash': [SA, SD],
  'relaxed': [DF, SP],
  'sassy': [SD, SP],
  'serious': [null, null],
  'timid': [SP, AT]
};


// DO NOT WANT
function buildDescription() {
  return '';
}

class Damage {
  processPokemon(mon) {
    // console.log(mon);
    // just adding some stuff to see if we can get this workin'
    // mon.ability = mon.baseAbility;


    mon.weight = mon.weightkg;
    mon.type1 = '';
    mon.type2 = '';
    if (mon.types.length < 1 || mon.types.length > 2) {
      console.warn('weird type length', mon.types);
    }
    mon.type1 = mon.types[0];
    mon.type2 = (mon.types.length === 2)
      ? mon.types[1]
      : '';
    mon.nature = 'serious';

    mon.level = mon.level || ASSUME_LEVEL;
    // this is true...
    // mon.baseStats;
    this.makeAssumptions(mon);

    if (!mon.stats) {
      mon.stats = {};
    }
    [AT, SA, DF, SD, SP, HP].forEach( stat => {
      if (!mon.stats[stat]) {
        this._assumeStat(mon, stat);
      }
    });

    [AT, SA, DF, SD, SP].forEach( stat => {
      mon.stats[stat] = getModifiedStat(
        mon.stats[stat], mon.boosts[stat]);
    });
    return mon;
  }

  makeAssumptions(mon) {
    // mon.species = mon.species;
    mon.status = (mon.conditions)
      ? mon.conditions.join(' ') // string vs array
      : '';
    mon.ability = mon.ability || mon.abilities['0'];
    mon.item = '';
    mon.gender = 'M';

    mon.boosts = Object.assign({
      [AT]: 0,
      [DF]: 0,
      [SA]: 0,
      [SD]: 0,
      [SP]: 0
    }, mon.boosts);
  }

  processMove(move) {
    move.isCrit = false;
    move.bp = move.basePower;
    move.isPulse = move.name === 'Pulse';
    move.isBite = move.name === 'Bite';
    move.isSpread = move.name === 'Spread'; // ??
    move.hits = move.multihit || 1; // lol needs more tests
    move.ignoresDefenseBoosts = move.ignoreDefensive || false;
    move.makesContact = (move.flags && move.flags.contact) || false;
    move.hasSecondaryEffect = !!move.secondary;

    // isAerilate || isPixilate || isRefrigerate
    return move;
  }


  /**
   * Use the maximum value for a stat. This means we'll use 252 EVs and a
   * strong nature for that stat.
   *
   * @param  {Object} mon  The Pokemon object.
   * @param  {String/Enum} stat The stat we're assuming.
   *
   * @return {Object} The modified Pokemon object with mon.stats.{stat} defined.
   *
   * @see _assumeStat
   */
  _maximizeStat(mon, stat) {
    return this._assumeStat(mon, stat, 252, 1.1);
  }

  /**
   * Use the minimum value for a stat. This means we'll use 0 EVs and a weak
   * nature for that stat.
   *
   * @param  {Object} mon  The Pokemon object.
   * @param  {String/Enum} stat The stat we're assuming.
   *
   * @return {Object} The modified Pokemon object with mon.stats.{stat} defined.
   *
   * @see _assumeStat
   */
  _minimizeStat(mon, stat) {
    return this._assumeStat(mon, stat, 0, 0.9);
  }

  /**
   * Updates a certain stat if it isn't already set.

   * @param  {Object} mon The pokemon object. This is modified directly.
   * Expects the following properties:
   * level: {Number} The Pokemon's level
   * baseStats: {Object} The Pokemon's unmodified (pre-EV and IV) stats
   * stats: {Object} The Pokemon's modified stats.
   * nature: {String} (optional) The Pokemon's nature; use natureMultiplier if
   * this is undefined.
   * @param  {Enum/String} stat The stat to maybe update.
   * @param  {Number} evs The EV number, ex. 252.
   * @param  {Number} natureMultiplier The nature multiplier to use if the
   *                                   mon doesn't have a nature set. Should
   *                                   be in [0.9, 1, 1.1].
   */
  _assumeStat(mon, stat, evs = 85, natureMultiplier = 1) {
    if (!mon.stats[stat]) {
      mon.stats[stat] = this._calculateStat(mon, stat, evs, natureMultiplier);
    }
    return mon;
  }


  /**
   * Calculates a certain stat.
   *
   * HP = ((Base * 2 + IV + EV/4) * Level / 100) + Level + 10
   * Stat = (((Base * 2 + IV + EV/4) * Level / 100) + 5) * Naturemod
   *
   * @param  {Object} mon The pokemon object. This is modified directly.
   * Expects the following properties:
   * level: {Number} The Pokemon's level
   * baseStats: {Object} The Pokemon's unmodified (pre-EV and IV) stats
   * stats: {Object} The Pokemon's modified stats.
   * nature: {String} (optional) The Pokemon's nature; use natureMultiplier if
   * this is undefined.
   * @param  {Enum/String} stat The stat to maybe update.
   * @param  {Number} evs The EV number, ex. 252.
   * @param  {Number} natureMultiplier The nature multiplier to use if the
   *                                   mon doesn't have a nature set. Should
   *                                   be in [0.9, 1, 1.1].
   */
  _calculateStat(mon, stat, evs = 0, natureMultiplier = 1) {
    const evBonus = Math.floor(evs / 4);
    const addThis = stat === 'hp' ? (mon.level + 10) : 5;
    const calculated = ((mon.baseStats[stat] * 2 + 31 + evBonus) *
      (mon.level / 100) + addThis);

    const nature = (mon.nature
        ? this._getNatureMultiplier(mon.nature, stat)
        : natureMultiplier);

    return Math.floor(calculated * nature);
  }

  /**
   * Get the multiplier for a given nature and stat.
   *
   * @param  {String/Enum} nature A nature.
   * @param  {String/Enum} stat   A stat.
   * @return {Number} A number in [0.9, 1, 1.1]. 1 is returned for undefined
   * natures.
   */
  _getNatureMultiplier(nature, stat) {
    if (!nature) return 1;
    if (!NATURES[nature]) {
      console.log('invalid nature! ' + nature);
      return 1;
    }
    if (NATURES[nature][0] === stat) return 1.1;
    if (NATURES[nature][1] === stat) return 0.9;
    return 1;
  }

  /**
   * Helper function to give a pokemon its stats. This is based on logic for
   * randombattles. Check the client code data/scripts.js::randomSet. There
   * are lots of exceptions that I didn't include here, read the client code
   * for more details.
   *
   */
  assumeStats(mon) {
    if (!mon.stats) mon.stats = {};
    [AT, SA, DF, SD, SP, HP].forEach( stat => {
      if (!mon.stats[stat]) {
        mon.stats[stat] = this._calculateStat(mon, stat, 85, 1);
      }
    });

    // assume HP if we can
    if (mon.hppct && mon.stats.hp) {
      mon.maxhp = mon.stats.hp;
      mon.hp = mon.stats.hp * mon.hppct / 100;
    }
  }

  getDamageResult(a, d, move, field = defaultField, maxOnly = false) {
    if (typeof a === 'string') {
      a = util.researchPokemonById(a);
    }
    if (typeof d === 'string') {
      d = util.researchPokemonById(d);
    }
    if (typeof move === 'string') {
      move = util.researchMoveById(move);
    }

    let attacker = Object.assign({}, a);
    let defender = Object.assign({}, d);

    attacker = this.processPokemon(attacker);
    defender = this.processPokemon(defender);
    move = this.processMove(move);

    const description = {
      'attackerName': attacker.species,
      'moveName': move.name,
      'defenderName': defender.species
    };

    // console.log(description);

    if (move.bp === 0) {
      return [0];
    }

    if (['Physical', 'Special'].indexOf(move.category) === -1) {
      return [0];
    }

    let defAbility = defender.ability || '';
    if (['Mold Breaker', 'Teravolt', 'Turboblaze'].indexOf(attacker.ability) !== -1) {
      defAbility = '';
      description.attackerAbility = attacker.ability;
    }

    const isCritical = move.isCrit && ['Battle Armor', 'Shell Armor'].indexOf(defAbility) === -1;

    if (move.name === 'Weather Ball') {
      move.type = field.weather.indexOf('Sun') !== -1 ? 'Fire'
        : field.weather.indexOf('Rain') !== -1 ? 'Water'
          : field.weather === 'Sand' ? 'Rock'
            : field.weather === 'Hail' ? 'Ice'
              : 'Normal';
      description.weather = field.weather;
      description.moveType = move.type;
    } else if (move.name === 'Judgment' && attacker.item.indexOf('Plate') !== -1) {
      move.type = getItemBoostType(attacker.item);
    } else if (move.name === 'Natural Gift' && attacker.item.indexOf('Berry') !== -1) {
      const gift = getNaturalGift(attacker.item);
      move.type = gift.t;
      move.bp = gift.p;
      description.attackerItem = attacker.item;
      description.moveBP = move.bp;
      description.moveType = move.type;
    } else if (move.name === 'Nature Power') {
      move.type = field.terrain === 'Electric' ? 'Electric' : field.terrain === 'Grassy' ? 'Grass' : field.terrain === 'Misty' ? 'Fairy' : 'Normal';
    }

    const isAerilate = attacker.ability === 'Aerilate' && move.type === 'Normal';
    const isPixilate = attacker.ability === 'Pixilate' && move.type === 'Normal';
    const isRefrigerate = attacker.ability === 'Refrigerate' && move.type === 'Normal';
    if (isAerilate) {
      move.type = 'Flying';
    } else if (isPixilate) {
      move.type = 'Fairy';
    } else if (isRefrigerate) {
      move.type = 'Ice';
    } else if (attacker.ability === 'Normalize') {
      move.type = 'Normal';
      description.attackerAbility = attacker.ability;
    }

    const typeEffect1 = getMoveEffectiveness(move, defender.type1, attacker.ability === 'Scrappy' || field.isForesight, field.isGravity);
    const typeEffect2 = defender.type2 ? getMoveEffectiveness(move, defender.type2, attacker.ability === 'Scrappy' || field.isForesight, field.isGravity) : 1;
    let typeEffectiveness = typeEffect1 * typeEffect2;

    if (typeEffectiveness === 0) {
      return [0];
    }
    if ((defAbility === 'Wonder Guard' && typeEffectiveness <= 1) ||
      (move.type === 'Grass' && defAbility === 'Sap Sipper') ||
      (move.type === 'Fire' && defAbility.indexOf('Flash Fire') !== -1) ||
      (move.type === 'Water' && ['Dry Skin', 'Storm Drain', 'Water Absorb'].indexOf(defAbility) !== -1) ||
      (move.type === 'Electric' && ['Lightning Rod', 'Lightningrod', 'Motor Drive', 'Volt Absorb'].indexOf(defAbility) !== -1) ||
      (move.type === 'Ground' && !field.isGravity && defAbility === 'Levitate') ||
      (move.isBullet && defAbility === 'Bulletproof') ||
      (move.isSound && defAbility === 'Soundproof')) {
      description.defenderAbility = defAbility;
      return [0];
    }
    if (field.weather === 'Strong Winds' && (defender.type1 === 'Flying' || defender.type2 === 'Flying') && typeChart[move.type].Flying > 1) {
      typeEffectiveness /= 2;
      description.weather = field.weather;
    }
    if (move.type === 'Ground' && !field.isGravity && defender.item === 'Air Balloon') {
      description.defenderItem = defender.item;
      return [0];
    }

    // never used, except in output string
    // description.HPEVs = defender.HPEVs + ' HP';

    if (move.name === 'Seismic Toss' || move.name === 'Night Shade') {
      let lv = attacker.level;
      if (attacker.ability === 'Parental Bond') {
        lv *= 2;
      }
      return [lv];
    }

    if (move.hits > 1) {
      description.hits = move.hits;
    }


    const turnOrder = attacker.stats[SP] > defender.stats[SP] ? 'FIRST' : 'LAST';

    // //////////////////////////////
    // //////// BASE POWER //////////
    // //////////////////////////////
    let basePower;
    switch (move.name) {
    case 'Payback':
      basePower = turnOrder === 'LAST' ? 100 : 50;
      description.moveBP = basePower;
      break;
    case 'Electro Ball':
      const r = Math.floor(attacker.stats[SP] / defender.stats[SP]);
      basePower = r >= 4 ? 150 : r >= 3 ? 120 : r >= 2 ? 80 : 60;
      description.moveBP = basePower;
      break;
    case 'Gyro Ball':
      basePower = Math.min(150, Math.floor(25 * defender.stats[SP] / attacker.stats[SP]));
      description.moveBP = basePower;
      break;
    case 'Punishment':
      basePower = Math.min(200, 60 + 20 * countBoosts(defender.boosts));
      description.moveBP = basePower;
      break;
    case 'Low Kick':
    case 'Grass Knot':
      const w = defender.weight;
      basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
      description.moveBP = basePower;
      break;
    case 'Hex':
      // this used to check for 'Healthy', but this str will be empty for our system
      basePower = move.bp * (defender.status !== '' ? 2 : 1);
      description.moveBP = basePower;
      break;
    case 'Heavy Slam':
    case 'Heat Crash':
      const wr = attacker.weight / defender.weight;
      basePower = wr >= 5 ? 120 : wr >= 4 ? 100 : wr >= 3 ? 80 : wr >= 2 ? 60 : 40;
      description.moveBP = basePower;
      break;
    case 'Stored Power':
      basePower = 20 + 20 * countBoosts(attacker.boosts);
      description.moveBP = basePower;
      break;
    case 'Acrobatics':
      basePower = attacker.item === 'Flying Gem' || attacker.item === '' ? 110 : 55;
      description.moveBP = basePower;
      break;
    case 'Wake-Up Slap':
      basePower = move.bp * (defender.status === 'Asleep' ? 2 : 1);
      description.moveBP = basePower;
      break;
    case 'Weather Ball':
      basePower = field.weather !== '' ? 100 : 50;
      description.moveBP = basePower;
      break;
    case 'Fling':
      basePower = getFlingPower(attacker.item);
      description.moveBP = basePower;
      description.attackerItem = attacker.item;
      break;
    case 'Eruption':
    case 'Water Spout':
      basePower = Math.max(1, Math.floor(150 * attacker.curHP / attacker.maxHP));
      description.moveBP = basePower;
      break;
    case 'Flail':
    case 'Reversal':
      const p = Math.floor(48 * attacker.curHP / attacker.maxHP);
      basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
      description.moveBP = basePower;
      break;
    case 'Earthquake':
      basePower = (field.terrain === 'Grassy') ? move.bp / 2 : move.bp;
      description.terrain = field.terrain;
      break;
    case 'Nature Power':
      basePower = (field.terrain === 'Electric' || field.terrain === 'Grassy') ? 90 : (field.terrain === 'Misty') ? 95 : 80;
      break;
    case 'Venoshock':
      basePower = move.bp * (defender.status === 'Poisoned' ? 2 : 1);
      description.moveBP = basePower;
      break;
    case 'Return':
      basePower = 102; // assume max happiness
      break;
    default:
      basePower = move.bp;
    }

    const bpMods = [];
    if ((attacker.ability === 'Technician' && basePower <= 60) ||
      (attacker.ability === 'Flare Boost' && attacker.status === 'Burned' && move.category === 'Special') ||
      (attacker.ability === 'Toxic Boost' && (attacker.status === 'Poisoned' || attacker.status === 'Badly Poisoned') &&
      move.category === 'Physical')) {
      bpMods.push(0x1800);
      description.attackerAbility = attacker.ability;
    } else if (attacker.ability === 'Analytic' && turnOrder !== 'FIRST') {
      bpMods.push(0x14CD);
      description.attackerAbility = attacker.ability;
    } else if (attacker.ability === 'Sand Force' && field.weather === 'Sand' && ['Rock', 'Ground', 'Steel'].indexOf(move.type) !== -1) {
      bpMods.push(0x14CD);
      description.attackerAbility = attacker.ability;
      description.weather = field.weather;
    } else if ((attacker.ability === 'Reckless' && move.hasRecoil) ||
      (attacker.ability === 'Iron Fist' && move.isPunch)) {
      bpMods.push(0x1333);
      description.attackerAbility = attacker.ability;
    }

    if (defAbility === 'Heatproof' && move.type === 'Fire') {
      bpMods.push(0x800);
      description.defenderAbility = defAbility;
    } else if (defAbility === 'Dry Skin' && move.type === 'Fire') {
      bpMods.push(0x1400);
      description.defenderAbility = defAbility;
    }

    if (attacker.ability === 'Sheer Force' && move.hasSecondaryEffect) {
      bpMods.push(0x14CD);
      description.attackerAbility = attacker.ability;
    }

    if (getItemBoostType(attacker.item) === move.type) {
      bpMods.push(0x1333);
      description.attackerItem = attacker.item;
    } else if ((attacker.item === 'Muscle Band' && move.category === 'Physical') ||
      (attacker.item === 'Wise Glasses' && move.category === 'Special')) {
      bpMods.push(0x1199);
      description.attackerItem = attacker.item;
    } else if (((attacker.item === 'Adamant Orb' && attacker.name === 'Dialga') ||
      (attacker.item === 'Lustrous Orb' && attacker.name === 'Palkia') ||
      (attacker.item === 'Griseous Orb' && attacker.name === 'Giratina-O')) &&
      (move.type === attacker.type1 || move.type === attacker.type2)) {
      bpMods.push(0x1333);
      description.attackerItem = attacker.item;
    } else if (attacker.item === move.type + ' Gem') {
      bpMods.push(gen >= 6 ? 0x14CD : 0x1800);
      description.attackerItem = attacker.item;
    }

    if ((move.name === 'Facade' && ['Burned', 'Paralyzed', 'Poisoned', 'Badly Poisoned'].indexOf(attacker.status) !== -1) ||
      (move.name === 'Brine' && defender.curHP <= defender.maxHP / 2) ||
      (move.name === 'Venoshock' && (defender.status === 'Poisoned' || defender.status === 'Badly Poisoned'))) {
      bpMods.push(0x2000);
      description.moveBP = move.bp * 2;
    } else if ((move.name === 'Solar Beam' || move.name === 'SolarBeam') && ['Rain', 'Heavy Rain', 'Sand', 'Hail'].indexOf(field.weather) !== -1) {
      bpMods.push(0x800);
      description.moveBP = move.bp / 2;
      description.weather = field.weather;
    } else if (gen >= 6 && move.name === 'Knock Off' && !(defender.item === '' ||
      (defender.name === 'Giratina-O' && defender.item === 'Griseous Orb') ||
      (defender.name.indexOf('Arceus') !== -1 && defender.item.indexOf('Plate') !== -1))) {
      bpMods.push(0x1800);
      description.moveBP = move.bp * 1.5;
    }

    if (field.isHelpingHand) {
      bpMods.push(0x1800);
      description.isHelpingHand = true;
    }

    if (isAerilate || isPixilate || isRefrigerate) {
      bpMods.push(0x14CD);
      description.attackerAbility = attacker.ability;
    } else if ((attacker.ability === 'Mega Launcher' && move.isPulse) ||
      (attacker.ability === 'Strong Jaw' && move.isBite)) {
      bpMods.push(0x1800);
      description.attackerAbility = attacker.ability;
    } else if (attacker.ability === 'Tough Claws' && move.makesContact) {
      bpMods.push(0x1547);
      description.attackerAbility = attacker.ability;
    }

    const isAttackerAura = attacker.ability === (move.type + ' Aura');
    const isDefenderAura = defAbility === (move.type + ' Aura');
    if (isAttackerAura || isDefenderAura) {
      if (attacker.ability === 'Aura Break' || defAbility === 'Aura Break') {
        bpMods.push(0x0C00);
        description.attackerAbility = attacker.ability;
        description.defenderAbility = defAbility;
      } else {
        bpMods.push(0x1547);
        if (isAttackerAura) {
          description.attackerAbility = attacker.ability;
        }
        if (isDefenderAura) {
          description.defenderAbility = defAbility;
        }
      }
    }
    basePower = Math.max(1, pokeRound(basePower * chainMods(bpMods) / 0x1000));

    // //////////////////////////////
    // //////// (SP)ATTACK //////////
    // //////////////////////////////
    let attack;
    const attackSource = move.name === 'Foul Play' ? defender : attacker;
    const attackStat = move.category === 'Physical' ? AT : SA;
    // description.attackEVs = attacker.evs[attackStat] +
    //   (NATURES[attacker.nature][0] === attackStat ? '+' : NATURES[attacker.nature][1] === attackStat ? '-' : '')
    //   + ' ' + toSmogonStat(attackStat);

    // if (attackSource.boosts[attackStat] === 0 || (isCritical && attackSource.boosts[attackStat] < 0)) {
    //   attack = attackSource.rawStats[attackStat];
    // } else if (defAbility === 'Unaware') {
    //   attack = attackSource.rawStats[attackStat];
    //   description.defenderAbility = defAbility;
    // } else {
    //   attack = attackSource.stats[attackStat];
    //   description.attackBoost = attackSource.boosts[attackStat];
    // }
    // @TODO I caused a lot of fuckery here - the original code is using raw
    // stats a lot here, for some reason.
    attack = attackSource.stats[attackStat];

    // unlike all other attack modifiers, Hustle gets applied directly
    if (attacker.ability === 'Hustle' && move.category === 'Physical') {
      attack = pokeRound(attack * 3 / 2);
      description.attackerAbility = attacker.ability;
    }

    const atMods = [];
    if (defAbility === 'Thick Fat' && (move.type === 'Fire' || move.type === 'Ice')) {
      atMods.push(0x800);
      description.defenderAbility = defAbility;
    }

    if ((attacker.ability === 'Guts' && attacker.status !== 'Healthy' && move.category === 'Physical') ||
      (attacker.ability === 'Overgrow' && attacker.curHP <= attacker.maxHP / 3 && move.type === 'Grass') ||
      (attacker.ability === 'Blaze' && attacker.curHP <= attacker.maxHP / 3 && move.type === 'Fire') ||
      (attacker.ability === 'Torrent' && attacker.curHP <= attacker.maxHP / 3 && move.type === 'Water') ||
      (attacker.ability === 'Swarm' && attacker.curHP <= attacker.maxHP / 3 && move.type === 'Bug')) {
      atMods.push(0x1800);
      description.attackerAbility = attacker.ability;
    } else if (attacker.ability === 'Flash Fire (activated)' && move.type === 'Fire') {
      atMods.push(0x1800);
      description.attackerAbility = 'Flash Fire';
    } else if ((attacker.ability === 'Solar Power' && field.weather.indexOf('Sun') !== -1 && move.category === 'Special') ||
      (attacker.ability === 'Flower Gift' && field.weather.indexOf('Sun') !== -1 && move.category === 'Physical')) {
      atMods.push(0x1800);
      description.attackerAbility = attacker.ability;
      description.weather = field.weather;
    } else if ((attacker.ability === 'Defeatist' && attacker.curHP <= attacker.maxHP / 2) ||
      (attacker.ability === 'Slow Start' && move.category === 'Physical')) {
      atMods.push(0x800);
      description.attackerAbility = attacker.ability;
    } else if ((attacker.ability === 'Huge Power' || attacker.ability === 'Pure Power') && move.category === 'Physical') {
      atMods.push(0x2000);
      description.attackerAbility = attacker.ability;
    }

    if ((attacker.item === 'Thick Club' && (attacker.name === 'Cubone' || attacker.name === 'Marowak') && move.category === 'Physical') ||
      (attacker.item === 'Deep Sea Tooth' && attacker.name === 'Clamperl' && move.category === 'Special') ||
      (attacker.item === 'Light Ball' && attacker.name === 'Pikachu')) {
      atMods.push(0x2000);
      description.attackerItem = attacker.item;
    } else if ((attacker.item === 'Soul Dew' && (attacker.name === 'Latios' || attacker.name === 'Latias') && move.category === 'Special') ||
      (attacker.item === 'Choice Band' && move.category === 'Physical') ||
      (attacker.item === 'Choice Specs' && move.category === 'Special')) {
      atMods.push(0x1800);
      description.attackerItem = attacker.item;
    }

    attack = Math.max(1, pokeRound(attack * chainMods(atMods) / 0x1000));
    // //////////////////////////////
    // /////// (SP)DEFENSE //////////
    // //////////////////////////////
    let defense;
    const hitsPhysical = move.category === 'Physical' || move.dealsPhysicalDamage;
    const defenseStat = hitsPhysical ? DF : SD;
    // description.defenseEVs = defender.evs[defenseStat] +
    //   (NATURES[defender.nature][0] === defenseStat ? '+' : NATURES[defender.nature][1] === defenseStat ? '-' : '') + ' ' +
    //   toSmogonStat(defenseStat);

    // if (defender.boosts[defenseStat] === 0 || (isCritical && defender.boosts[defenseStat] > 0) || move.ignoresDefenseBoosts) {
    //   defense = defender.baseStats[defenseStat];
    // } else if (attacker.ability === 'Unaware') {
    //   defense = defender.baseStats[defenseStat];
    //   description.attackerAbility = attacker.ability;
    // } else {
    //   defense = defender.stats[defenseStat];
    //   description.defenseBoost = defender.boosts[defenseStat];
    // }
    defense = defender.stats[defenseStat];

    // unlike all other defense modifiers, Sandstorm SpD boost gets applied directly
    if (field.weather === 'Sand' && (defender.type1 === 'Rock' || defender.type2 === 'Rock') && !hitsPhysical) {
      defense = pokeRound(defense * 3 / 2);
      description.weather = field.weather;
    }

    const dfMods = [];
    if (defAbility === 'Marvel Scale' && defender.status !== 'Healthy' && hitsPhysical) {
      dfMods.push(0x1800);
      description.defenderAbility = defAbility;
    } else if (defAbility === 'Flower Gift' && field.weather.indexOf('Sun') !== -1 && !hitsPhysical) {
      dfMods.push(0x1800);
      description.defenderAbility = defAbility;
      description.weather = field.weather;
    }

    if ((defender.item === 'Deep Sea Scale' && defender.name === 'Clamperl' && !hitsPhysical) ||
      (defender.item === 'Metal Powder' && defender.name === 'Ditto') ||
      (defender.item === 'Soul Dew' && (defender.name === 'Latios' || defender.name === 'Latias') && !hitsPhysical) ||
      (defender.item === 'Assault Vest' && !hitsPhysical) || defender.item === 'Eviolite') {
      dfMods.push(0x1800);
      description.defenderItem = defender.item;
    }

    if (defAbility === 'Fur Coat' && hitsPhysical) {
      dfMods.push(0x2000);
      description.defenderAbility = defAbility;
    }

    defense = Math.max(1, pokeRound(defense * chainMods(dfMods) / 0x1000));
    // //////////////////////////////
    // ////////// DAMAGE ////////////
    // //////////////////////////////
    let baseDamage = Math.floor(Math.floor((Math.floor((2 * attacker.level) / 5 + 2) * basePower * attack) / defense) / 50 + 2);
    if (field.format !== 'Singles' && move.isSpread) {
      baseDamage = pokeRound(baseDamage * 0xC00 / 0x1000);
    }
    if ((field.weather.indexOf('Sun') !== -1 && move.type === 'Fire') || (field.weather.indexOf('Rain') !== -1 && move.type === 'Water')) {
      baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
      description.weather = field.weather;
    } else if ((field.weather === 'Sun' && move.type === 'Water') || (field.weather === 'Rain' && move.type === 'Fire')) {
      baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
      description.weather = field.weather;
    } else if ((field.weather === 'Harsh Sunshine' && move.type === 'Water') || (field.weather === 'Heavy Rain' && move.type === 'Fire')) {
      return [0];
    }
    if (field.isGravity || (attacker.type1 !== 'Flying' && attacker.type2 !== 'Flying' &&
      attacker.item !== 'Air Balloon' && attacker.ability !== 'Levitate')) {
      if (field.terrain === 'Electric' && move.type === 'Electric') {
        baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
        description.terrain = field.terrain;
      } else if (field.terrain === 'Grassy' && move.type === 'Grass') {
        baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
        description.terrain = field.terrain;
      }
    }
    if (field.isGravity || (defender.type1 !== 'Flying' && defender.type2 !== 'Flying' &&
      defender.item !== 'Air Balloon' && defender.ability !== 'Levitate')) {
      if (field.terrain === 'Misty' && move.type === 'Dragon') {
        baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
        description.terrain = field.terrain;
      }
    }
    if (isCritical) {
      baseDamage = Math.floor(baseDamage * (gen >= 6 ? 1.5 : 2));
      description.isCritical = isCritical;
    }
    // the random factor is applied between the crit mod and the stab mod, so don't apply anything below this until we're inside the loop
    let stabMod = 0x1000;
    if (move.type === attacker.type1 || move.type === attacker.type2) {
      if (attacker.ability === 'Adaptability') {
        stabMod = 0x2000;
        description.attackerAbility = attacker.ability;
      } else {
        stabMod = 0x1800;
      }
    } else if (attacker.ability === 'Protean') {
      stabMod = 0x1800;
      description.attackerAbility = attacker.ability;
    }
    const applyBurn = (attacker.status === 'Burned' && move.category === 'Physical' && attacker.ability !== 'Guts' && !move.ignoresBurn);
    description.isBurned = applyBurn;
    const finalMods = [];
    if (field.isReflect && move.category === 'Physical' && !isCritical) {
      finalMods.push(field.format !== 'Singles' ? 0xA8F : 0x800);
      description.isReflect = true;
    } else if (field.isLightScreen && move.category === 'Special' && !isCritical) {
      finalMods.push(field.format !== 'Singles' ? 0xA8F : 0x800);
      description.isLightScreen = true;
    }
    if (defAbility === 'Multiscale' && defender.curHP === defender.maxHP) {
      finalMods.push(0x800);
      description.defenderAbility = defAbility;
    }
    if (attacker.ability === 'Tinted Lens' && typeEffectiveness < 1) {
      finalMods.push(0x2000);
      description.attackerAbility = attacker.ability;
    } else if (attacker.ability === 'Sniper' && isCritical) {
      finalMods.push(0x1800);
      description.attackerAbility = attacker.ability;
    }
    if ((defAbility === 'Solid Rock' || defAbility === 'Filter') && typeEffectiveness > 1) {
      finalMods.push(0xC00);
      description.defenderAbility = defAbility;
    }
    if (attacker.item === 'Expert Belt' && typeEffectiveness > 1) {
      finalMods.push(0x1333);
      description.attackerItem = attacker.item;
    } else if (attacker.item === 'Life Orb') {
      finalMods.push(0x14CC);
      description.attackerItem = attacker.item;
    }
    if (getBerryResistType(defender.item) === move.type && (typeEffectiveness > 1 || move.type === 'Normal') &&
      attacker.ability !== 'Unnerve') {
      finalMods.push(0x800);
      description.defenderItem = defender.item;
    }
    const finalMod = chainMods(finalMods);
    // console.log('final mods:', finalMod);
    // console.log('other things:', baseDamage, stabMod, typeEffectiveness, attacker.ability, move.hits, field.format);


    const damage = [];
    let i = 0;
    if (maxOnly) i = 15;
    for (; i < 16; i++) {
      damage[i] = Math.floor(baseDamage * (85 + i) / 100);
      damage[i] = pokeRound(damage[i] * stabMod / 0x1000);
      damage[i] = Math.floor(damage[i] * typeEffectiveness);
      if (applyBurn) {
        damage[i] = Math.floor(damage[i] / 2);
      }
      damage[i] = Math.max(1, damage[i]);
      damage[i] = pokeRound(damage[i] * finalMod / 0x1000);

      // is 2nd hit half BP? half attack? half damage range? keeping it as a flat 1.5x until I know the specifics
      if (attacker.ability === 'Parental Bond' && move.hits === 1 &&
        (field.format === 'Singles' || !move.isSpread)) {
        damage[i] = Math.floor(damage[i] * 3 / 2);
      }
    }
    // console.log('returning result:', damage);
    return damage;
  }
}

const damage = new Damage();
export default damage;

// function appendIfSet(str, toAppend) {
//   if (toAppend) {
//     return str + toAppend + ' ';
//   }
//   return str;
// }

function chainMods(mods) {
  let M = 0x1000;
  for (let i = 0; i < mods.length; i++) {
    if (mods[i] !== 0x1000) {
      M = ((M * mods[i]) + 0x800) >> 12;
    }
  }
  return M;
}

function getMoveEffectiveness(move, type, isGhostRevealed, isGravity) {
  // console.log('getMoveEffectiveness:', move, type, isGhostRevealed, isGravity);
  if (isGhostRevealed && type === 'Ghost' && (move.type === 'Normal' || move.type === 'Fighting')) {
    return 1;
  } else if (isGravity && type === 'Flying' && move.type === 'Ground') {
    return 1;
  } else if (move.name === 'Freeze-Dry' && type === 'Water') {
    return 2;
  } else if (move.name === 'Flying Press') {
    return typeChart.Fighting[type] * typeChart.Flying[type];
  }
  return typeChart[move.type][type];
}

function getModifiedStat(stat, mod) {
  return mod > 0 ? Math.floor(stat * (2 + mod) / 2)
    : mod < 0 ? Math.floor(stat * 2 / (2 - mod))
      : stat;
}

function getFinalSpeed(pokemon, weather) {
  let speed = getModifiedStat(pokemon.baseStats[SP], pokemon.boosts[SP]);
  if (pokemon.item === 'Choice Scarf') {
    speed = Math.floor(speed * 1.5);
  } else if (pokemon.item === 'Macho Brace' || pokemon.item === 'Iron Ball') {
    speed = Math.floor(speed / 2);
  }
  if ((pokemon.ability === 'Chlorophyll' && weather.indexOf('Sun') !== -1) ||
    (pokemon.ability === 'Sand Rush' && weather === 'Sand') ||
    (pokemon.ability === 'Swift Swim' && weather.indexOf('Rain') !== -1)) {
    speed *= 2;
  }
  return speed;
}

function checkAirLock(pokemon, field) {
  if (pokemon.ability === 'Air Lock' || pokemon.ability === 'Cloud Nine') {
    field.clearWeather();
  }
}
function checkForecast(pokemon, weather) {
  if (pokemon.ability === 'Forecast' && pokemon.name === 'Castform') {
    if (weather.indexOf('Sun') !== -1) {
      pokemon.type1 = 'Fire';
    } else if (weather.indexOf('Rain') !== -1) {
      pokemon.type1 = 'Water';
    } else if (weather === 'Hail') {
      pokemon.type1 = 'Ice';
    } else {
      pokemon.type1 = 'Normal';
    }
    pokemon.type2 = '';
  }
}
function checkKlutz(pokemon) {
  if (pokemon.ability === 'Klutz') {
    pokemon.item = '';
  }
}
function checkIntimidate(source, target) {
  if (source.ability === 'Intimidate') {
    if (target.ability === 'Contrary' || target.ability === 'Defiant') {
      target.boosts[AT] = Math.min(6, target.boosts[AT] + 1);
    } else if (['Clear Body', 'White Smoke', 'Hyper Cutter'].indexOf(target.ability) !== -1) {
      return;
    } else if (target.ability === 'Simple') {
      target.boosts[AT] = Math.max(-6, target.boosts[AT] - 2);
    } else {
      target.boosts[AT] = Math.max(-6, target.boosts[AT] - 1);
    }
  }
}
function checkDownload(source, target) {
  if (source.ability === 'Download') {
    if (target.stats[SD] <= target.stats[DF]) {
      source.boosts[SA] = Math.min(6, source.boosts[SA] + 1);
    } else {
      source.boosts[AT] = Math.min(6, source.boosts[AT] + 1);
    }
  }
}
function checkInfiltrator(attacker, affectedSide) {
  if (attacker.ability === 'Infiltrator') {
    affectedSide.isReflect = false;
    affectedSide.isLightScreen = false;
  }
}
// @TODO check to see if this works for our boosts object
function countBoosts(boosts) {
  let sum = 0;
  for (let i = 0; i < STATS.length; i++) {
    if (boosts[STATS[i]] > 0) {
      sum += boosts[STATS[i]];
    }
  }
  return sum;
}

// GameFreak rounds DOWN on .5
function pokeRound(num) {
  return (num % 1 > 0.5) ? Math.ceil(num) : Math.floor(num);
}

// gross: pulling these from itemdata
//


function getItemBoostType(item) {
  switch (item) {
  case 'Draco Plate':
  case 'Dragon Fang':
    return 'Dragon';
  case 'Dread Plate':
  case 'BlackGlasses':
  case 'Black Glasses':
    return 'Dark';
  case 'Earth Plate':
  case 'Soft Sand':
    return 'Ground';
  case 'Fist Plate':
  case 'Black Belt':
    return 'Fighting';
  case 'Flame Plate':
  case 'Charcoal':
    return 'Fire';
  case 'Icicle Plate':
  case 'NeverMeltIce':
  case 'Never-Melt Ice':
    return 'Ice';
  case 'Insect Plate':
  case 'SilverPowder':
  case 'Silver Powder':
    return 'Bug';
  case 'Iron Plate':
  case 'Metal Coat':
    return 'Steel';
  case 'Meadow Plate':
  case 'Rose Incense':
  case 'Miracle Seed':
    return 'Grass';
  case 'Mind Plate':
  case 'Odd Incense':
  case 'TwistedSpoon':
  case 'Twisted Spoon':
    return 'Psychic';
  case 'Pixie Plate':
    return 'Fairy';
  case 'Sky Plate':
  case 'Sharp Beak':
    return 'Flying';
  case 'Splash Plate':
  case 'Sea Incense':
  case 'Wave Incense':
  case 'Mystic Water':
    return 'Water';
  case 'Spooky Plate':
  case 'Spell Tag':
    return 'Ghost';
  case 'Stone Plate':
  case 'Rock Incense':
  case 'Hard Stone':
    return 'Rock';
  case 'Toxic Plate':
  case 'Poison Barb':
    return 'Poison';
  case 'Zap Plate':
  case 'Magnet':
    return 'Electric';
  case 'Silk Scarf':
  case 'Pink Bow':
  case 'Polkadot Bow':
    return 'Normal';
  default:
    return '';
  }
}

function getBerryResistType(berry) {
  switch (berry) {
  case 'Chilan Berry':
    return 'Normal';
  case 'Occa Berry':
    return 'Fire';
  case 'Passho Berry':
    return 'Water';
  case 'Wacan Berry':
    return 'Electric';
  case 'Rindo Berry':
    return 'Grass';
  case 'Yache Berry':
    return 'Ice';
  case 'Chople Berry':
    return 'Fighting';
  case 'Kebia Berry':
    return 'Poison';
  case 'Shuca Berry':
    return 'Ground';
  case 'Coba Berry':
    return 'Flying';
  case 'Payapa Berry':
    return 'Psychic';
  case 'Tanga Berry':
    return 'Bug';
  case 'Charti Berry':
    return 'Rock';
  case 'Kasib Berry':
    return 'Ghost';
  case 'Haban Berry':
    return 'Dragon';
  case 'Colbur Berry':
    return 'Dark';
  case 'Babiri Berry':
    return 'Steel';
  case 'Roseli Berry':
    return 'Fairy';
  default:
    return '';
  }
}

function getFlingPower(item) {
  return item === 'Iron Ball' ? 130
    : item === 'Hard Stone' ? 100
    : item.indexOf('Plate') !== -1 || ['Deep Sea Tooth', 'Thick Club'].indexOf(item) !== -1 ? 90
    : ['Assault Vest', 'Weakness Policy'].indexOf(item) !== -1 ? 80
    : ['Poison Barb', 'Dragon Fang'].indexOf(item) !== -1 ? 70
    : ['Adamant Orb', 'Lustrous Orb', 'Macho Brace', 'Stick'].indexOf(item) !== -1 ? 60
    : item === 'Sharp Beak' ? 50
    : item === 'Eviolite' ? 40
    : ['Black Belt', 'Black Sludge', 'Black Glasses', 'Charcoal', 'Deep Sea Scale', 'Flame Orb', "King's Rock",
        'Life Orb', 'Light Ball', 'Magnet', 'Metal Coat', 'Miracle Seed', 'Mystic Water', 'Never-Melt Ice',
        'Razor Fang', 'Soul Dew', 'Spell Tag', 'Toxic Orb', 'Twisted Spoon'].indexOf(item) !== -1 ? 30
    : 10;
}

function getNaturalGift(item) {
  const gift = {
    'Apicot Berry': {'t': 'Ground', 'p': 100},
    'Babiri Berry': {'t': 'Steel', 'p': 80},
    'Belue Berry': {'t': 'Electric', 'p': 100},
    'Charti Berry': {'t': 'Rock', 'p': 80},
    'Chesto Berry': {'t': 'Water', 'p': 80},
    'Chilan Berry': {'t': 'Normal', 'p': 80},
    'Chople Berry': {'t': 'Fighting', 'p': 80},
    'Coba Berry': {'t': 'Flying', 'p': 80},
    'Colbur Berry': {'t': 'Dark', 'p': 80},
    'Custap Berry': {'t': 'Ghost', 'p': 100},
    'Durin Berry': {'t': 'Water', 'p': 100},
    'Enigma Berry': {'t': 'Bug', 'p': 100},
    'Ganlon Berry': {'t': 'Ice', 'p': 100},
    'Haban Berry': {'t': 'Dragon', 'p': 80},
    'Jaboca Berry': {'t': 'Dragon', 'p': 100},
    'Kasib Berry': {'t': 'Ghost', 'p': 80},
    'Kebia Berry': {'t': 'Poison', 'p': 80},
    'Kee Berry': {'t': 'Fairy', 'p': 100},
    'Lansat Berry': {'t': 'Flying', 'p': 100},
    'Leppa Berry': {'t': 'Fighting', 'p': 80},
    'Liechi Berry': {'t': 'Grass', 'p': 100},
    'Lum Berry': {'t': 'Flying', 'p': 80},
    'Maranga Berry': {'t': 'Dark', 'p': 100},
    'Micle Berry': {'t': 'Rock', 'p': 100},
    'Occa Berry': {'t': 'Fire', 'p': 80},
    'Oran Berry': {'t': 'Poison', 'p': 80},
    'Passho Berry': {'t': 'Water', 'p': 80},
    'Payapa Berry': {'t': 'Psychic', 'p': 80},
    'Petaya Berry': {'t': 'Poison', 'p': 100},
    'Rawst Berry': {'t': 'Grass', 'p': 80},
    'Rindo Berry': {'t': 'Grass', 'p': 80},
    'Roseli Berry': {'t': 'Fairy', 'p': 80},
    'Rowap Berry': {'t': 'Dark', 'p': 100},
    'Salac Berry': {'t': 'Fighting', 'p': 100},
    'Shuca Berry': {'t': 'Ground', 'p': 80},
    'Sitrus Berry': {'t': 'Psychic', 'p': 80},
    'Starf Berry': {'t': 'Psychic', 'p': 100},
    'Tanga Berry': {'t': 'Bug', 'p': 80},
    'Wacan Berry': {'t': 'Electric', 'p': 80},
    'Watmel Berry': {'t': 'Fire', 'p': 100},
    'Yache Berry': {'t': 'Ice', 'p': 80}
  }[item];
  if (gift) {
    if (gen < 6) {
      gift.p -= 20;
    }
    return gift;
  }
  return {'t': 'Normal', 'p': 1 };
}

const defaultField = {
  terrain: '',
  isGravity: '',
  isReflect: '',
  isLightScreen: '',
  isForesight: '',
  weather: '',
  clearWeather: () => {},
  getWeather: () => {return ''; } // this could be bad.
};

// function Field() {
//     var format = $("input:radio[name='format']:checked").val();
//     var isGravity = $("#gravity").prop("checked");
//     var isSR = [$("#srL").prop("checked"), $("#srR").prop("checked")];
//     var weather;
//     var spikes;
//     if (gen === 2) {
//         spikes = [$("#gscSpikesL").prop("checked") ? 1 : 0, $("#gscSpikesR").prop("checked") ? 1 : 0];
//         weather = $("input:radio[name='gscWeather']:checked").val();
//     } else {
//         weather = $("input:radio[name='weather']:checked").val();
//         spikes = [~~$("input:radio[name='spikesL']:checked").val(), ~~$("input:radio[name='spikesR']:checked").val()];
//     }
//     var terrain = ($("input:checkbox[name='terrain']:checked").val()) ? $("input:checkbox[name='terrain']:checked").val() : "";
//     var isReflect = [$("#reflectL").prop("checked"), $("#reflectR").prop("checked")];
//     var isLightScreen = [$("#lightScreenL").prop("checked"), $("#lightScreenR").prop("checked")];
//     var isForesight = [$("#foresightL").prop("checked"), $("#foresightR").prop("checked")];
//     var isHelpingHand = [$("#helpingHandR").prop("checked"), $("#helpingHandL").prop("checked")]; // affects attacks against opposite side

//     this.getWeather = function() {
//         return weather;
//     };
//     this.clearWeather = function() {
//         weather = "";
//     };
//     this.getSide = function(i) {
//         return new Side(format, terrain, weather, isGravity, isSR[i], spikes[i], isReflect[i], isLightScreen[i], isForesight[i], isHelpingHand[i]);
//     };
// }

// function Side(format, terrain, weather, isGravity, isSR, spikes, isReflect, isLightScreen, isForesight, isHelpingHand) {
//     this.format = format;
//     this.terrain = terrain;
//     this.weather = weather;
//     this.isGravity = isGravity;
//     this.isSR = isSR;
//     this.spikes = spikes;
//     this.isReflect = isReflect;
//     this.isLightScreen = isLightScreen;
//     this.isForesight = isForesight;
//     this.isHelpingHand = isHelpingHand;
// }
//
