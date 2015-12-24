import state from '../helpers/randomstate';
import Infodump from '../../src/bots/randombattle/infodump';
const infodump = new Infodump();

describe('Infodump', () => {
  it('responds with something', () => {
    const res = infodump.getHelp(state);
    expect(res).toBeTruthy();
  });
  it('should mention that my water type is weak against opp\'s electric', () => {
    const res = infodump.getHelp(state);
    const mine = res.switches.find(mon => mon.species === 'Seaking');

    expect(mine.weakness).toBe(true);
    expect(mine.strength).toBe(false);
  });
  it('should mention that my electric type is neutral against opp\'s electric', () => {
    const res = infodump.getHelp(state);
    const mine = res.switches.find(mon => mon.species === 'Eelektross');

    expect(mine.weakness).toBe(false);
    expect(mine.strength).toBe(false);
  });
  it('should mention that my ground/flying type is strong & weak against opp\'s electric', () => {
    const res = infodump.getHelp(state);
    console.log('my switches:');
    console.log(JSON.stringify(res.switches));
    const mine = res.switches.find(mon => mon.species === 'Landorus');

    expect(mine.weakness).toBe(true);
    expect(mine.strength).toBe(true);
  });
});
