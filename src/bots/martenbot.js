/**
 *
 */
import AI from '../ai';
class Martenbot extends AI {
  constructor() {
    super();
    console.log('building a martenbot');
  }

  onRequest(state) {
    console.log('here.');
  }

}

export default Martenbot;
