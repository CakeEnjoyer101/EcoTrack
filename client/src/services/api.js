import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
})

export const moodAPI = {
  getAll: () => api.get('/mood-entries'),
  create: (moodData) => api.post('/mood-entries', moodData)
}

export const sensorAPI = {
  getAll: () => api.get('/sensor-readings'),
  create: (sensorData) => api.post('/sensor-readings', sensorData)
}

export const healthAPI = {
  check: () => api.get('/health')
}

export default api;
