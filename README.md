## LEFTOVERS AGAIN: A Pokemon AI Battle Arena

Coding your own Pokemon AI bot doesn't have to be a major, time-consuming project. You can have your own bot up and running with <100 lines of code!

2015: Pokemon bots start spontaneously fighting amongst themselves.
2016: With the knowledge of infinite matches in their memory banks, AIs begin beating tournament-level players.
20XX: The Pokemon Championships are won by a player using AI insights to crush her human opponents.

## Designed with Simplicity and Accessibility in Mind

Many developers have worked on AI bots before, in multiple languages, always having to start from the beginning - figuring out the Showdown protocol, importing relevant data, translating teams from human-readable text to code.

That work is *already done for you*.

To write a bot, you only need two files:
- A bot config file, defining your team and your game tier. ([example])
- A class with your `decide` function. This is where the fun stuff happens! Read the spec (here) to see all the state data you have access to. ([example])

## Get Useful Feedback. Quickly Iterate on Your Design.

Before AI, to test a new team, you'd have to play your team for hours just to get a feel for how it performs. Now, you can get 100 matches of feedback in MINUTES. Use data, not feelings!

With one quick script, you can see how your bot fares against any number of opponent bots. Is your bot weak to Steel types? Special attacks? Stall teams? Trick Rooms? You'll know your bot's weaknesses and can improve your 

You can also save replays from your bot battles. Even though your battles don't take place on official servers, you can play or upload your replays to the official [Replay Replayer](http://replay.pokemonshowdown.com/).

## Compete Against Other Bots. And Humans.

Every month, bots are pitted against each other in a competition here. Currently, only a few tiers are supported - Uber, OU, and Randombattle.

We're running our own Showdown server named 'Cyberdyne'. There, every bot in this repo is running and responding to all challenge requests. Humans can play against these bots at any time!

The ethics of taking bots onto official servers is questionable. [Watch this video to see what happens.]()

## Writing Your First Bot

### 0. Setting Up Your Environment
First, clone this project and install dependencies:
```
git clone https://github.com/dramamine/leftovers-again
# these need to be installed globally
sudo npm install -g karma karma-cli babel-node ...etc
npm install
```

### 1. Writing Your Config File
Lots of sample configs in the cfg/ folder. Say we have a file called `sample.cfg` that looks like this:
```
{
  path: [botpath]
}
```

### 2. Writing Your Bot
Copy the contents of bot.tmpl to [botpath].js to get started. This will 


### 3. Testing Your Bot



## The Decide() Loop

Your AI bot runs the function decide(state) over and over agin. The `state` object contains all the information you need about the current state of the game - your pokemon, their statuses, moves, and everything you know about your opponent's pokemon. It's up to you 

## Write in Any Language You Want

This project is mainly coded in Javascrpt / ES6, which I recommend for its ease of use. However, you can write code in any language you want.

Languages currently supported:
- jk nothing yet

If you'd like to implement your favorite language: 

## NOTES
1/3/2016
- need to fix bug with Basculin-Blue-Striped ("too many active pokemon") - crashes the bots when this is our active mon
- need to handle Zoroark - see 20160104-bug-too-many-active.txt
- damage done by Return calculated incorrectly
- take acct of Accuracy in damage est(?)
- don't think that Explosion is such a great move
- don't think that Water Spout sux

10/18/2015
npm run develop -- --bot=randombattle/stabby.js

10/9/2015
Special states:
- noCancel: this seems ok, you can't cancel yr moves.
- trapped: I think this means you can't switch out



10/4/2015
Really pulling off some shenanigans here. Currently only tested with 'randumb'. Tasks for next week:
- remove all 'state'ness from the battle class
- is everything migrated over??
  * include battleID in the state
- add validity checks (ex. don't send more than one active in a singles match)
- validate 'moves', what are they even doing right now?
- consider removing the 'state' variables from battlestore & pokemon
- unit tests for new classes.
- move 'challenge issuing' stuff into its own class maybe

Remember, you started rearranging everything because you were mad that you had to instantiate an AI to build a team, before you get any battle data. Are you solving that?
- consider creating a battle object, and setup listeners on the 'init' message? this is the first message with the battle ID.
- eh, maybe just say fuck it, make getTeam() static
- lots of stuff is static, like all the metadata

9/11/2015
- Now two bots can fight each other to the end! In one terminal, run `babel-node scripts/spawn.js` (spawns martenbot by default) and run `babel-node src/main.js --bot=randombattle/stabby.js` in the other.


9/1/2015
- add a data store with battle info to connect.js or whatever. this might need to be an object with the battleId as its key to support multiple battles.
- when we get the 'turn' message (or something), call getMove() on your AI object.



API HACKING
example search:
http://replay.pokemonshowdown.com/search?user=DKFirelord




import Battles from (./battles)

class Battle {
}


things were sending out
bid|action|rqid
battle-randombattle-89|/choose move 2|1
battle-randombattle-89|/choose switch 6|1


# bettter reading on this:
# client/data/protocol.txt

|move|p2a: Pyroar|Hyper Voice|p1a: Goodra
|-crit|p1a: Goodra
|-damage|p1a: Goodra|73/100
|-weather|SunnyDay|[upkeep]
|-weather|none

|-heal|p2a: Slurpuff|59/100|[from] item: Leftovers
|switch|p2a: Slurpuff|Slurpuff, L77, M|100/100
|-resisted|p1a: Goodra
|-fail|p2a: Slurpuff|move: Substitute|[weak] // move failed because the pokemon didnt have enough HP

|-ability|p2a: Pyroar|Unnerve|p1: 5nowden

|-status|p2a: Pyroar|par

|cant|p2a: Goodra|par

|move|p1a: Goodra|Fire Blast|p2a: Pyroar
|-resisted|p2a: Pyroar

|-damage|p1a: Goodra|0 fnt

|faint|p1a: Goodra

|detailschange|p1a: Groudon|Groudon-Primal, L73

|-status|p1a: Groudon|psn
|
|-weather|DesolateLand|[upkeep]
|-damage|p1a: Groudon|75/100 psn|[from] psn

|move|p2a: Latios|Calm Mind|p2a: Latios
|-boost|p2a: Latios|spa|1
|-boost|p2a: Latios|spd|1

"condition":"0 fnt",
"condition":"15/271 par"

|-immune|p2a: Latios|[msg]
|-miss|p1a: Groudon|p2a: Latios

|-unboost|p2a: Latios|spa|2
|-cureteam|p1a: Umbreon|[from] move: HealBell
|-supereffective|p2a: Serperior

|win|5nowden5

|request|{"forceSwitch":[true],"side":{"name":"5nowden","id":"p1","pokemon":[{"ident":"p1: Goodra","details":"Goodra, L77, M","condition":"0 fnt","active":true,"stats":{"atk":199,"def":152,"spa":214,"spd":276,"spe":168},"moves":["dragonpulse","thunderbolt","earthquake","fireblast"],"baseAbility":"sapsipper","item":"assaultvest","pokeball":"pokeball","canMegaEvo":false},{"ident":"p1: Umbreon","details":"Umbreon, L77, F","condition":"273/273","active":false,"stats":{"atk":145,"def":214,"spa":137,"spd":245,"spe":145},"moves":["foulplay","toxic","protect","healbell"],"baseAbility":"synchronize","item":"leftovers","pokeball":"pokeball","canMegaEvo":false},{"ident":"p1: Cherrim","details":"Cherrim, L83, F","condition":"252/252","active":false,"stats":{"atk":146,"def":163,"spa":192,"spd":177,"spe":189},"moves":["hiddenpowerice60","synthesis","energyball","sunnyday"],"baseAbility":"flowergift","item":"heatrock","pokeball":"pokeball","canMegaEvo":false},{"ident":"p1: Groudon","details":"Groudon, L73","condition":"266/266","active":false,"stats":{"atk":261,"def":247,"spa":188,"spd":174,"spe":174},"moves":["overheat","thunderwave","stoneedge","earthquake"],"baseAbility":"drought","item":"redorb","pokeball":"pokeball","canMegaEvo":false},{"ident":"p1: Xatu","details":"Xatu, L81, M","condition":"238/238","active":false,"stats":{"atk":168,"def":160,"spa":201,"spd":160,"spe":201},"moves":["psychic","roost","toxic","uturn"],"baseAbility":"magicbounce","item":"leftovers","pokeball":"pokeball","canMegaEvo":false},{"ident":"p1: Delibird","details":"Delibird, L83, M","condition":"210/210","active":false,"stats":{"atk":140,"def":122,"spa":156,"spd":122,"spe":172},"moves":["destinybond","aerialace","icepunch","rapidspin"],"baseAbility":"hustle","item":"lifeorb","pokeball":"pokeball","canMegaEvo":false}]},"rqid":23,"noCancel":true}


here's a dump of what we get from |request
{  
  "active":[  
    {  
      "moves":[  
        {  
          "move":"Fake Out",
          "id":"fakeout",
          "pp":16,
          "maxpp":16,
          "target":"normal",
          "disabled":false
        },
        {  
          "move":"Knock Off",
          "id":"knockoff",
          "pp":32,
          "maxpp":32,
          "target":"normal",
          "disabled":false
        },
        {  
          "move":"U-turn",
          "id":"uturn",
          "pp":32,
          "maxpp":32,
          "target":"normal",
          "disabled":false
        },
        {  
          "move":"Return",
          "id":"return",
          "pp":32,
          "maxpp":32,
          "target":"normal",
          "disabled":false
        }
      ]
    }
  ],
  "side":{  
    "name":"5nowden",
    "id":"p1",
    "pokemon":[  
      {  
        "ident":"p1: Persian",
        "details":"Persian, L83, F",
        "condition":"244/244",
        "active":true,
        "stats":{  
          "atk":164,
          "def":147,
          "spa":156,
          "spd":156,
          "spe":239
        },
        "moves":[  
          "fakeout",
          "knockoff",
          "uturn",
          "return"
        ],
        "baseAbility":"technician",
        "item":"lifeorb",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {  
        "ident":"p1: Wormadam",
        "details":"Wormadam, L83, F",
        "condition":"235/235",
        "active":false,
        "stats":{  
          "atk":146,
          "def":189,
          "spa":179,
          "spd":222,
          "spe":107
        },
        "moves":[  
          "synthesis",
          "toxic",
          "protect",
          "signalbeam"
        ],
        "baseAbility":"overcoat",
        "item":"leftovers",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {  
        "ident":"p1: Malamar",
        "details":"Malamar, L81, F",
        "condition":"289/289",
        "active":false,
        "stats":{  
          "atk":196,
          "def":189,
          "spa":157,
          "spd":168,
          "spe":123
        },
        "moves":[  
          "trickroom",
          "psychocut",
          "substitute",
          "superpower"
        ],
        "baseAbility":"contrary",
        "item":"leftovers",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {  
        "ident":"p1: Basculin-Blue-Stripe",
        "details":"Basculin-Blue-Striped, L83, M",
        "condition":"252/252",
        "active":false,
        "stats":{  
          "atk":200,
          "def":156,
          "spa":180,
          "spd":139,
          "spe":210
        },
        "moves":[  
          "aquajet",
          "waterfall",
          "crunch",
          "zenheadbutt"
        ],
        "baseAbility":"adaptability",
        "item":"choiceband",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {  
        "ident":"p1: Jynx",
        "details":"Jynx, L81, F",
        "condition":"238/238",
        "active":false,
        "stats":{  
          "atk":128,
          "def":103,
          "spa":233,
          "spd":201,
          "spe":201
        },
        "moves":[  
          "lovelykiss",
          "nastyplot",
          "psychic",
          "icebeam"
        ],
        "baseAbility":"dryskin",
        "item":"leftovers",
        "pokeball":"pokeball",
        "canMegaEvo":false
      },
      {  
        "ident":"p1: Liepard",
        "details":"Liepard, L81, F",
        "condition":"236/236",
        "active":false,
        "stats":{  
          "atk":189,
          "def":128,
          "spa":189,
          "spd":128,
          "spe":218
        },
        "moves":[  
          "substitute",
          "knockoff",
          "encore",
          "copycat"
        ],
        "baseAbility":"prankster",
        "item":"leftovers",
        "pokeball":"pokeball",
        "canMegaEvo":false
      }
    ]
  },
  "rqid":1
}



Format

BOT INFO:
{
  gametype: 'random' (issues/accepts challenges of this type only)
  entry: 'mybot.js'
  disabled: false
  mine: true
  opponent: false
}

connect.js
- handles connection
- joins a chat room

challenges.js
- by default, challenges everyone in room
- accepts all challenges

scaffolding.js
- calls bot functions
- chooseMove(int)
- switchTo(int)
- getLastResults()
- stores game status
- stores turn results
- stores current pokemon & his moves
- stores opponent pokemon & what you know about them

bot.js (abstract class)
- turn()
- chooseNext()
- team() if needed
- end(bool) - did you win or not

data/
pokemon.js
moves.js

