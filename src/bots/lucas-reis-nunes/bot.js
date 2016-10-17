/**
 * Leialuskopemon
 *
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';

import Pokeutil from 'leftovers-again/lib/pokeutil';

/*//ja adcionados no pokeutil
var _pokedex = require('../node_modules/leftovers-again/lib/data/pokedex');
var _moves = require('../node_modules/leftovers-again/lib/data/moves');
var _moves2 = _interopRequireDefault(_moves);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
*/


/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */


var pokemonAtual = 0;
var jogadas = 0;

var notas = 0;

var trocasSeguidas = 0;

var pokemonComMaiorNota = 0;
var melhorSkillDoPokemon = 0;

var pokSkillDesabled = [];

var codPokemonAtual = 0;
/*
//pega a melhor skill do melhor pokemon
function melhorSkillPokemon(TODOSSKILLS){

	var auxMaior = 0;
	for (var x = 0; x < TODOSSKILLS.length; x++){


		if (TODOSSKILLS[x].basePower >= auxMaior){
			auxMaior = TODOSSKILLS[x].basePower;
			melhorSkillDoPokemon = x;
		}

	}

}*/



//para cada movimento colcular as possiveis reaçoes e verificar quais evitar
function derivadosDoMovimento(MOVIMENTOS, STATEREACOES){

	var cont = MOVIMENTOS.length;

	//console.log("-----\\/-----");


	for(var y = 0; y < STATEREACOES.self.reserve.length; y++){ //para cada um dos meus pokemons

		if(!STATEREACOES.self.reserve[y].dead /*&& pokemonComMaiorNota.species != STATEREACOES.self.reserve[y].species*/){

			for(var x = 0; x < STATEREACOES.opponent.active.seenMoves.length; x++){

				if (Pokeutil.researchMoveById(STATEREACOES.opponent.active.seenMoves[x]).basePower > 10){
					//console.log(Pokeutil.researchMoveById(STATEREACOES.opponent.active.seenMoves[x]));
					//verifico as possiveis jogadas contra
					//vejo qual deles irá sofrer menos dano(nota)
					var jogadaNota = {
						movimento: -1,
						pokemonS: STATEREACOES.opponent.active,
											//null(pokemon - n utilizado),  tipo atacante, tipo defenssor
						nota: -calcNota(STATEREACOES.opponent.active, Pokeutil.researchMoveById(STATEREACOES.opponent.active.seenMoves[x]),  STATEREACOES.self.reserve[y]),//pokemon
						codPai: y
					}

					//console.log(jogadaNota);

					MOVIMENTOS[cont] = jogadaNota;

					cont++;
				}

			}
		}

	}
	/*for (var x = 0; x < MOVIMENTOS.length; x++){

		for(var y = 0; y < state.opponent.active.moves.length; y++){

			//se a skill não estiver desabilitada
			if(!STATE.self.reserve[x].moves[y].disabled){
				//console.log(STATE.self.active.moves);
				//se não for um buff ou debuff
				if (STATE.self.reserve[x].moves[y].basePower > 10){

					var jogadaNota = {
						movimento: y,
						pokemonS: STATE.self.reserve[x],
						nota: calcNota(STATE.self.reserve[x], STATE.self.reserve[x].moves[y], STATE.opponent.active),//pokemon
						codPai: MOVIMENTOS[x].codPai
					}

					jogadaStr[cont] = jogadaNota;

					cont++;
				}
			}
		}
	}*/
	console.log("------------");
	return MOVIMENTOS;

}

//pega a melhor rota para ganhar
function maiorNota(TODASNOTAS){


	var auxNota = -100000;


	//auxNota = TODASNOTAS[x].nota;

	for (var x = 0; x < TODASNOTAS.length; x++){
		if (TODASNOTAS[x].movimento != -1){//se for um pai

			var calcNota = TODASNOTAS[x].nota;

			for (var y = 0; y < TODASNOTAS.length; y++){
				if (TODASNOTAS[y].movimento == -1){//se Ñ for um pai

					if(TODASNOTAS[x].codPai == TODASNOTAS[y].codPai){

						calcNota += TODASNOTAS[y].nota;

					}

				}

			}

			//console.log(TODASNOTAS);
			//maior nota
			if (calcNota >= auxNota){
				auxNota = calcNota;
				pokemonComMaiorNota = TODASNOTAS[x].pokemonS;
				melhorSkillDoPokemon = TODASNOTAS[x].movimento;
				codPokemonAtual = TODASNOTAS[x].x;
			}

			console.log( TODASNOTAS[x].pokemonS.id);
			console.log(calcNota);
		}

	}


	//console.log(pokemonComMaiorNota);;
	//console.log("---------");
	//melhorSkillPokemon(pokemonComMaiorNota.moves);
	//console.log("---------");
}

					//null,  tipo atacante, tipo defenssor
function calcNota(POKEMONFOR, MINHASKILLFOR, INIMIGIFOR){
	var nota = 0;


	//tipo da magia em comparação ao tipo do pokemon inimigo
	for (var x = 0; x < INIMIGIFOR.types.length; x++){
		nota += Typechart.compare(MINHASKILLFOR.type, INIMIGIFOR.types[x]) * 20;
	}

	/*
	//console.log(nota1);
	//tipo do meu pokemon em comparação ao pokemon inimigo
	for (var y = 0; y < POKEMONFOR.types.length; y++){
		for (var x = 0; x < INIMIGIFOR.types.length; x++){
			nota2 += Typechart.compare(POKEMONFOR.types[y], INIMIGIFOR.types[x]) * 10;
		}
	}*/

	//console.log(nota2);
	//força da minha skill
	nota += MINHASKILLFOR.basePower;

	//console.log(nota3);



	//var nota = 5;
	//console.log("-----------");
	return nota;
}

function pegaNotas (STATE){

	console.log("-----------------");
	//verificar um struct para a busca e dar a nota
	var cont = 0;
	var jogadaStr = [];


	for(var x = 0; x < STATE.self.reserve.length; x++){
		//console.log(state.self.reserve[x].species);


		//se o pokemon não estiver morto e n for o ativo
		//if(pokemonComMaiorNota.species != STATE.self.reserve[x].species){
			if (!STATE.self.reserve[x].dead){

				for(var y = 0; y < STATE.self.reserve[x].moves.length; y++){

					//se a skill não estiver desabilitada
					//if(!STATE.self.reserve[x].moves[y].disabled){
						//console.log(STATE.self.active.moves);
						//se não for um buff ou debuff
						if (STATE.self.reserve[x].moves[y].basePower > 10){
							//console.log(state.self.active.moves[y].name);
							//state.self.reserve[x].moves[y].basePower
							var jogadaNota = {
								movimento: y,
								pokemonS: STATE.self.reserve[x],
								nota: calcNota(STATE.self.reserve[x], STATE.self.reserve[x].moves[y], STATE.opponent.active),//pokemon
								codPai: x
							}

							jogadaStr[cont] = jogadaNota;

							cont++;
						}
					//}
				}
			}
		//}else{


		//console.log("------n for o ativo----");
		//	console.log(pokemonComMaiorNota.species);
		//	console.log(STATES.self.reserve[x].species);
		//console.log("-----------------------");

		//}
	}




	jogadaStr = derivadosDoMovimento(jogadaStr, STATE);
	maiorNota(jogadaStr);

	console.log("-----------------");

}

var troca = false;
var rodada = 0;
var pokemonAtualInimigo = "";
class Leialuskopemon {


  /**
   * Here's the main loop of your bot. `state` contains everything about the
   * current state of the game. Please read the documentation for more
   * details.
   *
   * @param  {Object} state The current state of the game.
   *
   * @return {Decision}     A decision object.
   */



   //se o inimigo não tiver um pokemon selecionado
	//if (!state.opponent.active){

	decide(state) {


		console.log("inicio");
		console.log(pokemonComMaiorNota.species);

		rodada++;

		if (rodada == 1){
			pegaNotas(state);

			pokemonAtualInimigo = state.opponent.active.species;
		}


		//verifica se o oponente trocou de pokemon
		if(pokemonAtualInimigo != state.opponent.active.species){
			troca = true;

			console.log("inimigo troco");

			pokemonAtualInimigo = state.opponent.active.species;
		}



		if (rodada+1 % 2 == 0){

			pokemonAtualInimigo = state.opponent.active.species;

		}

		console.log(state.opponent.active.species);
		//--------------------------------------------





	// `forceSwitch` occurs if your Pokemon has just fainted, or other moves
	// that mean you need to switch out your Pokemon


		//if (state.self.reserve.filter( mon => !mon.dead ).length > 0){
			if((rodada == 1 || troca == true || state.forceSwitch)){
				troca = false;
				console.log("erro aqui -2");


				//if (typeof state.self.active != "undefined"){

				//}

				//if (typeof state.self.reserve[x].moves !== "undefined"){
					//while(pokemonComMaiorNota.dead == true){
						pegaNotas(state);

					//}
				//}
				//console.log(state.self.reserve.filter( mon => !mon.dead ).length);

				// return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
				// and the reserve index [0-5] of the Pokemon you're switching into.


				/*
				if (pokemonComMaiorNota.id == state.self.active.id){

					const myMon = this._pickOne(
						// filter through your active Pokemon's moves for a move that isn't disabled
						state.self.reserve.filter( mon => !mon.dead && mon != pokemonComMaiorNota)
					);

					console.log("------n for o ativo0----");
					console.log(myMon.id);

					return new SWITCH(myMon);


				}*/
				console.log(state.self.reserve.filter( mon => !mon.dead).length);

				if (state.self.reserve.filter( mon => !mon.dead).length == 1 && state.forceSwitch){

					var aux = state.self.reserve.filter( mon => !mon.dead)[0];
					console.log(aux);
					return new SWITCH(aux);

				}

				if (pokemonComMaiorNota.id != state.self.active.id){



					if(pokemonComMaiorNota.dead){

						console.log("morto");

					}

					console.log("------n for o ativo1----");
						console.log(pokemonComMaiorNota.species);
						console.log(state.self.active.species);
					console.log("-----------------------");
					console.log(pokemonComMaiorNota.species);
					console.log(pokemonComMaiorNota.hp);
					trocasSeguidas++;

					return new SWITCH(pokemonComMaiorNota);

				}

				if (state.forceSwitch == true){


					if (typeof state.self.active.species === "undefined"){
						console.log('the property is not available...'); // print into console
					}

					console.log("------n for o ativo2----");
					console.log(pokemonComMaiorNota.species);
					console.log(state.self.active.species);
					console.log("-----------------------");
					console.log(pokemonComMaiorNota.species);
					console.log(pokemonComMaiorNota.hp);

					trocasSeguidas++;




					return new SWITCH(pokemonComMaiorNota);

				}



			}
		//}

		console.log("atak");

		trocasSeguidas = 0;


		// return a Decision object. MOVE takes Move objects, move names, and
		// move indexes [0-3].

		//verifica se a skill que eu quero usar esta habilitada






			pokemonComMaiorNota = state.self.active;


			if (typeof state.self.active.moves[melhorSkillDoPokemon].disabled != "undefined"){
				console.log("erro aqui -1");
				if(!state.self.active.dead){
					if (!state.self.active.moves[melhorSkillDoPokemon].disabled){

						console.log("erro aqui 0");
						//console.log(pokemonComMaiorNota);

						return new MOVE(melhorSkillDoPokemon);
					}else{

						console.log("erro aqui 1");
						const myMove = this._pickOne(
						// filter through your active Pokemon's moves for a move that isn't disabled
						state.self.active.moves.filter( move => !move.disabled )
						);

						return new MOVE(myMove);
					}
				}else{

					console.log("erro aqui 3");
					pegaNotas(state);
					return new SWITCH(pokemonComMaiorNota);
				}
			}
			else{
				pegaNotas(state);
				console.log("erro aqui 2");
				/*const myMove = this._pickOne(
					// filter through your active Pokemon's moves for a move that isn't disabled
					pokemonComMaiorNota.moves.filter( move => !move.disabled )
				);*/

				/*var objSkillDisabled = {
					pokemonDisabledSkl: codPokemonAtual,
					sklDisabled: melhorSkillDoPokemon
				};

				pokSkillDesabled[contDis] = objSkillDisabled;
				contDis++;*/

				return new MOVE(pokemonComMaiorNota);
			}



		//else{

			console.log("fim");

		//	return new MOVE(myMove);
		//	troca = true;
		//}


	}

  // randomly chooses an element from an array
  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Leialuskopemon;




