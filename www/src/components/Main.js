require('normalize.css');
require('styles/App.css');

import React from 'react';
import ExampleData from 'sources/exampledata';
import Opponent from 'components/Opponent';

const yeomanImage = require('../images/yeoman.png');

class AppComponent extends React.Component {
  render() {
    return (
      <div className="index">
        <img src={yeomanImage} alt="Yeoman Generator" />
        <div className="notice">
          <Opponent data={ExampleData.opponents[0]} />
        </div>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
