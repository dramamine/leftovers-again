function FuSM() {
    
    this.states = [];

}

FuSM.prototype.addState = function(state)
{
    this.states.push(state);
}
FuSM.prototype.update = function(state, global)
{
    if(this.states == null) {
        console.error("There is no state on the FUSM");
    }
    else
    {   
        var betterState = null;
        var betterValue = 0;
        for (var i in this.states) {
            if(betterState == null) {
                betterState = this.states[i];
                betterValue = this.states[i].CalculeValue(state, global);
             //   console.log(betterValue);
            }
            else {
                var newValue = this.states[i].CalculeValue(state, global);
               // console.log(newValue + ", " + betterValue);
                if(newValue > betterValue){
                    betterValue = newValue;
                    betterState = this.states[i];
                }
            }
        }
        if (betterValue == -404) {
            return -404;
        }
        else {
            return betterState.update(state, global);
        }
    }

}

module.exports = FuSM;