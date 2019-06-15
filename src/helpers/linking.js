import * as joint from 'jointjs';
import { getColors } from './colors';
import _ from 'lodash';
const COLORS = getColors();

let graph = new joint.dia.Graph();
let cells = {};
let sum = [0];
let courses = {};
let maxCourses = 1;

/**
 * creates the paper
 * @param {HTMLElement} ref
 * @param {{ width: number, height: number }} dimensions
 */
export const createPaper = (ref, { width, height }) => {
  maxCourses = width;
  // reset on init
  graph = new joint.dia.Graph();
  cells = {};
  sum = [0];
  courses = {};

  new joint.dia.Paper({
    el: ref,
    model: graph,
    interactive: false,
    height: height * 140 - 70, // cell (height + margin) * num of semesters - last margin
    width: width * 270 - 70, // cell (width + margin) * max num of courses in a semester - last margin
    gridSize: 10, // pixels
    // drawGrid: 'mesh'
  });
};

/**
 * @typedef {({ id: number, year: number, semester: number, pos: number })} dependants
 * @typedef {({ id: number, name: string, pos: number, cod_materia: string, obligatorio: boolean, total_horas: number, creditos_acad: string, materia_aprobada: boolean, campo_formacion: number, unidad_curricular: number, cursando: boolean, materia_reprobada: boolean, dependants: [dependants] })} course
 * @typedef {([[[course]]])} jsonData
 */

/**
 * create a cell and add it to the graph
 * cells are 180px in width and 70px in height, each
 * @param {{ x: number, y: number }} position of cell
 * @param {string} id of cell NOT THE SAME AS course id
 * @param {course} course
 * @param {{ text: string, cell: string }} color hex string color for the 2 elements
 */
export const createCellsAndBackground = (position, id, course, color = {}) => {
  const { unidad_curricular, pos } = course;
  const cell = createCell(id, position, cellStyling(course));
  
  // adds background colors
  fillBackground(position, unidad_curricular, pos);
  // save cells for rendering and linking
  cells[id] = cell;
}

const fillBackground = (() => {
  let prevPos = 0; // starts at NO course
  let prevCoor = { x: 0, y: 0 };
  let prevUC = 'empty';
  return (coor, unidad_curricular, pos) => {
    const backgrounds = [];
    // this means that it skipped a course horizontally, so it must be filled
    if (coor.y === prevCoor.y && pos - prevPos > 1) {
      // the for is in case it skipped more than one
      for (let i = pos - prevPos; i < pos; i++) {
        prevCoor.x = prevCoor.x + 270;
        backgrounds.push(createBackgroundCell(prevCoor, prevUC));
      }
    }
    // didnt fill the max number of courses horizontally on last semester
    if (coor.y !== prevCoor.y && prevPos < maxCourses) {
      // the for is in case it skipped more than one
      for (let i = maxCourses - prevPos; i < maxCourses; i++) {
        prevCoor.x = prevCoor.x + 270;
        backgrounds.push(createBackgroundCell(prevCoor, prevUC));
      }
    }
    backgrounds.push(createBackgroundCell(coor, unidad_curricular));
    prevUC = unidad_curricular;
    prevCoor = { ...coor };
    prevPos = pos;
    
    graph.addCells(backgrounds);
  }
})();

const createBackgroundCell = (coor, unidad_curricular) => {
  const x = coor.x - 45;
  const y = coor.y - 35
  const background = new joint.shapes.standard.Rectangle({ 
    position: { x, y },
    size: { width: 270, height: 140 }, // + right margin of 70 + 20px, and bottom of 70px
    attrs: { 
      body: { fill: COLORS.UC_COLOR[unidad_curricular].fill, stroke: 'none' } 
    }
  });
  return background;
}

/**
 * @param {course} course 
 */
const cellStyling = ({ name, total_horas, obligatorio, cod_materia, campo_formacion, unidad_curricular, cursando, materia_aprobada, materia_reprobada}) => {
  const { fill, text } = COLORS.CF_COLOR[campo_formacion];
  const { aprobada, reprobada, subscribed } = COLORS.CELL_COLOR;
  let background = fill;
  let textColor = text;
  let stroke = 'black';
  let strokeWidth = 2;
  if (materia_aprobada) {
    textColor = aprobada.textColor
    background = aprobada.background
    stroke = aprobada.stroke;
    strokeWidth = aprobada.strokeWidth;
  }
  else if (cursando) {
    textColor = subscribed.textColor
    background = subscribed.background
    stroke = subscribed.stroke;
    strokeWidth = subscribed.strokeWidth;
  }
  else if (materia_reprobada) {
    textColor = reprobada.textColor
    background = reprobada.background
    stroke = reprobada.stroke;
    strokeWidth = reprobada.strokeWidth;
  }
  return { title: `${cod_materia} (${total_horas})`, subtitle: name, background, textColor, styling: { stroke, strokeWidth } };
}
const createCell = (id, position, { title, subtitle, background, textColor, styling }) =>
  new joint.shapes.org.Member({
    position,
    /**
     * This is also styling of the cell element
     */
    id: id,
    attrs: {
        '.card': { ...styling, fill: background },
          // image: { 'xlink:href': 'images/'+ image, opacity: 0.7 },
        '.rank': { text: title, fill: textColor, 'font-family': 'Arial', 'letter-spacing': 0, 'text-decoration': 'none' },
        '.name': { text: subtitle, fill: textColor, 'font-size': 8, 'font-family': 'Arial', 'letter-spacing': 0 }
    }
  });

/**
 * 
 * @param {jsonData} data 
 */
export const renderCells = (data = []) => {
  // must be the same as the cell element
  const width = 200;
  // bottom, right margin
  const margin = 70;
  let x = 0;
  let y = 0;
  data.forEach((year, yi) => {
    const YEAR = yi + 1;
    sum[YEAR] = {};
    year.forEach((semester, si) => {
      const SEMESTER = si + 1;
      /**
       * saves sum.year.semester = its position in row vertically
       */
      sum[YEAR][SEMESTER] = SEMESTER + sum[0];
      semester.forEach(course => {
        const { pos, id } = course;
        // set x coor based on course position.
        const offset = pos - 1;
        x = offset * (width + margin); 
        const cell = `c-malla:${YEAR}-${SEMESTER}-${pos}-${id}`;
        saveCourses(course, YEAR, SEMESTER, cell);
        createCellsAndBackground({ x, y }, cell, course);
      });
      x = 0;
      y += 70 + margin;
    })
    sum[0] += year.length;
  });
  ordering();
}


const ordering = () => {
  // cells are rendered here, because order is important on svgs
  for (let key in cells) {
    graph.addCell(cells[key]);
  }
  for (let key in courses) {
    const { dependants, cellId } = courses[key];
    // only adds links if it has dependants
    if (dependants && dependants.length) {
      renderLinks(cellId, dependants);
    }
  }
}

/**
 * save course data, for easier access later
 * @param {course} course 
 * @param {number} year 
 * @param {number} semester
 * @param {string} cellId
 */
const saveCourses = (course, year, semester, cellId) => {
  courses[course.id] = {
    ...course,
    year,
    semester,
    cellId
  };
}

/**
 * draws links on paper
 * @param {string} target 
 * @param {[number]} sources
 */
const renderLinks = (target, sources) => {
  const links = [];
  sources.forEach((id) => {
    links.push(createLink(target, courses[id]));
  });
  graph.addCells(links);
}

/**
 * Creates pathfinding link using the manhattan router
 * @param {string} targetKey 
 * @param {dependants} dependant 
 */
const createLink = (targetKey, dependant) => {
  const { year, semester, id, pos } = dependant;
  const source = cells[`c-malla:${year}-${semester}-${pos}-${id}`];
  const target = cells[targetKey];
  const link = new joint.shapes.standard.Link({ source, target });
  routing(link, targetKey, dependant);
  return link;
}

/**
 * sets routing of links, when source is directly above target
 * it will connect 'bottom' source to 'top' target
 * if source is close by a factor of 1, diagonally or horizontally
 * it will connect from opposite sides, source:left -> target:right and viceversa
 * if target is far away > 1; it will connect source:bottom -> target:top
 * @param {joint.shapes.standard.Link} link 
 * @param {string} targetKey 
 * @param {dependants} source 
 */
const routing = (link, targetKey, { year, semester, pos, id }) => {
  const [tYear, tSemester, tPosStr] = targetKey.split(':')[1].split('-');
  const tPos = Number(tPosStr);
  const dif = sum[tYear][tSemester] - sum[year][semester];
  // const sourceSum = sum[year][semester];
  // const targetSum = sum[tYear][tSemester];
  let start = ['left', 'right', 'top', 'bottom'];
  let end = ['left', 'right', 'top', 'bottom'];
  // source semester is < target semester
  if (dif > 0) {
    const isVertical = pos === tPos;
    const isClose = pos + 1 === tPos || pos - 1 === tPos;
    const isBeginning = pos === 1;
    const isFar = !isVertical && !isClose;
    
    // console.info(`${id}, isClose: ${isClose}, isVertical: ${isVertical}, pos: ${typeof pos}, tpos: ${typeof tPos}`);

    if (isVertical) { start = ['bottom']; end = ['top']; }
    if (isClose) { start = ['left', 'right']; end = ['left', 'right']; }
    if (isFar) { start = ['bottom']; end = ['top']; }
    if (isBeginning && isFar) { start = ['right']; end = ['left']; }
    if (isBeginning && isVertical && dif > 1) { start = ['right']; end = ['right']; }
    link.connector(isVertical && dif === 1 ? 'normal' : 'jumpover');
  }
  link.router('manhattan', {
    'step': 10,
    'startDirections': start,
    'endDirections': end,
    'excludeTypes': ['standard.Rectangle']
  });
}
// Sort in ascending order
const asc = (a, b) => a.orden - b.orden;

export const parseData = (data = []) => {
  let maxMateria = 1;
  let maxSemestre = 0;
  const res = data[0].anio
    .sort(asc).map(s =>
      s.semestre.sort(asc).map(m => {
        maxSemestre++;
        return m.materia.map(({
           ID, name, pos, dependants, cod_materia, obligatorio, total_horas, creditos_acad,
           materia_aprobada, cursando, campo_formacion, unidad_curricular, materia_reprobada
         }) => {
          if (pos > maxMateria) { maxMateria = pos };
          return ({ 
            id: ID, 
            name: parseName(name), 
            pos, 
            dependants: dependants.map(d => d.ID),
            cod_materia,
            obligatorio,
            materia_aprobada,
            total_horas,
            creditos_acad,
            campo_formacion,
            unidad_curricular,
            cursando,
            materia_reprobada
          });
        })
      })
    );
  return {
    // for the paper dimensions
    dimensions: { width: maxMateria, height: maxSemestre },
    data: res,
    header: data[0].informacion_cabecera
  };
}

/**
 * adds a new line char, if name has more than 3 words
 * @param {string} name 
 */
const parseName = name => {
  const words = name.split(' ');
  if (words.length > 3) {
    words.splice(3, 0, '\n');
    return words.join(' ');
  }
  return name;
}

/**
 * @param {'idMalla' | 'idAlumno'} name 
 */
export const isUndefined = name => _.isUndefined(window[name]) || _.isNull(window[name]) ? null : window[name];