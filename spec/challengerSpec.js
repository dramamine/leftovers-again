import Challenger from 'challenger';

let challenger;

describe('challenger', () => {
  beforeEach( () => {
    challenger = new Challenger(false, {
      format: 'anythinggoes',
      accepts: 'anythinggoes'
    });
  });
  afterEach( () => {
    if (challenger.timer) clearTimeout(challenger.timer);
  });
  describe('onUserJoin', () => {
    it('should add a user to the users list', () => {
      challenger.onUserJoin(['slodeth']);
      expect(challenger.users.slodeth).toEqual('active');
      challenger.onUserJoin([' pikachu ']);
      expect(challenger.users.pikachu).toEqual('active');
    });
    it('should update an inactive user', () => {
      challenger.users.slodeth = 'inactive';
      challenger.onUserJoin(['slodeth']);
      expect(challenger.users.slodeth).toEqual('active');
    });
    it('should not set self to active', () => {
      challenger.users.slodeth = 'self';
      challenger.onUserJoin(['slodeth']);
      expect(challenger.users.slodeth).toEqual('self');
    });
  });
  describe('onUserLeave', () => {
    it('should set a user to inactive', () => {
      challenger.users.slodeth = 'active';
      challenger.onUserLeave(['slodeth']);
      expect(challenger.users.slodeth).toEqual('inactive');
    });
  });
  describe('onUpdateUser', () => {
    it('should notice itself', () => {
      challenger.onUpdateUser(['slodeth', '1']);
      expect(challenger.users.slodeth).toEqual('self');
    });
  });
  describe('_challengeNext', () => {
    it('should challenge the first active mon', () => {
      challenger.users = {
        bulbasaur: 'inactive',
        slodeth: 'self',
        zoroark: 'active'
      };
      spyOn(challenger, '_challenge');
      challenger._challengeNext();
      expect(challenger._challenge).toHaveBeenCalledWith('zoroark');
    });
  });
  describe('gunzBlazing', () => {
    it('should add new users', () => {
      challenger.users = {
        bulbasaur: 'inactive',
        slodeth: 'self',
        zoroark: 'active'
      };
      challenger.gunzBlazing(['slodeth, bulbasaur, pikachu']);
      expect(challenger.users.bulbasaur).toEqual('active');
      expect(challenger.users.pikachu).toEqual('active');
      expect(challenger.users.slodeth).toEqual('self');
      expect(challenger.users.zoroark).toEqual('active');
    });
  });
});
