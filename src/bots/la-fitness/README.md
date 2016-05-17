# la-fitness
Pokémon bot for winning random battles

# Current Status: 
not telling.

# TODO
- handle accuracy calculations
- test out comparing moves to switches
- add 'confidence' to calculate odds of moves working
- test 'depth' functionality
- return nodes by fitness, all choices made 
- consider handling the situation where the opponent DOESN'T cast the minimax-dictated move. sometimes they don't even have that move in their moveset. to do this, you'll want to return another node, and add some variable indication that it's less likely to happen. (ex. 'confidence'? 'contingencies'? might want to include strings about it too.)
- test to prove a priority move will be good if it's a KO, but bad if not
