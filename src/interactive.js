import challenger from './challenger';
import listener from './listener';
import inquirer from 'inquirer';
import colors from 'colors/safe';

const actions = {
  JOIN: 'join',
  CHALLENGE: 'challenge',
  RECORDS: 'records',
  EXIT: 'exit'
};

class Interactive {
  constructor() {
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
      console.log(JSON.stringify(response, null, '  '));
      switch (response.lobby) {
      case actions.CHALLENGE:
        console.log('gonna challenge');
        break;
      case actions.EXIT:
      default:
        exit();
        return;
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
      console.log('interactive: logged in');
      console.log(this);
      this.lobby();
    }
  }
}

export default Interactive;
