import axios from 'axios'

// =======================
// API BASE 1 → BACKEND AUTENTICADO
// =======================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const apiAuth = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor para agregar token
apiAuth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar expiración de token
apiAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('expires_at')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => apiAuth.post('/auth/login', credentials),
  register: (userData) => apiAuth.post('/auth/signup', userData),
  getProfile: () => apiAuth.get('/auth/user'),
  logout: () => apiAuth.post('/auth/logout'),
}

export const generalAPI = {
  getProtectedData: () => apiAuth.get('/protected-data'),
}

// =======================
// API BASE 2 → UNIVERSIA (FORMULARIOS)
// =======================
const API_UNIVERSIA_URL = import.meta.env.VITE_API_UNIVERSIA_URL || 'http://localhost:4000'

const apiUniversia = axios.create({
  baseURL: API_UNIVERSIA_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Reutilizamos el mismo interceptor para meter el token
apiUniversia.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export const universityAPI = {
  getAll: () => apiAuth.get('/universities'), // universidades siguen en el backend principal
}

export const formAPI = {
  getQuestionById: (id) => apiUniversia.get(`/questions/${id}`),
  getDimensions: () => apiUniversia.get('/dimensions'),
  createEvaluation: (data) => apiUniversia.post('/evaluations', data),
}

export { apiAuth, apiUniversia }
