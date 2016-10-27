/**
 * RyujinBot
 *
 */
import { MOVE, SWITCH } from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';

var myBotSwitched = false;
var shouldSwitch = false;
var justSwitched = false;
var atacksAfterSwitch = 0;

class Ryujin 
{	
    decide(state) 
    {		
        if (state.forceSwitch) 
        {
            const myMon = this.selectPokemon( state.self.reserve.filter( mon => !mon.dead && !mon.active ), state.opponent.active);
            // return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
            // and the reserve index [0-5] of the Pokemon you're switching into.
            return new SWITCH(myMon);
        }
		
        if(!state.self.active.dead && !justSwitched)
        {
            shouldSwitch = this.checkStatus(state.self.active, state.opponent.active);
            if(shouldSwitch == true)
            {
                console.log("Should Switch");
            }
        }
		
        if(shouldSwitch)
        {
            const myMon = this.selectPokemon( state.self.reserve.filter( mon => !mon.dead && !mon.active ), state.opponent.active);
            shouldSwitch = false;
			justSwitched = true;
            // return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
            // and the reserve index [0-5] of the Pokemon you're switching into.
            return new SWITCH(myMon);
        }
	
        const myMove = this.selectMove( state.self.active.moves.filter( move => !move.disabled ), state.opponent.active);
        // return a Decision object. MOVE takes Move objects, move names, and
        // move indexes [0-3].
        return new MOVE(myMove);
    }
	
    //check probability to win a fight
    checkStatus(myPokemon, opponentPokemon)
    {
        var aux = false;
        for(var i = 0; i < myPokemon.statuses.length; i++)
        {
            console.log("statuses: " + myPokemon.statuses[i]);
            if(myPokemon.statuses[i] == 'par')
            {
                aux = true;
            }
        }
		
        //switch when opponent type is super effective			
		var sumTypechart = 0;
		for(var i = 0; i < myPokemon.types.length; i++)
		{
			sumTypechart += Typechart.compare(myPokemon.types[i], opponentPokemon.types);
		}
		console.log("Sum Typechart: " + sumTypechart);
		//mininum required to switch
		if(sumTypechart >= 2.5)
		{
			aux = true;
		}
		
        return aux;
    }
  
    selectMove(myPokemonMoves, opponentPokemon)
    {
        var aux = 0;
        var chosenMove = 0;

        for(var i = 0; i < myPokemonMoves.length; i++)
        {
            if(aux < Typechart.compare(myPokemonMoves[i].type, opponentPokemon.types))
            {
                aux = Typechart.compare(myPokemonMoves[i].type, opponentPokemon.types);
                chosenMove = i;
            }
        }
		
        if(justSwitched)
        {
            atacksAfterSwitch++;
			if(atacksAfterSwitch > Math.floor((Math.random() * 4) + 2))
			{
				justSwitched = false;
				atacksAfterSwitch = 0;
			}
        }

        return myPokemonMoves[chosenMove];
        
    }
  
    selectPokemon(myPokemon, opponentPokemon)
    {
        myBotSwitched = true;
        console.log("Just switched pokemon");
        var aux = 0;
        var chosenPokemon = 0;
        var sumAtacks = 0;
        for(var i = 0; i < myPokemon.length; i++)
        {
            for(var j = 0; j < myPokemon[i].types.length; j++)
            {
                //Check Pokemon types against opponent
                if(aux < Typechart.compare(myPokemon[i].types[j], opponentPokemon.types))
                {
                    //Check Pokemon moves and set the one with higher stats to win the fight(case if there another pokemon of same type on the team)
                    if(sumAtacks < this.getSumAtacksEffectiveness(myPokemon[i], opponentPokemon))
                    {
                        sumAtacks = this.getSumAtacksEffectiveness(myPokemon[i], opponentPokemon);
                        aux = Typechart.compare(myPokemon[i].types[j], opponentPokemon.types);
                        chosenPokemon = i;
                    }
                }
            }
        }

        console.log("Effectiveness of Pokemon type: " + aux);
        console.log("Effectiveness of Pokemon moves: " + sumAtacks);

        return myPokemon[chosenPokemon];
    }

    getSumAtacksEffectiveness(myPokemon, opponentPokemon)
    {
        var sumAtacks = 0;

        for(var i = 0; i < myPokemon.moves.length; i++)
        {
            sumAtacks += Typechart.compare(myPokemon.moves[i].type, opponentPokemon.types);
        }

        return sumAtacks;
    }
}

export default Ryujin;
