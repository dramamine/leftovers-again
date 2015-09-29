import config from './config';
import connection from './connection';

class Battle {
  constructor(bid) {
    // battle ID
    console.log('battle constructed with id', bid);
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
      player: this.handlePlayer,
      switch: this.handleSwitch,
      request: this.handleRequest,
    };

    this.allmon = {};

    // model of the opponent's 6 pokemon
    this.opponent = [];

    // opponent's currently active pokemon
    this.activeOpponent = null;

    // ex. p1 or p2. needed for identifying whose pokemon were affected by what
    this.ord = '';


    const AI = require(config.botPath);
    this.bot = new AI();
  }

  myBot() {
    return this.bot;
  }


  handle(type, message) {
    if (this.handlers[type]) {
      this.handlers[type].apply(this, message);
    }
  }

  // |-damage|p2a: Noivern|188/261|[from] item: Life Orb
  handleDamage(victim, condition, explanation) {
    const vic = this.allmon[victim];
    if (vic) {
      const oldHp = vic.hp;
      const oldCondition = vic.condition;
      vic.condition = condition;

      const processed = this.processMon(vic);

      processed.events.push({
        type: 'damage',
        hplost: oldHp - processed.hp,
        explanation,
        from: oldCondition,
        to: condition
      });
    } else {
      console.error('handleDamage: didnt have a record of that pokemon!',
        victim, condition, explanation);
      return false;
    }
  }

  handlePlayer(ordinal, nick, id) { // eslint-disable-line
    this.ord = ordinal;
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
    // p2a: Slurpuff|Slurpuff, L77, M|100/100
    // const [] = message;

    // my own pokemon switched
    if (ident.indexOf(this.ord) === 0) {
      console.log('nm this is my own pokemon');
      return false;
    }

    // create a pokemon object and parse its data
    const parsedMon = this.processMon({
      ident,
      details,
      condition
    });

    // warning, this might overwrite our opponent
    this.opponent[ident] = parsedMon;

    this.activeOpponent = parsedMon;
    console.log('updated opponent to ', this.activeOpponent);
  }

  handleRequest(json) {
    const data = JSON.parse(json);
    // this.state = data;
    data.opponent = this.opponent;

    console.dir(data);

    // @TODO this is bad, you should wait for a 'start' message instead!
    if (!data.rqid) {
      // this is not a request, just data.
      return false;
    }

    // do what it says.
    if (data.wait) {
      return false;
    }

    // some cleaner methods
    data.side.pokemon.map( (mon) => {
      this.processMon( mon );
    });

    // save my current data
    this.state = data;
    const move = this.myBot().onRequest(data);
    const msg = `${this.bid}|${move}|${data.rqid}`;
    connection.send( msg );
  }


  processMon(mon) {
    try {
      mon.owner = mon.ident.split(': ')[0];
    } catch (e) {
      console.error('processMon: weird owner', mon.ident);
    }

    try {
      const deets = mon.details.split(', ');
      mon.species = deets[0];
      mon.level = parseInt(deets[1].substr(1), 10);
      mon.gender = deets[2] || 'M';
    } catch (e) {
      console.error('processMon: error parsing mon.details', e);
    }

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

    // this is the part where we sync up with whatever's in storage.
    // upsert
    if (this.allmon[mon.ident]) {
      // if we ever wanted diffs, this would be the spot for 'em.
      // otherwise just take all this processed data and overwrite our model
      Object.assign(this.allmon[mon.ident], mon);
    } else {
      mon.events = [];
      this.allmon[mon.ident] = mon;
    }
    return mon;
  }


}

export default Battle;
