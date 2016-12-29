// ==UserScript==
// @name         Pokemon Showdown Helper
// @namespace    http://metal-heart.org/
// @version      0.6
// @description  enter something useful
// @author       marten
// @include      http://play.pokemonshowdown.com/*
// @include      http://*.psim.us/*
// @include      file:///*/Pokemon-Showdown-Client/*
// @grant        GM_addStyle
// @grant        unsafeWindow
//
// in Tampermonkey, just require your local file when developing. ex.
// for linux: @require      file:///mnt/PERPETUAL_GAZE/leftovers-again/scripts/clienthax.js
// for mac:   @require      file:///Users/martins/src/leftovers-again/scripts/clienthax.js
// ==/UserScript==
console.log('hello from clienthax.js!');

/* global $ GM_addStyle unsafeWindow */
/* eslint new-cap: 0 */
GM_addStyle('.switchmenu button { width: 150px; }');
GM_addStyle('span.hpbar { width: 92px; margin: auto; }');
GM_addStyle('.movemenu button { width: 306px; height: inherit; }');
GM_addStyle('.battle-controls p { margin: 2px 0 0 0; }');
GM_addStyle('.lgn.bad { color: red }');
GM_addStyle('.lgn.good { color: green }');
GM_addStyle('.lgn.smaller { font-size: smaller }');
GM_addStyle('.lgn.opponent { position: absolute; left: -20px; list-style: none; }');

const ws = new unsafeWindow.WebSocket('ws://localhost:7331');
// is our websocket open?
let isOpen = false;
const msgQueue = [];

// console.warn('marten double-checking');

// translate data from server into stuff on the screen.
// sets timeout in case we're not ready to show stuff yet.
const showHelp = (data) => {
  // check to see if the options are visible yet
  if ($('.switchmenu button:visible').length > 0) {
    if (data.moves) {
      handleMoves(data.moves);
    }
    if (data.switches) {
      handleSwitches(data.switches);
    }
    if (data.opponent) {
      handleOpponent(data.opponent);
    }
  } else {
    console.log('setting timeout since buttons werent there yet');
    setTimeout(showHelp, 1000, data);
  }
};

// set up listeners and send off queued messages
ws.onopen = () => {
  console.log('websocket opened.');

  ws.onmessage = (msg) => {
    // console.log('received msg ', msg);
    $('.battle-log .inner').append('<p>' + msg.data + '</p>');

    // consider relaying message.
    if (msg.data && msg.data.indexOf(unsafeWindow.room.id) === 0) {
      // forward choices onward
      if (msg.data.indexOf('/choose') >= 0) {
        unsafeWindow.app.socket.send(msg.data);
      // this is specifically from our bot, for us
      } else if (msg.data.indexOf('yrwelcome') > 0) {
        const goods = msg.data.split('|').pop();
        showHelp(JSON.parse(goods));
      }
    }
  };

  isOpen = true;

  while (msgQueue.length) {
    // console.log('sending from queue:', msgQueue[0]);
    ws.send(msgQueue.shift());
  }
};

// add some buttons to the UI
const addHelpButtons = () => {
  const helpButton = '<button class="help">Call Home</button>';
  $('.battle-options div').prepend(helpButton);
  $('button.help').click(callhome);

  const clearButton = '<button class="lgnclear">CLEAR</button>';
  $('.battle-options div').prepend(clearButton);
  $('button.lgnclear').click(clear);
};

// retrieve the data we want
const callhome = () => {
  console.debug('calling home...');
  ws.send('>' + unsafeWindow.room.id + '\n|ask4help');
};

const clear = () => {
  console.log('clearing out all lgn\'s');
  $('.lgn').remove();
};

// listen to Showdown's websocket connection
const listen = () => {
  if (!(unsafeWindow.app && unsafeWindow.app.socket)) {
    console.log('waiting for websocket to be available');
    setTimeout(listen, 1000);
    return;
  }

  // preserve current behavior
  const souper = unsafeWindow.app.socket.onmessage;
  unsafeWindow.app.socket.onmessage = (msg) => {

    if (isOpen) {
      ws.send(msg.data);
    } else {
      msgQueue.push(msg.data);
    }

    if (msg.data.indexOf('|turn') > 0 || msg.data.indexOf('"forceSwitch":[true]') > 0) {
      callhome();
    }

    if (msg.data.indexOf('|start') >= 0) {
      addHelpButtons();
    }

    // doing this last, so that client bugs don't crash our shit!
    souper(msg);
  };
};

const handleMoves = (moves) => {
  moves.forEach((move) => {
    $(`.movemenu button[data-move="${move.name}"] small`)
      .first()
      .after(move.html);
  });
};

const handleSwitches = (switches) => {
  for (let i = 0; i < switches.length; i++) {
    let searchVal = switches[i].species;
    // hack for fixing Kyurem-White and probably some other dudes
    if (searchVal.indexOf('-') > 0) {
      searchVal = searchVal.substr(0, searchVal.indexOf('-'));
    }

    $(`.switchmenu button:contains("${searchVal}") span.hpbar`)
      .before(switches[i].html);
  }
};

const handleOpponent = (opponent) => {
  $(`.lgn.opponent`).remove();
  $(`.rightbar .teamicons`).last().after(opponent.html);
}

listen();
