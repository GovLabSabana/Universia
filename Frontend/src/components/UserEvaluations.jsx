import React from 'react';
import { Trash2, MapPin, Building2, Award } from 'lucide-react';

const UserEvaluations = ({ evaluations = [], onDelete }) => {
  
  // Función mejorada para manejar la eliminación con recarga
  const handleDelete = async (group) => {
    try {
      // Mostrar confirmación antes de eliminar
      const confirmed = window.confirm(
        `¿Estás seguro de que deseas eliminar todas las evaluaciones de ${group.university?.name || 'esta universidad'}?`
      );
      
      if (!confirmed) return;
      
      // Llamar a la función onDelete pasada como prop
      if (onDelete) {
        await onDelete(group);
      }
      
      // Recargar la página después de eliminar
      window.location.reload();
      
    } catch (error) {
      console.error('Error al eliminar:', error);
      // Opcional: mostrar un mensaje de error
      alert('Hubo un error al eliminar las evaluaciones. Por favor, intenta de nuevo.');
    }
  };

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Tus Evaluaciones</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-500 text-lg">No has evaluado ninguna universidad aún.</p>
          <p className="text-slate-400 text-sm mt-2">Selecciona una universidad para comenzar tu primera evaluación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Award className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Tus Evaluaciones</h3>
      </div>
      <div className="space-y-4">
        {evaluations.map((group) => {
          const uni = group.university || {};
          return (
            <div
              key={group.university_id}
              className="flex justify-between items-center border border-slate-200 hover:border-slate-300 transition-colors duration-200 p-6 rounded-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">
                    {uni.name || 'Universidad desconocida'}
                  </h4>
                  <p className="text-slate-500 flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {uni.city && uni.department ? `${uni.city}, ${uni.department}` : 'Ubicación no disponible'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(group)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 p-3 rounded-lg"
                title="Eliminar todas las evaluaciones de esta universidad"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserEvaluations;