import React, { useEffect, useState } from 'react';
import { statisticsAPI } from '../services/api';
import { TrendingUp } from 'lucide-react';

const dimensionConfig = {
  1: { 
    name: 'Gobernanza', 
    color: 'text-purple-600', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200', 
    accent: 'bg-purple-600' 
  },
  2: { 
    name: 'Social', 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    accent: 'bg-blue-600' 
  },
  3: { 
    name: 'Ambiental', 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    accent: 'bg-emerald-600' 
  }
};

const GlobalStatistics = () => {
  const [averages, setAverages] = useState([]);
  const [rankings, setRankings] = useState({ 1: [], 2: [], 3: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const avgRes = await statisticsAPI.getAverages();
        setAverages(avgRes.data.data || []);

        const rankingData = {};
        for (let dim = 1; dim <= 3; dim++) {
          const res = await statisticsAPI.getRanking(dim);
          rankingData[dim] = res.data.data || [];
        }
        setRankings(rankingData);
      } catch (err) {
        console.error(err);
        setError('Error cargando estadísticas globales');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-8">
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Estadísticas Globales</h2>
      </div>

      {/* Promedios por Dimensión */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Promedios por Dimensión</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {averages.map((dim) => {
            const config = dimensionConfig[dim.dimension_id] || {};
            return (
              <div
                key={dim.dimension_id}
                className={`relative p-6 rounded-xl border ${config.bg} ${config.border} overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${config.accent}`}></div>
            
                <h4 className={`font-bold text-lg ${config.color} mb-3 text-center`}>
                  {config.name || dim.dimension_name}
                </h4>
            
                <div className="space-y-2 text-center">
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {dim.average_score != null ? dim.average_score.toFixed(1) : 'N/A'}
                    </span>
                    <span className="text-slate-500">/ 5.0</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {dim.total_evaluations} evaluaciones
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rankings */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Top 10 Universidades</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {Object.keys(rankings).map((dimId) => {
            const config = dimensionConfig[dimId] || {};
            return (
              <div key={dimId} className={`p-6 rounded-xl border ${config.bg} ${config.border}`}>
                <div className="flex items-center space-x-2 mb-4">
                </div>
                <div className="space-y-3">
                  {rankings[dimId].length > 0 ? (
                    rankings[dimId].map((uni, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center justify-center w-6 h-6 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-900 text-sm">
                            {uni.university_name}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {uni.average_score != null ? uni.average_score.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-4">No hay datos</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GlobalStatistics;