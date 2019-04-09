import axios from 'axios';

const URL = 'http://localhost:8099';

export const malla = (idMalla) =>
  axios.get(`${URL}/WebServices/MallaJSON/GeneracionJsonMalla/BuscaMalla`, { params: { idMalla }});

export const testAPI = () =>
  axios.post(`${URL}/malla`);
