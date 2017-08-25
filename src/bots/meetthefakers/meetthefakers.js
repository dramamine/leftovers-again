/**
 * MeetTheFakers
 *
 */
const AI = require('@la/ai');
const { MOVE, SWITCH } = require('@la/decisions');
const Typechart = require('@la/game/typechart');
const Damage = require('@la/game/damage');


class MeetTheFakers extends AI {
  team() {
    return `
Medicham @ Leftovers
Ability: Pure Power
EVs: 252 Atk / 4 Def / 252 Spe
Jolly Nature
- Fake Out
- Psycho Cut
- High Jump Kick
- Ice Punch

Hitmonlee @ Salac Berry
Ability: Unburden
EVs: 252 Atk / 4 Def / 252 Spe
- Fake Out
- Endure
- Reversal
- Stone Edge

Jynx @ Focus Sash
Ability: Dry Skin
EVs: 252 SpA / 4 SpD / 252 Spe
- Fake Out
- Lovely Kiss
- Ice Beam
- Fake Tears

Ludicolo @ Leftovers
Ability: Swift Swim
EVs: 252 SpA / 4 SpD / 252 Spe
- Fake Out
- Toxic
- Surf
- Rain Dance

Weavile @ Choice Band
Ability: Pressure
EVs: 252 Atk / 4 Def / 252 Spe
- Fake Out
- Night Slash
- Ice Shard
- Brick Break

Infernape @ Life Orb
Ability: Blaze
EVs: 136 Atk / 120 SpA / 252 Spe
- Fake Out
- Flare Blitz
- Stone Edge
- Close Combat`;
  }

  /**
   * Here's the main loop of your bot. Please read the documentation for more
   * details.
   *
   * @param  {Object} state The current state of the game.
   *
   * @return {Decision}     A decision object.
   */
  decide(state) {
    if (state.forceSwitch || state.teamPreview) {
      const myMon = this.pickOne(
        state.self.reserve.filter(mon => !mon.dead)
      );
      return new SWITCH(myMon);
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
        console.error('mon not found!');
        return process.exit(-1);
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
  chooseForMedicham(state) {
    if (this.shouldFakeout(state)) {
      return new MOVE('fakeout');
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
  chooseForHitmonlee(state) {
    if (this.shouldFakeout(state)) {
      return new MOVE('fakeout');
    }

    if (state.self.active.hppct <= 50) {
      if (state.self.active.item) {
        return new MOVE('endure');
      }
      return new MOVE('reversal');
    }
    return new MOVE('stoneedge');
  }

  /**
   * - Fake Out
   * - Lovely Kiss
   * - Ice Beam
   * - Fake Tears
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  chooseForJynx(state) {
    if (this.shouldFakeout(state)) {
      return new MOVE('fakeout');
    }
    const isCrying = state.opponent.active.boosts &&
      (state.opponent.active.boosts.spd || 0) < 0;

    const shouldKiss = state.opponent.active.statuses.indexOf('slp') === -1 &&
      state.opponent.active.types.indexOf('Ghost') === -1 &&
      !isCrying;

    const shouldTears = !isCrying;

    const pickRandomly = (shouldKiss && shouldTears)
      ? Math.random() <= 0.5
      : null;

    if (shouldKiss || pickRandomly === true) {
      return new MOVE('lovelykiss');
    }
    if (shouldTears) {
      return new MOVE('faketears');
    }

    return new MOVE('icebeam');
  }

  /**
   * - Fake Out
   * - Toxic
   * - Surf
   * - Rain Dance
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  chooseForLudicolo(state) {
    if (this.shouldFakeout(state)) {
      return new MOVE('fakeout');
    }

    const isRaining = state.weather.indexOf('rain') >= 0 ||
      state.self.active.prevMoves.indexOf('raindance') >= 0;

    // if (state.weather.indexOf('rain') === -1 &&
    //   state.self.active.prevMoves.indexOf('raindance') === -1) {
    //   return new MOVE('raindance');
    // }

    const waterEffectiveness = Typechart.compare('Water', state.opponent.active.types);

    const shouldToxic = state.opponent.active.statuses.indexOf('tox') === -1;
    const shouldSurf = isRaining && waterEffectiveness >= 1;

    if (!shouldSurf && !shouldToxic) {
      // figure out our switch priorities
      const x = state.self.reserve.filter(mon => !mon.dead)
        .sort((a, b) => {
          if (a.species === 'Jynx') return -1;
          if (b.species === 'Jynx') return 1;
          if (a.species === 'Infernape') return 1;
          if (b.species === 'Infernape') return -1;
          return 0;
        });
      if (x.length > 0) {
        return new SWITCH(x[0]);
      }
      return new MOVE('surf');
    } else if (shouldSurf) {
      return new MOVE('surf');
    }
    return new MOVE('toxic');
  }

  /**
   * - Fake Out
   * - Night Slash
   * - Ice Shard
   * - Brick Break
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  chooseForWeavile(state) {
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
  chooseForInfernape(state) {
    if (this.shouldFakeout(state)) {
      return new MOVE('fakeout');
    }

    return this.doTheMostDamage(state);
  }

  shouldFakeout(state) {
    return state.self.active.prevMoves.length === 0 &&
      state.opponent.active.types.indexOf('Ghost') === -1 &&
      !state.self.active.moves.find(move => move.id === 'fakeout').disabled;
  }

  doTheMostDamage(state) {
    // check each move
    let maxDamage = -1;
    let bestMove = 0;

    state.self.active.moves.forEach((move, idx) => {
      if (move.disabled) return;
      let est = [];
      try {
        est = Damage.getDamageResult(
          state.self.active,
          state.opponent.active,
          move
        );
      } catch (e) {
        console.log(e);
        console.log(state.self.active, state.opponent.active, move);
      }
      if (est[0] > maxDamage) {
        maxDamage = est[0];
        bestMove = idx;
      }
    });

    return new MOVE(bestMove);
  }

  pickOne(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

module.exports = MeetTheFakers;
