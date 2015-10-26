import React from 'react';
// import Pokemon from 'components/Pokemon';
// import Util from 'components/util';
// import UserStore from 'stores/UserStore';


export default class EventCell extends React.Component {
  constructor(props) {
    super(props);
    console.log('EventCell created', props);
  }

  render() {
    return (<div>
        {this.props.toString()}
      </div>);
  }
}
