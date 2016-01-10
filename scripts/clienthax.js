// ==UserScript==
// @name         Pokemon Showdown Helper
// @namespace    http://metal-heart.org/
// @version      0.4
// @description  enter something useful
// @author       marten
// @include        http://play.pokemonshowdown.com/*
// @include      file:///*/Pokemon-Showdown-Client/*
// @grant        GM_addStyle
// @grant        unsafeWindow
//
// in Tampermonkey, just require your local file when developing. ex.
// for linux: require      file:///media/marten/PERPETUAL_GAZE/leftovers-again/scripts/clienthax.js
// @require      file:///Users/martins/src/leftovers-again/scripts/clienthax.js
// ==/UserScript==
console.log('hello from clienthax.js!');

GM_addStyle('.switchmenu button { width: 150px; }');
GM_addStyle('span.hpbar { width: 92px; margin: auto; }');
GM_addStyle('.movemenu button { width: 306px; }');
GM_addStyle('.lgn.bad { color: red }');
GM_addStyle('.lgn.good { color: green }');
GM_addStyle('.lgn.smaller { font-size: smaller }');


var ws = new unsafeWindow.WebSocket('ws://localhost:7331');
var isOpen = false;
var msgQueue = [];

// set up listeners and send off queued messages
ws.onopen = function() {
  console.log('websocket opened.');

  ws.onmessage = function(msg) {
    console.log('received msg ', msg);
    $('.battle-log .inner').append('<p>' + msg.data + '</p>');

    var proc = function(data) {
      console.log('proc called.');
      // check to see if the options are visible yet
      if ($('.switchmenu button:visible').length > 0) {
        console.log('found it.');
        if (data.moves) _onMoveData(data.moves);
        if (data.opponent) _onOpponentData(data.opponent);
        if (data.switches) _onSwitchData(data.switches);
      } else {
        console.log('setting timeout...');
        setTimeout(proc, 1000, data);
      }
    }
    proc(JSON.parse(msg.data));



  };

  isOpen = true;

  while(msgQueue.length) {
    console.log('sending from queue:', msgQueue[0]);
    ws.send(msgQueue.shift());
  }
};

// retrieve the data we want
var callhome = function() {
  ws.send('>' + unsafeWindow.room.id + '\n|ask4help');
};

var clear = function() {
  console.log('clearing out all lgn\'s');
  $('.lgn').remove();
}

// listen to Showdown's websocket connection
var listen = function() {
  console.log(unsafeWindow.app);
  if(!(unsafeWindow.app && unsafeWindow.app.socket)) {
    console.log('waiting...');
    return setTimeout( listen, 1000 );
  }
  console.log('hijacking app socket');
  var prevfn = unsafeWindow.app.socket.onmessage;
  unsafeWindow.app.socket.onmessage = function(msg) {
    prevfn(msg);

    if(isOpen) {
      ws.send(msg.data)
    } else {
      msgQueue.push(msg.data);
    }

    if(msg.data.indexOf('|turn') > 0) {
      console.log('calling home...');
      callhome();
    }

    if(msg.data.indexOf('|start') >= 0) {
      var helpButton = '<button class="help">HELP!!</button>';
      $('.battle-options div').prepend(helpButton);
      $('button.help').click(callhome);

      // temporarily add a 'clear' button
      var clearButton = '<button class="lgnclear">CLEAR</button>';
      $('.battle-options div').prepend(clearButton);
      $('button.lgnclear').click(clear);

    }

  };
};

var _onMoveData = function(moves) {
  for (var i = 0; i < moves.length; i++) {
    $('.movemenu button[value=' + (i + 1) + '] small')
      .first()
      .after('<small class="lgn damage">' +
        moves[i].dmgMin + '-' + moves[i].dmgMax +
        '</small><small class="lgn damage">(' +
        moves[i].koChance + '% for ' + moves[i].koTurn + 'HKO</small>');

  }
};

var _opponentData = function(opponent) {
  if(!opponent) return;
  var arrows = '';
  if(opponent.hasWeakness) arrows += _getIcon('&uarr;', 'green');
  if(opponent.hasStrength) arrows += _getIcon('&darr;', 'red');

  $('.statbar.lstatbar strong')
    .after(arrows);
};

var _onSwitchData = function(switches) {
  // value seems to be 0-5
  // but is '[Species or Name],active' for the active mon
  for (var i = 0; i < switches.length; i++) {
    console.log(switches[i]);
    var searchVal = (switches[i].active)
      ? switches[i].species + ',active'
      : i;
    var hitsFor = '' + switches[i].myBest.dmgMax + '(' + switches[i].myBest.name + ')';
    var getsHitFor = '' + switches[i].yourBest.dmgMax + '(' + switches[i].yourBest.name + ')';
    var hitsForClass = '';
    if(switches[i].myBest.dmgMax < 125) hitsForClass = 'bad';
    else if(switches[i].myBest.dmgMax > 250) hitsForClass = 'good';

    var getsHitClass = '';
    if(switches[i].yourBest.dmgMax < 125) getsHitClass = 'good';
    else if(switches[i].yourBest.dmgMax > 250) getsHitClass = 'bad';

    console.log(hitsFor, getsHitClass);
    $('.switchmenu button[value="' + searchVal + '"] span.hpbar')
      .before('<p class="lgn smaller ' + hitsForClass + '">Hits for: ' + hitsFor +
        '</p><p class="lgn smaller">' + switches[i].myBest.koChance +
        '% for ' + switches[i].myBest.koTurn + 'HKO' +
        '</p><p class="lgn smaller ' + getsHitClass + '">Gets hit for: ' + getsHitFor + '</p>');
  }
};

var _getIcon = function(str, color) {
  return '<small class="lgn icon ' + color + '">' + str + '</small>';
}

listen();
