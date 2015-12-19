import listener from './listener';
import Battle from './battle';
// import url from 'url';
import http from 'http';
import util from './util';
import config from './config';

const PORT = 1337;
const battles = {};
let server;

class AjaxConnection {
  constructor() {
  }

  connect() {
    server = http.createServer( (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Request-Method', '*');

      // check if this request needs a response
      // if so, save the res to class
      // hopefully we can process it the same way.

      let body = '';
      req.on('data', function (chunk) {
        body += chunk;
      });
      req.on('end', function () {
        console.log('POSTed: ' + body);
        res.writeHead(200);
        res.write('thx');
        res.end();
      });
    });
    server.listen(PORT);
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
