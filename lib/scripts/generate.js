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

var formats = ['anythinggoes', 'randombattle', 'ubers', 'ou', 'monotype'];
var formatsWithTeams = ['anythinggoes', 'ubers', 'ou', 'monotype'];
var languages = ['es6'];

/**
 * Try to 'require' stuff without crashing out
 */
var tryRequire = function tryRequire(file) {
  try {
    return require(file);
  } catch (e) {
    return undefined;
  }
};

/**
 * Try to make a directory without crashing out
*/
var tryMkdir = function tryMkdir(file) {
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
var parse = function parse(source, vars) {
  var tmplt = _handlebars2.default.compile(_fs2.default.readFileSync(source, 'ascii'));
  return tmplt(vars);
};

// from lib/scripts folder (ES5)
var tmpltDir = _path2.default.join(__dirname, '../..', 'templates');
try {
  _fs2.default.accessSync(tmpltDir);
} catch (e) {
  // from scripts folder (ES6)
  tmpltDir = _path2.default.join(__dirname, '..', 'templates');
}

var pkgLocation = _path2.default.join(process.cwd(), 'package.json');

var existingPackage = tryRequire(pkgLocation);
console.log(parse(_path2.default.join(tmpltDir, 'hello.txt'), {
  existingPackage: existingPackage
}));
if (!existingPackage) existingPackage = {};

var questions = [{
  name: 'Repo',
  message: 'What is your bot\'s name? (Capitalized, no spaces)',
  default: existingPackage.name || 'Terminator',
  filter: function filter(str) {
    return str.replace(/\W/g, '').replace(/^./, function (match) {
      return match.toUpperCase();
    });
  }
}, {
  name: 'description',
  message: 'Write a description for your bot (optional)',
  default: existingPackage.description || 'the very best',
  filter: function filter(str) {
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
  validate: function validate(answer) {
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
var writePackage = function writePackage(source, more, destination) {
  var combined = Object.assign(source, more);
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
var parseAndWrite = function parseAndWrite(source, destination, vars) {
  var tmplt = _handlebars2.default.compile(_fs2.default.readFileSync(source, 'ascii'));
  var parsed = tmplt(vars);
  if (destination) _fs2.default.writeFile(destination, parsed);
  return parsed;
};

_inquirer2.default.prompt(questions).then(function (answers) {
  answers.accept = answers.accept.join(',');
  answers.repo = answers.Repo.toLowerCase();
  answers.name = existingPackage.name || answers.Repo;
  if (formatsWithTeams.indexOf(answers.format) >= 0) {
    answers.team = true;
  }

  var lang = 'es6';
  // @TODO this goes to tmp but should eventually go to 'bots'
  // const folder = 'bots/' + answers.repo;
  // fs.mkdirSync(folder);
  var addStuff = JSON.parse(parse(_path2.default.join(tmpltDir, lang, 'package.json'), answers));
  writePackage(existingPackage, addStuff, pkgLocation);

  tryMkdir(_path2.default.join(process.cwd(), 'log'));
  tryMkdir(_path2.default.join(process.cwd(), 'src'));

  var filez = _glob2.default.sync('**/*', {
    cwd: _path2.default.join(tmpltDir, lang),
    nodir: true,
    dot: true
  });
  filez.forEach(function (file) {
    if (file === 'package.json') return;
    parseAndWrite(_path2.default.join(tmpltDir, lang, file),
    // this line is a dumb workaround where npm doesn't include src subdirectories.
    _path2.default.join(process.cwd(), file.replace('_src', 'src')), answers);
  });

  console.log(parseAndWrite(_path2.default.join(tmpltDir, 'goodbye.txt'), null, answers));
});