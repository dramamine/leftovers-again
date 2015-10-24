import Pokemon from './pokemon';
import util from '../util';
// import log from '../log';


export default class BattleStore {
  constructor() {
    this.allmon = [];
    this.forceSwitch = false;
    this.teamPreview = false;

    this.myId = null;

    this.lastmove = null;
    this.events = [];
    this.turn = 0;

    this.handlers = {
      '-damage': this.handleDamage,
      teampreview: this.handleTeamPreview,
      move: this.handleMove,
      switch: this.handleSwitch,
      drag: this.handleSwitch,
      request: this.handleRequest,
      turn: this.handleTurn,
      faint: this.handleFaint,
      player: this.handlePlayer
    };

    // NOT sent to user. temporary storage.
    this.names = {};
  }

  handle(type, message) {
    if (this.handlers[type]) {
      this.handlers[type].apply(this, message);
    }
  }

  handleRequest(json) {
    const data = JSON.parse(json);
    this.interpretRequest(data);
  }

  handleSwitch(ident, details, condition) {
    const pos = this._identToPos(ident);
    const former = this._findByPos(pos);
    const mon = this._recordIdent(ident);

    this.events.push({
      type: 'switch',
      player: this._identToOwner(ident),
      turn: this.turn,
      from: former ? former.species : null,
      to: mon.species,
      condition: condition.replace('\\/', '/')
    });
  }

  handleMove(actor, move, victim) {
    this.events.push({
      type: 'move',
      player: this._identToOwner(actor),
      turn: this.turn,
      from: actor,
      move: move,
      to: victim
    });
  }

  handleDamage(victim, condition, explanation) {
    const mon = this._recordIdent(victim);
    mon.useCondition(condition);
  }

  handleFaint(ident) {
    const mon = this._recordIdent(ident);
    mon.useCondition('0 fnt');
  }

  handlePlayer(id, name, something) { //eslint-disable-line
    this.names[id] = name;
  }

  handleTurn(x) {
    this.turn = x;
  }

  // what does the request look like? WELL. Check out these properties:
  // 'rqid': the request ID. ex. '1' for the first turn, '2' for the second, etc.
  //         These don't match up perfectly with turns bc you may have to swap
  //         out pokemon if one dies, etc.
  //  'side':
  //    'name': your name
  //    'id': either 'p1' or 'p2'
  //    'pokemon': [Pokemon]      (6 of them. they're the pokemon on yr side)
  //  'active':
  //    'moves': [Move]           (the 4 moves of your active pokemon)
  //
  //   Move is an object with these properties:
  //   'move': the move name (ex.'Fake Out')
  //   'id': the move ID (ex. 'fakeout')
  //   'pp': how many PP you currently have
  //   'maxpp': the max PP for this move
  //   'target': target in options (ex. 'normal')
  //   'disabled': boolean for whether this move can be used.
  //
  //   Pokemon look like this:
  //   'ident': ex. 'p1: Wormadam'
  //   'details': ex. 'Wormadam, L83, F'
  //   'condition': ex. '255/255'
  //   'hp': current HP
  //   'maxhp': maximum HP
  //   'active': boolean, true if pokemon is currently active
  //   'stats':
  //     'atk': attack
  //     'def': defense
  //     'spa': special attack
  //     'spd': special defense
  //     'spe': speed
  //   'moves': Array of move IDs
  //   'baseAbility': the ability of the Pokemon (ex. 'overcoat')
  //   'item' the Pokemon's held item (ex. 'leftovers')
  //   'pokeball': what kind of pokeball the Pokemon was caught with
  //   'canMegaEvo': Boolean for whether this Pokemon can mega-evolve
  //
  //
  // data = {};
  interpretRequest(data) {
    // requests are the first place we figure out who we are.
    // -- plato
    if (!this.myId) {
      this.myId = data.side.id;
    }

    if (data.side && data.side.pokemon) {
      for (let i = 0; i < data.side.pokemon.length; i++) {
        const mon = data.side.pokemon[i];
        // if(mon.dead) {
        //   return handleDeath(mon.ident);
        // }
        const ref = this._recordIdent(mon.ident);
        // force this to update, since it's always true or unset.
        ref.active = mon.active || false;
        ref.assimilate(mon);

        // keep our own in the right order
        if (ref.owner === this.myId) {
          ref.order = i;
        }
      }
    }

    // need to know these later. update to false to replace stale info.
    this.forceSwitch = data.forceSwitch || false;
    this.teamPreview = data.teamPreview || false;

    if (data.rqid) {
      this.rqid = data.rqid;
    }

    if (data.active) {
      // process this later.
      this.activeData = data.active;
    }
  }

  data() {
    const output = {
      self: {},
      opponent: {}
    };
    // const output = _.clone(this.state, true);
    const dataGetter = (mon) => { return mon.data(); };
    const iamowner = (mon) => { return mon.owner === this.myId; };
    const youareowner = (mon) => { return mon.owner !== this.myId; };
    const isactive = (mon) => { return !mon.dead && (!!mon.position || mon.active); };
    const byPosition = (a, b) => b.position - a.position;
    const byOrder = (a, b) => a.order - b.order;


    // use getState so we can filter out any crap.
    output.self.active = this.allmon
      .filter(iamowner)
      .filter(isactive)
      .map(dataGetter)
      .sort(byPosition);
    output.opponent.active = this.allmon
      .filter(youareowner)
      .filter(isactive)
      .map(dataGetter)
      .sort(byPosition);
    output.self.reserve = this.allmon
      .filter(iamowner)
      .sort(byOrder)
      .map(dataGetter);
    output.opponent.reserve = this.allmon
      .filter(youareowner)
      .sort(byOrder)
      .map(dataGetter);

    if (output.opponent.active.length > 0 && !output.opponent.active[0].owner) {
      console.log('stop the presses! pokemon with no owner.');
      console.log(output.opponent.active[0]);
      exit();
    }

    if (output.self.active.length > 1) {
      console.log('stop the presses! too many active pokemon');
      console.dir(this.allmon
        .filter(iamowner)
        .filter(isactive));
    }

    if (this.activeData) {
      for (let i = 0; i < this.activeData.length; i++) {
        const movesArr = this.activeData[i].moves;
        const updated = movesArr.map( (move) => { // eslint-disable-line
          return Object.assign(move, util.researchMoveById(move.id));
        });
        try {
          output.self.active[i].moves = updated;
        } catch (e) {
          console.log(e);
          console.log(output.self.active);
          console.log(this.activeData);
        }
      }
    }

    // compress arrays to singles
    if (output.self.active.length === 1) {
      output.self.active = output.self.active[0];
    }
    if (output.opponent.active.length === 1) {
      output.opponent.active = output.opponent.active[0];
    }

    if (this.forceSwitch) output.forceSwitch = true;
    if (this.teamPreview) output.teamPreview = true;


    output.rqid = this.rqid;

    return output;
  }

  // NEW FUNCTION. this is the one I like.
  _recordIdent(ident) {
    const owner = this._identToOwner(ident);
    const position = this._identToPos(ident);
    const species = ident.substr(ident.indexOf(' ') + 1);

    let hello = this.allmon.find( (mon) => {
      // @TODO really shouldn't have to util.toId these things.
      return owner === mon.owner && util.toId(species) === util.toId(mon.species);
    });

    if (!hello) {
      hello = new Pokemon(species);
      this.allmon.push(hello);
    }

    if (position) {
      // update the guy who got replaced
      const goodbye = this.allmon.find( (mon) => {
        return position === mon.position;
      });
      if (goodbye) {
        goodbye.position = null;
        goodbye.active = false;
      }
    }

    hello.position = position;
    hello.owner = owner;
    return hello;
  }

  _findById(id) {
    return this.allmon.find( (mon) => { return mon.id === id; });
  }

  _findByPos(pos) {
    return this.allmon.find( (mon) => { return mon.position === pos; });
  }

  _identToPos(ident) {
    const posStr = ident.substr(0, ident.indexOf(':'));
    const position = (posStr.length === 3) ? posStr : null;
    return position;
  }

  _identToOwner(ident) {
    return ident.substr(0, 2);
  }

  get myNick() {
    return this.names[this.myId];
  }

  get opponentNick() {
    if (this.myId === 'p1') return this.names.p2;
    if (this.myId === 'p2') return this.names.p1;
    return null;
  }

}
