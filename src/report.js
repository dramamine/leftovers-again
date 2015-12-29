
/**
 * Reporting class; for returning match results to the user.
 */
class Report {
  /**
   * Report constructor.
   *
   */
  constructor() {
    // array of matches we were involved in.
    this.matches = [];
  }
  /**
   * Handle a win/loss.
   *
   * @param  {string} victor  The nickname of the victor.
   * @param  {BattleStore} store   The final battle state.
   * @param  {string} matchid An ID to identify this match.
   * @return {object} An object with the following properties:
   * matchid: {string} The ID of the match
   * won: {boolean} true if we won the match; false otherwise.
   * damageDone: {number} The total damage we did, out of 600 (percent).
   * damageTaken: {number} The total damage we took, out of 600 (percent).
   * me: {string} your nickname
   * you: {string} your opponent's nickname
   * mine: {array} an array of your {Pokemon}
   * yours: {array} an array of your opponent's {Pokemon}
   * events: {array} an array of events(?)
   * statuses: {array} an array of statuses(?)
   */
  win(victor, store, matchid = null) {
    const iwon = (victor === store.myNick);
    const state = store.data();

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
      you: store.yourNick,
      mine: state.self.reserve,
      yours: state.opponent.reserve,
      events: store.events,
      statuses: store.statuses
    };
    this.matches.push(result);

    return result;
  }

  /**
   * Get my data.
   * @TODO not sure if this is working!
   *
   * @return {array} Array of match results
   */
  data() {
    return this.matches;
  }
}

const report = new Report();
export default report;
