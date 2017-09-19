
const Log = require('../log');
const listener = require('../listener');
const util = require('../pokeutil');

let mynick = '';

/**
 * Used for managing challenges to other users.
 */
class Lobby {
  /**
   * Constructor.
   * @param  {boolean} scrappy Set to true if we want this user to challenge
   * everyone in the lobby and everyone who joins the lobby later.
   * @param  {String}  format  The type of match we're challenging
   * opponents to. By default, the challenge type used matches the 'format'
   * field of the bot's package.json
   *
   * @return Constructor
   */
  constructor() {
    listener.subscribe('updateuser', this.onUpdateUser.bind(this));
    listener.subscribe('users', this.onUserList.bind(this));
    listener.subscribe('j', this.onUserJoin.bind(this));
    listener.subscribe('l', this.onUserLeave.bind(this));

    this.onUpdateUser = this.onUpdateUser.bind(this);

    // all the users we've seen
    this.users = new Set();
  }

  /**
   * Remove all our listeners before you destroy this.
   *
   */
  destroy() {
    listener.unsubscribe('users', this.onUserList);
    listener.unsubscribe('updateuser', this.onUpdateUser);
    listener.unsubscribe('j', this.onUserJoin);
    listener.unsubscribe('l', this.onUserLeave);
  }

  /**
   * Updates the user state to reflect that the user joined.
   *
   * @param  {string} user The user who joined.
   */
  onUserJoin([user]) {
    const cleaned = util.toId(user);
    if (cleaned === mynick) return;
    if (!this.users.has(cleaned)) {
      this.users.add(cleaned);
      listener.relay('_lobbyUpdate', this.users);
    }
  }

  /**
   * Updates the user state to reflect that this user left.
   *
   * @param  {string} user The nickname of the user who left.
   */
  onUserLeave([user]) {
    const cleaned = util.toId(user);
    if (this.users.delete(cleaned)) {
      listener.relay('_lobbyUpdate', this.users);
    }
  }

  onUserList([users]) {
    let opponent; // user for iterator
    const userList = users.split(', ');
    // userlist[0] is just the count of users. skip it
    for (let i = 1; i < userList.length; i++) {
      opponent = util.toId(userList[i]);
      this.users.add(opponent);
    }
    listener.relay('_lobbyUpdate', this.users);
  }

  /**
   * Handles the updateuser message. We use this to know our own nickname and
   * avoid challenging ourselves (like a noob would)
   *
   * @param  {String} nick  Our assigned nickname.
   * @param  {Integer} status Unused.
   */
  onUpdateUser([nick, status]) { // eslint-disable-line
    switch (status) {
      case '0':
        break;
      case '1':
        Log.warn(`Successfully logged in as ${nick} (${util.toId(nick)})`);
        listener.relay('_nickUpdate', util.toId(nick));
        mynick = util.toId(nick);
        if (this.users.has(mynick)) {
          Log.error('weird that users array had my nickname in it.');
          this.users.delete(mynick);
          listener.relay('_lobbyUpdate', this.users);
        }
        break;
      default:
        Log.error(`Weird status when trying to log in: ${status} ${nick}`);
        break;
    }
  }

  getUsers() {
    return Array.from(this.users);
  }
}

module.exports = Lobby;
