// import Pokemon from 'model/pokemon';
import Side from 'model/side';
import Barn from 'model/pokebarn';
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

    this.barn = new Barn();

    this.forceSwitch = false;
    this.teamPreview = false;

    this.myId = null;

    this.lastmove = null;
    this.events = [];
    this.statuses = [];
    this.turn = 0;
    this.weather = Weather.NONE;
    this.sides = [];

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
      '-weather': this.handleWeather,
      // @TODO why don't we track field effects??
      // @TODO rocks, weather, etc.
      // |-sidestart|p1: 5nowden4189|move: Stealth Rock
      '-sidestart': this.handleSideStart,
      '-sideend': this.handleSideEnd
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
    const former = this.barn.findByPos(pos);

    const mon = this.barn.findOrCreate(ident);
    mon.position = pos;
    mon.active = true;


    if (former) {
      former.position = null;
      former.order = mon.order;
      former.active = false;

      mon.order = 0; // @TODO better update this for doubles
    }

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
    const actingMon = this.barn.find(actor);
    const targetMon = this.barn.find(target);
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

  /**
   * Handles the cant message.
   *
   * Sometimes we get this because the user chose an invalid option. This is
   * bad and we want to let the user know.
   *
   * Sometimes we get this because the move failed. For this, we just log to
   * events and do nothing. The server sends "reasons" and we keep a list of
   * reasons that we're expecting in the normal course of play.
   *
   * @param  {[type]} target [description]
   * @param  {[type]} reason [description]
   * @return {[type]}        [description]
   */
  handleCant(target, reason) {
    if (['slp', 'par', 'flinch', 'frz', 'Truant'].indexOf(reason) === -1) {
      Log.error(`can't! ${target} ${reason}`);
    } else {
      Log.debug(`got 'cant' msg back from server: ${target} ${reason}`);
    }
    const targetMon = this._findByIdent(target);
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
    const mon = this.barn.find(target);
    mon.useBoost(stat, +stage);
  }

  handleUnboost(target, stat, stage) {
    this.handleBoost(target, stat, -1 * +stage);
  }

  handleStatus(target, status) {
    const mon = this.barn.find(target);
    mon.addStatus(status);
  }

  handleCureStatus(target, status) {
    const mon = this.barn.find(target);
    mon.removeStatus(status);
  }

  handleDamage(target, condition, explanation) {
    const mon = this.barn.find(target);

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
    const mon = this.barn.find(ident);
    if (!mon) {
      Log.error('couldnt find that pokemon' + ident);
      Log.error(JSON.stringify(this.barn.all()));
    }
    mon.useCondition('0 fnt');
  }

  // @TODO this is pretty much thte same as the damage function
  handleHeal(target, condition, explanation) {
    const mon = this.barn.find(target);
    mon.useCondition(condition);
    if (!mon.item && explanation &&
      explanation.indexOf('[from] item:') >= 0) {
      const item = explanation.replace('[from] item: ', '');
      mon.setItem(item);
    }
  }

  /**
   * Saves the name of the player.
   *
   * @param  {String} id        The id of the player, ex. 'p1' or 'p2'
   * @param  {String} name      The name of the player, ex. '5nowden'
   * @param  {[type]} something  ignored
   */
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
   * @param  {Number} x The turn number.
   */
  handleTurn(x) {
    this.turn = parseInt(x, 10);

    const isactive = (mon) => { return !mon.dead && (!!mon.position || mon.active); };
    this.barn.all().filter(isactive).forEach( mon => {
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
   *  what does the request look like? WELL. These properties are all integrated
   *  into the {@link AI} object, so you probably want to look at that instead.
   *  But in case you're wondering what the actual data from the server looks
   *  like, keep reading.
   *
   *  {@link MoveData} objects here are limited and contain only 'move' (the
   *  move name, ex. 'Fake Out', 'id' ex. 'fakeout', 'pp', 'maxpp', 'target',
   *  and 'disabled'.
   *
   * {@link PokemonData} objects are limited and contain only 'ident', 'details',
   * 'condition', 'hp', 'maxhp', 'active', 'stats', 'moves', 'baseAbility',
   * 'item', 'pokeball', and 'canMegaEvo'.
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
   * @param {Array<Object>} json.active  An array containing the moves that
   * your active Pokemon can perform. The size of the array is the number of
   * active Pokemon on your side, ex. in Singles matches, the array length is 1.
   * @param {Array<MoveData>} json.active[].moves            (the 4 moves of your active pokemon)
   * @param {Array<Boolean>}  json.forceSwitch  booleans for each position that
   * needs to switch out. ex. [true] means it's a singles match and your mon
   * needs to switch out. [false, true] means it's a doubles match and your
   * second mon needs to switch out.
   * @param {Boolean} json.noCancel  Moves cannot be cancelled in the interval
   * between sending the move and the server receiving your opponent's move.
   * This is unused.
   * @param {String} json.rqid  The request ID. ex. '1' for the first turn, '2' for the second, etc.
   *          These don't match up perfectly with turns bc you may have to swap
   *          out pokemon if one dies, etc.
   * @param {Object} json.side
   * @param {String} json.side.id    either 'p1' or 'p2'
   * @param {String} json.side.name  your name
   * @param {Array<PokemonData>} json.side.pokemon   6 of them. they're the pokemon on yr side.
   * @param {Boolean} json.wait  True if this is not a request - just updated
   * information. The opponent needs to do something; ex. if their mon feinted
   * last turn, they need to choose a mon to send in. This is unused.
   */
  handleRequest(json) {
    const data = JSON.parse(json);
    // requests are the first place we figure out who we are.
    // -- plato
    if (!this.myId) {
      this.myId = data.side.id;
      this.yourId = this.myId === 'p1' ? 'p2' : 'p1';
    }

    if (data.side && data.side.pokemon) {
      if (this.barn.all().length === 0) {
        // handle some stuff during the first request
        for (let i = 0; i < data.side.pokemon.length; i++) {
          const mon = data.side.pokemon[i];
          const ref = this.barn.create(mon.ident);
          ref.active = mon.active || false;
          ref.order = i;
          ref.assimilate(mon);
        }
      } else {
        // be safer this time - only update previous info.
        for (let i = 0; i < data.side.pokemon.length; i++) {
          const mon = data.side.pokemon[i];
          const ref = this.barn.findByOrder(i, mon.ident);
          ref.assimilate(mon);
          ref.active = mon.active || false; // order matters! keep dead mons active
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

  handleSideStart(side, action) {
    // ex. 'p1' or 'p2'
    const id = side.split(':').pop().trim();
    if (!this.sides[id]) {
      this.sides[id] = new Side();
    }
    this.sides[id].digest(action);
  }

  handleSideEnd(side, action) {
    // ex. 'p1' or 'p2'
    const id = side.split(':').pop().trim();
    if (!this.sides[id]) {
      return;
    }
    this.sides[id].remove(action);
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
    output.self.active = this.barn.all()
      .filter(iamowner)
      .filter(isactive)
      .map(dataGetter)
      .sort(byPosition);
    output.opponent.active = this.barn.all()
      .filter(youareowner)
      .filter(isactive)
      .map(dataGetter)
      .sort(byPosition);
    output.self.reserve = this.barn.all()
      .filter(iamowner)
      .sort(byOrder)
      .map(dataGetter);
    output.opponent.reserve = this.barn.all()
      .filter(youareowner)
      .sort(byOrder)
      .map(dataGetter);

    if (output.opponent.active.length > 0 && !output.opponent.active[0].owner) {
      Log.warn('stop the presses! pokemon with no owner.');
      Log.warn(output.opponent.active[0]);
      exit();
    }

    if (output.self.active.length > 1) {
      Log.warn('stop the presses! too many active pokemon');
      Log.warn(output.self.active);
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

    if (this.sides[this.myNick]) {
      output.self.effects = this.sides[this.myNick].data();
    }
    if (this.sides[this.yourNick]) {
      output.opponent.effects = this.sides[this.yourNick].data();
    }

    return output;
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
