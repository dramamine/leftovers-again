const botroot = './bots/';

const cfg = {
  // bot name. hopefully no collisions, lol WHAT ARE THE CHANCES
  nick: '5nowden' + Math.floor(Math.random() * 10000),
  // don't use a password
  pass: null,
  // the chat room in which bots gather. using lobby for now, but could use a
  // bot room if our users had permission to create rooms
  chatroom: 'lobby',

  // should be in bot config
  battletype: 'randombattle',

  actionurl: 'https://play.pokemonshowdown.com/~~localhost:8000/action.php',

  botPath: 'randombattle/randumb'
};

class Config {
  get() {
    return cfg;
  }

  get nick() {
    return cfg.nick;
  }
  set nick(i) {
    cfg.nick = i;
  }

  get chatroom() {
    return cfg.chatroom;
  }
  set chatroom(i) {
    cfg.chatroom = i;
  }
  get pass() {
    return cfg.pass;
  }
  set pass(i) {
    cfg.pass = i;
  }
  get battletype() {
    return cfg.battletype;
  }
  set battletype(i) {
    cfg.battletype = i;
  }

  get actionurl() {
    return cfg.actionurl;
  }
  set actionurl(i) {
    cfg.actionurl = i;
  }

  get botPath() {
    return botroot + cfg.botPath;
  }

  set botPath(path) {
    cfg.botPath = path;
  }
}

const cfgclass = new Config();
export default cfgclass;
