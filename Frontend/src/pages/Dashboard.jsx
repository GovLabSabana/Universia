import { useState, useEffect } from 'react'
import { universityAPI, formAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, Home, Plus, X, Star, MapPin, Building2, Leaf, Users, Shield, ChevronDown, ChevronUp, Filter, Eye, Calendar, MessageSquare, FileText, Search, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import "../design/Dashboard.css"
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Estados para evaluación secuencial
  const [universitySearchTerm, setUniversitySearchTerm] = useState('')
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState(null)
  const [currentQuestionId, setCurrentQuestionId] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [dimensions, setDimensions] = useState([])
  const [dimensionMap, setDimensionMap] = useState({})
  const [responses, setResponses] = useState([])
  const [currentDimensionId, setCurrentDimensionId] = useState(null)
  const [finished, setFinished] = useState(false)
  const [isEvaluationMode, setIsEvaluationMode] = useState(false)
  const [comments, setComments] = useState("") // Estado para comentarios generales
  
  // Estados para el filtro de búsqueda general
  const [searchTerm, setSearchTerm] = useState('')
  
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    city: '',
    department: ''
  })

  const [universities, setUniversities] = useState([])

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await universityAPI.getAll()
        setUniversities(response.data.data || [])
      } catch (error) {
        console.error("Error cargando universidades:", error)
        toast.error("Error al cargar universidades")
      }
    }

    fetchUniversities()
  }, [])

  // Cargar dimensiones
  useEffect(() => {
    formAPI.getDimensions()
      .then(res => {
        setDimensions(res.data.data || [])
        const map = {}
        res.data.data.forEach(dim => {
          map[dim.id] = dim.name
        })
        setDimensionMap(map)
      })
      .catch(() => {
        toast.error("Error al cargar dimensiones")
      })
  }, [])

  // Cargar pregunta actual
  useEffect(() => {
    if (!selectedUniversity || !isEvaluationMode) return
    
    formAPI.getQuestionById(currentQuestionId)
      .then(res => {
        if (res.data?.success) {
          setCurrentQuestion(res.data.data)
          // Si cambiamos de dimensión, enviar las respuestas de la dimensión anterior
          if (currentDimensionId && res.data.data.dimension_id !== currentDimensionId) {
            submitEvaluation(responses, currentDimensionId)
          }
          setCurrentDimensionId(res.data.data.dimension_id)
        } else {
          // No hay más preguntas, enviar las respuestas de la última dimensión
          if (responses.length > 0 && currentDimensionId) {
            submitEvaluation(responses, currentDimensionId).then(() => {
              setFinished(true)
              setIsEvaluationMode(false)
            })
          } else {
            setFinished(true)
            setIsEvaluationMode(false)
          }
        }
      })
      .catch(() => {
        // Error al cargar pregunta, enviar respuestas si hay
        if (responses.length > 0 && currentDimensionId) {
          submitEvaluation(responses, currentDimensionId).then(() => {
            setFinished(true)
            setIsEvaluationMode(false)
          })
        } else {
          setFinished(true)
          setIsEvaluationMode(false)
        }
      })
  }, [currentQuestionId, selectedUniversity, isEvaluationMode])

  // Manejar respuesta seleccionada
  const handleAnswer = (score) => {
    if (!currentQuestion) return

    const newResponse = { question_id: currentQuestion.id, score }
    const newResponses = [...responses, newResponse]
    setResponses(newResponses)

    // Verificar si cambia de dimensión en la siguiente pregunta
    const nextQuestionId = currentQuestionId + 1

    formAPI.getQuestionById(nextQuestionId)
      .then(res => {
        if (res.data?.success) {
          const nextDimId = res.data.data.dimension_id
          if (nextDimId !== currentDimensionId) {
            // Enviar evaluación por dimensión antes de continuar
            submitEvaluation(newResponses, currentDimensionId).then(() => {
              setResponses([])
              setCurrentQuestionId(nextQuestionId)
            })
          } else {
            setCurrentQuestionId(nextQuestionId)
          }
        } else {
          // No hay más preguntas, enviar evaluación de la dimensión actual
          submitEvaluation(newResponses, currentDimensionId).then(() => {
            setFinished(true)
            setIsEvaluationMode(false)
          })
        }
      })
      .catch(() => {
        // No hay más preguntas, enviar evaluación de la dimensión actual
        submitEvaluation(newResponses, currentDimensionId).then(() => {
          setFinished(true)
          setIsEvaluationMode(false)
        })
      })
  }

  // Enviar evaluación por dimensión
  const submitEvaluation = async (responsesToSend, dimensionId) => {
    if (!selectedUniversity || responsesToSend.length === 0) return
    
    const payload = {
      university_id: selectedUniversity.id,
      dimension_id: dimensionId,
      responses: responsesToSend,
      comments: comments
    }
    
    try {
      await formAPI.createEvaluation(payload)
      toast.success(`Evaluación guardada para dimensión ${dimensionMap[dimensionId]}`)
      return true
    } catch (error) {
      console.error("Error al guardar evaluación:", error)
      toast.error("Error al guardar evaluación")
      return false
    }
  }

  const getFilteredUniversitiesForSelection = () => {
    if (!universitySearchTerm.trim()) return []
    
    const searchLower = universitySearchTerm.toLowerCase().trim()
    return universities.filter(uni => 
      uni.name.toLowerCase().includes(searchLower) ||
      uni.city.toLowerCase().includes(searchLower) ||
      uni.department.toLowerCase().includes(searchLower)
    ).slice(0, 5) 
  }
  
  // Definición de dimensiones y criterios según el modelo
  const evaluationDimensions = {
    'Ambiental': {
      icon: <Leaf className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    'Social': {
      icon: <Users className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    'Gobernanza': {
      icon: <Shield className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  }
  
  // Definición de niveles de puntuación
  const scoreDescriptions = {
    1: { 
      label: 'Inexistente', 
      description: 'No se implementa este criterio', 
      colorClass: 'score-red', 
      bgColorClass: 'score-bg-red' 
    },
    2: { 
      label: 'Inicial/Piloto', 
      description: 'Proyectos aislados o pruebas piloto', 
      colorClass: 'score-orange', 
      bgColorClass: 'score-bg-orange' 
    },
    3: { 
      label: 'Parcialmente implementado', 
      description: 'Implementación limitada en algunas áreas', 
      colorClass: 'score-yellow', 
      bgColorClass: 'score-bg-yellow' 
    },
    4: { 
      label: 'Consolidado', 
      description: 'Implementación integral con seguimiento', 
      colorClass: 'score-blue', 
      bgColorClass: 'score-bg-blue' 
    },
    5: { 
      label: 'Excelente/Referente', 
      description: 'Implementación ejemplar con resultados medibles', 
      colorClass: 'score-green', 
      bgColorClass: 'score-bg-green' 
    }
  }

  // Función para iniciar evaluación secuencial
  const startSequentialEvaluation = () => {
    if (universities.length === 0) {
      alert('Primero debes crear al menos una Institución para evaluar')
      return
    }
    
    if (!selectedUniversity) {
      alert('Debes seleccionar una Institución para evaluar')
      return
    }
    
    setCurrentQuestionId(1)
    setResponses([])
    setComments("")
    setFinished(false)
    setIsEvaluationMode(true)
  }

  const handleLogout = () => {
    logout()
  }

  const getUserNameFromEmail = (email) => {
    if (!email) return 'Usuario'
    return email.split('@')[0]
  }

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`star ${i < score ? 'star-filled' : 'star-empty'}`}
      />
    ))
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-nav">
            <div className="logo-container">
              <div className="logo-icon">
                <Home />
              </div>
              <h1 className="logo-text">EvalúaSostenible</h1>
            </div>

            <div className="user-menu">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-button"
              >
                <div className="user-avatar">
                  <User />
                </div>
                <span className="user-name">
                  {getUserNameFromEmail(user?.email)}
                </span>
              </button>

              {showUserMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-username">
                      {getUserNameFromEmail(user?.email)}
                    </p>
                    <p className="dropdown-email">{user?.email}</p>
                  </div>
                  
                  <div className="dropdown-logout">
                    <button 
                      onClick={handleLogout}
                      className="dropdown-button"
                    >
                      <LogOut />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="welcome-section">
            <h2 className="welcome-title">
              ¡Bienvenido {getUserNameFromEmail(user?.email)}!
            </h2>
            <p className="welcome-subtitle">Sistema de Evaluación de Sostenibilidad para Instituciones de Educación Superior Colombianas</p>
          </div>

          {/* Estadísticas por dimensión */}
          <div className="stats-grid">
            {Object.entries(evaluationDimensions).map(([dimension, config]) => {
              // En una implementación real, estos datos vendrían de la API
              const stats = {
                count: Math.floor(Math.random() * 20),
                avgScore: (Math.random() * 5).toFixed(1),
                completionPercentage: Math.floor(Math.random() * 100),
                universitiesEvaluated: Math.floor(Math.random() * 10)
              }
              
              return (
                <div key={dimension} className={`stat-card ${config.bgColor}`}>
                  <div className="stat-header">
                    <div className={`stat-icon ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="stat-info">
                      <h3 className="stat-title">{dimension}</h3>
                      <p className="stat-subtitle">{stats.count} evaluaciones</p>
                    </div>
                  </div>
                  <div className="stat-metrics">
                    <div className="stat-score">
                      <span className="stat-score-number">{stats.avgScore}</span>
                      <span className="stat-score-text">Promedio</span>
                    </div>
                    <div className="stat-completion">
                      <div className="completion-bar">
                        <div 
                          className="completion-fill" 
                          style={{ width: `${stats.completionPercentage}%` }}
                        ></div>
                      </div>
                      <div className="completion-info">
                        <span className="completion-percentage">{stats.completionPercentage}%</span>
                        <span className="completion-text">Completado</span>
                      </div>
                    </div>
                    <div className="stat-detail">
                      <span className="detail-text">
                        {stats.universitiesEvaluated}/{universities.length} Instituciones evaluadas
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="action-buttons">
            <button
              onClick={startSequentialEvaluation}
              className="action-button score-button"
              disabled={isEvaluationMode || !selectedUniversity}
            >
              <Star />
              {!selectedUniversity ? 'Selecciona tu Institución' : 
              isEvaluationMode ? 'Evaluación en Curso' : 'Iniciar Evaluación Secuencial'}
            </button>
          </div>

          {/* Progreso general de evaluación */}
          {isEvaluationMode && (
            <div className="evaluation-progress-section sticky-progress">
              <div className="progress-card">
                <h3 className="progress-title">Progreso de Evaluación</h3>
                <div className="progress-info">
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${((currentQuestionId - 1) / 50) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      Pregunta {currentQuestionId}
                    </span>
                  </div>
                  <div className="completed-count">
                    <CheckCircle className="completed-icon" />
                    {responses.length} respuestas completadas
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selección de universidad */}
          {!isEvaluationMode && !selectedUniversity && (
            <div className="university-selection-section">
              <div className="selection-container">
                <h3 className="selection-title">Selecciona tu Institución</h3>
                <p className="selection-subtitle">Busca y escoge la Institución a la que perteneces</p>
                
                <div className="university-search-wrapper">
                  <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      placeholder="Escribe el nombre de tu institución o ciudad..."
                      value={universitySearchTerm}
                      onChange={(e) => {
                        setUniversitySearchTerm(e.target.value)
                        setShowUniversityDropdown(e.target.value.length > 0)
                      }}
                      onFocus={() => setShowUniversityDropdown(universitySearchTerm.length > 0)}
                      className="university-search-input"
                    />
                    {universitySearchTerm && (
                      <button
                        onClick={() => {
                          setUniversitySearchTerm('')
                          setShowUniversityDropdown(false)
                        }}
                        className="search-clear"
                      >
                        <X />
                      </button>
                    )}
                  </div>
                  
                  {showUniversityDropdown && (
                    <div className="university-dropdown">
                      {getFilteredUniversitiesForSelection().length > 0 ? (
                        getFilteredUniversitiesForSelection().map(uni => (
                          <button
                            key={uni.id}
                            onClick={() => {
                              setSelectedUniversity(uni)
                              setUniversitySearchTerm(uni.name)
                              setShowUniversityDropdown(false)
                            }}
                            className="university-option"
                          >
                            <div className="university-option-content">
                              <h4 className="university-option-name">{uni.name}</h4>
                              <p className="university-option-location">
                                <MapPin className="location-icon-small" />
                                {uni.city}, {uni.department}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="no-results">
                          <p>No se encontraron universidades</p>
                          <p className="no-results-hint">Intenta con otros términos de búsqueda</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Formulario de evaluación secuencial */}
          {isEvaluationMode && currentQuestion && (
            <div className="form-container">
              <div className="form-header">
                <div>
                  <h3 className="form-title">Evaluación Secuencial</h3>
                  <p className="evaluation-progress-text">
                    Pregunta {currentQuestionId} - Dimensión: {dimensionMap[currentDimensionId]}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    // Si hay respuestas pendientes, enviarlas antes de salir
                    if (responses.length > 0 && currentDimensionId) {
                      submitEvaluation(responses, currentDimensionId).then(() => {
                        setIsEvaluationMode(false)
                        setFinished(false)
                      })
                    } else {
                      setIsEvaluationMode(false)
                      setFinished(false)
                    }
                  }} 
                  className="close-button"
                  title="Salir de evaluación"
                >
                  <X />
                </button>
              </div>
              
              {/* Información del criterio actual */}
              <div className="current-evaluation-info">
                <div className="evaluation-context">
                  <h4 className="current-university">{selectedUniversity.name}</h4>
                  <div className="current-location">
                    <MapPin className="location-icon" />
                    {selectedUniversity.city}, {selectedUniversity.department}
                  </div>
                </div>
                
                <div className="dimension-section">
                  <div className={`current-dimension-badge ${evaluationDimensions[dimensionMap[currentQuestion.dimension_id]]?.color}`}>
                    {evaluationDimensions[dimensionMap[currentQuestion.dimension_id]]?.icon}
                    <span>{dimensionMap[currentQuestion.dimension_id]}</span>
                  </div>
                </div>
                
                <div className="criterion-section">
                  <h5 className="criterion-label">Criterio a evaluar:</h5>
                  <p className="current-criterion">
                    {currentQuestion.text}
                  </p>
                </div>
              </div>

              <div className="evaluation-form">
                {/* Puntuación */}
                <div className="form-group">
                  <label className="form-label">Puntuación (1-5) *</label>
                  <div className="score-options">
                    {Object.entries(currentQuestion.scale_descriptions || scoreDescriptions).map(([score, label]) => (
                      <label key={score} className="score-option">
                        <input
                          type="radio"
                          name="score"
                          value={score}
                          onChange={() => handleAnswer(parseInt(score))}
                          className="score-radio"
                        />
                        <div className="score-option-content">
                          <div className="score-option-header">
                            <span className="score-number">{score}</span>
                            <span className="score-label">{label}</span>
                          </div>
                          <p className="score-description">{scoreDescriptions[score]?.description || ""}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de finalización */}
          {finished && (
            <div className="form-container completed-container">
              <div className="form-header completed-header">
                <div className="success-animation">
                  <CheckCircle className="success-icon" />
                  <div className="success-circle"></div>
                </div>
                <h3 className="form-title completed-title">¡Evaluación Completada con Éxito!</h3>
              </div>
              
              <div className="completed-evaluation">
                <div className="celebration-animation">
                  <div className="confetti"></div>
                  <div className="confetti"></div>
                  <div className="confetti"></div>
                  <div className="confetti"></div>
                  <div className="confetti"></div>
                </div>
                
                <div className="completed-content">
                  <div className="university-badge">
                    <Building2 className="university-badge-icon" />
                    <span className="university-badge-name">{selectedUniversity.name}</span>
                  </div>
                  
                  <h4 className="completed-subtitle">¡Felicitaciones por completar la evaluación!</h4>
                  
                  <div className="completion-stats">
                    <div className="stat-item">
                      <div className="stat-icon">
                        <FileText />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{responses.length}</span>
                        <span className="stat-label">Preguntas respondidas</span>
                      </div>
                    </div>
                    
                    <div className="stat-item">
                      <div className="stat-icon">
                        <Shield />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">3</span>
                        <span className="stat-label">Dimensiones evaluadas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="completed-message-card">
                    <MessageSquare className="message-icon" />
                    <p className="completed-message">
                      Tu contribución es invaluable para mejorar la sostenibilidad de 
                      <strong> {selectedUniversity.name}</strong>. Los resultados han sido 
                      guardados exitosamente en nuestro sistema.
                    </p>
                  </div>
                  
                  <div className="next-steps">
                    <h5 className="next-steps-title">Próximos pasos:</h5>
                    <ul className="next-steps-list">
                      <li>Revisión del comité de sostenibilidad</li>
                      <li>Elaboración del plan de mejora</li>
                      <li>Seguimiento trimestral</li>
                    </ul>
                  </div>
                </div>
                
                <div className="completed-actions">
                  <button
                    onClick={() => {
                      setFinished(false)
                      setIsEvaluationMode(false)
                    }}
                    className="action-button primary-button completed-btn"
                  >
                    <Home className="btn-icon" />
                    Volver al Dashboard Principal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Información de la universidad seleccionada */}
          {!isEvaluationMode && selectedUniversity && !finished && (
            <div className="content-card">
              <h3 className="card-header">
                <Building2 className="universities-icon" />
                Mi Institución:
              </h3>
              
              <div className="card-list">
                <div className="selected-university-display">
                  <div className="university-info-section">
                    <h4 className="university-name">{selectedUniversity.name}</h4>
                    <p className="university-location">
                      <MapPin />
                      {selectedUniversity.city}, {selectedUniversity.department}
                    </p>
                    
                    <div className="university-completion">
                      <div className="completion-bar-small">
                        <div 
                          className="completion-fill-small" 
                          style={{ width: '0%' }}
                        ></div>
                      </div>
                      <span className="completion-text-small">
                        0% evaluado (0/50 criterios)
                      </span>
                    </div>
                    
                    <div className="university-stats">
                      {Object.keys(evaluationDimensions).map(dimension => (
                        <div key={dimension} className="university-stat">
                          <span className="stat-dimension">{dimension}:</span>
                          <span className="stat-value">N/A</span>
                          <span className="stat-count">(0)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="university-actions">
                    <button
                      onClick={() => {
                        setSelectedUniversity(null)
                        setUniversitySearchTerm('')
                      }}
                      className="change-university-button"
                    >
                      <X className="change-icon" />
                      Cambiar Institución
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}