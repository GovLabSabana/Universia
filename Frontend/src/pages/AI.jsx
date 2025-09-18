import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Ai() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Página de AI</h1>
      <p className="text-gray-600 mb-6">Aquí podrás usar la inteligencia artificial para obtener insights.</p>

      <button
        onClick={() => navigate('/dashboard')}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Volver al Dashboard
      </button>
    </div>
  );
}
