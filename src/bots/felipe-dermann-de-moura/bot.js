/**
 * PokeTest
 *
 */
import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';

//state 0 is analyze, analyzes the situation and change states accordingly
//state 1 is attack, pokemon is in a good position to attack freely
//state 2 is defend, pokemon is at disadvantage and needs to fight carefully
//state 3 is critical, pokemon is below half health
var monState = 0; 
var myMove; //selected move
var ChangePokemon = false; //if I should switch mons or not

//multipliers for each move
var multiplier0 = 0;
var multiplier1 = 0;
var multiplier2 = 0;
var multiplier3 = 0;

var chosenMove = null; // which move was selected
var enemyMon = null; //stores information of current mon the opponent has to see if he switched mons

var opponentDamage = 0; //damage multiplier of opponent's types compared to mine
var myDamage = 0; //damage multiplier of my mon's types compared to opponents
var useStatusMove = 0; //determines when pokemon uses status move
var canHeal = false; //check if pokemon has healing move
var injured = false; //check if mon entered critical state already
var previousEnemyMoveMultiplier = 0; //the multiplier of the opponent's last move, to see if opponent has a powerful move that my mon is very weak against

class PokeTest {

   

  decide(state) {
      myMove = null; // reset my move
      
      //  if(myvariable > 1)ChangePokemon = true;
      
      if(ChangePokemon){
          state.forceSwitch = true;
          ChangePokemon = false;
      }
      
      // switch mon
      if(state.forceSwitch == true){
      var myMon = this._pickOne(state.self.reserve.filter(mon => !mon.dead && !mon.active));
	 
          
     // try to select a good pokemon
      for(var i = 0; i < 6; i++){
          if(state.self.reserve[i] != undefined && state.self.reserve[i] != null){
              if(state.self.reserve[i].dead != true && state.self.reserve[i].active != true && state.self.reserve[i].disabled != true){
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
        
      if(myMon != null && myMon != undefined){
        if(myMon.disabled == true || myMon.dead == true || myMon.active == true){
            myMon = this._pickOne(state.self.reserve.filter(mon => !mon.dead && !mon.active));
        }         
      }
      return new SWITCH(myMon);
      }

      
      //check if enemy switched pokemon
      if(enemyMon != state.opponent.active.species[0])
      {
          monState = 0;
          injured = false;
          enemyMon = state.opponent.active.species[0];
      }
      
      //=====================================state switching======================================================//
      
      //==========ANALYZE===========//
      if(monState == 0)
      {
        opponentDamage = Typechart.compare(state.opponent.active.types[0],state.self.active.types[0]);
        myDamage = Typechart.compare(state.self.active.types[0],state.opponent.active.types[0]); 
          
        //get opponent and my damage and change state accordingly  
        if(opponentDamage > 1 && myDamage <= 1)
        {
            monState = 0;
            useStatusMove = 0;
            ChangePokemon = true;
        }
        if(opponentDamage <= 1 && myDamage > 1) monState = 1
        if(opponentDamage > 1 && myDamage > 1) monState = 1;
        if(opponentDamage <= 1 && myDamage <= 1) monState = 2;
            
        //switch mon if opponent will deal 4 times the damage    
        if(opponentDamage >= 4) 
        {
            monState = 0;
            ChangePokemon = true;
        }
            
             //get the multiplier of each move
             multiplier0 = Typechart.compare(state.self.active.moves[0].type,state.opponent.active.types[0]);
             multiplier1 = Typechart.compare(state.self.active.moves[1].type,state.opponent.active.types[0]);
             multiplier2 = Typechart.compare(state.self.active.moves[2].type,state.opponent.active.types[0]);
             multiplier3 = Typechart.compare(state.self.active.moves[3].type,state.opponent.active.types[0]);
      }
      
      //go to critical mode if below half health
      if(state.self.active.hp < state.self.active.maxhp/2 && !injured)
      {
          monState = 3;
          useStatusMove = 0;
          injured = true;
      }
          
      //==========ATTACKING===========//
      if(monState == 1)
       {  
           if(useStatusMove < 3)
           {
             if(state.self.active.moves[0] != null && state.self.active.moves[0] != undefined)if(multiplier0 > multiplier1 && multiplier0 > multiplier2 && multiplier0 > multiplier3 && state.self.active.moves[0] != null && state.self.active.moves[0] != undefined && state.self.active.moves[0].Category != "Status") chosenMove = 0; 
             if(state.self.active.moves[1] != null && state.self.active.moves[1] != undefined)if(multiplier1 > multiplier0 && multiplier1 > multiplier2 && multiplier1 > multiplier3 && state.self.active.moves[1] != null && state.self.active.moves[1] != undefined && state.self.active.moves[1].Category != "Status") chosenMove = 1; 
             if(state.self.active.moves[2] != null && state.self.active.moves[2] != undefined)if(multiplier2 > multiplier1 && multiplier2 > multiplier0 && multiplier2 > multiplier3 && state.self.active.moves[2] != null && state.self.active.moves[2] != undefined && state.self.active.moves[2].Category != "Status") chosenMove = 2; 
             if(state.self.active.moves[3] != null && state.self.active.moves[3] != undefined)if(multiplier3 > multiplier1 && multiplier3 > multiplier2 && multiplier3 > multiplier0 && state.self.active.moves[3] != null && state.self.active.moves[3] != undefined && state.self.active.moves[3].Category != "Status") chosenMove = 3; 
           }
     
           useStatusMove += 1;
           //after attacking 3 turns, check if mon has a status move to use
            if(useStatusMove > 3)
           {
               for(var i = 0; i <= 3; i++)
                   {
                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                    {
                       if(state.self.active.moves[i].Category == "Status")
                        {
                           for(var i = 0; i <= 3; i++)
                            {
                                if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                                    {
                                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined && state.self.active.moves[i].Category == "Status") chosenMove = i;     
                                    }
                             }
                        }
                    }
                   }
           }
               //if no status move available, just attack normally
               else
                {
                     if(state.self.active.moves[0] != null && state.self.active.moves[0] != undefined)if(multiplier0 > multiplier1 && multiplier0 > multiplier2 && multiplier0 > multiplier3 && state.self.active.moves[0] != null && state.self.active.moves[0] != undefined && state.self.active.moves[0].Category != "Status") chosenMove = 0; 
                     if(state.self.active.moves[1] != null && state.self.active.moves[1] != undefined)if(multiplier1 > multiplier0 && multiplier1 > multiplier2 && multiplier1 > multiplier3 && state.self.active.moves[1] != null && state.self.active.moves[1] != undefined && state.self.active.moves[1].Category != "Status") chosenMove = 1; 
                     if(state.self.active.moves[2] != null && state.self.active.moves[2] != undefined)if(multiplier2 > multiplier1 && multiplier2 > multiplier0 && multiplier2 > multiplier3 && state.self.active.moves[2] != null && state.self.active.moves[2] != undefined && state.self.active.moves[2].Category != "Status") chosenMove = 2; 
                     if(state.self.active.moves[3] != null && state.self.active.moves[3] != undefined)if(multiplier3 > multiplier1 && multiplier3 > multiplier2 && multiplier3 > multiplier0 && state.self.active.moves[3] != null && state.self.active.moves[3] != undefined && state.self.active.moves[3].Category != "Status") chosenMove = 3;        
                }
               useStatusMove = 0;
           
           //if opponent can deal moderate or high damage...
           if(opponentDamage >= 1)
            {
            //use defensive move if previous enemy attack is one of these (they take one turn to charge so the mon will be able to block them successfully)
                if(state.opponent.active.prevMoves[0] != undefined && state.opponent.active.prevMoves[0] != null)
                {
                     if(state.opponent.active.prevMoves[0].name == "Solar Beam" || state.opponent.active.prevMoves[0].name == "Bounce" || state.opponent.active.prevMoves[0].name == "Solar Blade" || state.opponent.active.prevMoves[0].name == "Dig" || state.opponent.active.prevMoves[0].name == "Fly" || state.opponent.active.prevMoves[0].name == "Freeze Shock" || state.opponent.active.prevMoves[0].name == "Ice Burn" || state.opponent.active.prevMoves[0].name == "Freeze Shock" || state.opponent.active.prevMoves[0].name == "Phantom Force" || state.opponent.active.prevMoves[0].name == "Razor Wind" || state.opponent.active.prevMoves[0].name == "Shadow Force" || state.opponent.active.prevMoves[0].name == "Skull Bash" || state.opponent.active.prevMoves[0].name == "Sky Attack" || state.opponent.active.prevMoves[0].name == "Sky Drop")
                     {
                    
                         for(var i = 0; i <= 3; i++)
                         {
                              for(var i = 0; i <= 3; i++)
                                {
                                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                                        {
                                        if(state.self.active.moves[i].name == "Detect" || state.self.active.moves[i].name == "Protect" || state.self.active.moves[i].name == "Spiky Shield" || state.self.active.moves[i].name == "Mat Block" || state.self.active.moves[i].name == "King's Shield") 
                                              {
                                                chosenMove = i;
                                              }
                                        }
                                }
                         }
                    }
                }
            }
             
       }
      
      //==========DEFEND===========//
      if(monState == 2)//defend, use buffs and status moves on the first turns and attacks afterwards
      {
           if(useStatusMove > 2)
           {
             if(state.self.active.moves[0] != null && state.self.active.moves[0] != undefined)if(multiplier0 > multiplier1 && multiplier0 > multiplier2 && multiplier0 > multiplier3 && state.self.active.moves[0] != null && state.self.active.moves[0] != undefined && state.self.active.moves[0].Category != "Status") chosenMove = 0; 
             if(state.self.active.moves[1] != null && state.self.active.moves[1] != undefined)if(multiplier1 > multiplier0 && multiplier1 > multiplier2 && multiplier1 > multiplier3 && state.self.active.moves[1] != null && state.self.active.moves[1] != undefined && state.self.active.moves[1].Category != "Status") chosenMove = 1; 
             if(state.self.active.moves[2] != null && state.self.active.moves[2] != undefined)if(multiplier2 > multiplier1 && multiplier2 > multiplier0 && multiplier2 > multiplier3 && state.self.active.moves[2] != null && state.self.active.moves[2] != undefined && state.self.active.moves[2].Category != "Status") chosenMove = 2; 
             if(state.self.active.moves[3] != null && state.self.active.moves[3] != undefined)if(multiplier3 > multiplier1 && multiplier3 > multiplier2 && multiplier3 > multiplier0 && state.self.active.moves[3] != null && state.self.active.moves[3] != undefined && state.self.active.moves[3].Category != "Status") chosenMove = 3; 
           }
          
           if(useStatusMove <= 2)
           {
               for(var i = 0; i <= 3; i++)
                   {
                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                    {
                       if(state.self.active.moves[i].Category == "Status")
                        {
                           for(var i = 0; i <= 3; i++)
                            {
                                if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                                    {
                                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined && state.self.active.moves[i].Category == "Status") chosenMove = i;     
                                    }
                             }
                        }
                    }
                   }
           }
               //if no status move available, just attack normally
              // else
                {
                     if(state.self.active.moves[0] != null && state.self.active.moves[0] != undefined)if(multiplier0 > multiplier1 && multiplier0 > multiplier2 && multiplier0 > multiplier3 && state.self.active.moves[0] != null && state.self.active.moves[0] != undefined && state.self.active.moves[0].Category != "Status") chosenMove = 0; 
                     if(state.self.active.moves[1] != null && state.self.active.moves[1] != undefined)if(multiplier1 > multiplier0 && multiplier1 > multiplier2 && multiplier1 > multiplier3 && state.self.active.moves[1] != null && state.self.active.moves[1] != undefined && state.self.active.moves[1].Category != "Status") chosenMove = 1; 
                     if(state.self.active.moves[2] != null && state.self.active.moves[2] != undefined)if(multiplier2 > multiplier1 && multiplier2 > multiplier0 && multiplier2 > multiplier3 && state.self.active.moves[2] != null && state.self.active.moves[2] != undefined && state.self.active.moves[2].Category != "Status") chosenMove = 2; 
                     if(state.self.active.moves[3] != null && state.self.active.moves[3] != undefined)if(multiplier3 > multiplier1 && multiplier3 > multiplier2 && multiplier3 > multiplier0 && state.self.active.moves[3] != null && state.self.active.moves[3] != undefined && state.self.active.moves[3].Category != "Status") chosenMove = 3;       
                }
           
            //whenever one of these moves is available, use it, as they make the pokemon invulnerable for one turn
            if(useStatusMove > 2)
            {
              for(var i = 0; i <= 3; i++)
              {
                                for(var i = 0; i <= 3; i++)
                                {
                                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                                        {
                                          if(state.self.active.moves[i].name == "Dig" || state.self.active.moves[i].name == "Bounce" || state.self.active.moves[i].name == "Fly" || state.self.active.moves[i].name == "Dive" || state.self.active.moves[i].name == "Sky Drop" || state.self.active.moves[i].name == "Shadow Force" || state.self.active.moves[i].name == "Phantom Force") 
                                                  {
                                                    chosenMove = i;
                                                  }
                                        }
                                }
              }
            }
          
         //use defensive move if previous enemy attack is one of these (they take one turn to charge so the mon will be able to block them successfully)
                if(state.opponent.active.prevMoves[0] != undefined && state.opponent.active.prevMoves[0] != null)
                {
                     if(state.opponent.active.prevMoves[0].name == "Solar Beam" || state.opponent.active.prevMoves[0].name == "Bounce" || state.opponent.active.prevMoves[0].name == "Solar Blade" || state.opponent.active.prevMoves[0].name == "Dig" || state.opponent.active.prevMoves[0].name == "Fly" || state.opponent.active.prevMoves[0].name == "Freeze Shock" || state.opponent.active.prevMoves[0].name == "Ice Burn" || state.opponent.active.prevMoves[0].name == "Freeze Shock" || state.opponent.active.prevMoves[0].name == "Phantom Force" || state.opponent.active.prevMoves[0].name == "Razor Wind" || state.opponent.active.prevMoves[0].name == "Shadow Force" || state.opponent.active.prevMoves[0].name == "Skull Bash" || state.opponent.active.prevMoves[0].name == "Sky Attack" || state.opponent.active.prevMoves[0].name == "Sky Drop")
                     {
                    
                         for(var i = 0; i <= 3; i++)
                         {
                              for(var i = 0; i <= 3; i++)
                                {
                                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                                        {
                                        if(state.self.active.moves[i].name == "Detect" || state.self.active.moves[i].name == "Protect" || state.self.active.moves[i].name == "Spiky Shield" || state.self.active.moves[i].name == "Mat Block" || state.self.active.moves[i].name == "King's Shield") 
                                              {
                                                chosenMove = i;
                                              }
                                        }
                                }
                         }
                    }
                }
              
          //reset the status move variable after a few turns
          if(useStatusMove > 4) useStatusMove = 0;
          
          useStatusMove += 1;
        
      }
      
      //==========CRITICAL===========//
      if(monState == 3)//mon is in critical state, below half health
          {
             //uses the same status move variable to heal once and then attack afterwards 
             if(useStatusMove <= 1)
             for(var i = 0; i <= 3; i++)
             {
                if(state.self.active.moves[i] != undefined && state.self.active.moves[i] != null && (state.self.active.moves[i].name == "Rest" || state.self.active.moves[i].name == "Heal Order" || state.self.active.moves[i].name == "Milk Drink" || state.self.active.moves[i].name == "Moon Light" || state.self.active.moves[i].name == "Morning Sun" || state.self.active.moves[i].name == "Recover" || state.self.active.moves[i].name == "Roost" || state.self.active.moves[i].name == "Slack Off" || state.self.active.moves[i].name == "Soft-Boiled" || state.self.active.moves[i].name == "Synthesis" || state.self.active.moves[i].name == "Giga Drain" || state.self.active.moves[i].name == "Mega Drain" || state.self.active.moves[i].name == "Synthesis" ||  state.self.active.moves[i].name == "Horn Leech" ||  state.self.active.moves[i].name == " Parabolic Charge" || state.self.active.moves[i].name == "Oblivion Wing" || state.self.active.moves[i].name == "Ingrain") )
                {
                    canHeal = true;
                    chosenMove = i;
                }
             
                 //if no healing move available then do something else
                 if(canHeal == false)
                 {
                      for(var i = 0; i <= 3; i++)
                      {
                        if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined && (state.self.active.moves[i].name == "Spiky Shield" || state.self.active.moves[i].name == "Doom Desire" || state.self.active.moves[i].name == "Future Sight" || state.self.active.moves[i].name == "King's Shield" || state.self.active.moves[i].name == "Destiny Bond" || state.self.active.moves[i].name == "Curse" || state.self.active.moves[i].name == "Perish Song" || state.self.active.moves[i].name == "Final Gambit" || state.self.active.moves[i].name == "Explosion" || state.self.active.moves[i].name == "Self-Destruct") )
                            {
                                chosenMove = i;
                            }
                           
                      }
                 }
             }
              //attack after 2 turns of status skills
              if(useStatusMove > 1)
                  {
                     if(state.self.active.moves[0] != null && state.self.active.moves[0] != undefined)if(multiplier0 > multiplier1 && multiplier0 > multiplier2 && multiplier0 > multiplier3 && state.self.active.moves[0] != null && state.self.active.moves[0] != undefined && state.self.active.moves[0].Category != "Status") chosenMove = 0; 
                     if(state.self.active.moves[1] != null && state.self.active.moves[1] != undefined)if(multiplier1 > multiplier0 && multiplier1 > multiplier2 && multiplier1 > multiplier3 && state.self.active.moves[1] != null && state.self.active.moves[1] != undefined && state.self.active.moves[1].Category != "Status") chosenMove = 1; 
                     if(state.self.active.moves[2] != null && state.self.active.moves[2] != undefined)if(multiplier2 > multiplier1 && multiplier2 > multiplier0 && multiplier2 > multiplier3 && state.self.active.moves[2] != null && state.self.active.moves[2] != undefined && state.self.active.moves[2].Category != "Status") chosenMove = 2; 
                     if(state.self.active.moves[3] != null && state.self.active.moves[3] != undefined)if(multiplier3 > multiplier1 && multiplier3 > multiplier2 && multiplier3 > multiplier0 && state.self.active.moves[3] != null && state.self.active.moves[3] != undefined && state.self.active.moves[3].Category != "Status") chosenMove = 3; 
                  }

                //use defensive move if previous enemy attack is one of these (they take one turn to charge so the mon will be able to block them successfully)
                if(state.opponent.active.prevMoves[0] != undefined && state.opponent.active.prevMoves[0] != null)
                {
                    if(state.opponent.active.prevMoves[0].name == "Solar Beam" || state.opponent.active.prevMoves[0].name == "Bounce" || state.opponent.active.prevMoves[0].name == "Solar Blade" || state.opponent.active.prevMoves[0].name == "Dig" || state.opponent.active.prevMoves[0].name == "Fly" || state.opponent.active.prevMoves[0].name == "Freeze Shock" || state.opponent.active.prevMoves[0].name == "Ice Burn" || state.opponent.active.prevMoves[0].name == "Freeze Shock" || state.opponent.active.prevMoves[0].name == "Phantom Force" || state.opponent.active.prevMoves[0].name == "Razor Wind" || state.opponent.active.prevMoves[0].name == "Shadow Force" || state.opponent.active.prevMoves[0].name == "Skull Bash" || state.opponent.active.prevMoves[0].name == "Sky Attack" || state.opponent.active.prevMoves[0].name == "Sky Drop")
                     {
                    
                         for(var i = 0; i <= 3; i++)
                         {
                              for(var i = 0; i <= 3; i++)
                                {
                                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                                        {
                                        if(state.self.active.moves[i].name == "Detect" || state.self.active.moves[i].name == "Protect" || state.self.active.moves[i].name == "Spiky Shield" || state.self.active.moves[i].name == "Mat Block" || state.self.active.moves[i].name == "King's Shield") 
                                              {
                                                chosenMove = i;
                                              }
                                        }
                                }
                         }
                    }
                }
     
              canHeal = false;
              
              //increase variable each turn
                useStatusMove += 1;

                 //go back to analyze if you managed to recover health
                 if(state.self.active.hp >= state.self.active.maxhp/2)
                     {
                         monState = 0;
                         useStatusMove = 0;
                         injured = false;
                     }
              //resets the variable to use status moves again if battle takes too long while in critical
              if(useStatusMove > 4) useStatusMove = 0;
     
          }

          //check if pokemon is afflicted by sleep to use sleep talk and snore      
          if(state.self.active.statuses['slp']) 
              {
                   for(var i = 0; i <= 3; i++)
                          {
                               for(var i = 0; i <= 3; i++)
                                {
                                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                                        {
                                         if(state.self.active.moves[i].name == "Sleep Talk" || state.self.active.moves[i].name == "Snore") chosenMove = i;
                                        }
                                }
                          }
              }
 
          //check if pokemon is frozen to use thaw moves
          if(state.self.active.statuses['frz']) 
              {
                   for(var i = 0; i <= 3; i++)
                          {
                              for(var i = 0; i <= 3; i++)
                                {
                                    if(state.self.active.moves[i] != null && state.self.active.moves[i] != undefined)
                                        {
                                            if(state.self.active.moves[i].name == "Flame Wheel" || state.self.active.moves[i].name == "Flare Blitz" || state.self.active.moves[i].name == "Fusion FLare" || state.self.active.moves[i].name == "Sacred Fire" || state.self.active.moves[i].name == "Scald" || state.self.active.moves[i].name == "Steam Eruption"){
                                                 chosenMove = i;
                                            }
                                        }
                                }
                          }
              }      
              
          //gives the chosen move to the move command
          myMove = state.self.active.moves[chosenMove];
          /*if(state.self.active.moves[chosenMove] != undefined && state.self.active.moves[chosenMove] != null)*/ //myMove = //this._pickOne(state.self.active.moves.filter(move=> !move.disabled)); 
          myMove = this._pickOne(state.self.active.moves.filter(move=> !move.disabled)); 

          //get the multiplier of opponent's last move
          if(state.opponent.active.prevMoves[0] != null && state.opponent.active.prevMoves[0] != undefined) 
              {
                previousEnemyMoveMultiplier = Typechart.compare(state.opponent.active.prevMoves[0].type,state.self.active.types[0]);
              }
          //switch pokemon if the multiplier of the last opponent move means that he has a move that my pokemon is weak against
          if(previousEnemyMoveMultiplier > 2)
              {
                    monState = 0;
                    ChangePokemon = true;
              }

          return new MOVE(myMove);        
      
  }
  // randomly chooses an element from an array
  _pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default PokeTest;