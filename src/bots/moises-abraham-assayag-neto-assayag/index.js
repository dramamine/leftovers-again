/**
 * PokeTest
 *
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';

var AttackBehaviour = 1; // 0 choosing stabby attack // 1 choosing effect attack 
var myMove;
var LastEnemyHP = 1000;
var LastEnemyPokemon = null;
var NotEffectiveTimes = 0;
var ChangePokemon = false;
var WeakCounter = 0;
var HealTries = 0;
class PokeTest {

   

  decide(state) {
      myMove = null; // reset my move
      
      
      if(ChangePokemon){
          state.forceSwitch = true;
          ChangePokemon = false;
      }
      
      
      if(state.forceSwitch == true){
      var myMon = this._pickOne(state.self.reserve.filter(mon => !mon.dead && !mon.active)); // Pick a random Pokemon just to make sure we will return one and initialise the var
	  
     // try to select a good pokemon
      for(var i = 0; i < 6; i++){
          if(state.self.reserve[i] != undefined){
              if(state.self.reserve[i].dead != true && state.self.reserve[i].active != true && state.self.reserve[i].disabled != true){ // Check my pokemons that are either good or not too bad against the opponent
                  if(Typechart.compare(state.self.reserve[i].types[0],state.opponent.active.types[0]) > 1){
                      myMon = state.self.reserve[i];
                  }
                  if(Typechart.compare(state.self.reserve[i].types[0],state.opponent.active.types[1]) > 1){
                      myMon = state.self.reserve[i];
                  }
                  if(Typechart.compare(state.self.reserve[i].types[1],state.opponent.active.types[0]) > 1){
                      myMon = state.self.reserve[i];
                  }
                  if(Typechart.compare(state.self.reserve[i].types[1],state.opponent.active.types[1]) > 1){
                      myMon = state.self.reserve[i];
                  }
              }
          }
      }
    if(myMon.disabled == true || myMon.dead == true || myMon.active == true){
        myMon = this._pickOne(state.self.reserve.filter(mon => !mon.dead && !mon.active));
    }  
      
      return new SWITCH(myMon);
      }
          
    
      
    // check if pokemon needs healing
    if(HealTries <= 0){
        
    if(state.self.active.hppct < 50){ // a Hope
        
        
     for(var i = 0; i < 4; i++){
            if(state.self.active.moves[i].disabled != true){
                if(state.self.active.moves[i].id != undefined){
                    if (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id){
                        if(state.self.active.moves[i].name == "Rest" || state.self.active.moves[i].name == "Heal Order" || state.self.active.moves[i].name == "Milk Drink" || state.self.active.moves[i].name == "Moon Lightr" || state.self.active.moves[i].name == "Morning Sun" || state.self.active.moves[i].name == "Recover" || state.self.active.moves[i].name == "Roost" || state.self.active.moves[i].name == "Slack Off" || state.self.active.moves[i].name == "Soft-Boiled" || state.self.active.moves[i].name == "Synthesis"){
                            HealTries = 3; // do not repeat a healt try more than once in 3 turns
                            myMove = state.self.active.moves[i];
                            break;
                        }
                    }
                }
            }
    }
        
    }
        
    }else{
        HealTries -= 1;
    }
    
    if(AttackBehaviour == 0){  // 0 choosing stabby attack 
        var Multiplier1 = 0.0;
        var Multiplier2 = 0.0;
        var LastGreaterMultiplier = 0;
        var AuxMultiplier = 0;
        var Chosen = -4;
        for(var i = 0; i < 4; i++){ // Choose attack with greater multiplier among them
            if(state.self.active.moves[i].disabled != true && state.self.active.moves[i].category != "Status" && state.self.active.moves[i].id != undefined && (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id) ){
                
                if(state.opponent.active.types[1] == undefined){ // if typechart bugs and we cannot effectively know if the attack will be effective
                    AttackBehaviour = 1; // choosing effect attack
                    console.log("FOUND");
                    console.log("FOUND");
                }
                
                
                AuxMultiplier = Typechart.compare(state.self.active.moves[i].type,state.opponent.active.types[0]);
                
                if(AuxMultiplier > Multiplier1){
                    Multiplier1 = AuxMultiplier;
                }
                AuxMultiplier = Typechart.compare(state.self.active.moves[i].type,state.opponent.active.types[1]);
                if(AuxMultiplier > Multiplier2){
                    Multiplier2 = AuxMultiplier;
                }
                
                if(Multiplier1 > LastGreaterMultiplier){
                    LastGreaterMultiplier = Multiplier1;
                    Chosen = i;
                }
                if(Multiplier2 > LastGreaterMultiplier){
                    LastGreaterMultiplier = Multiplier2;
                    Chosen = i;
                }
                
                if(Multiplier1 == 2 || Multiplier2 == 2){
                    Chosen = i;
                    break;
                }
                
                
           }
        }
        
       
        myMove = state.self.active.moves[Chosen];
        
    }
    
   
      
    if(AttackBehaviour == 1){  // choosing effect attack
        
        // HP draining
        for(var i = 0; i < 4; i++){
            if(state.self.active.moves[i].disabled != true){
                if(state.self.active.moves[i].id != undefined){
                    if (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id){
                        if(state.self.active.moves[i].name == "Absorb" || state.self.active.moves[i].name == "Mega Drain" || state.self.active.moves[i].name == "Giga Drain" || state.self.active.moves[i].name == "Lovely Kiss" || state.self.active.moves[i].name == "Drain Punch" || state.self.active.moves[i].name == "Draining Kiss" || state.self.active.moves[i].name == "Dream Eater" || state.self.active.moves[i].name == "Horn Leech" || state.self.active.moves[i].name == "Leech Life" || state.self.active.moves[i].name == "Leech Seed" || state.self.active.moves[i].name == "Oblivion Wing" || state.self.active.moves[i].name == "Parabolic Charge"){
                            myMove = state.self.active.moves[i];
                            break;
                        }
                    }
                }
            }
        }
        // check for sleep effect
        for(var i = 0; i < 4; i++){
            if(state.self.active.moves[i].disabled != true){
                if(state.self.active.moves[i].id != undefined){
                    if (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id){
                        if(state.self.active.moves[i].name == "Lovely Kiss" || state.self.active.moves[i].name == "Grass Whistle" || state.self.active.moves[i].name == "Hypnosis" || state.self.active.moves[i].name == "Dark Void" || state.self.active.moves[i].name == "Relic Song" || state.self.active.moves[i].name == "Secret Power" || state.self.active.moves[i].name == "Sing" || state.self.active.moves[i].name == "Sleep Power" || state.self.active.moves[i].name == "Spore" || state.self.active.moves[i].name == "Yawn"){
                            myMove = state.self.active.moves[i];
                            break;
                        }
                    }
                }
            }
        }
        
        // check for confused effect
        for(var i = 0; i < 4; i++){
            if(state.self.active.moves[i].disabled != true){
                if(state.self.active.moves[i].id != undefined){
                    if (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id){
                        if(state.self.active.moves[i].name == "Confusion" || state.self.active.moves[i].name == "Chatter" || state.self.active.moves[i].name == "Confuse Ray" || state.self.active.moves[i].name == "Confusion" || state.self.active.moves[i].name == "Dizzy Punch" || state.self.active.moves[i].name == "Dynamic Punch" || state.self.active.moves[i].name == "Flatter" || state.self.active.moves[i].name == "Hurricane" || state.self.active.moves[i].name == "Psybeam" || state.self.active.moves[i].name == "Rock Climb" || state.self.active.moves[i].name == "Shadow Panic" || state.self.active.moves[i].name == "Signal Beam" || state.self.active.moves[i].name == "Supersonic" || state.self.active.moves[i].name == "Swagger" || state.self.active.moves[i].name == "Sweet Kiss" || state.self.active.moves[i].name == "Teeter Dance" || state.self.active.moves[i].name == "Water Pulse"){
                            myMove = state.self.active.moves[i];
                            break;
                        }
                    }
                }
            }
        }
                           
                           
       // check for poison                    
        for(var i = 0; i < 4; i++){
            if(state.self.active.moves[i].disabled != true){
                if(state.self.active.moves[i].id != undefined){
                    if (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id){
                        if(state.self.active.moves[i].name == "Smog" || state.self.active.moves[i].name == "Poison Jab" || state.self.active.moves[i].name == "Poison Fang" || state.self.active.moves[i].name == "Toxic" || state.self.active.moves[i].name == "Toxic Spikes" || state.self.active.moves[i].name == "Smog" || state.self.active.moves[i].name == "Sludge" || state.self.active.moves[i].name == "Sludge Bomb" || state.self.active.moves[i].name == "Gunk Shot" || state.self.active.moves[i].name == "Poison Sting"){
                            myMove = state.self.active.moves[i];
                            break;
                        }
                    }
                }
            }
        }                   
                           
        // check for burn 
        for(var i = 0; i < 4; i++){
            if(state.self.active.moves[i].disabled != true){
                if(state.self.active.moves[i].id != undefined){
                    if (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id){
                        if(state.self.active.moves[i].name == "Blaze Kick" || state.self.active.moves[i].name == "Sacred Fire" || state.self.active.moves[i].name == "Inferno" || state.self.active.moves[i].name == "Confusion" || state.self.active.moves[i].name == "Will-O-Wisp"){
                            myMove = state.self.active.moves[i];
                            break;
                        }
                    }
                }
            }
        }
        
        
        
        // check for paralyzed effect
        for(var i = 0; i < 4; i++){
            if(state.self.active.moves[i].disabled != true){
                if(state.self.active.moves[i].id != undefined){
                    if (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id){
                        if(state.self.active.moves[i].name == "Body Slam" || state.self.active.moves[i].name == "Bolt Strike" || state.self.active.moves[i].name == "Bounce" || state.self.active.moves[i].name == "Discharge" || state.self.active.moves[i].name == "Dragon Breath" || state.self.active.moves[i].name == "Lovely" || state.self.active.moves[i].name == "Force Palm" || state.self.active.moves[i].name == "Fling" || state.self.active.moves[i].name == "Glare" || state.self.active.moves[i].name == "Freeze Shock" || state.self.active.moves[i].name == "Lick" || state.self.active.moves[i].name == "Nuzzle" || state.self.active.moves[i].name == "Shadow Bolt" || state.self.active.moves[i].name == "Spark" || state.self.active.moves[i].name == "Stun Spore" || state.self.active.moves[i].name == "Thunder" || state.self.active.moves[i].name == "Thunder Fang" || state.self.active.moves[i].name == "Thuder Punch" || state.self.active.moves[i].name == "Thunder Shock" || state.self.active.moves[i].name == "Thunder Wave" || state.self.active.moves[i].name == "Thunderbolt" || state.self.active.moves[i].name == "Tri Attack" || state.self.active.moves[i].name == "Volt Tackle" || state.self.active.moves[i].name == "Zap Cannon"){
                            myMove = state.self.active.moves[i];
                            break;
                        }
                    }
                }
            }
        }
        
        
        AttackBehaviour = 0; // back to stabby attacks
                           
    }  
    
   
      
      
    // check if current pokemon is not weak against the current one
      var Weak = false;
      if(WeakCounter <= 0){
       
        if(state.opponent.active != undefined && state.self.active != undefined){
      
       if(Typechart.compare(state.self.active.types[0],state.opponent.active.types[0]) < 1){
          Weak = true;
       }
        
       if(Typechart.compare(state.self.active.types[0],state.opponent.active.types[1]) < 1){
          Weak = true;
       }
      if(Typechart.compare(state.self.active.types[1],state.opponent.active.types[0]) < 1){
          Weak = true;
       }
      if(Typechart.compare(state.self.active.types[1],state.opponent.active.types[1]) < 1){
          Weak = true;
       }
    
        }
          
      }else{
          WeakCounter -= 1;
      }
      
      if(Weak){
          ChangePokemon = true; // request a pokemon change
          WeakCounter = 4;
      }
      
      
     // register some useful data
    if(LastEnemyPokemon == null){
        LastEnemyPokemon = state.opponent.active;
        LastEnemyHP = state.opponent.active.hp;
    }
    if(LastEnemyPokemon != state.opponent.active){
        LastEnemyPokemon = state.opponent.active;
        LastEnemyHP = state.opponent.active.hp;
        NotEffectiveTimes = 0;
    }
    if(LastEnemyHP - state.opponent.active.hp <= 30){
        NotEffectiveTimes += 1;
    }
    if(NotEffectiveTimes > 2){ // if the attack is not being effective
        NotEffectiveTimes = 0;
        //ChangePokemon = true;
        AttackBehaviour = 1; // choose a special effect attack
        
    }
    LastEnemyHP = state.opponent.active.hp;
      
    
      
    if(state.self.active.hppct < 10 && state.self.active.hppct > 15){ // last Hope
        
      console.log("LAST HOPE");
      console.log("LAST HOPE");
        
     for(var i = 0; i < 4; i++){
            if(state.self.active.moves[i].disabled != true){
                if(state.self.active.moves[i].id != undefined){
                    if (state.self.active.prevMoves[i-1] != state.self.active.moves[i].id || state.self.active.prevMoves[i-2] != state.self.active.moves[i].id){
                        if(state.self.active.moves[i].name == "Rest" || state.self.active.moves[i].name == "Destiny Bond"){
                            myMove = state.self.active.moves[i];
                            break;
                        }
                    }
                }
            }
    }
        
    }
      
    // safety measure
    if(myMove == null){
        myMove = this._pickOne(state.self.active.moves.filter( move => !move.disabled));
    }
    
      
    return new MOVE(myMove);
    
  
      
  }
  // randomly chooses an element from an array
  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }



}

export default PokeTest;
