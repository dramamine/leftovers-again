"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Reporting class; for returning match results to the user.
 */

var Report = function () {
  /**
   * Report constructor.
   *
   */

  function Report() {
    _classCallCheck(this, Report);

    // array of matches we were involved in.
    this.matches = [];
  }
  /**
   * Handle a win/loss.
   *
   * @param  {string} victor  The nickname of the victor.
   * @param  {BattleStore} store   The final battle state.
   * @param  {string} matchid An ID to identify this match.
   *
   * @return {ReportObj} A report object.
   * @property {string} matchid  The ID of the match
   * @property {boolean} won  true if we won the match; false otherwise.
   * @property {number} damageDone  The total damage we did, out of 600 (percent).
   * @property {number} damageTaken  The total damage we took, out of 600 (percent).
   * @property {string} me  your nickname
   * @property {string} you  your opponent's nickname
   * @property {Array<Pokemon>} mine  an array of your Pokemon
   * @property {Array<Pokemon>} yours  an array of your opponent's Pokemon
   * @property {Array} events  an array of events(?)
   * @property {Array} statuses  an array of statuses(?)
   *
   * @see Pokemon
   * @see class/src/model/pokemon.js
   *
   */


  _createClass(Report, [{
    key: "win",
    value: function win(victor, store) {
      var matchid = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

      var iwon = victor === store.myNick;
      var state = store.data();

      // iterating over pokemon we've seen and damaged only. unseen pokemon
      // are undamaged.
      var damageDone = state.opponent.reserve.reduce(function (prev, curr) {
        return prev + 100 - (curr.hppct || 0);
      }, 0);
      var damageTaken = 600 - state.self.reserve.reduce(function (prev, curr) {
        return prev + (curr.hppct || 0);
      }, 0);

      var myAlive = state.opponent.reserve.filter(function (mon) {
        return !mon.dead;
      }).length;
      var yourAlive = 6 - state.self.reserve.filter(function (mon) {
        return !mon.dead;
      }).length;

      var result = {
        matchid: matchid,
        won: iwon,
        damageDone: damageDone,
        damageTaken: damageTaken,
        myAlive: myAlive,
        yourAlive: yourAlive,
        me: store.myNick,
        you: store.yourNick,
        mine: state.self.reserve,
        yours: state.opponent.reserve,
        events: store.events,
        statuses: store.statuses
      };
      this.matches.push(result);

      return this.matches;
    }

    /**
     * Get my data.
     *
     * @return {array} Array of match results
     */

  }, {
    key: "data",
    value: function data() {
      return this.matches;
    }
  }]);

  return Report;
}();

var report = new Report();
exports.default = report;