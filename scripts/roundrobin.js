import inquirer from 'inquirer';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

import botfinder from '../botfinder';

const types = ['ou', 'randombattle'];
const paths = ['lib/bots'];

const findPossibleBots = (cwd) => {
  const files = glob.sync('**/package.json', {
    cwd
  });

  return files.map((file) => {
    const updated = file.replace('/package.json', '');
    return updated;
  });
};

const isValid = (bot, format) => {
  const metadata = botfinder(bot).metadata;
  if (metadata.accepts) {
    if (metadata.accepts === 'ALL') return true;
    return metadata.accepts.includes(format);
  }
  return false;
};

console.log( findPossibleBots('lib/bots/') );


console.log(`
This will generate a shell script for you to run a tournament.
Fill out the prompts and run the script to produce a CSV of results for yourself.

Note that results.csv is "double-written" (by winning & losing bot) so you may
want to filter out all losses, or something.

This script searches for valid bots in lib/bots. Valid bots must be valid (duh)
but also must accept battles of the chosen type.`);

inquirer.prompt({
  name: 'format',
  message: 'What battle type are you running?',
  type: 'list',
  default: 0,
  choices: types
}).then(({ format }) => {
  const bots = findPossibleBots('lib/bots');
  const gtg = bots.filter(bot => isValid(bot, format));
  inquirer.prompt({
    name: 'chosen',
    message: 'How does this bot list look?',
    type: 'checkbox',
    choices: [
      new inquirer.Separator('==  ==  =='),
      ...gtg,
      new inquirer.Separator('  ==  ==')
    ],
    default: gtg
  }).then(({ chosen }) => {
    console.log('gr8');
  });
});
