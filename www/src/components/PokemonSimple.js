import React from 'react';
import UserStore from 'stores/UserStore';
import Util from 'components/util';

require('styles/pokemon.css');

export default class PokemonSimple extends React.Component {
  constructor(props) {
    super(props);
  }

  getImage(species) {
    return 'http://www.smogon.com/dex/media/sprites/xy/' +
      species.toLowerCase() + '.gif';
  }

  render() {
    const img = this.getImage(this.props.species);


    return (<div>
      <img src={img} className="simple" />
      <span>condition: {this.props.condition}</span>
      </div>);
  }
}
