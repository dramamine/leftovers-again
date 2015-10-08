
import util from '../util';
import log from '../log';

export default class Pokemon {
  constructor(ident) {
    this.state = {
      events: []
    };
    this.useIdent(ident);

  }

  getState() {
    return this.state;
  }

  assimilate(obj) {
    Object.assign(this.state, obj);

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
    this.state.events.push(evt);
  }

  // for inactive moves
  updateInactiveMoveList(moves) {
    const moveList = [];
    moves.forEach( (move) => {
      moveList.push(util.researchMoveById(move));
    });
    this.state.moves = moveList;
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
    if (this.state.details && this.state.details === details) {
      return;
    }
    if (this.state.details) {
      log.log('details changed.', this.state.details, details);
    }

    this.state.details = details;
    try {
      const deets = details.split(', ');

      // if we're just learning this...
      if (!this.state.species) {
        this.useSpecies(deets[0]);
      }


      this.state.level = parseInt(deets[1].substr(1), 10);
      this.state.gender = deets[2] || 'M';
    } catch (e) {
      log.err('useDetails: error parsing mon.details', e);
    }
  }

  useSpecies(spec) {
    const key = util.toId(spec);
    this.state.species = key;
    Object.assign(this.state, util.researchPokemonById(key));
  }

  useIdent(ident) {
    if (!ident.match(/: /)) {
      log.error('malformed ident:', ident);
      return;
    }
    const id = this._identToId(ident);
    this.state.id = id;
    try {
      const split = id.split(': ');
      this.state.owner = split[0];
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
    this.state.condition = condition;
    this.state.dead = false;
    this.state.conditions = [];

    try {
      const hps = condition.split('/');
      if (hps.length === 2) {
        this.state.hp = parseInt(hps[0], 10);
        const maxhpAndConditions = hps[1].split(' ');
        this.state.maxhp = parseInt(maxhpAndConditions[0], 10);
        this.state.hppct = Math.round(100 * this.state.hp / this.state.maxhp);

        if (maxhpAndConditions.length > 1) {
          this.state.conditions = maxhpAndConditions.slice(1);
        }
      } else if (condition === '0 fnt') {
        this.state.dead = true;
        this.state.hp = 0;
        this.state.maxhp = 0;
        this.state.hppct = 0;
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
