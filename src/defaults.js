/**
 * @TODO not sure I need this file anymore, or really want it.
 */
module.exports = {
  // bot name. hopefully no collisions, lol WHAT ARE THE CHANCES
  nickname: '5nowden' + Math.floor(Math.random() * 10000),
  // don't use a password
  password: null,
  // the chat room in which bots gather. using lobby for now, but could use a
  // bot room if our users had permission to create rooms
  chatroom: 'lobby',

  bot: 'randumb',

  // limit the number of matches you play. 0 means don't limit
  matches: 0,

  server: 'localhost',
  port: 8000,
  prodServer: 'leftoversagain.net',
  format: 'randombattle',

  results: 'results/results.csv'
};
