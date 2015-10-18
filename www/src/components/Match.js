import React from 'react';
import Pokemon from 'components/Pokemon';
import Util from 'components/util';
import UserStore from 'stores/UserStore';


export default class Match extends React.Component {
  constructor(props) {
    super(props);
    console.log('Match class created with props', props);

    this.createPokemonElements = this.createPokemonElements.bind(this);
  }

  createPokemonElements(m) {
    const relevantEvents = this.props.data.events.filter(e => {
      const id = Util.toId(m.owner, m.species);
      return id === Util.withoutPos(e.from) || id === Util.withoutPos(e.to);
    });

    return (<Pokemon data={m} events={relevantEvents}/>);
  }


  render() {
    const won = this.props.data.won ? 'YEP' : 'nope';
    const myPokemon = this.props.data.pokemons
      .filter(m => m.owner === UserStore.getSelf())
      .map(this.createPokemonElements);
    const yourPokemon = this.props.data.pokemons
      .filter(m => m.owner !== UserStore.getSelf())
      .map(this.createPokemonElements);

    return (<div>
        <h4>Won: {won}</h4>
        <h5>Damage done: {this.props.data.damageDone}</h5>
        <h5>Damage taken: {this.props.data.damageTaken}</h5>
        <div className="pokemon-container">
          {myPokemon}
          <div className="team-separator">vs.</div>
          {yourPokemon}
        </div>
      </div>);
  }
}
