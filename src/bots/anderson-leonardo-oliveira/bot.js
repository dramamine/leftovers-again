/**
 * AndersonBOT001
 *
 */
import { MOVE, SWITCH } from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';
import Damage from 'leftovers-again/lib/game/damage';



/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */

 //my activepokemon moves
    var myMoves = [];
	var myPokes = [];
    var hasSuperEfect = false;

    var myActivePoke;
    var advActivePoke;

    var advMoves = [];
    var advFuckinMoves = [];
    var iAmTheFastest = false;
    var myActualAtk;

    var alreadySwitched = false;

    //probabilities
    var advAtkSeenMoves = [];
    var advAtkTypes = [];
    var percentBasedOnAdvAtkTypes = [];

    //terreno
    var spike1 = false;
    var spike2 = false;

    //buffs
    var alreadyVolatiledBuff = false;
    var alreadyBuffed = false;

    var hpAdvAnterior = 0;

    const movesJson = require('./moves.json');
    const formatsJson = require('./formats.json');

class AndersonBOT001 {



  /**
   * Here's the main loop of your bot. `state` contains everything about the
   * current state of the game. Please read the documentation for more
   * details.
   *
   * @param  {Object} state The current state of the game.
   *
   * @return {Decision}     A decision object.
   */
  decide(state) {
    // `forceSwitch` occurs if your Pokemon has just fainted, or other moves
    // that mean you need to switch out your Pokemon
    if (state.forceSwitch) {
        //att informations
        var buffer = Damage.calculateStats(state.opponent.active);
        //Saber se o pokemon do adversário trocou
        if(advActivePoke != buffer){
          console.log("Pokemon adv trocou");
            myActivePoke = state.self.active;
           advActivePoke = state.opponent.active;
            myPokes = state.self.reserve.filter(mon1 => !mon1.dead).filter(mon2 => !mon2.active);
           advAtkSeenMoves = [];
           advAtkTypes = [];
           percentBasedOnAdvAtkTypes = [];
            advActivePoke = Damage.calculateStats(advActivePoke);
      }
        //saber se o adv usou um golpe diferente
        //agora estou habilitado a talvez trocar de pokemon
        if(advMoves.length != advActivePoke.seenMoves.length){
            alreadySwitched = false;
        }

		//const myMon = this.chooseBestPokemon(state.self.reserve.filter(mon => !mon.dead));
        console.log("POKE FORÇADO A TROCAR, TROCANDO");
        //se só tenho 1 poke...
        var test = state.self.reserve.filter(mon1 => !mon1.dead).filter(mon2 => !mon2.active);
        if(test.length === 1){
            return new SWITCH(test[0].id);
        }
        //atualizar variáveis de porcentagem baseado no que conheço
        this.checkSuperEffectiveAdvAtk();
        //atualizar variáveis de porcentagem supondo atks
        this.CheckProbabilities();
        var id = [];
        //escolher melhor pokemon
        id = this.BestSwitchPoke();
        var myMon = id[1].id;
        console.log("Go " + myMon);
        //para não ficar sempre trocando de pokemon
        alreadySwitched = true;
        return new SWITCH(myMon);
    }
      //ATT
      myActivePoke = state.self.active;

      //trocou o poke, limpa as informações
      var buffer = Damage.calculateStats(state.opponent.active);
        if(advActivePoke != buffer){
          console.log("Pokemon adv trocou");
           advActivePoke = state.opponent.active;
           advAtkSeenMoves = [];
           advAtkTypes = [];
           percentBasedOnAdvAtkTypes = [];
          advActivePoke = Damage.calculateStats(advActivePoke);
          myPokes = state.self.reserve.filter(mon1 => !mon1.dead).filter(mon2 => !mon2.active);
      }
      //conheço golpe diferente do poke
      //talvez eu troque de poke agora
       if(advMoves.length != advActivePoke.seenMoves.length){
            alreadySwitched = false;
        }

      console.log("Boosts: " + myActivePoke.boosts);
       console.log("Condition: " + myActivePoke.condition);
       console.log("Statuses: " + myActivePoke.statuses);

      //função principal
    var id = this.JustDoIt();

      console.log("MOVEMENT TYPE: " + id[0]);
      console.log("ID: " + id[1]);
    //if 0 = movimento
      if(id[0] === 0){
          const myMove = id[1];
          return new MOVE(myMove);
      }
      else{//troca de pokemon
          const myMon = id[1].id;
          alreadySwitched = true;
          return new SWITCH(myMon);
      }

  }

    _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
    //função para verificar se um golpe super efetivo contra mim
    //dentre os golpes conhecidos do poke adversario
    checkSuperEffectiveAdvAtk(){
        var numMovesSeen = advActivePoke.seenMoves.length;
        console.log("Conheço: " + numMovesSeen + " golpes do jogador");

        var dmgRate = [];
        var values = [];
        var shouldSwitch = false;
        values[1] = false;

        //se eu conheço algum golpe do adversario
        if(numMovesSeen != 0){
            if(advMoves != advActivePoke.seenMoves){
                alreadySwitched = false;
            }
            advMoves = advActivePoke.seenMoves;


            //loucuragem
            var categoryMove;
            var typeMove;

            for(var i = 0;i<advMoves.length;i++){
                console.log("golpes conhecidos: " + advMoves);

                //search no json pra pegar o category do move do adversario
                categoryMove = movesJson[advMoves[i]]["category"];
                //search no json pra pegar o tipo do move do adversario
                typeMove = movesJson[advMoves[i]]["type"];

                console.log("CATEGORY MOVE: " + categoryMove);
                console.log("TYPE MOVE: " + typeMove);

                //verifico para super efetividade somente os golpes de atk do adversario
                if(categoryMove === "Physical" || categoryMove === "Special"){
                   // console.log("golpe de atk, caiu no if");
                    console.log("Meus tipos poke: " + myActivePoke.types);

                    dmgRate[i] = Typechart.compare(typeMove, myActivePoke.types);

                    //guardo esse tipo para ser usado depois nas probabilidades
                    advAtkSeenMoves.push(advMoves[i]);

                    //guardo esse tipo para ser usado depois nas probabilidades
                    advAtkTypes.push(typeMove);

                    //100% do poke adversario ter um golpe de /\ tipo
                    percentBasedOnAdvAtkTypes.push(100);

                    console.log("atk comparado contra mim, resultado: " + dmgRate[i]);
                    if(dmgRate[i] >= 2){
                        console.log("O adv tem golpe super efetivo contra mim!!");
                       // console.log("Golpe super efetivo contra mim: " + advMoves[i]);
                        //se maior que 2 significa que o golpe é super efetivo
                        //entao eu devo trocar de pokemon
                        shouldSwitch = true;
                    }
                }
            }
            //check de super effective
            if(shouldSwitch === true){
                return shouldSwitch;
            }
            else{
                //se eu sei os 4 atks e nao há super efetivo
                if(advMoves.length === 4){
                    return false;
                }
                else{
                    return false;
                }
            }


        }
    }
    //função basica para verificar se o meu poke é o mais rapido comparado ao adversario
    checkFastestPoke(){
        console.log(myActivePoke.stats);
        console.log(advActivePoke.stats);

        var a = myActivePoke.stats.spe > advActivePoke.stats.spe;

        console.log("AM I THE FASTEST MAN IN THE WORLD? " + a);

        if(a){
            return true;
        }
        else{
            return false;
        }
    }

    //função para verificar se eu tenho um atk super efetivo
    //se eu tiver, retorna isto e o atk super efetivo
    checkSuperEffective(activePoke){
        console.log("CHECKING MY SUPER EFFECTIVE MOVES");
        var moves = [];
        var dmgRate = [];
        var effectiveIDmoves = [];
        var toReturn = [0,false];
    if(activePoke != undefined){
        moves = activePoke.moves;

        //compra tipo atk X tipos pokemon adversario
        for(var j = 0; j < moves.length; j++){
            //sempre pegando somente os golpes de atk
			if(moves[j].category === "Physical" || moves[j].category === "Special"){
                if(moves[j].disabled != true){
			         dmgRate[j] = Typechart.compare(moves[j].type, advActivePoke.types);
                }
			}
            else{
                //se nao for de atk eu julgo como dano 0
                dmgRate[j] = 0;
            }
		}

        console.log("ATK RATE " + dmgRate[0]);
        console.log("ATK RATE " + dmgRate[1]);
        console.log("ATK RATE " + dmgRate[2]);
        console.log("ATK RATE " + dmgRate[3]);

        //verifica se há algum atk super efetivo, ativa bool e salva os ids dos atks super efetivos
        for(var i = 0; i < dmgRate.length; i++){
			if(dmgRate[i] >= 2){
				toReturn[1] = true;
                effectiveIDmoves.push(i);
			}
		}
        //se eu tenho atk super efetivo
        if(toReturn[1] === true){
            //se há mais de 1 atk super effetivo seleciona o melhor
            //com base no basePower do move
            if(effectiveIDmoves.length > 1){
                console.log("Effective moves: " + effectiveIDmoves.length);
                var bestAtk = 0;
                var bestMove = 0;
                for(var i = 0;i< effectiveIDmoves.length; i++){
                    if(moves[effectiveIDmoves[i]].basePower > bestAtk){
                        bestMove = effectiveIDmoves[i];
                    }
                }
                toReturn[0] = bestMove;
            }
            //se só há um, retorna este id
            else{
                console.log("Most Effective id move " + effectiveIDmoves[0]);
                toReturn[0] = effectiveIDmoves[0];
            }
        }
    }
        console.log("Most Effective id move " + toReturn[0]);
        console.log("Tenho atk super efetivo? " + toReturn[1]);
        return toReturn;

    }
    //verifica as porcentagens de tipos do poke adversario
    //para talvez eu trocar de pokemon
    MaybeShouldISwitch(){
        console.log("Maybe i should switch");
        for(var i = 0; i < percentBasedOnAdvAtkTypes.length; i++){

            if(percentBasedOnAdvAtkTypes[i] >= 45){

                var value = Typechart.compare(advAtkTypes[i], myActivePoke.types);
                    if(value >= 2){
                         return true;
                 }
             }
        }
        return false;
    }

    //seleciona o melhor pokemon quando eu decidi que devo trocar
    BestSwitchPoke(){
        console.log("SWITCHING POKE");

         var myNewPokes = [];
         var returnId = [];
        var idPksToRemove = [];

        if(myPokes.length === 1){
            returnId[0] = 1;
            returnId[1] = myPokes[0];
            return returnId;
        }

        var myPokes2 = myPokes;
        //apenas pego pokemons que estao habilitados
        //e que nao sou eu mesmo
        for(var a = 0; a<myPokes2.length;a++){
            if(myActivePoke != undefined){
                if(myPokes2[a].id != myActivePoke.id){
                    myNewPokes.push(myPokes2[a]);
                    //console.log("my reserve pokes: " + myNewPokes[a].id);
                }
            }
        }



        //preparations
        for(var i = 0; i < percentBasedOnAdvAtkTypes.length; i++){
            //excluding pokes that will receive super effective atks 100%
           /* if(percentBasedOnAdvAtkTypes[i] >= 100){
                for(var i = 0; i < myNewPokes.length; i++){
                    if(myNewPokes[i] != undefined){
                        var value = Typechart.compare(advAtkTypes[i], myNewPokes[i].types);
                        if(value >= 2){
                            delete myNewPokes[i];
                        }
                        console.log("switch value: " + value);
                    }
                }
            }*/

            //aqui eu defini que 45% é uma porcentagem boa para avaliar para troca
            //se o tipo de atk do adversario tem mais de 45% de chance
            //de ele ter, eu considero para escolher o melhor poke
            if(percentBasedOnAdvAtkTypes[i] >= 45){

                    for(var j = 0; j < myNewPokes.length; j++){
                        if(myNewPokes[j] != undefined){
                            var value = Typechart.compare(advAtkTypes[i], myNewPokes[j].types);
                            if(value >= 2){
                                //se qualquer dos tipos de atk com mais de 45%
                                //forem super efetivo contra o poke testado atual
                                //coloca seu id para ser removido do array de pokes disponiveis
                                idPksToRemove.push(j);
                                // myNewPokes.splice(j,1);
                                 //delete myNewPokes[j];
                            }
                            console.log("switch value: " + value);
                        }
                    }
            }
        }

        console.log("id pokes to remove: " + idPksToRemove);
        //remove os pokes. que poderao sofrer com atks super efetivos
        for(var u = 0; u < idPksToRemove.length;u++){
                delete myNewPokes[idPksToRemove[u]];
        }



        for(var b = 0;b<myNewPokes.length;b++){
                if(myNewPokes[b] != undefined){
                    console.log("My possible switch pokes: " + myNewPokes[b].id);
                }
            }

        //lets switch boys
        var theBestPokesToSwitch = [];
        for(var c = 0; c < myNewPokes.length;c++){
            if(myNewPokes[c] != undefined){
                theBestPokesToSwitch.push(myNewPokes[c]);
               // console.log("The best pokes to switch: " + theBestPokesToSwitch[i].id);
            }

        }
        //aqui é importante
        //se infelizmente todos meus pokes provavelmente tem desvantegem contra o adversario
        //entao pelo menos eu seleciono um poke que tenha vantagem contra o adversario tbm
        //pego todos os pokes novamente...
        if(theBestPokesToSwitch.length === 0){
            theBestPokesToSwitch = myPokes;
        }
        //se só tenho um poke bom...
        if(theBestPokesToSwitch.length === 1){
            console.log("Just one poke to switch and it is: " + theBestPokesToSwitch[0].id);
            returnId[0] = 1;
            returnId[1] = theBestPokesToSwitch[0];
            return returnId;
        }

        //select best poke
        else{//independente de ele todos terem desvantagem agora
            //ou meu array conter os melhores pokes para trocar
            //se tiver mais de uma opção
            //seleciona o que tenha atk super efetivo contra o adversario
            var hasSuperEffectiveAtks = [];
            for(var i = 0;i<theBestPokesToSwitch.length; i++){
                var a = this.checkSuperEffective(theBestPokesToSwitch[i]);
                hasSuperEffectiveAtks[i] = a[1];
            }
            //get these new pokes
            var theBestPokesToSwitchTwo = [];
            for(var j = 0; j < theBestPokesToSwitch.length; j++){
                if(hasSuperEffectiveAtks[j]){
                    theBestPokesToSwitchTwo.push(theBestPokesToSwitch[j]);
                    //console.log("Best pokes to switch: " + theBestPokesToSwitchTwo[j].id);
                }
            }


            if(theBestPokesToSwitchTwo.length === 1){
                returnId[0] = 1;
                returnId[1] = theBestPokesToSwitchTwo[0];
                console.log("Just one best poke to switch: " + theBestPokesToSwitchTwo[0]);
            }

            if(theBestPokesToSwitchTwo.length === 0){
                theBestPokesToSwitchTwo = theBestPokesToSwitch;
            }

            //se mesmo assim, checando atk super efetivo
            //eu ainda tenho mais de um poke bom
            //seleciona o com melhor HP
            //check poke with best HP
            var hpB = 0;
            var bestPokeYeah;
            console.log("Checkin the pokes HP to select the best");
            for(var q = 0; q < theBestPokesToSwitchTwo.length; q++){
                if(theBestPokesToSwitchTwo[q] != undefined){
                    if(theBestPokesToSwitchTwo[q].hp > hpB){
                        hpB = theBestPokesToSwitchTwo[q].hp;
                        bestPokeYeah = theBestPokesToSwitchTwo[q];
                    }
                }
            }
            console.log("Best best best poke: " + bestPokeYeah);

            returnId[0] = 1;
            returnId[1] = bestPokeYeah;
            return returnId;
        }

    }

    //seleciona o atk com mais dano
    //esta função só é usada dentro da estratégia
    selectBestAtk(){
        var moves = [];
        var toReturn = [0,0];
        var atk = [0,0];

        console.log("Selecting best trash atk move");

    if(myActivePoke != undefined){

        moves = myActivePoke.moves;

        //compra tipo atk X tipos pokemon adversario
        for(var j = 0; j < moves.length; j++){
			if(moves[j].category === "Physical" || moves[j].category === "Special"){
                if(moves[j].disabled != true){
                   var a = Damage.getDamageResult(myActivePoke, advActivePoke, moves[j]);
                    if(a[1] > atk[1]){
                        atk[0] = a[0];
                        atk[1] = a[1];
                        toReturn[1] = j;
                        console.log("Atk minimo: " + atk[0]);
                        console.log("Atk maximo: " + atk[1]);
                        console.log("Movimento: " + toReturn[1].id);
                    }
                }
			}
		}
    }
        console.log("Did everything work till here?");
        return toReturn;
 }
    //seleciona o melhor status move
    //esta função só é usado dentro da estratégia
    selectBestStatusMove(){
        var moves = [];
        var toReturn = [0,0];
        var atk = [0,0];
        var statusMoves = [];

        console.log("Selecting Best Status Move");

    if(myActivePoke != undefined){
        //se o poke adversario já não ta com status
        //entao eu posso meter status nele
        if(advActivePoke.statuses.length === 0){
        moves = myActivePoke.moves;

        //pego os golpes de status
        //verifico uns golpes especiais que atingem o terreno
        //para nao ficar sempre utilizando eles igual doido
        //tambem só me buffo e me dou volatile buff uma vez
        for(var j = 0; j < moves.length; j++){
            if(moves[j].category === "Status"){
                if(moves[j].disabled != true){
                    if(moves[j].id === "stealthrock" && spike1 === false || moves[j].id === "toxicspikes" && spike2 === false || moves[j].volatileStatus != undefined && alreadyVolatiledBuff === false || moves[j].target === "self" && alreadyBuffed === false){
                        console.log("status move: " + moves[j]);
                        statusMoves.push(moves[j]);
                        }
                    }
                }
            }
            console.log("All the status moves: " + statusMoves);
            if(statusMoves === undefined || statusMoves.length === 0){
                console.log("i dont have any status move");
                return false;
        }
            //se eu usei esses golpes especiais eu ativo bool
            //para nao usar de novo
        if(statusMoves.length === 1){
            console.log("Returning status move: " + statusMoves[0].id);
            toReturn[0] = 0;
            toReturn[1] = statusMoves[0];
            if(toReturn[1].id === "stealthrock"){
                spike1 = true;
            }
            if(toReturn[1].id === "toxicspikes"){
                spike2 = true;
            }
            if(toReturn[1].volatileStatus != undefined){
                alreadyVolatiledBuff = true;
            }
            if(toReturn[1].target === "self"){
                alreadyBuffed = true;
            }
            return toReturn;
        }
        else{
            //se eu tenho mais de um golpe de status disponivel eu seleciono um aleatorio
            toReturn[0] = 0;
            toReturn[1] = this._pickOne(statusMoves);
            console.log("Returning status move: " + toReturn[1]);
             if(toReturn[1].id === "stealthrock"){
                spike1 = true;
            }
            if(toReturn[1].id === "toxicspikes"){
                spike2 = true;
            }
            if(toReturn[1].volatileStatus != undefined){
                alreadyVolatiledBuff = true;
            }
            if(toReturn[1].target === "self"){
                alreadyBuffed = true;
            }


            return toReturn;
            }
        }
    }
        console.log("Returning false adv poke already is statused");
        return false;

    }
    //função para estimar probabilidades do poke adversario
    //ter um golpe de atk de X tipo
    CheckProbabilities(){
        console.log("Checking probabilities");
        console.log("Adv atk seen moves: " + advAtkSeenMoves);
        console.log("Adv atk type seen moves: " + advAtkTypes);

        var possibleMoves = [];
        var numberOfPossibleMoves;
        var possibleAtkMoves = [];

        var tempCheckTypes = [];
        var tempNumberOfSameType = [];

        //pego todos os possiveis moves do poke adversario do JSON
         console.log("adv active poke: " + advActivePoke.id);
        possibleMoves = formatsJson[advActivePoke.id]["randomBattleMoves"];

        console.log("Possible adv moves: " + possibleMoves);
        if(possibleMoves != undefined){
        numberOfPossibleMoves = possibleMoves.length;

        //filtrar pra pegar so golpe de atk
        for(var i = 0; i < numberOfPossibleMoves; i++){
            if(movesJson[possibleMoves[i]]["category"] === "Physical" || movesJson[possibleMoves[i]]["category"] === "Special"){
                possibleAtkMoves.push(possibleMoves[i]);
            }
        }
        }

        console.log("Possible atk moves: " + possibleAtkMoves);
        console.log("Possible atk moves length: " + possibleAtkMoves.length);

        for(var a = 0; a < possibleAtkMoves.length; a++){
            //guarda o tipo desses movimentos
            var temp = movesJson[possibleAtkMoves[a]]["type"];
            var alreadyHave = false;
            console.log("type temp: " + temp);

            //aqui se ja tiver guardado o golpe do msm tipo
            //soma uma variavel que depois sera usada para calcular a %%%
            for(var j = 0;j<advAtkTypes.length; j++){
                if(temp === advAtkTypes[j]){
                alreadyHave = true;
                console.log("Golpe do mesmo tipo!");
                    if(tempNumberOfSameType.length != 0){
                        tempNumberOfSameType[j] += 1;
                    }
                }
            }
            //atk de tipo diferente adiciona...
            if(alreadyHave === false){
                console.log("Tipo de atk diferente, adiciona!");
                advAtkTypes.push(temp);
                tempNumberOfSameType.push(1);
            }

            console.log("Debug temp number of same type: " + tempNumberOfSameType);

        }

        //mama mia
        //now the real fuckin math...
        console.log("temp number of same type: " + tempNumberOfSameType);
        var spots = advActivePoke.seenMoves.length;
        /*for(var y = 0; y < percentBasedOnAdvAtkTypes.length;y++){
            if(percentBasedOnAdvAtkTypes[y] === 100){
                spots+=1;
            }
        }*/
        //numero de golpes desconhecidos (spotsFree)
         var spotsFree = 4 - spots;
        console.log("Spots de moves usados: " + spots);
        console.log("Spots livres: " + spotsFree);

        //calculo de probabilidade
        for(var n = 0;n<tempNumberOfSameType.length;n++){
            var a = numberOfPossibleMoves - spots;
            var b = tempNumberOfSameType[n] * 100;
            console.log("possibles: " + a);
            var res = (b / a) * spotsFree;
            console.log("result: " + res);
              if(res != null){
                  percentBasedOnAdvAtkTypes.push(res);
              }
        }

        console.log(advAtkSeenMoves);
         console.log(advAtkTypes);
            console.log(percentBasedOnAdvAtkTypes);

    }
    //loop principal
    JustDoIt(){
       // console.log("ORIGINAL FLOW");
        //check if i have super effective atks
        var values = [];
        var hse;
        var decideId = [];
        //check para ver se eu tenho atk super efetivo
        values = this.checkSuperEffective(myActivePoke);
        hse = values[1];


        //returnID
        //primeira variavel do array é o tipo de movimento
        // 0 = atk
        // 1 = troca de poke
        //segunda variavel do array é o id do move ou nome do move hueahuah
        //se for pokemon, se nao me engano vem direto o nome do poke ou objeto

        //tenho atk super efetivo uhuu
        if(hse){
            //sou o poke mais rapido?
            if(this.checkFastestPoke()){
                decideId[0] = 0;
                decideId[1] = values[0];
                return decideId;
            }
            else{
                //nao sou o poke mais rapido
                //check para sabermose se o oponente tem atks super efetivos
                //retorna se devemos trocar ou atakar
                var shouldSwitch;

                shouldSwitch = this.checkSuperEffectiveAdvAtk();
                 this.CheckProbabilities();
                //devo trocar baseado nos atks conhecidos do adversario?
                //devo trocar de poke? eu tenho poke pra trocar? eu já não acabei de trocar de poke?
                if(shouldSwitch === true && myPokes.length > 1 && alreadySwitched === false){
                    console.log("I SHOULD SWITCH");

                    //then, switch!!
                    decideId = this.BestSwitchPoke();
                    return decideId;
                }
                //devo trocar baseado nas probabilidades de atk do adversario?
                var a = this.MaybeShouldISwitch();
                //mesma coisa de cima
                if(a === true && myPokes.length > 1 && alreadySwitched === false){
                 console.log("I SHOULD SWITCH");
                    console.log("I SHOULD SWITCH");
                    console.log("I SHOULD SWITCH");

                    //then, switch!!
                    decideId = this.BestSwitchPoke();
                    return decideId;
                }

                else{
                    //não sou o mais rápido
                    //aqui entra a estratégia

                   /* decideId[0] = 0;
                    decideId[1] = values[0];*/

                     console.log("Não preciso trocar, vou mete-le o pau!");
                   var buffer2;
                //vou usar status negativos ou me bufar
                buffer2 = this.selectBestStatusMove();

                //check pra ver se meus atks tao dando bom
               //     var hpAdvAtual = advActivePoke
               // var result = hpAdvAnterior -

                if(buffer2 === false){
                //se nao vou me bufar nem usar sts negativo
                    //vou descer o cacete
                buffer2 = this.selectBestAtk();


                }
                  //SOMETHING TO DO
            decideId[0] = buffer2[0];
            decideId[1] = buffer2[1];
            return decideId;
                }
            }
        }
        else{
            console.log("PRESTA ATENÇÃO AQUI");
            console.log("NÃO TENHO ATK SUPER EFETIVO");
            console.log("SERÁ QUE EU TROCO?");
            //TEMPORARY TO DO
            var shouldSwitch;

            shouldSwitch = this.checkSuperEffectiveAdvAtk();
            this.CheckProbabilities();
            //verifica se devo trocar baseado nos atks conhecidos do adversario, se tenho poke pra trocar e se ja nao troquei antes
            if(shouldSwitch === true && myPokes.length > 1 && alreadySwitched === false){
                    console.log("I SHOULD SWITCH");
                    console.log("I SHOULD SWITCH");
                    console.log("I SHOULD SWITCH");
                    //first get the probabilities

                    //then, switch!!
                    decideId = this.BestSwitchPoke();
                    return decideId;
            }

            //after check the probabilities lets see if it's not better to us change
            var a = this.MaybeShouldISwitch();
            //baseado em probabilidade
            if(a === true && myPokes.length > 1 && alreadySwitched === false){
                 console.log("I SHOULD SWITCH");
                    console.log("I SHOULD SWITCH");
                    console.log("I SHOULD SWITCH");
                    //first get the probabilities

                    //then, switch!!
                    decideId = this.BestSwitchPoke();
                    return decideId;
            }

            //aqui entra a estratégia
            else{
                //se sou mais rapido
                 var buffer2;
                 if(this.checkFastestPoke()){
                     console.log("Não preciso trocar, vou mete-le o pau!");
                     //vou usar status negativos ou me bufar
                     buffer2 = this.selectBestStatusMove();
                     if(buffer2 === false){
                    //se nao vou descer a porrada
                    buffer2 = this.selectBestAtk();
                     }
                     decideId[0] = buffer2[0];
                    decideId[1] = buffer2[1];
                     return decideId;
                 }
                else{
                    //se sou lentinho
                    //se eu posso trocar de poke vou selecionar um melhor
                    if(myPokes.length > 1 && alreadySwitched === false){
                    decideId = this.BestSwitchPoke();
                    return decideId;
                    }
                    else{//se nao rola trocar de poke eu vou descter o cacete mesmo
                        console.log("Não preciso trocar, vou mete-le o pau!");
                     //vou usar status negativos ou me bufar
                     buffer2 = this.selectBestStatusMove();
                     if(buffer2 === false){
                    //se nao vou descer a porrada
                    buffer2 = this.selectBestAtk();
                    }
                         decideId[0] = buffer2[0];
                    decideId[1] = buffer2[1];
                     return decideId;
                }

            }
        }

    }

    }

}

export default AndersonBOT001;
