'use strict';

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const formats = ['anythinggoes', 'randombattle', 'ubers', 'ou', 'monotype'];
const formatsWithTeams = ['anythinggoes', 'ubers', 'ou', 'monotype'];
const languages = ['es6'];

/**
 * Try to 'require' stuff without crashing out
 */
const tryRequire = file => {
  try {
    return require(file);
  } catch (e) {
    return undefined;
  }
};

/**
 * Try to make a directory without crashing out
*/
const tryMkdir = file => {
  try {
    return _fs2.default.mkdirSync(file);
  } catch (e) {
    return undefined;
  }
};

/**
 * Parses a Handlebars template.
 * @param  {String} source The Handlebars template.
 * @param  {Object} vars   An object of variables for the template.
 * @return {String}  The parsed template.
 */
const parse = (source, vars) => {
  const tmplt = _handlebars2.default.compile(_fs2.default.readFileSync(source, 'ascii'));
  return tmplt(vars);
};

// from lib/scripts folder (ES5)
let tmpltDir = _path2.default.join(__dirname, '../..', 'templates');
try {
  _fs2.default.accessSync(tmpltDir);
} catch (e) {
  // from scripts folder (ES6)
  tmpltDir = _path2.default.join(__dirname, '..', 'templates');
}

const pkgLocation = _path2.default.join(process.cwd(), 'package.json');

let existingPackage = tryRequire(pkgLocation);
console.log(parse(_path2.default.join(tmpltDir, 'hello.txt'), {
  existingPackage
}));
if (!existingPackage) existingPackage = {};

const questions = [{
  name: 'Repo',
  message: 'What is your bot\'s name? (Capitalized, no spaces)',
  default: existingPackage.name || 'Terminator',
  filter: str => {
    return str.replace(/\W/g, '').replace(/^./, match => {
      return match.toUpperCase();
    });
  }
}, {
  name: 'description',
  message: 'Write a description for your bot (optional)',
  default: existingPackage.description || 'the very best',
  filter: str => {
    return str.replace(/\"/g, '');
  }
}, {
  name: 'format',
  message: 'What battle format are you writing for? (The main difference being, ' + 'whether your team is predetermined or random.)',
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
}, {
  name: 'lang',
  message: 'What programming language are you primarily using?',
  type: 'list',
  choices: languages
}];

/**
 * Package.json requires some special handling, as we don't really want to
 * overwrite the user's file. This function combines two JSON objects and then
 * writes them to pkgLocation.
 *
 * @param  {Object} source The source/original file.
 * @param  {Object} more   Stuff to add.
 * @param  {String} destination  The destination path.
 */
const writePackage = (source, more, destination) => {
  const combined = Object.assign(source, more);
  _fs2.default.writeFile(destination, JSON.stringify(combined, null, 2));
};

/**
 * Parse templates and write some new files.
 *
 * @param  {String} source  The source path to read.
 * @param  {String} destination  Destination file path. If this is null, just
 * return the parsed string.
 * @param  {Object} vars  Variables to feed to Handlebars template
 *
 * @return {[type]}             [description]
 */
const parseAndWrite = (source, destination, vars) => {
  const tmplt = _handlebars2.default.compile(_fs2.default.readFileSync(source, 'ascii'));
  const parsed = tmplt(vars);
  if (destination) _fs2.default.writeFile(destination, parsed);
  return parsed;
};

_inquirer2.default.prompt(questions).then(answers => {
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
  const addStuff = JSON.parse(parse(_path2.default.join(tmpltDir, lang, 'package.json'), answers));
  writePackage(existingPackage, addStuff, pkgLocation);

  tryMkdir(_path2.default.join(process.cwd(), 'log'));
  tryMkdir(_path2.default.join(process.cwd(), 'src'));

  const filez = _glob2.default.sync('**/*', {
    cwd: _path2.default.join(tmpltDir, lang),
    nodir: true,
    dot: true
  });
  filez.forEach(file => {
    if (file === 'package.json') return;
    parseAndWrite(_path2.default.join(tmpltDir, lang, file),
    // this line is a dumb workaround where npm doesn't include src subdirectories.
    _path2.default.join(process.cwd(), file.replace('_src', 'src')), answers);
  });

  console.log(parseAndWrite(_path2.default.join(tmpltDir, 'goodbye.txt'), null, answers));
});