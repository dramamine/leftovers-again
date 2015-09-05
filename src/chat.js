import listener from './listener';
import connection from './connection';
import config from './config';

class Chat {
  constructor() {
    listener.subscribe('updateuser', this.onUpdateUser);
    listener.subscribe('users', this.onUsers);
  }

  onUpdateUser(...args) {
    const [nick, status] = args;
    if (status !== '1') {
      // console.error(`failed to log in, still guest (status code ${status})`);
      return false;
    }
    if (nick !== config.nick) {
      // console.error('nickname was ', nick, ' expecting ', config.nick);
      return false;
    }

    connection.send('|/join ' + config.chatroom);
  }

  onUsers(args) {
    let user; // user for iterator
    const [usersStr] = args;
    const userList = usersStr.split(', ');
    // userlist[0] is just the count of users. skip it
    for(var i=1; i<userList.length; i++) {
      user = userList[i];
      // don't challenge yourself
      if(config.nick !== user) {
        connection.send('|/challenge ' + userList[i] + ', ' + config.battletype);
      }
    }
  }
}

const chat = new Chat();
export default chat;
