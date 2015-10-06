import Pokemon from './pokemon';
import log from '../log';
// import _ from 'lodash';

// @TODO lazily leaving this here; now we will validate active state
// for singles games only. need to actually check the game type and
// make sure we have the right number. and do this in the getState()
// function instead!
const BATTLE_SIZE = 1;

export default class BattleStore {
  constructor() {
    this.state = {
      self: {
        active: [],
        reserve: [] // @TODO
      },
      opponent: {
        active: [],
        reserve: [] // @TODO
      }
    };

    this.allmon = [];
    this.forceSwitch = false;
    this.teamPreview = false;

    // @TODO
    // this.report = {
    //   self: this.state.self,
    //   opponent: this.state.opponent,
    //   turn: this.turn
    // };

  }

  setPlayerId(id) {
    this.myid = id;
  }
  setPlayerNick(nick) {
    this.mynick = nick;
  }
  setTurn(num) {
    this.turn = num;
  }

  setActive(ident, details, condition) {
    const mon = this._getOrCreateMon(ident);
    mon.useDetails(details);
    mon.useCondition(condition);
    // console.log('checking owner', mon.state.owner, this.myid);
    if (mon.getState().owner === this.myid) {
      this._setOrUpdateSelfActive(mon);
    } else {
      this._setOrUpdateOpponentActive(mon);
    }
  }

  handleDeath(ident) {
    const guy = this._findById( this._identToId(ident) );
    // const selfIndex = this.state.self.active.indexOf(guy);
    // if ( selfIndex >= 0 ) {
    //   console.log('my guy died, need to remove him');
    //   this.state.self.active.splice(selfIndex, 1);
    // }

    // const yourIndex = this.state.opponent.active.indexOf(guy);
    // if (yourIndex >= 0) {
    //   console.log('your guy died, need to remove him');
    //   this.state.opponent.active.splice(yourIndex, 1);
    // }
    const idx = this.allmon.indexOf(guy);
    this.allmon.splice(idx, 1);
  }

  handleDamage(ident, condition, explanation) {
    const mon = this._getOrCreateMon(ident);
    const oldhp = mon.state.hp;
    mon.useCondition(condition);
    mon.saveEvent({
      turn: this.turn, // @TODO
      damage: oldhp - mon.state.hp,
      from: explanation
    });
  }

  interpretRequest(data) {
    if (data.side && data.side.pokemon) {
      data.side.pokemon.map( (mon) => {
        const ref = this._getOrCreateMon(mon.ident);
        ref.assimilate(mon);

        // @TODO double-checking this, could probs refactor
        if (ref.state.active) {
          this._setOrUpdateSelfActive(ref);
        }
        // console.log('created mon ', ref);
      });
    }
    if (data.active) {
      console.log('ACTIVE:', data.active);
      data.active.forEach( (moveObj) => {
        this.state.self.active[0].updateMoveList(moveObj.moves);
      });
    }

    if (data.forceSwitch) {
      console.log('ok, request had a force switch in there.');
      this.forceSwitch = true;
    }
    if (data.teamPreview) {
      this.teamPreview = true;
    }
  }

  getState() {
    const output = {
      self: {},
      opponent: {}
    };
    // const output = _.clone(this.state, true);
    const stateGetter = (mon) => { return mon.getState(); };
    const iamowner = (mon) => { return mon.getState().owner === this.myid; };
    const youareowner = (mon) => { return mon.getState().owner !== this.myid; };

    // use getState so we can filter out any crap.
    output.self.active = this.state.self.active.map(stateGetter);
    output.self.reserve = this.allmon.filter(iamowner).map(stateGetter);
    output.opponent.active = this.state.opponent.active.map(stateGetter);
    output.opponent.reserve = this.allmon.filter(youareowner).map(stateGetter);

    // compress arrays to singles
    if (output.self.active.length === 1) {
      output.self.active = output.self.active[0];
    }
    if (output.opponent.active.length === 1) {
      output.opponent.active = output.opponent.active[0];
    }

    // @TODO ew, I don't like this because it's destructive inside a get fn
    if (this.forceSwitch) {
      console.log('including forceSwitch...');
      output.forceSwitch = true;
      this.forceSwitch = false;
    }

    if (this.teamPreview) {
      output.teamPreview = true;
      this.teamPreview = false;
    }

    // @TODO reserves
    return output;
  }

  _setOrUpdateSelfActive(mon) {
    if (this.state.self.active.indexOf(mon) === -1) {
      this.state.self.active.push(mon);
    }
    if (this.state.self.active.length > BATTLE_SIZE) {
      log.error('BattleStore: self had more than one active pokemon!',
        this.state.self.active);
    }
  }


  _setOrUpdateOpponentActive(mon) {
    if (this.state.opponent.active.indexOf(mon) === -1) {
      this.state.opponent.active.push(mon);
    }
    if (this.state.opponent.active.length > BATTLE_SIZE) {
      log.error('BattleStore: opponent had more than one active pokemon!',
        this.state.opponent.active);
    }
  }

  _getOrCreateMon(ident) {
    const id = this._identToId(ident);
    if (!this._findById(id)) {
      this.allmon.push(new Pokemon(id));
    }
    return this._findById(id);
  }

  _findById(id) {
    return this.allmon.find( (mon) => { return mon.getState().id === id; });
  }

  _identToId(ident) {
    return ident.replace('a: ', ': ');
  }

}

