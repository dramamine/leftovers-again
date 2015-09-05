// load all the modules we need
import chat from './chat';
import listener from './listener';
import connection from './connection';



// import WebSocket from 'ws';
// import querystring from 'querystring';
// import http from 'http';
// import https from 'https';
// import url from 'url';

// const querystring = require('querystring');
// const http = require('http');
// const https = require('https');
// const url = require('url');


// const ActionUrl = url.parse();

// const Config = {
//   nick: '5nowden' + Math.floor(Math.random() * 10000),
//   chatroom: 'lobby',
//   battletype: 'randombattle'
// };


// const handleMessage = function(message) {
//   var data, id, req, requestOptions, spl, str;
//   spl = message.split('|');
//   switch (spl[1]) {
//     // case 'updateuser':
//     //   if (spl[2] !== Config.nick) {
//     //     console.log('nickname was ', spl[2], ' expecting ', Config.nick);
//     //     return;
//     //   }
//     //   if (spl[3] !== '1') {
//     //     console.error('failed to log in, still guest');
//     //     return;
//     //   }
//     //   console.log('logged in as ' + spl[2]);

//     //   ws.send('|/join ' + Config.chatroom);
//     //   break;
//       // return console.log('would send', '|/blockchallenges');
//     // case 'challstr':
//     //   console.info('received challstr, logging in...');
//     //   id = spl[2];
//     //   str = spl[3];
//     //   requestOptions = {
//     //     hostname: ActionUrl.hostname,
//     //     port: ActionUrl.port,
//     //     path: ActionUrl.pathname,
//     //     agent: false
//     //   };
//     //   data = '';
//     //   if (!Config.pass) {
//     //     requestOptions.method = 'GET';
//     //     requestOptions.path += '?act=getassertion&userid=' + toId(Config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
//     //   } else {
//     //     requestOptions.method = 'POST';
//     //     data = 'act=login&name=' + Config.nick + '&pass=' + Config.pass + '&challengekeyid=' + id + '&challenge=' + str;
//     //     requestOptions.headers = {
//     //       'Content-Type': 'application/x-www-form-urlencoded',
//     //       'Content-Length': data.length
//     //     };
//     //   }
//     //   req = https.request(requestOptions, ( (res) => {
//     //     res.setEncoding('utf8');
//     //     data = '';
//     //     res.on('data', (chunk) => {
//     //       return data += chunk;
//     //     });
//     //     return res.on('end', ( () => {
//     //       var e;
//     //       if (data === ';') {
//     //         console.error('failed to log in; nick is registered - invalid or no password given');
//     //         process.exit(-1);
//     //       }
//     //       if (data.length < 50) {
//     //         console.error('failed to log in: ' + data);
//     //         process.exit(-1);
//     //       }
//     //       if (data.indexOf('heavy load') !== -1) {
//     //         console.error('the login server is under heavy load; trying again in one minute');
//     //         setTimeout((function() {
//     //           return this.handleMessage(message);
//     //         }).bind(this), 60 * 1000);
//     //         return;
//     //       }
//     //       if (data.substr(0, 16) === '<!DOCTYPE html>') {
//     //         console.error('Connection error 522; trying agian in one minute');
//     //         setTimeout((function() {
//     //           return this.handleMessage(message);
//     //         }).bind(this), 60 * 1000);
//     //         return;
//     //       }
//     //       try {
//     //         data = JSON.parse(data.substr(1));
//     //         if (data.actionsuccess) {
//     //           data = data.assertion;
//     //         } else {
//     //           error('could not log in; action was not successful: ' + JSON.stringify(data));
//     //           process.exit(-1);
//     //         }
//     //       } catch (_error) {
//     //         e = _error;
//     //         console.error('error trying to parse data:', e);
//     //       }
//     //       return ws.send('|/trn ' + Config.nick + ',0,' + data);
//     //     }));
//     //   }));

//     //   req.on('error', (err) => {
//     //     return console.error('login error: ' + err.stack);
//     //   });

//     //   if (data) {
//     //     req.write(data);
//     //   }
//     //   return req.end();
//     case 'j':
//     case 'l':
//     case ':':
//     case 'init':
//       break;
//       // this is a multiline message.
//       // message.split('\n');
//       // break;
//     // case 'users':
//     //   var userList = spl[2].split(', ');
//     //   let user;
//     //   // userlist[0] is just the count of users. skip it
//     //   for(var i=1; i<userList.length; i++) {
//     //     user = userList[i];
//     //     // don't challenge yourself
//     //     if(Config.user !== user) {
//     //       console.log('challenging user..', userList[i]);
//     //       ws.send('|/challenge ' + userList[i] + ', ' + Config.battletype);
//     //     }
//     //   }
//     //   break;
//     // case 'updatechallenges':
//     //   let challenges = JSON.parse(spl[2]);
//     //   console.log(challenges);
//     //   for (let username in challenges.challengesFrom) {
//     //     // only accept battles of the type we're designed for
//     //     if (challenges.challengesFrom[username] == Config.battletype) {
//     //       // this is the point at which we need to pick a team!
//     //       // TODO use promises here to maybe wait for user to pick a team
//     //       // team message is: /utm ('use team')
//     //       ws.send('|/accept ' + username);
//     //     }
//     //   }
//     default:
//       return console.log('not really handling message', spl[1]);
//   }
// };


/**
 * This is kind of crappy, but this helps out with testing. When you're using
 * nodemon for 'livereload'-ish functionality, you want to close your connection
 * before you do anything.
 *
 * @param  {[type]} options [description]
 * @param  {[type]} err     [description]
 * @return {[type]}         [description]
 */
function exitHandler(options, err) {
  if (options.cleanup) console.log('clean');
  if (err) console.log(err.stack);
  connection.close();
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
