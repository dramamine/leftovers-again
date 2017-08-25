const Damage = require('@la/game/damage');
const {MOVE, SWITCH} = require('@la/decisions');

/*
if(move.sideCondition == 'lightscreen' &&
               move.sideCondition == 'luckychant' &&
               move.sideCondition == 'mist' &&
               move.sideCondition == 'reflect' &&
               move.sideCondition == 'safeguard' &&
               move.sideCondition == 'tailwind'
  ){
    value += 40;

}
else if(move.sideCondition == 'matblock') { // se for esse ataque aqui que eu não entendi
    value += 15;
}
else if(move.sideCondition == 'spikes' &&
        move.sideCondition == 'stealthrock' &&
        move.sideCondition == 'stickyweb'){
    value += 30;
}
else if(move.sideCondition == 'toxicspikes') {
    value += 60;
}*/

function update(state, global) {

    console.log("On Hazard");
    var moves = state.self.active.moves;


    for(var i in moves) {
        if(moves[i] == null)
            continue;
        if(moves[i].disabled)
            continue;
        if(moves[i].sideCondition) {
            if(moves[i].sideCondition == 'spikes' ) {
                if(state.opponent.side == null)
                    return new MOVE(moves[i].id);
                if(state.opponent.side[moves[i].sideCondition] == null)
                    return new MOVE(moves[i].id);
                if(state.opponent.side[moves[i].sideCondition] < 3)
                     return new MOVE(moves[i].id);
                 else if(state.opponent.side[moves[i].sideCondition] == 0)
                   return new MOVE(moves[i].id);

            }
            else if(moves[i].sideCondition == 'stickyweb' ||
                    moves[i].sideCondition == 'toxicspikes' ||
                    moves[i].sideCondition == 'stealthrock') {
                if(state.opponent.side == null)
                    return new MOVE(moves[i].id);
                if(state.opponent.side[moves[i].sideCondition] == null)
                     return new MOVE(moves[i].id);
                else if(state.opponent.side[moves[i].sideCondition] == 0)
                     return new MOVE(moves[i].id);
            }

        }
    }

    return -404;
}

function transitionToState(state, global) {
    var moves = state.self.active.moves;
    var pok = state.self.active;
    var enem = state.opponent;
    Damage.assumeStats(pok);

    if(global.enemyMonsAlive < 3)
        return false;

    if(state.opponent.active.ability) {
        if(state.opponent.active.ability == "Magic Bounce"){
            return false;
        }
    }

    for(var i in moves) {
        if(moves[i] == null)
            continue;
        if(moves[i].disabled)
            continue;

        if(moves[i].sideCondition) {
            console.log("HaveHazard");
            if(moves[i].sideCondition == 'spikes' ) {
                if(state.opponent.side == null)
                    return true;
                if(state.opponent.side[moves[i].sideCondition] == null)
                    return true;
                else if(state.opponent.side[moves[i].sideCondition] < 3)
                    return true;
                else if(state.opponent.side[moves[i].sideCondition] == 0)
                    return true;
                console.log("Hazard: " + state.opponent.side);
            }
            else if(moves[i].sideCondition == 'stickyweb' ||
                    moves[i].sideCondition == 'toxicspikes' ||
                    moves[i].sideCondition == 'stealthrock') {
                if(state.opponent.side == null)
                    return true;
                if(state.opponent.side[moves[i].sideCondition] == null)
                    return true;
                else if(state.opponent.side[moves[i].sideCondition] == 0)
                    return true;
                console.log("Hazard: " + state.opponent.side);
            }

        }
    }

    return false;

}

function TransitionFromState(state, global) {
    var moves = state.self.active.moves;
    var pok = state.self.active;
    var enem = state.opponent.active;

    return true;

}





module.exports = {
    update : update,
    toState : transitionToState,
    fromState : TransitionFromState
}
