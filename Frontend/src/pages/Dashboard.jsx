import React, { useState, useEffect } from 'react';
import { authAPI, universityAPI, evaluationAPI } from '../services/api';
import Header from '../components/Header';
import UniversitySearch from '../components/UniversitySearch';
import SelectedUniversity from '../components/SelectedUniversity';
import AssignedUniversity from '../components/AssignedUniversity';
import GlobalStatistics from '../components/GlobalStatistics';
import EvaluationForm from "../components/EvaluationForm";
import UserEvaluations from '../components/UserEvaluations';
import toast from 'react-hot-toast';
import '../design/Dashboard.css';
import govlabLogo from '../assets/govlablogo.png';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [activeEvaluation, setActiveEvaluation] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ======================
  // Utils
  // ======================
  const groupEvaluationsByUniversity = (evaluations) => {
    const grouped = {};
    evaluations.forEach(ev => {
      const uniId = ev.university_id || ev.university?.id || ev.universities?.id;
      if (!grouped[uniId]) {
        grouped[uniId] = {
          university_id: uniId,
          university: ev.university || ev.universities || null,
          evaluations: []
        };
      }
      grouped[uniId].evaluations.push(ev);
    });
    return Object.values(grouped);
  };

  // Determinar próxima dimensión a evaluar
  const getNextDimensionToEvaluate = (userEvaluations, assignedUniversity) => {
    if (!assignedUniversity || !userEvaluations.length) return 1;

    const universityEvaluations = userEvaluations.find(
      group => group.university_id === assignedUniversity.id
    );

    if (!universityEvaluations) return 1;

    const completedDimensions = universityEvaluations.evaluations.map(
      ev => ev.dimension_id || ev.dimensions?.id
    );

    const allDimensions = [1, 2, 3];
    const nextDimension = allDimensions.find(
      dimId => !completedDimensions.includes(dimId)
    );

    return nextDimension || null;
  };

  // ======================
  // Verificar autenticación y cargar perfil actualizado
  // ======================
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      loadUserProfile();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.data?.success) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  };

  // ======================
  // Cargar universidades
  // ======================
  const loadUniversities = async () => {
    try {
      const universitiesRes = await universityAPI.getAll();
      setUniversities(universitiesRes.data);
    } catch (err) {
      console.error('Error cargando instituciones', err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError('');
        await loadUniversities();
      } catch (err) {
        console.error('Error cargando datos iniciales:', err);
        if (err.response?.status === 401) {
          setError('Tu sesión ha expirado. Serás redirigido al login...');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError('Error al cargar los datos. Por favor, intenta recargar la página.');
        }
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // ======================
  // Cargar evaluaciones SOLO del usuario autenticado
  // ======================
  const loadEvaluations = async () => {
    try {
      if (!user?.id) return;
      const data = await evaluationAPI.getAll(user.id);
      const parsed = Array.isArray(data) ? data : (data?.data || []);
      setEvaluations(groupEvaluationsByUniversity(parsed));
    } catch (err) {
      console.error("Error cargando evaluaciones:", err);
    }
  };

  useEffect(() => {
    loadEvaluations();
  }, [user]);

  // ======================
  // Logout
  // ======================
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  // ======================
  // Lógica de selección/evaluación
  // ======================
  const handleSelectUniversity = (university) => setSelectedUniversity(university);
  const handleDeselectUniversity = () => setSelectedUniversity(null);

  const handleStartEvaluation = (universityId, dimensionId) => {
    // Guardar la universidad que se está evaluando
    const universityBeingEvaluated = universities.data?.find(uni => uni.id === universityId);
    
    setActiveEvaluation({ 
      universityId, 
      dimensionId,
      university: universityBeingEvaluated // Guardar referencia a la universidad
    });
  };

  const handleExitEvaluation = () => {
    setActiveEvaluation(null);
  };

  const handleEvaluationFinished = async () => {
    // Primero, limpiar el estado de la universidad seleccionada
    setSelectedUniversity(null);
    
    // Luego, recargar todos los datos
    await loadEvaluations();
    await loadUniversities();
    await loadUserProfile();
    
    // Finalmente, cerrar el formulario de evaluación
    setActiveEvaluation(null);
  
    // Toast de bienvenida al dashboard
    setTimeout(() => {
      toast('¡De vuelta al dashboard!', {
        duration: 2500
      });
    }, 500);
  };

  // ======================
  // Eliminar evaluaciones de un grupo
  // ======================
  const handleDeleteEvaluation = async (group) => {
    try {
      for (const ev of group.evaluations) {
        await evaluationAPI.delete(ev.id);
      }

      setEvaluations((prev) =>
        prev.filter((g) => g.university_id !== group.university_id)
      );

      await loadUserProfile();
      await loadUniversities();

    } catch (err) {
      console.error("Error eliminando evaluaciones:", err);
    }
  };

  // ======================
  // Loader
  // ======================
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // ======================
  // RENDER CONDICIONAL PRINCIPAL
  // ======================
  
  // Si hay evaluación activa, SOLO mostrar el formulario
  if (activeEvaluation) {
    return (
      <div className="dashboard-container">
        <Header user={user} onLogout={handleLogout} />
        <main className="dashboard-main">
          <div className="content-section">
            <EvaluationForm
              universityId={activeEvaluation.universityId}
              dimensionId={activeEvaluation.dimensionId}
              onExit={handleExitEvaluation}
              onFinish={handleEvaluationFinished}
            />
          </div>
        </main>
      </div>
    );
  }

  // Si NO hay evaluación activa, mostrar el dashboard completo
  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={handleLogout} />

      <main className="dashboard-main">
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <div className="dashboard-sections">
          {/* Sección de bienvenida */}
          <div className="welcome-section">
            <div className="logo-container">
              <div className="logo-card">
                <img 
                  src={govlabLogo} 
                  alt="Govlab - Universidad de la Sabana" 
                  className="logo-image"
                />
              </div>
            </div>

            <div className="welcome-content">
              <h2 className="welcome-title">
                ¡Bienvenido {user ? user.email.split('@')[0] : 'Usuario'}!
              </h2>
              <p className="welcome-description">
                Sistema de Evaluación de Sostenibilidad para Instituciones de comunicación iberoamericanas
              </p>
            </div>
          </div>

          {/* Evaluaciones del usuario */}
          <div className="evaluation-section">
            <UserEvaluations evaluations={evaluations} onDelete={handleDeleteEvaluation} />
          </div>

          {/* Estadísticas globales */}
          <div className="statistics-section">
            <GlobalStatistics />
          </div>

          {/* Selector de universidad */}
          <div className="university-section">
            {user?.assigned_university ? (
              <AssignedUniversity
                university={user.assigned_university}
                nextDimension={getNextDimensionToEvaluate(evaluations, user.assigned_university)}
                onStartEvaluation={handleStartEvaluation}
              />
            ) : (
              !selectedUniversity ? (
                <UniversitySearch
                  universities={universities}
                  onSelectUniversity={handleSelectUniversity}
                />
              ) : (
                <SelectedUniversity
                  university={selectedUniversity}
                  onDeselect={handleDeselectUniversity}
                  onStartEvaluation={handleStartEvaluation}
                />
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}