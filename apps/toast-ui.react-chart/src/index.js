import React from 'react';
import TuiChart from 'tui-chart';

export default class Chart extends React.Component {
  rootEl = React.createRef();

  render() {
    return (
      <div ref={this.rootEl}>
        Hello world
      </div>
    )
  }
}
