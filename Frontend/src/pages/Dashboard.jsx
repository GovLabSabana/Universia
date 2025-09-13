import React, { useState, useEffect } from 'react'
import { LogOut, User, Home, X, Star, MapPin, Building2, Leaf, Users, Shield, Search, CheckCircle, AlertCircle } from 'lucide-react'

// =======================
// CONFIGURACIÓN API
// =======================
const API_BASE_URL = 'https://universia-production.up.railway.app'

// Función helper para hacer requests con autenticación
const makeRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token')
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers
      }
    })
    
    // Si hay error 401, limpiar storage y redirigir a login
    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('expires_at')
      localStorage.removeItem('user')
      window.location.href = '/login'
      throw new Error('No autorizado')
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error en request:', error)
    throw error
  }
}

// =======================
// SERVICIOS API
// =======================
const authAPI = {
  login: (credentials) => makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  register: (userData) => makeRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getProfile: () => makeRequest('/auth/user'),
  logout: () => makeRequest('/auth/logout', { method: 'POST' }),
}

const universityAPI = {
  getAll: () => makeRequest('/universities'),
}

const dimensionAPI = {
  getAll: () => makeRequest('/dimensions'),
  getQuestions: (dimensionId) => makeRequest(`/dimensions/${dimensionId}/questions`),
}

const questionAPI = {
  getById: (id) => makeRequest(`/questions/${id}`),
}

const evaluationAPI = {
  create: (data) => makeRequest('/evaluations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getUserEvaluations: () => makeRequest('/evaluations'),
  getAverages: () => makeRequest('/evaluations/averages'),
  getRanking: (dimensionId = null) => {
    const params = dimensionId ? `?dimension=${dimensionId}` : ''
    return makeRequest(`/evaluations/ranking${params}`)
  }
}

// =======================
// HOOK DE AUTENTICACIÓN
// =======================
const useAuth = () => {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }, [])
  
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('expires_at')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }
  
  return { user, logout }
}

// =======================
// COMPONENTE DASHBOARD
// =======================
export default function Dashboard() {
  const { user, logout } = useAuth()
  
  // Estados principales
  const [universities, setUniversities] = useState([])
  const [dimensions, setDimensions] = useState([])
  const [userEvaluations, setUserEvaluations] = useState([])
  const [averages, setAverages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Estados de UI
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [universitySearchTerm, setUniversitySearchTerm] = useState('')
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
  
  // Estados de evaluación
  const [isEvaluationMode, setIsEvaluationMode] = useState(false)
  const [currentDimensionIndex, setCurrentDimensionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentQuestions, setCurrentQuestions] = useState([])
  const [currentResponses, setCurrentResponses] = useState([])
  const [evaluationComplete, setEvaluationComplete] = useState(false)
  const [comments, setComments] = useState('')
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false)

  // Verificar autenticación al montar
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      window.location.href = '/login'
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Cargar datos en paralelo
        const [universitiesRes, dimensionsRes, evaluationsRes, averagesRes] = await Promise.all([
          universityAPI.getAll(),
          dimensionAPI.getAll(),
          evaluationAPI.getUserEvaluations(),
          evaluationAPI.getAverages()
        ])
        
        // Manejar diferentes estructuras de respuesta del API
        setUniversities(universitiesRes?.data || universitiesRes || [])
        setDimensions(dimensionsRes?.data || dimensionsRes || [])
        setUserEvaluations(evaluationsRes?.data || evaluationsRes || [])
        setAverages(averagesRes?.data || averagesRes || [])
        
      } catch (err) {
        console.error('Error cargando datos iniciales:', err)
        if (err.message.includes('401')) {
          setError('Tu sesión ha expirado. Serás redirigido al login...')
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        } else {
          setError('Error al cargar los datos. Por favor, intenta recargar la página.')
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [])

  // Cargar preguntas de la dimensión actual
  useEffect(() => {
    const loadQuestions = async () => {
      if (isEvaluationMode && dimensions.length > 0 && currentDimensionIndex < dimensions.length) {
        try {
          const currentDimension = dimensions[currentDimensionIndex]
          const response = await dimensionAPI.getQuestions(currentDimension.id)
          setCurrentQuestions(response?.data || response || [])
          setCurrentQuestionIndex(0)
        } catch (err) {
          console.error('Error cargando preguntas:', err)
          setError('Error al cargar las preguntas. Por favor, intenta nuevamente.')
          setIsEvaluationMode(false)
        }
      }
    }
    
    loadQuestions()
  }, [isEvaluationMode, currentDimensionIndex, dimensions])

  // Funciones de evaluación
  const startEvaluation = () => {
    if (!selectedUniversity) {
      alert('Por favor, selecciona una universidad primero')
      return
    }
    
    setIsEvaluationMode(true)
    setCurrentDimensionIndex(0)
    setCurrentQuestionIndex(0)
    setCurrentResponses([])
    setEvaluationComplete(false)
    setComments('')
    setError('')
  }

  const handleAnswer = async (score) => {
    const currentQuestion = currentQuestions[currentQuestionIndex]
    const newResponse = { 
      question_id: currentQuestion.id, 
      score: score 
    }
    const updatedResponses = [...currentResponses, newResponse]
    setCurrentResponses(updatedResponses)
    
    // Verificar si es la última pregunta de la dimensión
    if (currentQuestionIndex === currentQuestions.length - 1) {
      try {
        setSubmittingEvaluation(true)
        // Enviar evaluación de la dimensión actual
        await submitDimensionEvaluation(updatedResponses)
        
        // Verificar si hay más dimensiones
        if (currentDimensionIndex < dimensions.length - 1) {
          setCurrentDimensionIndex(currentDimensionIndex + 1)
          setCurrentResponses([])
        } else {
          // Evaluación completada
          setEvaluationComplete(true)
          setIsEvaluationMode(false)
          // Recargar datos para mostrar nuevos promedios
          await reloadUserData()
        }
      } catch (err) {
        console.error('Error al guardar evaluación:', err)
        setError('Error al guardar la evaluación. Por favor, intenta nuevamente.')
      } finally {
        setSubmittingEvaluation(false)
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const submitDimensionEvaluation = async (responses) => {
    const currentDimension = dimensions[currentDimensionIndex]
    
    const payload = {
      university_id: selectedUniversity.id,
      dimension_id: currentDimension.id,
      responses: responses,
      comments: comments || ''
    }
    
    try {
      await evaluationAPI.create(payload)
      console.log(`Evaluación guardada para dimensión ${currentDimension.name}`)
    } catch (err) {
      console.error('Error guardando evaluación:', err)
      throw err
    }
  }

  const reloadUserData = async () => {
    try {
      const [evaluationsRes, averagesRes] = await Promise.all([
        evaluationAPI.getUserEvaluations(),
        evaluationAPI.getAverages()
      ])
      
      setUserEvaluations(evaluationsRes?.data || evaluationsRes || [])
      setAverages(averagesRes?.data || averagesRes || [])
    } catch (err) {
      console.error('Error recargando datos:', err)
    }
  }

  // Funciones de utilidad
  const getUserNameFromEmail = (email) => {
    if (!email) return 'Usuario'
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  const getFilteredUniversities = () => {
    if (!universitySearchTerm.trim()) return []
    
    const searchLower = universitySearchTerm.toLowerCase()
    return universities.filter(uni => 
      uni.name?.toLowerCase().includes(searchLower) ||
      uni.city?.toLowerCase().includes(searchLower) ||
      uni.department?.toLowerCase().includes(searchLower)
    ).slice(0, 5)
  }

  const getDimensionStats = (dimensionName) => {
    // Buscar en promedios globales
    const globalAvg = averages.find(avg => 
      avg.dimension_name === dimensionName || avg.dimension?.name === dimensionName
    )
    
    // Buscar evaluaciones del usuario para esta dimensión y universidad
    const userEvals = userEvaluations.filter(evaluation => {
      const evalDimName = evaluation.dimension?.name || evaluation.dimensions?.name
      return evalDimName === dimensionName && evaluation.university_id === selectedUniversity?.id
    })
    
    return {
      globalAverage: globalAvg?.average_score || 0,
      globalEvaluations: globalAvg?.total_evaluations || 0,
      userEvaluated: userEvals.length > 0,
      userScore: userEvals.length > 0 ? calculateUserScore(userEvals[0]) : 0
    }
  }

  const calculateUserScore = (evaluation) => {
    const responses = evaluation.evaluation_responses || evaluation.responses || []
    if (responses.length === 0) return 0
    
    const total = responses.reduce((sum, response) => sum + (response.score || 0), 0)
    return (total / responses.length).toFixed(1)
  }

  const getOverallProgress = () => {
    if (!selectedUniversity || dimensions.length === 0) {
      return { completed: 0, total: dimensions.length, percentage: 0 }
    }
    
    const completedDimensions = dimensions.filter(dimension => {
      return userEvaluations.some(evaluation => {
        const evalDimName = evaluation.dimension?.name || evaluation.dimensions?.name
        return evalDimName === dimension.name && evaluation.university_id === selectedUniversity.id
      })
    }).length
    
    return {
      completed: completedDimensions,
      total: dimensions.length,
      percentage: dimensions.length > 0 ? Math.round((completedDimensions / dimensions.length) * 100) : 0
    }
  }

  // Configuración de dimensiones
  const dimensionConfig = {
    'Governance': { icon: <Shield className="w-4 h-4" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    'Social': { icon: <Users className="w-4 h-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'Environmental': { icon: <Leaf className="w-4 h-4" />, color: 'text-green-600', bgColor: 'bg-green-50' }
  }

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">EvalúaSostenible</h1>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <User className="h-5 w-5" />
                <span>{getUserNameFromEmail(user?.email)}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    {user?.email}
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensaje de error global */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido {getUserNameFromEmail(user?.email)}!
          </h2>
          <p className="text-gray-600">
            Sistema de Evaluación de Sostenibilidad para Instituciones de Educación Superior Colombianas
          </p>
        </div>

        {/* Selección de Universidad */}
        {!selectedUniversity && !isEvaluationMode && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium mb-4">Selecciona tu Institución</h3>
            
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Busca tu institución por nombre, ciudad o departamento..."
                  value={universitySearchTerm}
                  onChange={(e) => {
                    setUniversitySearchTerm(e.target.value)
                    setShowUniversityDropdown(e.target.value.length > 0)
                  }}
                  onFocus={() => setShowUniversityDropdown(universitySearchTerm.length > 0)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {showUniversityDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {getFilteredUniversities().length > 0 ? (
                    getFilteredUniversities().map(uni => (
                      <button
                        key={uni.id}
                        onClick={() => {
                          setSelectedUniversity(uni)
                          setUniversitySearchTerm(uni.name)
                          setShowUniversityDropdown(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                      >
                        <div className="font-medium">{uni.name}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {uni.city}, {uni.department}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500">
                      No se encontraron universidades. Intenta con otro término de búsqueda.
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {universities.length === 0 && !loading && (
              <div className="mt-4 text-sm text-gray-500">
                No hay universidades disponibles en este momento.
              </div>
            )}
          </div>
        )}

        {/* Universidad Seleccionada */}
        {selectedUniversity && !isEvaluationMode && !evaluationComplete && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  {selectedUniversity.name}
                </h3>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedUniversity.city}, {selectedUniversity.department}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedUniversity(null)
                  setUniversitySearchTerm('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Progreso de evaluación */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progreso de evaluación</span>
                <span className="text-sm text-gray-500">
                  {getOverallProgress().completed}/{getOverallProgress().total} dimensiones
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getOverallProgress().percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {getOverallProgress().percentage}% completado
              </p>
            </div>

            <button
              onClick={startEvaluation}
              disabled={getOverallProgress().percentage === 100}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Star className="h-5 w-5 mr-2" />
              {getOverallProgress().percentage === 100 ? 'Evaluación Completada' : 'Iniciar/Continuar Evaluación'}
            </button>
          </div>
        )}

        {/* Dashboard de estadísticas */}
        {selectedUniversity && getOverallProgress().percentage > 0 && !isEvaluationMode && !evaluationComplete && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {dimensions.map(dimension => {
              const config = dimensionConfig[dimension.name] || dimensionConfig['Governance']
              const stats = getDimensionStats(dimension.name)
              
              return (
                <div key={dimension.id} className={`rounded-lg p-6 ${config.bgColor}`}>
                  <div className="flex items-center mb-4">
                    <div className={`${config.color} mr-3`}>
                      {config.icon}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{dimension.name}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tu puntuación</span>
                        <span className="text-lg font-bold text-gray-900">
                          {stats.userEvaluated ? stats.userScore : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Promedio global</span>
                        <span className="text-sm text-gray-500">
                          {stats.globalAverage.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {stats.globalEvaluations} evaluaciones globales
                    </div>
                    
                    {!stats.userEvaluated && (
                      <div className="text-xs text-orange-600 font-medium">
                        Pendiente de evaluar
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modo de evaluación */}
        {isEvaluationMode && currentQuestions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium">
                  Evaluación: {dimensions[currentDimensionIndex]?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Pregunta {currentQuestionIndex + 1} de {currentQuestions.length}
                </p>
              </div>
              <button
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres salir? Tu progreso en esta dimensión se perderá.')) {
                    setIsEvaluationMode(false)
                    setCurrentResponses([])
                  }
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / currentQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-lg font-medium mb-4">
                {currentQuestions[currentQuestionIndex]?.text}
              </h4>
              
              {submittingEvaluation ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Guardando respuesta...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { value: 1, label: 'Inexistente', description: 'No existe implementación' },
                    { value: 2, label: 'Inicial/Piloto', description: 'Implementación piloto o inicial' },
                    { value: 3, label: 'Parcialmente implementado', description: 'Implementación parcial' },
                    { value: 4, label: 'Consolidado', description: 'Implementación consolidada' },
                    { value: 5, label: 'Excelente/Referente', description: 'Implementación ejemplar' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(option.value)}
                      className="w-full text-left p-4 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex items-start">
                        <span className="text-lg font-bold text-blue-600 mr-3 mt-1">{option.value}</span>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Campo de comentarios opcional */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Agrega cualquier comentario adicional sobre esta dimensión..."
              />
            </div>
          </div>
        )}

        {/* Evaluación completada */}
        {evaluationComplete && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Evaluación Completada!
            </h3>
            <p className="text-gray-600 mb-6">
              Has completado exitosamente la evaluación de sostenibilidad para<br />
              <span className="font-semibold">{selectedUniversity?.name}</span>
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEvaluationComplete(false)
                  reloadUserData()
                }}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver Dashboard de Resultados
              </button>
              
              <button
                onClick={() => {
                  setEvaluationComplete(false)
                  setSelectedUniversity(null)
                  setUniversitySearchTerm('')
                }}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                Evaluar Otra Universidad
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}