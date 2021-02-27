## LEFTOVERS AGAIN: A Pokemon AI Battle Arena

EDIT: Live server "Cyberdyne" is down for now. Everything still works great locally. If you're interested in maintaining a live server please contact me.

'Getting Started' guide [here](https://github.com/dramamine/leftovers-again/blob/master/FAQ.md).
Full code documentation [here](http://metal-heart.org/static/docs/).

This is the official repository for an ongoing AI competition for Pokemon battles.

Coding your own Pokemon AI bot doesn't have to be a major, time-consuming project. You can have your own bot up and running with <100 lines of code!

1997: Deep Blue defeats Kasparov at chess. 2016: AlphaGo annihilates the world's greatest Go players. 20XX: AI overtakes human players at the greatest game of all, Pokemon.

## Designed with Simplicity and Accessibility in Mind

Many developers have worked on AI bots before, in multiple languages, always having to start from the beginning - figuring out the Showdown protocol, importing relevant data, translating teams from human-readable text to code.

That work is *already done for you*.

You can have a working bot up and running in minutes. Read the [Getting Started guide](https://github.com/dramamine/leftovers-again/blob/master/FAQ.md) to see how easy it is.

![generate](https://user-images.githubusercontent.com/1554498/29701153-de0017b0-891e-11e7-80fc-60c7f7157a7e.gif)

_generating your first bot_

![run bot](https://user-images.githubusercontent.com/1554498/29701154-de093c0a-891e-11e7-9251-80f3d72c12d9.gif)

_running your first match_

## Get Useful Feedback. Quickly Iterate on Your Design.

Have an idea for a new strategy? Want to tweak your team ideas?

Before AI, to test a new team, you'd have to use your team for hours just to get a feel for how it performs. Now, you can get 100 matches of feedback in MINUTES. Use data, not feelings!

With one quick script, you can see how your bot fares against any number of opponent bots. Is your bot weak to Steel types? Special attacks? Stall teams? Trick Rooms? You'll know your bot's weaknesses and can improve your design as such.



## Love playing Pokemon but suck at programming?

Writing a Pokemon bot is a small, low-risk project where you can create something rewarding without a huge time investment. You don't have to create the next 'Deep Blue'!


## Already In Use In Classrooms
This software has been used for college-level game AI courses, where classes have run tournaments using students' submissions.


## Write in Any Language You Want

This project is mainly coded in Javascrpt / ES6, which I recommend for its ease of use. However, you can write code in any language you want.

Languages currently supported:
- jk nothing else yet


## Example Usage

### Install everything (Windows, Mac, Linux)
First, make sure you have installed [node and npm](https://docs.npmjs.com/getting-started/installing-node).
```bash
node -v
# 6.0.0 or greater plz!

# inside your bot's directory
npm install leftovers-again

# run generator script
node node_modules/leftovers-again/scripts/generate.js

# afterwards, your bot is ready to go
```bash
npm run server                          # in a separate window
npm install
npm start -- --opponent=randumb
```

### Run a `randombattle` between two bots:
```bash
npm run server                          # in a separate window
npm start -- stabby --opponent=randumb
```

### Play against your bot, via your web browser
```bash
npm run server                          # in a separate window
npm start
# browse to: http://play.pokemonshowdown.com/?~~localhost:8000
```

### Launch your bot on Cyberdyne
```bash
npm start -- --production
# browse to: http://cyberdyne.psim.us/
```


FAQ/Getting started guide [here](https://github.com/dramamine/leftovers-again/blob/master/FAQ.md).

Code documentation [here](http://metal-heart.org/static/docs/).

Contribution guide [here](https://github.com/dramamine/leftovers-again/blob/master/CONTRIBUTING.md).

Changelog [here](https://github.com/dramamine/leftovers-again/blob/master/CHANGELOG.md).
