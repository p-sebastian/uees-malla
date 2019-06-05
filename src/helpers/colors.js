/**
 * key = campo formacion
 */
let CF_COLOR = {};
/**
 * key = Unidad curricular
 */
let UC_COLOR = {};

/**
 * 
 * @param {[{}]} res 
 */
export const save = (res) => {
  const cf = res[0].campos_formacion;
  const uc = res[0].unidad_curricular;
  const s_cf = [];
  const s_uc = [];

  for (let k in cf) {
    const { ID, color = 'FFFFF', text = 'black', valor } = cf[k];
    CF_COLOR[ID] = { fill: `#${color}`, text };
    s_cf.push({ name: valor, color: `#${color}`, id: ID });
  }
  for (let k in uc) {
    const { ID, color = 'FFFFF', valor } = uc[k];
    UC_COLOR[ID] = { fill: `#${color}` };
    s_uc.push({ name: valor, color: `#${color}`, id: ID });
  }
  return { cfColor: s_cf, ucColor: s_uc };
}

const CELL_COLOR = {
  aprobada: {
    stroke: '#2E7D32',
    textColor: '#2E7D32',
    background: 'white',
    strokeWidth: 5
  },
  subscribed: {
    stroke: '#01579B',
    textColor: '#01579B',
    background: 'white',
    strokeWidth: 5
  },
  reprobada: {
    stroke: '#D50000',
    textColor: '#D50000',
    background: 'white',
    strokeWidth: 5
  }
}

export const getColors = () => ({ CF_COLOR, UC_COLOR, CELL_COLOR });