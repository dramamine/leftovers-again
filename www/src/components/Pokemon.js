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
    this.isRelatedToHoveredPokemon = this.isRelatedToHoveredPokemon.bind(this);
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
    const related = this.props.events.filter(e => e.from === hovered || e.to === hovered);
    return !!related;
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

    // const myMoves = this.props.events.filter(e => {
    //   const id = Util.toId(this.props.data.owner, this.props.data.species);
    //   return id === Util.withoutPos(e.from);
    // }).map(e => {
    //   return (<li key={e.from + e.move + e.to + e.turn + 0}>
    //     <div>I cast {e.move} on {e.to}</div>
    //     </li>);
    // });


    // const yourMoves = this.props.events.filter(e => {
    //   const id = Util.toId(this.props.data.owner, this.props.data.species);
    //   return id === Util.withoutPos(e.to);
    // }).map(e => {
    //   return (<li key={e.from + e.move + e.to + e.turn + 1}>
    //     <div>{e.from} cast {e.move} on me.</div>
    //     </li>);
    // });

    const justcause = this.props.events
      .filter(e => {
        if (e.type !== 'move') return false;
        return e.from === this.props.data.species && e.player === this.props.data.owner;
        // const id = Util.toId(this.props.data.owner, this.props.data.species);
        // return id === Util.withoutPos(e.from);
      })
      .reduce((previous, current) => {
        if (!previous[current.move]) previous[current.move] = {count: 0};
        previous[current.move].turn = current.turn;
        previous[current.move].count += 1;
        return previous;
      }, {});
    console.log(justcause);

    const causes = Object.keys(justcause).map(key => {
      const move = justcause[key];
      return (<ul key={key}>{key} x{move.count}</ul>);
    });

    const happened = this.props.events
      .filter(e => {
        if (e.type !== 'move') return false;
        return e.to === this.props.data.species && e.player !== this.props.data.owner;
        // const id = Util.toId(this.props.data.owner, this.props.data.species);
        // // happened to me, but exclude moves which I cast on myself
        // return id === Util.withoutPos(e.to) && id !== Util.withoutPos(e.from);
      })
      .reduce((previous, current) => {
        if (!previous[current.move]) previous[current.move] = {count: 0};
        previous[current.move].turn = current.turn;
        previous[current.move].count += 1;
        return previous;
      }, {});
    console.log(happened);

    const effects = Object.keys(happened).map(key => {
      const move = happened[key];
      return (<ul key={key}>{key} x{move.count}</ul>);
    });



    return (<div className={c} onMouseOver={this.mouseover} onMouseOut={this.mouseout}>
      <img src={img} />
      <p>Some more details here.</p>
      <ul>{causes}</ul>
      <ul>{effects}</ul>
      </div>);

    // return (<div className={c} onMouseOver={this.mouseover} onMouseOut={this.mouseout}>
    //   <img src={img} />
    //   <p>Some more details here.</p>
    //   <ul>{myMoves}</ul>
    //   <ul>{yourMoves}</ul>
    //   </div>);
  }
}
