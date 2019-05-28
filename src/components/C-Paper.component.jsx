import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { createPaper, renderCells, parseData } from '../helpers/linking';
import testMalla from '../static/update/malla_teleco_new.json';
import testColor from '../static/color.json';
import { save, getColors } from '../helpers/colors';
import * as API from '../helpers/api';
import _ from 'lodash';
import { Card, Typography, CardContent, Chip } from '@material-ui/core';

class CPaper extends Component {
  state = { cfColor: [], ucColor: [], width: 100 };

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
  async color(width) {
    try {
      let { data } = await API.color();
      const colors = save(data);
      this.setState({ ...colors, width });
    } catch (e) {
      const colors = save(testColor);
      this.setState({ ...colors, width });
    }
  }
  componentDidMount() {
    this._renderPaper();
  }

  render() {
    const { container, chipContiner } = this.props.classes;
    const { width } = this.state;

    return (
      <div>
        <Card style={{ width }} className={container}>
          <div ref={ref => this._ref = ref}></div>
        </Card>
        <Card style={{ width }} className={container}>
          <CardContent>
            <div className={chipContiner}>

              <Typography 
                gutterBottom 
                variant="h4" 
                component="h2"
                style={{ textTransform: 'uppercase' }} 
              >
                Campo Formacion
              </Typography>
            </div>
            <div style={{ width }} className={chipContiner}>
              {this.renderCFChips()}
            </div>
          </CardContent>

        </Card>
      </div>
    );
  }

  async _renderPaper() {
    let res = await this.check();
    const { data, dimensions } = parseData(res);
    await this.color(dimensions.width * 270 - 70);

    createPaper(this._ref, dimensions);
    renderCells(data);
  }
  renderCFChips() {
    const { cfColor } = this.state;
    return cfColor.map(({ name, color, id }) => (
      <Chip
        key={id}
        label={name}
        style={{
          backgroundColor: color,
          margin: 5
        }}
      />
    ))
  }
}


const styles = {
  container: {
    padding: '10px',
    margin: 15
  },
  chipContiner: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  }
};

export default withStyles(styles)(CPaper);