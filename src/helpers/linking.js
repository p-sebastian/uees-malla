import * as joint from 'jointjs';

const graph = new joint.dia.Graph();
let cells = {};

/**
 * creates the paper
 * @param {HTMLElement} ref 
 */
export const createPaper = (ref) => {
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
    year.forEach((semester, si) => {
      semester.forEach(({ pos, id, name }) => {
        // set x coor based on course position.
        const offset = pos - 1;
        x = offset * (width + margin); 
        const cell = `c-malla:${yi + 1}-${si + 1}-${id}`;
        addCell({ x, y }, cell, { title: id, subtitle: name });
      });
      x = 0;
      y += 70 + margin;
    })
  });
  renderLinksAfter(data);
}

/**
 * draws links on paper
 * @param {string} source 
 * @param {[dependants]} targets 
 */
export const renderLinks = (source, targets) => {
  const links = [];
  targets.forEach(({ year, semester, id }) => {
    const link = new joint.shapes.standard.Link();
    link.source(cells[source]);
    link.target(cells[`c-malla:${year}-${semester}-${id}`]);
    link.router('manhattan');
    link.connector('jumpover');
    links.push(link);
  });
  graph.addCells(links);
}

const renderLinksAfter = (data = []) => {
  data.forEach((year, yi) => {
    year.forEach((semester, si) => {
      semester.forEach(course => {
        const cell = `c-malla:${yi + 1}-${si + 1}-${course.id}`;
        if (course.dependants && course.dependants.length) {
          renderLinks(cell, course.dependants);
        }
      });
    })
  });
}