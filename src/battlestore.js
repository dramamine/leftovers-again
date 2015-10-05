import Pokemon from './pokemon';
import _ from 'lodash';

export default class BattleStore {
  constructor() {
    this.state = {
      self: {
        active: [],
        reserve: [] // @TTODO
      },
      opponent: {
        active: [],
        reserve: [] // @TODO
      }
    };

    this.allmon = [];
    this.forceSwitch = false;
    this.teamPreview = false;
  }

  setPlayerId(id) {
    console.log('setting player ID to ', id);
    this.myid = id;
  }
  setPlayerNick(nick) {
    this.mynick = nick;
  }

  setActive(ident, details, condition) {
    const mon = this._getOrCreateMon(ident);
    mon.useDetails(details);
    mon.useCondition(condition);
    // console.log('checking owner', mon.state.owner, this.myid);
    if (mon.state.owner === this.myid) {
      this._setOrUpdateSelfActive(mon);
    } else {
      this._setOrUpdateOpponentActive(mon);
    }
  }

  handleDeath(ident) {
    const guy = this._findById( this._identToId(ident) );
    const selfIndex = this.state.self.active.indexOf(guy);
    if ( selfIndex >= 0 ) {
      console.log('my guy died, need to remove him');
      this.state.self.active.splice(selfIndex, 1);
    }

    const yourIndex = this.state.opponent.active.indexOf(guy);
    if (yourIndex >= 0) {
      console.log('your guy died, need to remove him');
      this.state.opponent.active.splice(yourIndex, 1);
    }
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
    const iamowner = (mon) => { return mon.state.owner === this.myid; };
    const youareowner = (mon) => { return mon.state.owner !== this.myid; };

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
    if (mon.state.active && this.state.self.active.indexOf(mon) === -1) {
      console.log('found the active one');
      this.state.self.active.push(mon);
    }
  }


  _setOrUpdateOpponentActive(mon) {
    if (this.state.opponent.active.indexOf(mon) === -1) {
      console.log('found the active one');
      this.state.opponent.active.push(mon);
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
    return this.allmon.find( (mon) => { return mon.state.id === id; });
  }

  _identToId(ident) {
    return ident.replace('a: ', ': ');
  }

}

