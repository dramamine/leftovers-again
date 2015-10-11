
import util from '../util';
import log from '../log';

export default class Pokemon {
  constructor(species) {
    this.events = [];
    this.useSpecies(species);
  }

  data() {
    // return only what's necessary
    const out = {};
    ['dead', 'condition', 'conditions', 'id', 'species', 'moves', 'level',
    'gender', 'hp', 'maxhp', 'hppct', 'active', 'events', 'types', 'baseStats',
    'ability', 'abilities', 'weightkg', 'nature',
    'position', 'owner' // for debugging
    ]
    .forEach( (field) => {
      if (this[field]) out[field] = this[field];
    });
    return out;
    // if(this.dead) out.dead = this.dead;
  }

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

  saveEvent(evt) {
    this.events.push(evt);
  }

  // for active moves
  static updateMoveList(moves) {
    return moves.map( (move) => {
      // console.log('old:', move);
      const research = util.researchMoveById(move);
      const out = {};
      ['accuracy', 'basePower', 'category', 'id', 'name', 'isViable',
      'priority', 'flags', 'heal', 'self', 'type'].forEach( (field) => {
        if (research[field]) out[field] = research[field];
      });
      // console.log('returning ', out);
      return out;
    });
  }

  useDetails(details) {
    // do these ever change?
    if (this.details && this.details === details) {
      return;
    }
    if (this.details) {
      log.log('details changed.', this.details, details);
    }

    this.details = details;
    try {
      const deets = details.split(', ');

      // if we're just learning this...
      if (!this.species) {
        this.useSpecies(deets[0]);
      }


      this.level = parseInt(deets[1].substr(1), 10);
      this.gender = deets[2] || 'M';
    } catch (e) {
      log.err('useDetails: error parsing mon.details', e);
    }
  }

  useSpecies(spec) {
    const key = util.toId(spec);
    this.species = key;

    // lol also dangerous
    Object.assign(this, util.researchPokemonById(key));
  }

  useCondition(condition) {
    if (!condition.match(/[0-9]+[\/\s]+\w/)) {
      log.error('malformed condition:', condition);
      return;
    }
    this.condition = condition;
    this.dead = false;
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
        this.maxhp = 0;
        this.hppct = 0;
      } else {
        log.err('weird condition:', mon.condition);
      }
    } catch (e) {
      log.err('useCondition: error parsing mon.condition', e);
    }
  }
}
