/**
 * Biodam
 *  Notas:
 *  Randumb: npm start -- --opponent=Randumb
 *  Stabby: npm start -- --opponent=Stabby
 *  other: npm start -- --opponent=../PokeTest2
 *  //var compare2 = Typechart.compare('Fire', 'Water'); // 0.5
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';

import Typechart from 'leftovers-again/lib/game/typechart';
import Damage from 'leftovers-again/lib/game/damage';
//Global variables
var myLastPokemon;
var opponentLastPokemon;
var switchCount = 0;
var usedStatusMove = false;

class Biodam
{  
  decide(state)
  {
    var myMon;

    //Filtra apenas os pokemons válidos na reserva
    var validReserve = state.self.reserve.filter(mon => !mon.dead).filter(mon2 => !mon2.active).filter(mon3 => !mon3.disabled);
    //Calcula o potencial de combate dos pokemons da reserva válida
    //CP = CombatPotential
    this._calculateCombatPotential(validReserve, state.opponent.active);

    // Trata o caso de quando o pokemon ativo desmaiou ou foi obrigado a sair  
    if (state.forceSwitch)
    {
      //Seleciona o melhor pokemon da reserva baseado no CP
      myMon = this._selectBestPokemon(validReserve);
      
      myLastPokemon = myMon.species;
      switchCount = 0;
      usedStatusMove = false;
      return new SWITCH(myMon);
    }

    //Oponente mudou de pokemon e ainda possuo switchs disponíveis
    if (state.opponent.active.species != opponentLastPokemon && switchCount < 1)
    {
      //Salva qual é o novo pokemon inimigo para poder identificar quando ele trocou
      opponentLastPokemon = state.opponent.active.species;

      if (validReserve.length > 0)
      {
        myMon = this._selectBestPokemon(validReserve);        
        if (myMon.species != myLastPokemon)
        {
          myLastPokemon = myMon.species;
          switchCount++;
          usedStatusMove = false;
          return new SWITCH(myMon);
        }
      }
    }

    //Seleciona o melhor movimento
    var selectedMove = this._selectBestMove(state.self.active.moves.filter(move => !move.disabled), state.self.active, state.opponent.active);
    return new MOVE(selectedMove);   
  }
  _calculateCombatPotential(reserve, opponentmon)
  {
    var expectedDamages = new Array();
    var opponentMoves = opponentmon.seenMoves.filter(move => !move.disabled);
    var opponentExpectedDamages = new Array();
    //Passa por todos os pokemons da reserva
    for (var i = 0; i < reserve.length; i++)
    {
      var currentMoves = reserve[i].moves.filter(move => !move.disabled);
      reserve[i].attackPotential = 0;
      reserve[i].weaknessPotential = 0;
      reserve[i].combatPotential = 0;
      //Calcula o potencial de ataque
      for (var j = 0; j < currentMoves.length; j++)
      {
        //Calcula quais os danos possiveis para cada golpe
        expectedDamages = Damage.getDamageResult(reserve[i], opponentmon, currentMoves[j]);
        //Faz a soma destes valores
        var attackPotential = expectedDamages.reduce(function (a, b) { return a + b; });
        //Retira a media
        attackPotential = attackPotential / expectedDamages.length;
        //Adiciona esta media como valor de comparação, assim a soma de todas as medias são usadas
        reserve[i].attackPotential += attackPotential;
        reserve[i].combatPotential += attackPotential;
      }

      //Calcula o potencial de fragilidade/fraqueza
      for (var k = 0; k < opponentMoves.length; k++)
      {
        opponentExpectedDamages = Damage.getDamageResult(opponentmon, reserve[i], opponentMoves[k]);
        var weaknessPotential = opponentExpectedDamages.reduce(function (a, b) { return a + b; });
        weaknessPotential = weaknessPotential / opponentExpectedDamages.length;
        reserve[i].weaknessPotential = weaknessPotential;
        reserve[i].combatPotential -= weaknessPotential;
      }
    }

    return reserve;
  }
  _selectBestPokemon(reserve)
  {    
    reserve.sort(function (a, b) { return b.combatPotential - a.combatPotential; });
    return reserve[0];
  }

  _selectBestMove(moves, selfActive, opponentmon)
  {
    var compareMoveValue = 0;
    var bestMoves = new Array();
    var expectedDamage = new Array();
    for (var i = 0; i < moves.length; i++)
    {
      //compareMoveValue = Typechart.compare(moves[i].type, opponentmon.types);

      expectedDamage = Damage.getDamageResult(selfActive, opponentmon, moves[i]);
      //this._print("Move: "+moves[i].name+"ExpectedDamage: "+expectedDamage);

      moves[i].compareValue = expectedDamage[0];

      bestMoves.push(moves[i]);
    }

    bestMoves.sort(function (a, b) { return b.compareValue - a.compareValue; })
    
    if(usedStatusMove == false)
    {
      //this._print("Usando move de status se tiver.\n");
      var statusMoves = bestMoves.filter(move => move.category == "Status");
      
      usedStatusMove = true;
      
      if(statusMoves.length > 0)
      {
        return statusMoves[0];
      }
    }

    return bestMoves[0];
  }

  // randomly chooses an element from an array
  _pickOneRand(arr)
  {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  _print(str)
  {
    process.stdout.write(str);
  }
  _printJSON(obj)
  {
    process.stdout.write(JSON.stringify(obj, null, 4)+"\n");
  }
}

export default Biodam;
