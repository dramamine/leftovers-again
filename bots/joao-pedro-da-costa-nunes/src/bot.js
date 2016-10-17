/**
 * PokeTest
 *
 */
 import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
 import Typechart from 'leftovers-again/lib/game/typechart';

 var _damage = require('leftovers-again/lib/game/damage');
 var _damage2 = _interopRequireDefault(_damage);

 function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */
 class PokeTest {
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
    	// filter through your reserve of Pokemon for ones that aren't dead
    	const myMon = this._pickOne(state.self.reserve.filter(mon => !mon.dead), state.self.active, state.opponent.active);

      // return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
      // and the reserve index [0-5] of the Pokemon you're switching into.
      return new SWITCH(myMon);
  }

// filter through your active Pokemon's moves for a move that isn't disabled
const myMove = this._pickBestMove(state.self.active.moves.filter(move => !move.disabled), state.self.active, state.opponent.active);
    // return a Decision object. MOVE takes Move objects, move names, and
    // move indexes [0-3].
    return new MOVE(myMove);
}

_pickBestMove(arr, me, opponent) {
	arr.sort();

	var valueOfEffective;
	var indexOfBestEffective;
	var tempValueOfEffective;

	var valueOfMaxDamage;
	var indexOfBestDamage;

	valueOfEffective = indexOfBestEffective = tempValueOfEffective = valueOfMaxDamage = indexOfBestDamage = 0;

	for (var i = 0; i < arr.length; i++) {
		valueOfEffective = Typechart.compare(arr[i].type, opponent.types);

		var est = [];
		try {
			est = _damage2.default.getDamageResult(me, opponent, arr[i]);
		} catch (e) {
			console.log(e);
		}

		if (est[0] > valueOfMaxDamage) {
			valueOfMaxDamage = est[0];
			indexOfBestDamage = i;
		} if (valueOfEffective > tempValueOfEffective) {
			tempValueOfEffective = valueOfEffective;
			indexOfBestEffective = i;
		}
	}


	// PREFERÊNCIA 0: SUPER EFETIVO && DANO
	if (tempValueOfEffective > 2 && valueOfMaxDamage > 0) {
		if (indexOfBestDamage == indexOfBestEffective) {
			return arr[indexOfBestEffective];
		} else {
			return arr[indexOfBestDamage];
		} // PREFERÊNCIA 1: EFETIVO && DANO
	} else if (tempValueOfEffective > 1 && valueOfMaxDamage > 0) {
		if (indexOfBestDamage == indexOfBestEffective) {
			return arr[indexOfBestEffective];
		} else {
			return arr[indexOfBestDamage];
		} // PREFERÊNCIA 2: DANO
	} else if (valueOfMaxDamage > 0) {
		return arr[indexOfBestDamage];
	} else { // PREFERÊNCIA 3: SUPER || EFETIVO
		return arr[indexOfBestEffective];
	}
}

_pickOne(arr, me, opponent) {
	return arr[Math.floor(Math.random() * arr.length)];
}
}

export default PokeTest;
