const {MOVE, SWITCH} = require('@la/decisions');

function FuzzyState(update, calcule) {
    this.update = update;

    this.CalculeValue = calcule;
    //console.log(this.CalculeValue);

}


module.exports = FuzzyState;