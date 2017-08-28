const Lobby = require('@la/model/lobby');
const listener = require('@la/listener');

let lobby;
describe('lobby', () => {
  beforeEach(() => {
    lobby = new Lobby();
  });
  it('should know when a user joined', () => {
    listener.relay('j', ['slodeth']);
    expect(lobby.users.has('slodeth')).toBe(true);
  });
  it('should know when a user left', () => {
    listener.relay('j', ['slodeth']);
    listener.relay('j', ['pokechu']);
    listener.relay('l', ['slodeth']);
    expect(lobby.users.has('pokechu')).toBe(true);
    expect(lobby.users.has('slodeth')).toBe(false);
  });
  it('should understand a user list', () => {
    listener.relay('users', ['3, abra, bulbasaur, cerebii']);
    expect(lobby.users.has('abra')).toBe(true);
    expect(lobby.users.has('bulbasaur')).toBe(true);
    expect(lobby.users.has('cerebii')).toBe(true);
  });
  it('should not add myself to the user list', () => {
    listener.relay('updateuser', ['slodeth', '1']);
    listener.relay('j', ['slodeth']);
    expect(lobby.users.has('slodeth')).toBe(false);
  });
  it('should not keep myself in the user list', () => {
    listener.relay('j', ['slodeth']);
    listener.relay('updateuser', ['slodeth', '1']);
    expect(lobby.users.has('slodeth')).toBe(false);
  });
});
