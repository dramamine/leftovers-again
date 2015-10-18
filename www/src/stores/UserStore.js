class UserStore {
  constructor() {
    this.state = {
      mon: null,
      move: null,
      self: null,
    };
  }
  isActive() {
    return !!(this.state.mon || this.state.move);
  }
  getActiveMon() {
    return this.state.mon;
  }
  setActiveMon(mon) {
    this.state.mon = mon;
  }
  getActiveMove() {
    return this.state.move;
  }
  setActiveMove(move) {
    this.state.move = move;
  }
  getSelf() {
    return this.state.self;
  }
  setSelf(self) {
    this.state.self = self;
  }
}

const us = new UserStore();
export default us;
