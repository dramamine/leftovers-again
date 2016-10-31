// ==UserScript==
// @name         Pokemon Showdown Helper
// @namespace    http://metal-heart.org/
// @version      0.6
// @description  enter something useful
// @author       marten
// @include        http://play.pokemonshowdown.com/*
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
GM_addStyle('.battlecontrols p { margin: 2px 0 0 0; }');
GM_addStyle('.lgn.bad { color: red }');
GM_addStyle('.lgn.good { color: green }');
GM_addStyle('.lgn.smaller { font-size: smaller }');

const ws = new unsafeWindow.WebSocket('ws://localhost:7331');
let isOpen = false;
const msgQueue = [];


const proc = (data) => {
  console.log('proc called.');
  // check to see if the options are visible yet
  if ($('.switchmenu button:visible').length > 0) {
    console.log('found it.');
    if (data.moves) {
      handleMoves(data.moves);
    }
    // if (data.opponent) onOpponentData(data.opponent);
    // if (data.switches) onSwitchData(data.switches);
  } else {
    console.log('setting timeout since buttons werent there yet');
    setTimeout(proc, 1000, data);
  }
};

// set up listeners and send off queued messages
ws.onopen = () => {
  console.log('websocket opened.');

  ws.onmessage = (msg) => {
    console.log('received msg ', msg);
    $('.battle-log .inner').append('<p>' + msg.data + '</p>');

    // consider relaying message.
    console.log(msg.data, unsafeWindow.room.id);
    if (msg.data && msg.data.indexOf(unsafeWindow.room.id) === 0) {
      if (msg.data.indexOf('/choose') >= 0) {
        console.log('forwarding this decision onward...', msg.data);
        unsafeWindow.app.socket.send(msg.data);
      } else if (msg.data.indexOf('yrwelcome') > 0) {
        const goods = msg.data.split('|').pop();
        console.log('proccin the goods..', goods);
        proc(JSON.parse(goods));
      }
    }
  };

  isOpen = true;

  while (msgQueue.length) {
    console.log('sending from queue:', msgQueue[0]);
    ws.send(msgQueue.shift());
  }
};

// retrieve the data we want
const callhome = () => {
  ws.send('>' + unsafeWindow.room.id + '\n|ask4help');
};

const clear = () => {
  console.log('clearing out all lgn\'s');
  $('.lgn').remove();
};

// listen to Showdown's websocket connection
const listen = () => {
  console.log(unsafeWindow.app);
  if (!(unsafeWindow.app && unsafeWindow.app.socket)) {
    console.log('waiting...');
    setTimeout(listen, 1000);
    return;
  }
  console.log('hijacking app socket');

  // preserve current behavior
  const souper = unsafeWindow.app.socket.onmessage;
  unsafeWindow.app.socket.onmessage = (msg) => {
    console.log('onmessage: ', msg.data);
    souper(msg);

    if (isOpen) {
      ws.send(msg.data);
    } else {
      msgQueue.push(msg.data);
    }

    if (msg.data.indexOf('|turn') > 0) {
      console.log('calling home...');
      callhome();
    }

    if (msg.data.indexOf('|start') >= 0) {
      const helpButton = '<button class="help">HELP!!</button>';
      $('.battle-options div').prepend(helpButton);
      $('button.help').click(callhome);

      // temporarily add a 'clear' button
      const clearButton = '<button class="lgnclear">CLEAR</button>';
      $('.battle-options div').prepend(clearButton);
      $('button.lgnclear').click(clear);
    }
  };
};

const handleMoves = (moves) => {
  for (let i = 0; i < moves.length; i++) {
    console.log('.movemenu button[value=' + (i + 1) + '] small', moves[i].html);
    $('.movemenu button[value=' + (i + 1) + '] small')
      .first()
      .after(moves[i].html);
  }
};

const onMoveData = (moves) => {
  for (let i = 0; i < moves.length; i++) {
    console.log(moves[i]);
    $('.movemenu button[value=' + (i + 1) + '] small')
      .first()
      .after('<small class="lgn damage">' +
        moves[i].dmgMin + '-' + moves[i].dmgMax + '</small> (' +
        _getKOString(
          moves[i].koChance,
          moves[i].koTurns,
          'small'
        ) + ')'
      );
  }
};

const onOpponentData = (opponent) => {
  if (!opponent) return;
  let arrows = '';
  if (opponent.hasWeakness) arrows += _getIcon('&uarr;', 'green');
  if (opponent.hasStrength) arrows += _getIcon('&darr;', 'red');

  $('.statbar.lstatbar strong')
    .after(arrows);
};

const onSwitchData = (switches) => {
  // value seems to be 0-5
  // but is '[Species or Name],active' for the active mon
  let myBest;
  let yourBest;
  for (let i = 0; i < switches.length; i++) {
    console.log(switches[i]);
    myBest = switches[i].myBest;
    yourBest = switches[i].yourBest;

    const searchVal = (switches[i].active)
      ? switches[i].species + ',active'
      : i;

    let hitsForClass = '';
    if (myBest.dmgMax < 125) hitsForClass = 'bad';
    else if (myBest.dmgMax > 250) hitsForClass = 'good';

    let getsHitClass = '';
    if (yourBest.dmgMax < 125) getsHitClass = 'good';
    else if (yourBest.dmgMax > 250) getsHitClass = 'bad';

    $('.switchmenu button[value="' + searchVal + '"] span.hpbar')
      .before(
        _getDmgString(
          hitsForClass,
          myBest.dmgMax,
          myBest.name,
          'Hits for'
        ) +
        _getKOString(
          myBest.koChance,
          myBest.koTurns,
          'p'
        ) +
        _getDmgString(
          getsHitClass,
          yourBest.dmgMax,
          yourBest.name,
          'Hit by'
        ) +
        _getKOString(
          yourBest.koChance,
          yourBest.koTurns,
          'p'
        )
      );
  }
};

const _getIcon = (str, color) => {
  return '<small class="lgn icon ' + color + '">' + str + '</small>';
};

const _getDmgString = (className, dmg, move, str) => {
  return '<p class="lgn smaller ' + className + '">' + str + ': ' + dmg + '(' + move + ')</p>';
};

const _getKOString = (chance, turn, elm) => {
  console.log('_getKOString called w ', chance, turn, elm);
  if (!turn || turn > 9) return '';
  if (turn === 1) turn = 'O';

  return '<' + elm + ' class="lgn smaller">' + chance +
    '% for ' + turn + 'HKO' + '</' + elm + '>';
};

listen();
