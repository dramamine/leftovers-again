


export default class Opponent extends React.Component {

  render() {
    const matches;

  }
}


export default class Match  extends React.Component {

  render() {

  }
}


export default class Pokemon extends React.Component {
  mouseover() {
    UserStore.setActiveMon(this.props.species);
  }

  mouseout() {
    UserStore.setActiveMon(null);
  }

  isRelatedToHoveredPokemon() {
    const hovered = UserStore.getActiveMon();
    return this.props.damagedBy.indexOf(hovered) >= 0 ||
        this.props.species == hovered;
  }

  render() {
    const img = 'http://www.smogon.com/dex/media/sprites/xy/' + this.props.species + '.gif';
    let c = (this.props.dead)
      ? 'dead-pokemon'
      : 'alive-pokemon';

    const hovered = UserStore.getActiveMon();
    if(hovered) {
      if(this.isRelatedToHoveredPokemon()) {
        c = c + ' hovered-pokemon';
      } else {
        c = c + ' unhovered-pokemon';
      }
    }

    return (<div onMouseOver={this.mouseover} onMouseOut={this.mouseout}>
      <img className="pokemon {c}" src={img}
      </div>);
  }
}

export default class DamageMoves extends React.Component {
  isRelatedToHoveredPokemon() {
    if (UserStore.getActiveMon() == this.props.from) return true;
    if (UserStore.getActiveMove() == this.props.from) return true;
    return false;
  }
  render() {
    // {
    //  damage: x
    //  from: y
    // }
    const hovered = UserStore.isActive();
    if(hovered) {
      if(this.isRelatedToHoveredPokemon()) {
        c = c + ' hovered-pokemon';
      } else {
        c = c + ' unhovered-pokemon';
      }
    }
  }
}


export default class UserStore {
  constructor() {
    this.state = {
      mon: null,
      move: null
    }
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
  getActiveMOve() {
    return this.state.move;
  }
  setActiveMove(move) {
    this.state.move = move;
  }
}