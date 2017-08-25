require('module-alias').addAlias('@la', __dirname);
const botfinder = require('./botfinder');
const Main = require('./main');
const defaults = require('./defaults');

// process cmdline args
const args = require('minimist')(process.argv.slice(2));

const firstArg = (args._ && args._[0]) ? args._[0] : null;
const botpath = args.bot || firstArg || defaults.bot;

const { metadata, Bot } = botfinder(botpath);
Main.start(metadata, Bot);
