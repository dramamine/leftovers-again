import inquirer from 'inquirer';
import fs from 'fs';
import Handlebars from 'handlebars';

const formats = ['anythinggoes', 'randombattle', 'ubers', 'ou', 'monotype'];

const questions = [
  {
    name: 'Repo',
    message: 'What is your bot\'s name? (Capitalized, no spaces)',
    validate: (str) => {
      return str !== 'Yoda'; // Yoda had *better not* use this application!!
    },
    default: 'Terminator',
    filter: (str) => {
      return str.replace(/\W/g, '').replace(/^./, (match) => {
        return match.toUpperCase();
      });
    }
  },  {
    name: 'description',
    message: 'Write a description for your bot (optional)',
    filter: (str) => {
      return str.replace(/\"/g, '');
    }
  },
  {
    name: 'format',
    message: 'What battle format are you writing for?',
    type: 'list',
    choices: formats
  },
  {
    name: 'accept',
    message: 'What battle format challenges will you accept?',
    type: 'checkbox',
    choices: [{value: 'ALL', checked: true}].concat(formats),
    validate: (answer) => {
      if (answer.length > 1 && answer.indexOf('ALL') >= 0) {
        return 'Please select only ALL, or pick individual formats.';
      }
      return true;
    }
  },
];

const parseAndWrite = (source, destination, vars) => {
  const tmplt = Handlebars.compile( fs.readFileSync(source, 'ascii') );
  const parsed = tmplt(vars);
  if (destination) fs.writeFile(destination, parsed);
  return parsed;
};


inquirer.prompt(questions, (answers) => {
  answers.accept = answers.accept.join(',');
  answers.repo = answers.Repo.toLowerCase();
  const lang = 'es6';
  // @TODO this goes to tmp but should eventually go to 'bots'
  const folder = 'bots/' + answers.repo;
  fs.mkdirSync(folder);

  parseAndWrite(
    `templates/${lang}/main.js`,
    `${folder}/${answers.repo}.js`,
    answers
  );
  parseAndWrite(
    `templates/${lang}/package.json`,
    `${folder}/package.json`,
    answers
  );

  console.log(parseAndWrite('templates/goodbye.txt', null, answers));
});
