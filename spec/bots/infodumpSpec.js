import state from '../helpers/randomstate';
import Infodump from '../../src/bots/randombattle/infodump';
const infodump = new Infodump();

describe('Infodump', () => {
  it('responds with something', () => {
    const res = infodump.getHelp(state);
    expect(res).toBeTruthy();
  });
});
