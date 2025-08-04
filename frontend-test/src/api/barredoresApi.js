import axios from './axios';

// Listar barredores de una planilla
export const getBarredores = (planillaId) =>
  axios.get(`/barredores?planilla_id=${planillaId}`);

// Agregar barredor a una planilla
export const addBarredor = (data) =>
  axios.post('/barredores', data);

// Editar barredor
export const updateBarredor = (id, data) =>
  axios.put(`/barredores/${id}`, data);

// Eliminar barredor
export const deleteBarredor = (id) =>
  axios.delete(`/barredores/${id}`); 