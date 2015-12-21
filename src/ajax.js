import http from 'http';
import Connection from './connection';
import log from './log';

const PORT = 1337;
let server;

class Ajax extends Connection {
  constructor() {
    super();
  }

  connect() {
    console.log('creating a server.');
    server = http.createServer( (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Request-Method', '*');

      // check if this request needs a response
      // if so, save the res to class
      // hopefully we can process it the same way.

      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      const self = this;
      req.on('end',  () => {
        console.log('got my body:' + body);
        this._handleMessage(body);
        if (body.indexOf('ask4help') > 0) {
          let bid = null;
          if (body.indexOf('>') === 0) {
            bid = body.split('|')[0].replace('>', '');
          } else {
            log.error('strange format trying to find bid.' + body);
          }

          const btl = self._getBattle(bid);
          if (!btl) {
            log.error('couldnt find my battle.' + bid);
            res.writeHead(300);
            res.end();
            return;
          }

          console.log('my battle:');
          console.log(btl);
          res.writeHead(200);
          res.write(JSON.stringify( btl.getHelp() ));
          res.end();
        }
        res.writeHead(200);
        res.end();
      });
    });
    server.listen(PORT);
  }
  send() {}

  close() {
    server.close();
  }
}

const ajax = new Ajax();
export default ajax;
