
import util from 'pokeutil';
import log from 'log';

/**
 * Pokemon class, for tracking information and status of each Pokemon.
 */
export default class Pokemon {
  /**
   * Pokemon constructor.
   * @param  {String} species The species of Pokemon.
   * @return {Pokemon} An instance of the class Pokemon.
   */
  constructor(species) {
    this.useSpecies(species);
  }

/**
 * @typedef Pokemon
 * @property {boolean} dead  True if the mon is dead, undefined otherwise
 * @property {string} condition  a condition in Showdown format, ex. '100/100 par poi',
 *            '0/100 fnt' etc.
 * @property {Array<string>} conditions  an array of conditions, ex. ['par', 'poi'], in case
 *             that's easier to use.
 * @property id a mon's id, in Showdown format. @TODO does this exist? probs not
 * @property {string} species  the species of Pokemon, ex. "Pikachu".
 * @property {Array<Move>} moves  an array of Moves.
 * @property {number} level  the level of the mon.
 * @property {string} gender  One of 'M', 'F', or undefined/empty(?)
 * @property {number} hp  The mon's current HP.
 * @property {number} maxhp  The mon's max HP. Note that if the 'HP Percentage Mod'
 *        rule is set, this will be 100 for all of your opponent's mons.
 * @property {number} hppct  The mon's current HP as a percentage of max HP, in case
 *        that's easier to use.
 * @property {boolean} active  True if this mon is active, undefined otherwise.
 * @property {Array<Object>} events  Not currently being used. (things that happened to this
 *         mon? things this mon did?)
 * @property {Array<string>} types  An array of the mon's types, ex. ['Fire', 'Flying']
 * @property {Object} baseStats  An object with these properties:
 * @property {number} baseStats.atk: The attack value before boosts, EVs, IVs, etc.
 * @property {number} baseStats.def: The defense value before boosts, EVs, IVs, etc.
 * @property {number} baseStats.spa: The special attack value before boosts, EVs, IVs, etc.
 * @property {number} baseStats.spd: The special defense value before boosts, EVs, IVs, etc.
 * @property {number} baseStats.spe: The speend value before boosts, EVs, IVs, etc.
 * @property {string} ability  The mon's ability (?)
 * @property {Array} abilities  An array of abilities this mon might have (?)
 * @property {string} baseAbility  The mon's ability (?)
 * @property {number} weightkg  The mon's weight, in kg.
 * @property {string} nature  The mon's nature, ex. 'Jolly'. Usually, you only know
 * this about your own mons.
 * @property {string} position  The mon's position, in Showdown format. 'p1a' means
 *           they are in player 1's first active slot; 'p2c' means they are
 *           in player 2's third active slot (in a Triples battle)
 * @property {string} owner  The mon's owner, ex. 'p1' or 'p2'
 */

  /**
   * Gathers all the data we want to pass on to our bots.
   * @return {Pokemon} an object with just the stuff we want bots to see.
   *
   */
  data() {
    // return only what's necessary
    const out = {};
    ['dead', 'condition', 'conditions', 'id', 'species', 'moves', 'level',
    'gender', 'hp', 'maxhp', 'hppct', 'active', 'events', 'types', 'baseStats',
    'ability', 'abilities', 'baseAbility', 'weightkg', 'nature', 'stats',
    'position', 'owner', 'item', 'boosts' // for debugging
    ]
    .forEach( (field) => {
      if (this[field]) out[field] = this[field];
    });
    return out;
  }

  /**
   * Takes an object of data about the mon's status and processes it. The
   * fields 'details' and 'condition' get parsed further into fields like
   * 'position', 'owner', etc.
   *
   * @param  {[type]} obj An object of Pokemon info. Any properties of this
   * object OVERWRITE the current properties of this Pokemon, so be careful.
   */
  assimilate(obj) {
    // lol dangerous
    Object.assign(this, obj);

    if (obj.details) {
      this.useDetails(obj.details);
    }
    if (obj.condition) {
      this.useCondition(obj.condition);
    }

    // unfortunately, this resets our move list...
    if (obj.moves) {
      this.moves = Pokemon.updateMoveList(obj.moves);
    }
  }

/**
 * @typedef Move
 *
 *
 * @property {number/boolean} accuracy The move's accuracy, as a percent. 100 or true
 * means they will always connect, unless affected by something else.
 * @property {number} basePower  The base power, ex. 80.
 * @property {string} category  'Physical', 'Special', or 'Status'
 * @property {string} id  The move ID, ex. 'acrobatics'
 * @property {string} name  The move name, ex. 'Acrobatics'
 * @property {number} priority  Does this move have priority? Most have the value 0.
 *           Moves with priority 1 will go before moves with priority 0 in
 *           normal cases.
 * @property {Object} flags From the flags Showdown server:
 * @property {boolean} flags.authentic Ignores a target's substitute.
 * @property {boolean} flags.bite Power is multiplied by 1.5 when used by a Pokemon with the Ability Strong Jaw.
 * @property {boolean} flags.bullet Has no effect on Pokemon with the Ability Bulletproof.
 * @property {boolean} flags.charge The user is unable to make a move between turns.
 * @property {boolean} flags.contact Makes contact.
 * @property {boolean} flags.defrost Thaws the user if executed successfully while the user is frozen.
 * @property {boolean} flags.distance Can target a Pokemon positioned anywhere in a Triple Battle.
 * @property {boolean} flags.gravity Prevented from being executed or selected during Gravity's effect.
 * @property {boolean} flags.heal Prevented from being executed or selected during Heal Block's effect.
 * @property {boolean} flags.mirror Can be copied by Mirror Move.
 * @property {boolean} flags.nonsky Prevented from being executed or selected in a Sky Battle.
 * @property {boolean} flags.powder Has no effect on Grass-type Pokemon, Pokemon with the Ability Overcoat, and Pokemon holding Safety Goggles.
 * @property {boolean} flags.protect Blocked by Detect, Protect, Spiky Shield, and if not a Status move, King's Shield.
 * @property {boolean} flags.pulse Power is multiplied by 1.5 when used by a Pokemon with the Ability Mega Launcher.
 * @property {boolean} flags.punch Power is multiplied by 1.2 when used by a Pokemon with the Ability Iron Fist.
 * @property {boolean} flags.recharge If this move is successful, the user must recharge on the following turn and cannot make a move.
 * @property {boolean} flags.reflectable Bounced back to the original user by Magic Coat or the Ability Magic Bounce.
 * @property {boolean} flags.snatch Can be stolen from the original user and instead used by another Pokemon using Snatch.
 * @property {boolean} flags.sound Has no effect on Pokemon with the Ability Soundproof.
 * @property {Object} self  Does this have an effect on myself?
 * @property {Object} self.boosts
 * @property {number} self.def Defense raised or lowered by this # of stages
 * @property {number} self.spe Speed raised or lowered by this # of stages
 * @property {string} self.volatileStatus: 'mustrecharge' from frenzyplant
 * @property {string} volatileStatus  Ex. 'aquaring', 'attract', 'autotomize', 'bide',
 * 'charge', 'confusion', 'curse', 'destinybond', 'disable', 'electrify',
 * 'embargo', 'encore', 'endure', 'flinch', 'focusenergy', 'followme',
 * 'foresight', 'gastroacid', 'grudge', 'healblock', 'helpinghand',
 * 'imprison', 'ingrain', 'kingsshield', 'leechseed', 'lockedmove',
 * 'magiccoat', 'magnetrise', 'minimize', 'miracleeye', 'mustrecharge',
 * 'nightmare', 'partiallytrapped', 'powder', 'powertrick', 'protect',
 * 'rage', 'ragepowder', 'roost' 'smackdown', 'snatch', 'spikyshield',
 * 'stockpile', 'taunt', 'telekinesis', 'torment', 'uproar' 'yawn'
 * @see http://pokemondb.net/move/attract
 * @property {String} target  Ex. 'normal', 'self', 'allySide', 'any', 'randomNormal',
 *         'all', 'allAdjacent', allAdjacentFoes', 'foeSide'
 * @property {String} type  The type of move, ex. 'Ghost'. Every move has one and only
 *       one type.
 */

  /**
   * @TODO maybe we want to turn moves into their own thing...
   *
   * This takes a list of moves, looks them up in our move database and
   * returns some helpful fields about those moves.
   *
   * A move has the following spec:
   *
   * @param  {Array} moves An array of Move objects
   *
   * @return {Array} An array of researched moves.
   */
  static updateMoveList(moves) {
    return moves.map( (move) => {
      // console.log('old:', move);
      const research = util.researchMoveById(move);
      const out = {};
      ['accuracy', 'basePower', 'category', 'id', 'name', 'volatileStatus',
      'priority', 'flags', 'heal', 'self', 'target', 'type', 'pp', 'maxpp'].forEach( (field) => {
        if (research[field]) out[field] = research[field];
      });
      // console.log('returning ', out);
      return out;
    });
  }

  /**
   * Process the 'details' string of a mon. Updates the fields 'species',
   * 'level', and 'gender'.
   *
   * @param  {[type]} details The details, ex. 'Pikachu, L99, F'
   */
  useDetails(details) {
    // this stuff never changes, so we only need to process once.
    if (this.level && this.gender) return;

    if (this.details && this.details !== details) {
      log.warn(`details changed. ${this.details}, ${details}`);
    }

    this.details = details;
    try {
      const deets = details.split(', ');

      // if we're just learning this...that would be weird / impossible.
      if (!this.species) {
        log.warn('weird, learning about species from deets.');
        this.useSpecies(deets[0]);
      }

      this.level = parseInt(deets[1].substr(1), 10);
      this.gender = deets[2] || 'M';
    } catch (e) {
      log.err('useDetails: error parsing mon.details', e);
    }
  }

  /**
   * Record a boost or unboost.
   * The boost object only has keys set for stats that are affected; they
   * should be undefined otherwise.
   *
   * @param  {String} stat  The stat type affected.
   * @param  {Number} stage The stage of boost, ex. Swords Dance boosts attack
   * by 2 stages.
   *
   */
  useBoost(stat, stage) {
    if (!this.boosts) {
      this.boosts = {};
    }
    const current = this.boosts[stat] || 0;
    const next = Math.max(-6, Math.min(6, current + stage));
    if (next === 0) {
      delete this.boosts[stat];
    } else {
      this.boosts[stat] = next;
    }
  }

  /**
   * Add a status condition to our Pokemon. Updates 'condition' and 'conditions'.
   *
   * @param {String} status The status type.
   */
  addStatus(status) {
    if (mon.condition) {
      mon.condition + ' ' + status;
    } else {
      mon.condition = status;
    }

    if (mon.conditions) {
      mon.conditions = [];
    }
    mon.conditions.push(status);
  }

  /**
   * Removes a status condition from our Pokemon. Updates 'condition' and
   * 'conditions'.
   *
   * @param {String} status The status type.
   */
  removeStatus(status) {
    mon.condition.replace(' ' + status, '');
    mon.conditions.splice(mon.conditions.indexOf(status), 1);
  }

  /**
   * Use this species name, and research this species to get basic information
   * about this species.
   *
   * @param  {String} spec The species name, ex. 'Pikachu'
   */
  useSpecies(spec) {
    const key = util.toId(spec);
    this.species = key;

    // lol also dangerous
    Object.assign(this, util.researchPokemonById(key));
  }

  /**
   * Use the condition of the Pokemon. This will update the fields 'condition',
   * 'conditions', 'hp', 'maxhp', 'hppct', and 'dead'.
   *
   * @param  {String} condition The mon's condition, ex. '58/130 par poi'
   */
  useCondition(condition) {
    // sometimes this is escaped, like when it comes from replay files
    condition = condition.replace('\\/', '/'); // eslint-disable-line

    if (!condition.match(/[0-9]+[\/\s]+\w/)) {
      log.error('malformed condition:', condition);
      return;
    }
    this.condition = condition;
    this.conditions = [];

    try {
      const hps = condition.split('/');
      if (hps.length === 2) {
        this.hp = parseInt(hps[0], 10);
        const maxhpAndConditions = hps[1].split(' ');
        this.maxhp = parseInt(maxhpAndConditions[0], 10);
        this.hppct = Math.round(100 * this.hp / this.maxhp);

        if (maxhpAndConditions.length > 1) {
          this.conditions = maxhpAndConditions.slice(1);
        }
      } else if (condition === '0 fnt') {
        this.dead = true;
        this.hp = 0;
        this.hppct = 0;
      } else {
        log.err('weird condition:', mon.condition);
      }
    } catch (e) {
      log.err('useCondition: error parsing mon.condition', e);
    }
  }

  setItem(item) {
    this.item = util.toId(item);
  }
}
