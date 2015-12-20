import listener from './listener';
import http from 'http';
import Connection from './connection';

const PORT = 1337;
let server;
let myextra;

class AjaxConnection extends Connection {
  constructor() {
    super();
  }

  connect() {
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
      req.on('end',  () => {
        this._handleMessage(body);
        setTimeout( () => {
          res.writeHead(200, {
            'Content-Type': 'application/json'
          });
          res.write(JSON.stringify(myextra));
          res.end();
        }, 250);
      });
    });
    server.listen(PORT);
  }

  send(message, extra) {
    myextra = extra;
  }

  close() {
    server.close();
  }


  // send(message) {
  //   ws.send(message);
  // }

  // close(message) {
  //   ws.close(message);
  // }

  // relayPopup(args) {
  //   console.log(args);
  // }

  // exit() {
  //   ws.close();
  // }
}

const ajaxConnection = new AjaxConnection();
export default ajaxConnection;
