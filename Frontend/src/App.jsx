import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Compare from './pages/Compare'
import AI from './pages/AI'
import LoadingSpinner from './components/LoadingSpinner'

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return user ? children : <Navigate to="/login" replace />
}

// Componente para rutas públicas (solo accesibles sin autenticación)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            
            {/* Rutas protegidas */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/compare" element={
              <PrivateRoute>
                <Compare />
              </PrivateRoute>
            } />
            <Route path="/ai" element={
              <PrivateRoute>
                <AI />
              </PrivateRoute>
            } />
            
            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Página no encontrada</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Volver
                  </button>
                </div>
              </div>
            } />
          </Routes>
          
          {/* Notificaciones toast */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App