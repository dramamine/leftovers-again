// DB stuff

// getting mongod to run
// shouldn't need sudo, also this should auto-run!
// moved data directory to /media/marten/PERPETUAL_GAZE/mongo
// which is why this is annoying.
// sudo mongod --config /etc/mongodb.conf &
mongod --dbpath=/media/marten/PCTU2/mongodb

// delete this someday:
//



db.matches.find();

db.randombattle.find({_id: ObjectId("562d9f75e97cf65d43e05a88")});
db.randombattle.find({damageTaken: 600});

# hmm, lets aggregate by move
db.events.aggregate([
  { $match: {type: 'move', from: 'Tangrowth'} },
  { $group: {
        _id: "$move",
        count: {$sum: 1}
    } }
]);


db.events.aggregate([
  { $match: {type: 'move'} },
  { $group: {
        _id: {move: "$move", from: "$from" },
        count: {$sum: 1}
    } }
]);

db.events.aggregate([
  { $match: {type: 'move'} },
  { $group: {
        _id: {from: "$from" },
        count: {$sum: 1}
    } }
]);


# first moves by pokemon
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
  { $sort: {"_id.from": 1, count: -1 } }
]);



# bigrams

db.events.createIndex( {matchid: 1, player: 1, turn: 1 } );

db.messybigrams.remove();

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
  var bigrams = [];
  // @TODO better sort this by turn for safety.
  for (var i = 1; i < values.length; i++) {
    // don't count swap-ins
    if( values[i].turn - values[i-1].turn > 2) continue;

    bigrams.push([values[i-1].move, values[i].move]);
  }
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


var bmapfn = function() {

  // species
  var key = this.value._id;
  if (key === undefined) return;
  var value = this.value.value;
  print('map:', key, value);

  emit(key, value);
};

var breducefn = function(key, values) {
  var merged = [].concat.apply([], values);
  print('merged:', merged);
  return {value: merged};
};

var finalizefn = function(key, reducedVal) {
  var bigramcounts = {};
  print('finalizing', key, reducedVal);
  if(reducedVal && reducedVal.length > 0)
  {
    print('looking at value:', reducedVal);
    reducedVal.forEach( function(bigram) {
      var bstr = bigram.toString();
      print('using bigram string ', bstr);
      print(bstr);

      if (bigramcounts[bigram]) {
        bigramcounts[bigram] = bigramcounts[bigram] + 1;
      } else {
        bigramcounts[bigram] = 1;
      }
    });
  }
  return bigramcounts;
};

db.messybigrams.mapReduce(
  bmapfn,
  breducefn,
  {
    out: 'bigrams',
    finalize: finalizefn
  }
);


// testing my shit.
db.events.find({type: 'move', matchid: 'randombattle-39213220'});

db.events.find({matchid: 'randombattle-39213220'}).sort({turn: 1, player: 1});



mmapfn.apply( db.events.findOne({matchid: 'randombattle-39213220'}) );

//debug
var mmapfn = function() {
  print('match ID: ', this.matchid);
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
  print('emitting dis:');
  print(tojson(key), tojson(value));
};
mmapfn.apply( db.events.find({matchid: 'randombattle-127900697', turn: 2}) );

db.events.find({matchid: 'randombattle-127900697', turn: {$gt: 0}, type: {$in: ['switch', 'move']}});

db.messymatchupresults.find({"value.matchup": {$exists: true}})


db.randombattle.aggregate(
{
  $group: {
    _id: 'whatever',
    matchid: {$max: "$matchid"}
  }
});

// FUN QUERY
//
db.matchupresults.aggregate([{
  $project: {
    _id: "$_id",
    kratio: {
      $cond: [ { $eq: [ "$value.bkilled", 0 ] },
      "N/A",
      {"$divide":["$value.akilled", "$value.bkilled"]}
      ]
    }
  }
},
{ $sort: { "kratio": 1 } },
{ $match: {"_id": /Abomasnow/} }
])

    ksratio: {
      $divide: [
        $sum: ["$value.akilled", "$value.aswitched"],
        $sum: ["$value.bkilled", "$value.bswitched"]
      ]
    }



// debugging...
db.events.find({type: {$in: ['switch', 'move']}, player: null});

{ "type" : "switch", "player" : "p1", "turn" : 0, "from" : null, "frompos" : "p1a", "to" : "Starly", "topos" : "p1a", "condition" : "230/230", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6987d") }
{ "type" : "switch", "player" : "p2", "turn" : 0, "from" : null, "frompos" : "p2a", "to" : "Klink", "topos" : "p2a", "condition" : "230/230", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6987e") }
{ "type" : "move", "player" : "p1", "turn" : 1, "from" : "Starly", "frompos" : "p1a", "move" : "U-turn", "to" : "Klink", "topos" : "p2a", "prevhp" : 230, "prevcondition" : "230/230", "nexthp" : 197, "nextcondition" : "197/230", "damage" : 33, "damagepct" : 14, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6987f") }
{ "type" : "switch", "player" : "p1", "turn" : 1, "from" : "Starly", "frompos" : "p1a", "to" : "Azumarill", "topos" : "p1a", "condition" : "284/284", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69880") }
{ "type" : "move", "player" : "p2", "turn" : 1, "from" : "Klink", "frompos" : "p2a", "move" : "Gear Grind", "to" : "Azumarill", "topos" : "p1a", "prevhp" : 250, "prevcondition" : "250/284", "nexthp" : 216, "nextcondition" : "216/284", "damage" : 34, "damagepct" : 12, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69881") }
{ "type" : "move", "player" : "p1", "turn" : 2, "from" : "Azumarill", "frompos" : "p1a", "move" : "Superpower", "to" : "Treecko", "topos" : "p2a", "prevhp" : 230, "prevcondition" : "230/230", "nexthp" : 13, "nextcondition" : "13/230", "damage" : 217, "damagepct" : 94, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69883") }
{ "type" : "switch", "player" : "p2", "turn" : 2, "from" : "Klink", "frompos" : "p2a", "to" : "Treecko", "topos" : "p2a", "condition" : "230/230", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69882") }
{ "type" : "switch", "player" : "p1", "turn" : 3, "from" : "Azumarill", "frompos" : "p1a", "to" : "Starly", "topos" : "p1a", "condition" : "230/230", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69885") }
{ "type" : "move", "player" : "p2", "turn" : 3, "from" : "Treecko", "frompos" : "p2a", "move" : "Leaf Storm", "to" : "Azumarill", "topos" : "p1a", "prevhp" : 216, "prevcondition" : "216/284", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 216, "damagepct" : 76, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69884") }
{ "type" : "switch", "player" : "p1", "turn" : 4, "from" : "Starly", "frompos" : "p1a", "to" : "Wormadam", "topos" : "p1a", "condition" : "243/243", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69888") }
{ "type" : "move", "player" : "p1", "turn" : 4, "from" : "Starly", "frompos" : "p1a", "move" : "U-turn", "to" : "Treecko", "topos" : "p2a", "prevhp" : 13, "prevcondition" : "13/230", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 13, "damagepct" : 6, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69887") }
{ "type" : "switch", "player" : "p2", "turn" : 4, "from" : "Treecko", "frompos" : "p2a", "to" : "Garchomp", "topos" : "p2a", "condition" : "282/282", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69889") }
{ "type" : "move", "player" : "p2", "turn" : 4, "from" : "Treecko", "frompos" : "p2a", "move" : "Hidden Power", "to" : "Starly", "topos" : "p1a", "prevhp" : 230, "prevcondition" : "230/230", "nexthp" : 146, "nextcondition" : "146/230", "damage" : 84, "damagepct" : 37, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69886") }
{ "type" : "move", "player" : "p1", "turn" : 5, "from" : "Wormadam", "frompos" : "p1a", "move" : "Leaf Storm", "to" : "Garchomp", "topos" : "p2a", "prevhp" : 282, "prevcondition" : "282/282", "nexthp" : 135, "nextcondition" : "135/282", "damage" : 147, "damagepct" : 52, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988b") }
{ "type" : "move", "player" : "p2", "turn" : 5, "from" : "Garchomp", "frompos" : "p2a", "move" : "Fire Fang", "to" : "Wormadam", "topos" : "p1a", "prevhp" : 243, "prevcondition" : "243/243", "nexthp" : 51, "nextcondition" : "51/243", "damage" : 192, "damagepct" : 79, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988a") }
{ "type" : "switch", "player" : "p1", "turn" : 6, "from" : "Wormadam", "frompos" : "p1a", "to" : "Kirlia", "topos" : "p1a", "condition" : "226/226", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988d") }
{ "type" : "move", "player" : "p2", "turn" : 6, "from" : "Garchomp", "frompos" : "p2a", "move" : "Fire Fang", "to" : "Wormadam", "topos" : "p1a", "prevhp" : 51, "prevcondition" : "51/243", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 51, "damagepct" : 21, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988c") }
{ "type" : "move", "player" : "p1", "turn" : 7, "from" : "Kirlia", "frompos" : "p1a", "move" : "Psychic", "to" : "Garchomp", "topos" : "p2a", "prevhp" : 134, "prevcondition" : "134/282", "nexthp" : 26, "nextcondition" : "26/282", "damage" : 108, "damagepct" : 38, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988f") }
{ "type" : "move", "player" : "p2", "turn" : 7, "from" : "Garchomp", "frompos" : "p2a", "move" : "Outrage", "to" : "Kirlia", "topos" : "p1a", "prevhp" : 226, "prevcondition" : "226/226", "nexthp" : 24, "nextcondition" : "24/226", "damage" : 202, "damagepct" : 89, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988e") }
{ "type" : "switch", "player" : "p1", "turn" : 8, "from" : "Kirlia", "frompos" : "p1a", "to" : "Starly", "topos" : "p1a", "condition" : "146/230", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69891") }




{ "type" : "move", "player" : "p2", "turn" : 12, "from" : "Keldeo", "frompos" : "p2a", "move" : "Hydro Pump", "to" : "Nosepass", "topos" : "p1a", "prevhp" : 7, "prevcondition" : "7/211", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 7, "damagepct" : 3, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69898") }
{ "type" : "move", "player" : "p1", "turn" : 10, "from" : "Nosepass", "frompos" : "p1a", "move" : "Stone Edge", "to" : "Keldeo", "topos" : "p2a", "prevhp" : 257, "prevcondition" : "257/257", "nexthp" : 215, "nextcondition" : "215/257", "damage" : 42, "damagepct" : 16, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69895") }
{ "type" : "move", "player" : "p2", "turn" : 11, "from" : "Keldeo", "frompos" : "p2a", "move" : "Hydro Pump", "to" : "Nosepass", "topos" : "p1a", "prevhp" : 211, "prevcondition" : "211/211", "nexthp" : 7, "nextcondition" : "7/211", "damage" : 204, "damagepct" : 97, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69896") }
{ "type" : "move", "player" : "p1", "turn" : 11, "from" : "Nosepass", "frompos" : "p1a", "move" : "Toxic", "to" : "Keldeo", "topos" : "p2a", "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69897") }
{ "type" : "move", "player" : "p1", "turn" : 5, "from" : "Wormadam", "frompos" : "p1a", "move" : "Leaf Storm", "to" : "Garchomp", "topos" : "p2a", "prevhp" : 282, "prevcondition" : "282/282", "nexthp" : 135, "nextcondition" : "135/282", "damage" : 147, "damagepct" : 52, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988b") }
{ "type" : "move", "player" : "p2", "turn" : 5, "from" : "Garchomp", "frompos" : "p2a", "move" : "Fire Fang", "to" : "Wormadam", "topos" : "p1a", "prevhp" : 243, "prevcondition" : "243/243", "nexthp" : 51, "nextcondition" : "51/243", "damage" : 192, "damagepct" : 79, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988a") }
{ "type" : "move", "player" : "p2", "turn" : 6, "from" : "Garchomp", "frompos" : "p2a", "move" : "Fire Fang", "to" : "Wormadam", "topos" : "p1a", "prevhp" : 51, "prevcondition" : "51/243", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 51, "damagepct" : 21, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988c") }
{ "type" : "move", "player" : "p2", "turn" : 7, "from" : "Garchomp", "frompos" : "p2a", "move" : "Outrage", "to" : "Kirlia", "topos" : "p1a", "prevhp" : 226, "prevcondition" : "226/226", "nexthp" : 24, "nextcondition" : "24/226", "damage" : 202, "damagepct" : 89, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988e") }
{ "type" : "move", "player" : "p2", "turn" : 8, "from" : "Garchomp", "frompos" : "p2a", "move" : "Outrage", "to" : "Kirlia", "topos" : "p1a", "prevhp" : 24, "prevcondition" : "24/226", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 24, "damagepct" : 11, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69890") }
{ "type" : "move", "player" : "p2", "turn" : 9, "from" : "Garchomp", "frompos" : "p2a", "move" : "Outrage", "to" : "Starly", "topos" : "p1a", "prevhp" : 146, "prevcondition" : "146/230", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 146, "damagepct" : 63, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69892") }
{ "type" : "move", "player" : "p1", "turn" : 7, "from" : "Kirlia", "frompos" : "p1a", "move" : "Psychic", "to" : "Garchomp", "topos" : "p2a", "prevhp" : 134, "prevcondition" : "134/282", "nexthp" : 26, "nextcondition" : "26/282", "damage" : 108, "damagepct" : 38, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6988f") }
{ "type" : "move", "player" : "p1", "turn" : 1, "from" : "Starly", "frompos" : "p1a", "move" : "U-turn", "to" : "Klink", "topos" : "p2a", "prevhp" : 230, "prevcondition" : "230/230", "nexthp" : 197, "nextcondition" : "197/230", "damage" : 33, "damagepct" : 14, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6987f") }
{ "type" : "move", "player" : "p2", "turn" : 1, "from" : "Klink", "frompos" : "p2a", "move" : "Gear Grind", "to" : "Azumarill", "topos" : "p1a", "prevhp" : 250, "prevcondition" : "250/284", "nexthp" : 216, "nextcondition" : "216/284", "damage" : 34, "damagepct" : 12, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69881") }
{ "type" : "move", "player" : "p1", "turn" : 2, "from" : "Azumarill", "frompos" : "p1a", "move" : "Superpower", "to" : "Treecko", "topos" : "p2a", "prevhp" : 230, "prevcondition" : "230/230", "nexthp" : 13, "nextcondition" : "13/230", "damage" : 217, "damagepct" : 94, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69883") }
{ "type" : "move", "player" : "p2", "turn" : 3, "from" : "Treecko", "frompos" : "p2a", "move" : "Leaf Storm", "to" : "Azumarill", "topos" : "p1a", "prevhp" : 216, "prevcondition" : "216/284", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 216, "damagepct" : 76, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69884") }
{ "type" : "move", "player" : "p2", "turn" : 4, "from" : "Treecko", "frompos" : "p2a", "move" : "Hidden Power", "to" : "Starly", "topos" : "p1a", "prevhp" : 230, "prevcondition" : "230/230", "nexthp" : 146, "nextcondition" : "146/230", "damage" : 84, "damagepct" : 37, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69886") }
{ "type" : "move", "player" : "p1", "turn" : 4, "from" : "Starly", "frompos" : "p1a", "move" : "U-turn", "to" : "Treecko", "topos" : "p2a", "prevhp" : 13, "prevcondition" : "13/230", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 13, "damagepct" : 6, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a69887") }
{ "type" : "move", "player" : "p2", "turn" : 13, "from" : "Keldeo", "frompos" : "p2a", "move" : "Hidden Power", "to" : "Gallade", "topos" : "p1a", "prevhp" : 246, "prevcondition" : "246/246", "nexthp" : 170, "nextcondition" : "170/246", "damage" : 76, "damagepct" : 31, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6989a") }
{ "type" : "move", "player" : "p1", "turn" : 13, "from" : "Gallade", "frompos" : "p1a", "move" : "Psycho Cut", "to" : "Keldeo", "topos" : "p2a", "prevhp" : 215, "prevcondition" : "215/257 tox", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 215, "damagepct" : 84, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6989b") }
{ "type" : "move", "player" : "p2", "turn" : 14, "from" : "Garchomp", "frompos" : "p2a", "move" : "Outrage", "to" : "Gallade", "topos" : "p1a", "prevhp" : 146, "prevcondition" : "146/246", "nexthp" : 0, "nextcondition" : "0 fnt", "killed" : true, "damage" : 146, "damagepct" : 59, "matchid" : "randombattle-39213220", "_id" : ObjectId("5632f8635ba14b4448a6989d") }


{ "type" : "switch", "player" : "p1", "turn" : 11, "from" : "Noivern", "frompos" : "p1a", "to" : "Archeops", "topos" : "p1a", "condition" : "269/269", "matchid" : "randombattle-181808079", "_id" : ObjectId("5632f85f5ba14b4448a5a57f") }
{ "type" : "switch", "player" : "p1", "turn" : 10, "from" : "Archeops", "frompos" : "p1a", "to" : "Hitmonchan", "topos" : "p1a", "condition" : "209/209", "matchid" : "randombattle-224371070", "_id" : ObjectId("5632f8605ba14b4448a5f7fc") }
{ "type" : "switch", "player" : "p1", "turn" : 11, "from" : null, "frompos" : "p1a", "to" : "Meowstic-F", "topos" : "p1a", "condition" : "274/274", "matchid" : "randombattle-198799722", "_id" : ObjectId("5632f85f5ba14b4448a5bd48") }
{ "type" : "switch", "player" : "p1", "turn" : 14, "from" : "Kyogre", "frompos" : "p1a", "to" : "Wormadam", "topos" : "p1a", "condition" : "235/235", "matchid" : "randombattle-255011448", "_id" : ObjectId("5632f8615ba14b4448a64ea7") }
{ "type" : "switch", "player" : "p1", "turn" : 11, "from" : "Yanmega", "frompos" : "p1a", "to" : "Palkia", "topos" : "p1a", "condition" : "252/252", "matchid" : "randombattle-255138319", "_id" : ObjectId("5632f8615ba14b4448a64f65") }
{ "type" : "switch", "player" : "p1", "turn" : 11, "from" : "Illumise", "frompos" : "p1a", "to" : "Galvantula", "topos" : "p1a", "condition" : "237/237", "matchid" : "randombattle-149101528", "_id" : ObjectId("5632f85e5ba14b4448a57b99") }
{ "type" : "switch", "player" : "p2", "turn" : 10, "from" : "Rayquaza", "frompos" : "p2a", "to" : "Clawitzer", "topos" : "p2a", "condition" : "242/242", "matchid" : "randombattle-267254823", "_id" : ObjectId("5632f8625ba14b4448a69407") }
{ "type" : "switch", "player" : "p1", "turn" : 12, "from" : "Serperior", "frompos" : "p1a", "to" : "Venomoth", "topos" : "p1a", "condition" : "217/231", "matchid" : "randombattle-169310948", "_id" : ObjectId("5632f85e5ba14b4448a5939e") }
{ "type" : "switch", "player" : "p2", "turn" : 12, "from" : "Ferrothorn", "frompos" : "p2a", "to" : "Qwilfish", "topos" : "p2a", "condition" : "232/232", "matchid" : "randombattle-225958782", "_id" : ObjectId("5632f8605ba14b4448a5fd7f") }
{ "type" : "switch", "player" : "p2", "turn" : 11, "from" : "Deoxys-Attack", "frompos" : "p2a", "to" : "Golurk", "topos" : "p2a", "condition" : "293/293", "matchid" : "randombattle-204110477", "_id" : ObjectId("5632f85f5ba14b4448a5c5a1") }
{ "type" : "switch", "player" : "p2", "turn" : 12, "from" : "Hariyama", "frompos" : "p2a", "to" : "Umbreon", "topos" : "p2a", "condition" : "276/276", "matchid" : "randombattle-220516017", "_id" : ObjectId("5632f8605ba14b4448a5ea1a") }



////////////////////////////////////////////

map: Articuno Ice Beam,Substitute,Substitute,Ice Beam,Ice Beam,Ice Beam,Ice Beam,Ice Beam,Ice Beam,Ice Beam,Ice Beam,Ice Beam
map: undefined undefined
map: Raikou Aura Sphere,Aura Sphere,Aura Sphere,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Thunderbolt,Thunderbolt,Thunderbolt
map: undefined undefined
map: Shiftry Swords Dance,Swords Dance,Swords Dance,Swords Dance
map: Simipour Substitute,Nasty Plot,Substitute,Grass Knot,Grass Knot,Grass Knot
map: undefined undefined
map: undefined undefined
map: Cobalion Hidden Power,Hidden Power,Thunder Wave,Stone Edge,Hidden Power,Stone Edge
map: undefined undefined
map: Hoopa Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Calm Mind,Psychic,Psychic,Psychic
map: Tangrowth Power Whip,Sleep Powder,Focus Blast,Focus Blast,Focus Blast,Focus Blast,Focus Blast,Power Whip,Power Whip,Power Whip,Power Whip,Power Whip
merged: ,,,,
finalizing null [object Object]
looking at value: ,,,,
Mon Oct 26 22:49:24.471 [conn32] TypeError: Cannot call method 'toString' of null near '= bigram.toString();       print('using '  (line 8)
Mon Oct 26 22:49:24.471 [conn32] mr failed, removing collection :: caused by :: 16722 TypeError: Cannot call method 'toString' of null near '= bigram.toString();       print('using '  (line 8)
Mon Oct 26 23:01:54.143 [conn32] end connection 127.0.0.1:53512 (0 connections now open)


tail -f /var/log/mongodb/mongodb.log