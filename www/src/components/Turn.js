import React from 'react';
import EventCell from 'components/EventCell';
import PokemonSimple from 'components/PokemonSimple';
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
          const receiver = (event.from === event.to)
            ? 'self'
            : event.to;
          eventCell.push('cast ' + event.move + ' on ' + receiver);
        }

        // moves done to me
        if (event.type === 'move' && event.topos === pos) {
          // we're not reporting any boosts, status effects, etc. here
          if (event.damagepct) {
            eventCell.push('took ' + event.damagepct + '% damage from ' + event.move);
          }
        }

        // damage taken
        if (event.type === 'damage') {
          if (event.frompos === event.topos) return;
          eventCell.push('took ' + event.damagepct + '% damage from ' + event.from);
        }

        if (event.type === 'switch') {
          eventCell.push('switched into ' + event.to);
        }
      });

      const ps = eventCell.map(str => <p>{str}</p>);
      if (this.props.statuses && this.props.statuses.length > 0) {
        console.log(this.props.statuses);
        const mystatus = this.props.statuses.filter(status => {return status.position === pos; })[0];
        if (mystatus) {
          ps.unshift(<PokemonSimple
            species={mystatus.species}
            condition={mystatus.condition}
          />);
        }
      }
      return  <td>{ps}</td>;
    });


    return <tr><td>{this.props.id}</td>{eventCells}</tr>;
  }
}
