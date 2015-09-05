import botcfg from './botcfg';

class Battle {
  constructor() {
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
    this.state = {};

    // this.state.activemon = () => {
    //   return this.state.side.pokemon.filter( (mon) => {
    //     return mon.active;
    //   });
    // }();

    const AI = require(botcfg.file);
    this.bot = new AI();
    // listener.subscribe('title', saveTitle);
    // listener.subscribe('request', onRequest);
  }

  myBot() {
    return this.bot;
  }

  // saveTitle(args) {
  //   [battleId, title] = args;
  //   battles[battleId].title = title;
  // }
  handle(type, message) {
    switch (type) {
    case 'request':
      this.handleRequest(message);
      break;
    case 'switch':
      break;
    default:
      break;
    }
  }

  handleRequest(json) {
    const data = JSON.parse(json);
    Object.assign(this.state, data);

    // some cleaner methods
    this.state.side.pokemon.map( (mon) => {
      const deets = mon.details.split(', ');
      mon.type = deets[0];
      mon.level = parseInt(deets[1].substr(1), 10);
      mon.gender = deets[2];

      const hps = mon.condition.split('/');
      [mon.hp, mon.maxhp] = hps;
    });

    this.myBot().onRequest(this.state);
  }
}

export default Battle;
