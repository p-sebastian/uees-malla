import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { createPaper, renderCells, parseData } from '../helpers/linking';
import testMalla from '../static/requestWSmalla.json';
import testColor from '../static/color.json';
import { save, getColors } from '../helpers/colors';
import * as API from '../helpers/api';
import _ from 'lodash';


class CPaper extends Component {
  state = { positions: [] };

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
    console.info('rendered');

    return (
      <div id="home" className={container}>
        <div className={paper} ref={ref => this._ref = ref}></div>
        {this.renderBackground()}
      </div>
    );
  }

  async _renderPaper() {
    await this.color();
    let res = await this.check();
    const { data, dimensions } = parseData(res);

    createPaper(this._ref, dimensions);
    renderCells(data, positions => this.setState({ positions }));
  }
  renderBackground() {
    const { positions } = this.state;
    console.info('r', JSON.stringify(positions));
    const { UC_COLOR } = getColors();
    return positions.map(({ x, y, ucId }) => (
      <div style={{ 
        left: `${x}px`, top: `${y}px`, backgroundColor: UC_COLOR[ucId].fill,
        position: 'absolute',
        zIndex: 1,
        width: '270px',
        height: '100px'
      }}></div>
    ));
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