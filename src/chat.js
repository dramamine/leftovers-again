import listener from './listener';
import connection from './connection';
import config from './config';

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

  onUpdateUser(args) {
    const [nick, status, mysterycode] = args;
    if (status !== '1') {
      console.error(`failed to log in, still guest (status code ${status})`);
      return false;
    }
    if (nick !== config.nick) {
      console.error('nickname was ', nick, ' expecting ', config.nick);
      return false;
    }

    connection.send('|/join ' + config.chatroom);
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
        connection.send('|/challenge ' + userList[i] + ', ' + config.battletype);
      }
    }
  }

  acceptChallenges(args) {
    const challenges = JSON.parse(args);
    for (const username in challenges.challengesFrom) {
      // only accept battles of the type we're designed for
      if (challenges.challengesFrom[username] === config.battletype) {
        // this is the point at which we need to pick a team!
        // TODO use promises here to maybe wait for user to pick a team
        // team message is: /utm ('use team')
        connection.send('|/accept ' + username);
      }
    }
  }
}

const chat = new Chat();
export default chat;
