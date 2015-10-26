

class Report {
  constructor() {
    this.matches = [];
  }
  win(victor, store, matchid = null) {
    const iwon = (victor === store.myNick);
    const state = store.data();
    // console.log(state);
    // const aliveFilter = mon => !mon.dead;
    // const deadFilter = mon => mon.dead;
    // const selfAliveMons = state.self.reserve.filter(aliveFilter);
    // const opponentAliveMons = state.opponent.reserve.filter(aliveFilter);
    // const selfDeadMons = state.self.reserve.filter(deadFilter);
    // const opponentDeadMons = state.opponent.reserve.filter(deadFilter);

    // iterating over pokemon we've seen and damaged only. unseen pokemon
    // are undamaged.
    const damageDone = state.opponent.reserve.reduce( (prev, curr) => {
      return prev + 100 - (curr.hppct || 0);
    }, 0);
    const damageTaken = 600 - state.self.reserve.reduce( (prev, curr) => {
      return prev + (curr.hppct || 0);
    }, 0);


    const result = {
      matchid: matchid,
      won: iwon,
      damageDone,
      damageTaken,
      me: store.myNick,
      you: store.opponentNick,
      mine: state.self.reserve,
      yours: state.opponent.reserve,
      events: store.events,
      statuses: store.statuses
    };
    this.matches.push(result);

    return this.matches;
  }

  data() {
    return this.mydata;
  }
}

const report = new Report();
export default report;
