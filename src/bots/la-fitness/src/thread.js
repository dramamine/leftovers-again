import Evaluator from './evaluator';

process.on('message', (event) => {
  switch (event.type) {
  case 'evaluate':
    const evaluated = Evaluator.evaluateNode(...event.args);
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
