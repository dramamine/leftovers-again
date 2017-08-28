const {MOVE, SWITCH} = require('@la/decisions');

var Transition = require("./Transition")
function State(update, transition) {
    this.update = update;

    if(transition != null)
        this.Transition = transition;
    else
        this.Transition = [];

}

State.prototype.addTransition = function(weight, state, trigger)
{
    this.Transition.push(new Transition(weight, state, trigger));
}

State.prototype.checkTransitions = function(gState, global)
{
    var bestWeight = 0;
    var state = null;
    if(this.Transition.length <= 0) {
        console.log("there is no transition");
        return null;
    }


    for (var t in this.Transition) {
        //console.log(t);
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

module.exports = State;