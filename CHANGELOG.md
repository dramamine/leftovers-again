

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
