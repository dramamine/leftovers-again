/**
 * @TODO not sure I need this file anymore, or really want it.
 */
export default {
  // bot name. hopefully no collisions, lol WHAT ARE THE CHANCES
  nickname: '5nowden' + Math.floor(Math.random() * 10000),
  // don't use a password
  password: null,
  // the chat room in which bots gather. using lobby for now, but could use a
  // bot room if our users had permission to create rooms
  chatroom: 'lobby',

  bot: 'randumb',

  matches: 3,

  server: 'localhost',
  prodServer: 'metal-heart.org',
  port: 8000,
  format: 'randombattle'
};
