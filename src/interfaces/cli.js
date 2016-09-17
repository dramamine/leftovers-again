import listener from '../listener';
import inquirer from 'inquirer';
import colors from 'colors/safe';

const actions = {
  JOIN: 'join',
  CHALLENGE: 'challenge',
  RECORDS: 'records',
  EXIT: 'exit'
};

class Interactive {
  constructor(challenger) {
    this.challenger = challenger;
    listener.subscribe('updateuser', this.onUpdateUser.bind(this));
  }

  lobby() {
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
        exit();
        return;
      }
    });
  }

  challenge() {
    console.log(this.challenger.users);
    const available = [];
    Object.keys(this.challenger.users).forEach((key) => {
      if (this.challenger.users[key] === this.challenger.statuses.ACTIVE) {
        available.push(key);
      }
    });
    if (available.length === 0) {
      console.log('lame, no opponents found');
      return;
    }
    inquirer.prompt({
      type: 'list',
      name: 'opponent',
      message: 'Who do you wish to challenge?',
      choices: available
    }).then((response) => {
      console.log(JSON.stringify(response, null, '  '));
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
      this.lobby();
    }
  }
}

export default Interactive;
