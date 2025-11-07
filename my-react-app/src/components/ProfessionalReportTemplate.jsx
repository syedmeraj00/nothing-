import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeClasses } from '../utils/themeUtils';
import { generateExecutiveProfessionalReport } from '../utils/enhancedProfessionalPDF';
import { Button, Modal, Input, Alert } from './ProfessionalUX';
import ProfessionalReportPreview from './ProfessionalReportPreview';

const ProfessionalReportTemplate = ({ data, onClose }) => {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  
  const [reportConfig, setReportConfig] = useState({
    companyName: 'ESGenius Tech Solutions',
    framework: 'SEBI BRSR',
    reportPeriod: new Date().getFullYear(),
    executiveSummary: true,
    includeCharts: true,
    includeCompliance: true,
    reportType: 'executive'
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const reportTemplates = [
    {
      id: 'executive',
      name: 'Executive Summary Report',
      description: 'High-level strategic overview for C-suite and board members',
      features: ['Executive dashboard', 'Strategic insights', 'Risk analysis', 'Key recommendations'],
      icon: '👔'
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive ESG Report',
      description: 'Detailed analysis for stakeholders and regulatory compliance',
      features: ['Full data analysis', 'Compliance mapping', 'Detailed metrics', 'Benchmarking'],
      icon: '📊'
    },
    {
      id: 'investor',
      name: 'Investor Relations Report',
      description: 'ESG performance report tailored for investors and analysts',
      features: ['Financial impact', 'Market positioning', 'Growth opportunities', 'Risk mitigation'],
      icon: '💼'
    },
    {
      id: 'regulatory',
      name: 'Regulatory Compliance Report',
      description: 'Structured report for regulatory submissions and audits',
      features: ['Compliance checklist', 'Audit trail', 'Legal requirements', 'Documentation'],
      icon: '⚖️'
    }
  ];

  const frameworks = [
    { id: 'SEBI BRSR', name: 'SEBI BRSR', description: 'Securities and Exchange Board of India Business Responsibility and Sustainability Reporting' },
    { id: 'GRI Standards', name: 'GRI Standards', description: 'Global Reporting Initiative Sustainability Reporting Standards' },
    { id: 'TCFD', name: 'TCFD', description: 'Task Force on Climate-related Financial Disclosures' },
    { id: 'SASB', name: 'SASB', description: 'Sustainability Accounting Standards Board' },
    { id: 'EU Taxonomy', name: 'EU Taxonomy', description: 'European Union Taxonomy for Sustainable Activities' },
    { id: 'CDP', name: 'CDP', description: 'Carbon Disclosure Project Reporting Framework' }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate processing time for professional report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pdf = generateExecutiveProfessionalReport(
        reportConfig.framework,
        data,
        {
          companyName: reportConfig.companyName,
          reportPeriod: reportConfig.reportPeriod,
          executiveSummary: reportConfig.executiveSummary,
          includeCharts: reportConfig.includeCharts,
          includeCompliance: reportConfig.includeCompliance
        }
      );
      
      const filename = `Professional-ESG-Report-${reportConfig.reportType}-${reportConfig.framework.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      // Show success notification
      alert('Professional ESG report generated successfully!');
      
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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Professional ESG Report Generator"
      size="xl"
      actions={previewMode ? [
        {
          label: 'Generate Report',
          onClick: handleGenerateReport,
          variant: 'primary',
          icon: '📄',
          disabled: isGenerating,
          loading: isGenerating
        },
        {
          label: 'Back to Config',
          onClick: () => setPreviewMode(false),
          variant: 'outline',
          icon: '←'
        },
        {
          label: 'Close',
          onClick: onClose,
          variant: 'outline'
        }
      ] : [
        {
          label: isGenerating ? 'Generating...' : 'Generate Report',
          onClick: handleGenerateReport,
          variant: 'primary',
          icon: '📄',
          disabled: isGenerating,
          loading: isGenerating
        },
        {
          label: 'Preview Report',
          onClick: () => setPreviewMode(true),
          variant: 'outline',
          icon: '👁️',
          disabled: data.length === 0
        },
        {
          label: 'Cancel',
          onClick: onClose,
          variant: 'outline'
        }
      ]}
    >
      {previewMode ? (
        <ProfessionalReportPreview
          framework={reportConfig.framework}
          data={data}
          companyName={reportConfig.companyName}
          reportPeriod={reportConfig.reportPeriod}
        />
      ) : (
      <div className="space-y-6">
        {/* Report Template Selection */}
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Select Report Template
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map(template => (
              <div
                key={template.id}
                className={`border-2 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  reportConfig.reportType === template.id
                    ? `${theme.border.accent} ${theme.bg.accent} shadow-lg`
                    : `${theme.border.primary} hover:${theme.border.accent}`
                }`}
                onClick={() => handleConfigChange('reportType', template.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${theme.text.primary}`}>
                      {template.name}
                    </h4>
                    <p className={`text-sm mt-1 ${theme.text.secondary}`}>
                      {template.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.features.map(feature => (
                        <span
                          key={feature}
                          className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  {reportConfig.reportType === template.id && (
                    <span className="text-green-500 text-lg">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report Configuration */}
        <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Report Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div className="md:col-span-2">
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
                    {framework.name} - {framework.description}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Report Options */}
        <div className={`p-4 rounded-lg ${theme.bg.subtle}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Report Options
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={reportConfig.executiveSummary}
                onChange={(e) => handleConfigChange('executiveSummary', e.target.checked)}
                className="rounded"
              />
              <div>
                <span className={`font-medium ${theme.text.primary}`}>
                  Include Executive Summary
                </span>
                <p className={`text-sm ${theme.text.secondary}`}>
                  High-level overview with key insights and recommendations
                </p>
              </div>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={reportConfig.includeCharts}
                onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                className="rounded"
              />
              <div>
                <span className={`font-medium ${theme.text.primary}`}>
                  Include Charts & Visualizations
                </span>
                <p className={`text-sm ${theme.text.secondary}`}>
                  Professional charts, graphs, and data visualizations
                </p>
              </div>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={reportConfig.includeCompliance}
                onChange={(e) => handleConfigChange('includeCompliance', e.target.checked)}
                className="rounded"
              />
              <div>
                <span className={`font-medium ${theme.text.primary}`}>
                  Include Compliance Section
                </span>
                <p className={`text-sm ${theme.text.secondary}`}>
                  Regulatory compliance status and governance framework
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Data Summary */}
        <div className={`p-4 rounded-lg border ${theme.border.primary}`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme.text.primary}`}>
            Data Summary
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>
                {data.filter(d => d.category === 'environmental').length}
              </div>
              <div className={`text-sm ${theme.text.secondary}`}>
                Environmental Metrics
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>
                {data.filter(d => d.category === 'social').length}
              </div>
              <div className={`text-sm ${theme.text.secondary}`}>
                Social Metrics
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${theme.text.primary}`}>
                {data.filter(d => d.category === 'governance').length}
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

        {/* Professional Features Highlight */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} border`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
            ✨ Professional Report Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Executive-level formatting and design',
              'Strategic insights and recommendations',
              'Risk assessment and opportunity analysis',
              'Compliance mapping and governance review',
              'Professional branding and layout',
              'Industry benchmarking and trends',
              'Key performance indicators dashboard',
              'Stakeholder-ready presentation format'
            ].map(feature => (
              <div key={feature} className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </Modal>
  );
};

export default ProfessionalReportTemplate;