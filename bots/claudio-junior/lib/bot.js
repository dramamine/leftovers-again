import Typechart from 'leftovers-again/lib/game/typechart';

import {MOVE, SWITCH} from 'leftovers-again/lib/decisions';

var _damage = require('leftovers-again/lib/game/damage');
var _damage2 = _interopRequireDefault(_damage);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class pirata1010 {

 
  decide(state) {
	  
	   var _jatrocou = false;
    

		
       if (state.forceSwitch) {  //se pokemon morreu ou for preciso mudar
        
        var _melhorPok = 0;//melhor pokemon 
		var _melhorPok2 = 0;// segundo melhor pokemon
		var _idPok = 0; // id do melhor pokemon
        

        for(var i = 0; i < 5;i++){ // percorre a lista 
                _melhorPok = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); // tipo do pokemon
                if(state.self.reserve[i].dead == true){ // está morto
                    _melhorPok = 0;
                }
                if(_melhorPok > _melhorPok2){ // testa se o atual é melhor do que o melhor atual
                   _melhorPok2 = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); // se for melhor seta o novo melhor atual
                   _idPok = i; // seta o id 
               }
        }
         return new SWITCH(_idPok);
    }
      
   
    var _melhorPok = 0;//melhor pokemon 
	var _melhorPok2 = 0;// segundo melhor pokemon
	var _idPok = 0; // id do melhor pokemon
	
	
	if(_jatrocou =  false){
		
		for(var i = 0; i < 6; i++){
		
		if(Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types) >= 1){
			
			_melhorPok = Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); //guardar o nvl de ser melhor 
			
			    if(state.self.reserve[i].dead == true){ // está morto
                    _melhorPok = 0;
                }
			
			if(_melhorPok > _melhorPok2){// se o melhor for melhor que o segundo
				
				_melhorPok2 =  Typechart.compare(state.self.reserve[i].types[0], state.opponent.active.types); 
				
				_idPok = i;//guarda o id do melhor
			}
			
		}else{
			_idPok = i;//guarda o id do melhor
			
	}


		}
		
	 _jatrocou = true; 
	return new SWITCH(_idPok);
	
 
	}
	
	if(state.self.active.dead == true){
		
		_jatrocou = false;
	}
    
  var p = 0;
       var p2 = 0;
       var pmelhor = 0;
       var est = [];
      
       for(var i = 0; i < 4;i++){ // 
            
            try {
                est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move);
            } catch (e) {
             
            }
             //poder = Typechart.compare(state.self.active.moves[i], state.opponent.active.types); // compara o movimento com o tipo do inimigo
            if (state.self.active.moves[i].disable == true){
            } else {
                if(state.self.active.moves[i].basePower < 50){ 
                    p = -5;
                }else {
                    if(est[0] > p2){ // testa se o atual 
                        p2 = est[0]; // se for seta
                        pmelhor = i; // seta o id 
                    }
                }
             }
      }      
      return new MOVE(pmelhor);
  
}
}

export default pirata1010;



