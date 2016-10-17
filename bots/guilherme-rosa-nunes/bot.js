import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';

 function compareTypes(m1, m2){
        var t1 = m1.types;
        var t2 = m2.types;
        var value = 0;
      
        for(var i = 0; i < t1.length; ++i){
            var type = t1[i];
            
            for(var j = 0; j < t2.length; ++j){
                var type2 = t2[j];
                value += Typechart.compare(type, type2);
            }
        }
     
     return value;
} //estado que compara os tipos de poke

 function compareMoves(t1, state) {
     var ef = Typechart.compare(t1.type, state.opponent.active.types)*100;
     var acur = t1.accuracy;
     var bp = t1.basePower;
     
    return ef+acur+bp;
} //estado que compara os movimentos

function myMonIsBest(state){
    var myMons = state.self.reserve.filter(mon => !mon.dead);
    var enemyMon = state.opponent.active;
    var mon = state.self.active;
    
    var value = 0; var id = -1;
    for(var i=0; i < myMons.length; ++i) {
        if(compareTypes(myMons[i], enemyMon) > value) {
            value = compareTypes(myMons[i], enemyMon);
            id = i;
        }
    }
    
    if(myMons[id].species == mon.species) return true;
    else return false;
} //estado que verifica se o poke atual é o melhor

 function takeBetterMoon(state){
    var myMons = state.self.reserve.filter(mon => !mon.dead);
    var enemyMon = state.opponent.active;

            var value = 0; var id = -1;
            for(var i=0; i < myMons.length; ++i) {
                if(compareTypes(myMons[i], enemyMon) > value) {
                    value = compareTypes(myMons[i], enemyMon);
                    id = i;
                }
            }


            //console.log("Mon: " + myMons[id].species + " value: " + value + " id: " + id + " Active: " + myMons[id].active);
            const myMon = myMons[id];
            
            if(myMon.active == true){
                var arr = myMons.filter(mon => mon.species != myMon.species);
                const m = arr[Math.floor(Math.random() * arr.length)];
                console.log(m.species);
                return m;
            } else {
                return myMon;
            }
} //estado que escolhe o melhor poke

function takeBetterMove(state) {
    var myMoves = state.self.active.moves;
    
    
    var val = 0; var id = -1;
    for(var i=0; i<myMoves.length; ++i){
            if(compareMoves(myMoves[i], state) > val && !myMoves[i].disabled) {
                val = compareMoves(myMoves[i], state);
                id = i;
            }
    }
      
    const mov = myMoves[id];
    console.log("Move: " + mov.name + " value: " + val + " id " + id);
    //id2 = -1;
      
    if(id == -1){
        const myMove = this._pickOne(state.self.active.moves.filter( move => !move.disabled ));
        return myMove;
    }
    else{
        //console.log("Movimento: " + myMoves[id2].name + " value: " + value2 + " id: " + id2);
        return mov;
      }
    
    return mov;
    
} // Estado que decidde o movimento

function decideAction(state, turn, fs, changed, myMon){
        if(myMon.dead) return 0;
        //if(state.self.reserve.filter(mon => !mon.dead).length == 1) return 1;
        if(turn == 0) return 0; //switch;
        if(fs) return 0;
        //if(myMon.hppct < 20 && state.self.reserve.filter(mon => !mon.dead).length > 1) return 0;
        if(changed && !myMonIsBest(state)) return 0;
        return 1; //atack
        
        console.log("nao decidi nada"); return -1;
    } //Estado inicial

var turn = -1; //contador de turnos
var enemyMon; //pokemon atual do adversário
class PokeTest {

  decide(state) {
      turn++;
      //verifica se trocou de poke
      var changed = false;
      if(turn == 0){ enemyMon = state.opponent.active.species;}
      else {
          if(enemyMon != state.opponent.active.species) {
              changed = true;
              enemyMon = state.opponent.active.species;
          }
      }
      
      //chama o primeiro estado
      var choise = decideAction(state, turn, state.forceSwitch, changed, state.self.active);
      
      //passa para o proximo estado;
      switch(choise){
          case 0: //switch
              console.log("swicth");
              const mon = takeBetterMoon(state);
              return new SWITCH(mon);
          break;
            
          case 1: //atack
              console.log("attacking");
              const mov = takeBetterMove(state);
              return new MOVE(mov);
          break;
      }
  }
    
  _pickOne(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    
}

export default PokeTest;
