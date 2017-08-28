/**
 * This file simply passes along your bot source and metadata to
 * leftovers-again. No edits necessary.
 */
const LeftoversAgain = require('leftovers-again');
const bot = require('./bot');
const metadata = require('../package.json');

LeftoversAgain.start(metadata, bot);
