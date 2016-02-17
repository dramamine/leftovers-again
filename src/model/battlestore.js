import Pokemon from 'model/pokemon';
import util from 'pokeutil';
import Log from 'log';
import Weather from 'constants/weather';

/**
 * Store for tracking the status of the battle.
 *
 */
export default class BattleStore {
  constructor() {
    // The array of all Pokemons involved in the battle.
    this.allmon = [];
    this.forceSwitch = false;
    this.teamPreview = false;

    this.myId = null;

    this.lastmove = null;
    this.events = [];
    this.statuses = [];
    this.turn = 0;
    this.weather = Weather.NONE;

    this.handlers = {
      '-damage': this.handleDamage,
      teampreview: this.handleTeamPreview,
      move: this.handleMove,
      switch: this.handleSwitch,
      drag: this.handleSwitch,
      request: this.handleRequest,
      turn: this.handleTurn,
      faint: this.handleFaint,
      heal: this.handleHeal,
      player: this.handlePlayer,
      cant: this.handleCant,
      '-fail': this.handleFail,
      '-miss': this.handleMiss,
      '-boost': this.handleBoost,
      '-unboost': this.handleUnboost,
      '-status': this.handleStatus,
      '-curestatus': this.handleCureStatus,
      '-weather': this.handleWeather
      // @TODO why don't we track field effects??
      // @TODO rocks, weather, etc.
      // |-sidestart|p1: 5nowden4189|move: Stealth Rock
      // '-sidestart': this.handleSideStart,
      // '-sideend': this.handleSideEnd
    };

    // NOT sent to user. temporary storage.
    this.names = {};
  }

  /**
   * Instead of listening directly to server messages, we instantiate a
   * BattleStore elsewhere and have whatever created this Store pass messages
   * along to this. This design is probably bad, but I did this so that we
   * can have one BattleStore associated with each Battle ID, and the
   * class instantiating BattleStore is responsible for routing battle
   * messages to the correct BattleStore.
   *
   * @param  {String} type    The message type.
   * @param  {Array} message  The parameters for that message.
   */
  handle(type, message) {
    if (this.handlers[type]) {
      this.handlers[type].apply(this, message);
    }
  }


  handleSwitch(ident, details, condition) {
    const pos = this._identToPos(ident);
    const former = this._findByPos(pos);
    const mon = this._recordIdent(ident);

    mon.useCondition(condition);
    mon.useDetails(details);

    this.events.push({
      type: 'switch',
      player: this._identToOwner(ident),
      turn: this.turn,
      from: former ? former.species : null,
      frompos: mon.position,
      to: mon.species,
      topos: mon.position,
      condition: condition.replace('\\/', '/')
    });
  }

  /**
   * Handles a move that happened.
   *
   * Moves have updated information in the form of idents, so let's record
   * those here.
   *
   * We also record the move that happened in the events array in case anyone
   * wants to use them.
   *
   * @param  {String} actor The ident of the Pokemon who made a move.
   * @param  {String} move  The name of the move, ex. 'Stealth Rock'
   * @param  {[type]} target [description]
   * @return {[type]}        [description]
   */
  handleMove(actor, move, target) {
    const actingMon = this._recordIdent(actor);
    const targetMon = this._recordIdent(target);
    this.events.push({
      type: 'move',
      player: this._identToOwner(actor),
      turn: this.turn,
      from: actingMon.species,
      frompos: actingMon.position,
      move: move,
      to: targetMon.species,
      topos: targetMon.position
    });

    actingMon.setLastMove(move);
  }

  handleCant(target, reason) {
    if (['slp', 'par', 'flinch'].indexOf(reason) === -1) {
      Log.error(`can't! ${target} ${reason}`);
    }
    const targetMon = this._recordIdent(target);
    this.events.push({
      type: 'cant',
      turn: this.turn,
      player: this._identToOwner(target),
      from: targetMon.species,
      frompos: targetMon.position,
      reason
    });
  }

  handleMiss(actor, target) {
    const lastmove = this.events[this.events.length - 1];
    lastmove.miss = true;
  }

  handleFail(target) {
    const lastmove = this.events[this.events.length - 1];
    lastmove.miss = true;
  }

  handleBoost(target, stat, stage) {
    const mon = this._recordIdent(target);
    mon.useBoost(stat, stage);
  }

  handleUnboost(target, stat, stage) {
    this.handleBoost(target, stat, -1 * stage);
  }

  handleStatus(target, status) {
    const mon = this._recordIdent(target);
    mon.addStatus(status);
  }

  handleCureStatus(target, status) {
    const mon = this._recordIdent(target);
    mon.removeStatus(status);
  }

  handleDamage(target, condition, explanation) {
    const mon = this._recordIdent(target);

    let move;
    // @TODO lazy implementation
    if (explanation) {
      move = {
        type: 'damage',
        turn: this.turn,
        from: explanation,
        topos: mon.position
      };
      this.events.push(move);
    } else {
      move = this.events[this.events.length - 1];
    }

    move.prevhp = mon.hp;
    move.prevcondition = mon.condition;

    mon.useCondition(condition);

    move.nexthp = mon.hp;
    move.nextcondition = mon.condition;
    if (mon.dead) {
      move.killed = true;
    }
    move.damage = move.prevhp - move.nexthp;
    move.damagepct = Math.round(100 * move.damage / mon.maxhp);

    if (mon.maxhp !== 100 && move.damage > 20) {
      // console.log(move.damage, target, condition, explanation);
      Log.toFile('damagerangetest', move.damage + ',');
    }

    if (explanation && explanation.indexOf('[from] item:') >= 0) {
      const item = explanation.replace('[from] item: ', '');
      mon.setItem(item);
    }
  }

  handleFaint(ident) {
    const mon = this._recordIdent(ident);
    mon.useCondition('0 fnt');
  }

  // @TODO this is pretty much thte same as the damage function
  handleHeal(target, condition, explanation) {
    const mon = this._recordIdent(target);
    mon.useCondition(condition);
    if (!mon.item && explanation &&
      explanation.indexOf('[from] item:') >= 0) {
      const item = explanation.replace('[from] item: ', '');
      mon.setItem(item);
    }
  }

  handlePlayer(id, name, something) { //eslint-disable-line
    this.names[id] = name;
  }

  /**
   * Handles the turn message, i.e. what turn it is.
   *
   * We only use this for tracking 'what happened on what turn'.
   *
   * When we get this message, we also record the status of each active
   * Pokemon, in our statuses array.
   *
   * @param  {[type]} x [description]
   * @return {[type]}   [description]
   */
  handleTurn(x) {
    this.turn = parseInt(x, 10);

    const isactive = (mon) => { return !mon.dead && (!!mon.position || mon.active); };
    this.allmon.filter(isactive).forEach( mon => {
      this.statuses.push({
        turn: this.turn,
        position: mon.position,
        condition: mon.condition,
        species: mon.species
        // boosts: mon.boosts || null
      });
    });
  }

  /**
   * Handles an incoming request. The one parameter to this is a string of
   * JSON, known as the request.
   *
   *  what does the request look like? WELL. Check out these properties:
   *  'rqid': the request ID. ex. '1' for the first turn, '2' for the second, etc.
   *          These don't match up perfectly with turns bc you may have to swap
   *          out pokemon if one dies, etc.
   *   'side':
   *     'name': your name
   *     'id': either 'p1' or 'p2'
   *     'pokemon': [Pokemon]      (6 of them. they're the pokemon on yr side)
   *   'active':
   *     'moves': [Move]           (the 4 moves of your active pokemon)
   *
   *    Move is an object with these properties:
   *    'move': the move name (ex.'Fake Out')
   *    'id': the move ID (ex. 'fakeout')
   *    'pp': how many PP you currently have
   *    'maxpp': the max PP for this move
   *    'target': target in options (ex. 'normal')
   *    'disabled': boolean for whether this move can be used.
   *
   *    Pokemon look like this:
   *    'ident': ex. 'p1: Wormadam'
   *    'details': ex. 'Wormadam, L83, F'
   *    'condition': ex. '255/255'
   *    'hp': current HP
   *    'maxhp': maximum HP
   *    'active': boolean, true if pokemon is currently active
   *    'stats':
   *      'atk': attack
   *      'def': defense
   *      'spa': special attack
   *      'spd': special defense
   *      'spe': speed
   *    'moves': Array of move IDs
   *    'baseAbility': the ability of the Pokemon (ex. 'overcoat')
   *    'item' the Pokemon's held item (ex. 'leftovers')
   *    'pokeball': what kind of pokeball the Pokemon was caught with
   *    'canMegaEvo': Boolean for whether this Pokemon can mega-evolve
   *
   * With most of this information, we may know the things already, ex. we
   * know if a Pokemon took damage or not. However there are lots of ways we
   * would get out of sync if we didn't accept and process all of this
   * information. So we do that.
   *
   * You'll notice the request does not contain information about the
   * opponent! It's left as an exercise to US to keep track of the opponent's
   * state.
   *
   * @param {String} json The string of JSON which makes up the request.
   *
   */
  handleRequest(json) {
    const data = JSON.parse(json);
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

  handleWeather(weather) {
    this.weather = weather;
  }

  /**
   * Output function for getting an object representation of the current
   * battle.
   *
   * This is usually called right after 'handleRequest', because requests
   * usually mean we're trying to get the battle's state and make some
   * decisions based on it.
   *
   * This function has NO EFFECT on the store's internal state; this is
   * important for consistency!
   *
   * @return {Object} An object representing the battle's current state. See
   * the documentation in AI for a detailed description.
   *
   * @relation AI
   */
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

    // this was causing some errors before. could use some more research...
    // @TODO why aren't we clearing out activeData?
    if (this.activeData && output.self.active.length === this.activeData.length) {
      for (let i = 0; i < this.activeData.length; i++) {
        const movesArr = this.activeData[i].moves;
        const updated = movesArr.map( (move) => { // eslint-disable-line
          return Object.assign(move, util.researchMoveById(move.id));
        });
        output.self.active[i].moves = updated;
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
    output.turn = this.turn;
    output.weather = this.weather;

    return output;
  }

  /**
   * Interprets the 'ident' string of a Pokemon. Ident is something that comes
   * attached with nearly all events, and it tells us a lot about the state
   * of that Pokemon - its owner, current position, and species. This is
   * especially helpful in tracking whether a Pokemon is active or not.
   *
   * This function relies on the 'fact' that teams cannot have more than one
   * of the same species of Pokemon. If that's not the case, I will cry.
   *
   * @param  {String} ident The ident string.
   * @return {Pokemon} The Pokemon whose ident we just recorded.
   */
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

  /**
   * Find a Pokemon by its ID, ex. 'p2a: Pikachu'
   *
   * @param  {String} id The Pokemon ID.
   * @return {Pokemon} The Pokemon object.
   */
  _findById(id) {
    return this.allmon.find( (mon) => { return mon.id === id; });
  }

  /**
   * Find a Pokemon by its position, ex. 'p2a'
   * @param  {String} pos The position of the Pokemon.
   * @return {Pokemon} The Pokemon object.
   */
  _findByPos(pos) {
    return this.allmon.find( (mon) => { return mon.position === pos; });
  }

  /**
   * Get the position from the 'ident'.
   * @param  {String} ident The Pokemon ident.
   * @return {String} The position.
   */
  _identToPos(ident) {
    const posStr = ident.substr(0, ident.indexOf(':'));
    const position = (posStr.length === 3) ? posStr : null;
    return position;
  }

  /**
   * Get the owner from the 'ident'.
   * @param  {String} ident The Pokemon ident.
   * @return {String} The owner.
   */
  _identToOwner(ident) {
    return ident.substr(0, 2);
  }

  /**
   * Returns your nickname.
   * @return {String} Your nickname.
   */
  get myNick() {
    return this.names[this.myId];
  }

  /**
   * Returns the nickname of your opponent.
   * @return {String} Opponent's nickname.
   */
  get yourNick() {
    if (this.myId === 'p1') return this.names.p2;
    if (this.myId === 'p2') return this.names.p1;
    return null;
  }

}
