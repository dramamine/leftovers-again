
import util from '../util';
import log from '../log';

export default class Pokemon {
  constructor(ident) {
    // this.state = {
    //   events: []
    // };
    this.events = [];
    this.useIdent(ident);
  }

  data() {
    // return only what's necessary
    const out = {};
    ['dead', 'condition', 'conditions', 'id', 'species', 'moves', 'level',
    'gender', 'hp', 'maxhp', 'hppct', 'active'].forEach( (field) => {
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
      this.updateInactiveMoveList(obj.moves);
    }
  }

  saveEvent(evt) {
    this.events.push(evt);
  }

  // for inactive moves
  updateInactiveMoveList(moves) {
    const moveList = [];
    moves.forEach( (move) => {
      moveList.push(util.researchMoveById(move));
    });
    this.moves = moveList;
  }
  // for active moves
  updateMoveList(moves) {
    moves.forEach( (move) => {
      log.debug('any new move data here? ', move);
      Object.assign(move, util.researchMoveById(move.id));
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

  useIdent(ident) {
    if (!ident.match(/: /)) {
      log.error('malformed ident:', ident);
      return;
    }
    const id = this._identToId(ident);
    this.id = id;
    try {
      const split = id.split(': ');
      this.owner = split[0];
      this.useSpecies(split[1]);
    } catch (e) {
      log.err('useIdent: weird owner', ident, e);
    }
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

  _identToId(ident) {
    return ident.replace('a: ', ': ');
  }
}
