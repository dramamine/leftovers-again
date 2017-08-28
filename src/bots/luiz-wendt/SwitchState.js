const {MOVE, SWITCH} = require('@la/decisions');
var Transition = require("./Base/Transition");
var State = require("./Base/State");

/// paramater mons -> array of mons
/// parameter enemy -> enemyID
/// return -> array of good deffender moons with their deffenses on a 'tDef' attribute;
function getGoodDeffenders(myMon, enemy, pokI) {
    var deff = [];
    for(var i in myMon) {
        var id = myMon[i].id;
        myMon[i].tDef = pokI[id].against[enemy].typeDefending;
        if(myMon[i].tDef.tDef >= 0) {
                deff.push(myMon[i]);

        }
    }

    return deff;
}

// Calcule the sum of all the max damages of this pok
function calcBestDamage(id, pokI) {
    var dmg = 0;
    for(var i in pokI[id].against) {
        dmg += pokI[id].against[i].max;
    }

    return dmg;
}

// get the mon that has the better sum of it's max damages.
// maybe change this in the future so you pick a better mon not only looking on it's damage?
function getBestAttackerAtAll(myMon, pokI) {

    var best = null;
    var bestDamage = null;
    for(var i in myMon) {
        var id = myMon[i].id;
        if(best == null) {
            best = myMon[i];
            bestDamage = calcBestDamage(id, pokI);
            if(pokI[id].haveHazard)
                bestDamage += 50;
            if(pokI[id].haveStatus)
                bestDamage += 10;
        }
        else {
            var dmg = calcBestDamage(id, pokI);
             if(pokI[id].haveHazard)
                dmg += 50;
            if(pokI[id].haveStatus)
                dmg += 10;

            if(dmg > bestDamage) {
                best = myMon[i];
                bestDamage = dmg;
            }
        }

    }

    return best;
}

// get the mon that has the highest damage against the enemy
function getBestAttackerAgainst(myMon, enemy, pokI) {


    var best = null;
    var bestDamage = null;
    for(var i in myMon) {
        var id = myMon[i].id;
        if(best == null) {
            best = myMon[i];
            bestDamage = pokI[id].against[enemy].max;
            if(pokI[myMon[i].id].haveHazard) {
                bestDamage += 30;
            }
        }
        else {
            var dmg = pokI[id].against[enemy].max;
            if(pokI[myMon[i].id].haveHazard) {
                dmg += 30;
            }
            if(dmg > bestDamage) {
                best = myMon[i];
                bestDamage = dmg;
            }
        }

    }



    return best;
}

// get an array of the best deffenders of this array
function getBestDeffenders(myMon, enemy, pokI) {

    var best = null;
    var bestDeffense = null;
    for(var i in myMon) {
        var id = myMon[i].id;
        if(myMon[i].tDef == null) {
            myMon[i].tDef =  pokI[id].against[enemy].typeDefending;
        }
        if(best == null) {
            best = [];
            best.push(myMon[i]);
            bestDeffense = myMon[i].tDef;
        }
        else {
            if(myMon[i].tDef > bestDeffense) {
                best = [];
                best.push(myMon[i]);
                bestDeffense = myMon[i].tDef;
            }
            else if(myMon[i].tDef == bestDeffense) {
                best.push(myMon[i]);
            }
        }

    }

    return best;
}

// does this mon deal damage at all to the enemy?
function monsHaveDamage(mons, enemy, pokI) {
    for(var i in mons) {
        if(pokI[mons[i].id].against[enemy].max != 0)
            return true;
    }
    return false;
}

// is there a chance of the enemy one hit kill this pok?
function chanceOfOneHitKill(myMon, enemy, pokI) {

    var deff = [];
    for(var i in myMon) {
        var id = myMon[i].id;
        if(pokI[id].against[enemy].maxE < myMon.maxhp) { // if there is no chance of one hit kill
            deff.push(myMon[i]);
        }
    }

    return deff;

}

// is the last array of this array of array usefull?
function checkIfLastArrayIsUseful(arrayofarraymons, enemy, pokI) {
    var last = arrayofarraymons[arrayofarraymons.length - 1];
    if(last.length == 0) { // if there is none
        //console.log("There are no Mon");
        return false;
        }
    if(!monsHaveDamage(last,enemy, pokI)) {
        // check if the mons have any damage against that opponent
        //if there is none than we're not going to continue to use this array and just go with the other
        //console.log("Mons don't have damage");
        return false;
    }
    if(arrayofarraymons.length > 2) {
       if(arrayofarraymons[arrayofarraymons.length - 2].length == last.length)
           // if nothing has changed since the last update, nothing is useful here
           return false;
    }

    return true;

}

// update of the switch state
function switchStateUpdate(state, global) {
    console.log("On Switch State");

    var stackOfArrays = [];
    var pokI = global.ourPokemons;

    var myMon = state.self.reserve.filter(mon => !mon.dead);
    myMon = myMon.filter(mon => !mon.active);
    myMon = myMon.filter(mon => !mon.disabled);

    if(myMon.length == 1) {
        //console.log("It had just one");
        global.lastSwitch.enemy = state.opponent.active.id;
        global.lastSwitch.pok = myMon[0].id;
        global.lastSwitch.turn = state.turn;
        return new SWITCH(myMon[0].id);
    }

    stackOfArrays.push(myMon);


    var doWithoutEnemy = false;
    if(state.opponent.active == null) {
        doWithoutEnemy = true;
    }
    else if(state.opponent.active.id == null) {
        doWithoutEnemy = true;
    }
    if(doWithoutEnemy) {
        var mon = getBestAttackerAtAll(myMon, pokI);
        global.lastSwitch.enemy = "";
        global.lastSwitch.pok = myMon.id;
        global.lastSwitch.turn = state.turn;
        return SWITCH(mon);
    }

    var enemy = state.opponent.active.id;

    stackOfArrays.push(getGoodDeffenders(stackOfArrays[stackOfArrays.length-1], enemy, pokI));
    if(!checkIfLastArrayIsUseful(stackOfArrays, enemy, pokI)) {
        stackOfArrays.pop();
    }

    stackOfArrays.push(getBestDeffenders(stackOfArrays[stackOfArrays.length-1], enemy, pokI)); // try to get the best deffenders
    if(!checkIfLastArrayIsUseful(stackOfArrays, enemy, pokI)) {
        stackOfArrays.pop();
    }

    var best = getBestAttackerAgainst(stackOfArrays[stackOfArrays.length-1], enemy, pokI);

    global.lastSwitch.enemy = state.opponent.active.id;
    global.lastSwitch.pok = best.id;
    global.lastSwitch.turn = state.turn;

    //console.log("lenght of the array: " + stackOfArrays.length );
    //console.log("choosed: " + best.id + " because the deffense was " +  best.tDef);
    return new SWITCH(best.id);

}

var switchState = new State(switchStateUpdate, null);

function switchTransFunc(state, global) {

    if(state.forceSwitch)
        return false;
    if(state.opponent.active == null)
        return false;
    if(state.opponent.active.id == null)
        return false;

    var pok = state.self.active;
    if(pok == null)
        return false;
    var enem = state.opponent.active;
    var doIt = false;
    var lastSwitch = global.lastSwitch;

    if(lastSwitch.enemy != enem.id) {
        doIt = true;
    }
    else if((state.turn - lastSwitch.turn) > 3) {
        doIt = true;
    }

    if(!doIt) {
        return false;
    }

    var pokI = global.ourPokemons;

    var enemy = state.opponent.active.id;
    if(pokI[pok.id].against[enemy].typeDefending >= 0)
        return false;

    var deffense = pokI[pok.id].against[enemy].typeDefending;

    var stackOfArrays = [];

    var Mons = state.self.reserve.filter(mon => !mon.dead);
    Mons = Mons.filter(mon => !mon.active);
    Mons = Mons.filter(mon => !mon.disabled);


    var last = getGoodDeffenders(Mons, enemy, pokI);

    if(last.length == 0) // if there is none good deffender, stick with what you got
        return false;
    if(!monsHaveDamage(last,enemy, pokI)) {
        // check if the mons have any damage against that opponent
        //  if there is none than why change?
        return false;
    }

    return true;


}


function forceSwitchTransFunc(gState, global) {
    return gState.forceSwitch;
}

var forceSwitchTransition = new Transition(1000, switchState, forceSwitchTransFunc);

module.exports = {
    state : switchState,
    forceSwitch : forceSwitchTransition,

    update : switchStateUpdate,
    forceSwithFunc : forceSwitchTransFunc,
    switchTransFunc : switchTransFunc
}