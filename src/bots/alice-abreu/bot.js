/*/**
 * Aliiceabreu
 * Iniciar batalha com random: npm start -- --opponent=randumb
 */

import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';

var vantageCurrentPokemon;
var myBestPokemon;

class Aliiceabreu {

  decide(state) {
    /* Caso eu tenha que trocar de pokemon, recalculo o melhor, para o caso de ele estar
     * com um melhor pokemon do turno anterior que não é mais válido.
     */
    if (state.forceSwitch) {
      myBestPokemon = this._selectMyBestPokemon(state.self.reserve.filter(mon => !mon.dead).filter(mon2 => !mon2.active).filter(mon3 => !mon3.disabled), state.opponent.active);
      const myMon = myBestPokemon;
      return new SWITCH(myMon);
    }
    // Vantagem do meu pokemon atual em relação ao adversario
    vantageCurrentPokemon = (this._returnVantageOfPokemon(state.self.active, state.opponent.active) * 0.75) + (this._countDiferences(state.self.active, state.opponent.active) * 0.25);

    // Melhor pokemon entre os reservas
    if (state.self.reserve.filter(mon => !mon.dead).filter(mon2 => !mon2.active).filter(mon3 => !mon3.disabled).length > 0) {
      myBestPokemon = this._selectMyBestPokemon(state.self.reserve.filter(mon => !mon.dead).filter(mon2 => !mon2.active).filter(mon3 => !mon3.disabled), state.opponent.active);
    }
    // Se não tiver nenhum de reserva, o melhor é o atual
    else {
      myBestPokemon = state.self.active;
    }
    // Verifico se a vantagem do atual for menor do que a vantagem do melhor, se for, troco de pokemon
    if (vantageCurrentPokemon < myBestPokemon.vantage || state.forceSwitch) {
      const myMon = myBestPokemon;
      return new SWITCH(myMon);
    }

    // Se a vantagem do atual for igual a vantagem do melhor, verifica se o melhor não tem defesa maior, se tiver, troca
    else if (vantageCurrentPokemon == myBestPokemon.vantage) {
      if (state.self.active.baseStats.def < myBestPokemon.baseStats.def) {
        myBestPokemon = this._selectMyBestPokemon(state.self.reserve.filter(mon => !mon.dead).filter(mon2 => !mon2.active).filter(mon3 => !mon3.disabled), state.opponent.active);
        const myMon = myBestPokemon;
        return new SWITCH(myMon);
      }
      const myMove = this._chooseBestMoviment(state.self.active.moves.filter(move => !move.disabled), state.opponent.active);
      return new MOVE(myMove);
    }
    // Escolhe melhor movimento
    else {
      const myMove = this._chooseBestMoviment(state.self.active.moves.filter(move => !move.disabled), state.opponent.active);
      return new MOVE(myMove);
    }
  }

  /* Dado um pokemon e um oponente, verifica em quantos atributos o primeiro pokemon é melhor (tem um valor maior) que o oponente.
   * Atributos verificados são: ataque, defesa, hp, velocidade de ataque, velocidade de defesa e velocidade.
  */
  _countDiferences(myPok, opp) {
    var betterStats = 0;
    if (myPok.baseStats.atk > opp.baseStats.atk) {
      betterStats++;
    }
    if (myPok.baseStats.def > opp.baseStats.def) {
      betterStats++;
    }
    if (myPok.hp > opp.baseStats.hp) {
      betterStats++;
    }
    if (myPok.baseStats.spa > opp.baseStats.spa) {
      betterStats++;
    }
    if (myPok.baseStats.spd > opp.baseStats.spd) {
      betterStats++;
    }
    if (myPok.baseStats.spe > opp.baseStats.spe) {
      betterStats++;
    }
    return betterStats;
  }

  /* Dado um pokémon e um pokemon adversário, compara todos os tipos do primeiro com todos os tipos do segundo e vai somando os valores.
   * Ao final, temos uma taxa de "vantagem" do primeiro pokemon em relação ao segundo, considerando os tipos.
   */
  _returnVantageOfPokemon(pok, opp) {
    var aux = 0;
    for (var j = 0; j < pok.types.length; j++) {
      for (var k = 0; k < opp.types.length; k++) {
        aux += Typechart.compare(pok.types[j], opp.types[k]);
      }
    }
    return aux;
  }

 /* Dado um array de pokemons e um pokemon adversário, seta a vantagem de cada pokemon em relação ao pokemon do oponente.
  * Essa vantagem é dada 75% pela vantagem do tipo, calculada em "returnVantagePokemon" e 25% pela vantagem nos atributos,
  * calculada em "countDiferences". Esses valores somados será a vantagem final que cada pokemon possui em relação ao
  * adversario. Depois, esse array é ordenado de acordo com essa vantagem e se houve mais de um pokemon com a mesma
  * vantagem, o que possui maior ataque tem prioridade.
  */
  _selectMyBestPokemon(myPokemons, myOpponent) {
    //compara todos os tipos de todos os meus pokemons com os tipos do pokemon atual do oponente e soma elas, assim, teremos
    // o pokemon que tenha mais vantagem contra todos os tipos do pokemon adversario
    for (var i = 0; i < myPokemons.length; i++) {
      myPokemons[i].vantage = (this._returnVantageOfPokemon(myPokemons[i], myOpponent) * 0.75) + (this._countDiferences(myPokemons[i], myOpponent) * 0.25);
    }
    //Ordena os pokemons de acordo com a taxa de vantagem que eles tem sobre o adversário. Se tiverem a mesma taxa de vantagem,
    //compara os ataques e retorna o pokemon com a melhor taxa e o melhor ataque.
    myPokemons.sort(function (pok1, pok2) {
      //se tiver menos vantagem
      if (pok1.vantage < pok2.vantage) {
        return 1;
      }
      //se tiver mais vantagem
      else if (pok1.vantage > pok2.vantage) {
        return -1;
      }
      //se tiver a mesma taxa de vantagem, vê qual dos dois tem maior ataque
      else {
        if (pok1.baseStats.atk < pok2.baseStats.atk) {
          return 1;
        }
        else if (pok1.baseStats.atk > pok2.baseStats.atk) {
          return -1;
        }
        else {
          return 0;
        }
      }
    });
    //retorna o melhor pokemon
    return myPokemons[0];
  }

  /* Dado um array de movimentos e um pokemon adversario, compara o tipo do movimento com todos os tipos do pokemon adversario
   * e soma esses valores, assim, temos uma taxa de "vantagem" do movimento em relação ao oponente. Essa taxa é usada para ordenar
   * o array e assim termos o movimento mais eficaz contra o pokemon adversario. Caso os movimentos tenham a mesma taxa de eficiência
   * o movimento com maior acurácia tem prioridade.
   */
  _chooseBestMoviment(myMoves, myOpponent) {
    //inicializa sempre com 0, pois podemos ter diferentes taxas de eficiência se o pokemon do oponente for diferente
    for (var i = 0; i < myMoves.length; i++) {
      myMoves[i].efficiency = 0;
    }
    //Verifica a taxa de eficiência de cada movimento do meu pokemon contra todos os tipos do pokemon do oponente e soma elas, assim,
    //teremos o movimento mais eficiente contra todos os tipos do outro pokemon e não só referente a um tipo.
    for (var i = 0; i < myMoves.length; i++) {
      for (var j = 0; j < myOpponent.types.length; j++) {
        myMoves[i].efficiency += Typechart.compare(myMoves[i].type, myOpponent.types[j]);
      }
    }
    //Ordena o array de movimentos de acordo com a taxa de efetividade de cada movimento, se tiver dois com a mesma taxa, considera
    //também a acurácia do movimento.
    myMoves.sort(function (move1, move2) {
      //se for menos eficiente
      if (move1.efficiency < move2.efficiency) {
        return 1;
      }
      //se for mais eficiente
      else if (move1.efficiency > move2.efficiency) {
        return -1;
      }
      //se tiver a mesma taxa de eficiência, vê qual dos dois tem > accuracy
      else {
        if (move1.accuracy < move2.accuracy) {
          return 1;
        }
        else if (move1.accuracy > move2.accuracy) {
          return -1;
        }
        else {
          return 0;
        }
      }
    });
    return myMoves[0];
  }

}

export default Aliiceabreu;
