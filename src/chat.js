import listener from 'listener';
import connection from 'connection';
import config from 'config';

class Chat {
  constructor() {
    listener.subscribe('updateuser', onUpdateUser);
    listener.subscribe('users', onUsers);
  }

  onUpdateUser(args) {
    [nick, status] = args;
    if (nick !== Config.nick) {
      console.log('nickname was ', nick, ' expecting ', Config.nick);
      return;
    }
    if (spl[3] !== '1') {
      console.error('failed to log in, still guest');
      return;
    }
    console.log('logged in as ' + nick);

    connection.send('|/join ' + Config.chatroom);
    break;
  }

  onUsers(args) {
    let user; // user for iterator
    [usersStr] = args;
    userList = usersStr.split(', ');
    // userlist[0] is just the count of users. skip it
    for(var i=1; i<userList.length; i++) {
      user = userList[i];
      // don't challenge yourself
      if(Config.user !== user) {
        console.log('challenging user..', userList[i]);
        connection.send('|/challenge ' + userList[i] + ', ' + Config.battletype);
      }
    }
  }
}