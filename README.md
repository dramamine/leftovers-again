## LEFTOVERS AGAIN: A Pokemon AI Battle Arena

Full code documentation [here](https://doc.esdoc.org/github.com/dramamine/leftovers-again/).

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
$ ENGINE WORK
- need to fix bug with Basculin-Blue-Striped ("too many active pokemon") - crashes the bots when this is our active mon
- need to handle Zoroark - see 20160104-bug-too-many-active.txt
+ damage done by Return calculated incorrectly
+ damage done by that weight-based move that Onix has is not calculated
- don't think that Explosion is such a great move
- don't think that Water Spout sux
- process fields
- process weather
- see if "Happiness: 200" is parsed by team declarer
- 'Seismic Toss' calculates incorrectly
- Kyurem vs Kyurem-White (causes a crash)
- maybe return nothing instead of crashing out (from getHelp function)
+ make sure pokemon properties include 'level'. (I am pretty sure I checked this. turns out lots of modes like ou/uber don't report level. );
- move a bunch of functions from lib/damage.js to damageWrapper.js (or something)
- create a set of tests for a "generic bot testing script"
- setup the script for said tests
- shell commands for running bots
- better logging: write the last request and state to a file somewhere
- have bots ping for challenge updates
- set 'disabled' on moves with 0 HP
- if your opponent cures a status, do you notice?

$ FRONT-END SCRIPT WORK
- 'clear' doesn't clear out the parentheses
- Get data from fitness bot


$ BOT WORK
- make a 'recoil damage' calculator
+ better handling of stat guessing & damage ranges
+ koChance is terribly inefficient. try a new strategy, like, use exponential math to figure out which damage amounts would be enough
- take acct of Accuracy in damage est(?)



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

