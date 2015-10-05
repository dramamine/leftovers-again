
import util from './util';


export default class Pokemon {
  constructor(ident) {
    this.state = {
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
      console.log('any new move data here? ', move);
      Object.assign(move, util.researchMoveById(move.id));
    });
  }

  useDetails(details) {
    // do these ever change?
    if (this.state.details && this.state.details === details) {
      return;
    }
    console.log('details changed.', this.state.details, details);
    this.state.details = details;
    try {
      const deets = details.split(', ');
      this.state.species = deets[0];

      // if we're just learning this...
      const key = util.toId(this.state.species);
      Object.assign(this.state, util.researchPokemonById(key));


      this.state.level = parseInt(deets[1].substr(1), 10);
      this.state.gender = deets[2] || 'M';
    } catch (e) {
      console.error('useDetails: error parsing mon.details', e);
    }
  }

  useIdent(ident) {
    const id = this._identToId(ident);
    this.state.id = id;
    try {
      this.state.owner = id.split(': ')[0];
    } catch (e) {
      console.error('useIdent: weird owner', ident);
    }
  }

  useCondition(condition) {
    this.state.condition = condition;
    this.state.dead = false;
    this.state.conditions = [];

    try {
      const hps = condition.split('/');
      if (hps.length === 2) {
        this.state.hp = parseInt(hps[0], 10);
        const maxhpAndConditions = hps[1].split(' ');
        this.state.maxhp = parseInt(maxhpAndConditions[0], 10);

        if (maxhpAndConditions.length > 1) {
          this.state.conditions = maxhpAndConditions.slice(1);
        }
      } else if (condition === '0 fnt') {
        this.state.dead = true;
        this.state.hp = 0;
        this.state.maxhp = 0;
      } else {
        console.error('weird condition:', mon.condition);
      }
    } catch (e) {
      console.error('useCondition: error parsing mon.condition', e);
    }
  }

  _identToId(ident) {
    return ident.replace('a: ', ': ');
  }
}
