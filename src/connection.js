import listener from './listener';
import Battle from './battle';
import url from 'url';
import WebSocket from 'ws';
// import http from 'http';
import https from 'https';
import toId from './util';
import config from './config';

let ws;


const requestUrl = url.parse(config.actionurl);

const battles = {};

class Connection {
  constructor() {
    console.log('connection constructed.');
    ws = new WebSocket('ws://localhost:8000/showdown/websocket');

    ws.on('open', () => {
      console.log('got open message from ');
    });

    ws.on('message', (msg) => {
      console.log('received: %s', msg);
      const messages = msg.split('\n');
      let bid = null;
      if (messages[0].indexOf('>') === 0) {
        console.log('found battle Id');
        bid = messages[0].split('>')[1];
        if (!battles[bid]) battles[bid] = new Battle();
      }

      for (let i = 0; i < messages.length; i++) {
        if (messages[i].indexOf('|') === 0) {
          const messageParts = messages[i].split('|');
          const passThese = messageParts.slice(2);
          if (bid) {
            battles[bid].handle(messageParts[1], passThese);
            break;
          }
          listener.relay(messageParts[1], passThese);
        }
      }
    });

    listener.subscribe('challstr', this.respondToChallenge);
  }

  send(message) {
    ws.send(message);
  }

  close(message) {
    ws.close(message);
  }

  respondToChallenge(args) {
    console.log('responding to challenge.');
    const [id, str] = args;
    console.log(id, str);

    const requestOptions = {
      hostname: requestUrl.hostname,
      port: requestUrl.port,
      path: requestUrl.pathname,
      agent: false
    };
    let data = '';
    if (!config.pass) {
      requestOptions.method = 'GET';
      requestOptions.path += '?act=getassertion&userid=' + toId(config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
    } else {
      requestOptions.method = 'POST';
      data = 'act=login&name=' + config.nick + '&pass=' + config.pass + '&challengekeyid=' + id + '&challenge=' + str;
      requestOptions.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length
      };
    }
    const req = https.request(requestOptions, (res) => {
      res.setEncoding('utf8');
      let chunks = '';
      res.on('data', (chunk) => {
        chunks += chunk;
      });
      res.on('end', () => {
        if (chunks === ';') {
          console.error('failed to log in; nick is registered - invalid or no password given');
          process.exit(-1);
        }
        if (chunks.length < 50) {
          console.error('failed to log in: ' + chunks);
          process.exit(-1);
        }
        if (chunks.indexOf('heavy load') !== -1) {
          console.error('the login server is under heavy load; trying again in one minute');
          setTimeout((() => {
            return this.handleMessage(message);
          }).bind(this), 60 * 1000);
          return;
        }
        if (chunks.substr(0, 16) === '<!DOCTYPE html>') {
          console.error('Connection error 522; trying agian in one minute');
          setTimeout((() => {
            return this.handleMessage(message);
          }).bind(this), 60 * 1000);
          return;
        }
        // getting desparate here...
        try {
          chunks = JSON.parse(chunks.substr(1));
          if (chunks.actionsuccess) {
            chunks = chunks.assertion;
          } else {
            error('could not log in; action was not successful: ' + JSON.stringify(chunks));
            process.exit(-1);
          }
        } catch (err) {
          console.error('error trying to parse data:', err, chunks);
        }
        console.log('sending turn...');
        ws.send('|/trn ' + config.nick + ',0,' + chunks);
      });
    });

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
