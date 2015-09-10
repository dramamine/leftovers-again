/**
 *
 */

export const meta = {
  name: 'martenbot',
  author: 'marten',
  version: 'alpha',
  gametype: 'randombattle',
  description: 'Nothing yet, just logs some crap to the console.'
};

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
