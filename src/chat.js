import listener from './listener';
import socket from './socket';
import config from './config';
import Team from './lib/team';

class Chat {
  constructor() {
    listener.subscribe('updateuser', this.onUpdateUser);
    listener.subscribe('updatechallenges', this.acceptChallenges);

    const args = process.argv.slice(2);
    // console.log(args);

    if ( !args.find(x => x === '--spawned') ) {
      // only issue challenges in non-spawned copies
      // the main dude issues all challenges; spawns just sit back and relax.
      // otherwise, spawns would all challenge each other and overheat and die
      listener.subscribe('users', this.challengeOnJoin);
    }
  }

  destroy() {
    listener.unsubscribe('updateuser', this.onUpdateUser);
    listener.unsubscribe('updatechallenges', this.acceptChallenges);
    listener.unsubscribe('users', this.challengeOnJoin);
  }

  onUpdateUser(args) {
    // this includes a 3rd parameter, i.e. "mysterycode". who knows.
    const [nick, status] = args;
    if (status !== '1') {
      console.error(`failed to log in, still guest (status code ${status})`);
      return false;
    }
    if (nick !== config.nick) {
      console.error('nickname was ', nick, ' expecting ', config.nick);
      return false;
    }

    socket.send('|/join ' + config.chatroom);
  }

  challengeOnJoin(args) {
    let user; // user for iterator
    const [usersStr] = args;
    const userList = usersStr.split(', ');
    // userlist[0] is just the count of users. skip it
    for (let i = 1; i < userList.length; i++) {
      user = userList[i];
      // don't challenge yourself
      if (config.nick !== user) {
            // @TODO this is arranged badly
        console.log('challengeOnJoin creating AI');
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

  acceptChallenges(args) {
    console.log('acceptChallenges called...');
    console.log('acceptChallenges creating AI');
    const Bot = require(config.botPath);
    const AI = new Bot();
    const challenges = JSON.parse(args);
    for (const username in challenges.challengesFrom) {
      // only accept battles of the type we're designed for
      if (challenges.challengesFrom[username] === AI.meta.battletype) {
        // this is the point at which we need to pick a team!
        // TODO use promises here to maybe wait for user to pick a team
        // team message is: /utm ('use team')
        const utmString = new Team( AI.getTeam(username) ).asUtm();
        console.log('sending utm...', utmString);
        socket.send('|/utm ' + utmString);

        socket.send('|/accept ' + username);
      }
    }
  }
}

export default Chat;
