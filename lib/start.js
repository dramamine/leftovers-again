'use strict';

var _botfinder2 = require('./botfinder');

var _botfinder3 = _interopRequireDefault(_botfinder2);

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// process cmdline args
var args = require('minimist')(process.argv.slice(2));
var firstArg = args._ && args._[0] ? args._[0] : null;
var botpath = args.bot || firstArg || _defaults2.default.bot;

var _botfinder = (0, _botfinder3.default)(botpath);

var metadata = _botfinder.metadata;
var Bot = _botfinder.Bot;

_main2.default.start(metadata, Bot);