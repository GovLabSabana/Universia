import React, { useState } from 'react';
import { LogOut, User, Home } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getUserNameFromEmail = (email) => {
    if (!email) return 'Usuario';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Home className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">EvalúaSostenible</h1>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <User className="h-5 w-5" />
              <span>{getUserNameFromEmail(user?.email)}</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-500 border-b">
                  {user?.email}
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
