const Typechart = require('@la/game/typechart');
const Damage = require('@la/game/damage');
const Moves = require('@la/data/moves');
const Side = require('@la/model/side');

var EvaluateEnemy = require("./EvaluateEnemy");

module.exports = function (pok, enemy, isOurs) {
    var pokObj;
    if(pok == null) {
        return null;
    }

    if(pok.dead) {
        return null;
    }

    if(isOurs) {
         pokObj = {
             maxhp : pok.maxhp,
             haveStatus : false,
             status : [],
             haveBoostDown : false,
             boostDowns : [],
             haveBoost : false,
             boosts : [],
             haveHazard : false,
             hazards : [],
             haveHeal : false,
             heal : [],
             isSweeper : false,
             batonpass : false,
             haveSubstitute : false,
             haveProtect : false,
             moves : pok.moves,
             havePriority : false,
             against : {},
             haveLeechSeed : false,
             haveYawn : false,
             haveConfusionInEnemy: false,
             haveDrain : false,
             haveSleep : false,

         };
          //pokObj = ourPokemons[pok.id];
     }
    /*else {
          theirsPokemons[pok.id] = {
              haveStatus : false,
              status : [],
              haveStatusDown : false,
              statusDowns : {},
              haveBoost : false,
              boosts : [],
              haveHazard : false,
              hazards : {},
              haveHeal : false,
              isSweeper : false,
              bottomPass : false,
              haveSubstitute : false,
              haveProtect : false,
              haveRetreat : false,
              haveForceSwitch : false,
              moves : pok.moves,
              hasPriority : false,
              against : {},
         };
         pokObj = theirsPokemons[pok.id];
    }*/

    var damageDoneIn = {};

    var arrayMoves = [];
    if(isOurs) {
        arrayMoves = pok.moves;
    }
    else{
        for(var moveID in pok.seenMoves) {
            arrayMoves.push(Moves[moveID]);
        }
    }

    for (var move in pok.moves) {
        if(pok.moves[move].pp <= 0)
            continue;

        for(var pokEnemy in enemy.reserve) {
            if(!damageDoneIn[enemy.reserve[pokEnemy].id]) {
                    damageDoneIn[enemy.reserve[pokEnemy].id] = {};
                }
            damageDoneIn[enemy.reserve[pokEnemy].id][move] = Damage.getDamageResult(pok, enemy.reserve[pokEnemy], pok.moves[move]);
        }

        if(pok.moves[move].self)  { //se tem algo em si mesmo
            if(pok.moves[move].self.boosts) { // se for um boost
                pokObj.haveBoost = true;
                pokObj.boosts.push(pok.moves[move].self.boosts);
            }

        }
        if(pok.moves[move].boosts) {
            if(pok.moves[move].target == "normal") {
                pokObj.haveBoostDown = true;
                pokObj.boostDowns.push(pok.moves[move].boosts);
            }
            else
            {
                pokObj.haveBoost = true;
                pokObj.boosts.push(pok.moves[move].self.boosts);
            }
        }
        if(pok.moves[move].id == 'substitute') {
            pokObj.haveSubstitute = true;
        }
        else if(pok.moves[move].id == 'wish') {
            pokObj.haveHeal = true;
            pokObj.heal.push('wish')
        }
        else if(pok.moves[move].id == 'batonpass') {
             pokObj.batonpass = true;
        }
        if(pok.moves[move].status) {
            pokObj.haveStatus = true;
            pokObj.status.push(pok.moves[move].status);
            if(pok.moves[move].status == 'slp') {
                pokObj.haveSleep = true;
            }
        }
        if(pok.moves[move].priority > 0) {
            pokObj.havePriority = true;
        }
        if(pok.moves[move].volatileStatus) {
            if(pok.moves[move].volatileStatus == 'yawn') {
                pokObj.haveYawn = true;
            }
            else if(pok.moves[move].volatileStatus == 'leechseed') {
                pokObj.haveLeechSeed = true;
            }
            else if(pok.moves[move].volatileStatus == 'protect') {
                    pokObj.haveProtect = true;
            }
            else if(pok.moves[move].volatileStatus == 'confusion' && pok.moves[move].target == 'normal') {
                    pokObj.haveConfusionInEnemy = true;
            }

        }
        if(pok.moves[move].drain) {
            pokObj.haveDrain = true;
        }
        if(pok.moves[move].heal) {
            pokObj.haveHeal = true;
        }
        if(pok.moves[move].sideCondition) {
            if(pok.moves[move].sideCondition == 'lightscreen' &&
               pok.moves[move].sideCondition == 'luckychant' &&
               pok.moves[move].sideCondition == 'mist' &&
               pok.moves[move].sideCondition == 'reflect' &&
               pok.moves[move].sideCondition == 'safeguard' &&
               pok.moves[move].sideCondition == 'tailwind' &&
               pok.moves[move].sideCondition == 'toxicspikes' &&
               pok.moves[move].sideCondition == 'spikes' &&
               pok.moves[move].sideCondition == 'stealthrock' &&
               pok.moves[move].sideCondition == 'stickyweb'
              ) {
               pokObj.haveHazard = true;
               pokObj.hazards.push(pok.moves[move].sideCondition);
            }

        }

        if(pok.moves[move].secondary) {
            if(pok.moves[move].secondary.self) {
                if(pok.moves[move].secondary.self.boosts) {
                    if(pok.moves[move].secondary.chance) {
                        if(pok.moves[move].secondary.chance == 100) {
                            pokObj.haveBoost = true;
                            pokObj.boosts.push(pok.moves[move].secondary.self.boosts);
                        }
                    }
                    else {
                        pokObj.haveBoost = true;
                        pokObj.boosts.push(pok.moves[move].secondary.self.boosts);
                    }
                }
            }
            if(pok.moves[move].secondary.status) {
                if(pok.moves[move].secondary.chance) {
                    if(pok.moves[move].secondary.chance == 100) {
                        pokObj.haveStatus = true;
                        pokObj.status.push(pok.moves[move].secondary.status);
                        if(pok.moves[move].secondary.status == 'slp') {
                            pokObj.haveSleep = true;
                        }
                    }
                }
                else {
                    pokObj.haveStatus = true;
                    pokObj.status.push(pok.moves[move].secondary.status);
                    if(pok.moves[move].secondary.status == 'slp') {
                        pokObj.haveSleep = true;
                    }
                }
            }
            if(pok.moves[move].secondary.volatileStatus) {
                if(pok.moves[move].secondary.volatileStatus == 'confusion') {
                    if(pok.moves[move].secondary.chance) {
                        if(pok.moves[move].secondary.chance == 100) {
                            pokObj.haveConfusionInEnemy = true;
                        }
                    }
                    else {
                        pokObj.haveConfusionInEnemy = true;
                    }
                }

            }
        }
    }

    if(pokObj.haveBoost) {

        var haveTrueBoost = false;
        var boosts = {
            atk : false,
            def : false,
            hp : false,
            spa : false,
            spd : false,
            spe : false,
        };

        for(var i in pokObj.boosts) {

            for(var a in pokObj.boosts[i]) {

                if(pokObj.boosts[i][a] > 0) {
                    haveTrueBoost = true;
                    boosts[a] = true;
                    //console.log("non bullshit " + a + " " + pokObj.boosts[i][a] + " " + pok.id);
                }
                else {
                    //console.log("This " + a + " " + pokObj.boosts[i][a] + " is bullshit"+ " " + pok.id);
                }
            }
        }

        pokObj.haveBoost = haveTrueBoost;
        pokObj.boosts = boosts;
    }

    if(pokObj.batonpass) {
        if(!pokObj.haveBoost) {
            pokObj.batonpass = false;
        }
    }

    if(pokObj.haveBoost) { // SWEEP CHECK
        if(pokObj.boosts.spe) {
            var haveRecover = false;
            if(pokObj.haveHeal) {
                haveRecover = true;
            }
            else if(pokObj.haveHeal) {
                haveRecover = true;
            }
            else if(pokObj.haveYawn) {
                haveRecover = true;
            }
            else if(pokObj.haveConfusionInEnemy) {
                haveRecover = true;
            }
            else if(pokObj.haveSleep) {
                haveRecover = true;
            }
            if(haveRecover) {
                var haveMoveUp = false;
                for(var move in pok.moves) {
                    if(pok.moves[move].category == 'Special' && pokObj.boosts.spa) {
                         pokObj.isSweeper = 'special';
                    }
                    else if(pok.moves[move].category == 'Physical' && pokObj.boosts.atk) {
                        haveMoveUp = 'physical';
                    }
                }
            }
            else {
                console.log("No Recover :(");
            }
        }
    }

    for(var pokEnemy in enemy.reserve) {
        pokObj.against[enemy.reserve[pokEnemy].id] = {};
        pokObj.against[enemy.reserve[pokEnemy].id].max = 0;
        pokObj.against[enemy.reserve[pokEnemy].id].min = 0;
        pokObj.against[enemy.reserve[pokEnemy].id].bestMin = 0;

        for (var move in pok.moves) {

            if(!damageDoneIn[enemy.reserve[pokEnemy].id][move]) {
                continue;
            }

            for(var index in  damageDoneIn[enemy.reserve[pokEnemy].id][move]) {
                if( pokObj.against[enemy.reserve[pokEnemy].id].min == 0) {
                    pokObj.against[enemy.reserve[pokEnemy].id].min = damageDoneIn[enemy.reserve[pokEnemy].id][move][index]
                }
                else if(pokObj.against[enemy.reserve[pokEnemy].id].min > damageDoneIn[enemy.reserve[pokEnemy].id][move][index]) {
                    pokObj.against[enemy.reserve[pokEnemy].id].min = damageDoneIn[enemy.reserve[pokEnemy].id][move][index];
                }
                if(pokObj.against[enemy.reserve[pokEnemy].id].max < damageDoneIn[enemy.reserve[pokEnemy].id][move][index]) {
                    pokObj.against[enemy.reserve[pokEnemy].id].max = damageDoneIn[enemy.reserve[pokEnemy].id][move][index];
                    pokObj.against[enemy.reserve[pokEnemy].id].bestMin = damageDoneIn[enemy.reserve[pokEnemy].id][move][0]
                }
            }
        }

        pokObj.against[enemy.reserve[pokEnemy].id].maxE = 0;
        pokObj.against[enemy.reserve[pokEnemy].id].minE = 0;
        pokObj.against[enemy.reserve[pokEnemy].id].bestMinE = 0;
        pokObj.against[enemy.reserve[pokEnemy].id].knownMoves = enemy.reserve[pokEnemy].seenMoves.length;

        for(var move in enemy.reserve[pokEnemy].seenMoves) {

            var movement = Moves[enemy.reserve[pokEnemy].seenMoves[move]];

            var damage = Damage.getDamageResult(pok, enemy.reserve[pokEnemy], movement);

            for(var index in damage) {
                if(pokObj.against[enemy.reserve[pokEnemy].id].minE == 0) {
                    pokObj.against[enemy.reserve[pokEnemy].id].minE = damage[index];
                }
                else if( pokObj.against[enemy.reserve[pokEnemy].id].minE >  damage[index]) {
                    pokObj.against[enemy.reserve[pokEnemy].id].minE = damage[index];
                }
                if(pokObj.against[enemy.reserve[pokEnemy].id].maxE <  damage[index]) {
                    pokObj.against[enemy.reserve[pokEnemy].id].maxE = damage[index];
                    pokObj.against[enemy.reserve[pokEnemy].id].bestMinE = damage[0];
                }
            }


        }

        pokObj.against[enemy.reserve[pokEnemy].id].types = 0;
        pokObj.against[enemy.reserve[pokEnemy].id].typeAttack = 0;
        pokObj.against[enemy.reserve[pokEnemy].id].typeDefending = 0;

        for(var pokT in pok.types) {
            for(var pokE in enemy.reserve[pokEnemy].types) {
                // my type attacking their type
                var t = Typechart.compare(pok.types[pokT], enemy.reserve[pokEnemy].types[pokE]);
                if(t == 0) {
                    pokObj.against[enemy.reserve[pokEnemy].id].typeAttack -= 3;
                    pokObj.against[enemy.reserve[pokEnemy].id].types -= 3;
                }
                else if(t == 0.5) {
                    pokObj.against[enemy.reserve[pokEnemy].id].typeAttack -= 1;
                    pokObj.against[enemy.reserve[pokEnemy].id].types -= 1;
                }
                else if(t == 2){
                    pokObj.against[enemy.reserve[pokEnemy].id].typeAttack += 2;
                    pokObj.against[enemy.reserve[pokEnemy].id].types += 2;
                }

                // their type atacking my type
                t = Typechart.compare(enemy.reserve[pokEnemy].types[pokE], pok.types[pokT]);
                if(t == 0) {
                    pokObj.against[enemy.reserve[pokEnemy].id].typeDefending += 3;
                    pokObj.against[enemy.reserve[pokEnemy].id].types += 3;
                }
                else if(t == 0.5) {
                    pokObj.against[enemy.reserve[pokEnemy].id].typeDefending += 1;
                    pokObj.against[enemy.reserve[pokEnemy].id].types += 1;
                }
                else if(t == 2){
                    pokObj.against[enemy.reserve[pokEnemy].id].typeDefending -= 3;
                    pokObj.against[enemy.reserve[pokEnemy].id].types -= 3;
                }

            }
        }
        //console.log(pok.types + " against " + enemy.reserve[pokEnemy].types + " = " + pokObj.against[enemy.reserve[pokEnemy].id].types)

        pokObj.against[enemy.reserve[pokEnemy].id].value = EvaluateEnemy(pokObj, enemy.reserve[pokEnemy].id);

        //console.log(pok.id + " against " + enemy.reserve[pokEnemy].id + " = " + pokObj.against[enemy.reserve[pokEnemy].id].value);
    }



    return pokObj;
}
