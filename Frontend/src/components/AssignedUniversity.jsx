import React from 'react';
import { Building2, MapPin, Play, CheckCircle, Shield, Users, Leaf } from 'lucide-react';

const AssignedUniversity = ({ university, nextDimension, onStartEvaluation }) => {
  const dimensionConfig = {
    1: { name: 'Gobernanza', icon: <Shield className="h-4 w-4" />, color: 'text-purple-700' },
    2: { name: 'Social', icon: <Users className="h-4 w-4" />, color: 'text-blue-700' },
    3: { name: 'Ambiental', icon: <Leaf className="h-4 w-4" />, color: 'text-green-700' }
  };

  const getDimensionStatus = (dimensionId) => {
    if (!nextDimension) return 'completed'; // Todas completadas
    return dimensionId < nextDimension ? 'completed' :
           dimensionId === nextDimension ? 'next' : 'pending';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      {/* Header de Universidad Asignada */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Building2 className="h-5 w-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Universidad Asignada</h3>
        </div>
        <h4 className="text-xl font-bold text-gray-900 mb-2">{university.name}</h4>
        <p className="text-gray-600 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {university.city}, {university.department}
        </p>
      </div>

      {/* Progreso de Evaluaciones */}
      <div className="mb-6">
        <h5 className="text-md font-medium mb-3 text-gray-900">Progreso de Evaluación</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map(dimensionId => {
            const config = dimensionConfig[dimensionId];
            const status = getDimensionStatus(dimensionId);

            return (
              <div
                key={dimensionId}
                className={`p-3 rounded-lg border ${
                  status === 'completed' ? 'bg-green-50 border-green-200' :
                  status === 'next' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={config.color}>{config.icon}</div>
                    <span className={`ml-2 font-medium ${config.color}`}>
                      {config.name}
                    </span>
                  </div>
                  <div>
                    {status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {status === 'next' && (
                      <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse"></div>
                    )}
                    {status === 'pending' && (
                      <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de Acción */}
      <div>
        {nextDimension ? (
          <button
            onClick={() => onStartEvaluation(university.id, nextDimension)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors"
          >
            <Play className="h-5 w-5 mr-2" />
            Continuar Evaluación - {dimensionConfig[nextDimension].name}
          </button>
        ) : (
          <div className="w-full bg-green-100 text-green-800 py-3 px-4 rounded-md flex items-center justify-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            ¡Evaluación Completada!
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedUniversity;