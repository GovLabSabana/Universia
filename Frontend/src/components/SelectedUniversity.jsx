import React, { useEffect } from 'react';
import { Building2, MapPin, X, Star, Shield, Users, Leaf } from 'lucide-react';

const SelectedUniversity = ({ university, onDeselect, onStartEvaluation }) => {

  // Ajustado a lo que devuelve el backend: Governanza, Social, Ambiental
  const dimensionConfig = {
    'Gobernanza': { icon: <Shield className="h-4 w-4" />, color: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    'Social': { icon: <Users className="h-4 w-4" />, color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    'Ambiental': { icon: <Leaf className="h-4 w-4" />, color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
  };

  const getDimensionScore = (dimensionName) => {
    if (!university.dimension_scores || !Array.isArray(university.dimension_scores)) {
        return { average_score: 0, evaluation_count: 0 };
    }

    const found = university.dimension_scores.find(
        score => score.dimension_name === dimensionName
    );

    return found || { average_score: 0, evaluation_count: 0 };
    };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-medium mb-2 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            {university.name}
          </h3>
          <p className="text-gray-600 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {university.city}, {university.department}
          </p>
        </div>
        <button
          onClick={onDeselect}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Estadísticas de evaluación */}
      <div className="mb-6">
        <h4 className="text-md font-medium mb-3">Estadísticas de Evaluación</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(dimensionConfig).map(dimensionName => {
            const config = dimensionConfig[dimensionName];
            const score = getDimensionScore(dimensionName);
            return (
              <div 
                key={dimensionName}
                className={`${config.bgColor} border ${config.borderColor} p-4 rounded-lg`}
              >
                <div className="flex items-center mb-2">
                  <div className={config.color}>{config.icon}</div>
                  <span className={`ml-2 font-semibold ${config.color}`}>
                    {dimensionName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`text-2xl font-bold ${config.color}`}>
                      {Number(score.average_score || 0).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">Promedio</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${config.color}`}>
                      {score.evaluation_count}
                    </div>
                    <div className="text-sm text-gray-500">
                      {score.evaluation_count === 1 ? 'evaluación' : 'evaluaciones'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onStartEvaluation}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center transition-colors"
      >
        <Star className="h-5 w-5 mr-2" />
        Iniciar Evaluación
      </button>
    </div>
  );
};

export default SelectedUniversity;
