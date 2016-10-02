import Barn from 'leftovers-again/model/pokebarn';
import Log from 'leftovers-again/log';

describe('pokebarn', () => {
  let barn;
  beforeEach(() => {
    barn = new Barn();
    for (let i = 0; i < 6; i++) {
      const res = barn.create('p1: Fakechu');
      res.order = i;
    }
  });
  it('should manage a normal game', () => {
    barn.findOrCreate('p2: Fakeizard');
    expect(barn.all().length).toEqual(7);
  });
  it('should handle self switching', () => {
    spyOn(Log, 'error');
    barn.findOrCreate('p1a: Fakechu');
    expect(barn.all().length).toEqual(6);
    expect(Log.error).toHaveBeenCalled();
  });
});
