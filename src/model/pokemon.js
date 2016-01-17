
import util from '../util';
import log from '../log';

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
   * Gathers all the data we want to pass on to our bots.
   * @return {Object} an object which may have these properties:
   * dead: {Boolean} true if the mon is dead, undefined otherwise
   * condition: {String} a condition in Showdown format, ex. '100/100 par poi',
   *            '0/100 fnt' etc.
   * conditions: {Array} an array of conditions, ex. ['par', 'poi'], in case
   *             that's easier to use.
   * id: a mon's id, in Showdown format. @TODO does this exist? probs not
   * species: {String} the species of Pokemon, ex. "Pikachu".
   * moves: {Array} an array of {Moves}.
   * level: {Number} the level of the mon.
   * gender: {String} One of 'M', 'F', or undefined/empty(?)
   * hp: {Number} The mon's current HP.
   * maxhp: {Number} The mon's max HP. Note that if the 'HP Percentage Mod'
   *        rule is set, this will be 100 for all of your opponent's mons.
   * hppct: {Number} The mon's current HP as a percentage of max HP, in case
   *        that's easier to use.
   * active: {Boolean} True if this mon is active, undefined otherwise.
   * events: {Array} Not currently being used. (things that happened to this
   *         mon? things this mon did?)
   * types: {Array} An array of the mon's types, ex. ['Fire', 'Flying']
   * baseStats: {Object} An object with these properties:
   *   atk: {Number} The attack value before boosts, EVs, IVs, etc.
   *   def: {Number} The defense value before boosts, EVs, IVs, etc.
   *   spa: {Number} The special attack value before boosts, EVs, IVs, etc.
   *   spd: {Number} The special defense value before boosts, EVs, IVs, etc.
   *   spe: {Number} The speend value before boosts, EVs, IVs, etc.
   * ability: {String} The mon's ability (?)
   * abilities: {Array} An array of abilities this mon might have (?)
   * baseAbility: {String} The mon's ability (?)
   * weightkg: {Number} The mon's weight, in kg.
   * nature: {String} The mon's nature, ex. 'Jolly'. Usually, you only know
   * this about your own mons.
   * position: {String} The mon's position, in Showdown format. 'p1a' means
   *           they are in player 1's first active slot; 'p2c' means they are
   *           in player 2's third active slot (in a Triples battle)
   * owner: {String} The mon's owner, ex. 'p1' or 'p2'
   *
   * @references Moves
   */
  data() {
    // return only what's necessary
    const out = {};
    ['dead', 'condition', 'conditions', 'id', 'species', 'moves', 'level',
    'gender', 'hp', 'maxhp', 'hppct', 'active', 'events', 'types', 'baseStats',
    'ability', 'abilities', 'baseAbility', 'weightkg', 'nature', 'stats',
    'position', 'owner' // for debugging
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
   * For active moves(?)
   * @TODO maybe we want to turn moves into their own thing...
   *
   * This takes a list of moves, looks them up in our move database and
   * returns some helpful fields about those moves.
   *
   * A move has the following spec:
   * accuracy: {Number/Boolean} The move's accuracy, as a percent. 100 or true
   *           means they will always connect, unless affected by something
   *           else.
   * basePower: {Number} The base power, ex. 80.
   * category: {String} 'Physical', 'Special', or 'Status'
   * id: {String} The move ID, ex. 'acrobatics'
   * name: {String} The move name, ex. 'Acrobatics'
   * priority: {Number} Does this move have priority? Most have the value 0.
   *           Moves with priority 1 will go before moves with priority 0 in
   *           normal cases.
   * flags: From the Showdown server:
   *   authentic: Ignores a target's substitute.
   *   bite: Power is multiplied by 1.5 when used by a Pokemon with the Ability Strong Jaw.
   *   bullet: Has no effect on Pokemon with the Ability Bulletproof.
   *   charge: The user is unable to make a move between turns.
   *   contact: Makes contact.
   *   defrost: Thaws the user if executed successfully while the user is frozen.
   *   distance: Can target a Pokemon positioned anywhere in a Triple Battle.
   *   gravity: Prevented from being executed or selected during Gravity's effect.
   *   heal: Prevented from being executed or selected during Heal Block's effect.
   *   mirror: Can be copied by Mirror Move.
   *   nonsky: Prevented from being executed or selected in a Sky Battle.
   *   powder: Has no effect on Grass-type Pokemon, Pokemon with the Ability Overcoat, and Pokemon holding Safety Goggles.
   *   protect: Blocked by Detect, Protect, Spiky Shield, and if not a Status move, King's Shield.
   *   pulse: Power is multiplied by 1.5 when used by a Pokemon with the Ability Mega Launcher.
   *   punch: Power is multiplied by 1.2 when used by a Pokemon with the Ability Iron Fist.
   *   recharge: If this move is successful, the user must recharge on the following turn and cannot make a move.
   *   reflectable: Bounced back to the original user by Magic Coat or the Ability Magic Bounce.
   *   snatch: Can be stolen from the original user and instead used by another Pokemon using Snatch.
   *   sound: Has no effect on Pokemon with the Ability Soundproof.
   * self: {Object} Does this have an effect on myself? Example values:
   *   boosts:
   *     def: 1  Lowers my defense by one stage.
   *     spe: -1 Lowers my speed by one stage.
   *     volatileStatus: 'mustrecharge' from frenzyplant
   * volatileStatus: {String} ex. 'aquaring', 'attract', 'autotomize', 'bide',
   * 'charge', 'confusion', 'curse', 'destinybond', 'disable', 'electrify',
   * 'embargo', 'encore', 'endure', 'flinch', 'focusenergy', 'followme',
   * 'foresight', 'gastroacid', 'grudge', 'healblock', 'helpinghand',
   * 'imprison', 'ingrain', 'kingsshield', 'leechseed', 'lockedmove',
   * 'magiccoat', 'magnetrise', 'minimize', 'miracleeye', 'mustrecharge',
   * 'nightmare', 'partiallytrapped', 'powder', 'powertrick', 'protect',
   * 'rage', 'ragepowder', 'roost' 'smackdown', 'snatch', 'spikyshield',
   * 'stockpile', 'taunt', 'telekinesis', 'torment', 'uproar' 'yawn'
   * target: {String} ex. 'normal', 'self', 'allySide', 'any', 'randomNormal',
   *         'all', 'allAdjacent', allAdjacentFoes', 'foeSide'
   * type: {String} The type of move, ex. 'Ghost'. Every move has one and only
   *       one type.
   *
   * @param  {Array} moves An array of {Move} objects
   * @return {Array} An array of researched moves.
   */
  static updateMoveList(moves) {
    return moves.map( (move) => {
      // console.log('old:', move);
      const research = util.researchMoveById(move);
      const out = {};
      ['accuracy', 'basePower', 'category', 'id', 'name', 'volatileStatus',
      'priority', 'flags', 'heal', 'self', 'target', 'type'].forEach( (field) => {
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

    if (this.details !== details) {
      log.warn('details changed.', this.details, details);
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
}
