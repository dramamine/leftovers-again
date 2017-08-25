const Barn = require('@la/model/pokebarn');
const Log = require('@la/log');

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
  it('should work with mons with colons in their name', () => {
    const mon = barn.findOrCreate('p1a: Type: Fake');
    expect(barn.all().length).toEqual(7);
    expect(mon.ident).toEqual('p1: Type: Fake');
  });
});
