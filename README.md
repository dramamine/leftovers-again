## LEFTOVERS AGAIN: A Pokemon AI Battle Arena

'Getting Started' guide [here](https://github.com/dramamine/leftovers-again/blob/master/FAQ.md).
Full code documentation [here](https://doc.esdoc.org/github.com/dramamine/leftovers-again/).

This is the official repository for an ongoing AI competition for Pokemon battles.

Coding your own Pokemon AI bot doesn't have to be a major, time-consuming project. You can have your own bot up and running with <100 lines of code!

2015: Pokemon bots start spontaneously fighting amongst themselves.
2016: With the knowledge of infinite matches in their memory banks, AIs begin beating tournament-level players.
20XX: The Pokemon Championships are won by a player using AI insights to crush her human opponents.

## Designed with Simplicity and Accessibility in Mind

Many developers have worked on AI bots before, in multiple languages, always having to start from the beginning - figuring out the Showdown protocol, importing relevant data, translating teams from human-readable text to code.

That work is *already done for you*.

You can have a working bot up and running in minutes. Read the [Getting Started guide](https://github.com/dramamine/leftovers-again/blob/master/FAQ.md) to see how easy it is.


## Get Useful Feedback. Quickly Iterate on Your Design.

Have an idea for a new strategy? Want to tweak your team ideas?

Before AI, to test a new team, you'd have to use your team for hours just to get a feel for how it performs. Now, you can get 100 matches of feedback in MINUTES. Use data, not feelings!

With one quick script, you can see how your bot fares against any number of opponent bots. Is your bot weak to Steel types? Special attacks? Stall teams? Trick Rooms? You'll know your bot's weaknesses and can improve your design as such.

## Compete Against Other Bots. And Humans.

Every month, bots are pitted against each other in a competition here. Currently, only a few tiers are supported - Uber, OU, and Randombattle.

We're running our own Showdown server named 'Cyberdyne'. There, every bot in this repo is running and responding to all challenge requests. Humans can play against these bots at any time!

The ethics of taking bots onto official servers is questionable. [Watch this video to see what happens.]()

**TODO example results**

## Love playing Pokemon but suck at programming?

Writing a Pokemon bot is a small, low-risk project where you can create something rewarding without a huge time investment. You don't have to create the next 'Deep Blue'! Just come up with a creative team and strategy, then set easy goals for yourself, like [beating all the Elite Four and Champions from 6th Generation]().


## Write in Any Language You Want

This project is mainly coded in Javascrpt / ES6, which I recommend for its ease of use. However, you can write code in any language you want.

Languages currently supported:
- jk nothing yet

If you'd like to implement your favorite language: 


## Example Usage

### Install everything
First, make sure you have installed node and npm.
```bash
git clone git@github.com:dramamine/leftovers-again.git
cd leftovers-again
sudo npm install -g babel-node
make
```

### Run a `randombattle` between two bots:
```bash
npm run server # in a separate window
npm start -- stabby --opponent=randumb --scrappy --loglevel=2 --matches=1
```

### Build skeleton code for your bot:
`npm run generate`

### Battle against all the other bots included in this repo:
`npm run gauntlet`

### Play against a stall team, in the browser
```bash
npm run server
npm start research/rooster
npm run client # then add ?~~localhost:8000 to the end of the URL
```


## NOTES
1/3/2016
$ ENGINE WORK
- need to fix bug with Basculin-Blue-Striped ("too many active pokemon") - crashes the bots when this is our active mon
- need to handle Zoroark - see 20160104-bug-too-many-active.txt
+ damage done by Return calculated incorrectly
+ damage done by that weight-based move that Onix has is not calculated
- don't think that Explosion is such a great move
- don't think that Water Spout sux
- don't break on HP-based moves
+ process fields
+ process weather
- see if "Happiness: 200" is parsed by team declarer
- 'Seismic Toss' calculates incorrectly
- Kyurem vs Kyurem-White (causes a crash)
- maybe return nothing instead of crashing out (from getHelp function)
+ make sure pokemon properties include 'level'. (I am pretty sure I checked this. turns out lots of modes like ou/uber don't report level. );
- move a bunch of functions from lib/damage.js to damageWrapper.js (or something)
- create a set of tests for a "generic bot testing script"
- setup the script for said tests
+ shell commands for running bots
+ better logging: write the last request and state to a file somewhere
- have bots ping for challenge updates
+ set 'disabled' on moves with 0 HP
+ if your opponent cures a status, do you notice?
- cannot find my move hiddenpowerfightin
- speed on boosts error:
- _onSpeedData: Object {mine: 77, yours: 164}
- _onSpeedData: Object {mine: 77, yours: 5.075554161070059e+28}
- consider handling 'detailschange'
    + |detailschange|p1a: Groudon|Groudon-Primal, L70
    + |-formechange|p2a: Cherrim|Cherrim-Sunshine
+ spacing on Reports is wrong. make sure boosts/statuses are lining up better
- Damage calculator side effects work
    + Implement light screen
    + Implement reflect
    + Implement gravity & foresight
    + See if any of these things even happen in random battles...
- respond to 'cant' messages by logging an error
- implement 'oppponents' spawning from main
- remove or hide www code
- change logging to use timestamps
- fix the elitefour bots to use package.json
- stuff breaks when you don't obey the one-per-species rule. ex. reserve doesn't have enough entries, active is sometimes unset.
- cant probably shouldn't error out so hard, since it sometimes happens (like with frz)
- "accepts" always becomes ALL in bot generator
- document reporters and how they're used

$ FRONT-END SCRIPT WORK
- 'clear' doesn't clear out the parentheses
- Get data from fitness bot


$ BOT WORK
- make a 'recoil damage' calculator
+ better handling of stat guessing & damage ranges
+ koChance is terribly inefficient. try a new strategy, like, use exponential math to figure out which damage amounts would be enough
- take acct of Accuracy in damage est(?)
- Choice Band: all of a sudden, you know what move the opponent is going to use! take advantage of this for safe switching

$ LAPTOP SETUP SHIT THAT DIDN'T WORK
- submodules didn't work, make sure you have that .gitmodules file working
- weirdly, the client worked straight (without my special branch that bypasses auth)
+ needed a 'log' folder
+ needed to update node
- setting up Tampermonkey didn't quite work...
