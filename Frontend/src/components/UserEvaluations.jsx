import React from 'react';
import { Trash2, MapPin, Building2 } from 'lucide-react';

const UserEvaluations = ({ evaluations = [], onDelete }) => {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-medium mb-4">Tus Evaluaciones</h3>
        <p className="text-gray-500">No has evaluado ninguna universidad aún.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-medium mb-4">Tus Evaluaciones</h3>
      <ul className="space-y-4">
        {evaluations.map((group) => {
          const uni = group.university || {};
          return (
            <li
              key={group.university_id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div>
                <h4 className="font-semibold flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  {uni.name || 'Universidad desconocida'}
                </h4>
                <p className="text-gray-600 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {uni.city}, {uni.department}
                </p>
              </div>
              <button
                onClick={() => onDelete(group)}
                className="text-red-600 hover:text-red-800"
                title="Eliminar todas las evaluaciones de esta universidad"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UserEvaluations;
