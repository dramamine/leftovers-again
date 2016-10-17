function getChanceOfEffectiveness(state, status, move) {
    var enem = state.opponent.active;
    
    
    for(var i in enem.statuses) {
        if(enem.statuses[i] == status)
            return 0;
    }
    
    if(state.opponent.side){
        if(state.opponent.side["safeguard"])
            return 0;
    }
    
    if(move.id == 'leechseed') {
        if(state.opponent.active.types[0] == 'Grass')
            return 0;
        else if(state.opponent.active.types[1]) {
            if(state.opponent.active.types[1] == 'Grass')
                return 0;
        }
    }
    
    if(move.id == 'spore') {
        if(state.opponent.active.types[0] == 'Grass')
            return 0;
        else if(state.opponent.active.types[1]) {
            if(state.opponent.active.types[1] == 'Grass')
                return 0;
        }
        
        if(enem.ability) {
            if(enem.ability == "Overcoat") {
                return 0;
            }
        }
        
    }
    
    if(enem.prevMoves) {
        if(enem.prevMoves[0] == "substitute") {
            return 0;
        }
        if(enem.prevMoves.length > 2){
            if(enem.prevMoves[1] == "substitute") {
                return 0;
            }
        }
    }
    
    if(enem.ability) {
        if(enem.ability == "Magic Bounce") { // Ability that bounces the status back to our pokemon
            return 0;
        }
        else if (enem.ability == "Water Veil") {
            if(status == 'brn')
                return 0;
        }
        else if (enem.ability == "Insomnia") {
            if(status == 'slp')
                return 0;
        }
        else if (enem.ability == "Vital Spirit") {
            if(status == 'slp')
                return 0;
        }
        else if (enem.ability == "Sweet Veil") {
            if(status == 'slp')
                return 0;
        }
        else if (enem.ability == "Early Bird") {
            if(status == 'slp')
                return 0;
        }
        else if (enem.ability == "Magma Armor") {
            if(status == 'frz')
                return 0;
        }
        else if (enem.ability == "Limber") {
            if(status == 'par')
                return 0;
        }
        else if (enem.ability == "Immunity") {
            if(status == 'psn' || status == 'tox')
                return 0;
        }
        else if (enem.ability == "Toxic Boost") {
            if(status == 'psn' || status == 'tox')
                return 0;
        }
        else if (enem.ability == "Poison Heal") {
            if(status == 'psn' || status == 'tox')
                return 0;
        }
        else if (enem.ability == "Synchronize") {
            if(status == 'brn' || status == 'psn' || status == 'tox' || status == 'par' )
                return 0;
        }

    }
    for(var i in enem.types) {
        var t = enem.types[i];
        if(t == 'Fire') {
            if(status == 'brn')
                return 0;
        }
        else if(t == 'Ice') {
            if(status == 'frz')
                return 0;
        }
        else if(t == 'Poison') {
            if(status == 'psn')
                return 0;
            if(status == 'tox')
                return 0;
        }
        else if(t == 'Steel') {
            if(status == 'psn')
                return 0;
            if(status == 'tox')
                return 0;
        }
    }
    
    
    return 1;
}


module.exports = getChanceOfEffectiveness;