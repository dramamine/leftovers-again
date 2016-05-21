'use strict';

var _evaluator = require('./evaluator');

var _evaluator2 = _interopRequireDefault(_evaluator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

process.on('message', event => {
  switch (event.type) {
    case 'evaluate':
      const evaluated = _evaluator2.default.evaluateNode(...event.args);
      // console.log('I did get some evaluated stuff');
      process.send({
        type: 'result',
        evaluated
      });
      break;
    default:
      break;
  }
});