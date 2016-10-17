/**
 * PokeTest
 *
 */
import {
	MOVE,
	SWITCH
}
from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';
import PokeUtil from 'leftovers-again/lib/pokeutil';
import Damage from 'leftovers-again/lib/game/damage';

class PokeTest {

	//myMinMaxSwitch = new MinMaxSwitch ();

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
		if (state.forceSwitch) {

			/*const myMon = this._pickOne(
				state.self.reserve.filter(mon => !mon.dead)
			);*/

			var myMon = this.returnFavorablePokemon (state);

			if (myMon == undefined || myMon.dead){
				myMon = this._pickOne(state.self.reserve.filter(mon => !mon.dead));
			}

			return new SWITCH(myMon);
		}

		var option = this.returnBestOption (state);

		//Starts the minimax flow
		if (state.self.active.species != state.self.reserve[option.pokemonId].species){

			if (!state.self.reserve[option.pokemonId].dead){

				const myMon2 = state.self.reserve[option.pokemonId];

				return new SWITCH(myMon2);
			}
		}

		const myMove = this.returnHighestDamageAttack(state.self.active, state.opponent.active);

		return new MOVE(myMove);
	}

	_pickOne(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

  returnBestAttack(mons1, mons2) {

		var bestAtkID = 1;
		var currentBestAtkMultiplier = 0;

		for (var i = 0; i < mons1.moves.length; i++) {

			var tempAtkMulti = Typechart.compare(mons1.moves[i].type, mons2.types);

			if (tempAtkMulti > currentBestAtkMultiplier && !mons1.moves[i].disabled) {

				bestAtkID = i;
				currentBestAtkMultiplier = tempAtkMulti;
			}
		}

		return mons1.moves[bestAtkID];
	}

	returnHighestDamageAttack(mons1, mons2) {

		var bestAtkID = 1;
		var bestAtkDamage = 0;

		for (var i = 0; i < mons1.moves.length; i++) {

			var highestTempAtk = 0;
			var est = Damage.getDamageResult(mons1, mons2, mons1.moves[i]);

			if (Array.isArray(est)) {

				for (var j = 0; j < est.length; j++) {

					if (est[j] > highestTempAtk)
						highestTempAtk = est[j];
				}
			}
			else {

				if (est > highestTempAtk)
					highestTempAtk = est;
			}

			if (highestTempAtk > bestAtkDamage) {

				bestAtkDamage = highestTempAtk;
				bestAtkID = i;
			}
		}

		if (mons1.moves[bestAtkID].disabled == true) {

			for (var i = 0; i < mons1.moves.length; i++) {
				if (mons1.moves[i].disabled == false)
					bestAtkID = i;
			}

		}

		return mons1.moves[bestAtkID];
	}

  returnHighestDamageFromSelf(mons1, mons2) {

    var highestDamage = 0;

    for (var i = 0; i < mons1.moves.length; i++) {

      var est = Damage.getDamageResult(mons1, mons2, mons1.moves[i]);

      if (Array.isArray(est)) {

        for (var j = 0; j < mons1.moves.length; j++) {

          if (est[j] > highestDamage)
            highestDamage = est[j];
        }
      }
      else {

        if (est > highestDamage)
          highestDamage = est;
      }
    }

    return highestDamage;
  }

	returnDamageFromMoveToOpponent(mons1, mons2, myMoveId){

		var highestDamage = 0;

		var est = Damage.getDamageResult(mons1, mons2, mons1.moves[myMoveId]);

		if (Array.isArray(est)) {

			for (var j = 0; j < est.length; j++) {

				if (est[j] > highestDamage)
					highestDamage = est[j];
			}
		}
		else {
			highestDamage = est;
		}

		return highestDamage;
	}

	returnDamageFromMoveToSelf(mons1, mons2, myMoveId){
		var highestDamage = 0;

		var myMove = PokeUtil.researchMoveById(mons2.seenMoves[myMoveId]);

		var est = Damage.getDamageResult(mons2, mons1, myMove);

		if (Array.isArray(est)) {

			for (var j = 0; j < est.length; j++) {

				if (est[j] > highestDamage)
					highestDamage = est[j];
			}
		}
		else {
			highestDamage = est;
		}

		return highestDamage;
	}

  //Used in the mini max. Best attack for mini
	returnHighestDamageFromOppoment(mons1, mons2) {

		if (mons2.seenMoves.length > 0) {

			var highestDamage = 0;

			for (var i = 0; i < mons2.seenMoves.length; i++) {

				var myMove = PokeUtil.researchMoveById(mons2.seenMoves[i]);
				var est = Damage.getDamageResult(mons2, mons1, myMove);

				if (Array.isArray(est)) {

					for (var j = 0; j < mons2.seenMoves.length; j++) {

						if (est[j] > highestDamage)
							highestDamage = est[j];
					}
				}
				else {

					if (est > highestDamage)
						highestDamage = est;
				}
			}

			return highestDamage;
		}
		else {
			return undefined;
		}
	}

	//MinMaxSwitch
	//======================

	returnFavorablePokemon(state){
		var pokemon;

		var favorability = 0;

		for (var i=0; i<state.self.reserve.length; i++){

			if (!state.self.reserve[i].dead){
				favorability = this.returnTypeFavororabilityForSelf (state.self.reserve[i], state.opponent.active);

				if (favorability > 0){
					return state.self.reserve[i];
				}
			}
		}

		return undefined;
	}

	/**
	 *Returns 1 if self mons has a super effective attack and 0 if it doesn't
	 */
	returnTypeFavororabilityForSelf(mons1, mons2) {
		var favorability = 0;

		for (var i = 0; i < mons1.moves.length; i++) {

			var tempAtkMulti = Typechart.compare(mons1.moves[i].type, mons2.types);

			if (tempAtkMulti > 1) {
				favorability = 1;
			}
		}

		return favorability;
	}

	/**
	 *Returns -1 if other mons has a super effective attack and 0 if it doesn't
	 */
	returnTypeFavororabilityForOpponent(mons1, mons2) {
		var favorability = 0;

		if (mons2.seenMoves.length > 0) {

			for (var i = 0; i < mons2.seenMoves.length; i++) {

				var myMove = PokeUtil.researchMoveById(mons2.seenMoves[i]);
				var tempAtkMulti = Typechart.compare(myMove.type, mons1.types);

				if (tempAtkMulti > 1)
					favorability = -1;
			}
		}
		else {

			for (var i = 0; i < mons2.types.length; i++) {
				var tempAtkMulti = Typechart.compare(mons2.types[i], mons1.types);

				if (tempAtkMulti > 1)
					favorability = -0.5;
			}
		}

		return favorability;
	}

	returnBestOption (state){

		var bestResult = 0;
		var bestPokemonId = 0;
		var bestAtkId = 0;

		for (var i=0; i<state.self.reserve.length; i++){

			for (var j=0; j<state.self.reserve[i].moves.length; j++){
			//for (var j=0; j<4; j++){

				var tempResult = this._createOptionsFromOneMove(state.self.reserve[i], state.opponent.active, j, i);

				if (tempResult > bestResult){
					bestResult = tempResult;
					bestPokemonId = i;
					bestAtkId = j;
				}
			}
		}

		/*console.log ("Best Result: " + bestResult);
		console.log ("Best Pokemon Id: " + bestPokemonId);
		console.log ("Best Atk id: " + bestAtkId);*/

		var myResult = {
			result : bestResult,
			pokemonId : bestPokemonId,
			atkId : bestAtkId
		};

		return myResult;
	}

	_createOptionsFromMoves (mons1, mons2){
		this._createOptionsFromOneMove (mons1, mons2, 0, 0);
	}

	_createOptionsFromOneMove (mons1, mons2, myMoveId, myPokemonPartyId){

		var myNodes = [];

		var myNode1 = {
			actionType: "1",
			result: undefined,
			id: -1,
			theParent: -1,
			theChildren: [],
			mine : true,
			moveId : myMoveId,
			pokemonPartyId : myPokemonPartyId,
			moveDamage : this.returnDamageFromMoveToOpponent(mons1, mons2, myMoveId)
		};

		for (var i=0; i<mons2.seenMoves.length; i++) {

			var tempNode = {
				actionType: "1",
				result: myNode1.moveDamage - this.returnDamageFromMoveToSelf(mons1, mons2, i),
				id: -1,
				theParent: myNode1,
				theChildren: [],
				mine : false,
				moveId : myMoveId,
				pokemonPartyId : myPokemonPartyId,
				//moveDamage : this.returnDamageFromMoveToSelf(mons1, mons2, myMoveId)
				moveDamage : this.returnDamageFromMoveToSelf(mons1, mons2, i)
			};

			myNode1.theChildren.push(tempNode);
		}

		return this._doMinimax(myNode1, 1, true);
	}

	_doMinimax(node, depth, maxPlayer) {
		if (depth == 0 || node.theChildren == undefined) {
			return node.result;
		}
		var bestValue, currValue;
		if (maxPlayer) {
			bestValue = -32109418732752;
			//console.log(node);
			for (var i = 0; i < node.theChildren.length; i++) {
				currValue = this._doMinimax(node.theChildren[i], depth - 1, false);
				bestValue = Math.max(currValue, bestValue);
			}
			return bestValue;
		}
		else {
			bestValue = 3857425894175;
			for (var i = 0; i < node.theChildren.length; i++) {
				currValue = this._doMinimax(node.theChildren[i], depth - 1, true);
				bestValue = Math.min(currValue, bestValue);
			}
			return bestValue;
		}
	}

	//======================
	//MinMaxSwitch

	//MyUtil
	returnMoveFromSeenMoves(move, mons) {

			if (mons.moves != undefined) {

				for (var i = 0; i < mons.moves.length; i++) {

					if (mons.moves[i].name == move.name) {
						return mons.moves[i];
					}
				}
			}

			return undefined;
		}
}
export default PokeTest;




//
