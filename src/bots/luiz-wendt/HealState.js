const Damage = require('@la/game/damage');
const { MOVE, SWITCH } = require('@la/decisions');

function update(state, global) {

    console.log("On Heal");
    var moves = state.self.active.moves;

    for(var i in moves) {
        if(moves[i] == null)
            continue;
        if(moves[i].disabled)
            continue;
        if(moves[i].heal) {
            global.lastHeal.turn = state.turn;
            global.lastHeal.pok = state.self.active.id;

            return new MOVE(moves[i].id);
        }
    }

    return -404;
}

function transitionToState(state, global) {
    var moves = state.self.active.moves;
    var pok = state.self.active;
    var enem = state.opponent.active;
    Damage.assumeStats(pok);
    if(((pok.hp) + pok.maxhp/2) < global.ourPokemons[pok.id].against[enem.id].bestMinE)
        return false;

    for(var i in moves) {
        if(moves[i] == null)
            continue;
        if(moves[i].disabled)
            continue;
        if(moves[i].heal) {
            if(pok.hppct > 50) {
                if(global.hitKill){
                    return false;
                }
                else if(enem.statuses) {
                    for(var i in enem.statuses) {
                        if(enem.statuses[i] == 'brn' || enem.statuses[i] == 'tox' || enem.statuses[i] == 'psn'){
                            console.log("Stalling");
                            return true;
                        }
                    }
                    return false;
                }
                else {
                    return false;
                }
            }
            else {
                return true;
            }
            return true;
        }
    }

    return false;
}

function TransitionFromState(state, global) {
    var moves = state.self.active.moves;
    var pok = state.self.active;
    var enem = state.opponent.active;
    Damage.assumeStats(pok);
    if(((pok.hp) + pok.maxhp/2) < global.ourPokemons[pok.id].against[enem.id].bestMinE)
        return true;

    for(var i in moves) {
        if(moves[i] == null)
            continue;
        if(moves[i].disabled)
            continue;
        if(moves[i].heal) {
            if(pok.hppct > 50) {
                if(global.hitKill){
                    return true;
                }
                else if(enem.statuses) {
                    for(var i in enem.statuses) {
                        if(enem.statuses[i] == 'brn' || enem.statuses[i] == 'tox' || enem.statuses[i] == 'psn'){
                            console.log("Stalling");
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return true;
                }
            }
            else {
                return true;
            }
            return false;
        }
    }

    return true;
}





module.exports = {
    update : update,
    toState : transitionToState,
    fromState : TransitionFromState
}
