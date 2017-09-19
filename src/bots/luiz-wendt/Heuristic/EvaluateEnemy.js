const Typechart = require('@la/game/typechart');
const Damage = require('@la/game/damage');
//Damage.getDamageResult(attacker, defender, move)
const Moves = require('@la/data/moves');
const Side = require('@la/model/side');

module.exports = function (pokObj, str, pok) {
    // max -> maximum damage against the enemy
    // min -> minimum damage against the enemy

    // maxE -> maximum damage enemy can do
    // minE -> minimum damage enemy can do

    // knownMoves -> how many moves do we know?

    // types -> relation between all types

    var against = pokObj.against[str];

    var result = 0;


    //if(against.knownMoves < 4) {  // if we don't know everything about damage, assume using the types
        if(against.types > 0) {
            result += Math.pow(2, against.types);
        }
        else if(against.types < 0) {
            result -= Math.pow(2, -against.types);
        }
    //}

    /*if(against.knownMoves >= 2)
    {
        if(against.maxE > 0) {
            if(pokObj.haveheal) {
                var i = 1;
                while((against.maxE * i) <= (pokObj.maxhp/2)) { // how many turn do the enemy need to half health me?
                    i++;
                }
                if(i == 1) {
                    result  -= 200;
                }
                else {
                    result += Math.pow(10, i);
                }
            }

            var i = 1;
            while((against.maxE * i) <= (pokObj.maxhp)) {
                i++;
            }
            if(i == 1) {
                console.log(against.maxE + " ué " + pokObj.maxhp);
                result = -404;
            }
            else if (i < 3){
                result += 50;
            }
            else {
                result += Math.pow(2, i - 1);
            }

        }
    }*/


    return result;

}
