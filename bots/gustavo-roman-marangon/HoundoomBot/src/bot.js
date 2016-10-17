/**
 * HOUNDOOM_BOT
 *
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';
import Log from 'leftovers-again/lib/log';
import Damage from 'leftovers-again/lib/game/damage';
import KO from 'leftovers-again/lib/game/kochance'

/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */
class HOUNDOOM_BOT {


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
    if (state.forceSwitch) {        
        const myMon = this._selectBestPokemon(state.self.reserve.filter(mon1 => !mon1.dead).filter(mon2 => !mon2.active).filter(mon3 => !mon3.disabled), state.opponent.active);
        return new SWITCH(myMon);
    }

    //Este método _de
    var action = this._decideBestAction(state);
    if(action.action == "move"){
      return new MOVE(action.object);
    }
    else{
      return new SWITCH(action.object);
    }
  }

  // randomly chooses an element from an array
  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
    
    //Este método utiliza avalia o a pontuação do melhor move dos meus pokemons e compara estas pontuações com a pontuação do pokemon ativo inimigo. Esta pontuação representa o potencial de matar um pokemon expressa em turnos
    _decideBestAction(state){
        var myReserve = state.self.reserve.filter(mon1 => !mon1.dead).filter(mon2 => !mon2.active).filter(mon3 => !mon3.disabled);        
        var activePokemonBestMove = this._selectBestMove(state.self.active, state.opponent.active);
        var opponentPokemonBestMove; 
        var reservePokemonBestMoves = [];
        var opponentPokemonBestMoveVersusReserve = [];
        var activeMatchup;
        var bestMatchup = -100
        var bestPokemonIndex = -1;
        var trySwitch = false;
        
        if(state.opponent.active.seenMoves != undefined){
            opponentPokemonBestMove = this._selectBestSeenMove(state.opponent.active, state.self.active);
        }
        else{
            opponentPokemonBestMove = {move: undefined, score: 0};
        }
        
        
        for(var i = 0; i < myReserve.length; i++){
            reservePokemonBestMoves.push(this._selectBestMove(myReserve[i], state.opponent.active));
            if(state.opponent.active.seenMoves != undefined){
                opponentPokemonBestMoveVersusReserve.push(this._selectBestSeenMove(state.opponent.active, myReserve[i]));
            }
            else{
                opponentPokemonBestMoveVersusReserve.push({move: undefined, score: 0});
            }
        }
        
        
        for(var i = 0; i < myReserve.length; i++){
            var currentMatchup = reservePokemonBestMoves[i].score - (opponentPokemonBestMoveVersusReserve[i].score/2);
            if(currentMatchup > bestMatchup){
                bestMatchup = currentMatchup;
                bestPokemonIndex = i;
            }
        } 
        
        //compara a melhor pontuação da minha reserva com a pontuação do meu pokemon ativo. bestMatchup e activeMatchup são valores entre -100 e 100, porntanto o peso de 50 é adicionado para priorizar a ação de MOVE, ao invés de SWITCH
        activeMatchup = activePokemonBestMove.score - (opponentPokemonBestMove.score/2);
        if(bestMatchup > (activeMatchup + 50)) trySwitch = true;
        
        //o agente buga ao tentar trocar quando está preso. Alguns golpes ainda podem bugar a decisão, como Fire Spin
        var trapped = false;
        if(state.opponent.active.ability == "Shadow Tag" || state.opponent.active.ability == "Arena Trap") trapped = true;
        else if(state.opponent.active.abilities[0] == "Shadow Tag" || state.opponent.active.abilities[0] ==  "Arena Trap") trapped = true;
        else if(state.opponent.active.abilities[1] == "Shadow Tag" || state.opponent.active.abilities[1] ==  "Arena Trap") trapped = true;
        else if(state.opponent.active.abilities["H"] == "Shadow Tag" || state.opponent.active.abilities["H"] ==  "Arena Trap") trapped = true;       
        
        //Aqui decidimos pelo Switch ou pelo Move.
        if(trySwitch && myReserve.length > 0 && !trapped){               
            return {
                action: "switch",
                object: myReserve[bestPokemonIndex]
            };  
        }
        else{
            return {
                action: "move",
                object: activePokemonBestMove.move
            };
        }
    }

    //Aqui selecionamos o melhor move do pokemon1(myPokemon) contra o pokemon2(OpponentPokemon), e atribuímos uma pontuação a este golpe, retornando um objeto composto: {move, score}
  _selectBestMove(myPokemon, opponentPokemon)
  {
      var bestMoveIndex = -1;
      var damageMultiplierResult = 0;
      var bestMoveScore = 0;
      //select the best damaging move in our movepool
      for (var i = 0; i < myPokemon.moves.length; i++) {
          if(myPokemon.moves[i] != undefined){
              if(!myPokemon.moves[i].disabled)
              {
                  var currentDamageMultiplierResult = Damage.getDamageResult(myPokemon, opponentPokemon, myPokemon.moves[i]);
                  var damageValue = 0;
                  var KOobject;
                  var turnsToKO = -1;
                  var chanceToKO = 0;              
                  var currentScore = 0;

                  //console.log("opponent HP: " + opponentPokemon.hp);

                  KOobject = KO.predictKO(currentDamageMultiplierResult, opponentPokemon);
                  turnsToKO = KOobject.turns;
                  chanceToKO = KOobject.chance;

                  //now we give a score based on the turns it will take to KO the opponent:
                  // 1/turn * chance(100)
                  if(turnsToKO != null) currentScore += (1/turnsToKO) * chanceToKO;
                  else                  currentScore += 0;              


                  if(currentScore >= bestMoveScore){
                      bestMoveIndex = i;
                      bestMoveScore = currentScore;
                  }
              }
          }
      }
      return {
          move: myPokemon.moves[bestMoveIndex],
          score: bestMoveScore
      }
  }

    //este método é semelhante ao método anterior, mas ele é usado para calcular a efetividade do gope do inimigo. Como não temos acesso aos golpes dele, utilizamos a variável "seen moves" que guarda os golpes ocnhecidos do adversário. Esta é a única diferença entre os métodos
  _selectBestSeenMove(myPokemon, opponentPokemon)
  {
      var bestMoveIndex = -1;
      var damageMultiplierResult = 0;
      var bestMoveScore = 0;
      //select the best damaging move in our movepool
      for (var i = 0; i < myPokemon.seenMoves.length; i++) {          
          var currentDamageMultiplierResult = Damage.getDamageResult(myPokemon, opponentPokemon, myPokemon.seenMoves[i]);
          var damageValue = 0;
          var KOobject;
          var turnsToKO = -1;
          var chanceToKO = 0;              
          var currentScore = 0;

          //console.log("opponent HP: " + opponentPokemon.hp);

          KOobject = KO.predictKO(currentDamageMultiplierResult, opponentPokemon);
          turnsToKO = KOobject.turns;
          chanceToKO = KOobject.chance;

          //now we give a score based on the turns it will take to KO the opponent:
          // 1/turn * chance(100)
          if(turnsToKO != null) currentScore += (1/turnsToKO) * chanceToKO;
          else                  currentScore += 0;              


          if(currentScore >= bestMoveScore){
              bestMoveIndex = i;
              bestMoveScore = currentScore;
          }              
      }
      return {
          move: myPokemon.seenMoves[bestMoveIndex],
          score: bestMoveScore
      }
  }
    
    //Aqui selecionamos o melhor pokemon para entrar em jogo. Calculando a efetividade dos golpes de maneira menos elegante. Utilizando diretamente o script damage.js, simplesmente buscamos pelo pokemon que tem o golpe que causa mais dano no inimigo. Golpes de Status são ignorados.
  _selectBestPokemon(myPokemon, opponentPokemon){
      var bestPokemonIndex = -1;
      var bestProduct = 0;
      
      //iterates through myPokemon searching for the best fit to replace the current one
      for (var i = 0; i < myPokemon.length; i++) {
          var currentAdvantages = 1;
          var bestMoveDamage = 0;
          //compute the resistances
          for (var j = 0; j < myPokemon[i].types.length; j++) {
              currentAdvantages *= Typechart.compare(myPokemon[i].types[j], opponentPokemon.types);                
          }     
          
          //compute the movepool effectivenes agains the opponent
          for (var j = 0; j < myPokemon[i].moves.length; j++) {
              var currentMoveDamage = Damage.getDamageResult(myPokemon[i], opponentPokemon, myPokemon[i].moves[j]);
              var damageValue = 0;
              if(currentMoveDamage.constructor === Array)
              {
                  damageValue = currentMoveDamage[0];
              }
              else{
                  damageValue = currentMoveDamage;
              }
              if(damageValue > bestMoveDamage){
                  bestMoveDamage = damageValue;
              }
          }
          //selects the pokemon          
          if(bestMoveDamage >= bestProduct){
              bestPokemonIndex = i;
              bestProduct = bestMoveDamage;
          }
      }
      return myPokemon[bestPokemonIndex];
  }
}

export default HOUNDOOM_BOT;
