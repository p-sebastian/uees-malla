import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { createPaper, renderCells, parseData } from '../helpers/linking';
import json from '../static/requestWSmalla.json';
import { malla, testAPI } from '../helpers/api';
import _ from 'lodash';


class CPaper extends Component {

  async check() {
    const idMalla = (_.isUndefined(window.idMalla) || _.isNull(window.idMalla)) ? 1 : window.idMalla;
    try {
      let { data } = await malla(idMalla);
      console.info('response', data);
      return data;
    } catch (e) {
      return json;
    }
  }
  componentDidMount() {
    this._renderPaper();
  }

  render() {
    const { paper, container } = this.props.classes;

    return (
      <div className={container}>
        <div className={paper} ref={ref => this._ref = ref}></div>
      </div>
    );
  }

  async _renderPaper() {
    createPaper(this._ref);
    let res = await this.check();
    const data = parseData(res)[0];
    renderCells(data);
  }
}

const styles = {
  paper: {
    width: '100%',
    height: '2000px',
  },
  container: {
    padding: '10px'
  }
};

export default withStyles(styles)(CPaper);