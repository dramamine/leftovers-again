import Barn from 'model/pokebarn';

describe('pokebarn', () => {
  let barn;
  beforeEach( () => {
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
    barn.findOrCreate('p1a: Fakechu');
    expect(barn.all().length).toEqual(6);
  });
  describe('find', () => {
    it('should prefer a mon that is not dead', () => {
      barn.allmon[0].dead = true;
      barn.allmon = barn.allmon.slice(0, 2);
      const res = barn.find('p1: Fakechu');
      expect(res.dead).toBeFalsy();
    });
    it('should prefer a mon that is in my position', () => {
      barn.allmon[0].dead = true;
      barn.allmon[2].dead = true;
      barn.allmon[3].position = 'p1a';
      barn.allmon[3].active = true;
      const res = barn.find('p1a: Fakechu');
      expect(res).toEqual(barn.allmon[3]);
    });
  });
});
