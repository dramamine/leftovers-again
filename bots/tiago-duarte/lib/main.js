'use strict';

var _leftoversAgain = require('leftovers-again');

var _leftoversAgain2 = _interopRequireDefault(_leftoversAgain);

var _bot = require('./bot');

var _bot2 = _interopRequireDefault(_bot);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leftoversAgain2.default.start(_package2.default, _bot2.default); /**
                                                                   * This file simply passes along your bot source and metadata to
                                                                   * leftovers-again. No edits necessary.
                                                                   */