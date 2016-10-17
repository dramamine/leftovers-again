import Formats from 'leftovers-again/lib/data/formats';
import util from 'leftovers-again/lib/pokeutil';
import Typechart from 'leftovers-again/lib/game/typechart';
import Damage from 'leftovers-again/lib/game/damage';
import KO from 'leftovers-again/lib/game/kochance';
var myOptions;
var myMoveNodes = [];
var mySwitchNodes = [];
var enemyPokemonLastStats;
var myPokemonLastStats;

class Evaluator {
  constructor() {
  }


  getNextMove(state){
    var theWinner = undefined;
    myOptions = this.getMyOptions(state);
	  var firstNode = this.createNodes(state, 'move', myOptions);
	  var theResult =  this._doMinimax(firstNode,1,true);
	  var winningNodeMove = undefined;
	  for(var i = 0; i < myMoveNodes.length;i++){
			if(myMoveNodes[i].result == theResult){
				winningNodeMove = myMoveNodes[i];
				break;
			}
	  }

    var firstNode = this.createNodes(state, 'switch', myOptions);
	  var theResult =  this._doMinimax(firstNode,1,true);
	  var winningNodeSwitch = undefined;
	  for(var i = 0; i < mySwitchNodes.length;i++){
			if(mySwitchNodes[i].result == theResult){
				winningNodeSwitch = mySwitchNodes[i];
				break;
			}
	  }

    if(winningNodeSwitch === undefined || state.self.active.species == winningNodeSwitch.moveName){
        theWinner = winningNodeMove;
    }
    else if(winningNodeMove === undefined){
        theWinner = winningNodeSwitch;
    }
    else{
       theWinner = (winningNodeMove.result >= winningNodeSwitch.result) ? winningNodeMove : winningNodeSwitch;
    }
    if(theWinner !== undefined && theWinner.actionType=='move'){
      enemyPokemonLastStats = state.opponent.active;
      myPokemonLastStats = state.self.active;
    }

	  return theWinner;
  }

  _doSwitchMove(state){
    myOptions = this.getMyOptions(state);
    var firstNode = this.createNodes(state, 'switch', myOptions,false);
    var theResult =  this._doMinimax(firstNode,1,true);
    var winningNodeSwitch = undefined;

    for(var i = 0; i < mySwitchNodes.length;i++){
      if(mySwitchNodes[i].result == theResult){
        winningNodeSwitch = mySwitchNodes[i];
        break;
      }
    }
    for (var i = 0; i < state.self.reserve.length;i++){
      var pkmn = state.self.reserve[i];
      if(pkmn.species == winningNodeSwitch.moveName){
        return i;
      }
      }

  }

  _getMoveDMG(attacker,defender,move, optimistic = false){
         var currentBestMove = {
             damage : -1,
         };
         var maxDamage = -1;
         var estimatedDMG = [];
           try {
             estimatedDMG = Damage.getDamageResult(attacker,defender, move);
           } catch (e) {
             console.log(e);
           }
           var index = optimistic ? 0 : estimatedDMG.length-1;
          if (estimatedDMG[index] > maxDamage) {
             maxDamage = estimatedDMG[index];
   		    var chances = KO.predictKO(estimatedDMG,attacker);

           if(maxDamage > currentBestMove.damage){
              currentBestMove.damage = maxDamage;
            }

        }
        return currentBestMove.damage;

  }


 _doMinimax(node, depth, maxPlayer){
    if(depth == 0 || node.theChildren == undefined){
      return node.result;
    }
    var bestValue, currValue;
    if(maxPlayer){
      bestValue = -9999999999;
      for (var i = 0;i < node.theChildren.length; i++){
        currValue = this._doMinimax(node.theChildren[i],depth-1,false);
        bestValue = Math.max(currValue,bestValue);
      }
      return bestValue;
    }
    else{
      bestValue = 9999999999;
      for (var i = 0;i < node.theChildren.length; i++){
        currValue = this._doMinimax(node.theChildren[i],depth-1,true);
        bestValue = Math.min(currValue,bestValue);
      }
      return bestValue;
    }
  }

  getMyOptions(state) {
    var myOptionsOBJ = {
      switches : [],
      moves : []
    };

    myOptionsOBJ.switches = state.self.reserve.filter(mon => {
    return !mon.active && !mon.dead && !mon.disabled;
    });


   if (!state.forceSwitch && !state.teamPreview && state.self.active &&
     state.self.active.moves) {
     myOptionsOBJ.moves = util.clone(state.self.active.moves)
       .filter(move => !move.disabled);
   }
   return myOptionsOBJ;

}


_didItWorkBefore(state){
   var currentMine = state.self.active;
   var currentEnemy = state.opponent.active;
   var worked = true;
    if(myPokemonLastStats == undefined && enemyPokemonLastStats == undefined)
        worked = true;

    if(myPokemonLastStats.species == currentMine.species && enemyPokemonLastStats.species == currentEnemy.species){
		if(enemyPokemonLastStats.hp != currentEnemy.hp || currentEnemy.prevMoves[0] == 'Protect' || currentEnemy.prevMoves[0] == 'Substitute'
		  || currentMine.statuses == 'par' || currentMine.statuses == 'slp' || currentMine.statuses == 'frz'){
			worked =  true;
		}
    else{
			worked = false;
		}
    }
    else{
		    worked = true;
	}
  return worked;
}

differentThanLastMove(state,move){
    return move.id != state.self.active.prevMoves[0];
}


createNodes(state, type, options,considerActive = true){


  var myNode ={
       actionType : "1",
       result : undefined,
	     moveName : "",
       id : -1,
       theParent : -1,
       theChildren : []
  };

  switch (type) {
    case 'move':{
      myMoveNodes = [];
        for(var i = 0; i < options.moves.length;i++){
          var currMove = options.moves[i];
          if(!this.differentThanLastMove(state,currMove) && !this._didItWorkBefore(state)){
              continue;
          }
          var DMG = this._getMoveDMG(state.self.active,state.opponent.active, currMove);
          var newNode = Object.create(myNode);
		      var chance = KO.predictKO(DMG,state.opponent.active);
		      var other = (chance.turns == 1 && chance.chance >= 75) ? 5 : 0;
          newNode.actionType = type;
		      newNode.moveName = currMove.id;
          newNode.result = this.evaluatePkmnMove(DMG) + other;
          newNode.theParent = myNode;
          myNode.theChildren.push(newNode);
		      myMoveNodes.push(newNode);
        }
    }
    break;
    case 'switch':{
      mySwitchNodes = [];
      var moves;
      try {
       moves = Formats[util.toId(state.opponent.active.species)].randomBattleMoves
          .map(id => util.researchMoveById(id));
      }
      catch(e){
      }
      for (var i = 0; i < state.self.reserve.length;i++){

        var pkmn = state.self.reserve[i];
        if(!considerActive && pkmn.active){
          continue;
        }
        if (pkmn.dead || pkmn.disabled)
            continue;
        var strenghts = [];
        var weaknesses = [];
        for (var j = 0; j < pkmn.moves.length;j++){
             var currentMove = pkmn.moves[j];
             strenghts.push(Typechart.compare(currentMove.type, state.opponent.active.types));
        }
        if(moves !== undefined && state.opponent.active.seenMoves.length < 3){
            for (var k = 0; k < moves.length;k++){
                var enemyMove = moves[k];
                weaknesses.push(Typechart.compare(enemyMove.type, pkmn.types));
            }
        }
        else{
           for (var k = 0; k < state.opponent.active.seenMoves.length;k++){
                var enemyMove = util.researchMoveById(state.opponent.active.seenMoves[k]);
                weaknesses.push(Typechart.compare(enemyMove.type, pkmn.types));
            }
        }
        var result = Number();
        for(var j = 0;j < weaknesses.length;j++){
            result += this.evaluatePkmnWeakness(weaknesses[j]);
        }
        for(var j = 0;j < strenghts.length;j++){
            result += this.evaluatePkmnStrength(strenghts[j],weaknesses.length);
        }
        var newNode = Object.create(myNode);
        newNode.actionType = type;
        newNode.moveName = pkmn.species;
        newNode.result = result;
        newNode.theParent = myNode;
        myNode.theChildren.push(newNode);
        mySwitchNodes.push(newNode);
        }
      }
      break;
    }

  return myNode;
}
  evaluatePkmnMove(damage){
      var heuristic = 0.25;
      var result = (damage * heuristic);
      return result;
  }

  evaluatePkmnWeakness(value){
      var multiplier = -2;
      if(value == 2)
        multiplier *= 2;
      var result = (value * multiplier);
      return result;
  }

  evaluatePkmnStrength(value, movesCompared){
      var multiplier = 2 * (movesCompared/4);
      if(value == 2)
        multiplier *= 2;

      var result = (value * multiplier);
      return result;
  }

}

export default new Evaluator();
