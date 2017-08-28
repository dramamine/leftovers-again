// import listener from './listener';
// import socket from 'socket';
const Team = require('../team');
const Log = require('../log');
const listener = require('../listener');
const report = require('../report');
const Reporter = require('../reporters/endofmatch');
const util = require('../pokeutil');

// for tracking the status of users in the lobby
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
    const { format, scrappy, matches, opponent } = args;
    this.connection = connection;
    this.botmanager = botmanager;
    // if user provided opponent, challenge him
    this.scrappy = scrappy || opponent;
    this.format = format;
    this.matches = matches;

    listener.subscribe('updatechallenges', this.onUpdateChallenges.bind(this));
    listener.subscribe('updateuser', this.onUpdateUser.bind(this));
    listener.subscribe('_battleReport', this.onBattleReport.bind(this));

    if (scrappy) {
      // only issue challenges in non-spawned copies
      // the main dude issues all challenges; spawns just sit back and relax.
      // otherwise, spawns would all challenge each other and overheat and die
      listener.subscribe('users', this.gunzBlazing.bind(this));
      listener.subscribe('j', this.onUserJoin.bind(this));
      listener.subscribe('l', this.onUserLeave.bind(this));
    }
    this.challengeNext = this.challengeNext.bind(this);
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
    listener.unsubscribe('updatechallenges', this.onUpdateChallenges);
    listener.unsubscribe('updateuser', this.onUpdateUser);
    listener.unsubscribe('_battleReport', this.onBattleReport);
    if (this.scrappy) {
      listener.unsubscribe('users', this.gunzBlazing);
      listener.unsubscribe('j', this.onUserJoin);
      listener.unsubscribe('l', this.onUserLeave);
    }
  }

  /**
   * Updates the user state to reflect that the user joined.
   *
   * @param  {string} user The user who joined.
   */
  onUserJoin([user]) {
    console.log('uh oh, deprecated function onUserJoin called.', user);
    const trimmed = util.toId(user);
    if (!this.users[trimmed] || this.users[trimmed] === Statuses.INACTIVE) {
      this.users[trimmed] = (trimmed === mynick
        ? Statuses.SELF
        : Statuses.ACTIVE);
      if (this.timer) clearTimeout(this.timer);
      console.log('onUserJoin calling challengeNext...');
      this.timer = setTimeout(this.challengeNext, 1000);
    }
  }

  /**
   * Updates the user state to reflect that this user left.
   *
   * @param  {string} user The nickname of the user who left.
   */
  onUserLeave([user]) {
    this.users[util.toId(user)] = Statuses.INACTIVE;
  }

  /**
   * Handles the updateuser message. We use this to know our own nickname and
   * avoid challenging ourselves (like a noob would)
   *
   * @param  {String} nick  Our assigned nickname.
   * @param  {Integer} status Unused.
   */
  onUpdateUser([nick, status]) { // eslint-disable-line
    switch (status) {
      case '0':
        break;
      case '1':
        Log.warn(`Successfully logged in as ${nick} (${util.toId(nick)})`);
        mynick = util.toId(nick);
        break;
      default:
        Log.error(`Weird status when trying to log in: ${status} ${nick}`);
        break;
    }
  }

  /**
   * Find the next active opponent and issue a challenge.
   *
   */
  challengeNext() {
    let opponent = '';
    Object.keys(this.users).some((user) => {
      const userid = util.toId(user);
      if (this.users[userid] === Statuses.ACTIVE) {
        opponent = userid;
        return true;
      }
    });
    if (opponent) {
      if (this.challengesFrom[opponent] || this.challengeTo[opponent]) {
        Log.info(`already have a challenge from this person: ${opponent}`);
      } else {
        this.challenge(opponent);
      }
      this.users[util.toId(opponent)] = Statuses.CHALLENGED;
      this.timer = setTimeout(this.challengeNext, 1000);
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
    Log.info('winner:', winner, 'loser:', opponent);

    const battles = report.data().filter(match => match.you == opponent);
    if (battles.length < this.matches) {
      if (this.scrappy) {
        Log.warn('rechallenging ' + opponent);
        setTimeout(() => {
          this.challenge(util.toId(opponent));
        }, 1000);
      }
    }
    Reporter.report(battles);
  }

  /**
   * Take a join message and challenge everyone who's in the lobby.
   * @param  {usersStr} args A comma-separated list of usernames.
   *
   */
  gunzBlazing([usersStr]) {
    console.log('deprecated function called: params::gunzBlazing', usersStr);
    let opponent; // user for iterator
    const userList = usersStr.split(', ');
    // userlist[0] is just the count of users. skip it
    for (let i = 1; i < userList.length; i++) {
      opponent = util.toId(userList[i]);
      // don't challenge yourself. (ha)
      if (this.users[opponent] !== Statuses.SELF) {
        this.users[opponent] = Statuses.ACTIVE;
        if (this.timer) clearTimeout(this.timer);
        console.log('gunzBlazing::uh oh, setting a timer to challengeNext');
        this.timer = setTimeout(this.challengeNext, 1000);
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
    Log.debug('updated challenges: ' + msg);
    this.challengesFrom = challengesFrom || {};
    this.challengeTo = challengeTo || {};
    Object.keys(challengesFrom).forEach((opponent) => {
      const format = challengesFrom[opponent];
      // only accept battles of the type we're designed for
      if (Challenger.acceptable(format, this.botmanager.accepts)) {
        // this is the point at which we need to pick a team!
        // team message is: /utm ('use team')

        if (Challenger.requiresTeam(format)) {
          const team = this.botmanager.team(opponent);
          if (team) {
            const utmString = new Team(team).asUtm();
            Log.info('sending team msg...', utmString);

            this.connection.send('|/utm ' + utmString);
          } else {
            Log.error('team required but couldnt get one!');
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
      Log.warn(' ~ cancelling a challenge with ' + this.challengeTo.to);
      this.connection.send('|/cancelchallenge ' + this.challengeTo.to);
    }
  }

  /**
   * [acceptable description]
   * @param  {String} challenge The match type we were challenged to
   * @param  {String} accepts  A comma-separated list of match types(?)
   * @return {Boolean} True if the bot will accept this challenge, false otherwise.
   */
  static acceptable(challenge, accepts) {
    if (accepts === 'ALL') return true;
    return accepts.includes(challenge);
  }

  /**
   * @TODO this is a lazy implementation
   *
   * @param  {[type]} format [description]
   * @return {[type]}               [description]
   */
  static requiresTeam(format) {
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
  challenge(nick) {
    Log.info(`challenge called. ${nick}`);
    if (nick === mynick) {
      Log.error('cant challenege myself.');
      return;
    }
    const format = this.format;

    if (Challenger.requiresTeam(format)) {
      const team = this.botmanager.team(nick);
      if (team) {
        const utmString = new Team(team).asUtm();
        Log.info('sending utm...', utmString);
        this.connection.send('|/utm ' + utmString);
      }
    }

    Log.info(`sending challenge... ${nick} ${format}`);
    // console.log(this.challengesFrom);
    // console.log(this.challengeTo);
    this.connection.send('|/challenge ' + nick + ', ' + format);

    this.hasChallenged = true;
  }

}

module.exports = Challenger;
