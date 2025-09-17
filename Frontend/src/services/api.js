import axios from 'axios'

// =======================
// API ÚNICA → BACKEND
// =======================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Interceptor para agregar token
api.interceptors.request.use(
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
api.interceptors.response.use(
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

// =======================
// ENDPOINTS
// =======================
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/signup', userData),
  getProfile: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
}

export const universityAPI = {
  getAll: () =>
    api.get('/universities', {
      params: { include_scores: true },
    }),
}

export const formAPI = {
  getQuestionById: (id) => api.get(`/questions/${id}`),
  getDimensions: () => api.get('/dimensions'),
  createEvaluation: (data) => api.post('/evaluations', data),
}

export const statisticsAPI = {
  getAverages: () => api.get('/evaluations/averages'),
  getRanking: (dimensionId) =>
    api.get('/evaluations/ranking', {
      params: { dimension: dimensionId },
    }),
}

export const evaluationAPI = {
  getQuestions: (dimensionId) =>
    api.get(`/dimensions/${dimensionId}/questions`),

  postEvaluation: (payload) => api.post('/evaluations', payload),

  // 🔹 ahora recibe el userId
  getAll: async (userId) => {
    try {
      const response = await api.get('/evaluations', {
        params: { user_id: userId },
      })
      return response.data
    } catch (error) {
      console.error('Error obteniendo evaluaciones:', error)
      throw error
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/evaluations/${id}`)
      return response.data
    } catch (error) {
      console.error('Error eliminando evaluación:', error)
      throw error
    }
  },
}

export { api }
