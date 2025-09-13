import React, { useEffect, useState } from 'react'
import { statisticsAPI } from '../services/api'

// Configuración de colores y nombres por dimensión
const dimensionConfig = {
  1: {
    name: 'Gobernanza',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  2: {
    name: 'Social',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  3: {
    name: 'Ambiental',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
}

const GlobalStatistics = () => {
  const [averages, setAverages] = useState([])
  const [rankings, setRankings] = useState({ 1: [], 2: [], 3: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const avgRes = await statisticsAPI.getAverages()
        console.log('Average stats:', avgRes.data)
        setAverages(avgRes.data.data || [])

        const rankingData = {}
        for (let dim = 1; dim <= 3; dim++) {
          const res = await statisticsAPI.getRanking(dim)
          rankingData[dim] = res.data.data || []
        }
        setRankings(rankingData)
      } catch (err) {
        console.error(err)
        setError('Error cargando estadísticas globales')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p className="text-center">Cargando estadísticas...</p>
  if (error) return <p className="text-red-500 text-center">{error}</p>

  return (
    <div className="my-8 p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-green-700">
        Estadísticas Globales
      </h2>

      {/* === Promedios Globales === */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Promedios por Dimensión</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {averages.map((dim) => {
            const config = dimensionConfig[dim.dimension_id] || {}
            return (
              <div
                key={dim.dimension_id}
                className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
              >
                <h4 className={`font-bold ${config.color}`}>
                  {config.name || dim.dimension_name}
                </h4>
                <p className={config.color}>
                  Promedio:{' '}
                  {dim.average_score != null
                    ? dim.average_score.toFixed(1)
                    : 'N/A'}
                </p>
                <p className="text-gray-600">
                  Total evaluaciones: {dim.total_evaluations}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* === Rankings === */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Top 10 Universidades</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(rankings).map((dimId) => {
            const config = dimensionConfig[dimId] || {}
            return (
              <div
                key={dimId}
                className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
              >
                <h4 className={`font-bold mb-2 ${config.color}`}>
                  {config.name || `Dimensión ${dimId}`}
                </h4>
                <ol className="list-decimal ml-4">
                  {rankings[dimId].length > 0 ? (
                    rankings[dimId].map((uni, idx) => (
                      <li key={idx} className="mb-1">
                        <span className="font-medium">{uni.university_name}</span>{' '}
                        —{' '}
                        {uni.average_score != null
                          ? uni.average_score.toFixed(1)
                          : 'N/A'}
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay datos</p>
                  )}
                </ol>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GlobalStatistics
