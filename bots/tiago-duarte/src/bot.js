import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Pokemon from 'leftovers-again/lib/model/pokemon';
import Typechart from 'leftovers-again/lib/game/typechart';

//var damagingMoves = ["return", "grassknot", "lowkick", "gyroball", "heavyslam"];

var MyState = {
    Alive: 'Alive',
    Dead: 'Dead',
    CheckActivePokemon: 'CheckActivePokemon',
    CheckReservePokemons: 'CheckReservePokemons',
};
//estado inicial setado fora para não ficar chamando toda hora.
var ActiveState = MyState.Alive;
var needChange = false;

class PokeTest {

    decide(state)
    { 
        //recebe o turno atual
        var turn = this;
        //recebe o atual pokemon oponente
        var oppPoke = state.opponent.active;

        //troca forcada
        if (state.forceSwitch)
        {
            //trata como morto mesmo se foi uma saida sem morrer forçada pelo adversário(não faz diferença aqui, não posso pega-lo de volta imediatamente).
            ActiveState = MyState.Dead;
        }

        if(ActiveState == MyState.Alive)
        {
            //situação de entrada
            //sempre irá pender para checarMove, sempre será a preferencia
            if(needChange == false)
                ActiveState = MyState.CheckActivePokemon;

            //se eu não for efetivo contra o pokemon, troca
            else if(needChange == true)
                ActiveState = MyState.CheckReservePokemons;
        }
        else if(ActiveState == MyState.Dead)
        {
            //situação de entrada
            ActiveState = MyState.CheckReservePokemons;
        }

        if(ActiveState == MyState.CheckActivePokemon)
        {
            //situação de entrada
            const myMove = this._checkActivePokemon(state.self.active, oppPoke, turn);
            if(myMove < 0.5 && state.self.active.hp < state.self.active.maxhp*0.7)
            {
                ActiveState = MyState.Alive;
                needChange = true;
                console.log("VAMOS TER QUE TROCAR!");
            }
            return new MOVE(myMove);
        }
        else if(ActiveState == MyState.CheckReservePokemons)
        {
            //situação de entrada
            //chama a funcao de trocar poke passando como parametro meus pokes reservas vivos e o pokemon oponente para testar eficácias
            //essa funcao retorna o valor que será usado para myMon
            const myMon = this._checkReservePokemons(state.self.reserve.filter( mon => !mon.dead ), oppPoke);
            return new SWITCH(myMon);
        }
    }

    _checkActivePokemon(myPoke, oppPoke, turn)
    {
        var maxDamage = -1;
        var bestMove = -1;
        var status = false;
        //array criado com moves conhecidos que fazem recover de vida e dao bonus de side effects para o meu pokemon.
        var recovery = ["softboiled", "recover", "synthesis", "moonlight", "morningsun"];
        var helpfulSideEffects = ["swordsdance"]; //"lightscreen"

        myPoke.moves.forEach(function (move, index)
        {
            if (move.disabled)
            {
                maxDamage = -1;
                return;
            }
            //testa se o move é do tipo Status, que aplica no inimigo um side effect. Se o inimigo não tiver o side effect que o meu move aplica, eu uso ele. caso contrario, uso outro golpe.
            if(move.category === "Status" && !oppPoke.statuses) {
                bestMove = index;
                status = true;
                console.log("USEI MOVE PARA APLICAR STATUS NO INIMIGO!");
            }
                //Move de recover se a vida está muito baixa.
            else if(recovery.indexOf(move.id) >= 0 && myPoke.hp * 2 < myPoke.maxhp) {
                bestMove = index;
                status = true;
                console.log("USEI MOVE DE RECOVER!");
            }
                //parecido com anteriores, teste para não usar o move se eu já possuo seu boost.
            else if(helpfulSideEffects.indexOf(move.id) >= 0 && !myPoke.boosts) {
                bestMove = index;
                status = true;
                console.log("USEI MOVE DE SIDE EFFECT PARA MIM!!");
            }

            else if (!status)
            {
                var cdd;
                try {
                    cdd = Typechart.compare(move.type, oppPoke.types);
                    //console.log("COEFICIENTE DE DANO: " +  cdd);
                } catch (e) {
                    //console.log(e);
                    //console.log(state.self.active, state.opponent.active, move);
                }
                if(move.category !== "Status") //se chegou até aqui é pra dar porrada!
                {
                    if (cdd >= maxDamage)
                    {
                        maxDamage = cdd;
                        bestMove = index;
                        console.log("BEST ATTACK MOVE SELECTED!");
                    }
                }
            }
        });
        //situação de saida(sempre para MyState.Alive)
        ActiveState = MyState.Alive;
        return bestMove;
    }




    /////////////change pokemon
    _checkReservePokemons(myPokes, oppPoke)
    {
        var maxDamage = -1;
        var bestPoke = -1;

        //for que passa por todos os moves dos meus pokemons reservas e escolhe o que possui a melhor eficácia contra o atual oponente
        myPokes.forEach(function (poke, index)
        {
            poke.moves.forEach(function(move, moveIndex)
            {
                var cdd;
                try {
                    cdd = Typechart.compare(move.type, oppPoke.types);
                    //console.log("COEFICIENTE DE DANO DO NOVO POKE: " +  cdd);
                } catch (e) {
                    //console.log(e);
                    //console.log(state.self.active, state.opponent.active, move);
                }
                if(move.category !== "Status") //no momento de trocar me interessa o pokemon mais efetivo no combate contra o oponente.
                {
                    if (cdd >= maxDamage)
                    {
                        maxDamage = cdd;
                        bestPoke = index;
                    }
                }
            });
        });
        //situação de saida(sempre para MyState.Alive)
        ActiveState = MyState.Alive;
        needChange = false;
        console.log("BEST POKEMON SELECTED AGAINST OPPONENT!");
        return myPokes[bestPoke];
    }
}
export default PokeTest;