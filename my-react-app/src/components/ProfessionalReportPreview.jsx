import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';

const ProfessionalReportPreview = ({ framework, data, companyName, reportPeriod }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);

  // Calculate ESG metrics for preview
  const calculateMetrics = () => {
    const categories = ['environmental', 'social', 'governance'];
    const metrics = {};
    
    categories.forEach(category => {
      const categoryData = data.filter(item => item.category === category);
      metrics[category] = {
        count: categoryData.length,
        avgScore: categoryData.length > 0 
          ? Math.round(categoryData.reduce((sum, item) => sum + (parseFloat(item.value) || 0), 0) / categoryData.length)
          : 0
      };
    });
    
    return metrics;
  };

  const metrics = calculateMetrics();
  const overallScore = Math.round((metrics.environmental.avgScore + metrics.social.avgScore + metrics.governance.avgScore) / 3);

  const getPerformanceRating = (score) => {
    if (score >= 85) return { rating: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { rating: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 55) return { rating: 'Satisfactory', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { rating: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getKeyInsights = () => {
    const insights = [];
    
    if (metrics.environmental.avgScore >= 80) {
      insights.push('Strong environmental performance with excellent sustainability practices');
    } else if (metrics.environmental.avgScore >= 60) {
      insights.push('Good environmental progress with opportunities for enhancement');
    } else {
      insights.push('Environmental initiatives require strategic focus and improvement');
    }
    
    if (metrics.social.avgScore >= 80) {
      insights.push('Exceptional social responsibility and stakeholder engagement');
    } else if (metrics.social.avgScore >= 60) {
      insights.push('Solid social performance with room for community impact expansion');
    } else {
      insights.push('Social responsibility programs need strengthening and expansion');
    }
    
    if (metrics.governance.avgScore >= 80) {
      insights.push('Robust governance framework with strong oversight mechanisms');
    } else if (metrics.governance.avgScore >= 60) {
      insights.push('Adequate governance structure with opportunities for enhancement');
    } else {
      insights.push('Governance framework requires significant strengthening');
    }
    
    return insights;
  };

  const getStrategicRecommendations = () => {
    const recommendations = [];
    
    if (metrics.environmental.avgScore < 75) {
      recommendations.push({
        priority: 'High',
        area: 'Environmental',
        action: 'Implement comprehensive carbon reduction strategy',
        timeline: 'Q1-Q2 2024'
      });
    }
    
    if (metrics.social.avgScore < 75) {
      recommendations.push({
        priority: 'Medium',
        area: 'Social',
        action: 'Expand diversity and inclusion programs',
        timeline: 'Q2-Q3 2024'
      });
    }
    
    if (metrics.governance.avgScore < 75) {
      recommendations.push({
        priority: 'High',
        area: 'Governance',
        action: 'Strengthen board oversight and transparency',
        timeline: 'Q1 2024'
      });
    }
    
    recommendations.push({
      priority: 'Medium',
      area: 'Overall',
      action: 'Enhance ESG data collection and reporting systems',
      timeline: 'Q3-Q4 2024'
    });
    
    return recommendations;
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto space-y-6 print:space-y-4">
      {/* Executive Cover */}
      <div className={`p-6 rounded-lg ${theme.bg.card} border-l-4 border-blue-600`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${theme.text.primary}`}>
              ESG Performance Report
            </h1>
            <p className={`text-lg ${theme.text.secondary}`}>{companyName}</p>
          </div>
          <div className="text-right">
            <div className={`text-sm ${theme.text.muted}`}>Framework</div>
            <div className={`font-semibold ${theme.text.primary}`}>{framework}</div>
            <div className={`text-sm ${theme.text.muted}`}>Period: {reportPeriod}</div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
          <h3 className={`font-semibold mb-2 ${theme.text.primary}`}>Executive Summary</h3>
          <p className={`text-sm ${theme.text.secondary}`}>
            This comprehensive ESG performance report presents our organization's sustainability 
            achievements, challenges, and strategic roadmap for {reportPeriod}. The analysis covers 
            {data.length} key performance indicators across environmental, social, and governance dimensions.
          </p>
        </div>
      </div>

      {/* Performance Scorecard */}
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h2 className={`text-xl font-bold mb-4 ${theme.text.primary}`}>
          ESG Performance Scorecard
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Environmental', score: metrics.environmental.avgScore, icon: '🌍' },
            { label: 'Social', score: metrics.social.avgScore, icon: '👥' },
            { label: 'Governance', score: metrics.governance.avgScore, icon: '⚖️' },
            { label: 'Overall ESG', score: overallScore, icon: '⭐' }
          ].map((item, index) => {
            const performance = getPerformanceRating(item.score);
            return (
              <div key={index} className={`p-4 rounded-lg border ${theme.bg.subtle}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className={`text-sm font-medium ${theme.text.primary}`}>
                    {item.label}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${performance.color}`}>
                  {item.score}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${performance.bg} ${performance.color}`}>
                  {performance.rating}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Insights */}
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h2 className={`text-xl font-bold mb-4 ${theme.text.primary}`}>
          Key Performance Insights
        </h2>
        
        <div className="space-y-3">
          {getKeyInsights().map((insight, index) => (
            <div key={index} className={`flex items-start gap-3 p-3 rounded-lg ${theme.bg.subtle}`}>
              <span className="text-blue-500 mt-1">•</span>
              <span className={`text-sm ${theme.text.primary}`}>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics Table */}
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h2 className={`text-xl font-bold mb-4 ${theme.text.primary}`}>
          Detailed Performance Metrics
        </h2>
        
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${theme.text.primary}`}>
            <thead className={`${theme.bg.subtle}`}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Category</th>
                <th className="px-4 py-3 text-left font-semibold">Metrics Count</th>
                <th className="px-4 py-3 text-left font-semibold">Average Score</th>
                <th className="px-4 py-3 text-left font-semibold">Performance</th>
                <th className="px-4 py-3 text-left font-semibold">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.entries(metrics).map(([category, data]) => {
                const performance = getPerformanceRating(data.avgScore);
                return (
                  <tr key={category} className={`hover:${theme.bg.subtle}`}>
                    <td className="px-4 py-3 font-medium capitalize">{category}</td>
                    <td className="px-4 py-3">{data.count}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${performance.color}`}>
                        {data.avgScore}/100
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${performance.bg} ${performance.color}`}>
                        {performance.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">85/100</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h2 className={`text-xl font-bold mb-4 ${theme.text.primary}`}>
          Strategic Recommendations
        </h2>
        
        <div className="space-y-4">
          {getStrategicRecommendations().map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border-l-4 ${
              rec.priority === 'High' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    rec.priority === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rec.priority} Priority
                  </span>
                  <span className={`font-medium ${theme.text.primary}`}>{rec.area}</span>
                </div>
                <span className={`text-sm ${theme.text.muted}`}>{rec.timeline}</span>
              </div>
              <p className={`text-sm ${theme.text.secondary}`}>{rec.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Status */}
      <div className={`p-6 rounded-lg ${theme.bg.card}`}>
        <h2 className={`text-xl font-bold mb-4 ${theme.text.primary}`}>
          Regulatory Compliance Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { framework: 'SEBI BRSR', compliance: 95, status: 'Compliant' },
            { framework: 'GRI Standards', compliance: 88, status: 'Compliant' },
            { framework: 'TCFD Guidelines', compliance: 75, status: 'In Progress' },
            { framework: 'SASB Standards', compliance: 82, status: 'Compliant' }
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg ${theme.bg.subtle} border`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${theme.text.primary}`}>{item.framework}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.status === 'Compliant' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className={theme.text.secondary}>Compliance Level</span>
                  <span className={theme.text.primary}>{item.compliance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
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

      {/* Report Footer */}
      <div className={`p-4 rounded-lg ${theme.bg.subtle} border-t`}>
        <div className="flex items-center justify-between text-sm">
          <div className={theme.text.muted}>
            Report generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div className={theme.text.muted}>
            {data.length} data points analyzed • {framework} Framework
          </div>
        </div>
        
        <div className={`mt-2 text-xs ${theme.text.muted}`}>
          This report contains confidential and proprietary information. 
          Distribution should be limited to authorized stakeholders only.
        </div>
      </div>
    </div>
  );
};

export default ProfessionalReportPreview;