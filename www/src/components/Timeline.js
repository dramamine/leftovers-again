import React from 'react';
// import EventCell from 'components/EventCell';
import Turn from 'components/Turn';
// import Pokemon from 'components/Pokemon';
// import Util from 'components/util';
// import UserStore from 'stores/UserStore';


export default class Timeline extends React.Component {
  constructor(props) {
    super(props);
    console.log('Timeline created', props);
  }

  processEvents(events) {
    const turns = [];

    // sort by turn
    events.forEach( event => {
      if (!event.turn && event.turn !== 0) {
        console.error('event did not have a turn', event);
        return;
      }

      if (!event.player) {
        console.error('event did not have a player', event);
        return;
      }

      if (!turns[event.turn]) turns[event.turn] = [];
      const thisTurn = turns[event.turn];

      const prevMoves = thisTurn.filter( evt => evt.type === 'move');
      const firstMove = event.type === 'move' &&
        prevMoves.length === 0;

      if (firstMove) event.first = true;

      thisTurn.push(event);
    });

    const rows = turns.map( (turn, idx) => <Turn key={idx} data={turn} />);

    return <table className="turns">{rows}</table>;
  }


  render() {
    const stuff = this.processEvents(this.props.events);

    return (<div>
        {stuff}
      </div>);
  }
}
