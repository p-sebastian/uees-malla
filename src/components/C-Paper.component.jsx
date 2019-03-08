import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { createPaper, renderCells, parseData } from '../helpers/linking';
import json from '../static/arte.json';
import sistemas from '../static/sistemas.json';


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
    createPaper(this._ref);
    const data = parseData(json)[0];
    console.info(data);
    console.info(sistemas);
    renderCells(data);
  }
}

const styles = {
  paper: {
    width: '100%',
    height: '100%'
  }
};

export default withStyles(styles)(CPaper);