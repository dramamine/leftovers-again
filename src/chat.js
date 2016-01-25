import listener from 'listener';
import socket from 'socket';
import config from 'config';
import Team from 'lib/team';
import challenger from 'challenger';
import Log from 'log';

class Chat {
  constructor() {
    listener.subscribe('updateuser', this.onUpdateUser);

  }

  destroy() {
    listener.unsubscribe('updateuser', this.onUpdateUser);
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
}

export default Chat;
