// import listener from './listener';
import socket from 'socket';
import config from 'config';
import Team from 'lib/team';

/**
 * Used for managing challenges to other users.
 */
class Challenger {
  constructor() {
  }

  /**
   * Take a join message and challenge everyone who's in the lobby.
   * @param  {array?} args An array containing the comma-separated list of
   * usernames.
   *
   */
  challengeOnJoin(args) {
    let user; // user for iterator
    const [usersStr] = args;
    const userList = usersStr.split(', ');
    // userlist[0] is just the count of users. skip it
    for (let i = 1; i < userList.length; i++) {
      user = userList[i];
      // don't challenge yourself. (ha)
      if (config.nick !== user) {
            // @TODO this is arranged badly
        const Bot = require(config.botPath);
        const AI = new Bot();
        console.log('checking meta...');
        if (AI.meta.battletype === 'anythinggoes') {
          const utmString = new Team( AI.getTeam(user) ).asUtm();
          console.log('sending utm...', utmString);
          socket.send('|/utm ' + utmString);
        }
        console.log('sending challenge...', userList[i], AI.meta.battletype);
        socket.send('|/challenge ' + userList[i] + ', ' + AI.meta.battletype);
      }
    }
  }

  /**
   * Consider challenging this user.
   *
   * @param  {[type]} nick [description]
   * @return {[type]}      [description]
   */
  challenge(nick) {
    console.log('challenge called.', nick);
    const args = process.argv.slice(2);
    if ( args.find(x => x === '--spawned') ) {
      // only issue challenges in non-spawned copies
      return;
    }

    const Bot = require(config.botPath);
    const AI = new Bot();
    console.log('checking meta...');
    if (AI.meta.battletype === 'anythinggoes') {
      const utmString = new Team( AI.getTeam(nick) ).asUtm();
      console.log('sending utm...', utmString);
      socket.send('|/utm ' + utmString);
    }
    console.log('sending challenge...', nick, AI.meta.battletype);
    socket.send('|/challenge ' + nick + ', ' + AI.meta.battletype);
  }
}

const challenger = new Challenger();
export default challenger;
