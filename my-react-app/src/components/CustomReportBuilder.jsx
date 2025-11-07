import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { generateExecutiveProfessionalReport } from '../utils/enhancedProfessionalPDF';
import { Button, Modal, Input, Alert } from './ProfessionalUX';

const CustomReportBuilder = ({ data, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [reportConfig, setReportConfig] = useState({
    title: 'Custom ESG Report',
    companyName: 'ESGenius Tech Solutions',
    framework: 'SEBI BRSR',
    reportPeriod: new Date().getFullYear(),
    sections: {
      executiveSummary: true,
      environmentalMetrics: true,
      socialMetrics: true,
      governanceMetrics: true,
      performanceTrends: true,
      complianceStatus: true,
      recommendations: true
    },
    customSections: []
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const frameworks = [
    { id: 'SEBI BRSR', name: 'SEBI BRSR' },
    { id: 'GRI Standards', name: 'GRI Standards' },
    { id: 'TCFD', name: 'TCFD' },
    { id: 'SASB', name: 'SASB' },
    { id: 'EU Taxonomy', name: 'EU Taxonomy' }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Normalize data for report generation
      const normalizedData = data.map(item => {
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
                    companyName: item.companyName,
                    sector: item.sector,
                    region: item.region
                  });
                }
              });
            }
          });
          return results;
        }
        return [item];
      }).flat().filter(item => item.category && ['environmental','social','governance'].includes(item.category));
      
      const pdf = generateExecutiveProfessionalReport(
        reportConfig.framework,
        normalizedData,
        {
          companyName: reportConfig.companyName,
          reportPeriod: reportConfig.reportPeriod,
          executiveSummary: reportConfig.sections.executiveSummary,
          includeCharts: true,
          includeCompliance: reportConfig.sections.complianceStatus
        }
      );
      
      const filename = `Custom-ESG-Report-${reportConfig.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      alert('Custom ESG report generated successfully!');
      
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSectionChange = (section, value) => {
    setReportConfig(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: value
      }
    }));
  };

  const addCustomSection = () => {
    if (newSectionTitle.trim()) {
      setReportConfig(prev => ({
        ...prev,
        customSections: [...prev.customSections, { title: newSectionTitle, content: '' }]
      }));
      setNewSectionTitle('');
    }
  };

  const removeCustomSection = (index) => {
    setReportConfig(prev => ({
      ...prev,
      customSections: prev.customSections.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="🛠️ Custom Report Builder"
      size="xl"
      actions={[
        {
          label: isGenerating ? 'Generating...' : 'Generate Custom Report',
          onClick: handleGenerateReport,
          variant: 'primary',
          icon: '📄',
          disabled: isGenerating,
          loading: isGenerating
        },
        {
          label: 'Cancel',
          onClick: onClose,
          variant: 'outline'
        }
      ]}
    >
      <div className="space-y-6">
        {/* Report Configuration */}
        <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Report Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.text.secondary}`}>
                Report Title
              </label>
              <Input
                type="text"
                value={reportConfig.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                placeholder="Enter report title"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.text.secondary}`}>
                Company Name
              </label>
              <Input
                type="text"
                value={reportConfig.companyName}
                onChange={(e) => handleConfigChange('companyName', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.text.secondary}`}>
                ESG Framework
              </label>
              <select
                value={reportConfig.framework}
                onChange={(e) => handleConfigChange('framework', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              >
                {frameworks.map(framework => (
                  <option key={framework.id} value={framework.id}>
                    {framework.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.text.secondary}`}>
                Reporting Period
              </label>
              <Input
                type="number"
                value={reportConfig.reportPeriod}
                onChange={(e) => handleConfigChange('reportPeriod', parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
          </div>
        </div>

        {/* Section Selection */}
        <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Report Sections
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries({
              executiveSummary: 'Executive Summary',
              environmentalMetrics: 'Environmental Metrics',
              socialMetrics: 'Social Metrics',
              governanceMetrics: 'Governance Metrics',
              performanceTrends: 'Performance Trends',
              complianceStatus: 'Compliance Status',
              recommendations: 'Strategic Recommendations'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={reportConfig.sections[key]}
                  onChange={(e) => handleSectionChange(key, e.target.checked)}
                  className="rounded"
                />
                <span className={`font-medium ${theme.text.primary}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Sections */}
        <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Custom Sections
          </h3>
          
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Enter custom section title"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={addCustomSection}
              icon="+"
              disabled={!newSectionTitle.trim()}
            >
              Add Section
            </Button>
          </div>
          
          {reportConfig.customSections.length > 0 && (
            <div className="space-y-2">
              {reportConfig.customSections.map((section, index) => (
                <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${theme.bg.card} border`}>
                  <span className={`font-medium ${theme.text.primary}`}>
                    {section.title}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => removeCustomSection(index)}
                    icon="🗑️"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data Summary */}
        <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Available Data
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>
                {data.reduce((count, item) => {
                  if (item.environmental && Object.keys(item.environmental).some(k => k !== 'description' && item.environmental[k] !== '')) {
                    return count + Object.keys(item.environmental).filter(k => k !== 'description' && item.environmental[k] !== '').length;
                  }
                  return count + (item.category === 'environmental' ? 1 : 0);
                }, 0)}
              </div>
              <div className={`text-sm ${theme.text.secondary}`}>
                Environmental Metrics
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>
                {data.reduce((count, item) => {
                  if (item.social && Object.keys(item.social).some(k => k !== 'description' && item.social[k] !== '')) {
                    return count + Object.keys(item.social).filter(k => k !== 'description' && item.social[k] !== '').length;
                  }
                  return count + (item.category === 'social' ? 1 : 0);
                }, 0)}
              </div>
              <div className={`text-sm ${theme.text.secondary}`}>
                Social Metrics
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>
                {data.reduce((count, item) => {
                  if (item.governance && Object.keys(item.governance).some(k => k !== 'description' && item.governance[k] !== '')) {
                    return count + Object.keys(item.governance).filter(k => k !== 'description' && item.governance[k] !== '').length;
                  }
                  return count + (item.category === 'governance' ? 1 : 0);
                }, 0)}
              </div>
              <div className={`text-sm ${theme.text.secondary}`}>
                Governance Metrics
              </div>
            </div>
          </div>
          
          {data.length === 0 && (
            <Alert
              type="warning"
              title="No Data Available"
              message="Add ESG data entries to generate comprehensive reports."
              className="mt-4"
            />
          )}
        </div>

        {/* Report Preview */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            📋 Report Preview
          </h3>
          
          <div className="space-y-2">
            <div className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              <strong>Title:</strong> {reportConfig.title}
            </div>
            <div className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              <strong>Company:</strong> {reportConfig.companyName}
            </div>
            <div className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              <strong>Framework:</strong> {reportConfig.framework}
            </div>
            <div className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
              <strong>Sections:</strong> {Object.values(reportConfig.sections).filter(Boolean).length + reportConfig.customSections.length} sections selected
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CustomReportBuilder;