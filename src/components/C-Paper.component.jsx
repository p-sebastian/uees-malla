import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { createPaper, renderCells, parseData, isUndefined } from '../helpers/linking';
import { save } from '../helpers/colors';
import * as API from '../helpers/api';
import { Card, Typography, CardContent, Chip } from '@material-ui/core';

class CPaper extends Component {
  state = { cfColor: [], ucColor: [], width: 100, header: {} };

  async check() {
    const idMalla = isUndefined('idMalla');
    const idAlumno = isUndefined('idAlumno');
    return await idAlumno === null ? API.malla(idMalla) : API.student(idMalla, idAlumno);
  }
  async color(width) {
    let data = await API.color(isUndefined('idMalla'));
    const colors = save(data);
    this.setState({ ...colors, width });
  }
  componentDidMount() {
    this._renderPaper();
  }

  render() {
    const { container, chipContiner, title, subtitle, header } = this.props.classes;
    const { width, cfColor, ucColor, header: { Carrera } } = this.state;

    return (
      <div>
        <Card style={{ width, backgroundColor: '#6D1B33' }} className={container}>
          <CardContent>
            <div>
              <Typography 
                gutterBottom 
                variant="h2" 
                component="h2"
                className={title}
              >
                {Carrera}
              </Typography>
              <Typography 
                gutterBottom 
                variant="h3" 
                component="h3"
                className={subtitle}
              >
                Malla Curricular
              </Typography>
            </div>
          </CardContent>
        </Card>
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
                className={header}
              >
                Campo Formacion
              </Typography>
            </div>
            <div style={{ width }} className={chipContiner}>
              {this.renderChips(cfColor)}
            </div>
          </CardContent>
        </Card>

        <Card style={{ width }} className={container}>
          <CardContent>
            <div className={chipContiner}>
              <Typography 
                gutterBottom 
                variant="h4" 
                component="h2"
                className={header}
              >
                Unidad Curricular
              </Typography>
            </div>
            <div style={{ width }} className={chipContiner}>
              {this.renderChips(ucColor)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  async _renderPaper() {
    let res = await this.check();
    const { data, dimensions, header } = parseData(res);
    await this.color(dimensions.width * 270 - 70);

    this.setState({ header });
    createPaper(this._ref, dimensions);
    renderCells(data);
  }
  renderChips(colors = []) {
    return colors.map(({ name, color, id }) => (
      <Chip
        key={id}
        label={name}
        variant="outlined"
        style={{
          backgroundColor: color,
          margin: 5,
          borderWidth: 1.5,
          borderColor: 'black'
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
    flexWrap: 'wrap'
  },
  header: {
    fontWeight: 500,
    textTransform: 'uppercase'
  },
  title: {
    display: 'flex',
    letterSpacing: 2,
    fontWeight: 500,
    textTransform: 'uppercase',
    color: 'white'
  },
  subtitle: {
    letterSpacing: 2,
    color: 'white',
    textTransform: 'uppercase',
    fontWeight: 300
  }
};

export default withStyles(styles)(CPaper);