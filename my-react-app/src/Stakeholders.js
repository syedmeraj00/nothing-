import React, { useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { getThemeClasses } from './utils/themeUtils';
import ProfessionalHeader from './components/ProfessionalHeader';
import { useNavigate } from 'react-router-dom';

const Stakeholders = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [stakeholders] = useState([
    { id: 1, name: 'Investors', type: 'Financial', engagement: 'High', lastContact: '2024-01-15' },
    { id: 2, name: 'Employees', type: 'Internal', engagement: 'Medium', lastContact: '2024-01-10' },
    { id: 3, name: 'Customers', type: 'External', engagement: 'High', lastContact: '2024-01-12' },
    { id: 4, name: 'Regulators', type: 'Compliance', engagement: 'Medium', lastContact: '2024-01-08' },
    { id: 5, name: 'Communities', type: 'Social', engagement: 'Low', lastContact: '2024-01-05' },
    { id: 6, name: 'Suppliers', type: 'Business', engagement: 'Medium', lastContact: '2024-01-14' }
  ]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50/40 to-purple-50/30'
    }`} style={{
      backgroundImage: isDark ? '' : 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.12) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)'
    }}>
      <ProfessionalHeader 
        onLogout={handleLogout}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto p-6">
        <div className={`rounded-2xl p-6 border ${
          isDark 
            ? 'bg-gray-800/90 border-gray-700 shadow-xl backdrop-blur-sm' 
            : 'bg-white/70 backdrop-blur-2xl border-white/30 shadow-lg shadow-slate-200/30'
        }`} style={{
          boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
        }}>
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">👥</span>
            <h1 className={`text-3xl font-bold ${theme.text.primary}`}>Stakeholder Management</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stakeholders.map((stakeholder) => (
              <div key={stakeholder.id} className={`p-4 rounded-xl border ${
                isDark 
                  ? 'bg-gray-700/50 border-gray-600' 
                  : 'bg-white/60 backdrop-blur-sm border-white/40'
              }`}>
                <h3 className={`font-semibold mb-2 ${theme.text.primary}`}>{stakeholder.name}</h3>
                <div className={`text-sm mb-2 ${theme.text.secondary}`}>
                  Type: {stakeholder.type}
                </div>
                <div className={`text-sm mb-2 ${
                  stakeholder.engagement === 'High' ? 'text-green-600' :
                  stakeholder.engagement === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  Engagement: {stakeholder.engagement}
                </div>
                <div className={`text-xs ${theme.text.secondary}`}>
                  Last Contact: {stakeholder.lastContact}
                </div>
              </div>
            ))}
          </div>

          <div className={`text-center py-8 ${theme.text.secondary}`}>
            <p>Stakeholder engagement and relationship management system</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Stakeholders;