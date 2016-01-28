// import listener from './listener';
import socket from 'socket';
import config from 'config';
import Team from 'lib/team';
import Log from 'log';
import listener from 'listener';

// for tracking the status of users in the lobby
const Statuses = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SELF: 'self',
  // includes states that happen after the challenge, ex. matches and stuff
  CHALLENGED: 'challenged'
};

/**
 * Used for managing challenges to other users.
 */
class Challenger {
  /**
   * Constructor.
   * @param  {boolean} scrappy Set to true if we want this user to challenge
   * everyone in the lobby and everyone who joins the lobby later.
   *
   * @return Constructor
   */
  constructor(bot, scrappy) {
    this.bot = bot;

    listener.subscribe('updatechallenges', this.onUpdateChallenges.bind(this));
    listener.subscribe('battlereport', this.onBattleReport);
    listener.subscribe('updateuser', this.onUpdateUser.bind(this));

    if (scrappy) {
      // only issue challenges in non-spawned copies
      // the main dude issues all challenges; spawns just sit back and relax.
      // otherwise, spawns would all challenge each other and overheat and die
      console.log('subscribing to users message.');
      listener.subscribe('users', this.gunzBlazing.bind(this));
      listener.subscribe('j', this.onUserJoin.bind(this));
      listener.subscribe('l', this.onUserLeave.bind(this));
    }
    this._challengeNext = this._challengeNext.bind(this);
    this.onUpdateUser = this.onUpdateUser.bind(this);

    // all the users we've seen
    this.users = {};
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

  /**
   * Updates the user state to reflect that the user joined.
   *
   * @param  {string} user The user who joined.
   */
  onUserJoin([user]) {
    const trimmed = user.trim();
    if (!this.users[trimmed] || this.users[trimmed] === Statuses.INACTIVE) {
      this.users[trimmed] = Statuses.ACTIVE;
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
    this.users[user.trim()] = Statuses.INACTIVE;
  }

  /**
   * Handles the updateuser message. We use this to know our own nickname and
   * avoid challenging ourselves (like a noob would)
   *
   * @param  {String} nick  Our assigned nickname.
   * @param  {Integer} status Unused.
   */
  onUpdateUser([nick, status]) { // eslint-disable-line
    this.users[nick] = Statuses.SELF;
  }

  /**
   * Find the next active opponent and issue a challenge.
   *
   */
  _challengeNext() {
    let opponent = '';
    Object.keys(this.users).some(user => {
      if (this.users[user] === Statuses.ACTIVE) {
        opponent = user;
      }
    });
    if (opponent) {
      this._challenge(opponent);
      this.users[opponent] = Statuses.CHALLENGED;
      console.log('_challengeNext:', this.users);
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
  onBattleReport({report, winner, opponent}) {
    console.log('onBattleReport called.');
    console.log(winner, opponent);
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
      opponent = userList[i].trim();
      // don't challenge yourself. (ha)
      if (this.users[opponent] !== Statuses.SELF) {
        console.log('updating to active: ', opponent);
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
    const {challengesFrom, challengeTo} = JSON.parse(msg);

    // double-verify challengeTo
    // const users = Object.keys(this.users).filter(user =>
    //   this.users[user] === Statuses.CHALLENGED);

    console.log('onUpdateChallenges::', challengesFrom, challengeTo);
    // if (!challengesFrom) return;

    Object.keys(challengesFrom).forEach( (opponent) => {
      console.log('checking out this key:', opponent, AI.meta.battletype);
      // only accept battles of the type we're designed for

      if (this._acceptable(challengesFrom[opponent], bot.accepts)) {
        // this is the point at which we need to pick a team!
        // TODO use promises here to maybe wait for user to pick a team
        // team message is: /utm ('use team')
        const team = bot.getTeam(opponent);
        if (team) {
          const utmString = new Team(team).asUtm();
          Log.info('sending team msg...', utmString);
          socket.send('|/utm ' + utmString);
        }

        socket.send('|/accept ' + opponent);
      }
    });
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
   * Send a challenge to this user; maybe load your bot to find its team.
   *
   * @param {String} The nickname to challenge.
   */
  _challenge(nick) {
    console.log('challenge called.', nick);

    const team = bot.getTeam(opponent);
    if (team) {
      const utmString = new Team(team).asUtm();
      console.log('sending utm...', utmString);
      socket.send('|/utm ' + utmString);
    }
    console.log('sending challenge...', nick, AI.meta.battletype);
    socket.send('|/challenge ' + nick + ', ' + AI.meta.battletype);
  }

}

export default Challenger;
