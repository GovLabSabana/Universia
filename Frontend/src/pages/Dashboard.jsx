import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, Home, Plus, X, Star, MapPin, Building2, Leaf, Users, Shield, ChevronDown, ChevronUp, Filter, Eye, Calendar, MessageSquare, FileText } from 'lucide-react'
import "../design/Dashboard.css"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showScoreForm, setShowScoreForm] = useState(false)
  const [selectedDimension, setSelectedDimension] = useState('')
  const [selectedCriterion, setSelectedCriterion] = useState('')
  const [expandedEvaluations, setExpandedEvaluations] = useState({})
  
  // Nuevos estados para el filtrado y modal
  const [selectedUniversityFilter, setSelectedUniversityFilter] = useState('')
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [selectedEvaluationForModal, setSelectedEvaluationForModal] = useState(null)
  
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    city: '',
    department: ''
  })
  
  const [evaluationForm, setEvaluationForm] = useState({
    university_id: '',
    dimension: '',
    criterion: '',
    score: '',
    evidence: '',
    comment: ''
  })
  
  const [universities, setUniversities] = useState([
    { id: 1, name: 'Universidad Sabana', city: 'Chía', department: 'Cundinamarca' },
    { id: 2, name: 'Universidad de Antioquia', city: 'Medellín', department: 'Antioquia' },
    { id: 3, name: 'Universidad Nacional', city: 'Bogotá', department: 'Cundinamarca' }
  ])
  
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
  
  const [evaluations, setEvaluations] = useState([
    { 
      id: 1, 
      university: 'Universidad Sabana', 
      dimension: 'Ambiental',
      criterion: 'Uso de energías renovables', 
      score: 4, 
      evidence: 'Paneles solares en 3 edificios principales, sistema de calentamiento solar para piscinas y algunas áreas comunes. Plan de expansión para 2025.',
      comment: 'Buena implementación con planes de expansión. Se recomienda acelerar la instalación en más edificios.',
      date: '2024-01-15'
    },
    { 
      id: 2, 
      university: 'Universidad de Antioquia', 
      dimension: 'Social',
      criterion: 'Programas de apoyo para estudiantes de escasos recursos', 
      score: 5, 
      evidence: 'Programa integral de becas que cubre el 35% de la población estudiantil, subsidios de alimentación, transporte y material académico.',
      comment: 'Excelente cobertura y seguimiento de estudiantes. Modelo a seguir por otras instituciones.',
      date: '2024-01-10'
    },
    { 
      id: 3, 
      university: 'Universidad Sabana', 
      dimension: 'Gobernanza',
      criterion: 'Plan o estrategia de sostenibilidad', 
      score: 3, 
      evidence: 'Plan estratégico 2024-2027 incluye metas de sostenibilidad, pero implementación parcial.',
      comment: 'Falta mayor integración entre las diferentes áreas y seguimiento de indicadores.',
      date: '2024-01-12'
    },
    { 
      id: 4, 
      university: 'Universidad Nacional', 
      dimension: 'Ambiental',
      criterion: 'Gestión de residuos sólidos y peligrosos', 
      score: 5, 
      evidence: 'Sistema completo de separación, reciclaje y disposición final. Centro de acopio y convenios con empresas especializadas.',
      comment: 'Implementación ejemplar con excelentes resultados medibles y programas de educación.',
      date: '2024-01-08'
    },
    { 
      id: 5, 
      university: 'Universidad Nacional', 
      dimension: 'Social',
      criterion: 'Políticas de respeto por los derechos humanos', 
      score: 4, 
      evidence: 'Política integral de DDHH, oficina especializada, protocolos claros y sistema de quejas.',
      comment: 'Buena implementación, se recomienda fortalecer la divulgación y capacitación continua.',
      date: '2024-01-05'
    }
  ])

  const handleLogout = () => {
    logout()
  }

  const getUserNameFromEmail = (email) => {
    if (!email) return 'Usuario'
    return email.split('@')[0]
  }

  const handleCreateUniversity = () => {
    if (!newUniversity.name || !newUniversity.city || !newUniversity.department) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    const newUni = {
      id: universities.length + 1,
      ...newUniversity
    }
    setUniversities([...universities, newUni])
    setNewUniversity({ name: '', city: '', department: '' })
    setShowCreateForm(false)
  }

  const handleCreateEvaluation = () => {
    if (!evaluationForm.university_id || !evaluationForm.dimension || !evaluationForm.criterion || !evaluationForm.score) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }

    const newEvaluation = {
      id: evaluations.length + 1,
      university: universities.find(u => u.id === parseInt(evaluationForm.university_id))?.name || 'Universidad',
      dimension: evaluationForm.dimension,
      criterion: evaluationForm.criterion,
      score: parseInt(evaluationForm.score),
      evidence: evaluationForm.evidence,
      comment: evaluationForm.comment,
      date: new Date().toISOString().split('T')[0]
    }
    setEvaluations([...evaluations, newEvaluation])
    setEvaluationForm({ university_id: '', dimension: '', criterion: '', score: '', evidence: '', comment: '' })
    setSelectedDimension('')
    setSelectedCriterion('')
    setShowScoreForm(false)
  }

  const renderStars = (score) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`star ${i < score ? 'star-filled' : 'star-empty'}`}
      />
    ))
  }

  const getDimensionStats = () => {
    const stats = {}
    Object.keys(evaluationDimensions).forEach(dim => {
      const dimEvaluations = evaluations.filter(e => e.dimension === dim)
      stats[dim] = {
        count: dimEvaluations.length,
        avgScore: dimEvaluations.length > 0 
          ? (dimEvaluations.reduce((sum, e) => sum + e.score, 0) / dimEvaluations.length).toFixed(1)
          : 0
      }
    })
    return stats
  }

  const toggleEvaluationExpansion = (id) => {
    setExpandedEvaluations(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Función para filtrar evaluaciones por universidad
  const getFilteredEvaluations = () => {
    if (!selectedUniversityFilter) return evaluations
    return evaluations.filter(evaluation => evaluation.university === selectedUniversityFilter)
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
                  
                  <button className="dropdown-button">
                    <Settings />
                    Configuración
                  </button>
                  
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

          {/* Estadísticas por dimensión */}
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
                  <div className="stat-score">
                    <span className="stat-score-number">{stats.avgScore}</span>
                    <span className="stat-score-text">Promedio</span>
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
              onClick={() => setShowScoreForm(!showScoreForm)}
              className="action-button score-button"
            >
              <Star />
              {showScoreForm ? 'Cancelar Evaluación' : 'Nueva Evaluación'}
            </button>
          </div>

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

          {showScoreForm && (
            <div className="form-container">
              <div className="form-header">
                <h3 className="form-title">Nueva Evaluación de Sostenibilidad</h3>
                <button
                  onClick={() => setShowScoreForm(false)}
                  className="close-button"
                >
                  <X />
                </button>
              </div>
              
              <div className="evaluation-form">
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Universidad *</label>
                    <select
                      required
                      value={evaluationForm.university_id}
                      onChange={(e) => setEvaluationForm({...evaluationForm, university_id: e.target.value})}
                      className="form-select"
                    >
                      <option value="">Seleccionar universidad</option>
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Dimensión *</label>
                    <select
                      required
                      value={evaluationForm.dimension}
                      onChange={(e) => {
                        setEvaluationForm({...evaluationForm, dimension: e.target.value, criterion: ''})
                        setSelectedDimension(e.target.value)
                        setSelectedCriterion('')
                      }}
                      className="form-select"
                    >
                      <option value="">Seleccionar dimensión</option>
                      {Object.entries(evaluationDimensions).map(([dimension, config]) => (
                        <option key={dimension} value={dimension}>{dimension}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedDimension && (
                  <div className="form-group">
                    <label className="form-label">Criterio *</label>
                    <select
                      required
                      value={evaluationForm.criterion}
                      onChange={(e) => {
                        setEvaluationForm({...evaluationForm, criterion: e.target.value})
                        setSelectedCriterion(e.target.value)
                      }}
                      className="form-select"
                    >
                      <option value="">Seleccionar criterio</option>
                      {evaluationDimensions[selectedDimension].criteria.map(criterion => (
                        <option key={criterion} value={criterion}>{criterion}</option>
                      ))}
                    </select>
                  </div>
                )}

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
                
                <div className="form-footer">
                  <button
                    onClick={handleCreateEvaluation}
                    className="submit-button score-submit"
                  >
                    Guardar Evaluación
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="content-grid">
            <div className="content-card">
              <h3 className="card-header">
                <Building2 className="universities-icon" />
                Universidades ({universities.length})
              </h3>
              
              <div className="card-list">
                {universities.map(uni => (
                  <div key={uni.id} className="list-item">
                    <h4 className="university-name">{uni.name}</h4>
                    <p className="university-location">
                      <MapPin />
                      {uni.city}, {uni.department}
                    </p>
                    <div className="university-stats">
                      {Object.keys(evaluationDimensions).map(dimension => {
                        const dimEvaluations = evaluations.filter(e => e.university === uni.name && e.dimension === dimension)
                        const avgScore = dimEvaluations.length > 0 
                          ? (dimEvaluations.reduce((sum, e) => sum + e.score, 0) / dimEvaluations.length).toFixed(1)
                          : 'N/A'
                        return (
                          <div key={dimension} className="university-stat">
                            <span className="stat-dimension">{dimension}:</span>
                            <span className="stat-value">{avgScore}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
                
                {universities.length === 0 && (
                  <div className="empty-state">
                    <Building2 className="empty-icon" />
                    <p className="empty-title">No hay universidades registradas</p>
                    <p className="empty-subtitle">Haz clic en "Crear Universidad" para agregar la primera</p>
                  </div>
                )}
              </div>
            </div>

            <div className="content-card">
              <div className="evaluations-header">
                <h3 className="card-header">
                  <Star className="scores-icon" />
                  Evaluaciones ({getFilteredEvaluations().length})
                </h3>
                
                <div className="filter-section">
                  <div className="filter-group">
                    <Filter className="filter-icon" />
                    <select
                      value={selectedUniversityFilter}
                      onChange={(e) => setSelectedUniversityFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="">Todas las universidades</option>
                      {universities.map(uni => (
                        <option key={uni.id} value={uni.name}>{uni.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="evaluations-list">
                {getFilteredEvaluations().map(evaluation => {
                  const scoreConfig = scoreDescriptions[evaluation.score]
                  const dimensionConfig = evaluationDimensions[evaluation.dimension]
                  
                  return (
                    <div key={evaluation.id} className="evaluation-card">
                      <div className="evaluation-summary">
                        <div className="evaluation-main-info">
                          <h4 className="evaluation-university">{evaluation.university}</h4>
                          <div className="evaluation-criterion-info">
                            <span className={`dimension-badge ${dimensionConfig.color}`}>
                              {dimensionConfig.icon}
                              {evaluation.dimension}
                            </span>
                            <span className="criterion-name">{evaluation.criterion}</span>
                          </div>
                        </div>
                        
                        <div className="evaluation-score-section">
                          <div className="evaluation-score-badge">
                            <span className={`score-badge ${scoreConfig.color}`}>
                              {evaluation.score}/5
                            </span>
                          </div>
                          <button
                            onClick={() => openEvaluationModal(evaluation)}
                            className="view-details-button"
                            title="Ver detalles completos"
                          >
                            <Eye />
                          </button>
                        </div>
                      </div>
                      
                      <div className="evaluation-preview">
                        <div className="evaluation-stars-small">
                          {renderStars(evaluation.score)}
                        </div>
                        <span className="evaluation-date-small">
                          <Calendar />
                          {evaluation.date}
                        </span>
                      </div>
                    </div>
                  )
                })}
                
                {getFilteredEvaluations().length === 0 && (
                  <div className="empty-state">
                    <Star className="empty-icon" />
                    <p className="empty-title">
                      {selectedUniversityFilter 
                        ? `No hay evaluaciones para ${selectedUniversityFilter}`
                        : 'No hay evaluaciones registradas'
                      }
                    </p>
                    <p className="empty-subtitle">
                      {selectedUniversityFilter 
                        ? 'Selecciona otra universidad o crea una nueva evaluación'
                        : 'Haz clic en "Nueva Evaluación" para agregar la primera'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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