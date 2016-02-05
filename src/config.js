

export default {
  // where's the action at?
  actionurl: 'https://play.pokemonshowdown.com/~~localhost:8000/action.php',
  // bot name. hopefully no collisions, lol WHAT ARE THE CHANCES
  nick: '5nowden' + Math.floor(Math.random() * 10000),
  // don't use a password
  pass: null,
  // the chat room in which bots gather. using lobby for now, but could use a
  // bot room if our users had permission to create rooms
  chatroom: 'lobby',

  bot: 'randumb',

  matches: 3
};
