'use strict';

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const formats = ['anythinggoes', 'randombattle', 'ubers', 'ou', 'monotype'];
const formatsWithTeams = ['anythinggoes', 'ubers', 'ou', 'monotype'];

const questions = [{
  name: 'Repo',
  message: 'What is your bot\'s name? (Capitalized, no spaces)',
  default: 'Terminator',
  filter: str => {
    return str.replace(/\W/g, '').replace(/^./, match => {
      return match.toUpperCase();
    });
  }
}, {
  name: 'description',
  message: 'Write a description for your bot (optional)',
  filter: str => {
    return str.replace(/\"/g, '');
  }
}, {
  name: 'format',
  message: 'What battle format are you writing for?',
  type: 'list',
  choices: formats
}, {
  name: 'accept',
  message: 'What battle format challenges will you accept?',
  type: 'checkbox',
  choices: [{ value: 'ALL', checked: true }].concat(formats),
  validate: answer => {
    if (answer.length > 1 && answer.indexOf('ALL') >= 0) {
      return 'Please select only ALL, or pick individual formats.';
    }
    return true;
  }
}];

const parseAndWrite = (source, destination, vars) => {
  const tmplt = _handlebars2.default.compile(_fs2.default.readFileSync(source, 'ascii'));
  const parsed = tmplt(vars);
  if (destination) _fs2.default.writeFile(destination, parsed);
  return parsed;
};

_inquirer2.default.prompt(questions, answers => {
  answers.accept = answers.accept.join(',');
  answers.repo = answers.Repo.toLowerCase();
  if (formatsWithTeams.indexOf(answers.format) >= 0) {
    answers.team = true;
  }

  const lang = 'es6';
  // @TODO this goes to tmp but should eventually go to 'bots'
  const folder = 'bots/' + answers.repo;
  _fs2.default.mkdirSync(folder);

  parseAndWrite(`templates/${ lang }/main.js`, `${ folder }/${ answers.repo }.js`, answers);
  parseAndWrite(`templates/${ lang }/package.json`, `${ folder }/package.json`, answers);

  console.log(parseAndWrite('templates/goodbye.txt', null, answers));
});