import BattleStore from 'model/battlestore';
import util from 'pokeutil';
import Barn from 'model/pokebarn';

let store;

describe('BattleStore', () => {
  beforeEach( () => {
    store = new BattleStore();
    spyOn(util, 'researchPokemonById').and.returnValue({});
  });

  describe('barn integration', () => {
    beforeEach( () => {
      for (let i = 0; i < 6; i++) {
        const res = store.barn.create('p1: Fakechu');
        res.order = i;
      }
    });
    it('should handle my pokemon fainting', () => {
      store.myId = 'p1';
      const killed = store.barn.findByOrder(0, 'p1a: Fakechu');
      killed.active = true;

      store.handleFaint('p1a: Fakechu');

      const res = store.data();
      expect(res.self.active.length).toBe(0);
      expect(res.self.reserve.filter(mon => mon.dead).length).toBe(1);
      expect(res.self.reserve.filter(mon => !mon.dead).length).toBe(5);
    });
  });
  describe('handleRequest', () => {
    it('should set a mon to active', () => {
      store.barn = new Barn();
      store.handleRequest('{"active":[{"moves":[{"move":"Brave Bird","id":"bravebird","pp":24,"maxpp":24,"target":"any","disabled":false}]}],"side":{"name":"5nowden1535","id":"p2","pokemon":[{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"318/318","active":true,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"0 fnt","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"}]},"rqid":17}');
      let res = store.data();
      expect(res.self.active).toBeTruthy();
      expect(res.self.reserve.filter(mon => mon.dead).length).toBe(1);
      expect(res.self.reserve.filter(mon => !mon.dead).length).toBe(5);

      // subsequent request
      store.handleRequest('{"forceSwitch": [true], "active":[{"moves":[{"move":"Brave Bird","id":"bravebird","pp":24,"maxpp":24,"target":"any","disabled":false}]}],"side":{"name":"5nowden1535","id":"p2","pokemon":[{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"0 fnt","active":true,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"0 fnt","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"}]},"rqid":17}');
      const active = store.barn.all().find(mon => mon.active);
      active.position = 'p2a';
      res = store.data();
      console.log(res);
      expect(res.self.active.length).toBe(0);
      expect(res.self.reserve.filter(mon => mon.dead).length).toBe(2);
      expect(res.self.reserve.filter(mon => !mon.dead).length).toBe(4);

      // set someone to active
      store.handleSwitch('p2a: Talonflame', 'Talonflame, L83, M', '310/318');
      res = store.data();
      expect(res.self.active).toBeTruthy();
      expect(res.self.active.hp).toEqual(310);
      expect(res.self.active.level).toEqual(83);
      expect(res.self.active.position).toEqual('p2a');
      expect(res.self.reserve.filter(mon => mon.dead).length).toBe(2);
      expect(res.self.reserve.filter(mon => !mon.dead).length).toBe(4);

      // store.handleRequest('{"active":[{"moves":[{"move":"Brave Bird","id":"bravebird","pp":24,"maxpp":24,"target":"any","disabled":false}]}],"side":{"name":"5nowden1535","id":"p2","pokemon":[{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"310/318","active":true,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"0 fnt","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, F","condition":"0 fnt","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"},{"ident":"p2: Talonflame","details":"Talonflame, M","condition":"318/318","active":false,"stats":{"atk":219,"def":199,"spa":205,"spd":195,"spe":309},"moves":["bravebird"],"baseAbility":"galewings","item":"","pokeball":"pokeball"}]},"rqid":17}');
      // res = store.data();
      // expect(res.self.active).toBeTruthy();
      // console.log(res);
      // expect(res.self.reserve.filter(mon => mon.dead).length).toBe(2);
      // expect(res.self.reserve.filter(mon => !mon.dead).length).toBe(4);
    });
  });
  describe('_handleSwitch', () => {
    it('should switch into a pokemon we havent seen', () => {
      store.myId = 'p2';
      store.barn.create('p1a: Fakechu');
      store.handleSwitch('p1a: Guardechu', 'Guardechu, L1', '1/1');
      const result = store.data();
      expect(result.opponent.active.species).toEqual('guardechu');
    });
    it('should switch the order', () => {
      for (let i = 0; i < 2; i++) {
        const res = store.barn.create('p1: Fakechu');
        res.order = i;
        if (i === 0) res.position = 'p1a';
      }
      store.barn.all()[0].useCondition('0 fnt');
      store.handleSwitch('p1a: Fakechu', 'Fakechu, L1', '1/1');

      const dead = store.barn.all().find(mon => mon.hp === 0);
      const active = store.barn.all().find(mon => mon.active);

      expect(active.order).toBe(0);
      expect(dead.order).toBe(1);
    });
  });
});
