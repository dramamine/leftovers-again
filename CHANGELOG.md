[0.11.5] - 2017-09-18
- Handle empty requests

[0.11.4] - 2017-08-31
- Hacky fix for nickname collisions

[0.11.3] - 2017-08-29
- Merge PR about toxic spikes stacking
- Change all formats to be gen7

[0.11.2] - 2017-08-27
- Update login command

[0.11.1] - 2017-08-24
- Update documentation

[0.11.0] - 2017-08-23
- Move from Babel to plain Node
- Log match starts better

[0.10.0] - 2016-11-27
- Update datasets for Gen7
- Implement Z-Moves

[0.9.8] - 2016-11-20
- Add the top two Brazillian bots

[0.9.6] - 2016-10-31
- Fixing gross issues with 'replace' and updating idents
- Really confident Zoroark & detailschange & formechange work
- Updated unit tests

[0.9.5] - 2016-10-30
- Switch module resolver
- Fix the 'develop' script to put files in the right directories
- Disconnect on opponent error
- Fix 'active mon during teamPreview' bug
- Update generate.js templates
- Fix watch commands for myself and for generate.js templates

[0.9.4] - 2016-10-27
- Change match-display to look a little nicer

[0.9.3] - 2016-10-27
- Fix issue with finding your Pokemon after forme/details change
- Clean up logging a bit

[0.9.0] - 2016-10-27
- Handle mega-evolutions and forme changes

[0.8.3] - 2016-10-25
- timer functionality (very hacky, not sure if its worth using)
- Forfeit on invalid decisions
- roundrobin.js script for running tourneys

[0.8.2] - 2016-10-16
- Forfeit matches if your bot throws an error
- Forfeit matches if you get a 'cant' message, and it 'cant' be helped
- Fully implement 'matches' param

[0.8.1] - 2016-10-12
- Fix for side effects not being properly written

[0.8.0] - 2016-10-02
- Tons of linting-related updates and npm script updates
- Better path handling for spawned opponents
- Integration test for node module

[0.7.1] - 2016-10-01
- Necessary fixes to templates; now you can load templated bots from places other than their root directory
- --results parameter, check results/results.csv by default

[0.7.0] - 2016-09-30
- Some stuff about the --interactive flag
- Implement --server flag
- Remove compiled lib files from git
- Major cleanup of challenger class

[0.6.4] - 2016-06-24
- Fixes for npm modules

[0.6.0] - 2016-06-20
- Make this work with npm
- `generate` script
- Windows compatibility

0.4.1 => 0.5.0
- Fix teams that break the single species rule (via nicknames)
- Old typechart method is deprecated, use Typechart.compare
- Cancel challenges sometimes
- Automatically mega-evolve
- Teampreview now shows opponent's Pokemons, as you'd expect

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
- eh, maybe just say fuck it, make team() static
- lots of stuff is static, like all the metadata

9/11/2015
- Now two bots can fight each other to the end! In one terminal, run `babel-node scripts/spawn.js` (spawns martenbot by default) and run `babel-node src/main.js --bot=randombattle/stabby.js` in the other.


9/1/2015
- add a data store with battle info to connect.js or whatever. this might need to be an object with the battleId as its key to support multiple battles.
- when we get the 'turn' message (or something), call getMove() on your AI object.



API HACKING
example search:
http://replay.pokemonshowdown.com/search?user=DKFirelord
