'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _battlestore = require('./model/battlestore');

var _battlestore2 = _interopRequireDefault(_battlestore);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _decisions = require('./decisions');

var _report = require('./report');

var _report2 = _interopRequireDefault(_report);

var _listener = require('./listener');

var _listener2 = _interopRequireDefault(_listener);

var _matchstatus = require('./reporters/matchstatus');

var _matchstatus2 = _interopRequireDefault(_matchstatus);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import util from 'pokeutil';

/**
 * This class manages a single battle. It handles these tasks:
 * - maintaining battle state via its BattleStore
 * - managing the AI instance
 * - translating AI responses into server responses
 * - handling the end of the match
 */

var Battle = function () {
  /**
   * Construct a Battle instance.
   * @param  {String} bid The battle ID; essential for server communication
   * @param  {Connection} connection The connection instance to use for
   * sending and receiving messages.
   * @param  {string} botpath The path to the bot JS file to use. The file it
   * grabs will be found at leftovers-again/bots/[botpath].js
   *
   */

  function Battle(bid, bot) {
    _classCallCheck(this, Battle);

    // battle ID
    this.bid = bid;

    // Messages we want to handle, and their handlers.
    this.handlers = {
      // from the normal server
      teampreview: this.handleTeamPreview,
      request: this.handleRequest,
      turn: this.handleTurn,
      win: this.handleWin,
      callback: this.handleCallback,

      // special function for auditing yrself.
      ask4help: this.getHelp
    };

    this.bot = bot;
    this.store = new _battlestore2.default();

    this.prevStates = [];
  }

  /**
   * Getter for my bot instance
   * @return {object} An AI instance of the file located at the botpath
   */


  _createClass(Battle, [{
    key: 'myBot',
    value: function myBot() {
      return this.bot;
    }

    /**
     * Secret function for getting information, not just decisions, from your AI
     * instance. It sends a 'help' message to the server.
     *
     * This is very undocumented (and lazy!) so don't use it.
     */

  }, {
    key: 'getHelp',
    value: function getHelp() {
      if (this.bot.getHelp) {
        _listener2.default.relay('_send', this.bid + '|' + JSON.stringify(this.bot.getHelp(this.store.data())));
      }
    }

    /**
     * Send all server messages through to your battle store, then handle them
     * within this class. See this.handlers to see what we're handling.
     * @param  {string} type    The type of message.
     * @param  {array} message  The parameters to this message.
     */

  }, {
    key: 'handle',
    value: function handle(type, message) {
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

  }, {
    key: 'handleTeamPreview',
    value: function handleTeamPreview() {
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

  }, {
    key: 'handleRequest',
    value: function handleRequest(json) {
      var data = JSON.parse(json);

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

      if (data.teamPreview) {
        return false;
      }

      if (data.forceSwitch) {
        this.decide();
      }
    }

    /**
     * On a turn message, we need to make a decision.
     *
     * @param that I'm ignoring: the turn number.
     */

  }, {
    key: 'handleTurn',
    value: function handleTurn(turn) {
      // eslint-disable-line
      this.decide();
    }
  }, {
    key: 'handleWin',
    value: function handleWin(winner) {
      _log2.default.log(winner + ' won. ' + (winner === this.store.myNick ? '(that\'s you!)' : ''));
      _report2.default.win(winner, this.store, this.bid);

      _listener2.default.relay('battlereport', {
        winner: winner,
        opponent: this.store.yourNick });
    }
  }, {
    key: 'handleCallback',
    value: function handleCallback(desc, code) {
      _log2.default.error('FYI THE TRAPPED CALLBACK WAS CALLED');
      _log2.default.error('THIS IS NOT AN ERROR, IN FACT MAYBE ITS WORKING??');
      _log2.default.error(desc + ' ' + code);
      if (desc === 'trapped') {
        console.log('runnin my lil trapped routine');
        var state = this.store.data();
        state.self.reserve.forEach(function (mon) {
          mon.dead = true;
        });
        this.decide(state);
      }
    }

    /**
     * Asks the AI to make a decision, then sends it to the server.
     *
     */

  }, {
    key: 'decide',
    value: function decide(state) {
      var _this = this;

      if (!state) {
        state = this.store.data();
      }

      _log2.default.debug('STATE:');
      _log2.default.debug(JSON.stringify(state));

      _matchstatus2.default.report(state);

      _log2.default.toFile('lastknownstate-' + this.bid + '.log', JSON.stringify(state) + '\n');

      // attach previous states
      state.prevStates = this.prevStates;

      var choice = this.myBot().decide(state);
      if (choice instanceof Promise) {
        // wait for promises to resolve
        choice.then(function (resolved) {
          var res = Battle._formatMessage(_this.bid, resolved, state);
          _log2.default.info(res);
          _listener2.default.relay('_send', res);
          // saving this state for future reference
          _this.prevStates.unshift(_this.abbreviateState(state));
        }, function (err) {
          _log2.default.err('I think there was an error here.');
          _log2.default.err(err);
        });
      } else {
        // message is ready to go
        var res = Battle._formatMessage(this.bid, choice, state);
        _log2.default.info(res);
        _listener2.default.relay('_send', res);
        // saving this state for future reference
        this.prevStates.unshift(this.abbreviateState(state));
      }
    }

    /**
     * The prevStates array that we send to the bots doesn't need a ton of detail.
     * Let's just send a couple important fields.
     *
     * @param  {Object} state  The state object sent to bots.
     * @return {[type]}        Fewer fields of that state object.
     */

  }, {
    key: 'abbreviateState',
    value: function abbreviateState(state) {
      return {
        turn: state.turn,
        self: {
          active: {
            hp: state.self.active.hp,
            hppct: state.self.active.hppct,
            statuses: state.self.active.statuses
          }
        },
        opponent: {
          active: {
            hp: state.opponent.active.hp,
            hppct: state.opponent.active.hppct,
            statuses: state.opponent.active.statuses
          }
        }
      };
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

  }], [{
    key: '_formatMessage',
    value: function _formatMessage(bid, choice, state) {
      var verb = void 0;
      if (choice instanceof _decisions.MOVE) {
        var moveIdx = Battle._lookupMoveIdx(state.self.active.moves, choice.id);

        if (typeof moveIdx !== 'number' || moveIdx < 0) {
          console.warn('[invalid move!!', choice, state.self.active.moves, 'invalid move yo.');
          exit;
        }

        verb = '/move ' + (moveIdx + 1); // move indexes for the server are [1..4]

        if (state.self.active.canMegaEvo && choice.shouldMegaEvo) {
          verb += ' mega';
        }
      } else if (choice instanceof _decisions.SWITCH) {
        verb = state.teamPreview ? '/team ' : '/switch ';
        var monIdx = Battle._lookupMonIdx(state.self.reserve, choice.id);
        verb = verb + (monIdx + 1); // switch indexes for the server are [1..6]
      }
      return bid + '|' + verb + '|' + state.rqid;
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

  }, {
    key: '_lookupMoveIdx',
    value: function _lookupMoveIdx(moves, idx) {
      if (typeof idx === 'number') {
        return idx;
      } else if ((typeof idx === 'undefined' ? 'undefined' : _typeof(idx)) === 'object') {
        return moves.indexOf(idx);
      } else if (typeof idx === 'string') {
        return moves.findIndex(function (move) {
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

  }, {
    key: '_lookupMonIdx',
    value: function _lookupMonIdx(mons, idx) {
      switch (typeof idx === 'undefined' ? 'undefined' : _typeof(idx)) {
        case 'number':
          return idx;
        case 'object':
          return mons.indexOf(idx);
        case 'string':
          return mons.findIndex(function (mon) {
            return mon.species === idx || mon.id === idx;
          });
        default:
          console.log('not a valid choice!', idx, mons);
      }
    }
  }]);

  return Battle;
}();

exports.default = Battle;