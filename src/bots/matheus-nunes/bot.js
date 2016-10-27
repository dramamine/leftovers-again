/**
 * Sdfjsgfsfsufe
 *
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';
import Pokeutil from 'leftovers-again/lib/pokeutil';
/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */

function melhorPokemon(state){
	var pokemonMaisForteArr = [];
	var contN = [];

	var cotAux = 0;
	for(var i = 0 ; i < state.self.reserve.length ; i++){

		if(state.self.reserve[i].dead != true && state.self.reserve[i].id != state.self.active.id){

			var contNota = 0;
			//console.log("Pokemon " /*+ state.self.reserve[i].ids*/);

			//console.log("Pkemon: " + state.self.reserve[i].id);
			//console.log("Ind: " + i);
			for(var j = 0 ; j < state.self.reserve[i].moves.length ; j++){
				//console.log("Skills: "+ j +" ==" + state.self.reserve[i].moves[j].type);
				//console.log("Nivel" + Typechart.compare(state.self.reserve[i].moves[j].type, state.opponent.active.types));

				contN[i] = Typechart.compare(state.self.reserve[i].moves[j].type, state.opponent.active.types);

				contNota = contNota + contN[i];
			}

			var pokemonMaisForte = {
				pokemon: state.self.reserve[i],
				notaAtk: contNota
			}

			pokemonMaisForteArr[cotAux] = pokemonMaisForte;
			cotAux++;

		}
	}

	var aux = 0;
	var pokeAux = pokemonMaisForteArr;

	var maisForte = 0;

	//console.log("tamanho: ");
	//console.log(pokeAux.length);
	for(var i = 0 ; i < pokeAux.length; i++){

		for(var j = 0 ; j < pokeAux.length; j++){

			if ( pokeAux[i].notaAtk >= pokeAux[j].notaAtk) {

				//console.log(" Id-I: " + i +" I: " + pokeAux[i].notaAtk + " Id-J: " + j + " J: " + pokeAux[j].notaAtk );

				if ( pokeAux[i].notaAtk >= aux) {
					aux = pokeAux[i].notaAtk;
					maisForte = pokeAux[i].pokemon;
					//console.log("PEGO");
					//pokeAux.splice(1,i);
				}
			}
		}
	}


	if(maisForte === 0){
		for(var i = 0 ; i < state.self.reserve.length ; i++){
			if(!state.self.reserve[i].dead){
				maisForte = state.self.reserve[i];
			}
		}
	}
	/*if(maisForte.dead == true){
		console.log("MORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTOMORTO");
	}*/
	//console.log(maisForte.id);

	console.log("vem da func");
	console.log(maisForte);

	return maisForte;

}

function melhorSkill(state){

	var contN = [];
	var comparePokemon = 0;
	var somaPow = 0;
	var somaAcc = 0;
	//var usarStatus = 0;;

	for(var i = 0 ; i < state.self.active.moves.length ; i++){

		if(!state.self.active.moves[i].disabled/* && !state.self.active.moves[i]category.status*/){
			//console.log(state.self.active.moves[i]);

			comparePokemon = Typechart.compare(state.self.active.moves[i].type, state.opponent.active.types)*50;
			somaPow = state.self.active.moves[i].basePower;
			somaAcc = state.self.active.moves[i].accuracy

			contN[i] = comparePokemon + somaPow + somaAcc;

			for(var j = state.prevStates.length; j < state.prevStates.length ; j++){

				var usaAtk = 0;
				if(state.prevStates[j].opponent.active.statuses){
					usaAtk = 1;
					if(usaAtk == 1){
						contN[i] = comparePokemon + somaPow + somaAcc;
						usaAtk = 0;
					}
				}

			}
			//usarStatus++;
		}

	}

	/*if(usarStatus != 0){
		for(var i = 0 ; i < state.self.active.moves.length ; i++){

			if(!state.self.active.moves[i].disabled && !state.self.active.moves[i]category.status){
				contN[i] = Typechart.compare(state.self.active.moves[i].type, state.opponent.active.types);
			}

		}
	}*/

	var aux = 0;
	var skillmaisForte = 3;

	//console.log("Tamanho");
	//console.log(contN.length);
	//console.log("contN");
	//console.log(contN);

	for(var i = 0 ; i < contN.length; i++){

		for(var j = 0 ; j < contN.length; j++){

			if ( contN[i] >= contN[j]) {

				//console.log(" Id-I: " + i +" I: " + contN[i] + " Id-J: " + j + " J: " + contN[j] );

				if ( contN[i] >= aux) {

					aux = contN[i];
					skillmaisForte = i;
					//console.log("PEGO");

				}
			}

		}

	}


console.log("Heall-----------------------------------------------------------------------");

	//console.log(state.self.active.hppct);
	if(state.self.active.hp <= 70){//heal if (hp < 70)
		for(var i = 0 ; i < state.self.active.moves.length; i++){
			//console.log(state.self.active.moves.length);
			if(state.self.active.moves[i].flags.heal == 1){

				if(!state.self.active.moves[i].disabled){
					skillmaisForte = state.self.active.moves[i];
					console.log("HEALLEEEEEEEEEEEEEEEERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR");
				}
			}
		}
	}

	//console.log(skillmaisForte)
	return skillmaisForte;

}

function pokeOpponentSkills(state){
	var contMortos = 0;
	for(var i = 0 ; i < state.self.reserve.length ; i++){
		if(state.self.reserve[i].dead == true){
			contMortos++;
			if(contMortos >= 4){
				return 0;
			}
		}
	}

	var facoContra = 0;
	var habilPokeOpp = [];
	var comparePokemon = 0;

	for(var i = 0 ; i < state.opponent.active.seenMoves.length; i++){
		habilPokeOpp[i] = Pokeutil.researchMoveById(state.opponent.active.seenMoves[i]);
	}

	//console.log(habilPokeOpp);
	if(habilPokeOpp){
		for(var i = 0 ; i < habilPokeOpp.length; i++){
			comparePokemon = Typechart.compare(habilPokeOpp[i].type, state.self.active.types);
			//console.log(comparePokemon);
			if(comparePokemon >= 2.5){
				return 1;
			}
		}
	}

	return 0;

}

var pokemonAtualInimigo;
class Sdfjsgfsfsufe {

	//cd ../../poketest
	//npm start -- --opponent=randumb
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

	//console.log(state.prevStates[i].opponent.active.statuses);//verifica se o pokemon inimigo esta co algum debuff

	var contPokeMortos = 0;

	for(var i = 0 ; i < state.self.reserve.length; i++){
		if(state.self.reserve[i].dead == true){
			contPokeMortos++;
			//console.log(contPokeMortos);
		}
	}

	if (state.turn % 2 == 0){
		pokemonAtualInimigo = state.opponent.active.id;
		//console.log(pokemonAtualInimigo);
	}

	if(contPokeMortos >= 5){
		pokemonAtualInimigo = state.opponent.active.id;
	}

	if(pokeOpponentSkills(state) === 1){
		console.log("TROOOOOOOOOOOOOOOOOCAAAAAAAAAAAAAA!!!!!!!");
	}

	console.log("----1");


	if (state.forceSwitch || pokemonAtualInimigo != state.opponent.active.id || pokeOpponentSkills(state) === 1) {//traca quando morre, troca se  oponente troca e troca para um mais forte contra o elemento do opponent, e troca quando a magia do oponent é muiiiiito forte contra meu pokemon

		//console.log(state.self.reserve.filter( mon => !mon.dead ));//lisata de pokemons
		//console.log(myMon);//meu pokemon atual
		// return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
		// and the reserve index [0-5] of the Pokemon you're switching into.

		if(contPokeMortos <= 5){

			if(melhorPokemon(state) != state.self.active){
				console.log("-------2");
				console.log(melhorPokemon(state));
				console.log("-----------3");
				return new SWITCH(melhorPokemon(state));
			}
		}

	}



	/*for(var i = 0 ; i < state.self.active.moves.length ; i++){
		if(state.self.active.moves[i].boosts){
			console.log(state.self.active.moves[i].boosts);
		}
	}*/
	//console.log("opp ");
	//console.log(state.opponent.active.types); //tipo do movimento do opponent

    //const myMove = this._pickOne(
      // filter through your active Pokemon's moves for a move that isn't disabled
    //  state.self.active.moves.filter( move => !move.disabled )

    //);
    // return a Decision object. MOVE takes Move objects, move names, and
    // move indexes [0-3].


	//console.log(state.self.active.moves)

	//compare(move: String, target: Array | String): Number
    return new MOVE(melhorSkill(state));

  }

  // randomly chooses an element from an array
  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default Sdfjsgfsfsufe;
