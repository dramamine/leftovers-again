## LEFTOVERS AGAIN: A Pokemon AI Battle Arena

'Getting Started' guide [here](https://github.com/dramamine/leftovers-again/blob/master/FAQ.md).
Full code documentation [here](https://doc.esdoc.org/github.com/dramamine/leftovers-again/).

This is the official repository for an ongoing AI competition for Pokemon battles.

Coding your own Pokemon AI bot doesn't have to be a major, time-consuming project. You can have your own bot up and running with <100 lines of code!

2016: Pokemon bots start spontaneously fighting amongst themselves.

2017: With the knowledge of infinite matches in their memory banks, AIs begin winning matches against tournament-level players.

20XX: The Human Pokemon Championships are won by a player using AI insights to crush her human opponents.

## Designed with Simplicity and Accessibility in Mind

Many developers have worked on AI bots before, in multiple languages, always having to start from the beginning - figuring out the Showdown protocol, importing relevant data, translating teams from human-readable text to code.

That work is *already done for you*.

You can have a working bot up and running in minutes. Read the [Getting Started guide](https://github.com/dramamine/leftovers-again/blob/master/FAQ.md) to see how easy it is.


## Get Useful Feedback. Quickly Iterate on Your Design.

Have an idea for a new strategy? Want to tweak your team ideas?

Before AI, to test a new team, you'd have to use your team for hours just to get a feel for how it performs. Now, you can get 100 matches of feedback in MINUTES. Use data, not feelings!

With one quick script, you can see how your bot fares against any number of opponent bots. Is your bot weak to Steel types? Special attacks? Stall teams? Trick Rooms? You'll know your bot's weaknesses and can improve your design as such.



## Love playing Pokemon but suck at programming?

Writing a Pokemon bot is a small, low-risk project where you can create something rewarding without a huge time investment. You don't have to create the next 'Deep Blue'! Just come up with a creative team and strategy, then set easy goals for yourself, like [beating all the Elite Four and Champions from 6th Generation]().


## Write in Any Language You Want

This project is mainly coded in Javascrpt / ES6, which I recommend for its ease of use. However, you can write code in any language you want.

Languages currently supported:
- jk nothing yet

If you'd like to implement your favorite language:


## Example Usage

### Install everything (Windows, Mac, Linux)
First, make sure you have installed [node and npm](https://docs.npmjs.com/getting-started/installing-node).
```bash
node -v
# 6.0.0 or greater plz!

# inside your bot's directory
npm install leftovers-again

# run generator script
node node_modules/leftovers-again/lib/scripts/generate.js

# afterwards, your bot is ready to go
npm run server # in a separate window
npm install
npm start -- --opponent=randumb
```

### Run a `randombattle` between two bots:
```bash
npm run server # in a separate window
npm start -- stabby --opponent=randumb
```

### Play against your bot, via your web browser
```bash
npm run server # in a separate window
npm start
# browse to: http://play.pokemonshowdown.com/?~~localhost:8000
```

### Launch your bot on Cyberdyne
(@TODO temporary url)
```bash
npm start -- --production
# browse to: http://metal-heart.org.psim.us/
```

### Browse your potential opponents:
(@TODO not implemented yet)
`npm run gauntlet`



### Developer's Installation Guide
Use this code if you'd like to contribute to this repo.
```bash
git clone git@github.com:dramamine/leftovers-again.git
cd leftovers-again
make

# example usage
npm run server # in a separate window
npm test
npm start -- randumb --opponent=stabby
```

Contribution guide [here](https://doc.esdoc.org/github.com/dramamine/leftovers-again/).
If you're interested in contributing but don't know where to start, shoot me an email. There are always some minor issues I could use some help with, but also some major features I can't do without help:
- running tournaments (scripts, web design)
- supporting other programming languages (ex. Python)


## NOTES
9/17/2016
- install babel-plugin-module-resolver
- see if you can use other server names
- see if Level is properly interpreted

1/3/2016
$ ENGINE WORK
- need to fix bug with Basculin-Blue-Striped ("too many active pokemon") - crashes the bots when this is our active mon
- need to handle Zoroark - see 20160104-bug-too-many-active.txt
- don't think that Explosion is such a great move
- don't think that Water Spout sux
- don't break on HP-based moves
- see if "Happiness: 200" is parsed by team declarer
- 'Seismic Toss' calculates incorrectly
- Kyurem vs Kyurem-White (causes a crash)
- maybe return nothing instead of crashing out (from getHelp function)
- move a bunch of functions from lib/damage.js to damageWrapper.js (or something)
- create a set of tests for a "generic bot testing script"
- setup the script for said tests
- have bots ping for challenge updates
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
+ respond to 'cant' messages by logging an error
- implement multiple 'oppponents' spawning from main
+ remove or hide www code
- change logging to use timestamps
- fix the elitefour bots to use package.json
- "accepts" always becomes ALL in bot generator
- document reporters and how they're used
- is Damage.getDamageResult checking weather/field effects everywhere?
- 'spawn' script needs to be fixed



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
