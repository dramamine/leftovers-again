/**
 * LawpokeBot
 *
 */
const {MOVE, SWITCH} = require('@la/decisions');

const Typechart = require('@la/game/typechart');

var State = require("./Base/State");

var GlobalObject = require("./GlobalObject");

class LawpokeBot {


  decide(state) {

      if(this.global == null){
          //console.log(state.turn  + "mudei");

          this.testeID = Math.random();
          this.global = new GlobalObject;
          /*
          for(var i in global.OurPokemons){
              if(global.OurPokemons[i].haveProtect)
                  console.log("Have Protected in " + i);
          }

          for(var i in global.OurPokemons){
              if(global.OurPokemons[i].haveHazard)
                  console.log("Have Hazard in " + i);
          }

          this.global.update(state);

          for(var i in state.self.reserve) {
              for(var j in state.opponent.reserve) {
                  console.log(state.self.reserve[i].id + " against " + state.opponent.reserve[j].id + " = " + this.global.ourPokemons[state.self.reserve[i].id].against[state.opponent.reserve[j].id].typeDefending)

              }
          }
             */
      }

      if(this.global == null) {
          console.error("uepa");
      }
      this.global.update(state);

      if(state.forceSwitch){
           console.log("Has to force switch");
      }



      var retorno = -404;
      do {
          retorno = this.global.FSM.update(state, this.global);
          console.log(retorno);


      } while(retorno == -404);

     // console.log(this.testeID);



      return retorno;

  }
}

module.exports = LawpokeBot;
