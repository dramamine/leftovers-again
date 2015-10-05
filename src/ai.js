class AI {
  constructor(meta) {
    this.meta = meta;
  }

  onRequest(state) { // eslint-disable-line
    console.log('You need to implement onRequest in your AI class!');
    return false;
  }
}

export default AI;
