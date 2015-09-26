import Damage from '../../src/lib/damage';
// import _ from 'lodash';
import fakemon from '../helpers/fakemon.json';
import uturn from '../helpers/uturn.json';

const damn = new Damage();

describe('damage calculator', () => {
  describe('transformPokemon', () => {
    it('should provide all the fields we need', () => {
      const res = damn.tmpTransformPokemon(
        damn.transformPokemon(fakemon)
      );

      const dmg = damn.getDamageResult(
        res,
        res,
        damn.transformMove(uturn)
      );

      expect(dmg).toBe(jasmine.any(Object));
    });
  });
});

