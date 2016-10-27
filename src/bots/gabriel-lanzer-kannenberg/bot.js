/**
 * PokeTest
 *
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Damage from 'leftovers-again/lib/game/damage';
import Typechart from 'leftovers-again/lib/game/typechart';

//Get moves data relation
var movesData = require('leftovers-again/lib/data/moves.json');

//Function for calculating medium damage of a given attacker mon move to the deffender mon
function calcMediumDamage(attackerMon, deffenderMon, move) {
    var possibleDamages = Damage.getDamageResult(attackerMon, deffenderMon, move);
    var mediumDamage = 0;
    for(var j = 0; j < possibleDamages.length; j += 1){
        mediumDamage += possibleDamages[j];
    }
    mediumDamage /= possibleDamages.length;
    return mediumDamage;
}

var shouldChange = {b: false, justChanged: false};

/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */
class PokeTest {

    /**
    * Here's the main loop of your bot. `state` contains everything about the
    * current state of the game. Please read the documentation for more
    * details.
    *
    * @param  {Object} state The current state of the game.
    *
    * @return {Decision}     A decision object.
    */

    decide(state) {
        // `forceSwitch` occurs if your Pokemon has just fainted, or other moves
        // that mean you need to switch out your Pokemon
        shouldChange.b = false;
        if (state.forceSwitch) {
            const myMon = this._pickMoon(
            // filter through your reserve of Pokemon for ones that aren't dead
                state.self.reserve.filter( mon => (!mon.dead && !mon.active)),
                state.opponent.active,
                shouldChange
            );
            // return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
            // and the reserve index [0-5] of the Pokemon you're switching into.
            shouldChange.justChanged = true;
            return new SWITCH(myMon);
        }

        const myMove = this._pickMove(
            // filter through your active Pokemon's moves for a move that isn't disabled
            state.self.active.moves.filter( move => !move.disabled ),
            state.self.active,
            state.opponent.active
        );
        // return a Decision object. MOVE takes Move objects, move names, and
        // move indexes [0-3].

        //Check if is there any better pokemon
        const betterMon = this._pickMoon(
            // filter through your reserve of Pokemon for ones that aren't dead
            state.self.reserve.filter( mon => (!mon.dead))  ,
            state.opponent.active,
            shouldChange
        );

        if(shouldChange.b == true){
            shouldChange.justChanged = true;
            return new SWITCH(betterMon);
        }

        return new MOVE(myMove);
    }

    //Pick the best moon for this opponent
    _pickMoon(arr, opMon, shouldChange) {

        //Reference opponent moves for comparrison
        console.log(opMon.seenMoves.length + " known moves of " + opMon.species);
        var opMonMoves = [];
        for(var i = 0; i < opMon.seenMoves.length; i += 1){
            opMonMoves[i] = movesData[opMon.seenMoves[i]];
            console.log("Opponent Mon (" + opMon.species + ") known move: " + opMonMoves[i].name);
        }
        console.log(opMon.species + " has Speed of " + opMon.baseStats.spd);

        console.log("Array has " + arr.length + " mons!");

        //Finds the best mon agains this opponent
        var bestMon = { id: 0, effectiveness: 0, speed: 0};
        //For each pokemon
        for(var i = 0; i < arr.length; i += 1){
            //Reference mon moves enabled
            var monMoves = arr[i].moves.filter( move => !move.disable);

            //Calculate medium damage
            var damage = 0;
            //For each move
            for(var j = 0; j < monMoves.length; j += 1){
                damage += calcMediumDamage(arr[i], opMon, monMoves[j]);
            }
            damage /= monMoves.length;
            if(damage == 0)
                damage = 1;
            //console.log("Medium damage of " + arr[i].species + " is " + damage);

            //Calculate medium received damage
            var recDamage = 0;
            //For opponent's known move each move
            for(var j = 0; j < opMonMoves.length; j += 1){
                recDamage += calcMediumDamage(opMon, arr[i], opMonMoves[j]);
            }
            recDamage /= opMonMoves.length;
            //console.log("Medium received damage of " + arr[i].species + " is " + recDamage);

            if(opMonMoves.length == 0 || recDamage == 0)
                recDamage = 1;

            //Calculate effectiveness
            var effectiveness = (damage*1.5)/recDamage;

            //If bestMon and currentMon are faster than opponent, make a fair comparation
            if(arr[i].stats.spd > opMon.baseStats.spd && bestMon.speed > opMon.baseStats.spd){
                console.log("Comparing " + arr[bestMon.id].species + " with " + bestMon.effectiveness + " to " + arr[i].species + " with " + effectiveness);
                if(effectiveness / bestMon.effectiveness > 1.5){
                    bestMon.id = i;
                    bestMon.effectiveness = effectiveness;
                    bestMon.speed = arr[i].stats.spd;
                    console.log("New best mon! " + arr[bestMon.id].species + " with effectiveness of " + bestMon.effectiveness);
                }
            }
            else if(arr[i].stats.spd > opMon.baseStats.spd){ //If only currentMon is faster, double his effectiveness
                console.log("Comparing " + arr[bestMon.id].species + " with " + bestMon.effectiveness + " to " + arr[i].species + " with " + effectiveness*2.0);
                if((effectiveness*2.0) / bestMon.effectiveness > 1.5){
                    bestMon.id = i;
                    bestMon.effectiveness = effectiveness;
                    bestMon.speed = arr[i].stats.spd;
                    console.log("New best mon! " + arr[bestMon.id].species + " with effectiveness of " + bestMon.effectiveness);
                }
            }
            else if(bestMon.speed > opMon.baseStats.spd){ //If only bestMon is faster, double his effectiveness
                console.log("Comparing " + arr[bestMon.id].species + " with " + bestMon.effectiveness*2.0 + " to " + arr[i].species + " with " + effectiveness);
                if(effectiveness / (bestMon.effectiveness*2.0) > 1.5){
                    bestMon.id = i;
                    bestMon.effectiveness = effectiveness;
                    bestMon.speed = arr[i].stats.spd;
                    console.log("New best mon! " + arr[bestMon.id].species + " with effectiveness of " + bestMon.effectiveness);
                }
            }
            else{ //If neither of these mons are faster, make a fair comparation
                console.log("Comparing " + arr[bestMon.id].species + " with " + bestMon.effectiveness + " to " + arr[i].species + " with " + effectiveness);
                if(effectiveness / bestMon.effectiveness > 1.5){
                    bestMon.id = i;
                    bestMon.effectiveness = effectiveness;
                    bestMon.speed = arr[i].stats.spd;
                    console.log("New best mon! " + arr[bestMon.id].species + " with effectiveness of " + bestMon.effectiveness);
                }
            }

            console.log(arr[i].species + " effectiveness against " + opMon.species + " is " + effectiveness);
        }

        //Check wheater or not best mon is the current active one
        if(arr[bestMon.id].active){
            console.log("Most effective mon is the current active one! Should not change mon!");
            shouldChange.b = false;
            if(shouldChange.justChanged){
                shouldChange.justChanged = false;
            }
        }
        else{
            if(!shouldChange.justChanged){
                shouldChange.justChanged = true;
                shouldChange.b = true;
            }
            else{
                shouldChange.justChanged = false;
                shouldChange.b = false;
            }
        }

        //Returns best mon
        console.log(arr[bestMon.id].species + " is the most effective mon against " + opMon.species);
        return arr[bestMon.id];
    }

    //Pick the best move for this round
    _pickMove(arr, myMon, opMon) {
        //For each move, calculates the move medium damage and returns the one with highest damage
        var bestMove = { id:-1, damage:0, priority:0 };
        var cIneffective = 0;
        for(var i = 0; i < arr.length; i += 1){
            if(Typechart.compare(arr[i].type, opMon.types) == 0){
              console.log(arr[i].name + ": Is innefective");
              cIneffective++;
              continue;
            }

            var damage = calcMediumDamage(myMon, opMon, arr[i]);
            console.log(arr[i].name + ": " + damage);
            if(damage == 0){
                cIneffective++;
                continue;
            }

            if(arr[i].priority > bestMove.priority){
              if(damage > bestMove.damage){
                  bestMove.id = i;
                  bestMove.damage = damage;
                  bestMove.priority = arr[i].priority;
              }
            }
            else{
              if(damage > (bestMove.damage*2.0)){
                  bestMove.id = i;
                  bestMove.damage = damage;
                  bestMove.priority = arr[i].priority;
              }
            }

        }
        if(cIneffective == arr.length || bestMove.id == -1){
        console.log("Mon doesn't have any effective move, bot should change it ASAP!");
        }
        else{
        console.log("Best move is " + arr[bestMove.id].name + " of id " + bestMove.id);
        }
        if(bestMove.id == -1)
            bestMove.id = 0;
        return arr[bestMove.id];
    }
}

export default PokeTest;
