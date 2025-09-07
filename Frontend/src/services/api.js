import axios from 'axios'

// Configuración base de axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Endpoints de autenticación
export const authAPI = {
  // Login
  login: (credentials) => {
    return api.post('/auth/login', credentials)
  },
  
  // Registro
  register: (userData) => {
    return api.post('/auth/register', userData)
  },
  
  // Obtener perfil del usuario
  getProfile: () => {
    return api.get('/profile')
  },
  
  // Refresh token (si está implementado en el backend)
  refreshToken: () => {
    return api.post('/auth/refresh')
  },
  
  // Logout (si está implementado en el backend)
  logout: () => {
    return api.post('/auth/logout')
  }
}

// API general para otras peticiones
export const generalAPI = {
  // Ejemplo de endpoint protegido
  getProtectedData: () => {
    return api.get('/protected-data')
  }
}

export default api