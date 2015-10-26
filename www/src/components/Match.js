import React from 'react';
import Pokemon from 'components/Pokemon';
import Util from 'components/util';
import Timeline from 'components/Timeline';
import UserStore from 'stores/UserStore';


export default class Match extends React.Component {
  constructor(props) {
    super(props);
    console.log('Match class created with props', props);

    this.createPokemonElements = this.createPokemonElements.bind(this);
  }

  createPokemonElements(m) {
    const relevantEvents = this.props.data.events.filter(e => {
      return (m.owner === e.player && e.from === m.species) ||
        (m.owner !== e.player && e.to === m.species);
    });

    return (<Pokemon key={m.owner + m.species} data={m} events={relevantEvents}/>);
  }


  render() {
    const won = this.props.data.won ? 'YEP' : 'nope';
    const mine = this.props.data.mine
      .map(this.createPokemonElements);
    const yours = this.props.data.yours
      .map(this.createPokemonElements);

    return (<div>
        <h4>Won: {won}</h4>
        <h5>Damage done: {this.props.data.damageDone}</h5>
        <h5>Damage taken: {this.props.data.damageTaken}</h5>
        <Timeline events={this.props.data.events} statuses={this.props.data.statuses} />

        <div className="pokemon-container">
          {mine}
          <div className="team-separator">vs.</div>
          {yours}
        </div>
      </div>);
  }
}
