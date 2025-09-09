import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, Home, Plus, X, Star, MapPin, Building2 } from 'lucide-react'
import "../design/Dashboard.css"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showScoreForm, setShowScoreForm] = useState(false)
  
  const [newUniversity, setNewUniversity] = useState({
    name: '',
    city: '',
    department: ''
  })
  
  const [scoreForm, setScoreForm] = useState({
    university_id: '',
    criterion_id: '',
    score: '',
    comment: ''
  })
  
  const [universities, setUniversities] = useState([
    { id: 1, name: 'Universidad Sabana', city: 'Chía', department: 'Cundinamarca' },
    { id: 2, name: 'Universidad de Antioquia', city: 'Medellín', department: 'Antioquia' }
  ])
  
  const [scores, setScores] = useState([
    { id: 1, university: 'Universidad Sabana', criterion: 'Sostenibilidad', score: 4, comment: 'aaaaaaa' },
    { id: 2, university: 'Universidad de Antioquia', criterion: 'Calidad Académica', score: 5, comment: 'bbbbbb' }
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

  const handleCreateScore = () => {
    if (!scoreForm.university_id || !scoreForm.score) {
      alert('Por favor selecciona una universidad y una puntuación')
      return
    }

    const newScore = {
      id: scores.length + 1,
      university: universities.find(u => u.id === parseInt(scoreForm.university_id))?.name || 'Universidad',
      criterion: 'Criterio de evaluación',
      score: parseInt(scoreForm.score),
      comment: scoreForm.comment
    }
    setScores([...scores, newScore])
    setScoreForm({ university_id: '', criterion_id: '', score: '', comment: '' })
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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-nav">
            {/* Logo */}
            <div className="logo-container">
              <div className="logo-icon">
                <Home />
              </div>
              <h1 className="logo-text">Universia</h1>
            </div>

            {/* User Menu */}
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

              {/* Dropdown Menu */}
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
            <p className="welcome-subtitle">Gestiona universidades y evalúa su calidad académica</p>
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
              {showScoreForm ? 'Cancelar Puntuación' : 'Añadir Puntuación'}
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
                    placeholder="Ej: Universidad Nacional"
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
                <h3 className="form-title">Añadir Puntuación</h3>
                <button
                  onClick={() => setShowScoreForm(false)}
                  className="close-button"
                >
                  <X />
                </button>
              </div>
              
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Universidad *
                  </label>
                  <select
                    required
                    value={scoreForm.university_id}
                    onChange={(e) => setScoreForm({...scoreForm, university_id: e.target.value})}
                    className="form-select score-focus"
                  >
                    <option value="">Seleccionar universidad</option>
                    {universities.map(uni => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Puntuación (1-5) *
                  </label>
                  <select
                    required
                    value={scoreForm.score}
                    onChange={(e) => setScoreForm({...scoreForm, score: e.target.value})}
                    className="form-select score-focus"
                  >
                    <option value="">Seleccionar puntuación</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} estrella{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group form-footer-span-2">
                  <label className="form-label">
                    Comentario
                  </label>
                  <textarea
                    value={scoreForm.comment}
                    onChange={(e) => setScoreForm({...scoreForm, comment: e.target.value})}
                    className="form-textarea score-focus"
                    placeholder="Escribe tu evaluación sobre esta universidad..."
                    rows={3}
                  />
                </div>
                
                <div className="form-footer form-footer-span-2">
                  <button
                    onClick={handleCreateScore}
                    className="submit-button score-submit"
                  >
                    Añadir Puntuación
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
              <h3 className="card-header">
                <Star className="scores-icon" />
                Puntuaciones ({scores.length})
              </h3>
              
              <div className="card-list">
                {scores.map(score => (
                  <div key={score.id} className="list-item">
                    <div className="score-header">
                      <h4 className="score-university">{score.university}</h4>
                      <div className="score-stars">
                        {renderStars(score.score)}
                      </div>
                    </div>
                    <p className="score-criterion">{score.criterion}</p>
                    {score.comment && (
                      <p className="score-comment">"{score.comment}"</p>
                    )}
                  </div>
                ))}
                
                {scores.length === 0 && (
                  <div className="empty-state">
                    <Star className="empty-icon" />
                    <p className="empty-title">No hay puntuaciones registradas</p>
                    <p className="empty-subtitle">Haz clic en "Añadir Puntuación" para agregar la primera</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}