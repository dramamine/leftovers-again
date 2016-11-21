
var FSM = require("./Base/FSM")
var Transition = require("./Base/Transition")
var DealDamage = require("./DealDamage.js")
var ProtectState = require("./ProtectState.js")
var State = require("./Base/State.js")
var StatusesState = require("./StatusesState");
var HealState = require("./HealState")
var HazardState = require("./HazardState");

function PokeDecision() {
    this.teste = Math.random();
    this.fsm = new FSM();
    this.Transition = [];
    
    ///Creation of state
    var stateDamage = new DealDamage();
    
    var stateProtect = new State(ProtectState.update);
    
    var stateStatuses = new State(StatusesState.update);
    
    var stateHeal = new State(HealState.update);
    
    var stateHazard = new State(HazardState.update);
    
    //All of the Transitions
    
    // Damage
    stateDamage.addTransition(0, stateProtect, ProtectState.toProtect); // Damage to Protect
    stateProtect.addTransition(0, stateDamage, ProtectState.fromProtect); // Protect to Damage
    stateProtect.addTransition(0, stateDamage, function(state, global) {return global.hitKill}); // Protect to Damage2
    
    stateDamage.addTransition(0, stateStatuses, StatusesState.toState); // Damage to Status
    stateStatuses.addTransition(0, stateDamage, StatusesState.fromState); // Status to Damage
    //stateStatuses.addTransition(0, stateDamage, function(state, global) {return global.hitKill}); // Status to Damage2
    
    stateDamage.addTransition(1, stateHeal, HealState.toState); // Damage to Status
    stateHeal.addTransition(0, stateDamage, HealState.fromState); // Status to Damage
    
    stateDamage.addTransition(-1, stateHazard, HazardState.toState); // Damage to Status
    stateHazard.addTransition(0, stateDamage, HazardState.fromState); // Status to Damage

    
    this.fsm.currentState = stateDamage;
    
}

PokeDecision.prototype.addTransition = function(weight, state, trigger) {
    if(state == null)
        console.error("State is null in PokeDecision");
    
    if(trigger == null)
        console.error("Trigger is null in PokeDecision");
    
    this.Transition.push(new Transition(weight, state, trigger));
}

PokeDecision.prototype.checkTransitions = function(gState, global) {
    var bestWeight = 0;
    var state = null;
    if(this.Transition.length <= 0)
        return null;
    
    for (var t in this.Transition) {
        if(this.Transition[t].isTriggered(gState, global)) {
            if(state != null && bestWeight < this.Transition[t].Weight) {
                state = this.Transition[t].state;
            }
            else if(state == null){
                state = this.Transition[t].state;   
            }
        }
    }
    
    if (state == null) {
        return null;
    }
    return state;
}


PokeDecision.prototype.update = function(state, global) {
    console.log(("On Poke Decision"));
    //console.log(this.teste);
    //console.log(state.self.active);
    return this.fsm.update(state, global);
}

module.exports = PokeDecision