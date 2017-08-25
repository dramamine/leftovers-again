const {MOVE, SWITCH} = require('@la/decisions');

var StatusesEffectivity = require("./StatusesEffectivity");
var State = require("./Base/State");



function updateStatus(state, global) {
    console.log("On Statuses");
    var pok = state.self.active;
    for(var i in pok.moves) {
        if(pok.moves[i] == null)
            continue;
        if(pok.moves[i].disabled)
            continue;
        if(pok.moves[i].pp <= 0)
            continue;

        if(pok.moves[i].status) {
            if(StatusesEffectivity(state, pok.moves[i].status, pok.moves[i])) {
                global.lastStateTry.status = pok.moves[i].status;
                global.lastStateTry.enem = state.opponent.active.id;
                global.lastStateTry.turn = state.turn;
                return new MOVE(pok.moves[i].id);
            }
            else
                continue;
        }

        if(pok.moves[i].volatileStatus) {
            if(pok.moves[i].volatileStatus != "leechseed" &&
               pok.moves[i].volatileStatus != "confusion")
                continue;

            if(StatusesEffectivity(state, pok.moves[i].status, pok.moves[i])) {
                global.lastStateTry.status = pok.moves[i].status;
                global.lastStateTry.enem = state.opponent.active.id;
                global.lastStateTry.turn = state.turn;
                return new MOVE(pok.moves[i].id);
            }
            else
                continue;

        }

    }
    return -404;
}


function transitionToState(state, global) {


    if(global.hitKill)
        return false;

    var pok = state.self.active;
    if(pok == null)
        return false;

    if(this.myMonsAlive == 1)
        return false;

    for(var i in pok.moves) {
        if(pok.moves[i] == null)
            continue;
        if(pok.moves[i].disabled)
            continue;
        if(pok.moves[i].pp <= 0)
            continue;

        if(pok.moves[i].status) {
            if(StatusesEffectivity(state, pok.moves[i].status, pok.moves[i])) {
                if(global.lastStateTry.enem == state.opponent.active.id) {
                    if(global.lastStateTry.status == pok.moves[i].status) {
                        if((state.turn - global.lastStateTry.turn) < 3) {
                            return false;
                        }
                    }
                }
                return true;

            }
            else
                continue;
        }

        if(pok.moves[i].volatileStatus) {
            if(pok.moves[i].volatileStatus != "leechseed" &&
               pok.moves[i].volatileStatus != "confusion")
                continue;

            if(StatusesEffectivity(state, pok.moves[i].status, pok.moves[i])) {
                if(global.lastStateTry.enem == state.opponent.active.id) {
                    if(global.lastStateTry.status == pok.moves[i].status) {
                        if((state.turn - global.lastStateTry.turn) < 3) {
                            return false;
                        }
                    }
                }
                return true;
            }
            else
                continue;

        }
    }
    return false;
}

function transitionFromState(state, global) {

    var pok = state.self.active;
    if(pok == null)
        return true;

    for(var i in pok.moves) {
        if(pok.moves[i] == null)
            continue;
        if(pok.moves[i].disabled)
            continue;
        if(pok.moves[i].pp <= 0)
            continue;

        if(pok.moves[i].status) {
            if(StatusesEffectivity(state, pok.moves[i].status, pok.moves[i])){
                if(global.lastStateTry.status == pok.moves[i].status)
                    return true;
                else
                    return false;
            }
            else
                continue;
        }
    }
    return true;
}


module.exports = {
    update : updateStatus,
    toState : transitionToState,
    fromState : transitionFromState
}