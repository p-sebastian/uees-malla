import axios from 'axios';

const URL = 'http://localhost:8099';

export const malla = (idMalla) =>
  axios.get(`${URL}/WebServices/MallaJSON/GeneracionJsonMalla/BuscaMalla`, { params: { idMalla }});

export const color = () =>
  axios.get(`${URL}/WebServices/ColoresMallaJSON/GeneracionJsonColorMalla/GetColor`);

export const mallaTest = () =>
  axios.post(`${URL}/malla`);

export const colorTest = () =>
  axios.get(`${URL}/color`);