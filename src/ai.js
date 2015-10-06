class AI {
  constructor(meta) {
    this.meta = meta;
  }

  onRequest(state) { // eslint-disable-line
    console.log('You need to implement onRequest in your AI class!');
    return false;
  }

  getTeam() {
    return 'null';
  }
}

export default AI;
