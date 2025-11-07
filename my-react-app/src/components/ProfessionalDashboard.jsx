import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const ProfessionalDashboard = ({ data, selectedFramework }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);

  // Professional color palette
  const colors = {
    primary: '#0066CC',
    secondary: '#00AA44',
    accent: '#FF6B35',
    success: '#28A745',
    warning: '#FFC107',
    danger: '#DC3545',
    info: '#17A2B8'
  };

  const chartColors = [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning];

  // Calculate ESG scores
  const calculateESGScores = () => {
    const categories = ['environmental', 'social', 'governance'];
    const scores = {};
    
    categories.forEach(category => {
      const categoryData = data.filter(item => item.category === category);
      if (categoryData.length > 0) {
        const avgScore = categoryData.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0) / categoryData.length;
        scores[category] = Math.round(avgScore);
      } else {
        scores[category] = 0;
      }
    });
    
    scores.overall = Math.round((scores.environmental + scores.social + scores.governance) / 3);
    return scores;
  };

  const esgScores = calculateESGScores();

  // Performance trend data
  const getTrendData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      environmental: Math.max(0, esgScores.environmental + (Math.random() - 0.5) * 20),
      social: Math.max(0, esgScores.social + (Math.random() - 0.5) * 20),
      governance: Math.max(0, esgScores.governance + (Math.random() - 0.5) * 20)
    }));
  };

  // Category distribution
  const getCategoryDistribution = () => {
    const categories = ['environmental', 'social', 'governance'];
    return categories.map(category => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: data.filter(item => item.category === category).length,
      score: esgScores[category]
    }));
  };

  // Performance indicators
  const getPerformanceIndicators = () => {
    return [
      {
        title: 'Carbon Footprint',
        value: '2,450',
        unit: 'tCO2e',
        trend: -12,
        category: 'environmental',
        target: '2,200'
      },
      {
        title: 'Employee Satisfaction',
        value: '87%',
        unit: '',
        trend: +5,
        category: 'social',
        target: '90%'
      },
      {
        title: 'Board Diversity',
        value: '45%',
        unit: '',
        trend: +8,
        category: 'governance',
        target: '50%'
      },
      {
        title: 'Renewable Energy',
        value: '68%',
        unit: '',
        trend: +15,
        category: 'environmental',
        target: '75%'
      }
    ];
  };

  const ScoreCard = ({ title, score, category, trend }) => {
    const getScoreColor = (score) => {
      if (score >= 80) return colors.success;
      if (score >= 60) return colors.warning;
      return colors.danger;
    };

    const getCategoryIcon = (category) => {
      switch (category) {
        case 'environmental': return '🌍';
        case 'social': return '👥';
        case 'governance': return '⚖️';
        default: return '⭐';
      }
    };

    return (
      <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card} border-l-4`} 
           style={{ borderLeftColor: getScoreColor(score) }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <h3 className={`font-semibold ${theme.text.primary}`}>{title}</h3>
          </div>
          {trend && (
            <span className={`text-sm px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>
            {score}
          </span>
          <span className={`text-lg ${theme.text.secondary}`}>/100</span>
        </div>
        
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${score}%`, 
              backgroundColor: getScoreColor(score) 
            }}
          />
        </div>
        
        <div className={`mt-2 text-sm ${theme.text.secondary}`}>
          Performance Rating: {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
        </div>
      </div>
    );
  };

  const KPICard = ({ indicator }) => {
    const getCategoryColor = (category) => {
      switch (category) {
        case 'environmental': return colors.secondary;
        case 'social': return colors.primary;
        case 'governance': return colors.accent;
        default: return colors.info;
      }
    };

    return (
      <div className={`p-4 rounded-lg ${theme.bg.subtle} border`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`font-medium ${theme.text.primary}`}>{indicator.title}</h4>
          <span className={`text-xs px-2 py-1 rounded-full ${
            indicator.trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {indicator.trend > 0 ? '+' : ''}{indicator.trend}%
          </span>
        </div>
        
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-bold" style={{ color: getCategoryColor(indicator.category) }}>
            {indicator.value}
          </span>
          <span className={`text-sm ${theme.text.secondary}`}>{indicator.unit}</span>
        </div>
        
        <div className={`text-xs ${theme.text.muted}`}>
          Target: {indicator.target}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary Header */}
      <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-2xl font-bold ${theme.text.primary}`}>
              ESG Performance Dashboard
            </h2>
            <p className={`${theme.text.secondary}`}>
              {selectedFramework} Framework • {new Date().getFullYear()} Reporting Period
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
            }`}>
              Live Data
            </span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
            }`}>
              {data.length} Metrics
            </span>
          </div>
        </div>
      </div>

      {/* ESG Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard 
          title="Environmental" 
          score={esgScores.environmental} 
          category="environmental"
          trend={5}
        />
        <ScoreCard 
          title="Social" 
          score={esgScores.social} 
          category="social"
          trend={3}
        />
        <ScoreCard 
          title="Governance" 
          score={esgScores.governance} 
          category="governance"
          trend={-1}
        />
        <ScoreCard 
          title="Overall ESG" 
          score={esgScores.overall} 
          category="overall"
          trend={2}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Performance Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getTrendData()}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="environmental" stroke={colors.secondary} strokeWidth={3} name="Environmental" />
                <Line type="monotone" dataKey="social" stroke={colors.primary} strokeWidth={3} name="Social" />
                <Line type="monotone" dataKey="governance" stroke={colors.accent} strokeWidth={3} name="Governance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            ESG Category Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCategoryDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {getCategoryDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
          Key Performance Indicators
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getPerformanceIndicators().map((indicator, index) => (
            <KPICard key={index} indicator={indicator} />
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div className={`p-6 rounded-xl shadow-lg ${theme.bg.card}`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
          Compliance & Framework Alignment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { framework: 'SEBI BRSR', compliance: 95, status: 'Compliant' },
            { framework: 'GRI Standards', compliance: 88, status: 'Compliant' },
            { framework: 'TCFD', compliance: 72, status: 'In Progress' }
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg ${theme.bg.subtle} border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${theme.text.primary}`}>{item.framework}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.status === 'Compliant' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className={theme.text.secondary}>Compliance</span>
                  <span className={theme.text.primary}>{item.compliance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full ${
                      item.compliance >= 90 ? 'bg-green-500' : 
                      item.compliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.compliance}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;