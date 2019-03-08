import * as joint from 'jointjs';

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
    gridSize: 20, // pixels
    drawGrid: 'mesh'
  });
};

/**
 * create a cell and add it to the graph
 * cells are 180px in width and 70px in height, each
 * @param {{ x: number, y: number }} position of cell
 * @param {string} id of cell
 * @param {{ title: string, subtitle: string }} text cell text 
 * @param {{ text: string, cell: string }} color hex string color for the 2 elements
 */
export const addCell = (position, id, { title, subtitle } = { title: 'default', subtitle: 'default' }, color = {}) => {
  const cell = new joint.shapes.org.Member({
    position,
    /**
     * This is also styling of the cell element
     */
    id: id,
    attrs: {
        '.card': { fill: color.cell },
          // image: { 'xlink:href': 'images/'+ image, opacity: 0.7 },
        '.rank': { text: title, fill: color.text, 'word-spacing': '-5px', 'letter-spacing': 0},
        '.name': { text: subtitle, fill: color.text, 'font-size': 10, 'font-family': 'Arial', 'letter-spacing': 0 }
    }
  });
  // save cells for linking
  cells[id] = cell;
  graph.addCell(cell);
}

/**
 * @typedef {({ id: number, year: number, semester: number, pos: number })} dependants
 * @typedef {({ id: number, name: string, pos: number, dependants: [dependants] })} course
 * @typedef {([[[course]]])} jsonData
 */

/**
 * 
 * @param {jsonData} data 
 */
export const renderCells = (data = []) => {
  // must be the same as the cell element
  const width = 180;
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
        const { pos, id, name } = course;
        // set x coor based on course position.
        const offset = pos - 1;
        x = offset * (width + margin); 
        const cell = `c-malla:${YEAR}-${SEMESTER}-${pos}-${id}`;
        saveCourses(course, YEAR, SEMESTER, cell);
        addCell({ x, y }, cell, { title: id, subtitle: name });
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
const routing = (link, targetKey, { year, semester, pos }) => {
  const [tYear, tSemester, tPos] = targetKey.split(':')[1].split('-');
  let start = ['left', 'right', 'top', 'bottom'];
  let end = ['left', 'right', 'top', 'bottom'];
  // source semester is < target semester
  if (sum[year][semester] < sum[tYear][tSemester]) {
    const isVertical = pos === tPos;
    const isClose = pos + 1 === tPos || pos - 1 === tPos;
    if (isVertical) { start = ['bottom']; end = ['top']; }
    if (isClose) { start = ['left', 'right']; end = ['left', 'right']; }
    if (!isVertical && !isClose) {
      start = ['bottom']; end = ['top'];
    }
  }
  link.router('manhattan', {
    'step': 20,
    'startDirections': start,
    'endDirections': end
  });
  link.connector('jumpover');
}

export const parseData = (data = []) => {
  return data
    .map(y => 
      y.anio.map(s => 
        s.semestre.map(m =>
          m.materia.map(({ ID, name, pos, dependants }) => ({ id: ID, name, pos, dependants: dependants.map(d => d.ID) })))))
}