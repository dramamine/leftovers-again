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

console.log(`
This will generate a shell script for you to run a tournament.
Fill out the prompts and run the script to produce a CSV of results for yourself.

Note that results.csv is "double-written" (by winning & losing bot) so you may
want to filter out all losses, or something.

This script searches for valid bots in lib/bots. Valid bots must be valid (duh)
but also must accept battles of the chosen type.`);

inquirer.prompt([{
  name: 'format',
  message: 'What battle type are you running?',
  type: 'list',
  default: 'randombattle',
  choices: types
},
{
  name: 'resultsfile',
  message: 'Where should I record the results?',
  type: 'input',
  default: 'results/roundrobin.csv'
}]
).then(({ format, resultsfile }) => {
  const bots = findPossibleBots('lib/bots');
  const gtg = bots.filter(bot => isValid(bot, format));
  inquirer.prompt([
    {
      name: 'outfile',
      message: 'Where should I record the tournament script?',
      type: 'input',
      default: 'roundrobin.sh'
    },
    {
      name: 'chosen',
      message: 'How does this bot list look?',
      type: 'checkbox',
      choices: [
        new inquirer.Separator('==  ==  =='),
        ...gtg,
        new inquirer.Separator('  ==  ==')
      ],
      default: gtg
    },
    {
      name: 'parameters',
      message: 'Any other parameters?',
      type: 'input',
      default: `--matches=1 format=${format} results=${resultsfile}`
    }
  ]).then(({ chosen, outfile, parameters }) => {
    console.log('gr8');
    const stream = fs.createWriteStream(outfile, {
      flags: 'w' // erase and overwrite
    });
    for (let i = 0; i < chosen.length; i++) {
      for (let j = 0; j < chosen.length; j++) {
        if (i < j) {
          const text = `npm run start:quick -- ${chosen[i]} --opponent=${chosen[j]} ${parameters}\n`;
          console.log(text);
          stream.write(text);
        }
      }
    }
    stream.end('\n\nThat should be it.');
  });
});
