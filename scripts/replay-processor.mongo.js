// run with:
// mongo scripts/replay-processor.mongo.js
var opts = {
  allowDiskUse: true,
  cursor: {}
};

// start: 2015-11-17T19:29:28.911-0800
// end:   2015-11-17T19:33:36.081-0800
var populateFirstMoves = function() {
  db.firstmoves.drop();

  db.events.aggregate([
    { $match: {type: 'move'} },
    { $sort: {turn: 1 } },
    { $group: {
          _id: { from: "$from", matchid: "$matchid", player: "$player" },
          firstMove: { $first: "$move" }
      } },
    { $group: {
      _id: { from: "$_id.from", move: "$firstMove" },
      count: {$sum: 1}
    } },
    { $out: "firstmoves" }
  ], opts);
}

var getBigrams = function() {
  // bigrams
  populateMessyBigrams();
  populateBigrams();
}

// start: 2015-11-17T19:42:19.853-0800
// end:   2015-11-17T19:56:41.281-0800
var populateMessyBigrams = function() {
  db.messybigrams.drop();

  var mapfn = function() {
    var key = {
      matchid: this.matchid,
      player: this.player,
      species: this.from
    };
    var value = {
      move: this.move,
      turn: this.turn
    };

    emit(key, value);
  };

  var reducefn = function(key, values) {
    print('reduce called.');
    // print(key.species);
    // print(values[0].move);

    var bigrams = [];
    // @TODO better sort this by turn for safety.
    for (var i = 1; i < values.length; i++) {
      // don't count swap-ins
      if( values[i].turn - values[i-1].turn > 2) continue;

      bigrams.push([values[i-1].move, values[i].move]);
    }
    print(key.species);
    print(bigrams);
    return {
      _id: key.species,
      value: bigrams
    };
  };

  db.events.mapReduce(
    mapfn,
    reducefn,
    { query: {type: 'move'},
      sort: {matchid: 1, player: 1, turn: 1 },
      out: 'messybigrams'
    }
  );
}

// messyBigrams output looks like this:
//
// {
//   "_id": {
//     "matchid": "randombattle-100002682",
//     "player": "p2",
//     "species": "Meganium"
//   },
//   "value": {
//     "_id": "Meganium",
//     "value": [
//       ["Light Screen", "Reflect"],
//       ["Reflect", "Giga Drain"],
//       ["Giga Drain", "Giga Drain"],
//       ["Giga Drain", "Giga Drain"],
//       ["Giga Drain", "Giga Drain"],
//       ["Giga Drain", "Giga Drain"]
//     ]
//   }
// }


// start: 2015-11-19T22:09:56.212-0800
// end:   2015-11-19T22:11:26.071-0800
var populateBigrams = function() {
  db.bigrams.drop();

  var bmapfn = function() {

    // species
    var key = this.value._id;
    if (key === undefined) return;
    var value = this.value.value;

    emit(key, value);
  };

  var breducefn = function(key, results) {

    var _appendPairToTally = function(pair, tally) {
      var key = pair[0] + '::' + pair[1];
      // print('looking for key:', key);
      if(tally[key]) {
        tally[key] = tally[key] + 1;
      } else {
        tally[key] = 1;
      };
      return tally;
    };

    var tally = {};
    results.forEach( function(result) {

      if(Array.isArray(result)) {
        // print('DEALING with an array...');
        result.forEach( function(v) {
          tally = _appendPairToTally(v, tally);
        });
      } else {
        print('result sez: wat is this');
        printjson(result);
      }

    });
    return tally;
  };

  var finalizefn = function(key, reducedVal) {
    var bigramcounts = reducedVal;

    var _appendPairToTally = function(pair, tally) {
      var key = pair[0] + '::' + pair[1];
      if(tally[key]) {
        tally[key] = tally[key] + 1;
      } else {
        tally[key] = 1;
      };
      return tally;
    };


    var output;
    if (Array.isArray(reducedVal)) {
      var tally = {};
      reducedVal.forEach( function(result) {
        tally = _appendPairToTally(result, tally);
      });
      output = tally;
    } else {
      output = reducedVal;
    }

    return output;
  };

  db.messybigrams.mapReduce(
    bmapfn,
    breducefn,
    {
      out: 'bigrams',
      finalize: finalizefn
      // query: {"_id.matchid" : { $lt: "randombattle-100010529"} }
    }
  );
}

var getMatchupMoves = function() {
  // great! now let's get matchup data.
  db.matchupfirstmoves.drop();

  db.events.aggregate([
    { $match: {type: 'move'} },
    { $sort: {turn: 1 } },
    { $group: {
          _id: { from: "$from",
            to: "$to",
            matchid: "$matchid",
            player: "$player" },
          firstMove: { $first: "$move" }
      } },
    { $group: {
      _id: { from: "$_id.from", to: "$_id.to", move: "$firstMove" },
      count: {$sum: 1}
    } },
    { $out: "matchupfirstmoves" }
  ], opts);

  db.matchupmoves.drop();

  db.events.aggregate([
    { $match: {type: 'move'} },
    { $group: {
        _id: { from: "$from",
          to: "$to",
          matchid: "$matchid",
          player: "$player" },
        count: {$sum: 1}
      } },
    { $out: "matchupmoves" }
  ], opts);
}

// Populates the messymatchupresults table.
// Requires: 'events'
//
// This function uses one turn in a given match as its key; from this, we
// derive what happened on that turn - did any players die? Did any players
// switch?
//
// Results look like this:
// {
//   "_id": {
//     "matchid": "randombattle-100001529",
//     "turn": 4
//   },
//   "value": {
//     "matchup": "Dunsparce::Wigglytuff",
//     "results": { "bkilled" : 1 }
//   }
// }
//
// The pokemon species matchup and 'what happened' are the two pieces of data
// we want. We return 'value' here because we want to tally these later (_id will be
// scrapped)
//
// These are inserted into messymatchupresults for processing in the next step.
//
var messyMatchupResults = function() {
  db.messymatchupresults.drop();

  // for the first map-reduce function, we're just trying to figure out what
  // happened on a given turn.
  var mmapfn = function() {
    var key = {
      matchid: this.matchid,
      turn: this.turn
    };
    var value = {
      type: this.type,
      move: this.move,
      from: this.from,
      to: this.to,
      player: this.player,
      killed: this.killed
    };

    // print('gonna emit these:', key, value);
    emit(key, value);
  };

  // test for the above: should be a move from Klink then a move from Starly
  // whatWeCareAbout([
  // { "type" : "move", "player" : "p1", "turn" : 1, "from" : "Starly"},
  // { "type" : "switch", "player" : "p1", "turn" : 1, "from" : "Starly"},
  // { "type" : "move", "player" : "p2", "turn" : 1, "from" : "Klink"}
  // ]);

  var mreducefn = function(key, values) {
    var selfkey = key;
    var selfvalues = values;

    var whatWeCareAbout = function(events) {
      var movesFirst = function (a, b) {
        if (a.type > b.type) {
          return 1;
        }
        if (a.type < b.type) {
          return -1;
        }
        return 0;
      };

      var bySpecies = function (a, b) {
        if (a.from > b.from) {
          return 1;
        }
        if (a.from < b.from) {
          return -1;
        }
        return 0;
      };

      if(events.length < 2) return;

      var p1events = events.filter( function(event) {
        if(!event) {
          print('wtf no player!!');
          print(tojson(selfkey));
          print(tojson(selfvalues));
          exit;
        }
        return event.player === 'p1'
      }).sort(movesFirst);

      var p2events = events.filter( function(event) {
        if(!event) return false;
        return event.player === 'p2'
      }).sort(movesFirst);

      return [p1events[0], p2events[0]].sort(bySpecies);
    }

    if(values.length < 2) {
      return null;
    }

    if(values[0] === null || values[1] === null) {
      // I think this happens lots, like if only one player moves/switches
      // print('BAIL! value is null');
      // print(tojson(key), tojson(values));
      return null;
    }

    // sort by the species doing the thing

    var actions = whatWeCareAbout(values);

    var what = {};

    if(actions.length === 2 && actions[0] && actions[1]) {
      if(actions[0].killed) {
        what.bkilled = 1;
      }
      if(actions[1].killed) {
        what.akilled = 1;
      }
      if(actions[0].type === 'switch' && !what.akilled) {
        what.aswitched = 1;
      }
      if(actions[1].type === 'switch' && !what.bkilled) {
        what.bswitched = 1;
      }
      return {
        matchup: actions[0].from + '::' + actions[1].from,
        results: what
      };
    }
    return null;

  };

  var mfinalizefn = function(key, val) {
    if(val === null) return null;
    if(val.matchup) return val;
    // only one thing happened...
   var bySpecies = function (a, b) {
      if (a.from > b.from) {
        return 1;
      }
      if (a.from < b.from) {
        return -1;
      }
      return 0;
    };
    var what = {};

    var species = [val.from, val.to].sort(bySpecies);
    if(species[0] === val.from && val.killed) {
      what.bkilled = 1;
    } else if (species[1] === val.from && val.killed) {
      what.akilled = 1;
    }
    return {
      matchup: species[0] + '::' + species[1],
      results: what
    };
  };


  db.events.mapReduce(
    mmapfn,
    mreducefn,
    { query: {
      turn: {$gt: 0},
      type: {$in: ['switch', 'move']}
    },
      sort: {matchid: 1, player: 1, turn: 1 },
      out: 'messymatchupresults',
      finalize: mfinalizefn
    }
  );
}

/**
 * Populates the matchupresults table.
 * Requires: messymatchupresults
 *
 * Tally the list of matchups and results from messymatchups. The results
 * look like this:
 *  {
 *    "_id": "Charizard::Dunsparce",
 *    "value": {
 *      "akilled": 0,
 *      "bkilled": 1,
 *      "aswitched": 0,
 *      "bswitched": 0
 *    }
 *  }
 * This tells us the species matchup (by alphabetical order)
 */
var matchupResults = function() {
  db.matchupresults.drop();

  //
  var smapfn = function() {
    emit(this.value.matchup, this.value.results);
  }

  // turns a list of match results into a tally
  var sreducefn = function(key, values) {
    var result = {
      akilled: 0,
      bkilled: 0,
      aswitched: 0,
      bswitched: 0
    };

    values.forEach( function(value) {
      if(value.akilled) result.akilled++;
      if(value.bkilled) result.bkilled++;
      if(value.aswitched) result.aswitched++;
      if(value.bswitched) result.bswitched++;
    });


    return result;
  }

  db.messymatchupresults.mapReduce(
    smapfn,
    sreducefn,
    {
      query: {"value.results": {$exists: true}, "value.matchup": {$exists: true} },
      out: 'matchupresults'
    }
  );


}


var getMatchupResults = function() {
  messyMatchupResults();
  matchupResults();
}


// getMatchupResults();

// populateFirstMoves();
// populateMessyBigrams();
// populateBigrams();
// getMatchupMoves();
// messyMatchupResults();
// matchupResults();
