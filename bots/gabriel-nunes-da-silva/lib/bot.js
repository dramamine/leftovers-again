'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _decisions = require('leftovers-again/lib/decisions');

var _typechart = require('leftovers-again/lib/game/typechart');

var _typechart2 = _interopRequireDefault(_typechart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */
/**
 * GNunes08
 *
 */
class GNunes08 {
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
        var __reservePokemon = state.self.reserve.filter(mon1 => !mon1.dead).filter(mon2 => !mon2.disabled);
        var __enemyTypes = state.opponent.active.types;

        if (state.forceSwitch) {

            var __myMon = this.getEffectivePokemon(__enemyTypes, __reservePokemon);
            if (__myMon != null) {
                const myMon = __myMon;
                return new _decisions.SWITCH(myMon);
            }
            const myMon = this.pickOne(__reservePokemon);
            return new _decisions.SWITCH(myMon);
        }

        var __myMoves = state.self.active.moves.filter(move => !move.disabled);
        var __myPokemon = state.self.active;

        var __move = this.getEffectiveMove(__myMoves, __enemyTypes, true);
        if (__move != null) {
            const myMove = __move;
            return new _decisions.MOVE(myMove);
        } else if (this.isPokemonEffective(__enemyTypes, __myPokemon) != true) {
            __move = this.getEffectiveMove(__myMoves, __enemyTypes, false);
            if (__move != null) {
                const myMove = __move;
                return new _decisions.MOVE(myMove);
            }
        }

        if (__reservePokemon > 0) {
            var __myMon = this.getEffectivePokemon(__enemyTypes, __reservePokemon);
            if (__myMon != null) {
                const myMon = __myMon;
                return new _decisions.SWITCH(myMon);
            }
        }

        const myMove = this.pickOne(__myMoves);
        return new _decisions.MOVE(myMove);
    }

    // randomly chooses an element from an array
    pickOne(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    getEffectiveMove(p_activeMoves, p_types, p_effective) {
        var __newMove = null;
        for (var i = 0; i < p_activeMoves.length; i++) {
            if (p_effective) {
                if (_typechart2.default.compare(p_activeMoves[i].type, p_types) > 1) {
                    if (__newMove != null && p_activeMoves[i].basePower > __newMove.basePower) __newMove = p_activeMoves[i];else if (__newMove == null) __newMove = p_activeMoves[i];
                }
            } else {
                if (_typechart2.default.compare(p_activeMoves[i].type, p_types) == 1 && p_activeMoves[i].basePower >= 20) {
                    if (__newMove != null && p_activeMoves[i].basePower > __newMove.basePower) __newMove = p_activeMoves[i];else if (__newMove == null) __newMove = p_activeMoves[i];
                }
            }
        }
        return __newMove;
    }

    getEffectivePokemon(p_enemyTypes, p_pokemons) {
        var __newMon = null;
        for (var i = 0; i < p_pokemons.length; i++) {
            for (var j = 0; j < p_enemyTypes.length; j++) {
                if (_typechart2.default.compare(p_enemyTypes[j], p_pokemons[i].types) < 1) {
                    if (__newMon == null) __newMon = p_pokemons[i];else if (p_pokemons[i].hppct > __newMon.hppct) {
                        __newMon = p_pokemons[i];
                    }
                } else if (_typechart2.default.compare(p_enemyTypes[j], p_pokemons[i].types) == 1) {
                    if (__newMon == null) __newMon = p_pokemons[i];else if (p_pokemons[i].hppct > __newMon.hppct) {
                        __newMon = p_pokemons[i];
                    }
                }
            }
        }
        return __newMon;
    }

    isPokemonEffective(p_enemy, p_pokemon) {
        if (p_enemy.length > 1) {
            for (var i = 0; i < p_enemy.length; i++) {
                if (_typechart2.default.compare(p_enemy[i], p_pokemon.types) > 1) {
                    return true;
                }
            }
        } else if (_typechart2.default.compare(p_enemy[0], p_pokemon.types) > 1) return true;
        return false;
    }

}
exports.default = GNunes08;