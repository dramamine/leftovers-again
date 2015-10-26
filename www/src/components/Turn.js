import React from 'react';
import EventCell from 'components/EventCell';
// import Pokemon from 'components/Pokemon';
// import Util from 'components/util';
// import UserStore from 'stores/UserStore';


export default class Turn extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const tableorder = ['p1a', 'p1b', 'p1c', 'p2a', 'p2b', 'p2c'];

    const eventCells = tableorder.map( pos => {
      const eventCell = [];

      const mypos = this.props.data.filter( event => {
        return event.frompos === pos || event.topos === pos;
      });

      mypos.forEach( event => {
        // moves that I executed
        if (event.type === 'move' && event.frompos === pos) {
          eventCell.push('cast ' + event.move + ' on ' + event.to);
        }

        // moves done to me
        if (event.type === 'move' && event.topos === pos) {
          eventCell.push('took ' + event.damagepct + '% damage from ' + event.move);
        }

        // damage taken
        if (event.type === 'damage') {
          eventCell.push('took ' + event.damagepct + '% damage from ' + event.from);
        }

        if (event.type === 'switch') {
          eventCell.push('switched into ' + event.to);
        }
      });

      const ps = eventCell.map(str => <p>{str}</p>);
      return <td>{ps}</td>;
    });


    return <tr>{eventCells}</tr>;
  }
}
