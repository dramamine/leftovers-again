/**
 * JO
 *
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';
import KO from 'leftovers-again/lib/game/kochance';
import PokeUtil from 'leftovers-again/lib/pokeutil';
//../node_modules/
//var _typechart = require('../node_modules/leftovers-again/lib/data/typechart');

//var _damage = require('../node_modules/leftovers-again/lib/game/damage');
import damage from 'leftovers-again/lib/game/damage'
//var _util = require('../node_modules/leftovers-again/lib/pokeutil');
//var _dex = require('../node_modules/leftovers-again/lib/data/pokedex.json');

/*var dex;
require(['json!../node_modules/leftovers-again/lib/data/pokedex.json'], function(data){
	dex = JSON.parse(data);

});*/

/**
 * Your code is pre-built with a very simple bot that chooses a team, then
 * picks randomly from valid moves on its turn.
 */

	
var kmoves = [];
var init = false;
var plan = [false];
var vstat = false;

class JO {

	atrib(){
		this.abc = 0;
	}
	mean(arr){
		var sum = 0;
		for(var j=0;j<arr.length;++j){
			sum+=arr[j];
		}
		return (sum/arr.length);
	}
	
	initialize(state){
		//search aprty for entry hazard moves
		for(var i=0;i<6;++i){
			for(var j=0;j<state.self.reserve[i].moves.length;++j){
				if(
					state.self.reserve[i].moves[j].id == 'spikes' ||
					state.self.reserve[i].moves[j].id == 'stealthrock' ||
					state.self.reserve[i].moves[j].id == 'toxicspikes' ||
					state.self.reserve[i].moves[j].id == 'stickyweb'
				){
					plan[0] = true;
					plan[1] = i;
					plan[2] = j;
				}/*else if(state.self.reserve[i].moves[j].target == 'self'){
					//if(state.self.reserve[i].moves[j].self != null){
					//if(state.self.reserve[i].moves[j].self.boosts != null){
					//if(state.self.reserve[i].moves[j].boosts != null){
					//if(state.self.reserve[i].moves[j].flags != null)
					if(state.self.reserve[i].moves[j].flags.heal != null){
						console.log("STATUS");
						console.log(state.self.reserve[i].moves[j]);
					}
				}*/
			}
		}
	}
	
	//parameter pokemon1, pokemon2 return bool how much faster 1 is than 2
	quickerThan(src,dst){
		//console.log(PokeUtil.researchPokemonById(src));
		//while(true);
		var spe1 = PokeUtil.researchPokemonById(src).baseStats.spe;
		var spe2 = PokeUtil.researchPokemonById(dst).baseStats.spe;
		//console.log(spe1 + " - " + spe2);
		//while(true);
		//return spe1 > spe2;
		return spe1 - spe2;
	}
		
	
	
	killswap(state,enemy){
		//unknown enemy pokemon
		if(enemy == null){
			//get the first avaliable pokemon
			for(var i=0;i<6;++i){
				if(state.self.reserve[i].dead || state.self.reserve[i].active)
					continue;
				console.log("NO ENEMY");
				return i;
			}
		}
		
		
		var res = [false,false,false,false,false,false];//survavability
		var off = [false,false,false,false,false,false];//damage potential
		var spe = [false,false,false,false,false,false];//speed diference
		
		var resRange = [0.0,5.0,1.0];
		var offRange = [0.0,5.0,1.0];//iverse
		var speRange = [-20,+40,1.0];

//////////survivability
		//min turns to be killed
		for(var j=0;j<enemy.seenMoves.length;++j){//for every known enemy move
			//movedata = true;
			for(var i=0;i<6;++i){//for every pokemon
				if(state.self.reserve[i].dead || state.self.reserve[i].active){
					if(state.self.reserve[i].dead)
						res[i] = "DEAD";
					else
						res[i] = "ACTIVE";//swap
					continue;
				}
				
				var v = damage.getDamageResult(
					enemy, 
					state.self.reserve[i], 
					PokeUtil.researchMoveById(enemy.seenMoves[j])
				);
				
				var odds = KO.predictKO(v,state.self.reserve[i]);
				if(odds.turns == null || odds.chance == null){
					//console.log("null odds");
					//console.log(v);
					continue;
				}
				
				var buf = odds.turns+odds.turns/(odds.chance*2);
				if(!res[i])
					res[i] = buf;
					
				res[i] = Math.min(res[i],buf);
				
			}
		}
		
//////////damage potential
		//min of turns to kill enemy pokemon with best move
		for(var i=0;i<6;++i){//for every pokemon in team
			var min = false;//min turns to KO enemy	
			
			if(state.self.reserve[i].dead || state.self.reserve[i].active){
				off[i] = min;
				continue;
			}
			
			//if the opponent have a active pokemon
			for(var j=0;j<state.self.reserve[i].moves.length;++j){
				var v = damage.getDamageResult(
					state.self.reserve[i], 
					enemy, 
					state.self.reserve[i].moves[j]
				);
				
				var odds = KO.predictKO(v,enemy);
				if(odds.turns == null || odds.chance == null){
					continue;
				}
				
				var buf = odds.turns+odds.turns/(odds.chance*2);
				if(!min)
					min = buf;
				min = Math.min(min,buf);
			}
			off[i] = min;
		}
		
//////////speed
		for(var i=0;i<6;++i){
			if(state.self.reserve[i].dead || state.self.reserve[i].active)
				continue;
			spe[i] = this.quickerThan(
				state.self.reserve[i].id, 
				enemy.id
			);
		}
		
		
		//console.log(0);
		
//////////evaluate data
		var surv = [0.0,0.0,0.0,0.0,0.0,0.0];
		for(var i=0;i<6;++i){
			//console.log("res:" + res[i] + " off:" + off[i] + " spe:" + spe[i] + " : " + state.self.reserve[i].id);
			if(!res[i]){
				res[i] = 1.0;
			}else{
				res[i] = (res[i]-resRange[0])/resRange[1];
			}
			
			if(!off[i]){
				off[i] = 0.0;
			}else{
				off[i] = 1.0-(off[i]-offRange[0])/offRange[1];		
			}
			
			spe[i] = (spe[i]-speRange[0])/speRange[1];		
			
			surv[i] = res[i]*resRange[2]+off[i]*offRange[2]+spe[i]*speRange[2];
			surv[i] = surv[i]/3.0;
			//console.log(surv[i]);
		}
		var best = -1;
		var max = 0.0;
		
		for(var i=0;i<6;++i){
			if(state.self.reserve[i].dead || state.self.reserve[i].active)
				continue;
			if(best == -1){
				best = i;
				max = surv[i];
			}
			
			if(surv[i] > max){
				best = i;
				max = surv[i];
			}
		}
		
		
		return best;
	}
	
	
	
	pickMove(state,enemy){
		var off = [];
		
		var dam = false;
		var sta = false;
		var vst = false;
		var hea = false;
		
		var res = false;
		
		//classify moves
		for(var i=0;i<state.self.active.moves.length;++i){
			if(state.self.active.moves[i].disabled){
				console.log("DISABLED");
				continue;
			}
			var v = damage.getDamageResult(
				state.self.active, 
				enemy, 
				state.self.active.moves[i]
			);
			
			var odds = KO.predictKO(v,enemy);
			if(odds.turns != null && odds.chance != null){
				off[i] = odds.turns+odds.turns/(odds.chance*2);
			}else if(state.self.active.moves[i].volatileStatus != null){
				if(
					state.self.active.moves[i].volatileStatus == 'confusion' || 
					state.self.active.moves[i].volatileStatus == 'yawn'
				){
					off[i] == state.self.active.moves[i].volatileStatus;
					vst = i;
				}
			}else if(state.self.active.moves[i].status != null){
				if(
					state.self.active.moves[i].status == 'par' || 
					state.self.active.moves[i].status == 'psn' || 
					state.self.active.moves[i].status == 'tox' || 
					state.self.active.moves[i].status == 'slp'
				){
					off[i] == state.self.active.moves[i].status;
					sta = i;
				}
			}else if(state.self.active.moves[i].target == 'self'){
				if(state.self.active.moves[i].flags.heal != null){
				//if(state.self.active.moves[i].self.boosts.hp != null){
					off[i] == 'heal';
					hea = i;
				}
			}else{
				off[i] = false;
			}
		}
		
		//get move that kills quicker
		var min = false;
		for(var i=0;i<state.self.active.moves.length;++i){
			if(isNaN(off[i]))
				continue;
			
			if(!dam){
				dam = i;
				min = off[i];
			}
			if(off[i] < dam){
				dam = i;
				min = off[i];
			}
		}
		
		//find out res
		for(var i=0;i<enemy.seenMoves.length;++i){
			var v = damage.getDamageResult(
				enemy, 
				state.self.active, 
				PokeUtil.researchMoveById(enemy.seenMoves[i])
			);			
			var odds = KO.predictKO(v,state.self.active);
			if(odds.turns == null || odds.chance == null)
				continue;
			
			var buf = odds.turns+odds.turns/(odds.chance*2);
			if(!res)
				res = buf;
				
			res = Math.min(res,buf);
		}
		
		//if would kill this turn
		if(off[dam] < 1.2){
			console.log("1HKO");
			return dam;
		}
		
		if(state.self.active.hppct <= 40.0 && hea != false){
			console.log("HEAL");
			return hea;
		}
		
		if(res >= 2 && sta != false){
			if(enemy.statuses != null){
				var use = true;
				for(var i=0;i<enemy.statuses.length;++i){
					if(enemy.statuses[i] == off[sta])
						use = false;
				}
				if(use){
					console.log("STA");
					//while(true);//pause
					return sta;
				}
			}
		}else if(res >= 2 && vst != false){
			if(!vstat || vstat != enemy.id){
				console.log("VOL");
				vstat = enemy.id;
				return vst;
			}
		}
		
		console.log("NOR");
		return dam;
	}
	
	decide(state) { 
		if(!init) this.initialize(state);	
		
		if (state.forceSwitch) {
			var sw = this.killswap(state,state.opponent.active);
			//console.log(state.self.reserve[sw].id);
			return new SWITCH(sw);
		}
		
		var select = this.pickMove(state,state.opponent.active);
		/*if(select != false){
			for(var i=0;i<state.self.active.moves.length;++i)
				console.log(state.self.active.moves[i].id);
			console.log(state.self.active.moves[select].id);
		}*/
		
		if(!select){//no damaging moves
			var sw = this.killswap(state,state.opponent.active);
			if(sw != -1){
				console.log(state.self.reserve[sw].id);
				return new SWITCH(sw);
			}else{
				return new MOVE(getFirst(state.self.active.moves));
			}
		}
		return new MOVE(select);
	}
	
	getFirst(mvs){
		for(var i=0;i<mvs.length;++i){
			if(mvs.disabled)
				continue;
			return i;
		}
		return 0;
	}
	
	_pickOne(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}
}

export default JO;
