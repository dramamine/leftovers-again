import config from './config';
import connection from './connection';
import BattleStore from './model/battlestore';

import util from './util';
import log from './log';
import {MOVE, SWITCH} from './decisions';


class Battle {
  constructor(bid) {
    // battle ID
    // console.log('battle constructed with id', bid);
    this.bid = bid;
    // what does state look like? WELL. Check out these properties:
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
    this.handlers = {
      '-damage': this.handleDamage,
      // player: this.handlePlayer,
      teampreview: this.handleTeamPreview,
      poke: this.handlePoke,
      switch: this.handleSwitch,
      request: this.handleRequest,
      turn: this.handleTurn,
      start: this.handleStart,
      win: this.handleWin,
      faint: this.handleFaint,
    };

    this.hasStarted = false;

    this.allmon = {};

    // i.e. things we want to preserve when passing state to bots
    this.nonRequestState = {
      // model of the opponent's 6 pokemon
      opponent: [],
      // opponent's currently active pokemon
      activeOpponent: null,

      activeSelf: null
    };


    // ex. p1 or p2. needed for identifying whose pokemon were affected by what
    this.ord = '';


    const AI = require(config.botPath);
    this.bot = new AI();

    this.store = new BattleStore();
  }

  myBot() {
    return this.bot;
  }


  handle(type, message) {
    if (this.handlers[type]) {
      this.handlers[type].apply(this, message);
    }
  }

  handleFaint(ident) {
    this.store.handleDeath(ident);
  }

  // |-damage|p2a: Noivern|188/261|[from] item: Life Orb
  handleDamage(victim, condition, explanation) {
    this.store.handleDamage(victim, condition, explanation);
    const vic = this.allmon[victim];
    if (vic) {
      vic.condition = condition;
      this.processMon(vic);
    } else {
      console.error('handleDamage: didnt have a record of that pokemon!',
        victim, condition, explanation);
      return false;
    }
  }

  // handlePlayer(ordinal, nick, id) { // eslint-disable-line
  //   console.log(ordinal, nick, id);
  //   this.store.setPlayerId(ordinal);
  //   this.store.setPlayerNick(nick);

  //   this.ord = ordinal;
  // }

  handlePoke(ordinal, mon) {
    // if (this.ord = ordinal) return;
    const nameAndGender = mon.split(', ');
    this.processMon({
      ident: ordinal + ': ' + nameAndGender[0],
      owner: ordinal,
      species: nameAndGender[0],
      gender: nameAndGender[1]
    });
  }

  handleTeamPreview() {
    this.decide();
  }

  /**
   * Handles 'switch' messages. These are important because the request doesn't
   * tell us anything about our opponent, so we need to build and maintain a model
   * of the opponent's pokemon.
   *
   * @param  {[type]} message [description]
   * @return {[type]}         [description]
   */
  handleSwitch(ident, details, condition) {
    this.store.setActive(ident, details, condition);
    // p2a: Slurpuff|Slurpuff, L77, M|100/100
    // const [] = message;
    // console.log('handling switch: ', ident, details, condition);
    // create a pokemon object and parse its data
    const parsedMon = this.processMon({
      ident,
      details,
      condition
    });
    // my own pokemon switched
    if (ident.indexOf(this.ord) === 0) {
      // console.log('nm this is my own pokemon');
      this.nonRequestState.activeSelf = parsedMon;
      return false;
    }


    // warning, this might overwrite our opponent
    this.nonRequestState.opponent[ident] = parsedMon;

    this.nonRequestState.activeOpponent = parsedMon;
    // console.log('updated opponent to ', this.nonRequestState.activeOpponent);
  }

  handleRequest(json) {
    const data = JSON.parse(json);

    // this.state = data;


    // console.log(data);

    // if (data.active) {
    //   data.active.forEach( (moveObj) => {
    //     moveObj.moves.forEach( (move) => {
    //       Object.assign(move, util.researchMoveById(move.id));
    //     });
    //   });
    // }

    // console.dir(data);

    // @TODO this is bad, you should wait for a 'start' message instead!
    if (!data.rqid) {
      // this is not a request, just data.
      return false;
    }

    // do what it says.
    if (data.wait) {
      return false;
    }

    this.store.interpretRequest(data);

    if (data.forceSwitch || data.teamPreview) {
      this.decide();
    }

    // some cleaner methods
    // data.side.pokemon.map( (mon) => {
    //   this.processMon( mon );
    // });

    // save my current data
    // this.state = data;

    // if (this.hasStarted) {
    //   this.decide();
    // }
  }

  handleStart() {
    this.hasStarted = true;
  }

  handleTurn(x) {
    // console.log('handling my turn message', x);
    // moving this to turn handler instead of 'request'. not sure if this is
    // a good idea, since now we have to look at request.data to figure out if
    // we should ask the player for a decision, or wait for the turn message.
    this.decide();
  }

  handleWin(x) {
    console.log('WON: ', x);
  }

  decide() {
    // merge all non-request state
    // Object.assign(this.state, this.nonRequestState);
    // console.log('BY STATE:', this.state);

    const currentState = this.store.getState();
    // const move = this.myBot().onRequest(this.state);
    const choice = this.myBot().onRequest(currentState);

    const res = this._formatMessage(this.bid, choice, currentState);
    console.log(res);
    // const msg = `${this.bid}|${choice}|${currentState.rqid}`;
    // if (res !== msg) {
    //   log.error('battle: new formatMessage fn and old one dont match', res, msg);
    //   console.log(res, msg);
    // }
    connection.send( res );
  }


  _formatMessage(bid, choice, state) {
    let verb;
    // if (!Array.isArray(choice)) {
    //   choice = [choice]; // eslint-disable-line
    // }
    if (choice instanceof MOVE) {
      const moveIdx = this.lookupMoveIdx(state.self.active.moves, choice.id);
      verb = '/move ' + (moveIdx + 1);
    } else if (choice instanceof SWITCH) {
      verb = (state.teamPreview)
        ? '/team '
        : '/switch ';
      const monIdx = this.lookupMonIdx(state.self.reserve, choice.id);
      verb = verb + (monIdx + 1);
    }
    return `${bid}|${verb}|${state.rqid}`;
  }

  lookupMoveIdx(moves, idx) {
    if (typeof(idx) === 'number') {
      return idx;
    } else if (typeof(idx) === 'object') {
      return moves.indexOf(idx);
    } else if (typeof(idx) === 'string') {
      return moves.findIndex( (move) => {
        return move.name === idx;
      });
    }
  }

  lookupMonIdx(mons, idx) {
    switch (typeof(idx)) {
    case 'number':
      return idx;
    case 'object':
      return mons.indexOf(idx);
    case 'string':
      return mons.findIndex( (mon) => {
        return mon.species === idx;
      });
    default:
      throw new Exception('not a valid choice!', idx);
    }
  }

  processMon(mon) {
    try {
      mon.owner = mon.ident.split(': ')[0];
    } catch (e) {
      console.error('processMon: weird owner', mon.ident);
    }

    if (mon.details) {
      try {
        const deets = mon.details.split(', ');
        mon.species = deets[0];
        mon.level = parseInt(deets[1].substr(1), 10);
        mon.gender = deets[2] || 'M';
      } catch (e) {
        console.error('processMon: error parsing mon.details', e);
      }
    }


    if (mon.condition) {
      mon.dead = false;
      mon.conditions = [];

      try {
        const hps = mon.condition.split('/');
        if (hps.length === 2) {
          mon.hp = parseInt(hps[0], 10);
          const maxhpAndConditions = hps[1].split(' ');
          mon.maxhp = parseInt(maxhpAndConditions[0], 10);

          if (maxhpAndConditions.length > 1) {
            mon.conditions = maxhpAndConditions.slice(1);
          }
        } else if (mon.condition === '0 fnt') {
          mon.dead = true;
          mon.hp = 0;
          mon.maxhp = 0;
        } else {
          console.error('weird condition:', mon.condition);
        }
      } catch (e) {
        console.error('processMon: error parsing mon.condition', e);
      }
    }

    // ident fuckery. what could go wrong...
    if (mon.ident) {
      mon.ident = mon.ident.replace('p2:', 'p2a:').replace('p1:', 'p1a:');
    }

    const key = util.toId(mon.species);
    Object.assign(mon, util.researchPokemonById(key));

    // this is the part where we sync up with whatever's in storage.
    // upsert
    if (this.allmon[mon.ident]) {
      // if we ever wanted diffs, this would be the spot for 'em.
      // otherwise just take all this processed data and overwrite our model
      Object.assign(this.allmon[mon.ident], mon);
    } else {
      this.allmon[mon.ident] = mon;
    }
    return mon;
  }


}

export default Battle;
