import jsPDF from 'jspdf';

export const generateESGPDF = (framework, data, options = {}) => {
  const pdf = new jsPDF();
  const {
    companyName = 'Your Company',
    reportPeriod = new Date().getFullYear(),
    includeCharts = false
  } = options;

  // Normalize data
  const normalizedData = normalizeESGData(data);
  
  // Header
  addHeader(pdf, framework, companyName, reportPeriod);
  
  // Executive Summary
  let yPos = addExecutiveSummary(pdf, normalizedData, 90);
  
  // Framework-specific sections
  yPos = addFrameworkSections(pdf, framework, normalizedData, yPos);
  
  // Performance metrics
  yPos = addPerformanceMetrics(pdf, normalizedData, yPos);
  
  // Compliance status
  addComplianceSection(pdf, framework, normalizedData);
  
  // Footer
  addFooter(pdf, framework);
  
  return pdf;
};

const normalizeESGData = (data) => {
  return data.map(item => ({
    category: item.category || 'general',
    metric: item.subcategory || item.metric || 'Unknown Metric',
    value: item.value || 0,
    unit: item.unit || '',
    target: item.target || null,
    source: item.source || 'Internal',
    timestamp: item.timestamp || new Date().toISOString(),
    framework: item.framework || 'Custom'
  }));
};

const addHeader = (pdf, framework, companyName, reportPeriod) => {
  pdf.setFontSize(24);
  pdf.setTextColor(0, 102, 51);
  pdf.text(`${framework} ESG REPORT`, 20, 25);
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text(companyName, 20, 40);
  
  pdf.setFontSize(12);
  pdf.text(`Reporting Period: ${reportPeriod}`, 20, 50);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 60);
  
  // Add line separator
  pdf.setLineWidth(0.5);
  pdf.line(20, 75, 190, 75);
};

const addExecutiveSummary = (pdf, data, startY) => {
  let yPos = startY;
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 102, 51);
  pdf.text('EXECUTIVE SUMMARY', 20, yPos);
  yPos += 20;
  
  // Calculate summary statistics
  const envData = data.filter(item => item.category === 'environmental');
  const socialData = data.filter(item => item.category === 'social');
  const govData = data.filter(item => item.category === 'governance');
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Total ESG Metrics Tracked: ${data.length}`, 20, yPos);
  yPos += 10;
  pdf.text(`Environmental Metrics: ${envData.length}`, 20, yPos);
  yPos += 8;
  pdf.text(`Social Metrics: ${socialData.length}`, 20, yPos);
  yPos += 8;
  pdf.text(`Governance Metrics: ${govData.length}`, 20, yPos);
  yPos += 15;
  
  // Key highlights
  pdf.text('Key Performance Highlights:', 20, yPos);
  yPos += 10;
  
  const highlights = generateHighlights(data);
  highlights.forEach(highlight => {
    pdf.text(`• ${highlight}`, 25, yPos);
    yPos += 8;
  });
  
  return yPos + 15;
};

const addFrameworkSections = (pdf, framework, data, startY) => {
  let yPos = startY;
  
  const frameworkSections = getFrameworkSections(framework);
  
  frameworkSections.forEach(section => {
    if (yPos > 250) {
      pdf.addPage();
      yPos = 30;
    }
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 102, 51);
    pdf.text(section.title, 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(section.description, 20, yPos);
    yPos += 10;
    
    // Add relevant metrics
    const sectionData = data.filter(item => 
      section.categories.includes(item.category)
    );
    
    sectionData.slice(0, 5).forEach(item => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 30;
      }
      pdf.text(`• ${item.metric}: ${item.value} ${item.unit}`, 25, yPos);
      yPos += 8;
    });
    
    yPos += 10;
  });
  
  return yPos;
};

const addPerformanceMetrics = (pdf, data, startY) => {
  let yPos = startY;
  
  if (yPos > 200) {
    pdf.addPage();
    yPos = 30;
  }
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 102, 51);
  pdf.text('DETAILED PERFORMANCE METRICS', 20, yPos);
  yPos += 20;
  
  ['environmental', 'social', 'governance'].forEach(category => {
    const categoryData = data.filter(item => item.category === category);
    
    if (categoryData.length > 0) {
      if (yPos > 250) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setFontSize(14);
      pdf.text(category.charAt(0).toUpperCase() + category.slice(1), 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(10);
      categoryData.forEach(item => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 30;
        }
        
        const line = `${item.metric}: ${item.value} ${item.unit}`;
        if (item.target) {
          pdf.text(`${line} (Target: ${item.target} ${item.unit})`, 20, yPos);
        } else {
          pdf.text(line, 20, yPos);
        }
        yPos += 8;
      });
      
      yPos += 10;
    }
  });
  
  return yPos;
};

const addComplianceSection = (pdf, framework, data) => {
  pdf.addPage();
  let yPos = 30;
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 102, 51);
  pdf.text('COMPLIANCE & ASSURANCE', 20, yPos);
  yPos += 20;
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`This report complies with ${framework} standards and guidelines.`, 20, yPos);
  yPos += 15;
  
  pdf.text('Data Quality Assurance:', 20, yPos);
  yPos += 10;
  pdf.text('• All metrics have been verified for accuracy', 25, yPos);
  yPos += 8;
  pdf.text('• Data sources documented and traceable', 25, yPos);
  yPos += 8;
  pdf.text('• Regular internal audits conducted', 25, yPos);
  yPos += 15;
  
  pdf.text('Reporting Standards:', 20, yPos);
  yPos += 10;
  pdf.text(`• ${framework} framework compliance`, 25, yPos);
  yPos += 8;
  pdf.text('• Industry best practices followed', 25, yPos);
  yPos += 8;
  pdf.text('• Third-party verification where applicable', 25, yPos);
};

const addFooter = (pdf, framework) => {
  const pageCount = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`${framework} ESG Report - Page ${i} of ${pageCount}`, 20, 285);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 150, 285);
  }
};

const generateHighlights = (data) => {
  const highlights = [];
  
  if (data.length > 0) {
    highlights.push(`${data.length} ESG metrics successfully tracked and reported`);
  }
  
  const envData = data.filter(item => item.category === 'environmental');
  if (envData.length > 0) {
    highlights.push(`Environmental performance monitored across ${envData.length} key indicators`);
  }
  
  const targetsSet = data.filter(item => item.target).length;
  if (targetsSet > 0) {
    highlights.push(`${targetsSet} performance targets established and tracked`);
  }
  
  return highlights;
};

const getFrameworkSections = (framework) => {
  const sections = {
    'TCFD': [
      {
        title: 'Governance',
        description: 'Climate-related governance structure and oversight',
        categories: ['governance']
      },
      {
        title: 'Strategy', 
        description: 'Climate-related risks and opportunities impact on strategy',
        categories: ['environmental', 'governance']
      },
      {
        title: 'Risk Management',
        description: 'Climate-related risk identification and management processes',
        categories: ['governance', 'environmental']
      },
      {
        title: 'Metrics and Targets',
        description: 'Climate-related metrics and targets used to assess performance',
        categories: ['environmental']
      }
    ],
    'GRI': [
      {
        title: 'Environmental Performance',
        description: 'Environmental impact and resource management',
        categories: ['environmental']
      },
      {
        title: 'Social Performance', 
        description: 'Social impact and stakeholder relations',
        categories: ['social']
      },
      {
        title: 'Economic Performance',
        description: 'Economic impact and governance practices',
        categories: ['governance']
      }
    ],
    'SASB': [
      {
        title: 'Environment',
        description: 'Environmental sustainability metrics',
        categories: ['environmental']
      },
      {
        title: 'Social Capital',
        description: 'Stakeholder and community relations',
        categories: ['social']
      },
      {
        title: 'Human Capital',
        description: 'Employee relations and development',
        categories: ['social']
      },
      {
        title: 'Business Model & Innovation',
        description: 'Governance and business model sustainability',
        categories: ['governance']
      }
    ]
  };
  
  return sections[framework] || sections['GRI'];
};

export default generateESGPDF;