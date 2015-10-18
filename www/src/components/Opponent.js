import React from 'react';
import Match from 'components/Match';

export default class Opponent extends React.Component {
  constructor(props) {
    super(props);
    console.log('Opponent class created with props', props);
  }

  render() {
    const matches = this.props.data.matches;
    const matchComponents = matches.map(m => (<Match data={m} />));

    return (<div>
        <h4>{this.props.data.name}</h4>
        <h5>{this.props.data.description}</h5>
        {matchComponents}
      </div>);
  }
}
