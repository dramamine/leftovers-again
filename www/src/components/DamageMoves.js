import React from 'react';
import UserStore from 'stores/UserStore';

export default class DamageMoves extends React.Component {

  isRelatedToHoveredPokemon() {
    if (UserStore.getActiveMon() === this.props.from) return true;
    if (UserStore.getActiveMove() === this.props.from) return true;
    return false;
  }

  render() {
    let c = '';
    // {
    //  damage: x
    //  from: y
    // }
    const hovered = UserStore.isActive();
    if (hovered) {
      if (this.isRelatedToHoveredPokemon()) {
        c = c + ' hovered-pokemon';
      } else {
        c = c + ' unhovered-pokemon';
      }
    }
  }
}

