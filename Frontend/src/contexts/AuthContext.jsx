import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar si hay un token guardado al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Verificar si el token es válido
      authAPI.getProfile()
        .then(response => {
          if (response.data?.success) {
            setUser(response.data.data)
          } else {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
          }
        })
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authAPI.login({ email, password })
      
      if (response.data?.success) {
        const { session, user: userData } = response.data.data
        const { access_token, refresh_token, expires_at } = session

        localStorage.setItem('access_token', access_token)
        localStorage.setItem('refresh_token', refresh_token)
        localStorage.setItem('expires_at', expires_at)
        localStorage.setItem('user', JSON.stringify(userData))

        setUser(userData)

        toast.success('¡Bienvenido!')
        return { success: true }
      } else {
        toast.error(response.data?.message || 'Error al iniciar sesión')
        return { success: false, message: response.data?.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authAPI.register(userData)
      
      if (response.data?.success) {
        toast.success('Cuenta creada exitosamente. Por favor, inicia sesión.')
        return { success: true }
      } else {
        toast.error(response.data?.message || 'Error al crear la cuenta')
        return { success: false, message: response.data?.message }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear la cuenta'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('expires_at')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Sesión cerrada')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}