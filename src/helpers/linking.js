import * as joint from 'jointjs';

const graph = new joint.dia.Graph();

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
 * @param {{ x: number, y: number }} position of cell
 * @param {{ title: string, subtitle: string }} text cell text 
 * @param {{ text: string, cell: string }} color hex string color for the 2 elements
 */
export const addCell = (position, { title, subtitle } = { title: 'default', subtitle: 'default' }, color = {}) => {
  const cell = new joint.shapes.org.Member({
    position,
    /**
     * This is also styling of the cell element
     */
    attrs: {
        '.card': { fill: color.cell },
          // image: { 'xlink:href': 'images/'+ image, opacity: 0.7 },
        '.rank': { text: title, fill: color.text, 'word-spacing': '-5px', 'letter-spacing': 0},
        '.name': { text: subtitle, fill: color.text, 'font-size': 13, 'font-family': 'Arial', 'letter-spacing': 0 }
    }
  });
  graph.addCell(cell);
}