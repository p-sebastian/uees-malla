import axios from 'axios';
import FAKE_MALLA from '../static/update/malla_teleco_new.json';
import FAKE_COLOR from '../static/color.json';
import FAKE_ALUMNO from '../static/update/alumnoReprobadas.json';

const exec = fallback => async function(url, params = {}) {
  try {
    let { data } = await getCall(url, params);
    return data;
  } catch (e) {
    console.error('call error, sending fallback', e);
    return fallback;
  }
}

const getCall = (...args) => axios.get(...args);

const URL = 'http://localhost:8099';

export const malla = idMalla => 
  exec(FAKE_MALLA)(`${URL}/WebServices/MallaJSON/GeneracionJsonMalla/BuscaMalla`, { idMalla });

export const color = () =>
  exec(FAKE_COLOR)(`${URL}/WebServices/ColoresMallaJSON/GeneracionJsonColorMalla/GetColor`);

export const student = (idMalla, idAlumno) =>
  exec(FAKE_ALUMNO)(`${URL}/WebServices/MallaJSONReprobadas/GeneracionJsonMalla/BuscaMalla`, { params: { idMalla, idAlumno }});

// export const mallaTest = () =>
//   axios.post(`${URL}/malla`);

// export const colorTest = () =>
//   axios.get(`${URL}/color`);

// export const studentTest = () =>
//   axios.get(`${URL}/student`);