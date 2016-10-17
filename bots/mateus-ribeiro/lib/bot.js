'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _decisions = require('leftovers-again/lib/decisions');

var _typechart = require('leftovers-again/lib/game/typechart');

var _typechart2 = _interopRequireDefault(_typechart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * RyujinBot
 *
 */
var myBotSwitched = false;
var shouldSwitch = false;
var justSwitched = false;
var atacksAfterSwitch = 0;

class Ryujin {
    decide(state) {
        if (state.forceSwitch) {
            const myMon = this.selectPokemon(state.self.reserve.filter(mon => !mon.dead && !mon.active), state.opponent.active);
            // return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
            // and the reserve index [0-5] of the Pokemon you're switching into.
            return new _decisions.SWITCH(myMon);
        }

        if (!state.self.active.dead && !justSwitched) {
            shouldSwitch = this.checkStatus(state.self.active, state.opponent.active);
            if (shouldSwitch == true) {
                console.log("Should Switch");
            }
        }

        if (shouldSwitch) {
            const myMon = this.selectPokemon(state.self.reserve.filter(mon => !mon.dead && !mon.active), state.opponent.active);
            shouldSwitch = false;
            // return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
            // and the reserve index [0-5] of the Pokemon you're switching into.
            return new _decisions.SWITCH(myMon);
        }

        const myMove = this.selectMove(state.self.active.moves.filter(move => !move.disabled), state.opponent.active);
        // return a Decision object. MOVE takes Move objects, move names, and
        // move indexes [0-3].
        return new _decisions.MOVE(myMove);
    }

    //check probability to win
    checkStatus(myPokemon, opponentPokemon) {
        var aux = false;
        for (var i = 0; i < myPokemon.statuses.length; i++) {
            console.log("statuses: " + myPokemon.statuses[i]);
            if (myPokemon.statuses[i] == 'par') {
                aux = true;
                justSwitched = true;
            }
        }

        //switch when opponent type is super effective			
        var sumTypechart = 0;
        for (var i = 0; i < myPokemon.types.length; i++) {
            sumTypechart += _typechart2.default.compare(myPokemon.types[i], opponentPokemon.types);
        }
        console.log("Sum Typechart: " + sumTypechart);
        //mininum required to switch
        if (sumTypechart >= 2.5) {
            aux = true;
            justSwitched = true;
        }

        return aux;
    }

    selectMove(myPokemonMoves, opponentPokemon) {
        var aux = 0;
        var chosenMove = 0;

        for (var i = 0; i < myPokemonMoves.length; i++) {
            if (aux < _typechart2.default.compare(myPokemonMoves[i].type, opponentPokemon.types)) {
                aux = _typechart2.default.compare(myPokemonMoves[i].type, opponentPokemon.types);
                chosenMove = i;
            }
        }

        if (justSwitched) {
            atacksAfterSwitch++;
            if (atacksAfterSwitch > 1) {
                justSwitched = false;
                atacksAfterSwitch = 0;
            }
        }

        return myPokemonMoves[chosenMove];
    }

    selectPokemon(myPokemon, opponentPokemon) {
        myBotSwitched = true;
        console.log("Just switched pokemon");
        var aux = 0;
        var chosenPokemon = 0;
        var sumAtacks = 0;
        for (var i = 0; i < myPokemon.length; i++) {
            for (var j = 0; j < myPokemon[i].types.length; j++) {
                //Check Pokemon types against opponent
                if (aux < _typechart2.default.compare(myPokemon[i].types[j], opponentPokemon.types)) {
                    //Check Pokemon moves and set the one with higher stats to win the fight(case if there another pokemon of same type on the team)
                    if (sumAtacks < this.getSumAtacksEffectiveness(myPokemon[i], opponentPokemon)) {
                        sumAtacks = this.getSumAtacksEffectiveness(myPokemon[i], opponentPokemon);
                        aux = _typechart2.default.compare(myPokemon[i].types[j], opponentPokemon.types);
                        chosenPokemon = i;
                    }
                }
            }
        }

        console.log("Effectiveness of Pokemon type: " + aux);
        console.log("Effectiveness of Pokemon moves: " + sumAtacks);

        return myPokemon[chosenPokemon];
    }

    getSumAtacksEffectiveness(myPokemon, opponentPokemon) {
        var sumAtacks = 0;

        for (var i = 0; i < myPokemon.moves.length; i++) {
            sumAtacks += _typechart2.default.compare(myPokemon.moves[i].type, opponentPokemon.types);
        }

        return sumAtacks;
    }
}

exports.default = Ryujin;