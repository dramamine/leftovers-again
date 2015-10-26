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
      </div>);

    // return (<div className={c} onMouseOver={this.mouseover} onMouseOut={this.mouseout}>
    //   <img src={img} />
    //   <p>Some more details here.</p>
    //   <ul>{myMoves}</ul>
    //   <ul>{yourMoves}</ul>
    //   </div>);
  }
}
