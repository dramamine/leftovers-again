'use strict';

var _botfinder = require('./botfinder');

var _botfinder2 = _interopRequireDefault(_botfinder);

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// process cmdline args
const args = require('minimist')(process.argv.slice(2));
const firstArg = args._ && args._[0] ? args._[0] : null;
const botpath = args.bot || firstArg || _defaults2.default.bot;

const { metadata, botClass } = (0, _botfinder2.default)(botpath);
_main2.default.start(metadata, botClass);