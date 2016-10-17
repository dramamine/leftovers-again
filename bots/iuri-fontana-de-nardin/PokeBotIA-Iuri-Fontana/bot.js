import Typechart from 'leftovers-again/lib/game/typechart';
/**
 * Iuribot1234
 *
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';

/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */

var _damage = require('leftovers-again/lib/game/damage');
var _damage2 = _interopRequireDefault(_damage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Iuribot1234 {

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
    //return new MOVE(0);
    // `forceSwitch` occurs if your Pokemon has just fainted, or other moves
    // that mean you need to switch out your Pokemon
    if (state.forceSwitch) {  //se pokemon morreu ou for preciso mudar
        
        var move = 0; // teste de habilidades inicial
        var move2 = 0; // melhor teste feito
        var movemelhor = 0; // id do melhor teste
        
        for(var i = 0; i < 6;i++){ // percorre a lista de pokemons
                move = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); // seta o tipo do pokemon
                if(state.self.reserve[i].dead == true){ // verifica se ele está morto
                    move = -5;
                }
                if(move > move2){ // testa se o atual é melhor do que o melhor atual
                   move2 = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); // se for melhor seta o novo melhor atual
                   movemelhor = i; // seta o id do melhor atual
               }  
        }
         return new SWITCH(movemelhor);
    }
      
    /*
      var moveloop = 0; // teste de habilidades inicial
      var move2loop = 0; // melhor teste feito
      var movemelhorloop = 0; // id do melhor teste
      
      
      for(var i = 0; i < 6;i++){ // percorre a lista de pokemons
             moveloop = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); // seta o tipo do pokemon
            if(state.self.reserve[i].dead == true){ // verifica se ele está morto
                moveloop = -5;
            } else {
              if(moveloop > move2loop){ // testa se o atual é melhor do que o melhor atual
              move2loop = moveloop; // se for melhor seta o novo melhor atual
              movemelhorloop = i; // seta o id do melhor atual
           }
        }
      } 
        moveloop = Typechart.compare(state.self.active.types[0], state.opponent.active.types); // testa o pokemon atual
        if(moveloop > move2loop){  //verifica se o pokemon atual é possui atuacao melhor que o melhor reserva
               if(move2loop == 0){
              } else{
               return new SWITCH(movemelhorloop);
            }
        } else {
            if(move2loop == 0){
              } else{
            return new SWITCH(movemelhorloop);
            }
        }*/
      
     var moveloop = 0; // teste de habilidades inicial
      var move2loop = 0; // melhor teste feito
      var movemelhorloop = 0; // id do melhor teste

      for(var i = 0; i < 5;i++){ // percorre a lista de pokemons
             moveloop = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); // seta o tipo do pokemon
            if(state.self.reserve[i].dead == true){ // verifica se ele está morto
                moveloop = -8;
            } else {
              if(moveloop > move2loop){ // testa se o atual é melhor do que o melhor atual
                  move2loop = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); // se for melhor seta o novo melhor atual
                  movemelhorloop = i; // seta o id do melhor atual
              }
            }
      }
      
       moveloop = Typechart.compare(state.self.active.types[0], state.opponent.active.types); // testa o pokemon atual
       if(moveloop > move2loop){  //verifica se o pokemon atual é possui atuacao melhor que o melhor reserva
          //move2 = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); 
          //return -1; // não vai mudar de pokemon 
           moveloop = -8;
           } else {
               if(move2loop < 2){
                   move2loop = 0;
              } else {
               return new SWITCH(movemelhorloop);
              }
           }
      
      
      
      
      // escolhe o movimento super effetivo
       var poder = 0;
       var poder2 = 0;
       var podermelhor = 0;
       var est = [];
      
       for(var i = 0; i < 4;i++){ // percorre a lista de movimentos    
            
            try {
                est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move);
            } catch (e) {
                console.log(e);
                console.log(state.self.active, state.opponent.active, move);
            }
             //poder = Typechart.compare(state.self.active.moves[i], state.opponent.active.types); // compara o movimento com o tipo do inimigo
            if (state.self.active.moves[i].disable == true){
            } else {
                if(state.self.active.moves[i].basePower < 50){ 
                    poder = -5;
                }else {
                    if(est[0] > poder2){ // testa se o atual é melhor do que o melhor atual
                        poder2 = est[0]; // se for melhor seta o novo melhor atual
                        podermelhor = i; // seta o id do melhor atual
                    }
                }
             }
      }      
      return new MOVE(podermelhor);
  }
}

export default Iuribot1234;



