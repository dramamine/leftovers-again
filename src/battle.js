import config from './config';
import BattleStore from './model/battlestore';

import log from './log';
import {MOVE, SWITCH} from './decisions';
import report from './report';
import challenger from './challenger';


class Battle {
  constructor(bid, connection, botpath = config.botPath) {
    // battle ID
    this.bid = bid;

    this.handlers = {
      teampreview: this.handleTeamPreview,
      request: this.handleRequest,
      turn: this.handleTurn,
      win: this.handleWin,
      ask4help: this.getHelp
    };

    const AI = require(botpath);
    // log.log('crafting new AI');
    this.bot = new AI();

    this.connection = connection;
    this.store = new BattleStore();
  }

  myBot() {
    return this.bot;
  }

  getHelp() {
    this.connection.send( JSON.stringify( this.bot.getHelp( this.store.data() ) ) );
  }


  handle(type, message) {
    // handle store stuff first!
    this.store.handle(type, message);

    if (this.handlers[type]) {
      this.handlers[type].apply(this, message);
    }
  }

  handleTeamPreview() {
    this.decide();
  }

  handleRequest(json) {
    const data = JSON.parse(json);

    // this is not a request, just data.
    if (!data.rqid) {
      return false;
    }

    // do what it says.
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
  handleTurn() {
    this.decide();
  }

  handleWin(x) {
    console.log('WON: ', x);
    const results = report.win(x, this.store);

    if (results.opponents[this.store.opponentNick].length < config.matches) {
      challenger.challenge(this.store.opponentNick);
    } else {
      console.log(JSON.stringify(report.data()));
    }
  }

  /**
   *
   * @return {[type]} [description]
   */
  decide() {
    const currentState = this.store.data();

    log.info('STATE:');
    log.info(JSON.stringify(currentState));

    const choice = this.myBot().onRequest(currentState);
    if (choice instanceof Promise) {
      choice.then( (resolved) => {
        const res = Battle._formatMessage(this.bid, resolved, currentState);
        log.log(res);
        this.connection.send( res );
      }, (err) => {
        log.err('I think there was an error here.');
        log.err(err);
      });
    } else {
      const res = Battle._formatMessage(this.bid, choice, currentState);
      log.log(res);
      this.connection.send( res );
    }
  }

  static _maybeWrap(x) {
    if (Array.isArray(x)) return x;
    return [x];
  }


  static _formatMessage(bid, choice, state) {
    let verb;
    if (choice instanceof MOVE) {
      const moveIdx = Battle._lookupMoveIdx(state.self.active.moves, choice.id);

      if (typeof moveIdx !== 'number' || moveIdx < 0) {
        console.warn('[invalid move!!', choice, state, 'invalid move yo]');
        exit;
      }

      verb = '/move ' + (moveIdx + 1);
    } else if (choice instanceof SWITCH) {
      verb = (state.teamPreview)
        ? '/team '
        : '/switch ';
      const monIdx = Battle._lookupMonIdx(state.self.reserve, choice.id);
      verb = verb + (monIdx + 1);
    }
    return `${bid}|${verb}|${state.rqid}`;
  }

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

  processMon() {
    return null;
  }


}

export default Battle;
