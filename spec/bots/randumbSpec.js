import Randumb from '../../src/bots/randumb';
const randumb = new Randumb();

describe('Randumb', () => {
  it('picks moves randomly', () => {
    const state = {
      active: {
        moves: [{ disabled: false, pp: 99 },
        { disabled: false, pp: 99 },
        { disabled: false, pp: 99 },
        { disabled: false, pp: 99 }]
      }
    };

    for (let i = 0; i < 10; i++) {
      const result = randumb.onRequest(state);
      expect(result.indexOf('/move ')).toEqual(0);
      const moveId = result.split('/move ').pop();
      expect(moveId).toBeGreaterThan(0);
      expect(moveId).toBeLessThan(5);
    }
  });

  it('only picks a move that is possible', () => {
    const state = {
      active: {
        moves: [{ disabled: false, pp: 99 },
        { disabled: true, pp: 99 },
        { disabled: true, pp: 0 },
        { disabled: false, pp: 0 }]
      }
    };

    const result = randumb.onRequest(state);
    expect(result).toEqual('/move 1');
  });

  it('picks a new pokemon', () => {
    const state = {
      forceSwitch: [true],
      side: {
        pokemon: [{ name: 'foomander', condition: '10/10' },
        { name: 'barizard', condition: '10/10 par' },
        { name: 'foomander', condition: '0 fnt' },
        { name: 'barizard', condition: '0 fnt' }]
      }
    };

    for (let i = 0; i < 10; i++) {
      const result = randumb.onRequest(state);
      expect(result.indexOf('/choose ')).toEqual(0);
      const choiceId = result.split('/choose ').pop();
      expect(choiceId).toBeGreaterThan(0);
      expect(choiceId).toBeLessThan(3);
    }
  });
});
