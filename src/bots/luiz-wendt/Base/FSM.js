function FSM() {
    
    this.currentState = null;

    
}

FSM.prototype.update = function(state, global)
{

    if(this.currentState == null) {
        console.error("There is no state on the FSM");
    }
    else
    {   
        var trans =  this.currentState.checkTransitions(state, global); // It is before executing because it has to update with everything that happened since last turn
        if(trans)
            this.currentState = trans;
        
        //console.log(state.self.active);
        
        var retorno =  this.currentState.update(state, global);
        return retorno;
    }

}

module.exports = FSM;