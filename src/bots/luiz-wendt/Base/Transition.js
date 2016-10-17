function Transition(weight, state, triggercondition) {
    this.weight = weight;
    this.state = state;
    this.isTriggered = triggercondition;
}


module.exports = Transition;