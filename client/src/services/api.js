import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const moodAPI = {
  getAll: () => api.get('/mood-entries'),
  create: (moodData) => api.post('/mood-entries', moodData),
  update: (id, moodData) => api.put(`/mood-entries/${id}`, moodData)
}

export const sensorAPI = {
  getAll: () => api.get('/sensor-readings'),
  create: (sensorData) => api.post('/sensor-readings', sensorData)
}

export const healthAPI = {
  check: () => api.get('/health')
}

export default api;

