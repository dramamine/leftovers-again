// import listener from './listener';
// import socket from 'socket';
import Team from '../team';
import Log from '../log';
import listener from '../listener';
import report from '../report';
import Reporter from '../reporters/endofmatch';
import util from '../pokeutil';

let updateTimeout = null;

const simultaneous = 5;
let activeMatches = 0;

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
    const {format, scrappy, matches, opponent} = args;
    this.connection = connection;
    this.botmanager = botmanager;

    // if user provided opponent, challenge him
    this.format = format;
    this.scrappy = scrappy;
    this.matches = matches;
    this.opponent = opponent;

    if (!scrappy && !opponent) {
      Log.info('Your bot is set to accept challenges only - it will not start any battles.');
    }

    // sent by lobby.js
    listener.subscribe('lobby_update', this.challengeSomeone.bind(this));

    // @TODO this doesn't exist.
    listener.subscribe('battle_started', this.onBattleStarted.bind(this));

    listener.subscribe('battlereport', this.onBattleReport.bind(this));
    listener.subscribe('updatechallenges', this.onUpdateChallenges.bind(this));


    // all the users we've seen
    this.users = {};
    this.challengesFrom = {};
    this.challengeTo = {};
  }

  challengeSomeone(users) {
    if (updateTimeout) return;
    if (!this.opponent && !this.scrappy) return;
    if (activeMatches >= simultaneous) return;

    updateTimeout = setTimeout(() => {
      console.log('inside my timeout.');
      if (this.outstandingChallenge) return;

      if (this.opponent && users.has(this.opponent) ) {
        this._challenge(this.opponent);
        return;
      }
      if (this.scrappy) {
        // see if we have any users we should challenge
        console.log('im just challenging everyfuckingone');
        // 'some' returns as soon as a thing is true
        console.log(users);

        for (const user of users) {
          if (this.tryChallenge(user)) {
            console.log('I challenged ', user);
            this.outstandingChallenge = true;
            break;
          }
        }
      }

      updateTimeout = null;
    }, 1000);
  }


  tryChallenge(opponent) {
    if (this.outstandingChallenge) return false;

    if (this.challengesFrom[opponent] || this.challengeTo[opponent]) {
      Log.info(`already have a challenge from this person: ${opponent}`);
      return false;
    }


    this._challenge(opponent);
    return true;
  }

  /**
   * Remove all our listeners before you destroy this.
   *
   */
  destroy() {
    listener.unsubscribe('updatechallenges', this.onUpdateChallenges);
    listener.unsubscribe('users', this.gunzBlazing);
    listener.unsubscribe('battlereport', this.onBattleReport);
    listener.unsubscribe('updateuser', this.onUpdateUser);
  }

  onBattleStarted() {
    activeMatches += 1;
  }

/**
 * [onBattleReport description]
 * @param  {[type]} options.report   [description]
 * @param  {[type]} options.winner   [description]
 * @param  {[type]} options.opponent [description]
 * @return {[type]}                  [description]
 */
  onBattleReport({winner, opponent}) {
    activeMatches -= 1;
    Log.info('winner:', winner, 'loser:', opponent);

    const battles = report.data().filter(match => match.you == opponent);
    if (battles.length < this.matches) {
      if (this.scrappy) {
        Log.warn('rechallenging ' + opponent);
        setTimeout(() => {
          this._challenge(util.toId(opponent));
        }, 1000);
      }
    }
    Reporter.report(battles);
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
    console.log('onUpdateChallenges:', msg);
    const {challengesFrom, challengeTo} = JSON.parse(msg);
    Log.debug('updated challenges: ' + msg);
    this.challengesFrom = challengesFrom || {};
    this.challengeTo = challengeTo || {};
    if (JSON.stringify(challengeTo) === '{}' ) {
      console.log('no outstanding challenges!');
      console.log('MARTEN you really need to test this by looking at challenge objects');
      this.outstandingChallenge = false;
      if (scrappy) {
        this.challengeSomeone();
      }
    }
    Object.keys(challengesFrom).forEach( (opponent) => {
      const format = challengesFrom[opponent];
      // only accept battles of the type we're designed for
      if (Challenger._acceptable(format, this.botmanager.accepts)) {
        if (Challenger._requiresTeam(format)) this.sendTeam();
        this.connection.send('|/accept ' + opponent);
        activeMatches += 1;
      }
    });

    // these were pre-existing challenges, so let's just pretend they
    // didn't happen.
    if (this.challengeTo && this.challengeTo.to && !this.outstandingChallenge) {
      this.cancelOutstandingChallenges();
    }
  }

  sendTeam() {
    const team = this.botmanager.team(opponent);
    if (team) {
      const utmString = new Team(team).asUtm();
      Log.info('sending team msg...', utmString);

      this.connection.send('|/utm ' + utmString);
    } else {
      Log.error('team required but couldnt get one!');
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
    const format = this.format;

    if (Challenger._requiresTeam(format)) this.sendTeam();

    Log.info(`sending challenge... ${nick} ${format}`);
    // console.log(this.challengesFrom);
    // console.log(this.challengeTo);
    this.connection.send('|/challenge ' + nick + ', ' + format);
  }

}

export default Challenger;
