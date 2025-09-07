import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, Bell, Home } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Universia</h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-2"
              >
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <span className="font-medium">{user?.name || user?.email}</span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <Settings className="h-4 w-4 mr-3" />
                    Configuración
                  </button>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <Bell className="h-4 w-4 mr-3" />
                    Notificaciones
                  </button>
                  
                  <div className="border-t">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user?.name || 'Usuario'}!
          </h2>
          <p className="text-gray-600">
            Has iniciado sesión exitosamente en Universia
          </p>
        </div>


        {/* Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre:</label>
                <p className="text-gray-900">{user?.name || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email:</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">ID:</label>
                <p className="text-gray-900 font-mono text-sm">{user?.id || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de registro:</label>
                <p className="text-gray-900">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString('es-ES')
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}