const inquirer = require('inquirer');
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const Handlebars = require('handlebars');

// valid formats involving choosing your team
const formatsWithTeams = ['gen7anythinggoes',
  'gen7ou',
  'gen7ubers',
  'gen7uu',
  'gen7ru',
  'gen7nu',
  'gen7lc',
];

// formats without teams, plus the above
const formats = ['gen7randombattle'].concat(formatsWithTeams);

const languages = ['nodejs'];

/**
 * Try to 'require' stuff without crashing out
 */
const tryRequire = (file) => {
  try {
    return require(file);
  } catch (e) {
    return undefined;
  }
};

/**
 * Try to make a directory without crashing out
*/
const tryMkdir = (file) => {
  try {
    return fs.mkdirSync(file);
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
  const tmplt = Handlebars.compile(fs.readFileSync(source, 'ascii'));
  return tmplt(vars);
};

// from lib/scripts folder (ES5)
let tmpltDir = path.join(__dirname, '../..', 'templates');
try {
  fs.accessSync(tmpltDir);
} catch (e) {
  // from scripts folder (nodejs)
  tmpltDir = path.join(__dirname, '..', 'templates');
}

const pkgLocation = path.join(process.cwd(), 'package.json');

let existingPackage = tryRequire(pkgLocation);
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
  }, {
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
    choices: [{ value: 'ALL', checked: true }].concat(formats),
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
  fs.writeFile(destination, JSON.stringify(combined, null, 2), (err) => {
    if (err) console.error('Error writing file:', destination, parsed, err);
  });
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
  const tmplt = Handlebars.compile(fs.readFileSync(source, 'ascii'));
  const parsed = tmplt(vars);

  // don't overwrite a file that exists
  if (destination) {
    try {
      const stat = fs.statSync(destination);
      if (stat.isFile()) {
        console.log('file already exists, skipping ', destination);
        return null;
      }
    } catch (e) {
      // file probably doesn't exist.
    }
    fs.writeFile(destination, parsed, (err) => {
      if (err) console.error('Error writing file:', destination, parsed, err);
    });
  }
  return parsed;
};

/**
 * Stuff-doer
 */
inquirer.prompt(questions).then((answers) => {
  answers.accept = answers.accept.join(',');
  answers.repo = answers.Repo.toLowerCase();
  answers.name = existingPackage.name || answers.Repo;
  if (formatsWithTeams.indexOf(answers.format) >= 0) {
    answers.team = true;
  }

  const lang = 'nodejs';
  // @TODO this goes to tmp but should eventually go to 'bots'
  // const folder = 'bots/' + answers.repo;
  // fs.mkdirSync(folder);
  const addStuff = JSON.parse(parse(
    path.join(tmpltDir, lang, 'package.json'),
    answers
  ));
  writePackage(existingPackage, addStuff, pkgLocation);

  tryMkdir(path.join(process.cwd(), 'log'));
  tryMkdir(path.join(process.cwd(), 'results'));
  tryMkdir(path.join(process.cwd(), 'src'));

  const filez = glob.sync('**/*', {
    cwd: path.join(tmpltDir, lang),
    nodir: true,
    dot: true
  });
  filez.forEach((file) => {
    if (file === 'package.json') return;
    parseAndWrite(
      path.join(tmpltDir, lang, file),
      // this line is a dumb workaround where npm doesn't include src subdirectories.
      path.join(process.cwd(), file.replace('_src', 'src')),
      answers
    );
  });

  console.log(parseAndWrite(
    path.join(tmpltDir, 'goodbye.txt'),
    null,
    answers
  ));
});
