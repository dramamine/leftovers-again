

import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';
import Damage from 'leftovers-again/lib/game/damage';
import KO from 'leftovers-again/lib/game/kochance';
import Evaluator from './Evaluator';
import util from 'leftovers-again/lib/pokeutil';
import Formats from 'leftovers-again/lib/data/formats';


class GabrielFazenda {

  decide(state) {


    if (state.forceSwitch) {

         var nextPkmn = Evaluator._doSwitchMove(state);
      	 return new SWITCH(nextPkmn);
    }

      var theChoice = Evaluator.getNextMove(state);

      var currentAction = theChoice.actionType;//this._getBestAction(state);

      switch(currentAction){
        case 'switch':{
  			  var nextPkmn = this._translateName(state,currentAction,theChoice.moveName);
          return new SWITCH(nextPkmn);

          }
          break;
          case 'move':{
               var moveId = this._translateName(state,currentAction,theChoice.moveName);//this._getBestMove(state);
               return new MOVE(moveId);
          }
          break;
      }
  }

_translateName(state,type,moveName){
    switch (type) {
      case 'switch':{
        for (var i = 0; i < state.self.reserve.length;i++){
          var pkmn = state.self.reserve[i];
          if(pkmn.species == moveName && !pkmn.active){
            return i;
          }
      }
    }
      break;
      case 'move':{
          for (var i = 0; i < state.self.active.moves.length;i++){
            var currMove = state.self.active.moves[i];
            if(currMove.id == moveName){
              return i;
            }
          }
      }
      break;
    }
}


}

export default GabrielFazenda;
