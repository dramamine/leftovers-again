/**
 * MilkBot531
 *
 */
const KO = require('@la/game/kochance');
const {MOVE, SWITCH} = require('@la/decisions');
const Damage = require('@la/game/damage');
const Typechart = require('@la/game/typechart');
var _damage = require('@la/game/damage');
var _damage2 = _interopRequireDefault(_damage);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pkmn = [];
var dmgDone= [];

//turnControl
var turnsInBattle = 0;
var lastPKMNInBattle;
var hpLost;
var lastHP = 100;
var healMove;
var stallMove;
var strat = { normal:1 , switch:2 , heal:3 , stall:4};
var currentStrat = strat.normal;

class MilkBot531 {


  decide(state) {


      var presumedStats = Damage.assumeStats(state.opponent.active);

     // var opSpeed = Damage.calculateStat(state.opponent.active,state.opponent.active.stats.spe);

      turnControl(state);

      if (state.forceSwitch)
      {
          const myMon = findBestAttacker(state);
          console.log(myMon.species);
          // return a Decision object. SWITCH takes Pokemon objects, Pokemon names,
          // and the reserve index [0-5] of the Pokemon you're switching into.
          lastHP = myMon.hppct;
          return new SWITCH(myMon.species);
      }

      var bestMove = findBestMove(state);
        var dmg = _damage2.default.getDamageResult(state.self.active, state.opponent.active, state.self.active.moves[bestMove]);
       // console.log(dmg);
      //  console.log(state.opponent.active.stats.hp);
     // console.log(state.opponent.active.baseStats.hp);
        var koChancepls = KO.predictKO(dmg,state.opponent.active);
      if (koChancepls.turns == null)
          {
              koChancepls.turns = 999;
          }
        console.log(koChancepls.chance + '% de KO em turnos: ' +koChancepls.turns );
        //if (maxDamage < 100 && state.self.active.hppct > 40 && koChancepls < 2)

      if (state.self.active.statuses.indexOf('trapped') == -1) //Se não está TRAPPED
          {

              if(state.self.active.hppct > 40 && koChancepls.turns > 2)
              {
                  var newBestMon = findBestAttacker(state);
                  if (newBestMon.species != state.self.active.species)
                  {
                      console.log ('Troca!!!' + state.self.active.species + ' por '+ newBestMon.species);
                      if (newBestMon != null)
                      {
                          lastHP = newBestMon.hppct;
                          return new SWITCH(newBestMon.species);
                      }
                  }
                  else
                  {
                      console.log('Foi o mesmo11!!1!!');
                  }
              }
          }
    console.log('\n Escolhendo Ataque contra Tipo: ' + state.opponent.active.types[0] + " e " + state.opponent.active.types[1] +' e Habilidade ' + state.opponent.active.abilities);
	console.log('\n Escolhi o: ' + state.self.active.moves[bestMove].name +'\n com dano: ' + _damage2.default.getDamageResult(state.self.active, state.opponent.active, state.self.active.moves[bestMove]));
    return new MOVE(bestMove);

        }

  // randomly chooses an element from an array
  _pickOne(arr)
    {
        return arr[Math.floor(Math.random() * arr.length)];
    }


}

function findBestAttacker(state)
    {
        var monID = null; //recebe mon
        var optimalScore = 0;
        var myMons = state.self.reserve.filter(mon => !mon.dead);
        var maxDamage = -1;
        var bestMove = 0;
        var numberOfTurnsKO = 999;
        var optimalKO = 1000;
        var pctKO = 0;
        var optimalPct = 0;
        var movePriori = -1;
        var optimalPriori = -1;
        var presumedStats = Damage.assumeStats(state.opponent.active);
        var monScores = [];
        for (var i = 0; i < myMons.length; i++)
        {

            console.log('!!! Testando o PKMN: ' + myMons[i].species +' com speed: ' +myMons[i].stats.spe +' Contra oponente de speed ' + state.opponent.active.stats.spe);
            myMons[i].score = evaluateMon(state,myMons[i],state.opponent.active);
            if(myMons[i].score > optimalScore)
                {
                    optimalScore = myMons[i].score;
                    monID = myMons[i];
                }

        }
                   console.log('\n Deveria estar usando ' + monID.species);
            return(monID);
    }

function findBestMove(state)
    {
        var maxDamage = -1;
        var bestMove = 0;
        var numberOfTurnsKO = 999;
        var optimalKO = 1000;
        var pctKO = 0;
        var optimalPct = 0;
        var movePriori = -1;
        var optimalPriori = -1;
        for (var idx = 0; idx < state.self.active.moves.length; idx++ )
        {
            var move = state.self.active.moves[idx];
            if (move.disabled) continue;
            if (move.name == 'U-turn' || move.name == 'Volt Switch') continue;
            if (move.pp <= 0) continue;
            var est = [];
            try
            {
                est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move);
                est = dealWithExceptions(move,state.self.active,state.opponent.active,est);
                var KOInfo = KO.predictKO(est,state.opponent.active);
                numberOfTurnsKO = KOInfo.turns;
                pctKO = KOInfo.chance;
                if(numberOfTurnsKO == null)
                {
                    numberOfTurnsKO =  999;
                }
                //var typeEff = Typechart.compare(move.type,state.opponent.active.types);
                if(move.name == 'Fake Out' && turnsInBattle == 0) numberOfTurnsKO = -10; //Caso especial do Fake Out. SEMPRE vale a pena usar Fake Out no inimigo se é o primeiro turno do Pokemon(do bot) em campo.
                if(move.name == 'Fake Out' && turnsInBattle > 0) numberOfTurnsKO = 1000; //MAS se não for o primeiro turno, golpe não faz absolutamente nada.
                if(move.name == healMove && currentStrat == strat.heal)
                {
                    numberOfTurnsKO = -5;
                    currentStrat = strat.normal;
                    //console.log('\u0007');


                }
                if (currentStrat == strat.stall)
                    {
                        if(move.name == stallMove && state.opponent.active.statuses.indexOf('tox') == -1)
                            {
                                numberOfTurnsKO = -4;
                                console.log('\u0007');
                                currentStrat = strat.normal;
                            }
                            if (state.opponent.active.statuses.indexOf('tox') !== -1 && move.name == 'Protect' && state.self.active.prevMoves[0].name != 'Protect')
                            {
                                numberOfTurnsKO = -3;
                                currentStrat = strat.normal;
                                console.log('\u0007');
                            }

                    }


                movePriori = move.priority;
                console.log ('----------');
                console.log('Move: ' + move.name + ' com KO em: ' + numberOfTurnsKO + ' Priori: ' + move.priority + ' TypeEff: ' + Typechart.compare(move.type,state.opponent.active.types));
                console.log('Damage: ' + est);

            }
            catch (e)
            {
                console.log(e);
                console.log(state.self.active, state.opponent.active, move);
            }

           // if (est[0] > maxDamage)
           // {
           //     maxDamage = est[0];
           //     bestMove = idx;
           // }

            if (numberOfTurnsKO <= optimalKO)
                {
                    if (numberOfTurnsKO < optimalKO)
                        {
                            optimalKO = numberOfTurnsKO;
                            optimalPct = pctKO;
                            bestMove = idx;
                            optimalPriori = movePriori;
                        }

                    if (numberOfTurnsKO == optimalKO)
                        {
                            if(pctKO > optimalPct)
                                {
                                    optimalKO = numberOfTurnsKO;
                                    optimalPct = pctKO;
                                    bestMove = idx;
                                    optimalPriori = movePriori;
                                }
                        }

                }
                if(movePriori > optimalPriori)
                {
                        if (numberOfTurnsKO == optimalKO)
                        {
                                optimalKO = numberOfTurnsKO;
                                optimalPct = pctKO;
                                bestMove = idx;
                                optimalPriori = movePriori;
                        }

                         // if (numberOfTurnsKO == optimalKO)
                         // {
                         //     if(pctKO > optimalPct)
                         //     {
                         //         optimalKO = numberOfTurnsKO;
                         //         optimalPct = pctKO;
                         //         bestMove = idx;
                         //         optimalPriori = movePriori;
                         //     }
                         // }


                }

        }

    return bestMove;
}

function turnControl(state)
{
    console.log(state.self.active.hppct + ' É O HP QUE TENHO AGORA?');
    var healName = ['Roost','Slack Off','Synthesis','Recover','Softboiled','Milk Drink','Heal Order','Moonlight','Morning Sun'];
    var stallName = ['Toxic'];
    var hasToxic = false;
    var myMoves = state.self.active.moves;
    healMove = undefined;
    stallMove = undefined;
    currentStrat = strat.normal;
    //Verifica se o PKMN tem algum tipo de cura.
    if (myMoves != undefined)
        {

            for (var i = 0; i < myMoves.length; i++)
            {

                var move = myMoves[i];
               // if (move.disabled) continue;
                if(healName.indexOf(move.name) !== -1)
                    {
                        healMove = move.name;
                    }
                if(stallName.indexOf(move.name) !== -1)
                    {
                        stallMove = move.name;
                    }
            }
        }
    ///
    if(stallMove != undefined)
        {

            var bestMove = findBestMove(state);
            console.log ('passou best');
            var est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, state.self.active.moves[bestMove]);
            console.log ('passou est');
            est = dealWithExceptions(bestMove,state.self.active,state.opponent.active,est);
            console.log ('passou excep');
            var KOInfo = KO.predictKO(est,state.opponent.active);
            console.log ('passou KO');
            var numberOfTurnsKO = KOInfo.turns;
            if (numberOfTurnsKO > 3 && state.opponent.active.types.indexOf('Poison') == -1 && state.opponent.active.types.indexOf('Steel') == -1)
            {
                currentStrat = strat.stall;
                console.log('\u0007');
            }

        }
    if(healMove != undefined && state.self.active.hppct < 65 && hpLost < 50)
        {
            currentStrat = strat.heal;
        }
    if(lastPKMNInBattle == state.self.active.species)
    {
        turnsInBattle++;
        console.log(state.self.active.species +' na batalha por::: ' + turnsInBattle)
    }
    else
    {
        turnsInBattle = 0;
        console.log('Trocou de PKMN. Reseta counter')
    }
    if (turnsInBattle == 0)
    {
      //  hpLost = 0;
       // lastHP = state.self.active.hppct;
        hpLost = lastHP - state.self.active.hppct;

    }
    if(turnsInBattle > 0)
    {
            hpLost = lastHP - state.self.active.hppct;
           // console.log('HP Perdido foi???????' + hpLost);
    }
    console.log(hpLost +'HP Perdido!');
    lastPKMNInBattle = state.self.active.species;


}

function dealWithExceptions(mov,a,d,prevDmg)
{
   // var typeEffect1 = Damage.getMoveEffectiveness(move, defender.type1, attacker.ability === 'Scrappy', 0);
    //var typeEffect2 = defender.type2 ? getMoveEffectiveness(move, defender.type2, attacker.ability === 'Scrappy') : 1;
    var dmg = prevDmg;
    var move = mov;
    var defender = d;
    var attacker = a;
    var typeEffectiveness;// = Typechart.compare(move,defender.types);
    if (move.type === 'Ground' && defender.item === 'Air Balloon')
    {

        //description.defenderItem = defender.item;
        console.log('MANÉ DO BALÃO!!!!!!!!!!!!!!!!!!!!!!');
        return [0];
    }
    if (defender.ability != undefined)
        {
    if (typeEffectiveness < 2 && defender.ability ==='Wonder Guard' || move.type === 'Grass' && defender.ability === 'Sap Sipper' || move.type === 'Fire' && defender.ability.indexOf('Flash Fire') !== -1 || move.type === 'Water' && ['Dry Skin', 'Storm Drain', 'Water Absorb'].indexOf(defender.ability) !== -1 || move.type === 'Electric' && ['Lightning Rod', 'Lightningrod', 'Motor Drive', 'Volt Absorb'].indexOf(defender.ability) !== -1 || move.type === 'Ground' && defender.ability === 'Levitate' || move.isBullet && defender.ability === 'Bulletproof' || move.isSound && defender.ability === 'Soundproof') {
        //description.defenderAbility = defAbility;
        console.log('CAIU NA EXCEÇÃO, BOBALHÃO!!!!!!!');
        return [0];
      }
        }
    return prevDmg;
}


function evaluateMon(state,myMon,otherMon)
{
    var oponente = otherMon;
    var typeEffDef = 1;
    var typeEff2 = 0;
    var score = 0
    var maxDamage = -1;
    var bestMove = 0;
    var numberOfTurnsKO = 999;
    var optimalKO = 1000;
    var pctKO = 0;
    var optimalPct = 0;
    var movePriori = -1;
    var optimalPriori = -1;
    var presumedStats = Damage.assumeStats(state.opponent.active);
    //TESTA MOVES
    for (var idx = 0; idx < myMon.moves.length; idx++ )
    {
        var move = myMon.moves[idx];
        if (move.disabled) continue;
        if (move.name == 'U-turn' || move.name == 'Volt Switch') continue;
        if (move.pp <= 0) continue;
        var est = [];
        try
        {
            est = _damage2.default.getDamageResult(myMon, oponente, move);
            est = dealWithExceptions(move,myMon,oponente,est);
            var KOInfo = KO.predictKO(est,oponente);
            numberOfTurnsKO = KOInfo.turns;
            pctKO = KOInfo.chance;
            if(numberOfTurnsKO == null)
            {
                numberOfTurnsKO =  999;
            }
            movePriori = move.priority;
            if (movePriori == undefined) movePriori = 0; //Não retorna 0 quando o pokemon está na reserve.

        }
        catch (e)
        {
            console.log(e);
            console.log(myMon, oponente, move);
        }
            if (numberOfTurnsKO <= optimalKO)
            {
                if (numberOfTurnsKO < optimalKO)
                    {
                        optimalKO = numberOfTurnsKO;
                        optimalPct = pctKO;
                        bestMove = idx;
                        optimalPriori = movePriori;
                    }
                if (numberOfTurnsKO == optimalKO)
                    {
                        if(pctKO > optimalPct)
                            {
                                optimalKO = numberOfTurnsKO;
                                optimalPct = pctKO;
                                bestMove = idx;
                                optimalPriori = movePriori;
                            }
                    }
            }
            if(movePriori > optimalPriori) //PRIORITY VEM PRIMEIRO. Se o PKMN matar na mesma quantia de turnos, melhor usar um ataque mais rápido.
            {
                    if (numberOfTurnsKO == optimalKO)
                    {
                            optimalKO = numberOfTurnsKO;
                            optimalPct = pctKO;
                            optimalPriori = movePriori;

                    }


            }


    }
    score = score + 3/optimalKO; console.log('Score de KO: +' + 2/optimalKO);
    score = score + pctKO/1000; console.log('Score de PCT: +' + pctKO/1000);
    if(optimalPriori > 0)
    {
        score = score+0.01; console.log('Score de Priori: +0.01');
    }
    if (myMon.stats.spe > oponente.stats.spe)
    {
        score = score+1; console.log('Score de Speed: +1');
    }
    var opoType1 = oponente.types[0];


    var opoType2 = oponente.types[1];
    var eff1;
    eff1 = Typechart.compare(opoType1,myMon.types); console.log(opoType1 + ' ' +eff1);
    var eff2;
    if (opoType2 != undefined)
    {
        eff2 = Typechart.compare(opoType2,myMon.types); console.log(opoType2 + ' ' +eff2);
    }
    else eff2 = 1;
    typeEffDef = 1 - ((eff1+eff2)/8);
    score = score+typeEffDef; console.log('Score de Defesa de Type: ' + typeEffDef);
    console.log('SCORE FINAL: ' +score);
    return score;
}

module.exports = MilkBot531;


//Ability de absorb
//Sucker Punch Free Ride
//Switch loop ou U-Turn/Volt Switch (kinda)
//Dragon Tail(usar)
//Melhorar switch levando consideração o tipo
//SE canTank, buff the fuck up (ou heal)
//SEM FAKEOUT NO GHOST