


### How do I get started?
First, make sure you have installed [node and npm](https://docs.npmjs.com/getting-started/installing-node). If you're using Windows, I recommend you use the node Windows installer, and that you install Git for Windows and use git command shell that comes with it (MinGW).

```bash
node -v
# 6.0.0 or greater plz!

# inside your bot's directory
npm install leftovers-again
```

### Initialize Your Bot
To create your first bot, run `node node_modules/leftovers-again/scripts/generate.js`.

Note that you'll want to have a good idea of [what format you'd like to compete in](https://www.smogon.com/forums/threads/the-beginners-guide-to-pok%C3%A9mon-showdown.3496279/). Most formats reqire you to choose a valid team for that format (besides ones where your team is randomly assigned to you). If you don't want to worry about team validation, just choose the format 'anythinggoes' for now.

### Your bot already works.
Try battling your bot against a simple opponent - one who chooses moves at random, and one who switches into other Pokemon only when necessary.

```bash
npm install
npm start -- --opponent=randumb
```

If you want a more challenging opponent, use `--opponent=stabby` - a bot who chooses moves that will do the most damage to you. [Check the source code](https://github.com/dramamine/leftovers-again/tree/master/src/bots) for more included opponents.


If you're not already running a server, you can set one up and start it by doing the following:

```bash
git clone https://github.com/dramamine/Pokemon-Showdown.git
npm run server
```

This downloads and installs a forked copy of the official Showdown server. The fork makes the server more bot-friendly by removing throttling on challenges and matches.

### Choosing Your Team
The `team()` function should return a string that matches the Smogon format. So, if you build a team on [Pokemon Showdown](http://play.pokemonshowdown.com/) using the Teambuilder, or if you copy Pokemon data from [Smogon](http://www.smogon.com/), you can paste it in this function.

The `team()` takes team data in other formats - see the [code documentation](http://metal-heart.org/static/docs/class/src/lib/team.js~Team.html) for more details.

Note that if you're playing the `randombattle` format, you don't need to define `team()`.

### What's in a request?
The heart of developing a bot lies in processing the `state` data from each turn / request, and choosing your moves & switches wisely. Check the [code documentation](http://metal-heart.org/static/docs/class/src/ai.js~AI.html) for more details.

### How do I respond to a request?
The preferred way is to return new instances of MOVE or SWITCH. Example code:
```
import {MOVE, SWITCH} from 'decisions';
return new MOVE(0);                          // the array index of the move, 0-3
return new MOVE('thunderbolt');              // the move's id
return new MOVE({id: 'thunderbolt', ...});   // a Move object
return new MOVE(state.self.active.moves[3]); // a Move object

return new SWITCH(0);                     // the array index of the pokemon, 0-5
return new SWITCH('eevee');               // the pokemon's id
return new SWITCH({id: 'eevee', ...});    // a Pokemon object
return new SWITCH(state.self.reserve[5]); // a Pokemon object
```

The unpreferred way is to return the string '/MOVE 4' or '/SWITCH 6' (1-indexed moves and switches), without using a Decision object.

## Reading State

### Where are the docs on `state`?
[code documentation](http://metal-heart.org/static/docs/class/src/ai.js~AI.html#instance-method-decide)

Besides the docs for `state`, you'll also wnat to familiarize yourself with what's in a [Pokemon object](http://metal-heart.org/static/docs/typedef/index.html#static-typedef-PokemonData) and what's in a [Move object](http://metal-heart.org/static/docs/typedef/index.html#static-typedef-MoveData)

Seriously, read the docs!

### What happens when my Pokemon is frozen?
`state.self.active.conditions = ['fro']`

### What happens when my Pokemon feints?
`state.self.active.dead = true`

### How do I check if a move gets STAB?
`[your pokemon].types.indexOf(move.type) >= 0`

## How do I check if a move will be super-effective?
```javascript
const Typechart = require('lib/typechart');
Typechart.compare('Normal', 'Fighting'); // 0.5
Typechart.compare('Fire', 'Grass'); // 2

// my move against the opponent
Typechart.compare(move.type, state.opponent.active.types);
```

### How can I tell if I have buffs?
Say you just cast Swords Dance, which raises your attack by 2 levels. You should find that `state.self.active.boosts.atk = 2`. Make sure you check if `mon.boosts` exists before poking at it, since the property `boosts` is only set when there _are_ boosts.

### How can I tell it's the first turn of the match?
`state.teamPreview = true`. When this is set, you need to SWITCH (MOVE decisions are not valid).

### How can I have my Pokemon mega-evolve?
If your Pokemon is able to mega-evolve, it will do so by default.
```javascript
// see if your Pokemon is able to mega-evolve
if (state.self.active.canMegaEvo)
{
  // this will keep your Pokemon from mega-evolving this turn
  const decision = new MOVE("Brave Bird")
  decision.shouldMegaEvo = false
  return decision
}
```

### How can I have my Pokemon use its Z-Move?
If you Pokemon is able to use its Z-Move, it will do so by default when you select the "base move" for that Z-Move.
```javascript
// see if your Pokemon is able to use a Z-Move
if (state.self.active.canZMove)
{
  const zMoveable = state.self.active.moves.find(move => move.zMove)
  console.log(zMoveable.name)       // ex. "Scald"
  console.log(zMoveable.zMove.name) // ex. "Hydro Vortex"
  var decision = new MOVE(zMoveable)
  decision.shouldZMove = false      // don't use Z-Move this turn
  return decision
}
```

### How can I tell if my active Pokemon feinted?
`state.forceSwitch = true`, which is an indication that you need to SWITCH instead of MOVE. This can happen in other situations too, due to moves such as Volt Switch or Whirlwind. Make sure you handle this!

You will also find that that Pokemon has these properties:
{
    dead: true,
    condition: '0/{{maxhp}} fnt',
    hp: 0,
    hppct: 0
}
You probably care most about 'dead'.

### How can I tell if choices are invalid?
Make sure you're only choosing valid choices.
- If `state.forceSwitch` is true, make sure you switch.
- Don't switch into a Pokemon with (mon.dead = true) or (mon.active = true)
- Don't send moves with (move.disabled = true)

## What gets logged & what gets written to console?
You can change the logging level when running the bot using '--loglevel=[x]'. 1 returns only errors, 5 shows debug info

Server messages get logged to `log/replays/{{timestamp}}-{{battleid}}`
States get logged to `log/states/{{timestamp}}-{{battleid}}`. These can be extremely useful for unit tests and debugging crashes (you can easily call decide() on these JSON objects). **TODO:** logging isn't like this yet.




### How do I run my bot against live humans?
`npm start -- --production` will connect you to the leftovers-again bot server at http://cyberdyne.psim.us. From there, you can play against humans and

### How do I submit my bot to be included in the AI competition?
You need to publish your bot on NPM, GitHub, or some other git hosting service. I'm manually maintaining these lists for now, so just message marten@metal-heart.org and we'll work from there.

### I'd like to contribute code to this project!
[Read the contribution guide](./CONTRIBUTING.md).


### Something is wrong, and it's your fault.
Why don't you solve it yourself and send me a pull request? (Please!)

Otherwise, file an [issue](https://github.com/dramamine/leftovers-again/issues). Be sure to include reproduction steps, relevant logs, expected / actual results, etc. Help me help you!


### I'd like to battle in a format that's unsupported.
You can set your format in your bot config file; this is not validated before it's sent to the server. The valid names of formats are listed [in the official repo](https://github.com/Zarel/Pokemon-Showdown/blob/master/config/formats.js). Formats are more about team validation than anything else.

Probably every singles format is functional. Doubles formats aren't implemented yet.


## #How do I use the damage calculator?
Included in here is library code for the [Pokemon Damage Calculator](http://pokemonshowdown.com/damagecalc/). I adapted it to work with our bot code.

```javascript
const Damage = require('leftovers-again/src/game/damage')
const estimatedDamage = Damage.getDamageResult(
  state.self.active,
  state.opponent.active,
  move
)

[More sample code here.](https://github.com/dramamine/leftovers-again/blob/master/src/bots/stabby/stabby.js)

## Development Tips

* Want to continuously run battles as you develop code? Use `npm run develop -- {{your bot's name}} [other cmdline args]`, which watches src/ directory and refreshes when those files chage.
* Want to run battles faster? Keep the server and your opponent running instead of restarting them each time. For example, I would keep three tabs open with these commands running:
```bash
npm run server     # in separate tab
npm start randumb  # in separate tab
npm run develop -- myawesomebot --scrappy
```
(The --scrappy flag specifies that the bot will initiate battles against all users on the server, including users who join later.)

### What opponents are worth playing against?
If you're playing random battles:
- 'randumb' is a bot that just picks random moves, and switches into another Pokemon only when necessary.
- 'stabby' picks the strongest attack moves, and switches into another Pokemon only when necessary.

If you're playing other tiers:
- 'randumb' is still a good opponent; it chooses a random team, then random moves etc.
- You may want to set your bot to 'anythinggoes' so that you can test against bots in any tier.
- 'elitefour' bots are included. Check the bots/elitefour directory for full names, ex. 'opponent=elitefour/xy-diantha' **TODO**

### What gets logged to the console?
Set --loglevel=[x] to whatever you'd like:
1: erros: catastrophic errors and broken code
2: warnings: stuff you might want to look into; weird server responses; inconsistencies in internal state
3: logs: this is the default level that gets logged to console
4: info: normal server communication updates
5: debug: includes all state objects sent to your bot

### What else gets logged?
Some stuff in the logs directory **TODO**
