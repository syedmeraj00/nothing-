import React, { useState } from 'react';
import { MATERIALITY_TOPICS } from '../utils/esgFrameworks';

const MaterialityAssessment = ({ onSave }) => {
  const [materialityData, setMaterialityData] = useState(
    MATERIALITY_TOPICS.reduce((acc, topic) => ({
      ...acc,
      [topic.id]: { impact: 3, financial: 3, stakeholder: 3 }
    }), {})
  );

  const handleScoreChange = (topicId, dimension, value) => {
    setMaterialityData(prev => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        [dimension]: parseInt(value)
      }
    }));
  };

  const calculateMaterialityScore = (topic) => {
    const scores = materialityData[topic.id];
    return ((scores.impact + scores.financial + scores.stakeholder) / 3).toFixed(1);
  };

  const getMaterialityLevel = (score) => {
    if (score >= 4) return { level: 'High', color: 'bg-red-100 text-red-800' };
    if (score >= 3) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Double Materiality Assessment</h2>
      <p className="text-sm text-gray-600 mb-6">
        Rate each ESG topic on a scale of 1-5 for Impact Materiality (effect on people/environment), 
        Financial Materiality (effect on business value), and Stakeholder Priority.
      </p>

      <div className="space-y-4">
        {MATERIALITY_TOPICS.map(topic => {
          const score = calculateMaterialityScore(topic);
          const { level, color } = getMaterialityLevel(score);
          
          return (
            <div key={topic.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800">{topic.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
                    {level} ({score})
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    topic.category === 'environmental' ? 'bg-green-100 text-green-800' :
                    topic.category === 'social' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {topic.category.charAt(0).toUpperCase() + topic.category.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Impact Materiality</label>
                  <select
                    value={materialityData[topic.id]?.impact || 3}
                    onChange={(e) => handleScoreChange(topic.id, 'impact', e.target.value)}
                    className="w-full border rounded px-3 py-1 text-sm"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>
                        {num} - {num === 1 ? 'Very Low' : num === 5 ? 'Very High' : num === 3 ? 'Medium' : num < 3 ? 'Low' : 'High'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Financial Materiality</label>
                  <select
                    value={materialityData[topic.id]?.financial || 3}
                    onChange={(e) => handleScoreChange(topic.id, 'financial', e.target.value)}
                    className="w-full border rounded px-3 py-1 text-sm"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>
                        {num} - {num === 1 ? 'Very Low' : num === 5 ? 'Very High' : num === 3 ? 'Medium' : num < 3 ? 'Low' : 'High'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Stakeholder Priority</label>
                  <select
                    value={materialityData[topic.id]?.stakeholder || 3}
                    onChange={(e) => handleScoreChange(topic.id, 'stakeholder', e.target.value)}
                    className="w-full border rounded px-3 py-1 text-sm"
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>
                        {num} - {num === 1 ? 'Very Low' : num === 5 ? 'Very High' : num === 3 ? 'Medium' : num < 3 ? 'Low' : 'High'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onSave && onSave(materialityData)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Materiality Assessment
        </button>
      </div>
    </div>
  );
};

export default MaterialityAssessment;