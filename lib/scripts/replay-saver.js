'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// check for this string at the beginning of the playback URL. only grab
// replays that match these.
const battleTypes = ['/randombattle-'];

// how many user pages to search before quitting
/**
 * This is a script for gathering replays from Pokemon Showdown. I don't know
 * if they'd be too happy about it; this is hitting their webserver a lot and
 * doesn't limit the requests to, say, 1 per second.
 *
 * Here are some parameters you might want to mess with:
 *
 * maxPages: The script recursively searches for users who fought in the
 * battles we're looking up. This could go almost indefinitely. Because of
 * this, the script stops searching after it's searched for `maxPages` users.
 * types: which kinds of battles we want to scrape.
 *
 * battleTypes: Which battle types to scrape. ex. you might want '/ou-' or
 * '/uu-' battles. Right now it's just gathering 'random' battles.
 *
 * With maxPages at 100 and random battles only, the script generally runs
 * for 90-120 seconds and pulls <1000 battles.
 *
 * 0 * * * * cd ~/leftovers-again/scripts/ && babel-node replay-saver.js >
 *   ~/leftovers-again/replays/replay-saver.out
 */

const maxPages = 100;

// for timing info
const start = new Date().getTime();

// replays counter
let replays = 0;

// pages counter. how many searches have we run?
let pages = 0;

const options = {
  host: 'replay.pokemonshowdown.com',
  path: '/'
};

function searchFor(user) {
  _fs2.default.exists('../replays/search-' + user, existence => {
    if (existence) return;
    _fs2.default.writeFile('../replays/search-' + user, '');
    _http2.default.request({
      host: options.host,
      path: `/search?user=${ user }`
    }, handleIndex).end(); // eslint-ignore-line
    pages++;
  });
}

function handleReplay(res) {
  let html = '';
  // another chunk of data has been recieved, so append it to `str`
  res.on('data', chunk => {
    html += chunk;
  });

  // the whole response has been recieved, so we just print it out here
  res.on('end', () => {
    const body = _cheerio2.default.load(html);
    const output = body('.log').text();
    const destination = '../replays' + res.req.path;

    _fs2.default.writeFile(destination, output);
    replays++;

    // find more battles
    if (pages >= maxPages) return;

    body('h1 a.subtle').each((i, el) => {
      const pre = '//pokemonshowdown.com/users/';
      const sub = el.attribs.href;
      if (sub.indexOf(pre) === 0) {
        searchFor(sub.substring(pre.length));
      }
    });
  });
}

function maybeRequest(path) {
  _fs2.default.exists('../replays' + path, existence => {
    if (existence) return;
    _http2.default.request({
      host: options.host,
      path: path
    }, handleReplay).end();
  });
}

function handleHtml(html) {
  const body = _cheerio2.default.load(html);
  body('li a').each((i, el) => {
    const sub = el.attribs.href;
    battleTypes.forEach(type => {
      if (sub.indexOf(type) === 0) {
        maybeRequest(sub);
      }
    });
  });
}

function handleIndex(res) {
  let html = '';
  // another chunk of data has been recieved, so append it to `str`
  res.on('data', chunk => {
    html += chunk;
  });

  // the whole response has been recieved, so we just print it out here
  res.on('end', () => {
    handleHtml(html);
  });
}

_http2.default.request(options, handleIndex).end();

process.on('exit', () => {
  const end = new Date().getTime();
  console.log(`${ new Date().toUTCString() }: processed ${ pages } pages and ${ replays } replays in ${ (end - start) / 1000 } seconds.`);
});