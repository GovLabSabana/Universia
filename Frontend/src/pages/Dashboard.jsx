import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, Home, Plus } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const getUserNameFromEmail = (email) => {
    if (!email) return 'Usuario'
    return email.split('@')[0]
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
                <span className="font-medium">
                  {getUserNameFromEmail(user?.email)}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {getUserNameFromEmail(user?.email)}
                    </p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                    <Settings className="h-4 w-4 mr-3" />
                    Configuración
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Bienvenida */}
        <h2 className="text-2xl font-bold text-gray-800 mb-10" >
          ! Bienvenido {getUserNameFromEmail(user?.email)}!
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Crear */}
          <div
            onClick={() => alert('Ir a crear universidad')}
            className="w-64 h-64 bg-white rounded-3xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center border-2 border-blue-300 hover:border-primary-500"
          >
            <Plus className="h-16 w-16 text-primary-600" />
            <p className="mt-4 text-xl font-semibold text-gray-800">Crear</p>
          </div>

          {/* Card Puntos */}
          <div
            onClick={() => alert('Ir a puntajes')}
            className="w-64 h-64 bg-white rounded-3xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col items-center justify-center border-2 border-yellow-200 hover:border-yellow-500"
          >
            <span className="text-5xl font-bold text-yellow-600">400</span>
            <p className="mt-4 text-xl font-semibold text-gray-800">Puntos</p>
          </div>
        </div>
      </main>
    </div>
  )
}
