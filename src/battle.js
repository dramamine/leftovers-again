import BattleStore from 'model/battlestore';

import log from 'log';
import {MOVE, SWITCH} from 'decisions';
import report from 'report';
import listener from 'listener';
import Reporter from 'reporters/matchstatus';

/**
 * This class manages a single battle. It handles these tasks:
 * - maintaining battle state via its BattleStore
 * - managing the AI instance
 * - translating AI responses into server responses
 * - handling the end of the match
 */
class Battle {
  /**
   * Construct a Battle instance.
   * @param  {string} bid The battle ID; essential for server communication
   * @param  {Connection} connection The connection instance to use for
   * sending and receiving messages.
   * @param  {string} botpath The path to the bot JS file to use. The file it
   * grabs will be found at leftovers-again/bots/[botpath].js
   *
   */
  constructor(bid, bot) {
    // battle ID
    this.bid = bid;

    // Messages we want to handle, and their handlers.
    this.handlers = {
      // from the normal server
      teampreview: this.handleTeamPreview,
      request: this.handleRequest,
      turn: this.handleTurn,
      win: this.handleWin,

      // special function for auditing yrself.
      ask4help: this.getHelp
    };

    this.bot = bot;
    this.store = new BattleStore();
  }

  /**
   * Getter for my bot instance
   * @return {object} An AI instance of the file located at the botpath
   */
  myBot() {
    return this.bot;
  }

  /**
   * Secret function for getting information, not just decisions, from your AI
   * instance. It sends a 'help' message to the server.
   *
   * This is very undocumented (and lazy!) so don't use it.
   */
  getHelp() {
    listener.relay('_send', this.bid + '|' +
      JSON.stringify( this.bot.getHelp( this.store.data() ) ));
  }


  /**
   * Send all server messages through to your battle store, then handle them
   * within this class. See this.handlers to see what we're handling.
   * @param  {string} type    The type of message.
   * @param  {array} message  The parameters to this message.
   */
  handle(type, message) {
    // handle store stuff first!
    this.store.handle(type, message);

    if (this.handlers[type]) {
      this.handlers[type].apply(this, message);
    }
  }

  /**
   * Handles the 'team preview' message. This is the phase of matches where
   * you see your opponent's team and decide who you want to send out first.
   * Each bot must handle this message.
   *
   * @TODO is this necessary or should we do this in handleRequest?
   */
  handleTeamPreview() {
    this.decide();
  }

  /**
   * Handles a request.
   *
   * For certain requests, we want to immediately request a decision from our
   * bot. These situations are:
   * teamPreview: This is a team preview request
   * forceSwitch: Due to moves / feinting, we must switch our active mon
   * @param  {string} json The request JSON
   */
  handleRequest(json) {
    const data = JSON.parse(json);

    // this is not a request, just data.
    // @TODO probably unnecessary
    if (!data.rqid) {
      return false;
    }

    // do what it says.
    // @TODO probably unnecessary
    if (data.wait) {
      return false;
    }

    if (data.forceSwitch || data.teamPreview) {
      this.decide();
    }
  }

  /**
   * On a turn message, we need to make a decision.
   *
   * @param that I'm ignoring: the turn number.
   */
  handleTurn(turn) { // eslint-disable-line
    this.decide();
  }

  handleWin(winner) {
    console.log('WON: ', winner);
    const results = report.win(winner, this.store);

    listener.relay('battlereport', {
      winner,
      opponent: this.store.yourNick});
  }

  /**
   * Asks the AI to make a decision, then sends it to the server.
   *
   */
  decide() {
    const currentState = this.store.data();

    log.debug('STATE:');
    log.debug(JSON.stringify(currentState));

    Reporter.report(currentState);

    log.toFile(`lastknownstate-${this.bid}.log`, JSON.stringify(currentState) + '\n');

    const choice = this.myBot().onRequest(currentState);
    if (choice instanceof Promise) {
      // wait for promises to resolve
      choice.then( (resolved) => {
        const res = Battle._formatMessage(this.bid, resolved, currentState);
        log.log(res);
        listener.relay('_send', res);
      }, (err) => {
        log.err('I think there was an error here.');
        log.err(err);
      });
    } else {
      // message is ready to go
      const res = Battle._formatMessage(this.bid, choice, currentState);
      log.log(res);
      listener.relay('_send', res);
    }
  }

  /**
   * Formats the message into something we can send to the server.
   *
   * @param  {string} bid    The battle ID
   * @param  {Choice} choice The choice we made. Choice must be an Object of
   * type MOVE or SWITCH.
   * @param  {BattleState} state  The current battle state.
   *
   * @return {string} The string to send to the server.
   *
   * @see __constructor
   */
  static _formatMessage(bid, choice, state) {
    let verb;
    if (choice instanceof MOVE) {
      const moveIdx = Battle._lookupMoveIdx(state.self.active.moves, choice.id);

      if (typeof moveIdx !== 'number' || moveIdx < 0) {
        console.warn('[invalid move!!', choice, state, 'invalid move yo]');
        exit;
      }

      verb = '/move ' + (moveIdx + 1); // move indexes for the server are [1..4]
    } else if (choice instanceof SWITCH) {
      verb = (state.teamPreview)
        ? '/team '
        : '/switch ';
      const monIdx = Battle._lookupMonIdx(state.self.reserve, choice.id);
      verb = verb + (monIdx + 1); // switch indexes for the server are [1..6]
    }
    return `${bid}|${verb}|${state.rqid}`;
  }

  /**
   * Helper function for translating a move into the move index, which is what
   * the server needs from the move. Move index is in [0..3].
   *
   * @param  {array} moves The array of Move objects from which we're drawing.
   * @param  {mixed} idx   The 0-indexed numeric index, the Move object, or the
   * move ID (lowercased, no spaces) of the move we're choosing.
   *
   * @return {number} The move index.
   */
  static _lookupMoveIdx(moves, idx) {
    if (typeof(idx) === 'number') {
      return idx;
    } else if (typeof(idx) === 'object') {
      return moves.indexOf(idx);
    } else if (typeof(idx) === 'string') {
      return moves.findIndex( (move) => {
        return move.id === idx;
      });
    }
  }

  /**
   * Helper function for translating a switch into the switch index, which is
   * what the server needs from the switch. Switch index is in [0..5].
   *
   * @param  {array} mons The possible Pokemons.
   * @param  {mixed} idx  The numeric index, the Pokemon object, or the species
   * name (lowercased, no spaces) of the Pokemon we want to switch into.
   *
   * @return {number} The switch index.
   */
  static _lookupMonIdx(mons, idx) {
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
      console.log('not a valid choice!', idx, mons);
    }
  }
}

export default Battle;
