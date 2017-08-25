const Randumb = require('@la/bots/randumb');
const { MOVE, SWITCH } = require('@la/decisions');

const randumb = new Randumb();

describe('Randumb', () => {
  it('picks moves randomly', () => {
    const state = {
      self: {
        active: {
          moves: [{ disabled: false, pp: 99 },
          { disabled: false, pp: 99 },
          { disabled: false, pp: 99 },
          { disabled: false, pp: 99 }]
        }
      }
    };

    for (let i = 0; i < 10; i++) {
      const result = randumb.decide(state);
      expect(result instanceof(MOVE)).toBe(true);
    }
  });

  it('only picks a move that is possible', () => {
    const state = {
      self: {
        active: {
          moves: [{ name: 'a', disabled: true, pp: 99 },
          { name: 'b', disabled: false, pp: 99 },
          { name: 'c', disabled: true, pp: 0 }]
        }
      }
    };

    const result = randumb.decide(state);
    expect(result.id.name).toEqual('b');
  });

  it('picks a new pokemon', () => {
    const state = {
      forceSwitch: [true],
      self: {
        reserve: [{ name: 'foomander', condition: '10/10' },
          { name: 'barizard', condition: '0 fnt' },
          { name: 'bazmelion', condition: '0 fnt' }]
      }
    };
    const result = randumb.decide(state);
    expect(result instanceof(SWITCH)).toBe(true);
    expect(result.id.name).toEqual('foomander');
  });
});
