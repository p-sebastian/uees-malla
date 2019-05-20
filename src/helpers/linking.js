import * as joint from 'jointjs';
import { getColors } from './colors';
const COLORS = getColors();

let graph = new joint.dia.Graph();
let cells = {};
let sum = [0];
let courses = {};

/**
 * creates the paper
 * @param {HTMLElement} ref 
 */
export const createPaper = ref => {
  // reset on init
  graph = new joint.dia.Graph();
  cells = {};
  sum = [0];
  courses = {};

  const { height, width } = ref.getBoundingClientRect();
  new joint.dia.Paper({
    el: ref,
    model: graph,
    interactive: false,
    height,
    width,
    gridSize: 10, // pixels
    // drawGrid: 'mesh'
  });
};

/**
 * @typedef {({ id: number, year: number, semester: number, pos: number })} dependants
 * @typedef {({ id: number, name: string, pos: number, cod_materia: string, obligatorio: boolean, total_horas: number, creditos_acad: string, materia_aprobada: boolean, campo_formacion: number, dependants: [dependants] })} course
 * @typedef {([[[course]]])} jsonData
 */

/**
 * create a cell and add it to the graph
 * cells are 180px in width and 70px in height, each
 * @param {{ x: number, y: number }} position of cell
 * @param {string} id of cell
 * @param {course} course
 * @param {{ text: string, cell: string }} color hex string color for the 2 elements
 */
export const addCell = (position, id, course, color = {}) => {
  const { name, total_horas, obligatorio, cod_materia, campo_formacion } = course;
  const { fill, text } = COLORS.CF_COLOR[campo_formacion];
  const cell = new joint.shapes.org.Member({
    position,
    /**
     * This is also styling of the cell element
     */
    id: id,
    attrs: {
        '.card': { fill },
          // image: { 'xlink:href': 'images/'+ image, opacity: 0.7 },
        '.rank': { text: `${cod_materia} (${total_horas})`, fill: text, 'font-family': 'Arial', 'letter-spacing': 0, 'text-decoration': 'none' },
        '.name': { text: name, fill: text, 'font-size': 8, 'font-family': 'Arial', 'letter-spacing': 0 }
    }
  });
  // save cells for linking
  cells[id] = cell;
  graph.addCell(cell);
}

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
        addCell({ x, y }, cell, course);
      });
      x = 0;
      y += 70 + margin;
    })
    sum[0] += year.length;
  });
  ordering();
}


const ordering = () => {
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
    'endDirections': end
  });
}
// Sort in ascending order
const asc = (a, b) => a.orden - b.orden;

export const parseData = (data = []) => {
  return data.map(y =>
    y.anio.sort(asc).map(s =>
      s.semestre.sort(asc).map(m =>
        m.materia.map(({ ID, name, pos, dependants, cod_materia, obligatorio, total_horas, creditos_acad, materia_aprobada, campo_formacion }) => {
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
            campo_formacion
          });
        })
      )
    )
  );
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