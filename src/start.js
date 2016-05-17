import botfinder from './botfinder';
import {start} from './main';

// process cmdline args
const args = require('minimist')(process.argv.slice(2));
const firstArg = (args._ && args._[0]) ? args._[0] : null;
const botpath = args.bot || firstArg || defaults.bot;

const {metadata, botClass} = botfinder.find(botpath);
start(metadata, botClass);