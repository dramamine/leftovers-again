## How do I get started?
Run `make`, which will install some important things.

### Initialize Your Bot
To create your first bot, run `npm run generate`.

Note that you'll want to have a good idea of what format you'd like to compete in. Most formats reqire you to choose a valid team for that format (besides ones where your team is randomly assigned to you). If you don't want to worry about team validation, just choose the format 'anythinggoes' for now.

### Your bot already works.
Try battling your bot against a simple opponent - one who chooses moves at random, and one who switches into other Pokemon only when necessary. Run the command `npm start -- {{your bot name}} --opponent=randumb` to run a battle and see what happens!

You will probably lose.

### Choosing the Team
The `getTeam` function should return a string that matches the Smogon format. So, if you build a team on [Pokemon Showdown](http://play.pokemonshowdown.com/) using the Teambuilder, or if you copy Pokemon data from [Smogon](http://www.smogon.com/), you can paste it in this function.

The `getTeam` takes team data in other formats - see the [code documentation]() for more details

Note that if you're playing the `randombattle` format, you don't need to define `getTeam`.

### What's in a request?
The heart of developing a bot lies in processing the `state` data from each turn / request, and choosing your moves & switches wisely. Check the [code documentation]() for 

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

The unpreferred way is to return the string '/MOVE 4' or '/SWITCH 6' (1-indexed moves and switches),

## Reading State

### Where are the docs on `state`?
[code documentation]()

Seriously, read the docs! They are most up-to-date!

## What happens when my Pokemon is frozen?
`state.self.active.conditions = ['fro']`

# What happens when my Pokemon feints?
`state.self.active.dead = true`

## How do I check if a move gets STAB?
`mon.types.indexOf(move.type) >= 0`

## How do I check if a move will be super-effective?
```
import typechart from 'lib/typechart';
typechart['normal']['fighting'] // 0.5
typechart['fire']['grass'] // 2
```

# How can I tell if I have buffs?
Say you just cast Swords Dance. You should find that `state.self.active.boosts.atk = 2`. Make sure you check if `mon.boosts` exists before poking at it, since boosts is only set when there _are_ boosts.

More importantly: `state.forceSwitch = true`, which is an indication that you need to SWITCH instead of MOVE. This can happen in other situations too, due to moves such as Volt Switch or Whirlwind. Make sure you handle this!

## Valid Choices
Make sure you're only choosing valid choices.
- If `state.forceSwitch` is true, make sure you switch.
- Don't switch into a Pokemon with (mon.dead = true) or (mon.active = true)
- Don't send moves with (move.disabled = true) and (move.pp > 0)

## What gets logged & what gets written to console?
You can change the logging level when running the bot using '--loglevel=[x]'. 1 returns only errors, 5 shows debug info

Server messages get logged to `log/replays/{{timestamp}}-{{battleid}}`
States get logged to `log/states/{{timestamp}}-{{battleid}}`. These can be extremely useful for unit tests and debugging crashes (you can easily call onRequest() on these JSON objects)




## How do I run my bot against live humans?
I'm not comfortable releasing that code to the public, but message marten@metal-heart.org if you're interested. Only do this if your bot is **great** (i.e. can beat all of the bots I wrote).

## How do I submit my bot to be included in the AI competition?
You need to publish your bot on NPM, GitHub, or some other git hosting service. I'm manually maintaining these lists for now, so just message marten@metal-heart.org with installation instructions for me.

## I'd like to contribute code to this project!
[link to CONTRIBUTING.md]



## Something is wrong, and it's your fault.
Why don't you solve it and send me a pull request? (Please!)

File an [issue] on GitHub. Be sure to include reproduction steps, relevant logs, expected / actual results, etc. Help me help you!


## I'd like to battle in a format that's unsupported.
You can set your format in your bot config file; this is not validated before it's sent to the server. The valid names of formats are listed [in the official repo](). Formats are more about team validation than anything else.

Probably every singles format is functional. Doubles formats aren't implemented yet.



## How do I use the damage calculator?
Included in here is library code for the [Pokemon Damage Calculator](http://pokemonshowdown.com/damagecalc/). I adapted it to work with our bot code. To use it, simply call: //TODO

## What's your bot code of ethics?
- Bots will not ruin the game for anyone.
- Bots and their owners will identify themselves as such.



## Development Tips
* Want to continuously run battles as you develop code? Use `npm run develop -- {{your bot's name}} [other cmdline args]`, which watches the bots/ and src/ directory and refreshes when those files chage.
* Want to run battles faster? Keep the server and your opponent running instead of restarting them each time. For example, I would keep three tabs open with these commands running:
```
npm run server
npm start randumb
npm run develop -- myawesomebot --scrappy
```
(The --scrappy flag specifies that the bot will initiate battles against all users on the server, including users who join later.)


## How do I develop my bot locally?
First, you need to run the official Pokemon Showdown server locally. You can do this by running `npm run server`, which will run the Pokemon Showdown server installed as a git submodule in `libs/Pokemon-Showdown`.

Next, you need some opponents. Here are tons of options:

- Run an opponent locally:
  * `npm run fight randumb`

Run  
