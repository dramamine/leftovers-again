const Log = require('@la/log');
const Infodump = require('@la/bots/infodump');
const state = require('../helpers/randomstate');

const infodump = new Infodump();

describe('Infodump', () => {
  beforeEach(() => {
    spyOn(Log, 'info');
    spyOn(Log, 'error');
    spyOn(Log, 'log');
  });
  it('responds with something', () => {
    const res = infodump.getHelp(state);
    expect(res).toBeTruthy();
  });
  it('should mention that my water type is weak against opp\'s electric', () => {
    const res = infodump.getHelp(state);
    const seaking = res.switches.find(mon => mon.species === 'Seaking');

    expect(seaking.weakness).toBe(true);
    expect(seaking.strength).toBe(false);
    expect(seaking.yourBest.name).toEqual('thunderbolt');
  });
  it('should mention that my electric type is neutral against opp\'s electric', () => {
    const res = infodump.getHelp(state);
    const elektross = res.switches.find(mon => mon.species === 'Eelektross');

    expect(elektross.weakness).toBe(false);
    expect(elektross.strength).toBe(false);
  });
  it('should mention that my ground/flying type is strong & weak against opp\'s electric', () => {
    const res = infodump.getHelp(state);
    const landorus = res.switches.find(mon => mon.species === 'Landorus');

    expect(landorus.weakness).toBe(true);
    expect(landorus.strength).toBe(true);
    expect(landorus.myBest.name).toBe('earthpower');
  });
});
