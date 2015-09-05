import http from 'http';
import cheerio from 'cheerio';
import fs from 'fs';

const start = new Date().getTime();
// replays counter
let replays = 0;

const options = {
  host: 'replay.pokemonshowdown.com',
  path: '/'
};

let pages = 0;
const maxPages = 100;

function checkThisUsersReplays(user) {
  console.log('checkThisUsersReplays called for', user);
  fs.exists('../replays/search-' + user, (existence) => {
    if (existence) return;
    fs.writeFile('../replays/search-' + user, '');
    console.log('looking up user', user);
    http.request({
      host: options.host,
      path: `/search?user=${user}`
    }, handleIndex).end(); // eslint-ignore-line

    pages++;
  });
}

function handleReplay(res) {
  let html = '';
  // another chunk of data has been recieved, so append it to `str`
  res.on('data', (chunk) => {
    html += chunk;
  });

  // the whole response has been recieved, so we just print it out here
  res.on('end', () => {
    const body = cheerio.load(html);
    const output = body('.log').text();
    const destination = '../replays' + res.req.path;

    fs.writeFile(destination, output);
    replays++;

    // find more battles
    if (pages >= maxPages) return;
    console.log(pages, maxPages);

    body('h1 a.subtle').each( (i, el) => {
      const sub = el.attribs.href;
      if (sub.indexOf('//pokemonshowdown.com/users/') === 0) {
        checkThisUsersReplays(sub.substring('//pokemonshowdown.com/users/'.length));
      }
    });
  });
}

function maybeRequest(path) {
  fs.exists('../replays' + path, (existence) => {
    if (existence) return;
    http.request({
      host: 'replay.pokemonshowdown.com',
      path: path
    }, handleReplay).end();
  });
}

function handleHtml(html) {
  const body = cheerio.load(html);
  body('li a').each( (i, el) => {
    const sub = el.attribs.href;
    if (sub.indexOf('/randombattle') === 0) {
      maybeRequest(sub);
    }
  });
}

function handleIndex(res) {

  let html = '';
  // another chunk of data has been recieved, so append it to `str`
  res.on('data', (chunk) => {
    html += chunk;
  });

  // the whole response has been recieved, so we just print it out here
  res.on('end', () => {
    handleHtml(html);
  });
}

http.request(options, handleIndex).end();

process.on('exit', () => {
  const end = new Date().getTime();
  console.log(`${new Date().toUTCString()}: processed ${pages} pages and ${replays} replays in ${(end - start) / 1000} seconds.`);
});
