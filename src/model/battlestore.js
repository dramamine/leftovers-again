// import Pokemon from 'model/pokemon';
const Side = require('./side');
const Barn = require('./pokebarn');
const util = require('../pokeutil');
const Log = require('../log');
const Weather = require('../constants/weather');

/**
 * Store for tracking the status of the battle.
 *
 */
class BattleStore {
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
      move: this.handleMove,
      switch: this.handleSwitch,
      drag: this.handleSwitch,
      request: this.handleRequest,
      turn: this.handleTurn,
      faint: this.handleFaint,
      heal: this.handleHeal,
      player: this.handlePlayer,
      replace: this.handleReplace,
      '-fail': this.handleFail,
      '-miss': this.handleMiss,
      '-boost': this.handleBoost,
      '-unboost': this.handleUnboost,
      '-status': this.handleStatus,
      '-curestatus': this.handleCureStatus,
      '-weather': this.handleWeather,
      '-sidestart': this.handleSideStart,
      '-sideend': this.handleSideEnd,

      // same signature
      '-formechange': this.handleDetailsChange,
      'detailschange': this.handleDetailsChange
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
    const pos = util.identToPos(ident);
    const former = this.barn.findByPos(pos);

    const mon = this.barn.findOrCreate(ident, details);
    mon.position = pos;
    mon.active = true;

    if (former) {
      former.position = null;
      former.active = false;
    }

    mon.useCondition(condition);
    mon.useDetails(details); // @TODO is this necessary?

    this.events.push({
      type: 'switch',
      player: util.identToOwner(ident),
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
    if (!actingMon) {
      Log.error('battlestore.handleMove: couldnt find ' + actor + ' in this haystack:');
      this.barn.allmon.forEach(mon => Log.error(mon.ident + '|' + mon.details));
    } else {
      actingMon.recordMove(move);
    }
  }

  handleReplace(ident, details, condition) {
    this.barn.replace(ident, details, condition);
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

    // think I was using this to validate damage numbers
    // if (mon.maxhp !== 100 && move.damage > 20) {
    //   Log.toFile('damagerangetest', move.damage + ',');
    // }

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
    if (!name) return;
    this.names[id] = util.toId(name);
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

    const isactive = mon => !mon.dead && (!!mon.position || mon.active);
    this.barn.all().filter(isactive).forEach((mon) => {
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
    if (!json) return;

    const data = JSON.parse(json);
    // requests are the first place we figure out who we are.
    // -- plato
    if (!this.myId) {
      this.myId = data.side.id;
      this.yourId = this.myId === 'p1' ? 'p2' : 'p1';
    }

    if (data.side && data.side.pokemon) {
      // handle some stuff during the first request
      for (let i = 0; i < data.side.pokemon.length; i++) {
        const mon = data.side.pokemon[i];
        const ref = this.barn.findOrCreate(mon.ident, mon.details);
        // first round, we shouldn't have any active mon yet!
        // but the request DOES set the first pokemon in Reserve to active!
        // it's a property of the mon.
        // I think this is handled quite differently in the web client.
        if (data.teamPreview) delete mon.active;

        ref.assimilate(mon);
        ref.order = i;
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
   * ex. |-sidestart|p1: 5nowden4189|move: Stealth Rock
   * @param  {String} side   Which players id is it?
   * @param  {String} action What happened?
   */
  handleSideStart(side, action) {
    Log.warn(`got side effect! ${side}: ${action}`);
    // ex. 'p1' or 'p2'
    const id = side.split(':').shift().trim();
    if (!this.sides[id]) {
      this.sides[id] = new Side();
    }
    this.sides[id].digest(action);
  }

  /**
   * @param  {String} side   Which players id is it?
   * @param  {String} action What happened?
   */
  handleSideEnd(side, action) {
    // ex. 'p1' or 'p2'
    const id = side.split(':').shift().trim();
    if (!this.sides[id]) {
      return;
    }
    this.sides[id].remove(action);
  }

  /**
   * Forme change! This came up a lot with castform, probs some other pokes too.
   * ex: |-formechange|p2a: Castform|Castform-Sunny|[msg]|[from] ability: Forecast
   * ex: |detailschange|p2a: Charizard|Charizard-Mega-X, M
   * ex. |detailschange|p2a: Sabbs|Sableye-Mega, M
   *
   * @param  {String} ident  The id of the pokemon
   * @param  {String} species  The pokemon's new species
   * @param  {String} hpstatus Not sure, always seems to be [msg]
   * @param  {String} reason  Why did these details change?
   */
  handleDetailsChange(ident, details, hpstatus, reason) {
    const updated = this.barn.replace(ident, details, null);
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
    const dataGetter = mon => mon.data();
    const iamowner = mon => mon.owner === this.myId;
    const youareowner = mon => mon.owner !== this.myId;
    const isactive = mon => !mon.dead && (!!mon.position || mon.active);
    const byPosition = (a, b) => b.position - a.position;
    const byOrder = (a, b) => a.order - b.order;


    // use getState so we can filter out any crap.
    output.self.active = this.barn.all()
      .filter(iamowner)
      .filter(isactive)
      .map(dataGetter)
      .sort(byPosition);
    // @TODO thinking about trying this. why are there actives during teamPreview?
    // if (this.teamPreview) {
    //   output.self.active = [];
    // }

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
      .sort(byOrder) // @TODO does this do anything
      .map(dataGetter);

    if (output.opponent.active.length > 0 && !output.opponent.active[0].owner) {
      Log.warn('stop the presses! pokemon with no owner.');
      Log.warn(output.opponent.active[0]);
      process.exit(-1);
    }

    if (output.self.active.length > 1) {
      Log.warn('stop the presses! too many active pokemon');
      Log.warn(output.self.active);
    }

    // this was causing some errors before. could use some more research...
    // @TODO why aren't we clearing out activeData?
    if (this.activeData && output.self.active.length === this.activeData.length) {
      for (let i = 0; i < this.activeData.length; i++) {
        // researching moves and copying them over
        const movesArr = this.activeData[i].moves;
        const updated = movesArr.map( (move) => { // eslint-disable-line
          return Object.assign(move, util.researchMoveById(move.id));
        });

        if (this.activeData[i].canZMove) {
          this.activeData[i].canZMove.forEach((name, zIndex) => {
            if (name) {
              updated[zIndex].canZMove = true;
              updated[zIndex].zMove = util.researchMoveById(util.toId(name));
            }
          });
        }

        output.self.active[i].moves = updated;

        // for mega-evolution
        if (this.activeData[i].canMegaEvo) {
          output.self.active[i].canMegaEvo = this.activeData[i].canMegaEvo;
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
    output.turn = this.turn;
    output.weather = this.weather;

    if (this.sides[this.myId]) {
      output.self.side = this.sides[this.myId].data();
    }
    if (this.sides[this.yourId]) {
      output.opponent.side = this.sides[this.yourId].data();
    }

    return output;
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

module.exports = BattleStore;
