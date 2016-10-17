import { MOVE, SWITCH } from 'leftovers-again/lib/decisions';
import Typechart from 'leftovers-again/lib/game/typechart';

class Mallis {
    decide(state) {
        var moveValues;
        var reserveValues;
        var mon;
        var move;
        var jsonMoves = require('leftovers-again/lib/data/moves.json');
        var jsonFormats = require('leftovers-again/lib/data/formats.json');
        
        /*//decide if should switch or not
        switchValue = 0;
        
        if(state.forceSwitch || state.teamPreview) {
            switchValue = 5000;
        }
        else {
            for(var i = 0; i < state.opponent.active.types.length; i++) {
                switch (Typechart.compare(state.opponent.active.types[i], state.self.active.types)) {
                        case 0:
                            switchValue -= 20;
                            break;
                        case 0.5:
                            switchValue -= 10;
                            break;
                        case 2:
                            switchValue += 30;
                            break;
                };
            }

            for(var i = 0; i < state.opponent.active.seenMoves.length; i++) {
                var moveID = state.opponent.active.seenMoves[i];
                var type = jsonMoves[moveID].type;

                switch (Typechart.compare(type, state.self.active.types)) {
                        case 0:
                            switchValue -= 20;
                            break;
                        case 0.5:
                            switchValue -= 10;
                            break;
                        case 2:
                            switchValue += 30;
                            break;
                };
            }
        

            if(state.self.active.condition.includes('frz') || state.self.active.condition.includes('slp')) {
               switchValue += 30;
            }

            if(state.self.active.condition.includes('psn') || state.self.active.condition.includes('brn') || state.self.active.condition.includes('tox')) {
                switchValue += 20;
            }
            if(state.self.active.condition.includes('par')) {
                switchValue += 10;
            }

        }*/
        
        //if it is best to switch
        if(this._calculateSwitchValue(state, jsonFormats, jsonMoves) >= 75) {
            mon = this._selectPokemon(state, reserveValues, jsonMoves, jsonFormats);
            
            if(!mon.dead && !mon.disabled && !mon.active) {
                return new SWITCH(mon);
            }
        }
       
        // Decide which move to use
        move = this._selectMove(state, moveValues);
        
        return new MOVE(move);
    }
    
    //add value to move or reserve values array
    _addValue(move, amount, values) {
        values[move] += amount;
    }
    
    //check if opponent may have this ability
    _checkOpponentAbilities(state, ability) {
        if(state.opponent.active.abilities[0] == ability || state.opponent.active.abilities[1] == ability || state.opponent.active.abilities.H == ability) {
            return true;
        }
        return false;
    }
    
    //check if any opponent pokemon may have this ability
    _checkAllOpponentAbilities(state, ability) {
        for(var i = 0; i < state.opponent.reserve.length; i++) {
            if(state.opponent.reserve[i].abilities[0] == ability || state.opponent.reserve[i].abilities[1] == ability || state.opponent.reserve[i].abilities.H == ability) {
                return true;
            }
        }
        return false;
    }
    
    //check if opponent is this type
    _checkOpponentType(state, type) {
        for(var i = 0; i < state.opponent.active.types.length; i++) {
            if(state.opponent.active.types[i] == type) {
                return true;
            }
        }
        return false;
    }
    
    //check if opponent just cast Protect, Detect, King's Shield or Spiky Shield
    _checkOpponentProtected(state, move) {
        if(state.opponent.active.prevMoves[0] == "protect" ||
            state.opponent.active.prevMoves[0] == "detect" ||
            state.opponent.active.prevMoves[0] == "spikyshield" ||
            (move.category == "Status" && state.opponent.active.prevMoves[0] == "kingsshield") ) {
            return true;
        }
        return false;
    }
    
    //check if opponent just cast Magic Coat or has the ability Magic Bounce
    _checkOpponentMagicCoated(state) {
        if(this._checkOpponentAbilities(state, "Magic Bounce") ||
           state.opponent.active.prevMoves[0] == "magiccoat") {
            return true;
        }
        return false;
    }
    
    //check if opponent just cast Snatch
    _checkOpponentSnatching(state) {
        if(state.opponent.active.prevMoves[0] == "snatch") {
            return true;
        }
        return false;
    }
    
    //select best pokemon according to reserve values
    _selectPokemon(state, values, jsonMoves, formats) {
        values = new Array(state.self.reserve.length);
            
        for (var i = 0; i < state.self.reserve.length; i++) {
            values[i] = 0;

            var moni = state.self.reserve[i];

            if(moni.dead == true || moni.active == true || moni.disabled == true) {
                this._addValue(i, -800, values);
            }
            else {
                for(var j = 0; j < state.opponent.active.types.length; j++) {
                    switch(Typechart.compare(state.opponent.active.types[j], moni.types)) {
                        case 0:
                            this._addValue(i, 30, values);
                            break;
                        case 0.5:
                            this._addValue(i, 10, values);
                            break;
                        case 2:
                            this._addValue(i, -30, values);
                            break;
                    };
                }
                
               // var opponentPossibleMoves = this._checkPossibleMoves(state.opponent.active.id, formats);
                
                for(var j = 0; j < state.opponent.active.seenMoves.length; j++) {
                var moveID = state.opponent.active.seenMoves[j];
                var type = jsonMoves[moveID].type;

                switch (Typechart.compare(type, moni.types)) {
                        case 0:
                            this._addValue(i, -10, values);
                            break;
                        case 0.5:
                            this._addValue(i, -10, values);
                            break;
                        case 2:
                            this._addValue(i, 30, values);
                            break;
                };
            }
                if(moni.condition.includes('frz') || moni.condition.includes('slp')) {
                    this._addValue(i, -30, values);
                }

                if(moni.condition.includes('psn') || moni.condition.includes('brn') || moni.condition.includes('tox')) {
                    this._addValue(i, -5, values);
                }
                if(moni.condition.includes('par')) {
                    this._addValue(i, -2, values);
                }
            }
        }

        var higher = -1;
        var higherValue = -1000;

        for(var i = 0; i < 6; i++) {
            if(values[i] > higherValue) {
                higher = i;
                higherValue = values[i];
            }
        }
        
        return state.self.reserve[higher];
    }
    
    //select best move according to move values
    _selectMove(state, values) {
        values = new Array(state.self.active.moves.length);
        var moveValue = 0;
        
        for (var i = 0; i < state.self.active.moves.length; i++) {
            values[i] = 0;
            moveValue = 0;
            
            var movei = state.self.active.moves[i];
            
            if(movei.disabled) {
                moveValue = -1500;
            } 
            if ((movei.flags.nonsky && this._checkOpponentAbilities(state, "Levitate")) ||
                (movei.flags.bullet && this._checkOpponentAbilities(state, "Bulletproof")) ||
                (movei.flags.powder && (this._checkOpponentType(state, "Grass") || this._checkOpponentAbilities(state, "Overcoat"))) ||
                (movei.flags.protect && this._checkOpponentProtected(state, movei)) ||
                (movei.flags.reflectable && this._checkOpponentMagicCoated(state)) ||
                (movei.flags.snatch && this._checkOpponentSnatching(state)) ||
                (movei.flags.sound && this._checkOpponentAbilities(state, "Soundproof")) ) {
                moveValue = -1000;
            }
            else {
                if (movei.basePower > 0) {
                    if (state.self.active.types.indexOf(movei.type) >= 0) {
                       moveValue += 20;
                    }
                    
                    switch (Typechart.compare(movei.type, state.opponent.active.types)) {
                    case 0:
                        moveValue -= 500;
                        break;
                    case 0.5:
                        moveValue += movei.basePower / 3;
                        break;
                    case 2:
                        moveValue += movei.basePower;
                        moveValue += 50;
                        break;
                    default:
                        moveValue += movei.basePower / 2;
                        break;
                    };
                    
                    if(movei.self == true && movei.flags.heal == true) {
                        if(state.self.active.hppct <= 33) {
                            moveValue += 250;
                        }
                        else {
                            moveValue += 50;
                        }
                    }
                } //if movei.basepower > 0
                else {
                    if(movei.self == true ) {
                        if(movei.flags.heal == true) {
                            if(state.self.active.hppct <= 33) {
                                moveValue += 250;
                            }
                            else {
                                moveValue -= 250;
                            }
                        } //movei.flags.heal   
                    }//movei.self
                    
                    if(movei.category == "Status" && movei.target == 'normal') {
                        if(!state.opponent.active.condition.includes(movei.status) ||
                            (!(movei.id == 'yawn' && state.opponent.active.condition.includes('slp'))) ||
                            (!(movei.id == 'attract' && (state.opponent.active.gender == state.self.active.gender || typeof(state.opponent.active.gender) == "undefined"))) ||
                            (!(movei.id == 'stealthrock' && (state.opponent.side['stealthrock'] != null))) ) {
                            
                            if(movei.volatileStatus != 'yawn' && movei.volatileStatus != 'attract' && ('volatileStatus' in movei)) {
                                moveValue -= 500;
                            }
                            
                            switch(Typechart.compare(movei.type, state.opponent.active.types)) {
                                case 0:
                                    moveValue -= 500;
                                    break;
                                case 0.5:
                                    if(movei.status == 'slp') {
                                        moveValue += 50;
                                    }
                                    break;
                                case 2:
                                    if(movei.status == 'slp') {
                                        moveValue += 250;
                                    }
                                    break;
                                default:
                                    if(movei.status == 'slp') {
                                        moveValue += 100;
                                    }
                                    break;
                                    
                            };
                        }
                        
                        for(var j = 0; j < state.self.active.prevMoves.length; j++) {
                            if(state.self.active.prevMoves[j] == movei.id) {
                                moveValue -= 40 + (100 / j);
                            }
                        }
                    }
                }
                
            } //for
            
            //add value to move
            this._addValue(i, moveValue, values)
        }
        
        //select move with higher value
        var higher = -1;
        var higherValue = -100000;
        
        for(var i = 0; i < state.self.active.moves.length; i++) {
            if(values[i] > higherValue) {
                higher = i;
                higherValue = values[i];
            }
        }
        
        return state.self.active.moves[higher];
    }
    
    //calculate the value of switching pokemon
    _calculateSwitchValue(state, formats, moves) {
        var switchValue = 0;
        var opponentPossibleMoves = this._checkPossibleMoves(state.opponent.active.id, formats)
        
        if(state.forceSwitch || state.teamPreview) {
            switchValue = 5000;
        }
        else {
            
            if(state.self.active.condition.includes('slp')) {
                switchValue += 100;
            }
            
            for(var i = 0; i < opponentPossibleMoves.length; i++) {
                var moveID = opponentPossibleMoves[i];

                switch(Typechart.compare(moves[moveID].type, state.self.active.types)) {
                    case 0:
                        switchValue -= 20;
                        break;
                    case 0.5:
                        switchValue -= 10;
                        break;
                    case 2:
                        switchValue += 25;
                        break;
                    default:
                        //switchValue += moves[moveID].basePower / 3;
                        break;
                };
            }
        }
        return switchValue;
    }
    
    _checkPossibleMoves(pokemon, formats) {
        var possibleMoves = formats[pokemon].randomBattleMoves;
        
        return possibleMoves;
    }
}

export default Mallis;