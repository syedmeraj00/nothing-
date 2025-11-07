import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const SupplyChainESG = () => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [suppliers, setSuppliers] = useState([
    {
      id: 1,
      name: "Green Materials Co.",
      category: "Raw Materials",
      location: "Germany",
      esgScore: 85,
      riskLevel: "Low",
      certifications: ["ISO 14001", "SA8000"],
      scope3Emissions: 1250,
      lastAssessment: "2024-01-15"
    },
    {
      id: 2,
      name: "Tech Components Ltd.",
      category: "Electronics",
      location: "Taiwan",
      esgScore: 72,
      riskLevel: "Medium",
      certifications: ["ISO 9001"],
      scope3Emissions: 2800,
      lastAssessment: "2023-11-20"
    }
  ]);

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    category: '',
    location: '',
    esgScore: '',
    certifications: []
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.category) {
      const supplier = {
        id: Date.now(),
        ...newSupplier,
        esgScore: parseInt(newSupplier.esgScore) || 0,
        riskLevel: getRiskLevel(parseInt(newSupplier.esgScore) || 0),
        scope3Emissions: Math.floor(Math.random() * 5000) + 500,
        lastAssessment: new Date().toISOString().split('T')[0]
      };
      
      setSuppliers([...suppliers, supplier]);
      setNewSupplier({ name: '', category: '', location: '', esgScore: '', certifications: [] });
      setShowAddForm(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return "Low";
    if (score >= 60) return "Medium";
    return "High";
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "High": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const totalScope3 = suppliers.reduce((sum, supplier) => sum + supplier.scope3Emissions, 0);
  const avgESGScore = suppliers.length > 0 ? 
    Math.round(suppliers.reduce((sum, supplier) => sum + supplier.esgScore, 0) / suppliers.length) : 0;

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30'
    }`}>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>Supply Chain ESG Management</h1>
          <p className={`${theme.text.secondary}`}>Monitor and assess ESG performance across your supply chain</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🏭</span>
              <h3 className={`font-semibold ${theme.text.primary}`}>Total Suppliers</h3>
            </div>
            <p className={`text-3xl font-bold ${theme.text.primary}`}>{suppliers.length}</p>
          </div>

          <div className={`p-6 rounded-xl border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📊</span>
              <h3 className={`font-semibold ${theme.text.primary}`}>Avg ESG Score</h3>
            </div>
            <p className={`text-3xl font-bold ${theme.text.primary}`}>{avgESGScore}</p>
          </div>

          <div className={`p-6 rounded-xl border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🌍</span>
              <h3 className={`font-semibold ${theme.text.primary}`}>Scope 3 Emissions</h3>
            </div>
            <p className={`text-3xl font-bold ${theme.text.primary}`}>{totalScope3.toLocaleString()}</p>
            <p className={`text-sm ${theme.text.secondary}`}>tCO2e</p>
          </div>

          <div className={`p-6 rounded-xl border ${theme.bg.card} ${theme.border.primary}`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚠️</span>
              <h3 className={`font-semibold ${theme.text.primary}`}>High Risk</h3>
            </div>
            <p className={`text-3xl font-bold text-red-500`}>
              {suppliers.filter(s => s.riskLevel === "High").length}
            </p>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className={`rounded-xl border ${theme.bg.card} ${theme.border.primary} overflow-hidden`}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>Supplier Directory</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Supplier
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold mb-4">Add New Supplier</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Supplier Name"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newSupplier.category}
                  onChange={(e) => setNewSupplier({...newSupplier, category: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newSupplier.location}
                  onChange={(e) => setNewSupplier({...newSupplier, location: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="ESG Score (0-100)"
                  value={newSupplier.esgScore}
                  onChange={(e) => setNewSupplier({...newSupplier, esgScore: e.target.value})}
                  className="border rounded-lg px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSupplier}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ESG Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scope 3 (tCO2e)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-sm text-gray-500">
                          {supplier.certifications.join(', ') || 'No certifications'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{supplier.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{supplier.location}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-medium">{supplier.esgScore}</span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${supplier.esgScore}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(supplier.riskLevel)}`}>
                        {supplier.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{supplier.scope3Emissions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{supplier.lastAssessment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainESG;