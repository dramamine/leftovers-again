const {MOVE, SWITCH} = require('@la/decisions');
const Damage = require('@la/game/damage');
const Side = require('@la/model/side');

var Sideo = new Side();

var move0 = function(state) {
    return new MOVE(0);
}
var move1 = function(state) {
    return new MOVE(1);
}
var move2 = function(state) {
    return new MOVE(2);
}
var move3 = function(state) {
    return new MOVE(3);
}

function haveRecoil(moveID) {
    if(moveID == 'doubleedge')
        return true;
    if(moveID == 'bravebird')
        return true;
    if(moveID == 'flareblitz')
       return true;
    if(moveID == 'headcharge')
       return true;
    if(moveID == 'headsmash')
        return true;
    if(moveID == 'highjumpkick')
        return true;
    if(moveID == 'jumpkick')
        return true;
    if(moveID == 'lightofruin')
        return true;
    if(moveID == 'struggle')
        return true;
    if(moveID == 'submission')
        return true;
    if(moveID == 'takedown')
        return true;
    if(moveID == 'volttackle')
        return true;
    if(moveID == 'wildcharge')
        return true;
    if(moveID == 'woodhammer')
        return true;

    return false

}

function isEnemyWithStatus(enem, stateID) {
    if(enem.statuses) {
        for(var i in enem.statuses) {
            if(enem.statuses[i] == stateID) {
                 return true;
            }
        }
    }

    return false;
}

var Calcule = function(state, moveID, global) {
    var enem = state.opponent.active;
    var against = global.ourPokemons[state.self.active.id].against[enem.id];
    if(state.self.active == null) {
        console.error("o ativo não existe");
        return -404;
    }
    else if(state.self.active.moves == null) {
        console.error("os moves não existem");
        console.error(state.self.active);
        //return -404;
    }
    var move = state.self.active.moves[moveID];
    if(move == null)
        return -404;
    if(move.disabled)
        return -404;
    if(move.pp == 0)
        return -404;


    var pok = state.self.active;

    var dmg = Damage.getDamageResult(pok, enem, move);

    var value = 0;

    var dmgMin = dmg[0];
    var dmgMax = dmg[dmg.length -1];

    var dmgMean = 0;

    for(var i in dmg) {
        dmgMean += dmg[i];
    };

    dmgMean /= dmg.length;


    var enemStats = Damage.assumeStats(enem);
    //var enemHP = (enem.hp/100) * (enemStats.hp);
    //console.log("HP: " + (enem.hp/100) + ", " + (enemStats.hp) + " = " + enemHP)

    //Casos especiais

    if(move.id == "substitute" && pok.hppct < 0.25)
        return -100;

    if(move.id == "explosion"){
        if(pok.hppct > 0.2)
            value -= 100;
        else
            value -= 20;
    }


    if(move.id == "fakeout") {
        if((global.lastSwitch.turn + 1) != state.turn) // esse move só funciona na primeira vez. -.-
            return -404;
    }

    if(move.id == "return") {
        value += 40;
    }

    if(haveRecoil(move.id))
        value -= 50;

    if(move.drain)
        value += 20;

    if(move.flags.charge)
        value -= 100;

    if(dmgMax >= enem.hp) {
        //console.log("hp : " + enem.hp);
        if(dmgMin >= enem.hp) {
            value += 250;
        }
        if(dmgMean >= enem.hp) {
            value += 100;
        }
        value += 650;
        value += move.pp;
        value += move.priority * 10;

    }
    else {

        value += dmgMean;
        if(pok.hp <= against.bestMinE)
            value += move.priority * 20;
        else
            value += move.priority * 2;



        //EXCLUIR ISSO DEPOIS DE ADICIONAR STATE DE SIDE CONDITION
        if(move.sideCondition) {
            // Se for um side condition que diminue o dano do inimigo
            if(move.sideCondition == 'lightscreen' &&
               move.sideCondition == 'luckychant' &&
               move.sideCondition == 'mist' &&
               move.sideCondition == 'reflect' &&
               move.sideCondition == 'safeguard' &&
               move.sideCondition == 'tailwind'
              ){
                value += 40;

               }
            else if(move.sideCondition == 'matblock') { // se for esse ataque aqui que eu não entendi
                value += 15;
            }

        }

        if(move.boosts) {
            if(move.target == "normal") {
                for (var i in move.boosts) {
                    value += -move.boosts[i] * 14;
                }
            }
            else if(move.target == "self")
            {
                for (var i in move.boosts) {
                    value += move.boosts[i] * 10;
                }
            }
        }

        if(move.self) {
            if(move.self.boosts) {
                for(i in move.self.boosts)
                    value += move.self.boosts[i] * 10;
            }
        }


        if(move.secondary) {
            if(move.secondary.self) {
                if(move.secondary.self.boosts) {
                    if(move.secondary.chance) {
                        for(i in move.secondary.self.boosts) {
                            value += move.secondary.self.boosts[i] * 0.1 * move.secondary.chance;
                        }
                    }
                    else {
                        for(i in move.secondary.self.boosts){
                            value += move.secondary.self.boosts[i] * 10;
                        }
                    }
                }

            }
            if(move.secondary.status) {
               if(!isEnemyWithStatus(enem, move.secondary.status)) {
                      if(move.secondary.chance) {
                          value += 0.5 * move.secondary.chance;
                      }
                      else {
                          value += 50;
                      }
               }
            }

            if(move.secondary.volatileStatus){
                var bdo = false;
                if(enem.volatileStatus) {
                    if(enem.volatileStatus[move.secondary.volatileStatus] == null) {
                        bdo = true;
                    }
                }
                else {
                    bdo = true;
                }
                if(bdo) {
                    if(move.secondary.chance) {
                        value += 0.5 * move.secondary.chance;
                    }
                    else {
                        value += 50;
                    }
                }

            }

        }

    }

    if(move.accuracy > 20) {
            value *= move.accuracy;
            value /= 100;
    }

    // console.log(move.id +" : " + dmgMin + ", " + dmgMean + ", " + dmgMax + " : " + value);

    return value;

}


var Calcule0 = function(state, global) {
    return Calcule(state, 0, global);
}
var Calcule1 = function(state, global) {
    return Calcule(state, 1, global);
}
var Calcule2 = function(state, global) {
    return Calcule(state, 2, global);
}
var Calcule3 = function(state, global) {
    return Calcule(state, 3, global);
}

module.exports ={
    move0 : move0,
    move1 : move1,
    move2 : move2,
    move3 : move3,
    calcule0 : Calcule0,
    calcule1 : Calcule1,
    calcule2 : Calcule2,
    calcule3 : Calcule3,
}
