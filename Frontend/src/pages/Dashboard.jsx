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
    if (!assignedUniversity || !userEvaluations.length) return 1; // Empezar desde dimensión 1

    // Obtener dimensiones ya evaluadas para la universidad asignada
    const universityEvaluations = userEvaluations.find(
      group => group.university_id === assignedUniversity.id
    );

    if (!universityEvaluations) return 1; // No hay evaluaciones, empezar desde 1

    // Obtener IDs de dimensiones completadas
    const completedDimensions = universityEvaluations.evaluations.map(
      ev => ev.dimension_id || ev.dimensions?.id
    );

    // Las dimensiones son 1, 2, 3 (Gobernanza, Social, Ambiental)
    const allDimensions = [1, 2, 3];

    // Encontrar la primera dimensión no completada
    const nextDimension = allDimensions.find(
      dimId => !completedDimensions.includes(dimId)
    );

    return nextDimension || null; // null si todas están completadas
  };

  // ======================
  // Verificar autenticación y cargar perfil actualizado
  // ======================
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      // Cargar perfil actualizado del backend
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
      // Fallback al localStorage si falla la llamada
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
    setActiveEvaluation({ universityId, dimensionId });
  };

  const handleExitEvaluation = () => {
    setActiveEvaluation(null);
  };

  // 🔹 Cuando se termina una evaluación
  const handleEvaluationFinished = async () => {
    await loadEvaluations(); // refrescar evaluaciones
    await loadUniversities(); // refrescar estadísticas/puntajes de universidades
    await loadUserProfile(); // refrescar perfil del usuario (para universidad asignada)
    setActiveEvaluation(null); // regresar al dashboard

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

      // Actualizar lista de evaluaciones
      setEvaluations((prev) =>
        prev.filter((g) => g.university_id !== group.university_id)
      );

      // Refrescar perfil del usuario (en caso de que se haya limpiado la universidad asignada)
      await loadUserProfile();

      // Refrescar estadísticas globales
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido {user ? user.email.split('@')[0] : 'Usuario'}!
          </h2>
          <p className="text-gray-600 mb-4">
            Sistema de Evaluación de Sostenibilidad para Instituciones de Educación Superior Colombianas
          </p>

          {/* Mostrar estado solo si no tiene universidad asignada */}
          {user && !user.assigned_university && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Busca tu Institución
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Selecciona una Institución para comenzar tu evaluación. Una vez seleccionada, quedarás asignado a ella.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

  
        <UserEvaluations evaluations={evaluations} onDelete={handleDeleteEvaluation} />

        {/* Vista condicional */}
        {activeEvaluation ? (
          <EvaluationForm
            universityId={activeEvaluation.universityId}
            dimensionId={activeEvaluation.dimensionId}
            onExit={handleExitEvaluation}
            onFinish={handleEvaluationFinished}
          />
        ) : (
          <>
            <GlobalStatistics />

            {/* Lógica principal basada en universidad asignada */}
            {user?.assigned_university ? (
              // Usuario tiene universidad asignada: mostrar componente especial
              <AssignedUniversity
                university={user.assigned_university}
                nextDimension={getNextDimensionToEvaluate(evaluations, user.assigned_university)}
                onStartEvaluation={handleStartEvaluation}
              />
            ) : (
              // Usuario SIN universidad asignada: mostrar buscador o universidad seleccionada
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
          </>
        )}
      </main>
    </div>
  );
}
