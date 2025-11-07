import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import companyLogo from "./companyLogo.jpg";
import { getStoredData, initializeStorage } from "./utils/storage";
import APIService from "./services/apiService";
import { useTheme } from "./contexts/ThemeContext";
import { getThemeClasses } from "./utils/themeUtils";
import { MetricCard, StatusCard } from "./components/ProfessionalCard";
import ProfessionalHeader from "./components/ProfessionalHeader";


// Data normalization functions from Reports.js
function normalizeData(data) {
  return data
    .map(item => {
      let year = null;
      if (item.timestamp) {
        try {
          year = new Date(item.timestamp).getFullYear();
        } catch {
          year = item.reportingYear || new Date().getFullYear();
        }
      }
      
      if (item.environmental || item.social || item.governance) {
        const results = [];
        ['environmental', 'social', 'governance'].forEach(cat => {
          if (item[cat]) {
            Object.entries(item[cat]).forEach(([key, value]) => {
              if (key !== 'description' && value !== '' && !isNaN(parseFloat(value))) {
                results.push({
                  ...item,
                  category: cat,
                  metric: key,
                  value: parseFloat(value),
                  year,
                  companyName: item.companyName,
                  sector: item.sector,
                  region: item.region
                });
              }
            });
          }
        });
        return results;
      } else {
        const category = (item.category || '').toLowerCase();
        const value = parseFloat(item.value);
        return [{
          ...item,
          year,
          category,
          value: isNaN(value) ? null : value
        }];
      }
    })
    .flat()
    .filter(item => item.year && item.category && item.value !== null && ['environmental','social','governance'].includes(item.category));
}

function aggregateOverall(data) {
  const agg = { environmental: { sum: 0, count: 0 }, social: { sum: 0, count: 0 }, governance: { sum: 0, count: 0 } };
  data.forEach(item => {
    if (['environmental','social','governance'].includes(item.category)) {
      agg[item.category].sum += item.value;
      agg[item.category].count += 1;
    }
  });
  const envAvg = agg.environmental.count ? (agg.environmental.sum / agg.environmental.count).toFixed(2) : 0;
  const socAvg = agg.social.count ? (agg.social.sum / agg.social.count).toFixed(2) : 0;
  const govAvg = agg.governance.count ? (agg.governance.sum / agg.governance.count).toFixed(2) : 0;
  const overall = [envAvg, socAvg, govAvg].every(x => x > 0) ? (((+envAvg) + (+socAvg) + (+govAvg)) / 3).toFixed(2) : 0;
  return { environmental: +envAvg, social: +socAvg, governance: +govAvg, overall: +overall };
}

// Add custom animations and 3D effects
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }
  @keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in {
    animation: slideIn 0.5s ease-out;
  }
  .chart-3d {
    perspective: 800px;
    perspective-origin: center center;
    transform-style: preserve-3d;
  }
  .bar-3d {
    transform-style: preserve-3d;
    position: relative;
    transition: all 0.3s ease;
  }
  .bar-3d .face {
    position: absolute;
    background: linear-gradient(135deg, #10b981, #059669);
  }
  .bar-3d .top {
    transform: rotateX(90deg) translateZ(var(--height));
    background: linear-gradient(135deg, #34d399, #10b981);
  }
  .bar-3d .right {
    transform: rotateY(90deg) translateZ(3px);
    background: linear-gradient(135deg, #059669, #047857);
    width: 6px;
  }
  .progress-3d {
    position: relative;
    transform-style: preserve-3d;
    border-radius: 20px;
    overflow: visible;
  }
  .progress-3d::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(45deg, rgba(255,255,255,0.4), transparent);
    border-radius: inherit;
    transform: translateZ(2px);
  }
  .progress-3d::after {
    content: '';
    position: absolute;
    top: 2px;
    right: -4px;
    width: 8px;
    height: 100%;
    background: linear-gradient(90deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
    border-radius: 0 20px 20px 0;
    transform: rotateY(45deg);
  }
`;
document.head.appendChild(style);

function Dashboard() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const theme = getThemeClasses(isDark);
  const [kpis, setKpis] = useState({
    overallScore: 27,
    complianceRate: 94,
    environmental: 35,
    social: 0,
    governance: 0,
    totalEntries: 0,
  });
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'high', message: 'Carbon emissions target review due', category: 'Environmental' },
    { id: 2, type: 'medium', message: 'Quarterly sustainability report pending', category: 'Reporting' },
    { id: 3, type: 'low', message: 'New ESG regulation update available', category: 'Compliance' }
  ]);
  const [showPrimaryActions, setShowPrimaryActions] = useState(false);
  const [showManagementActions, setShowManagementActions] = useState(false);
  const [showAdvancedActions, setShowAdvancedActions] = useState(false);

  useEffect(() => {
    const updateData = async () => {
      const currentUser = localStorage.getItem('currentUser');
      
      try {
        // Try to fetch from backend first
        const backendKPIs = await APIService.getESGKPIs(currentUser);
        const backendData = await APIService.getESGData(currentUser);
        
        if (backendKPIs && !backendKPIs.error) {
          setKpis({
            overallScore: Math.round(backendKPIs.overallScore) || 0,
            complianceRate: backendKPIs.complianceRate || 94,
            environmental: Math.round(backendKPIs.environmental) || 0,
            social: Math.round(backendKPIs.social) || 0,
            governance: Math.round(backendKPIs.governance) || 0,
            totalEntries: backendKPIs.totalEntries || 0
          });
          return;
        }
      } catch (error) {
        console.warn('Backend unavailable, using localStorage fallback');
      }
      
      // Set default KPIs if backend unavailable
      setKpis({
        overallScore: 0,
        complianceRate: 0,
        environmental: 0,
        social: 0,
        governance: 0,
        totalEntries: 0
      });
    };
    
    updateData();
    
    // Listen for storage changes to update in real-time
    const handleStorageChange = () => updateData();
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates periodically
    const interval = setInterval(updateData, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const currentUser = localStorage.getItem('currentUser');

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
        currentUser={currentUser}
      />


      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            icon="⭐" 
            value={Math.round(kpis.overallScore) || 0}
            label="Overall ESG Score" 
            trend={kpis.overallScore > 0 ? "↑ Active" : "→ No Data"}
            trendColor={kpis.overallScore > 0 ? "success" : "neutral"}
            progress={kpis.overallScore}
          />
          <MetricCard 
            icon="✓" 
            value={`${Math.round(kpis.complianceRate) || 0}%`}
            label="Compliance Rate" 
            trend={kpis.totalEntries > 0 ? "↑ Updated" : "→ No Data"}
            trendColor={kpis.totalEntries > 0 ? "info" : "neutral"}
            progress={kpis.complianceRate}
          />
          <MetricCard 
            icon="🌍" 
            value={`${Math.round(kpis.environmental) || 0}%`}
            label="Environmental Score"
            trend={kpis.environmental > 0 ? "↑ Active" : "→ No Data"}
            trendColor={kpis.environmental > 0 ? "success" : "neutral"}
            progress={kpis.environmental}
          />
          <MetricCard 
            icon="📈" 
            value={kpis.totalEntries || 0}
            label="Total Data Entries" 
            trend={kpis.totalEntries > 0 ? "↑ Growing" : "→ Start Adding"}
            trendColor={kpis.totalEntries > 0 ? "success" : "neutral"}
            progress={Math.min((kpis.totalEntries / 50) * 100, 100)}
          />
        </div>

        {/* Enhanced Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Quick Actions */}
          <div className={`rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
            isDark 
              ? 'bg-gray-800/90 border-gray-700 shadow-xl hover:shadow-2xl backdrop-blur-sm' 
              : 'bg-white/70 backdrop-blur-2xl border-white/30 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:shadow-slate-300/40'
          }`} style={{
            boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
          }}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">⚡</span>
              <h2 className={`text-lg font-semibold transition-colors duration-300 ${theme.text.primary}`}>Quick Actions</h2>
            </div>
            
            <div className="space-y-3">
              {/* Primary Actions */}
              <div className={`border rounded-lg p-3 ${theme.border.primary} ${showPrimaryActions ? 'border-blue-500 bg-blue-50/20' : ''}`}>
                <div 
                  className={`flex items-center justify-between cursor-pointer p-2 rounded transition-all duration-200 ${theme.hover.card}`}
                  onClick={() => setShowPrimaryActions(!showPrimaryActions)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📊</span>
                    <div>
                      <h3 className={`font-semibold ${theme.text.primary}`}>Primary</h3>
                      <p className={`text-xs ${theme.text.secondary}`}>Essential actions</p>
                    </div>
                  </div>
                  <span className={`text-lg ${theme.text.secondary} transform transition-transform duration-200 ${showPrimaryActions ? 'rotate-90' : ''}`}>▶</span>
                </div>
                
                {showPrimaryActions && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {[
                      { icon: '⚡', label: 'Add New Data', link: '/data-entry' },
                      { icon: '📊', label: 'View Analytics', link: '/analytics' },
                      { icon: '📋', label: 'Generate Report', link: '/reports' }
                    ].map((action, index) => (
                      <Link key={index} to={action.link} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] group ${
                        isDark 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50/80 hover:shadow-md'
                      }`}>
                        <span className="text-lg group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                        <span className={`font-medium transition-colors duration-200 ${theme.text.secondary} group-hover:${theme.text.primary}`}>{action.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Management Actions */}
              <div className={`border rounded-lg p-3 ${theme.border.primary} ${showManagementActions ? 'border-orange-500 bg-orange-50/20' : ''}`}>
                <div 
                  className={`flex items-center justify-between cursor-pointer p-2 rounded transition-all duration-200 ${theme.hover.card}`}
                  onClick={() => setShowManagementActions(!showManagementActions)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚙️</span>
                    <div>
                      <h3 className={`font-semibold ${theme.text.primary}`}>Management</h3>
                      <p className={`text-xs ${theme.text.secondary}`}>Management tools</p>
                    </div>
                  </div>
                  <span className={`text-lg ${theme.text.secondary} transform transition-transform duration-200 ${showManagementActions ? 'rotate-90' : ''}`}>▶</span>
                </div>
                
                {showManagementActions && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {[
                      { icon: '✓', label: 'Compliance', link: '/compliance' },
                      { icon: '👥', label: 'Stakeholders', link: '/stakeholders' },
                      { icon: '⚖️', label: 'Regulatory', link: '/regulatory' }
                    ].map((action, index) => (
                      <Link key={index} to={action.link} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] group ${
                        isDark 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50/80 hover:shadow-md'
                      }`}>
                        <span className="text-lg group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                        <span className={`font-medium transition-colors duration-200 ${theme.text.secondary} group-hover:${theme.text.primary}`}>{action.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Advanced Actions */}
              <div className={`border rounded-lg p-3 ${theme.border.primary} ${showAdvancedActions ? 'border-purple-500 bg-purple-50/20' : ''}`}>
                <div 
                  className={`flex items-center justify-between cursor-pointer p-2 rounded transition-all duration-200 ${theme.hover.card}`}
                  onClick={() => setShowAdvancedActions(!showAdvancedActions)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚀</span>
                    <div>
                      <h3 className={`font-semibold ${theme.text.primary}`}>Advanced</h3>
                      <p className={`text-xs ${theme.text.secondary}`}>Advanced features</p>
                    </div>
                  </div>
                  <span className={`text-lg ${theme.text.secondary} transform transition-transform duration-200 ${showAdvancedActions ? 'rotate-90' : ''}`}>▶</span>
                </div>
                
                {showAdvancedActions && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    {[
                      { icon: '🎯', label: 'Materiality Assessment', link: '/materiality-assessment' },
                      { icon: '🔗', label: 'Supply Chain ESG', link: '/supply-chain' }
                    ].map((action, index) => (
                      <Link key={index} to={action.link} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-[1.02] group ${
                        isDark 
                          ? 'hover:bg-gray-700/50' 
                          : 'hover:bg-gray-50/80 hover:shadow-md'
                      }`}>
                        <span className="text-lg group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                        <span className={`font-medium transition-colors duration-200 ${theme.text.secondary} group-hover:${theme.text.primary}`}>{action.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Alerts Section */}
            <div className={`pt-6 border-t transition-colors duration-300 ${theme.border.secondary}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500 text-xl">⚠️</span>
                <h3 className={`font-semibold transition-colors duration-300 ${theme.text.primary}`}>Recent Alerts</h3>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600'}`}>{alerts.length}</span>
              </div>
              <div className={`space-y-3 text-sm transition-colors duration-300 ${theme.text.secondary}`}>
                {alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 cursor-pointer ${theme.hover.subtle}`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${
                      alert.type === 'high' ? 'bg-red-400' : 
                      alert.type === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}></div>
                    <span className="flex-1">{alert.message}</span>
                    <span className={`text-xs font-medium ${
                      alert.type === 'high' ? 'text-red-500' : 
                      alert.type === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>{alert.type.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Performance Cards */}
          <div className={`lg:col-span-2 rounded-2xl p-6 border transition-all duration-300 ${
            isDark 
              ? 'bg-gray-800/90 border-gray-700 shadow-xl backdrop-blur-sm' 
              : 'bg-white/70 backdrop-blur-2xl border-white/30 shadow-lg shadow-slate-200/30'
          }`} style={{
            boxShadow: isDark ? '' : '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3)'
          }}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-blue-500">📊</span>
              <h2 className={`text-lg font-semibold transition-colors duration-300 ${theme.text.primary}`}>ESG Performance Overview</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: '🌍', title: 'Environmental', score: kpis.environmental, target: 70 },
                { icon: '👥', title: 'Social', score: kpis.social, target: 70 },
                { icon: '🏛️', title: 'Governance', score: kpis.governance, target: 70 }
              ].map((metric, index) => (
                <StatusCard 
                  key={index}
                  icon={metric.icon}
                  title={metric.title}
                  score={Math.round(metric.score) || 0}
                  target={metric.target}
                  status={metric.score >= 70 ? "excellent" : metric.score >= 50 ? "good" : metric.score > 0 ? "warning" : "neutral"}
                />
              ))}
              <div className={`p-4 rounded-xl border transition-all duration-300 ${
                isDark 
                  ? 'bg-gray-800/90 border-gray-700' 
                  : 'bg-white/70 border-white/30'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🔗</span>
                  <h4 className={`font-semibold text-sm ${theme.text.primary}`}>Backend Integrations</h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className={theme.text.secondary}>ERP Integration</span>
                    <span className="text-green-500">✅ Connected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={theme.text.secondary}>HR Integration</span>
                    <span className="text-green-500">✅ Connected</span>
                  </div>
                  <Link to="/analytics" className={`block text-center mt-3 py-2 px-3 rounded text-xs font-medium transition-colors ${
                    isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}>
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}



export default Dashboard;