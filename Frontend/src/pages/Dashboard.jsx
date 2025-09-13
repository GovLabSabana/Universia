import React, { useState, useEffect } from 'react';
import { authAPI, universityAPI } from '../services/api';
import Header from '../components/Header';
import UniversitySearch from '../components/UniversitySearch';
import SelectedUniversity from '../components/SelectedUniversity';
import GlobalStatistics from '../components/GlobalStatistics'

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  }, []);

  // Cargar universidades
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const universitiesRes = await universityAPI.getAll();
        setUniversities(universitiesRes.data);
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

  // Logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('expires_at');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const handleSelectUniversity = (university) => setSelectedUniversity(university);
  const handleDeselectUniversity = () => setSelectedUniversity(null);

  const handleStartEvaluation = () => {
    if (!selectedUniversity) {
      alert('Por favor, selecciona una universidad primero');
      return;
    }
    console.log('Iniciando evaluación para:', selectedUniversity.name);
  };

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
          <p className="text-gray-600">
            Sistema de Evaluación de Sostenibilidad para Instituciones de Educación Superior Colombianas
          </p>
        </div>

        <GlobalStatistics />

        {!selectedUniversity ? (
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
        )}
      </main>
    </div>
  );
}
