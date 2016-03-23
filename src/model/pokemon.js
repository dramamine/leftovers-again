
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
 * @typedef PokemonData
 *
 * Here's all the data you get with Pokemon objects.
 *
 * @property {String} ability  The mon's ability, if known.
 * @property {Object} abilities  A key-value list of abilities the Pokemon might
 *         have. The keys are numbers ('0', '1', etc.) plus the key 'H' for
 *         hidden abilities.
 * @property {Boolean} active  True if this mon is active, undefined otherwise.
 * @property {String} baseAbility  The mon's ability, if known. This will only
 *           be set for Pokemon you control.
 * @property {Object} baseStats  An object with these properties:
 * @property {Number} baseStats.atk: The attack value before boosts, EVs, IVs, etc.
 * @property {Number} baseStats.def: The defense value before boosts, EVs, IVs, etc.
 * @property {Number} baseStats.spa: The special attack value before boosts, EVs, IVs, etc.
 * @property {Number} baseStats.spd: The special defense value before boosts, EVs, IVs, etc.
 * @property {Number} baseStats.spe: The speend value before boosts, EVs, IVs, etc.
 * @property {Object} boosts An object with properties set for boosts and unboosts.
 *           For example, if this mon has cast Swords Dance, you will have
 *           boosts = {atk: 2}. Boost values range from -6 to 6.
 * @property {String} condition  a condition in Showdown format, ex. '100/100 par poi',
 *            '0/100 fnt' etc.
 * @property {boolean} dead  True if the mon is dead, undefined otherwise
 * @property {Array<Object>} events  Not currently being used. (things that happened to this
 *         mon? things this mon did?)
 * @property id a mon's id, in Showdown format. @TODO does this exist? probs not
 * @property {String} gender  One of 'M', 'F', or undefined/empty(?)
 * @property {Number} hp  The mon's current HP.
 * @property {Number} hppct  The mon's current HP as a percentage of max HP, in case
 *        that's easier to use.
 * @property {Number} level  the level of the mon.
 * @property {Number} maxhp  The mon's max HP. Note that if the 'HP Percentage Mod'
 *        rule is set, this will be 100 for all of your opponent's mons.
 * @property {Array<MoveData>} moves  an array of Moves.
 * @property {String} nature  The mon's nature, ex. 'Jolly'. Usually, you only know
 * this about your own mons.
 * @property {String} owner  The mon's owner, ex. 'p1' or 'p2'
 * @property {String} position  The mon's position, in Showdown format. 'p1a' means
 *           they are in player 1's first active slot; 'p2c' means they are
 *           in player 2's third active slot (in a Triples battle)
 * @property {Array<String>} types  An array of the mon's types, ex. ['Fire', 'Flying']
 * @property {String} species  the species of Pokemon, ex. "Pikachu". This is
 *         the same as {@link PokemonData.id|PokemonData.id}, but more human-readable.
 * @property {Object} stats An object similar to baseStats, but includes calculations
 *           based on EVs, IVs, and level. It does NOT include calculations based
 *           on boosts and unboosts.
 * @property {Array<String>} statuses  an array of status conditions, ex. ['par', 'poi'].
 * @property {Number} weightkg  The mon's weight, in kg.
 *
 * @see Status conditions: https://doc.esdoc.org/github.com/dramamine/leftovers-again/docs/file/src/constants/statuses.js.html
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
    'position', 'owner', 'item', 'boosts', 'lastMove']
    .forEach( (field) => {
      if (this[field]) out[field] = this[field];
    });

    // sometimes we want to apply some boosts.
    if (out.stats) {
      out.boostedStats = {};
      const boosts = out.boosts || {};
      Object.keys(out.stats).forEach( (key) => {
        out.boostedStats[key] = util.boostMultiplier(out.stats[key], boosts[key]);
      });
    }

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
 * @typedef MoveData
 *
 * Here's all the information you get with Move objects.
 *
 *
 * @property {Number|Boolean} accuracy The move's accuracy, as a percent. 100 or true
 * means they will always connect, unless affected by something else.
 * @property {Number} basePower  The base power, ex. 80.
 * @property {String} category  'Physical', 'Special', or 'Status'
 * @property {Object} flags From the flags Showdown server:
 * @property {Boolean} flags.authentic Ignores a target's substitute.
 * @property {Boolean} flags.bite Power is multiplied by 1.5 when used by a Pokemon with the Ability Strong Jaw.
 * @property {Boolean} flags.bullet Has no effect on Pokemon with the Ability Bulletproof.
 * @property {Boolean} flags.charge The user is unable to make a move between turns.
 * @property {Boolean} flags.contact Makes contact.
 * @property {Boolean} flags.defrost Thaws the user if executed successfully while the user is frozen.
 * @property {Boolean} flags.distance Can target a Pokemon positioned anywhere in a Triple Battle.
 * @property {Boolean} flags.gravity Prevented from being executed or selected during Gravity's effect.
 * @property {Boolean} flags.heal Prevented from being executed or selected during Heal Block's effect.
 * @property {Boolean} flags.mirror Can be copied by Mirror Move.
 * @property {Boolean} flags.nonsky Prevented from being executed or selected in a Sky Battle.
 * @property {Boolean} flags.powder Has no effect on Grass-type Pokemon, Pokemon with the Ability Overcoat, and Pokemon holding Safety Goggles.
 * @property {Boolean} flags.protect Blocked by Detect, Protect, Spiky Shield, and if not a Status move, King's Shield.
 * @property {Boolean} flags.pulse Power is multiplied by 1.5 when used by a Pokemon with the Ability Mega Launcher.
 * @property {Boolean} flags.punch Power is multiplied by 1.2 when used by a Pokemon with the Ability Iron Fist.
 * @property {Boolean} flags.recharge If this move is successful, the user must recharge on the following turn and cannot make a move.
 * @property {Boolean} flags.reflectable Bounced back to the original user by Magic Coat or the Ability Magic Bounce.
 * @property {Boolean} flags.snatch Can be stolen from the original user and instead used by another Pokemon using Snatch.
 * @property {Boolean} flags.sound Has no effect on Pokemon with the Ability Soundproof.
 * @property {String} id  The move ID, ex. 'acrobatics'
 * @property {String} name  The move name, ex. 'Acrobatics'
 * @property {Number} priority  Does this move have priority? Most have the value 0.
 *           Moves with priority 1 will go before moves with priority 0 in
 *           normal cases.
 * @property {Object} self  Does this have an effect on myself?
 * @property {Object} self.boosts An object containing boost properties.
 * @property {Number} self.boosts.def Defense raised or lowered by this # of stages
 * @property {Number} self.boosts.spe Speed raised or lowered by this # of stages
 * @property {String} self.volatileStatus: 'mustrecharge' from frenzyplant
 * @property {String} status  If this is a 'Status' type move, this is the status
 * applied to the opponent.
 * @property {String} target  Ex. 'normal', 'self', 'allySide', 'any', 'randomNormal',
 *         'all', 'allAdjacent', allAdjacentFoes', 'foeSide'
 * @property {String} type  The type of move, ex. 'Ghost'. Every move has one and only
 *       one type.
 * @property {String} volatileStatus  Ex. 'aquaring', 'attract', 'autotomize', 'bide',
 * 'charge', 'confusion', 'curse', 'destinybond', 'disable', 'electrify',
 * 'embargo', 'encore', 'endure', 'flinch', 'focusenergy', 'followme',
 * 'foresight', 'gastroacid', 'grudge', 'healblock', 'helpinghand',
 * 'imprison', 'ingrain', 'kingsshield', 'leechseed', 'lockedmove',
 * 'magiccoat', 'magnetrise', 'minimize', 'miracleeye', 'mustrecharge',
 * 'nightmare', 'partiallytrapped', 'powder', 'powertrick', 'protect',
 * 'rage', 'ragepowder', 'roost' 'smackdown', 'snatch', 'spikyshield',
 * 'stockpile', 'taunt', 'telekinesis', 'torment', 'uproar' 'yawn'
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
      if (deets[1]) {
        this.level = parseInt(deets[1].substr(1), 10);
      }
      this.gender = deets[2] || 'M';
    } catch (e) {
      log.err('useDetails: error parsing mon.details: ' + details);
      log.err(e);
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
    if (this.condition) {
      this.condition + ' ' + status;
    } else {
      this.condition = status;
    }

    if (this.conditions) {
      this.conditions = [];
    }
    this.conditions.push(status);
  }

  /**
   * Removes a status condition from our Pokemon. Updates 'condition' and
   * 'conditions'.
   *
   * @param {String} status The status type.
   */
  removeStatus(status) {
    this.condition.replace(' ' + status, '');
    this.conditions.splice(this.conditions.indexOf(status), 1);
  }

  setLastMove(move) {
    this.lastMove = move;
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
