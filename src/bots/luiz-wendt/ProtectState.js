const {MOVE, SWITCH} = require('@la/decisions');
var Transition = require("./Base/Transition");
var State = require("./Base/State");

function ProtectStateUpdate(state, global) {
    console.log("On Protect");

    var pok = state.self.active;
    //console.log(pok.moves);
    for(var i in pok.moves) {
        if(pok.moves[i]) {
            if(!pok.moves[i].disabled) {
                if(pok.moves[i].id == 'protect') {
                    return new MOVE(pok.moves[i].id);
                }
            }
        }
    }

    return -404;
}

function TransitionToProtect(state, global) {
    var pok = state.self.active;
    var enem = state.opponent.active;

    var check = false;
    if(enem.statuses) {
        for(var i in enem.statuses) {
            if(enem.statuses[i] == 'brn' || enem.statuses[i] == 'psn' || enem.statuses[i] == 'tox') {
                check = true;
            }
        }
    }

    if(check) {
        for(var i in pok.moves) {
            if(pok.moves[i]) {
                if(!pok.moves[i].disabled) {
                    if(pok.moves[i].id == 'protect') {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

function TransitionFromProtect(state, global) {
    var pok = state.self.active;
    var enem = state.opponent.active;

    var check = false;
    if(enem.statuses) {
        for(var i in enem.statuses) {
            if(enem.statuses[i] == 'brn' || enem.statuses[i] == 'psn' || enem.statuses[i] == 'tox') {
                check = true;
            }
        }
    }

    if(!check)
        return true;

    for(var i in pok.moves) {
        if(pok.moves[i]) {
            if(!pok.moves[i].disabled) {
                if(pok.moves[i].id == 'protect') {
                    return false;
                }
            }
        }
    }


    return true;
}

module.exports = {
    update : ProtectStateUpdate,
    toProtect : TransitionToProtect,
    fromProtect : TransitionFromProtect
}