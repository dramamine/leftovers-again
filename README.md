## MY SHOWDOWN CLIENT

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

