import React, { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';

const UniversitySearch = ({ universities, onSelectUniversity, resetSearch = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Efecto para limpiar el campo de búsqueda cuando sea necesario
  useEffect(() => {
    if (resetSearch) {
      setSearchTerm('');
      setShowDropdown(false);
    }
  }, [resetSearch]);

  const getFilteredUniversities = () => {
    if (!searchTerm.trim()) return [];
    
    const searchLower = searchTerm.toLowerCase();
    const universitiesData = universities.data || [];
    
    return universitiesData.filter(uni =>
      uni.name?.toLowerCase().includes(searchLower) ||
      uni.city?.toLowerCase().includes(searchLower) ||
      uni.department?.toLowerCase().includes(searchLower)
    ).slice(0, 5);
  };

  const hasUniversities = universities.data && universities.data.length > 0;
  const filteredUniversities = getFilteredUniversities();

  const handleSelectUniversity = (uni) => {
    onSelectUniversity(uni);
    setSearchTerm(''); // Limpiar el campo después de seleccionar
    setShowDropdown(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Search className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Selecciona tu Institución</h3>
      </div>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Busca tu institución por nombre, ciudad o departamento..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(e.target.value.length > 0);
            }}
            onFocus={() => setShowDropdown(searchTerm.length > 0)}
            onBlur={() => {
              // Delay para permitir el click en las opciones
              setTimeout(() => setShowDropdown(false), 200);
            }}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
        </div>
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map(uni => (
                <button
                  key={uni.id}
                  onClick={() => handleSelectUniversity(uni)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors duration-200"
                >
                  <div className="font-semibold text-slate-900">{uni.name}</div>
                  <div className="text-sm text-slate-500 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {uni.city}, {uni.department}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-slate-500 text-center">
                No se encontraron instituciones.
              </div>
            )}
          </div>
        )}
      </div>
      
      {!hasUniversities && (
        <div className="mt-4 text-sm text-slate-500 text-center">
          No hay instituciones disponibles en este momento.
        </div>
      )}
    </div>
  );
};

export default UniversitySearch;