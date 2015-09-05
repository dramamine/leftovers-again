import listener from 'listener';

const ws;


const ActionUrl = url.parse('https://play.pokemonshowdown.com/~~' + 'localhost:8000' + '/action.php');

const Config = {
  nick: '5nowden' + Math.floor(Math.random() * 10000),
  chatroom: 'lobby',
  battletype: 'randombattle'
};

class Connection {
  constructor() {
    ws = new WebSocket('ws://localhost:8000/showdown/websocket');

    ws.on('open', function() {
      console.log('got open message from ')
    });

    ws.on('message', function(msg) {
      console.log('received: %s', msg);
      const messages = msg.split('\n');
      for(var i=0; i<messages.length; i++) {
        listener.handleMessage(messages[i]);
      };
    });

    listener.subscribe('challstr', respondToChallenge);


  }

  send(message) {
    ws.send(message);
  }

  respondToChallenge(args) {
    [id, str] = args;

    requestOptions = {
      hostname: ActionUrl.hostname,
      port: ActionUrl.port,
      path: ActionUrl.pathname,
      agent: false
    };
    data = '';
    if (!Config.pass) {
      requestOptions.method = 'GET';
      requestOptions.path += '?act=getassertion&userid=' + toId(Config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
    } else {
      requestOptions.method = 'POST';
      data = 'act=login&name=' + Config.nick + '&pass=' + Config.pass + '&challengekeyid=' + id + '&challenge=' + str;
      requestOptions.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      };
    }
    req = https.request(requestOptions, ( (res) => {
      res.setEncoding('utf8');
      data = '';
      res.on('data', (chunk) => {
        return data += chunk;
      });
      return res.on('end', ( () => {
        var e;
        if (data === ';') {
          console.error('failed to log in; nick is registered - invalid or no password given');
          process.exit(-1);
        }
        if (data.length < 50) {
          console.error('failed to log in: ' + data);
          process.exit(-1);
        }
        if (data.indexOf('heavy load') !== -1) {
          console.error('the login server is under heavy load; trying again in one minute');
          setTimeout((function() {
            return this.handleMessage(message);
          }).bind(this), 60 * 1000);
          return;
        }
        if (data.substr(0, 16) === '<!DOCTYPE html>') {
          console.error('Connection error 522; trying agian in one minute');
          setTimeout((function() {
            return this.handleMessage(message);
          }).bind(this), 60 * 1000);
          return;
        }
        try {
          data = JSON.parse(data.substr(1));
          if (data.actionsuccess) {
            data = data.assertion;
          } else {
            error('could not log in; action was not successful: ' + JSON.stringify(data));
            process.exit(-1);
          }
        } catch (_error) {
          e = _error;
          console.error('error trying to parse data:', e);
        }
        return ws.send('|/trn ' + Config.nick + ',0,' + data);
      }));
    }));

    req.on('error', (err) => {
      return console.error('login error: ' + err.stack);
    });

    if (data) {
      req.write(data);
    }
    return req.end();

  }

  exit() {
    ws.close();
  }

}

const connection = new Connection();
export default connection;