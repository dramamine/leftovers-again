import inquirer from 'inquirer';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import Handlebars from 'handlebars';

const formats = ['anythinggoes', 'randombattle', 'ubers', 'ou', 'monotype'];
const formatsWithTeams = ['anythinggoes', 'ubers', 'ou', 'monotype'];
const languages = ['es6', 'javascript'];

const tryRequire = (file) => {
  try {
    return require(file);
  } catch(e) {
    return undefined;
  }
};

const parse = (source, vars) => {
  const tmplt = Handlebars.compile( fs.readFileSync(source, 'ascii'));
  return tmplt(vars);
};

// @TODO make sure this works in ES5 too
const tmpltDir = path.join(__dirname, '..', 'templates');
const pkgLocation = path.join(process.cwd(), 'package.json');

let existingPackage = tryRequire(pkgLocation);
console.log(existingPackage);
console.log(parse(path.join(tmpltDir, 'hello.txt'), {
  existingPackage
}));
if (!existingPackage) existingPackage = {};

const questions = [
  {
    name: 'Repo',
    message: 'What is your bot\'s name? (Capitalized, no spaces)',
    default: existingPackage.name || 'Terminator',
    filter: (str) => {
      return str.replace(/\W/g, '').replace(/^./, (match) => {
        return match.toUpperCase();
      });
    }
  },  {
    name: 'description',
    message: 'Write a description for your bot (optional)',
    default: existingPackage.description || 'the very best',
    filter: (str) => {
      return str.replace(/\"/g, '');
    }
  },
  {
    name: 'format',
    message: 'What battle format are you writing for? (The main difference being, '
    + 'whether your team is predetermined or random.)',
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
  {
    name: 'lang',
    message: 'What programming language are you primarily using?',
    type: 'list',
    choices: languages
  }
];

const writePackage = (source, more) => {
  const combined = Object.assign(source, more);
  fs.writeFile(pkgLocation + '2', JSON.stringify(combined, null, 2));
};

const parseAndWrite = (source, destination, vars) => {
  const tmplt = Handlebars.compile( fs.readFileSync(source, 'ascii') );
  const parsed = tmplt(vars);
  if (destination) fs.writeFile(destination, parsed);
  return parsed;
};

inquirer.prompt(questions).then((answers) => {
  answers.accept = answers.accept.join(',');
  answers.repo = answers.Repo.toLowerCase();
  answers.name = existingPackage.name || answers.Repo;
  if (formatsWithTeams.indexOf(answers.format) >= 0) {
    answers.team = true;
  }

  const lang = 'es6';
  // @TODO this goes to tmp but should eventually go to 'bots'
  // const folder = 'bots/' + answers.repo;
  // fs.mkdirSync(folder);
  const addStuff = JSON.parse( parse(
    path.join(tmpltDir, lang, 'package.json'),
    answers
  ) );
  writePackage(existingPackage, addStuff);

  const filez = glob.sync('**/*', {cwd: path.join(tmpltDir, lang)});
  filez.forEach((file) => {
    if (file === 'package.json') return;
    console.log(file);
    parseAndWrite(
      path.join(tmpltDir, lang, file),
      path.join(process.cwd(), file),
      answers
    );
  });

  // parseAndWrite(
  //   `templates/${lang}/main.js`,
  //   `${folder}/${answers.repo}.js`,
  //   answers
  // );
  // parseAndWrite(
  //   `templates/${lang}/package.json`,
  //   `${folder}/package.json`,
  //   answers
  // );

  console.log( parseAndWrite(
    path.join(tmpltDir, 'goodbye.txt'),
    null,
    answers
  ));
});
