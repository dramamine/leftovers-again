import React from 'react';
import UserStore from 'stores/UserStore';
import Util from 'components/util';

require('styles/pokemon.css');

export default class Pokemon extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);

    this.mouseover = this.mouseover.bind(this);
    this.mouseout = this.mouseout.bind(this);
  }
  mouseover() {
    console.log('mouseover called.');
    UserStore.setActiveMon(this.props.data.species);
  }

  mouseout() {
    console.log('mouseout called.');
    UserStore.setActiveMon(null);
  }

  isRelatedToHoveredPokemon() {
    const hovered = UserStore.getActiveMon();
    return this.props.damagedBy.indexOf(hovered) >= 0 ||
        this.props.data.species === hovered;
  }

  getImage(species) {
    return 'http://www.smogon.com/dex/media/sprites/xy/' +
      species.toLowerCase() + '.gif';
  }

  render() {
    const img = this.getImage(this.props.data.species);
    let c = (this.props.data.dead)
      ? 'dead-pokemon'
      : 'alive-pokemon';

    c += ' pokemon';

    const hovered = UserStore.getActiveMon();
    if (hovered) {
      if (this.isRelatedToHoveredPokemon()) {
        c = c + ' hovered-pokemon';
      } else {
        c = c + ' unhovered-pokemon';
      }
    }

    const damagedBy = this.props.events.filter(e => {
      const id = Util.toId(this.props.data.owner, this.props.data.species);
      return id === Util.withoutPos(e.to);
    }).map(e => {
      return (<li>
        <div>From: {e.from}</div><br />
        <div>Damage: {e.damage}</div><br />
        <div>Move: {e.move}</div>
        </li>);
    });

    return (<div className={c} onMouseOver={this.mouseover} onMouseOut={this.mouseout}>
      <img src={img} />
      <p>Some more details here.</p>
      <ul>{damagedBy}</ul>
      </div>);
  }
}
