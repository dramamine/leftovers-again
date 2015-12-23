import state from '../helpers/randomstate';
import Infodump from '../../src/bots/randombattle/infodump';
const infodump = new Infodump();

fdescribe('Infodump', () => {
  fit('responds with something', () => {
    console.log('was infodump even made?', infodump);
    const res = infodump.getHelp(state);
    expect(res).toBeTruthy();
  });
});
