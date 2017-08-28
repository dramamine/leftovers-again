
const util = require('@la/pokeutil');
const log = require('@la/log');

/**
 * Pokemon class, for tracking information and status of each Pokemon.
 */
class Pokemon {
  /**
   * Pokemon constructor.
   * @param  {String} ident  The ident of the Pokemon, ex. 'p1a: Nickname'
   * @param {String} details  The details of the Pokemon, ex. 'Talonflame, L83, M'
   * @return {Pokemon} An instance of the class Pokemon.
   */
  constructor(ident, details) {
    this.useIdent(ident);
    if (details) this.useDetails(details);
    this.prevMoves = [];
    this.seenMoves = [];

    this.research();
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
 * @property {Boolean} canMegaEvo  True if this Pokemon can mega-evolve. This is
 *           set on active Pokemon only, not Pokemon in your reserve.
 * @property {Array} canZMove  Exists if this Pokemon can use a Z-move. This is
 *           set on active Pokemon only, not Pokemon in your reserve. Z-move stuff
 *           is set on the Move itself as well.
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
 * @property {Array<String>} prevMoves  An array containing the move ids for moves
 *           this Pokemon has used. prevMoves[0] is the last used move, and
 *           prevMoves[prevMoves.length-1] is the first move that Pokemon used
 *           when they were out on the field. This array is reset when a Pokemon
 *           switches out.
 * @property {Array<String>} types  An array of the mon's types, ex. ['Fire', 'Flying']
 * @property {Array<String>} seenMoves  An array of moves that we've seen this
 *           Pokemon use. This carries throughout the match. The string is the
 *           move id.
 * @property {String} species  the species of Pokemon, ex. "Pikachu". This is
 *         the same as {@link PokemonData.id|PokemonData.id}, but more human-readable.
 * @property {Object} stats An object similar to baseStats, but includes calculations
 *           based on EVs, IVs, and level. It does NOT include calculations based
 *           on boosts and unboosts.
 * @property {Array<String>} statuses  an array of status conditions, ex. ['par', 'poi'].
 * @property {Number} weightkg  The mon's weight, in kg.
 *
 * @see https://doc.esdoc.org/github.com/dramamine/leftovers-again/docs/file/src/constants/statuses.js.html
 */

  /**
   * Gathers all the data we want to pass on to our bots.
   * @return {Pokemon} an object with just the stuff we want bots to see.
   *
   */
  data() {
    // return only what's necessary
    const out = {};
    ['dead', 'condition', 'statuses', 'id', 'species', 'moves', 'level',
    'gender', 'hp', 'maxhp', 'hppct', 'active', 'events', 'types', 'baseStats',
    'ability', 'abilities', 'baseAbility', 'weightkg', 'nature', 'stats',
    'position', 'owner', 'item', 'boosts', 'prevMoves', 'order', 'nickname',
    'seenMoves']
    .forEach((field) => {
      if (this[field]) out[field] = this[field];
    });

    // sometimes we want to apply some boosts.
    if (out.stats) {
      out.boostedStats = {};
      const boosts = out.boosts || {};
      Object.keys(out.stats).forEach((key) => {
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
 * @property {Boolean} flags.bite Power is multiplied by 1.5 when used by a
 * Pokemon with the Ability Strong Jaw.
 * @property {Boolean} flags.bullet Has no effect on Pokemon with the Ability Bulletproof.
 * @property {Boolean} canZMove True if this move has an available Z-move.
 * @property {Boolean} flags.charge The user is unable to make a move between turns.
 * @property {Boolean} flags.contact Makes contact.
 * @property {Boolean} flags.defrost Thaws the user if executed successfully
 * while the user is frozen.
 * @property {Boolean} flags.distance Can target a Pokemon positioned anywhere
 * in a Triple Battle.
 * @property {Boolean} flags.gravity Prevented from being executed or selected
 * during Gravity's effect.
 * @property {Boolean} flags.heal Prevented from being executed or selected
 * during Heal Block's effect.
 * @property {Boolean} flags.mirror Can be copied by Mirror Move.
 * @property {Boolean} flags.nonsky Prevented from being executed or selected
 * in a Sky Battle.
 * @property {Boolean} flags.powder Has no effect on Grass-type Pokemon, Pokemon
 * with the Ability Overcoat, and Pokemon holding Safety Goggles.
 * @property {Boolean} flags.protect Blocked by Detect, Protect, Spiky Shield,
 * and if not a Status move, King's Shield.
 * @property {Boolean} flags.pulse Power is multiplied by 1.5 when used by a
 * Pokemon with the Ability Mega Launcher.
 * @property {Boolean} flags.punch Power is multiplied by 1.2 when used by a
 * Pokemon with the Ability Iron Fist.
 * @property {Boolean} flags.recharge If this move is successful, the user must
 * recharge on the following turn and cannot make a move.
 * @property {Boolean} flags.reflectable Bounced back to the original user by
 * Magic Coat or the Ability Magic Bounce.
 * @property {Boolean} flags.snatch Can be stolen from the original user and
 * instead used by another Pokemon using Snatch.
 * @property {Boolean} flags.sound Has no effect on Pokemon with the Ability
 * Soundproof.
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
 * @property {String} volatileStatus  A volatile status, if there is one. (ex.
 * 'protect' or 'taunt').
 * @property {MoveData} zMove The Z-move move data.
 *
 * @see Volatile statuses: https://doc.esdoc.org/github.com/dramamine/leftovers-again/docs/file/src/constants/volatileStatuses.js.html
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
    return moves.map((move) => {
      const research = util.researchMoveById(move);
      const out = {};
      ['accuracy', 'basePower', 'category', 'id', 'name', 'volatileStatus',
      'priority', 'flags', 'heal', 'self', 'target', 'type', 'pp', 'maxpp'].forEach((field) => {
        if (research[field]) out[field] = research[field];
      });
      return out;
    });
  }

  /**
   * Process the 'details' string of a mon. Updates the fields 'species',
   * 'level', and 'gender'.
   *
   * @param  {[type]} details The details, ex. 'Pikachu, L99, F'
   * @param  {Boolean} force  True if you want to allow for species/id updates
   */
  useDetails(details, force = false) {
    if (this.details && this.details !== details) {
      log.warn(`details changed. ${this.details}, ${details}`);
    }

    this.details = details;
    try {
      const deets = details.split(', ');
      if (!this.species || force) {
        this.species = deets[0];
        this.id = util.toId(deets[0]);
        this.ident = `${this.owner}: ${this.nickname}`;
      } else if (!this.species) {
        log.warn('pokemon.useDetails: yea, sometimes i call useDetails when this.species is true');
        log.warn('pokemon.useDetails: looks like this:', deets[0], this.species);
      }
      if (deets[1]) {
        const lvlUpdate = parseInt(deets[1].substr(1), 10);
        // sometimes we didnt have a level, so.. dont.
        if (!isNaN(lvlUpdate)) {
          this.level = lvlUpdate;
        }
      }
      this.gender = deets[2] || 'M';
    } catch (e) {
      log.err(`useDetails: error parsing mon.details: ${details}`);
      log.err(e);
    }
  }

  useIdent(ident) {
    this.ident = util.identWithoutPosition(ident); // for convenience
    this.owner = util.identToOwner(ident);
    this.position = util.identToPos(ident);
    this.nickname = ident.substr(ident.indexOf(' ') + 1);
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
   * Add a status condition to our Pokemon. Updates 'condition' and 'statuses'.
   *
   * @param {String} status The status type.
   */
  addStatus(status) {
    if (this.condition) {
      this.condition += ' ' + status;
    } else {
      this.condition = status;
    }

    if (this.statuses) {
      this.statuses = [];
    }
    this.statuses.push(status);
  }

  /**
   * Removes a status condition from our Pokemon. Updates 'condition' and
   * 'statuses'.
   *
   * @param {String} status The status type.
   */
  removeStatus(status) {
    this.condition.replace(' ' + status, '');
    this.statuses.splice(this.statuses.indexOf(status), 1);
  }

  /**
   * Record that we saw this Pokemon perform a move. Updates prevMoves and
   * seenMoves.
   *
   * @param  {String} move The move id of the performed move.
   */
  recordMove(move) {
    const id = util.toId(move);
    this.prevMoves.unshift(id);
    // could use a Set here, but let's keep it simple.
    if (this.seenMoves.indexOf(id) === -1) {
      this.seenMoves.push(id);
    }
  }

  /**
   * Use this species name, and research this species to get basic information
   * about this species.
   *
   * @param  {String} spec The species name, ex. 'Pikachu'
   */
  research() {
    Object.assign(this, util.researchPokemonById(this.species));
  }

  /**
   * Use the condition of the Pokemon. This will update the fields 'condition',
   * 'statuses', 'hp', 'maxhp', 'hppct', and 'dead'.
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
    this.statuses = this.statuses || [];

    try {
      const hps = condition.split('/');
      if (hps.length === 2) {
        this.hp = parseInt(hps[0], 10);
        if (isNaN(this.hp)) {
          log.error('bailing out, hp wasnt a number');
          log.error('condition: ' + condition);
          log.error('hp:' + hps[0]);
          process.exit();
        }
        // array with max hp at 0 and other stuff at 1+
        const maxHpAndStatuses = hps[1].split(' ');
        this.maxhp = parseInt(maxHpAndStatuses[0], 10);
        this.hppct = Math.round(100 * this.hp / this.maxhp);

        if (maxHpAndStatuses.length > 1) {
          this.statuses = maxHpAndStatuses.slice(1);
        }

        if (this.dead) this.dead = false; // uh oh.
      } else if (condition === '0 fnt') {
        this.dead = true;
        this.hp = 0;
        this.hppct = 0;
        this.active = false;
      } else {
        log.err('weird condition:' + condition);
      }
    } catch (e) {
      log.err('useCondition: error parsing mon.condition', e);
    }
  }

  setItem(item) {
    this.item = util.toId(item);
  }

  setOrder(order) {
    this.order = order;
  }
}

module.exports = Pokemon;
