'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Blank extends _ai2.default {
  constructor() {
    super();
    this.meta = {
      accepts: 'randombattle',
      format: 'randombattle',
      team: null,
      version: 'alpha',
      nickname: 'Blank ★marten★'
    };
  }

  decide(state) {
    if (state.forceSwitch || state.teamPreview) {
      return '/switch 1';
    }
    return '/move 1';
  }
} /**
   * Emptiest bot.
   *
   */


exports.default = Blank;