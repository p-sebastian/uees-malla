import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { createPaper, addCell } from '../helpers/linking';


class CPaper extends Component {
  componentDidMount() {
    this._renderPaper();
  }

  render() {
    const { paper } = this.props.classes;

    return (
      <div className={paper} ref={ref => this._ref = ref}></div>
    );
  }

  _renderPaper() {
    const { height, width } = this._ref.getBoundingClientRect();
    createPaper(this._ref);
    const x = width / 2;
    const y = height / 2;
    addCell({ x, y });
    addCell({ x: x + 180, y: y + 70 });
  }
}

const styles = {
  paper: {
    width: '100%',
    height: '100%'
  }
};

export default withStyles(styles)(CPaper);