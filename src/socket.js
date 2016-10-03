import https from 'https';
import WebSocket from 'ws';
import listener from './listener';
import Connection from './connection';
import Log from './log';

let ws;

class Socket extends Connection {
  connect({
    actionHost = 'play.pokemonshowdown.com',
    nickname,
    password = null,
    chatroom = 'lobby',
    server,
    port = 8000,
    format
  }) {
    this.actionurl = {
      host: actionHost,
      port: null,
      path: `/~~${server}:${port}/action.php`
    };

    this.nickname = nickname;
    this.password = password;
    this.chatroom = chatroom;
    this.format = format;

    Log.log(`connecting to: ${server}:${port}`);
    this.build(`ws://${server}:${port}/showdown/websocket`);

    listener.subscribe('challstr', this.login.bind(this));
    listener.subscribe('updateuser', this.onUpdateUser.bind(this));
    listener.subscribe('popup', this.relayPopup);
    // defined message type for calling from battles, etc.
    listener.subscribe('_send', this.send);
  }

  /**
   * Build your socket.
   *
   * @param  {String} addy The address of the socket.
   */
  build(addy) {
    ws = new WebSocket(addy);

    ws.on('open', () => {
      Log.log('Got open message from server\'s websocket.');
    });

    ws.on('message', this.handleMessage);

    ws.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        Log.error(`ECONNREFUSED when trying to connect to server at:
${addy}
Are you sure a server is running there?
Make sure you have the official server installed and running.

 Using git (preferred):

    git clone https://github.com/Zarel/Pokemon-Showdown.git
    cd Pokemon-Showdown
    npm start

Running this separately will reduce startup time and allow you to read
server logs for debugging.
`);
      }
    });
  }

  /**
   * this function will relay ANYTHING to the server, hope your message is
   * formatted right!
   *
   * @link https://github.com/Zarel/Pokemon-Showdown
   *
   * @param  {String} message [description]
   */
  send(message) {
    ws.send(message);
  }

  close(message) {
    ws.close(message);
    if (this.chat) {
      this.chat.destroy();
      this.chat = null;
    }
  }

  exit() {
    ws.close();
  }

  /**
   * Logging in to the server
   *
   * @param  {challengekeyid} String  Needed as param to login server
   * @param  {challenge} String  i.e. challengestr. Needed as param to login server
   *
   * @return null
   */
  login([challengekeyid, challenge]) {
    // console.log('responding to challenge.');
    // console.log(id, str);

    const requestOptions = {
      hostname: this.actionurl.host,
      port: this.actionurl.port,
      path: this.actionurl.path,
      agent: false
    };
    // console.log(requestOptions);
    let data = '';
    if (!this.password) {
      requestOptions.method = 'GET';
      requestOptions.path += '?act=getassertion&userid=' + encodeURI(this.nickname) + '&challengekeyid=' + challengekeyid + '&challenge=' + challenge;
    } else {
      requestOptions.method = 'POST';
      data = 'act=login&name=' + encodeURI(this.nickname) + '&pass=' + encodeURI(this.password) + '&challengekeyid=' + challengekeyid + '&challenge=' + challenge;
      requestOptions.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      };
    }
    const req = https.request(requestOptions, (res) => {
      // console.log('looking at response.');
      res.setEncoding('utf8');
      let chunks = '';
      res.on('data', (chunk) => {
        chunks += chunk;
      });
      res.on('end', () => {
        if (chunks === ';') {
          Log.error('failed to log in; nick is registered - invalid or no password given');
          process.exit(-1);
        }
        if (chunks.length < 50) {
          Log.error('failed to log in: ' + chunks);
          process.exit(-1);
        }
        if (chunks.indexOf('heavy load') !== -1) {
          Log.error('the login server is under heavy load; trying again in one minute');
          process.exit(-1);
        }
        if (chunks.substr(0, 16) === '<!DOCTYPE html>') {
          Log.error('Connection error 522; trying agian in one minute');
          process.exit(-1);
        }
        if (chunks.indexOf('|challstr|') >= 0) {
          this.handleMessage(chunks);
          return;
        }

        // GET requests: 'chunks' (the response) IS the assertion.
        // POST requests return JSON that contains the assertion.
        let assertion = chunks;
        try {
          chunks = JSON.parse(chunks.substr(1));
          if (chunks.actionsuccess && chunks.curuser.loggedin) {
            assertion = chunks.assertion;
          } else {
            Log.error(`could not log in; action was not successful: ${chunks.assertion}`);
            Log.debug(chunks);
            process.exit(-1);
          }
        } catch (err) {
          // probably nothing - probably tried to parse a GET request that ain't JSON
          // console.error('error trying to parse data:', err, chunks);
        }
        this.send('|/trn ' + this.nickname + ',0,' + assertion);
      });
    });

    req.on('error', err => Log.error('login error: ' + err.stack));

    if (data) {
      req.write(data);
    }
    return req.end();
  }

  relayPopup(args) {
    Log.warn('Got a popup:');
    Log.warn(args);
  }

  onUpdateUser([nick, status]) {
    // this includes a 3rd parameter, i.e. "mysterycode". who knows.
    if (status !== '1') {
      // console.error(`failed to log in, still guest (status code ${status})`);
      return false;
    }
    if (nick !== this.nickname) {
      Log.error('nickname was ', nick, ' expecting ', this.nickname);
      return false;
    }

    socket.send('|/join ' + this.chatroom);

    // also try to join a room according to our battle format
    if (this.format) socket.send('|/join ' + this.format);
    return true;
  }
}

const socket = new Socket();
export default socket;
