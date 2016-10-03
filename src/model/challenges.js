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
const activeMatches = new Set();

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
    const { format, scrappy, matches, results } = args;
    this.connection = connection;
    this.botmanager = botmanager;

    // if user provided opponent, challenge him
    this.format = format;
    this.scrappy = scrappy;
    this.matches = matches;
    this.results = results;

    if (!scrappy) {
      Log.log('Your bot is set to accept challenges only - it will not start any battles.');
    }

    listener.subscribe('updatechallenges', this.onUpdateChallenges.bind(this));
    listener.subscribe('_battleReport', this.onBattleReport.bind(this));
    listener.subscribe('_lobbyUpdate', this.challengeSomeone.bind(this));


    // all the users we've seen
    this.users = {};
    this.challengesFrom = {};
    this.challengeTo = {};
  }

  /**
   * Find someone to challenge.
   * Running this on a timeout so that we don't challenge too frequently, and
   * so that we don't challenge multiple times if we get a burst of updates.
   *
   * @param  {Set} users The users set.
   */
  challengeSomeone(users = this.users) {
    this.users = users;
    if (!this.scrappy) return; // only scrappy users can issue challenges
    if (updateTimeout) return;
    if (activeMatches.size >= simultaneous) return;

    updateTimeout = setTimeout(() => {
      if (this.outstandingChallenge) return;

      if (this.scrappy) {
        for (const user of users) {
          if (this.tryChallenge(user)) {
            this.outstandingChallenge = true;
            break;
          }
        }
      }
      updateTimeout = null;
    }, 1000);
  }

  /**
   * Run some checks and then send a challenge.
   *
   * @param  {[type]} opponent The person to challenge.
   * @return {[type]}          True if we sent the challenge, false otherwise.
   */
  tryChallenge(opponent) {
    if (this.outstandingChallenge) {
      Log.info(`Not challenging ${opponent} because I'm already challenging someone.`);
      return false;
    }

    if (activeMatches.has(opponent)) {
      Log.info(`Already playing a match with ${opponent}`);
      return false;
    }

    if ((this.challengesFrom && this.challengesFrom[opponent]) ||
      (this.challengeTo && this.challengeTo[opponent])) {
      Log.info(`already have a challenge from this person: ${opponent}`);
      return false;
    }

    this.challenge(opponent);
    return true;
  }

  /**
   * Remove all our listeners before you destroy this.
   *
   */
  destroy() {
    listener.unsubscribe('updatechallenges', this.onUpdateChallenges);
    listener.unsubscribe('updateuser', this.onUpdateUser);
    listener.unsubscribe('_battleReport', this.onBattleReport);
    listener.unsubscribe('_battleStarted', this.onBattleStarted);
    listener.unsubscribe('_lobbyUpdate', this.challengeSomeone);
  }

/**
 * [onBattleReport description]
 * @param  {[type]} options.report   [description]
 * @param  {[type]} options.winner   [description]
 * @param  {[type]} options.opponent [description]
 * @return {[type]}                  [description]
 */
  onBattleReport(results) {
    const winner = util.toId(results.winner);
    const opponent = util.toId(results.opponent);
    activeMatches.delete(opponent);
    Log.info('winner:', winner, 'loser:', opponent);

    const battles = report.data().filter(match => match.you === opponent);
    Reporter.report(battles, this.results);

    if (battles.length < this.matches) {
      if (this.scrappy) {
        Log.warn('rechallenging ' + opponent);
        setTimeout(() => {
          this.challenge(util.toId(opponent));
        }, 1000);
      }
    }
  }

  /**
   * Handle the updatechallenges message. Accept any challenges.
   *
   * When challenging:
   * [ '{"challengesFrom":{},"challengeTo":{"to":"randumbmarten","format":"randombattle"}}' ]
   * When challenge was accepted:
   * [ '{"challengesFrom":{},"challengeTo":null}' ]
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
    this.challengeTo = challengeTo;
    if (!challengeTo) {
      Log.debug('no outstanding challenges.');
      this.outstandingChallenge = false;
      if (this.scrappy) {
        this.challengeSomeone();
      }
    }
    Object.keys(challengesFrom).forEach((opponent) => {
      const format = challengesFrom[opponent];
      // only accept battles of the type we're designed for
      if (Challenger.acceptable(format, this.botmanager.accepts)) {
        if (Challenger.requiresTeam(format)) this.sendTeam(opponent);
        this.connection.send('|/accept ' + opponent);
        activeMatches.add(opponent);
      }
    });

    // these were pre-existing challenges, so let's just pretend they
    // didn't happen.
    if (this.challengeTo && this.challengeTo.to && !this.outstandingChallenge) {
      this.cancelOutstandingChallenges();
    }
  }

  /**
   * Send a message to the server containing our team data.
   *
   * @param {String} opponent  The opponent's nickname. This is provided in
   * case you want to customize your team against specific opponents.
   *
   * @return {Boolean}  True if we did send the message; false otherwise
   */
  sendTeam(opponent) {
    const team = this.botmanager.team(opponent);
    if (team) {
      const utmString = new Team(team).asUtm();
      Log.info('sending team msg...', utmString);

      this.connection.send('|/utm ' + utmString);
    } else {
      Log.error('team required but couldnt get one!');
      return false;
    }
    return true;
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
    const format = this.format;

    if (Challenger.requiresTeam(format)) this.sendTeam(nick);

    Log.info(`sending challenge... ${nick} ${format}`);
    this.connection.send('|/challenge ' + nick + ', ' + format);
    activeMatches.add(nick);
  }

}

export default Challenger;
