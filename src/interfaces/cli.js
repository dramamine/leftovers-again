const inquirer = require('inquirer');
const listener = require('../listener');
const Log = require('../log');
// import colors from 'colors/safe';

const actions = {
  JOIN: 'join',
  CHALLENGE: 'challenge',
  RECORDS: 'records',
  EXIT: 'exit'
};

/**
 * Commandline interaction for server activity.
 *
 */
class Interactive {
  constructor({ challenger, lobby }) {
    this.challenger = challenger;
    this.lobby = lobby;
    console.log(this.lobby);
    listener.subscribe('updateuser', this.onUpdateUser.bind(this));
  }

  /**
   * Give the users some choices when they enter the lobby.
   *
   */
  onLobbyEnter() {
    inquirer.prompt({
      type: 'list',
      name: 'lobby',
      message: 'You enter the lobby and scan for your next victim.',
      choices: [
        {
          name: 'Challenge an opponent',
          value: actions.CHALLENGE
        },
        {
          name: 'Join a different chat room',
          value: actions.JOIN
        },
        {
          name: 'View records',
          value: actions.RECORDS
        },
        {
          name: 'Exit',
          value: actions.EXIT
        }
      ]
    }).then((response) => {
      switch (response.lobby) {
        case actions.CHALLENGE:
          this.challenge();
          break;
        case actions.EXIT:
        default:
          process.exit();
          return;
      }
    });
  }

  /**
   * Look through the list of opponents that we could challenge.
   */
  challenge() {
    const available = this.lobby.getUsers();
    if (available.size === 0) {
      Log.warn('lame, no opponents found');
      process.exit(); // lol whatever just get out
      return;
    }
    inquirer.prompt({
      type: 'list',
      name: 'opponent',
      message: 'Who do you wish to challenge?',
      choices: available
    }).then((response) => {
      if (!this.challenger.tryChallenge(response.opponent)) {
        Log.warn('That opponent is not available.');
        process.exit(); // lol whatever just get out
      }
    });
  }

  /**
   * Just need to know that we're logged in
   *
   * @param  {[type]} [nick   [description]
   * @param  {[type]} status] [description]
   * @return {[type]}         [description]
   */
  onUpdateUser([nick, status]) {
    if (status === '1') {
      this.onLobbyEnter();
    }
  }
}

module.exports = Interactive;
