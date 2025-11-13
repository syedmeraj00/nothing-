import React, { useState } from "react";
import { saveData } from "./utils/simpleStorage";

function SimpleDataEntry() {
  const [formData, setFormData] = useState({
    companyName: "",
    reportingYear: 2024,
    sector: "",
    region: "",
    environmental: {
      scope1Emissions: "",
      scope2Emissions: "",
      energyConsumption: ""
    },
    social: {
      totalEmployees: "",
      femaleEmployeesPercentage: ""
    },
    governance: {
      boardSize: "",
      independentDirectorsPercentage: ""
    }
  });

  const handleChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.companyName) {
      alert("Company name is required");
      return;
    }

    const data = {
      ...formData,
      status: "Submitted",
      timestamp: new Date().toISOString()
    };

    saveData(data);
    alert("✅ Data saved successfully!");
    window.location.href = '/reports';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">ESG Data Entry</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Info */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({...prev, companyName: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reporting Year</label>
                <input
                  type="number"
                  value={formData.reportingYear}
                  onChange={(e) => setFormData(prev => ({...prev, reportingYear: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({...prev, sector: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select sector</option>
                  <option value="technology">Technology</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="financial">Financial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({...prev, region: e.target.value}))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select region</option>
                  <option value="north_america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia_pacific">Asia Pacific</option>
                </select>
              </div>
            </div>
          </div>

          {/* Environmental */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">🌱 Environmental</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Scope 1 Emissions (tCO2e)</label>
                <input
                  type="number"
                  value={formData.environmental.scope1Emissions}
                  onChange={(e) => handleChange('environmental', 'scope1Emissions', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Scope 2 Emissions (tCO2e)</label>
                <input
                  type="number"
                  value={formData.environmental.scope2Emissions}
                  onChange={(e) => handleChange('environmental', 'scope2Emissions', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Energy Consumption (MWh)</label>
                <input
                  type="number"
                  value={formData.environmental.energyConsumption}
                  onChange={(e) => handleChange('environmental', 'energyConsumption', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">👥 Social</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Total Employees</label>
                <input
                  type="number"
                  value={formData.social.totalEmployees}
                  onChange={(e) => handleChange('social', 'totalEmployees', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Female Employees (%)</label>
                <input
                  type="number"
                  value={formData.social.femaleEmployeesPercentage}
                  onChange={(e) => handleChange('social', 'femaleEmployeesPercentage', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Governance */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">⚖️ Governance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Board Size</label>
                <input
                  type="number"
                  value={formData.governance.boardSize}
                  onChange={(e) => handleChange('governance', 'boardSize', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Independent Directors (%)</label>
                <input
                  type="number"
                  value={formData.governance.independentDirectorsPercentage}
                  onChange={(e) => handleChange('governance', 'independentDirectorsPercentage', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
          >
            Submit ESG Data
          </button>
        </form>
      </div>
    </div>
  );
}

export default SimpleDataEntry;