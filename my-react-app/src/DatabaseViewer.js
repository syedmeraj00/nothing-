import React, { useState, useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';

const DatabaseViewer = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('users');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'companies', label: 'Companies', icon: '🏢' },
    { id: 'esg-data', label: 'ESG Data', icon: '📊' },
    { id: 'esg-scores', label: 'ESG Scores', icon: '⭐' }
  ];

  useEffect(() => {
    fetchStats();
    fetchData(activeTab);
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats');
      const statsData = await response.json();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchData = async (table) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/${table}`);
      const tableData = await response.json();
      setData(tableData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
    setLoading(false);
  };

  const renderTable = () => {
    if (loading) return <div className="p-4">Loading...</div>;
    if (!data.length) return <div className="p-4">No data found</div>;

    const columns = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto">
        <table className={`min-w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              {columns.map(col => (
                <th key={col} className={`px-4 py-2 text-left text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {col.replace(/_/g, ' ').toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={`border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                {columns.map(col => (
                  <td key={col} className={`px-4 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                    {row[col] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Database Viewer</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold">{stats.users || 0}</div>
            <div className="text-sm opacity-75">Users</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold">{stats.companies || 0}</div>
            <div className="text-sm opacity-75">Companies</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold">{stats.esgData || 0}</div>
            <div className="text-sm opacity-75">ESG Records</div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="text-2xl font-bold">{stats.esgScores || 0}</div>
            <div className="text-sm opacity-75">Score Records</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                activeTab === tab.id
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {renderTable()}
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;