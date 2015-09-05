const config = {
  // bot name. hopefully no collisions, lol WHAT ARE THE CHANCES
  nick: '5nowden' + Math.floor(Math.random() * 10000),
  // the chat room in which bots gather. using lobby for now, but could use a
  // bot room if our users had permission to create rooms
  chatroom: 'lobby',

  // should be in bot config
  battletype: 'randombattle',

  actionurl: 'https://play.pokemonshowdown.com/~~localhost:8000/action.php'
};

export default config;
