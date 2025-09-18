import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const UniversitySearch = ({ universities, onSelectUniversity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h3 className="text-lg font-medium mb-4">Selecciona tu Institución</h3>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Busca tu institución por nombre, ciudad o departamento..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(e.target.value.length > 0);
            }}
            onFocus={() => setShowDropdown(searchTerm.length > 0)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map(uni => (
                <button
                  key={uni.id}
                  onClick={() => {
                    onSelectUniversity(uni);
                    setSearchTerm(uni.name);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                >
                  <div className="font-medium">{uni.name}</div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {uni.city}, {uni.department}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500">
                No se encontraron instituciones.
              </div>
            )}
          </div>
        )}
      </div>
      
      {!hasUniversities && (
        <div className="mt-4 text-sm text-gray-500">
          No hay instituciones disponibles en este momento.
        </div>
      )}
    </div>
  );
};

export default UniversitySearch;
