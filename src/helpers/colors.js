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

  for (let k in cf) {
    const { ID, color = 'FFFFF', text = 'black'} = cf[k];
    CF_COLOR[ID] = { fill: `#${color}`, text };
  }
  for (let k in uc) {
    const { ID, color = 'FFFFF'} = uc[k];
    UC_COLOR[ID] = { fill: `#${color}` };
  }
}

export const getColors = () => ({ CF_COLOR, UC_COLOR });