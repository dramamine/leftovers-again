	 import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';

	 import Typechart from 'leftovers-again/lib/game/typechart';

	 var _ = require("underscore");
	 var damagingMoves = ["return", "grassknot", "lowkick", "gyroball", "heavyslam"];

		//retorna verdadeiro se o alvo é imune
	 	function checkImune(source, target) {
			var myType = source.type || source;
			var targetType = target.getTypes && target.types || target.types || target;
			
			if (Array.isArray(targetType)) {
				for (var i = 0; i < targetType.length; i++) {
					if (!checkImune(myType, targetType[i])) return true;
				}
				return false;
			}
			var resMove = Typechart.compare(myType, targetType);
			if (resMove == 0) return true;
			return false;
		};

		//retorna 1 se superefetivo, -1 se não muito efetivo e 0 se for dano normal;
		function checkEffect(source, target) {

				var myType = source.type || source;
				var totalPrior = 0;
				var targetType = target.getTypes && target.types || target.types || target;

				if (Array.isArray(targetType)) {
					for (var i = 0; i < targetType.length; i++) {
						totalPrior += checkEffect(myType, targetType[i]);
					}
					return totalPrior;
				}
				

				
				var resMove = Typechart.compare(myType, targetType);
				if (!resMove) return 0;
				if (resMove == 0.5) return -1;
				else if (resMove == 2) return 1;
				else return 0;
			};
		
		//retorna a prioridade deste pokemon na troca
		//estratégia defensiva, prefere receber menos dano do que dar mais
		function tP(estado, pokemon) {
			var oppPokemon = estado.opponent.active;
			var myPokemon = estado.self.reserve[pokemon.id];
				
			//5 se for imune aos dois tipos
			if(_.all(oppPokemon.types, function(type) {
				return checkImune(type, myPokemon.types);
			})) {
				return 5;
			}
			//4 se resistir aos dois tipos
			if(_.all(oppPokemon.types, function(type) {
				return checkEffect(type, myPokemon) < 0 || checkImune(type, myPokemon.types);
			})) {
				return 4;
			}
			//3 se for combate neutro
			if(_.all(oppPokemon.types, function(type) {
				return checkEffect(type, myPokemon) <= 0 || checkImune(type, myPokemon.types);
			})) {
				return 3;
			}
			//2 se for super efetivo
			if(_.any(myPokemon.moves, function(move) {
				console.log(checkEffect(move, oppPokemon));
				return checkEffect(move, oppPokemon) > 0 &&
				(moveData.basePower > 0 || damagingMoves.indexOf(move.id) >= 0) &&
				!checkImune(moveData.type, oppPokemon.types);
			})) {
				return 2;
			}
			return 0;
		};

		//retorna a prioridade dos ataques do pokemon ativo
		function mP(estado, move) {
			var myPokemon = estado.self.active;
			var oppPokemon = estado.opponent.active;

			var moveData;
			
			_.each(myPokemon.moves, function(tempMove)	{
				if (tempMove.id == move.id) moveData = tempMove;
			});
		

			//prioridade maior para enfraquecer ataques inimigos
			var enfraq = ["reflect","lightscreen","tailwind"];
			if(enfraq.indexOf(move.id) >= 0) {
				return 12;
			}

			//Efeitos que afetam o campo de batalha
			//Referencia: http://bulbapedia.bulbagarden.net/wiki/List_of_moves_that_cause_entry_hazards
			
			var entryHazards = ["stealthrock","spikes","toxicspikes","stickyweb"];
			if(entryHazards.indexOf(move.id) >= 0) {
				return 11;
			}

			//Moves que causam DPS
			if(move.category === "Status" && move.statuses && !oppPokemon.statuses) {
				return 10;
			}

			//Movimentos de cura (Só é aplicado caso o hp esteja abaixo de 50%)
			var recovery = ["softboiled", "recover", "synthesis", "moonlight", "morningsun"];
			if(recovery.indexOf(move.id) >= 0 && myPokemon.hp * 2 < myPokemon.maxhp) {
				return 9;
			}

			//Checa se, além de superefetivo, recebe bonus de ataque, ou seja, o tipo do ataque é do mesmo tipo do pokemon
			if(checkEffect(moveData, oppPokemon) > 0 &&
				(moveData.basePower > 0 || damagingMoves.indexOf(move.id) >= 0) &&
				myPokemon.types.indexOf(moveData.type) >= 0 &&
				checkImune(moveData.type, oppPokemon.types)) {
				return 8;
		}

			//Movimentos superefetivos que não recebem bonus de ataque
			if(checkEffect(moveData, oppPokemon) > 0 &&
				(moveData.basePower > 0 || damagingMoves.indexOf(move.id) >= 0) &&
				checkImune(moveData.type, oppPokemon.types)) {
				return 7;
		}

			//Movimento normal com bonificação de ataque
			if(checkEffect(moveData, oppPokemon) === 0 &&
				(moveData.basePower > 0 || damagingMoves.indexOf(move.id) >= 0) &&
				myPokemon.types.indexOf(moveData.type) >= 0 &&
				checkImune(moveData.type, oppPokemon.types)) {
				return 6;
		}

			//Movimento normal
			if(checkEffect(moveData, oppPokemon) === 0 &&
			  (moveData.basePower > 0 || damagingMoves.indexOf(move.id) >= 0) &&
				checkImune(moveData.type, oppPokemon.types)) {
				return 1;
		}
			return 0;

		};

		function getP(estado, escolha) {			
			if(escolha.type === "switch")
				return tP(estado, escolha);
			else
				return mP(estado, escolha);
		};

		function escolhasPossiveis(estado)	{
			var escolhas = [];
			_.each(estado.self.active.moves, function(move) {
						if (!move.disabled) {
							escolhas.push({
								"type": "move",
								"id": move.id
							});
						}
					});
			
			var trapped = (estado.self.active) ? (estado.self.active.trapped || estado.self.active.maybeTrapped) : false;
			var troca = estado.forceSwitch || !trapped;
			
			if (troca) {
				_.each(estado.self.reserve, function(pokemon, index) {
						if (pokemon.condition.indexOf("fnt") < 0 && !pokemon.active) {
							escolhas.push({
								"type": "switch",
								"id": index
							});
						}
					});
				}

				return escolhas;
		};
		  
		function tomarDecisao(estado, escolhas){
			var e = _.max(escolhas, function(opt) {
				var p = getP(estado, opt);
				opt.prior = p;
				return p;
			});
			
			return {
				type: e.type,
				id: e.id,
				prior: e.prior
			};
		  }
		  
		  function _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
			 
	 class PokeTest {
		decide(state) { 
			var escolhas = escolhasPossiveis(state);
			var ef = tomarDecisao(state, escolhas);
	
			if (ef.type === "switch") 
				{						
					var myMon = state.self.reserve[ef.id];
					return new SWITCH(myMon);
				}
			else {
				
				var myMove;
				
				_.any(state.self.active.moves, function(move)
				{
					if (ef.id == move.id) myMove = move;
				});
				if (!myMove) _pickOne(state.self.active.moves.filter( move => !move.disabled ));
				
				return new MOVE(myMove);
			}
		}		  
}

	export default PokeTest;
