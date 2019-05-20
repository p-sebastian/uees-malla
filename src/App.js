import 'jointjs/dist/joint.min.css';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { CPaper } from './components';

class App extends Component {
  render() {
    return (
      <div className={this.props.classes.root}>
        <CPaper />
      </div>
    );
  }
}

const styles = {
  root: {
    width: '100%',
    height: '100%'
  }
}

export default withStyles(styles)(App);
