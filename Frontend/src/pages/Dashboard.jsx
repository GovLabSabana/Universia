import { useState, useEffect } from 'react'
import { universityAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, Home, Plus, X, Star, MapPin, Building2, Leaf, Users, Shield, ChevronDown, ChevronUp, Filter, Eye, Calendar, MessageSquare, FileText, Search, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import "../design/Dashboard.css"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  
  // Estados para evaluación secuencial
  const [universitySearchTerm, setUniversitySearchTerm] = useState('')
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false)
  const [selectedUniversityId, setSelectedUniversityId] = useState('')
  const [userUniversity, setUserUniversity] = useState(null)
  const [currentEvaluationIndex, setCurrentEvaluationIndex] = useState(0)
  const [evaluationSequence, setEvaluationSequence] = useState([])
  const [isEvaluationMode, setIsEvaluationMode] = useState(false)
  const [completedEvaluations, setCompletedEvaluations] = useState([])
  
  // Estados para el filtro de búsqueda general
  const [searchTerm, setSearchTerm] = useState('')
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [selectedEvaluationForModal, setSelectedEvaluationForModal] = useState(null)
  
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    city: '',
    department: ''
  })
  
  const [evaluationForm, setEvaluationForm] = useState({
    score: '',
    evidence: '',
    comment: ''
  })

  const getFilteredUniversitiesForSelection = () => {
    if (!universitySearchTerm.trim()) return []
    
    const searchLower = universitySearchTerm.toLowerCase().trim()
    return universities.filter(uni => 
      uni.name.toLowerCase().includes(searchLower) ||
      uni.city.toLowerCase().includes(searchLower) ||
      uni.department.toLowerCase().includes(searchLower)
    ).slice(0, 5) 
  }
  
  const [universities, setUniversities] = useState([])

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await universityAPI.getAll()
        setUniversities(response.data.data)
      } catch (error) {
        console.error("Error cargando universidades:", error)
      }
    }

    fetchUniversities()
  }, [])
  
  // Definición de dimensiones y criterios según el modelo
  const evaluationDimensions = {
    'Ambiental': {
      icon: <Leaf className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      criteria: [
        'Uso de energías renovables',
        'Consumo energético',
        'Planes de eficiencia energética y reducción de emisiones',
        'Gestión eficiente del agua',
        'Economía circular',
        'Gestión de residuos sólidos y peligrosos',
        'Conservación de biodiversidad',
        'Sensibilización y cultura ambiental',
        'Educación ambiental en el currículo',
        'Movilidad sostenible',
        'Flexibilidad laboral y académica'
      ]
    },
    'Social': {
      icon: <Users className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      criteria: [
        'Estructuras organizativas que prevengan y corrijan abusos de poder',
        'Políticas para la evaluación de la actividad docente y administrativa',
        'Implementación de encuestas de satisfacción y clima laboral',
        'Políticas de respeto por los derechos humanos',
        'Programas de apoyo para estudiantes de escasos recursos',
        'Programas de prácticas profesionales y de inserción laboral',
        'Políticas y programas de cooperación y RSU',
        'Políticas de investigación y convenios con actores sociales',
        'Políticas de transferencia de conocimiento y medición de impacto social',
        'Políticas internas de promoción y evaluación RSU',
        'Programas de salud alimentaria, física y mental',
        'Género y diversidad en programas académicos',
        'Evaluación del impacto social del conocimiento'
      ]
    },
    'Gobernanza': {
      icon: <Shield className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      criteria: [
        'Plan o estrategia de sostenibilidad',
        'Comité académico formalizado',
        'Transparencia organizacional',
        'Comité de investigación con participación externa',
        'Inclusión de sostenibilidad en visión/misión',
        'Comité administrativo y financiero',
        'Código de ética institucional',
        'Portal de transparencia',
        'Plan estratégico alineado con sostenibilidad y RSU',
        'Prevención de conflictos de interés',
        'Área o responsable ESG/RSU',
        'Código de buen gobierno',
        'Políticas de sostenibilidad formalizadas',
        'Comité de auditoría interno',
        'Evaluación de riesgos ESG',
        'Equidad de género en directivas',
        'Participación de stakeholders'
      ]
    }
  }
  
  // Definición de niveles de puntuación
  const scoreDescriptions = {
    1: { label: 'Inexistente', description: 'No se implementa este criterio', color: 'text-red-600', bgColor: 'bg-red-50' },
    2: { label: 'Inicial/Piloto', description: 'Proyectos aislados o pruebas piloto', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    3: { label: 'Parcialmente implementado', description: 'Implementación limitada en algunas áreas', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    4: { label: 'Consolidado', description: 'Implementación integral con seguimiento', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    5: { label: 'Excelente/Referente', description: 'Implementación ejemplar con resultados medibles', color: 'text-green-600', bgColor: 'bg-green-50' }
  }

  // Función para generar la secuencia de evaluación
  const generateEvaluationSequence = () => {
    const sequence = []
    if (!userUniversity) return sequence
    
    // Solo generar para la universidad seleccionada
    Object.entries(evaluationDimensions).forEach(([dimension, config]) => {
      config.criteria.forEach(criterion => {
        sequence.push({
          university: userUniversity,
          dimension: dimension,
          criterion: criterion
        })
      })
    })
    return sequence
  }

  // Función para iniciar evaluación secuencial
  const startSequentialEvaluation = () => {
    if (universities.length === 0) {
      alert('Primero debes crear al menos una universidad para evaluar')
      return
    }
    
    const sequence = generateEvaluationSequence()
    setEvaluationSequence(sequence)
    setCurrentEvaluationIndex(0)
    setIsEvaluationMode(true)
    setEvaluationForm({ score: '', evidence: '', comment: '' })
  }

  // Función para guardar evaluación actual y continuar
  const saveCurrentEvaluation = () => {
    if (!evaluationForm.score) {
      alert('Por favor asigna una puntuación antes de continuar')
      return
    }

    const currentItem = evaluationSequence[currentEvaluationIndex]
    const newEvaluation = {
      id: completedEvaluations.length + 1,
      university: currentItem.university.name,
      dimension: currentItem.dimension,
      criterion: currentItem.criterion,
      score: parseInt(evaluationForm.score),
      evidence: evaluationForm.evidence,
      comment: evaluationForm.comment,
      date: new Date().toISOString().split('T')[0]
    }

    setCompletedEvaluations([...completedEvaluations, newEvaluation])
    
    // Limpiar formulario
    setEvaluationForm({ score: '', evidence: '', comment: '' })
    
    // Avanzar al siguiente criterio
    if (currentEvaluationIndex < evaluationSequence.length - 1) {
      setCurrentEvaluationIndex(currentEvaluationIndex + 1)
    } else {
      // Evaluación completada
      alert('¡Evaluación secuencial completada!')
      setIsEvaluationMode(false)
      setCurrentEvaluationIndex(0)
    }
  }

  // Función para ir al criterio anterior
  const goToPreviousEvaluation = () => {
    if (currentEvaluationIndex > 0) {
      setCurrentEvaluationIndex(currentEvaluationIndex - 1)
      setEvaluationForm({ score: '', evidence: '', comment: '' })
    }
  }

  // Función para omitir criterio actual
  const skipCurrentEvaluation = () => {
    setEvaluationForm({ score: '', evidence: '', comment: '' })
    
    if (currentEvaluationIndex < evaluationSequence.length - 1) {
      setCurrentEvaluationIndex(currentEvaluationIndex + 1)
    } else {
      alert('Has llegado al final de la evaluación')
      setIsEvaluationMode(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const getUserNameFromEmail = (email) => {
    if (!email) return 'Usuario'
    return email.split('@')[0]
  }

  const handleCreateUniversity = async () => {
    if (!newUniversity.name || !newUniversity.city || !newUniversity.department) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    try {
      const response = await universityAPI.create(newUniversity)
      setUniversities([...universities, response.data])
      setNewUniversity({ name: '', city: '', department: '' })
      setShowCreateForm(false)
    } catch (error) {
      console.error("Error creando universidad:", error)
      alert("No se pudo crear la universidad")
    }
  }

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`star ${i < score ? 'star-filled' : 'star-empty'}`}
      />
    ))
  }

  // Función mejorada para calcular estadísticas de dimensión considerando todas las universidades
  const getDimensionStats = () => {
    const stats = {}
    const totalUniversities = userUniversity ? 1 : universities.length

    
    Object.keys(evaluationDimensions).forEach(dimension => {
      const totalCriteria = evaluationDimensions[dimension].criteria.length
      
      // Calcular total de criterios posibles (universidades × criterios por dimensión)
      const totalPossibleEvaluations = totalUniversities * totalCriteria
      
      // Obtener evaluaciones existentes para esta dimensión
      const dimEvaluations = completedEvaluations.filter(e => 
        e.dimension === dimension && 
        (!userUniversity || e.university === userUniversity.name)
      )
      
      // Calcular porcentaje de completitud
      const completionPercentage = totalPossibleEvaluations > 0 
        ? Math.round((dimEvaluations.length / totalPossibleEvaluations) * 100)
        : 0
      
      // Calcular promedio de puntuación
      const avgScore = dimEvaluations.length > 0 
        ? (dimEvaluations.reduce((sum, e) => sum + e.score, 0) / dimEvaluations.length).toFixed(1)
        : '0.0'
      
      // Contar universidades que tienen al menos una evaluación en esta dimensión
      const universitiesEvaluated = userUniversity ? (dimEvaluations.length > 0 ? 1 : 0) : new Set(dimEvaluations.map(e => e.university)).size
      
      stats[dimension] = {
        count: dimEvaluations.length,
        avgScore: avgScore,
        completionPercentage: completionPercentage,
        universitiesEvaluated: universitiesEvaluated,
        totalCriteria: totalCriteria,
        totalPossibleEvaluations: totalPossibleEvaluations
      }
    })
    return stats
  }

  // Función para filtrar contenido por término de búsqueda
  const getFilteredContent = () => {
    if (!searchTerm.trim()) {
      return {
        universities: universities,
        evaluations: completedEvaluations
      }
    }

    const searchLower = searchTerm.toLowerCase().trim()
    
    // Filtrar universidades
    const filteredUniversities = universities.filter(uni => 
      uni.name.toLowerCase().includes(searchLower) ||
      uni.city.toLowerCase().includes(searchLower) ||
      uni.department.toLowerCase().includes(searchLower)
    )
    
    // Filtrar evaluaciones (por universidad o criterio)
    const filteredEvaluations = completedEvaluations.filter(evaluation => 
      evaluation.university.toLowerCase().includes(searchLower) ||
      evaluation.dimension.toLowerCase().includes(searchLower) ||
      evaluation.criterion.toLowerCase().includes(searchLower)
    )
    
    return {
      universities: filteredUniversities,
      evaluations: filteredEvaluations
    }
  }

  // Función para abrir modal de evaluación
  const openEvaluationModal = (evaluation) => {
    setSelectedEvaluationForModal(evaluation)
    setShowEvaluationModal(true)
  }

  // Función para cerrar modal
  const closeEvaluationModal = () => {
    setShowEvaluationModal(false)
    setSelectedEvaluationForModal(null)
  }

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('')
  }

  const { universities: filteredUniversities, evaluations: filteredEvaluations } = getFilteredContent()

  // Calcular progreso total de evaluación
  const getTotalProgress = () => {
    const totalCriteria = evaluationSequence.length
    const completedCount = completedEvaluations.length
    return totalCriteria > 0 ? Math.round((completedCount / totalCriteria) * 100) : 0
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
            <p className="welcome-subtitle">Sistema de Evaluación de Sostenibilidad para Universidades Colombianas</p>
          </div>

          {/* Progreso general de evaluación */}
          {isEvaluationMode && (
            <div className="evaluation-progress-section">
              <div className="progress-card">
                <h3 className="progress-title">Progreso de Evaluación</h3>
                <div className="progress-info">
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${(currentEvaluationIndex / evaluationSequence.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {currentEvaluationIndex + 1} de {evaluationSequence.length} criterios
                    </span>
                  </div>
                  <div className="completed-count">
                    <CheckCircle className="completed-icon" />
                    {completedEvaluations.length} evaluaciones completadas
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas por dimensión mejoradas */}
          <div className="stats-grid">
            {Object.entries(evaluationDimensions).map(([dimension, config]) => {
              const stats = getDimensionStats()[dimension]
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
                        {stats.universitiesEvaluated}/{universities.length} universidades evaluadas
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="action-buttons">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="action-button create-button"
            >
              <Plus />
              {showCreateForm ? 'Cancelar Creación' : 'Crear Universidad'}
            </button>
            
            <button
              onClick={startSequentialEvaluation}
              className="action-button score-button"
              disabled={isEvaluationMode || !userUniversity}
            >
              <Star />
              {!userUniversity ? 'Selecciona tu Universidad' : 
              isEvaluationMode ? 'Evaluación en Curso' : 'Iniciar Evaluación Secuencial'}
            </button>
          </div>

          {/* Barra de búsqueda general */}
          {!isEvaluationMode && !userUniversity && (
            <div className="university-selection-section">
              <div className="selection-container">
                <h3 className="selection-title">Selecciona tu Universidad</h3>
                <p className="selection-subtitle">Busca y escoge la universidad a la que perteneces</p>
                
                <div className="university-search-wrapper">
                  <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      placeholder="Escribe el nombre de tu universidad o ciudad..."
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
                              setUserUniversity(uni)
                              setSelectedUniversityId(uni.id.toString())
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
                
                {userUniversity && (
                  <div className="selected-university-info">
                    <h4>Universidad seleccionada:</h4>
                    <div className="selected-university-card">
                      <h5>{userUniversity.name}</h5>
                      <p>{userUniversity.city}, {userUniversity.department}</p>
                      <button
                        onClick={() => {
                          setUserUniversity(null)
                          setSelectedUniversityId('')
                          setUniversitySearchTerm('')
                        }}
                        className="change-university-btn"
                      >
                        Cambiar universidad
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showCreateForm && (
            <div className="form-container">
              <div className="form-header">
                <h3 className="form-title">Crear Nueva Universidad</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="close-button"
                >
                  <X />
                </button>
              </div>
              
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label className="form-label">
                    Nombre de la Universidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUniversity.name}
                    onChange={(e) => setNewUniversity({...newUniversity, name: e.target.value})}
                    className="form-input"
                    placeholder="Ej: Universidad Nacional de Colombia"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUniversity.city}
                    onChange={(e) => setNewUniversity({...newUniversity, city: e.target.value})}
                    className="form-input"
                    placeholder="Ej: Bogotá"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Departamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUniversity.department}
                    onChange={(e) => setNewUniversity({...newUniversity, department: e.target.value})}
                    className="form-input"
                    placeholder="Ej: Cundinamarca"
                  />
                </div>
                
                <div className="form-footer form-footer-span">
                  <button
                    onClick={handleCreateUniversity}
                    className="submit-button create-submit"
                  >
                    Crear Universidad
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de evaluación secuencial */}
          {isEvaluationMode && evaluationSequence.length > 0 && (
            <div className="form-container">
              <div className="form-header">
                <div>
                  <h3 className="form-title">Evaluación Secuencial</h3>
                  <p className="evaluation-progress-text">
                    Criterio {currentEvaluationIndex + 1} de {evaluationSequence.length}
                  </p>
                </div>
                <button 
                  onClick={() => setIsEvaluationMode(false)} 
                  className="close-button"
                  title="Salir de evaluación"
                >
                  <X />
                </button>
              </div>
              
              {/* Información del criterio actual */}
              <div className="current-evaluation-info">
                <div className="evaluation-context">
                  <h4 className="current-university">{evaluationSequence[currentEvaluationIndex]?.university.name}</h4>
                  <div className="current-location">
                    <MapPin className="location-icon" />
                    {evaluationSequence[currentEvaluationIndex]?.university.city}, {evaluationSequence[currentEvaluationIndex]?.university.department}
                  </div>
                </div>
                
                <div className="dimension-section">
                  <div className={`current-dimension-badge ${evaluationDimensions[evaluationSequence[currentEvaluationIndex]?.dimension]?.color}`}>
                    {evaluationDimensions[evaluationSequence[currentEvaluationIndex]?.dimension]?.icon}
                    <span>{evaluationSequence[currentEvaluationIndex]?.dimension}</span>
                  </div>
                </div>
                
                <div className="criterion-section">
                  <h5 className="criterion-label">Criterio a evaluar:</h5>
                  <p className="current-criterion">
                    {evaluationSequence[currentEvaluationIndex]?.criterion}
                  </p>
                </div>
              </div>

              <div className="evaluation-form">
                {/* Puntuación */}
                <div className="form-group">
                  <label className="form-label">Puntuación (1-5) *</label>
                  <div className="score-options">
                    {Object.entries(scoreDescriptions).map(([score, config]) => (
                      <label key={score} className="score-option">
                        <input
                          type="radio"
                          name="score"
                          value={score}
                          checked={evaluationForm.score === score}
                          onChange={(e) => setEvaluationForm({...evaluationForm, score: e.target.value})}
                          className="score-radio"
                        />
                        <div className={`score-option-content ${evaluationForm.score === score ? config.bgColor : ''}`}>
                          <div className="score-option-header">
                            <span className="score-number">{score}</span>
                            <span className={`score-label ${config.color}`}>{config.label}</span>
                          </div>
                          <p className="score-description">{config.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Evidencia</label>
                    <textarea
                      value={evaluationForm.evidence}
                      onChange={(e) => setEvaluationForm({...evaluationForm, evidence: e.target.value})}
                      className="form-textarea"
                      placeholder="Describe la evidencia que respalda esta puntuación..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Comentarios adicionales</label>
                    <textarea
                      value={evaluationForm.comment}
                      onChange={(e) => setEvaluationForm({...evaluationForm, comment: e.target.value})}
                      className="form-textarea"
                      placeholder="Observaciones, recomendaciones o comentarios..."
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Botones de navegación */}
                <div className="evaluation-navigation">
                  <div className="nav-buttons-left">
                    <button
                      onClick={goToPreviousEvaluation}
                      className="nav-button secondary-button"
                      disabled={currentEvaluationIndex === 0}
                    >
                      <ArrowLeft />
                      Anterior
                    </button>
                    
                    <button
                      onClick={skipCurrentEvaluation}
                      className="nav-button skip-button"
                    >
                      Omitir
                    </button>
                  </div>
                  
                  <div className="nav-buttons-right">
                    <button
                      onClick={saveCurrentEvaluation}
                      className="nav-button primary-button"
                    >
                      {currentEvaluationIndex === evaluationSequence.length - 1 ? 'Finalizar' : 'Siguiente'}
                      <ArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contenido principal (solo visible cuando no está en modo evaluación) */}
          {!isEvaluationMode && userUniversity &&(
          <div className="content-card">
          <h3 className="card-header">
            <Building2 className="universities-icon" />
            Mi Universidad
          </h3>
          
          <div className="card-list">
            {userUniversity && (
              <div className="selected-university-display">
                <div className="university-info-section">
                  <h4 className="university-name">{userUniversity.name}</h4>
                  <p className="university-location">
                    <MapPin />
                    {userUniversity.city}, {userUniversity.department}
                  </p>
                  
                  <div className="university-completion">
                    <div className="completion-bar-small">
                      <div 
                        className="completion-fill-small" 
                        style={{ 
                          width: `${Math.round((completedEvaluations.filter(e => e.university === userUniversity.name).length / 
                            Object.values(evaluationDimensions).reduce((sum, dim) => sum + dim.criteria.length, 0)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="completion-text-small">
                      {Math.round((completedEvaluations.filter(e => e.university === userUniversity.name).length / 
                        Object.values(evaluationDimensions).reduce((sum, dim) => sum + dim.criteria.length, 0)) * 100)}% evaluado 
                      ({completedEvaluations.filter(e => e.university === userUniversity.name).length}/
                      {Object.values(evaluationDimensions).reduce((sum, dim) => sum + dim.criteria.length, 0)} criterios)
                    </span>
                  </div>
                  
                  <div className="university-stats">
                    {Object.keys(evaluationDimensions).map(dimension => {
                      const dimEvaluations = completedEvaluations.filter(e => 
                        e.university === userUniversity.name && e.dimension === dimension
                      )
                      const avgScore = dimEvaluations.length > 0 
                        ? (dimEvaluations.reduce((sum, e) => sum + e.score, 0) / dimEvaluations.length).toFixed(1)
                        : 'N/A'
                      return (
                        <div key={dimension} className="university-stat">
                          <span className="stat-dimension">{dimension}:</span>
                          <span className="stat-value">{avgScore}</span>
                          <span className="stat-count">({dimEvaluations.length})</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div className="university-actions">
                  <button
                    onClick={() => {
                      setUserUniversity(null)
                      setSelectedUniversityId('')
                      setUniversitySearchTerm('')
                      setCompletedEvaluations([]) // Limpiar evaluaciones si cambia universidad
                    }}
                    className="change-university-button"
                  >
                    <X className="change-icon" />
                    Cambiar Universidad
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
          )}
        </div>
      </main>

      {/* Modal de evaluación expandida */}
      {showEvaluationModal && selectedEvaluationForModal && (
        <div className="modal-overlay" onClick={closeEvaluationModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Detalles de Evaluación</h2>
              <button
                onClick={closeEvaluationModal}
                className="modal-close-button"
              >
                <X />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="modal-section">
                <div className="modal-university-info">
                  <h3 className="modal-university-name">
                    {selectedEvaluationForModal.university}
                  </h3>
                  <div className="modal-criterion-info">
                    <span className={`modal-dimension-badge ${evaluationDimensions[selectedEvaluationForModal.dimension].color}`}>
                      {evaluationDimensions[selectedEvaluationForModal.dimension].icon}
                      {selectedEvaluationForModal.dimension}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">
                  <FileText />
                  Criterio Evaluado
                </h4>
                <p className="modal-criterion-text">
                  {selectedEvaluationForModal.criterion}
                </p>
              </div>

              <div className="modal-section">
                <h4 className="modal-section-title">Puntuación</h4>
                <div className="modal-score-display">
                  <div className="modal-score-stars">
                    {renderStars(selectedEvaluationForModal.score)}
                  </div>
                  <div className="modal-score-info">
                    <span className="modal-score-number">
                      {selectedEvaluationForModal.score}/5
                    </span>
                    <span className={`modal-score-label ${scoreDescriptions[selectedEvaluationForModal.score].color}`}>
                      {scoreDescriptions[selectedEvaluationForModal.score].label}
                    </span>
                  </div>
                  <p className="modal-score-description">
                    {scoreDescriptions[selectedEvaluationForModal.score].description}
                  </p>
                </div>
              </div>

              {selectedEvaluationForModal.evidence && (
                <div className="modal-section">
                  <h4 className="modal-section-title">
                    <FileText />
                    Evidencia
                  </h4>
                  <div className="modal-evidence-content">
                    {selectedEvaluationForModal.evidence}
                  </div>
                </div>
              )}

              {selectedEvaluationForModal.comment && (
                <div className="modal-section">
                  <h4 className="modal-section-title">
                    <MessageSquare />
                    Comentarios y Recomendaciones
                  </h4>
                  <div className="modal-comment-content">
                    "{selectedEvaluationForModal.comment}"
                  </div>
                </div>
              )}

              <div className="modal-section">
                <div className="modal-meta-info">
                  <span className="modal-evaluation-date">
                    <Calendar />
                    Evaluado el: {selectedEvaluationForModal.date}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
            </div>
          </div>
        </div>
      )}
    </div>
  )
}