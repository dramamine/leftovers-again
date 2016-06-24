'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ai = require('../../ai');

var _ai2 = _interopRequireDefault(_ai);

var _decisions = require('../../decisions');

var _typechart = require('../../game/typechart');

var _typechart2 = _interopRequireDefault(_typechart);

var _damage = require('../../game/damage');

var _damage2 = _interopRequireDefault(_damage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * MeetTheFakers
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var MeetTheFakers = function (_AI) {
  _inherits(MeetTheFakers, _AI);

  function MeetTheFakers() {
    _classCallCheck(this, MeetTheFakers);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(MeetTheFakers).call(this));
  }

  _createClass(MeetTheFakers, [{
    key: 'team',
    value: function team() {
      return '\nMedicham @ Medichamite\nAbility: Pure Power\nEVs: 252 Atk / 4 Def / 252 Spe\nJolly Nature\n- Fake Out\n- Psycho Cut\n- High Jump Kick\n- Ice Punch\n\nHitmonlee @ Salac Berry\nAbility: Unburden\nEVs: 252 Atk / 4 Def / 252 Spe\n- Fake Out\n- Endure\n- Reversal\n- Stone Edge\n\nJynx @ Focus Sash\nAbility: Dry Skin\nEVs: 252 SpA / 4 SpD / 252 Spe\n- Fake Out\n- Lovely Kiss\n- Ice Beam\n- Fake Tears\n\nLudicolo @ Leftovers\nAbility: Swift Swim\nEVs: 252 SpA / 4 SpD / 252 Spe\n- Fake Out\n- Toxic\n- Surf\n- Rain Dance\n\nWeavile @ Choice Band\nAbility: Pressure\nEVs: 252 Atk / 4 Def / 252 Spe\n- Fake Out\n- Night Slash\n- Ice Shard\n- Brick Break\n\nInfernape @ Life Orb\nAbility: Blaze\nEVs: 136 Atk / 120 SpA / 252 Spe\n- Fake Out\n- Flare Blitz\n- Stone Edge\n- Close Combat';
    }

    /**
     * Here's the main loop of your bot. Please read the documentation for more
     * details.
     *
     * @param  {Object} state The current state of the game.
     *
     * @return {Decision}     A decision object.
     */

  }, {
    key: 'decide',
    value: function decide(state) {
      if (state.forceSwitch || state.teamPreview) {
        var myMon = this._pickOne(state.self.reserve.filter(function (mon) {
          return !mon.dead;
        }));
        return new _decisions.SWITCH(myMon);
      }

      switch (state.self.active.species) {
        case 'Medicham':
          return this.chooseForMedicham(state);
        case 'Hitmonlee':
          return this.chooseForHitmonlee(state);
        case 'Jynx':
          return this.chooseForJynx(state);
        case 'Ludicolo':
          return this.chooseForLudicolo(state);
        case 'Weavile':
          return this.chooseForWeavile(state);
        case 'Infernape':
          return this.chooseForInfernape(state);
        default:
          break;
      }
    }

    /**
     * - Fake Out
     * - Psycho Cut
     * - High Jump Kick
     * - Ice Punch
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */

  }, {
    key: 'chooseForMedicham',
    value: function chooseForMedicham(state) {
      if (this.shouldFakeout(state)) {
        return new _decisions.MOVE('fakeout');
      }
      return this.doTheMostDamage(state);
    }

    /**
     * - Fake Out
     * - Endure
     * - Reversal
     * - Blaze Kick/Stone Edge
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */

  }, {
    key: 'chooseForHitmonlee',
    value: function chooseForHitmonlee(state) {
      if (this.shouldFakeout(state)) {
        return new _decisions.MOVE('fakeout');
      }

      if (state.self.active.hppct <= 50) {
        if (state.self.active.item) {
          return new _decisions.MOVE('endure');
        }
        return new _decisions.MOVE('reversal');
      }
      return new _decisions.MOVE('stoneedge');
    }

    /**
     * - Fake Out
     * - Lovely Kiss
     * - Ice Beam
     * - Fake Tears
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */

  }, {
    key: 'chooseForJynx',
    value: function chooseForJynx(state) {
      if (this.shouldFakeout(state)) {
        return new _decisions.MOVE('fakeout');
      }
      var isCrying = state.opponent.active.boosts && (state.opponent.active.boosts.spd || 0) < 0;

      var shouldKiss = state.opponent.active.statuses.indexOf('slp') === -1 && state.opponent.active.types.indexOf('Ghost') === -1 && !isCrying;

      var shouldTears = !isCrying;

      var pickRandomly = shouldKiss && shouldTears ? Math.random() <= 0.5 : null;

      if (shouldKiss || pickRandomly === true) {
        return new _decisions.MOVE('lovelykiss');
      }
      if (shouldTears) {
        return new _decisions.MOVE('faketears');
      }

      return new _decisions.MOVE('icebeam');
    }

    /**
     * - Fake Out
     * - Toxic
     * - Surf
     * - Rain Dance
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */

  }, {
    key: 'chooseForLudicolo',
    value: function chooseForLudicolo(state) {
      if (this.shouldFakeout(state)) {
        return new _decisions.MOVE('fakeout');
      }

      var isRaining = state.weather.indexOf('rain') >= 0 || state.self.active.prevMoves.indexOf('raindance') >= 0;

      // if (state.weather.indexOf('rain') === -1 &&
      //   state.self.active.prevMoves.indexOf('raindance') === -1) {
      //   return new MOVE('raindance');
      // }

      var waterEffectiveness = _typechart2.default.compare('Water', state.opponent.active.types);

      var shouldToxic = state.opponent.active.statuses.indexOf('tox') === -1;
      var shouldSurf = isRaining && waterEffectiveness >= 1;

      if (!shouldSurf && !shouldToxic) {
        // figure out our switch priorities
        var x = state.self.reserve.filter(function (mon) {
          return !mon.dead;
        }).sort(function (a, b) {
          if (a.species === 'Jynx') return -1;
          if (b.species === 'Jynx') return 1;
          if (a.species === 'Infernape') return 1;
          if (b.species === 'Infernape') return -1;
          return 0;
        });
        if (x.length > 0) {
          return new _decisions.SWITCH(x[0]);
        }
        return new _decisions.MOVE('surf');
      } else if (shouldSurf) {
        return new _decisions.MOVE('surf');
      }
      return new _decisions.MOVE('toxic');
    }

    /**
     * - Fake Out
     * - Night Slash
     * - Ice Shard
     * - Brick Break
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */

  }, {
    key: 'chooseForWeavile',
    value: function chooseForWeavile(state) {
      return this.doTheMostDamage(state);
    }

    /**
     * - Fake Out
     * - Flare Blitz
     * - Stone Edge
     * - Close Combat
     * @param  {[type]} state [description]
     * @return {[type]}       [description]
     */

  }, {
    key: 'chooseForInfernape',
    value: function chooseForInfernape(state) {
      if (this.shouldFakeout(state)) {
        return new _decisions.MOVE('fakeout');
      }

      return this.doTheMostDamage(state);
    }
  }, {
    key: 'shouldFakeout',
    value: function shouldFakeout(state) {
      return state.self.active.prevMoves.length === 0 && state.opponent.active.types.indexOf('Ghost') === -1 && !state.self.active.moves.find(function (move) {
        return move.id === 'fakeout';
      }).disabled;
    }
  }, {
    key: 'doTheMostDamage',
    value: function doTheMostDamage(state) {
      // check each move
      var maxDamage = -1;
      var bestMove = 0;

      state.self.active.moves.forEach(function (move, idx) {
        if (move.disabled) return;
        var est = [];
        try {
          est = _damage2.default.getDamageResult(state.self.active, state.opponent.active, move);
        } catch (e) {
          console.log(e);
          console.log(state.self.active, state.opponent.active, move);
        }
        if (est[0] > maxDamage) {
          maxDamage = est[0];
          bestMove = idx;
        }
      });

      return new _decisions.MOVE(bestMove);
    }
  }, {
    key: '_pickOne',
    value: function _pickOne(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }]);

  return MeetTheFakers;
}(_ai2.default);

exports.default = MeetTheFakers;