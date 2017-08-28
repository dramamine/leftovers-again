const {MOVE, SWITCH} = require('@la/decisions');
var FuSM = require("./Base/FuSM")
var Transition = require("./Base/Transition")
var MoveStates = require("./MoveState")

var FuzzyState = require("./Base/FuzzyState")

function DealDamage() {

    this.fusm = new FuSM();
    //console.log(this.fusm.states)
    this.fusm.addState(new FuzzyState(MoveStates.move0, MoveStates.calcule0));
    this.fusm.addState(new FuzzyState(MoveStates.move1, MoveStates.calcule1));
    this.fusm.addState(new FuzzyState(MoveStates.move2, MoveStates.calcule2));
    this.fusm.addState(new FuzzyState(MoveStates.move3, MoveStates.calcule3));
    //console.log(this.fusm.states)


    this.Transition = [];

}

DealDamage.prototype.addTransition = function(weight, state, trigger)
{
    this.Transition.push(new Transition(weight, state, trigger));
}

DealDamage.prototype.checkTransitions = function(gState, global)
{
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


DealDamage.prototype.update = function(state, global) {
    console.log("On Deal Damage State");
    //console.log(state.self.active);
    return this.fusm.update(state, global);
}




module.exports = DealDamage;