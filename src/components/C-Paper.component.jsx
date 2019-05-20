import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { createPaper, renderCells, parseData } from '../helpers/linking';
import testMalla from '../static/update/malla.json';
import testColor from '../static/update/color.json';
import { save } from '../helpers/colors';
import * as API from '../helpers/api';
import _ from 'lodash';


class CPaper extends Component {

  async check() {
    const idMalla = (_.isUndefined(window.idMalla) || _.isNull(window.idMalla)) ? 1 : window.idMalla;
    try {
      let { data } = await API.malla(idMalla);
      console.info('response', data);
      return data;
    } catch (e) {
      return testMalla;
    }
  }
  async color() {
    try {
      let { data } = await API.color();
      save(data);
    } catch (e) {
      save(testColor);
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
    await this.color();
    
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