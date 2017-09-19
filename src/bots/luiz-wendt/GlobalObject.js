const Typechart = require('@la/game/typechart');
const Damage = require('@la/game/damage');
//Damage.getDamageResult(attacker, defender, move)
const Moves = require('@la/data/moves');
const Side = require('@la/model/side');

var Fsm = require("./Base/FSM");

var AnalyzePok = require("./Heuristic/AnalyzePok");



function GlobalObject () {
    this.FSM = new Fsm();
    this.ourPokemons = {};
    this.hitKill = false;
    this.lastTurn = 0;
    this.lastStateTry = {status : "", turn : 0, enem : ""};
    this.lastSwitch = {enemy : "", pok : "", turn : 0};
    this.lastHeal = {turn : 0, pok : ""};

    var PokeDecision = require("./PokeDecision");
    var SwitchState = require("./SwitchState");

    var stateSwitch = SwitchState.state;
    var statePokeDecision = new PokeDecision();


    stateSwitch.addTransition(0,statePokeDecision, function(state) {if(state.forceSwitch) return false; else return true;})

    statePokeDecision.addTransition(100000,stateSwitch, function(state) {
        if(state.forceSwitch){
            return true;
        }
        else
            return false;
        ;})
    statePokeDecision.addTransition(0, stateSwitch, SwitchState.switchTransFunc);

    this.FSM.currentState = statePokeDecision;

}

GlobalObject.prototype.update = function(state){
    var self = state.self;
    var enemy = state.opponent;

    this.lastTurn = state.turn;
    for(var pok in self.reserve) {
        this.ourPokemons[self.reserve[pok].id] = AnalyzePok(self.reserve[pok], enemy, true);
    }

    this.watchHitKill(self, enemy);

    this.enemyMonsAlive = 6;
    for(var i in state.opponent.reserve) {
        if(state.opponent.reserve[i] == null)
            this.enemyMonsAlive--;
        if(state.opponent.reserve[i].dead)
            this.enemyMonsAlive--;
    }

    this.myMonsAlive = 6;
    for(var i in state.self.reserve) {
        if(state.self.reserve[i] == null)
            this.enemyMonsAlive--;
        if(state.self.reserve[i].dead)
            this.myMonsAlive--;
    }

    //console.log("my: " +  this.myMonsAlive +  ", their: " + this.enemyMonsAlive);

}

GlobalObject.prototype.watchHitKill= function(self, enemy){
    if(self.active != null && enemy.active != null) {
        if(this.ourPokemons[self.active.id] == null) {
            this.hitKill = false;
            return false;
        }
        if(enemy.id == null) {
            this.hitKill = false;
            return false;
        }
        this.hitKill = this.ourPokemons[self.active.id].against[enemy.active.id].bestMin >= enemy.active.hp;
    }
    else
        this.hitKill = false;

   /* if(this.hitKill) {
        console.log("Killing " + enemy.id + " " + enemy.active.hp + " with attack " + this.ourPokemons[self.active.id].against[enemy.active.id].min);
    }*/
}


module.exports = GlobalObject;

