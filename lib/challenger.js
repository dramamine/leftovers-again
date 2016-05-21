'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _team = require('./lib/team');

var _team2 = _interopRequireDefault(_team);

var _log = require('./log');

var _log2 = _interopRequireDefault(_log);

var _listener = require('./listener');

var _listener2 = _interopRequireDefault(_listener);

var _report = require('./report');

var _report2 = _interopRequireDefault(_report);

var _endofmatch = require('./reporters/endofmatch');

var _endofmatch2 = _interopRequireDefault(_endofmatch);

var _pokeutil = require('./pokeutil');

var _pokeutil2 = _interopRequireDefault(_pokeutil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// for tracking the status of users in the lobby
// import listener from './listener';
// import socket from 'socket';
const Statuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SELF: 'self',
  // includes states that happen after the challenge, ex. matches and stuff
  CHALLENGED: 'challenged'
};

let mynick = '';

/**
 * Used for managing challenges to other users.
 */
class Challenger {
  /**
   * Constructor.
   * @param  {boolean} scrappy Set to true if we want this user to challenge
   * everyone in the lobby and everyone who joins the lobby later.
   * @param  {String}  format  The type of match we're challenging
   * opponents to. By default, the challenge type used matches the 'format'
   * field of the bot's package.json
   *
   * @return Constructor
   */
  constructor(connection, botmanager, args) {
    const { format, scrappy, matches } = args;
    this.connection = connection;
    this.botmanager = botmanager;
    this.scrappy = scrappy;
    this.format = format;
    this.matches = matches;

    _listener2.default.subscribe('updatechallenges', this.onUpdateChallenges.bind(this));
    _listener2.default.subscribe('battlereport', this.onBattleReport.bind(this));
    _listener2.default.subscribe('updateuser', this.onUpdateUser.bind(this));

    if (scrappy) {
      // only issue challenges in non-spawned copies
      // the main dude issues all challenges; spawns just sit back and relax.
      // otherwise, spawns would all challenge each other and overheat and die
      _listener2.default.subscribe('users', this.gunzBlazing.bind(this));
      _listener2.default.subscribe('j', this.onUserJoin.bind(this));
      _listener2.default.subscribe('l', this.onUserLeave.bind(this));
    }
    this._challengeNext = this._challengeNext.bind(this);
    this.onUpdateUser = this.onUpdateUser.bind(this);
    this.onUpdateChallenges = this.onUpdateChallenges.bind(this);

    // all the users we've seen
    this.users = {};
    this.challengesFrom = {};
    this.challengeTo = {};

    this.hasChallenged = true;
  }

  /**
   * Remove all our listeners before you destroy this.
   *
   */
  destroy() {
    _listener2.default.unsubscribe('updatechallenges', this.onUpdateChallenges);
    _listener2.default.unsubscribe('users', this.gunzBlazing);
    _listener2.default.unsubscribe('battlereport', this.onBattleReport);
    _listener2.default.unsubscribe('updateuser', this.onUpdateUser);
  }

  /**
   * Updates the user state to reflect that the user joined.
   *
   * @param  {string} user The user who joined.
   */
  onUserJoin([user]) {
    const trimmed = _pokeutil2.default.toId(user);
    if (!this.users[trimmed] || this.users[trimmed] === Statuses.INACTIVE) {
      this.users[trimmed] = trimmed === mynick ? Statuses.SELF : Statuses.ACTIVE;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(this._challengeNext, 1000);
    }
  }

  /**
   * Updates the user state to reflect that this user left.
   *
   * @param  {string} user The nickname of the user who left.
   */
  onUserLeave([user]) {
    this.users[_pokeutil2.default.toId(user)] = Statuses.INACTIVE;
  }

  /**
   * Handles the updateuser message. We use this to know our own nickname and
   * avoid challenging ourselves (like a noob would)
   *
   * @param  {String} nick  Our assigned nickname.
   * @param  {Integer} status Unused.
   */
  onUpdateUser([nick, status]) {
    // eslint-disable-line
    switch (status) {
      case '0':
        break;
      case '1':
        _log2.default.warn(`Successfully logged in as ${ nick } (${ _pokeutil2.default.toId(nick) })`);
        mynick = _pokeutil2.default.toId(nick);
        break;
      default:
        _log2.default.error(`Weird status when trying to log in: ${ status } ${ nick }`);
        break;
    }
  }

  /**
   * Find the next active opponent and issue a challenge.
   *
   */
  _challengeNext() {
    let opponent = '';
    Object.keys(this.users).some(user => {
      const userid = _pokeutil2.default.toId(user);
      if (this.users[userid] === Statuses.ACTIVE) {
        opponent = userid;
      }
    });
    if (opponent) {
      if (this.challengesFrom[opponent] || this.challengeTo[opponent]) {
        _log2.default.info(`already have a challenge from this person: ${ opponent }`);
      } else {
        this._challenge(opponent);
      }
      this.users[_pokeutil2.default.toId(opponent)] = Statuses.CHALLENGED;
      this.timer = setTimeout(this._challengeNext, 1000);
    }
  }

  /**
   * [onBattleReport description]
   * @param  {[type]} options.report   [description]
   * @param  {[type]} options.winner   [description]
   * @param  {[type]} options.opponent [description]
   * @return {[type]}                  [description]
   */
  onBattleReport({ winner, opponent }) {
    console.log('onBattleReport called.');
    console.log(winner, opponent);

    const battles = _report2.default.data().filter(match => match.you == opponent);
    if (battles.length < this.matches) {
      if (this.scrappy) {
        _log2.default.warn('rechallenging ' + opponent);
        this._challenge(opponent);
      }
    }
    _endofmatch2.default.report(battles);
  }

  /**
   * Take a join message and challenge everyone who's in the lobby.
   * @param  {usersStr} args A comma-separated list of usernames.
   *
   */
  gunzBlazing([usersStr]) {
    let opponent; // user for iterator
    const userList = usersStr.split(', ');
    // userlist[0] is just the count of users. skip it
    for (let i = 1; i < userList.length; i++) {
      opponent = _pokeutil2.default.toId(userList[i]);
      // don't challenge yourself. (ha)
      if (this.users[opponent] !== Statuses.SELF) {
        this.users[opponent] = Statuses.ACTIVE;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(this._challengeNext, 1000);
      }
    }
  }

  /**
   * Handle the updatechallenges message. Accept any challenges.
   *
   * @param  {String} msg A JSON string
   * @param {Object} msg.challengesFrom An object of received challenges.
   * These challenges are key:value pairs where key is the opponent's nickname
   * and value is the battle type.
   *
   * @param {Object} msg.challengeTo An object of issued challenges.
   * These challenges are key:value pairs where key is the opponent's nickname
   * and value is the battle type.
   *
   */
  onUpdateChallenges(msg) {
    const { challengesFrom, challengeTo } = JSON.parse(msg);
    _log2.default.debug('updated challenges: ' + msg);
    this.challengesFrom = challengesFrom || {};
    this.challengeTo = challengeTo || {};
    Object.keys(challengesFrom).forEach(opponent => {
      const format = challengesFrom[opponent];
      // only accept battles of the type we're designed for
      if (Challenger._acceptable(format, this.botmanager.accepts)) {
        // this is the point at which we need to pick a team!
        // team message is: /utm ('use team')

        if (Challenger._requiresTeam(format)) {
          const team = this.botmanager.team(opponent);
          if (team) {
            const utmString = new _team2.default(team).asUtm();
            _log2.default.info('sending team msg...', utmString);

            this.connection.send('|/utm ' + utmString);
          } else {
            _log2.default.error('team required but couldnt get one!');
          }
        }

        this.connection.send('|/accept ' + opponent);
      }
    });

    // these were pre-existing challenges, so let's just pretend they
    // didn't happen.
    if (this.challengeTo && this.challengeTo.to && !this.hasChallenged) {
      this.cancelOutstandingChallenges();
    }
  }

  /**
   * Cancels outstanding challenges.
   */
  cancelOutstandingChallenges() {
    if (this.challengeTo && this.challengeTo.to) {
      _log2.default.warn(' ~ cancelling a challenge with ' + this.challengeTo.to);
      this.connection.send('|/cancelchallenge ' + this.challengeTo.to);
    }
  }

  /**
   * [_acceptable description]
   * @param  {String} challenge The match type we were challenged to
   * @param  {String} accepts  A comma-separated list of match types(?)
   * @return {Boolean} True if the bot will accept this challenge, false otherwise.
   */
  static _acceptable(challenge, accepts) {
    if (accepts === 'ALL') return true;
    return accepts.includes(challenge);
  }

  /**
   * @TODO this is a lazy implementation
   *
   * @param  {[type]} format [description]
   * @return {[type]}               [description]
   */
  static _requiresTeam(format) {
    if (format === 'randombattle') {
      return false;
    }
    return true;
  }

  /**
   * Send a challenge to this user; maybe load your bot to find its team.
   *
   * @TODO combine this with onUpdateChallenges functionality? ex. the logic
   * for utm is the same.
   *
   * @param {String} The nickname to challenge.
   */
  _challenge(nick) {
    _log2.default.info(`challenge called. ${ nick }`);
    const format = this.format;

    if (Challenger._requiresTeam(format)) {
      const team = this.botmanager.team(nick);
      if (team) {
        const utmString = new _team2.default(team).asUtm();
        _log2.default.info('sending utm...', utmString);
        this.connection.send('|/utm ' + utmString);
      }
    }

    _log2.default.warn(`sending challenge... ${ nick } ${ format }`);
    console.log(this.users);
    console.log(this.challengesFrom);
    console.log(this.challengeTo);
    this.connection.send('|/challenge ' + nick + ', ' + format);

    this.hasChallenged = true;
  }

}

exports.default = Challenger;