import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((cfg) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rwh_token') : null
  if (token && cfg.headers) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
