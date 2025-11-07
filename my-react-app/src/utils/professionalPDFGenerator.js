import jsPDF from 'jspdf';

export const generateProfessionalESGReport = (framework, data, options = {}) => {
  const pdf = new jsPDF();
  const {
    companyName = 'ESGenius Tech Solutions',
    reportPeriod = new Date().getFullYear(),
    logo = null
  } = options;

  // Colors
  const colors = {
    primary: [0, 102, 51],
    secondary: [34, 139, 34], 
    accent: [0, 128, 0],
    text: [51, 51, 51],
    lightGray: [245, 245, 245],
    darkGray: [128, 128, 128]
  };

  let currentPage = 1;
  
  // Cover Page
  createCoverPage(pdf, framework, companyName, reportPeriod, colors);
  
  // Table of Contents
  pdf.addPage();
  currentPage++;
  createTableOfContents(pdf, colors);
  
  // Executive Summary
  pdf.addPage();
  currentPage++;
  createExecutiveSummary(pdf, data, colors);
  
  // ESG Performance Sections
  pdf.addPage();
  currentPage++;
  createPerformanceSections(pdf, data, colors);
  
  // Data Tables
  pdf.addPage();
  currentPage++;
  createDataTables(pdf, data, colors);
  
  // Compliance & Methodology
  pdf.addPage();
  currentPage++;
  createComplianceSection(pdf, framework, colors);
  
  // Add page numbers
  addPageNumbers(pdf, currentPage);
  
  return pdf;
};

const createCoverPage = (pdf, framework, companyName, reportPeriod, colors) => {
  // Header background
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 60, 'F');
  
  // Company name
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companyName, 20, 35);
  
  // Main title
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESG SUSTAINABILITY', 20, 100);
  pdf.text('REPORT', 20, 125);
  
  // Framework badge
  pdf.setFillColor(...colors.secondary);
  pdf.roundedRect(20, 140, 60, 20, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(framework, 25, 153);
  
  // Report period
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Reporting Period: ${reportPeriod}`, 20, 180);
  
  // Date
  pdf.setFontSize(12);
  pdf.setTextColor(...colors.darkGray);
  pdf.text(`Published: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 20, 200);
  
  // Footer design
  pdf.setFillColor(...colors.lightGray);
  pdf.rect(0, 250, 210, 47, 'F');
  
  pdf.setTextColor(...colors.darkGray);
  pdf.setFontSize(10);
  pdf.text('Committed to Sustainable Business Practices', 20, 270);
};

const createTableOfContents = (pdf, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TABLE OF CONTENTS', 20, 20);
  
  // Contents
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const contents = [
    { title: 'Executive Summary', page: 3 },
    { title: 'Environmental Performance', page: 4 },
    { title: 'Social Performance', page: 5 },
    { title: 'Governance Performance', page: 6 },
    { title: 'Key Performance Indicators', page: 7 },
    { title: 'Compliance & Methodology', page: 8 }
  ];
  
  let yPos = 50;
  contents.forEach(item => {
    pdf.text(item.title, 20, yPos);
    pdf.text(item.page.toString(), 180, yPos);
    
    // Dotted line
    pdf.setLineDashPattern([1, 1], 0);
    pdf.line(20 + pdf.getTextWidth(item.title) + 5, yPos - 2, 175, yPos - 2);
    pdf.setLineDashPattern([], 0);
    
    yPos += 15;
  });
};

const createExecutiveSummary = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXECUTIVE SUMMARY', 20, 20);
  
  // Summary stats
  const envData = data.filter(item => item.category === 'environmental');
  const socialData = data.filter(item => item.category === 'social');
  const govData = data.filter(item => item.category === 'governance');
  
  // Key metrics boxes
  const metrics = [
    { label: 'Total Metrics', value: data.length, color: colors.primary },
    { label: 'Environmental', value: envData.length, color: colors.secondary },
    { label: 'Social', value: socialData.length, color: colors.accent },
    { label: 'Governance', value: govData.length, color: [70, 130, 180] }
  ];
  
  let xPos = 20;
  metrics.forEach(metric => {
    pdf.setFillColor(...metric.color);
    pdf.roundedRect(xPos, 45, 40, 30, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metric.value.toString(), xPos + 20 - pdf.getTextWidth(metric.value.toString())/2, 60);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(metric.label, xPos + 20 - pdf.getTextWidth(metric.label)/2, 70);
    
    xPos += 45;
  });
  
  // Performance overview
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Performance Overview', 20, 100);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const summaryText = [
    `This report presents our comprehensive ESG performance for ${new Date().getFullYear()}.`,
    `We have successfully tracked ${data.length} key performance indicators across all ESG dimensions.`,
    '',
    'Key Achievements:',
    '• Comprehensive data collection across all ESG categories',
    '• Systematic tracking of performance metrics',
    '• Alignment with international reporting standards',
    '• Continuous improvement in sustainability practices'
  ];
  
  let yPos = 115;
  summaryText.forEach(line => {
    if (line.startsWith('•')) {
      pdf.text(line, 25, yPos);
    } else {
      pdf.text(line, 20, yPos);
    }
    yPos += 12;
  });
};

const createPerformanceSections = (pdf, data, colors) => {
  const categories = [
    { name: 'Environmental', data: data.filter(item => item.category === 'environmental'), color: colors.secondary },
    { name: 'Social', data: data.filter(item => item.category === 'social'), color: colors.accent },
    { name: 'Governance', data: data.filter(item => item.category === 'governance'), color: [70, 130, 180] }
  ];
  
  let yPos = 20;
  
  categories.forEach(category => {
    if (yPos > 200) {
      pdf.addPage();
      yPos = 20;
    }
    
    // Section header
    pdf.setFillColor(...category.color);
    pdf.rect(20, yPos - 5, 170, 20, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${category.name.toUpperCase()} PERFORMANCE`, 25, yPos + 7);
    
    yPos += 25;
    
    // Metrics
    if (category.data.length > 0) {
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      category.data.slice(0, 8).forEach(item => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        // Metric row
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, yPos - 3, 170, 12, 'F');
        
        pdf.text(item.subcategory || item.metric || 'Unknown Metric', 25, yPos + 3);
        
        const valueText = `${item.value} ${item.unit || ''}`;
        pdf.text(valueText, 180 - pdf.getTextWidth(valueText), yPos + 3);
        
        if (item.target) {
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(9);
          pdf.text(`Target: ${item.target} ${item.unit || ''}`, 25, yPos + 10);
          pdf.setTextColor(...colors.text);
          pdf.setFontSize(11);
        }
        
        yPos += 15;
      });
    } else {
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(10);
      pdf.text('No data available for this category', 25, yPos);
      yPos += 15;
    }
    
    yPos += 10;
  });
};

const createDataTables = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DETAILED PERFORMANCE DATA', 20, 20);
  
  // Prepare table data
  const tableData = data.map(item => [
    item.category?.charAt(0).toUpperCase() + item.category?.slice(1) || 'N/A',
    item.subcategory || item.metric || 'Unknown',
    `${item.value || 0} ${item.unit || ''}`,
    item.target ? `${item.target} ${item.unit || ''}` : 'Not Set',
    item.source || 'Internal'
  ]);
  
  // Create manual table
  let yPos = 50;
  const colWidths = [35, 60, 35, 35, 35];
  const colPositions = [20, 55, 115, 150, 185];
  
  // Table header
  pdf.setFillColor(...colors.primary);
  pdf.rect(20, yPos - 5, 170, 12, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  const headers = ['Category', 'Metric', 'Value', 'Target', 'Source'];
  headers.forEach((header, i) => {
    pdf.text(header, colPositions[i], yPos + 3);
  });
  
  yPos += 15;
  
  // Table rows
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  
  tableData.slice(0, 25).forEach((row, index) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 30;
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(20, yPos - 3, 170, 10, 'F');
    }
    
    row.forEach((cell, i) => {
      const text = cell.length > 15 ? cell.substring(0, 12) + '...' : cell;
      pdf.text(text, colPositions[i], yPos + 2);
    });
    
    yPos += 10;
  });
};

const createComplianceSection = (pdf, framework, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('COMPLIANCE & METHODOLOGY', 20, 20);
  
  // Framework compliance
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Reporting Framework Compliance', 20, 50);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`This report has been prepared in accordance with ${framework} standards and guidelines.`, 20, 65);
  
  // Standards box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(20, 75, 170, 40, 3, 3, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Applicable Standards:', 25, 90);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const standards = [
    `• ${framework} Framework Requirements`,
    '• International ESG Reporting Standards',
    '• Industry Best Practices',
    '• Regulatory Compliance Guidelines'
  ];
  
  let yPos = 100;
  standards.forEach(standard => {
    pdf.text(standard, 30, yPos);
    yPos += 8;
  });
  
  // Data quality
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data Quality Assurance', 20, 140);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const qualityPoints = [
    '• All data points have been verified for accuracy and completeness',
    '• Data sources are documented and traceable',
    '• Regular internal audits ensure data integrity',
    '• Third-party verification applied where applicable',
    '• Continuous monitoring and improvement processes in place'
  ];
  
  yPos = 155;
  qualityPoints.forEach(point => {
    pdf.text(point, 25, yPos);
    yPos += 12;
  });
  
  // Contact info
  pdf.setFillColor(...colors.primary);
  pdf.rect(20, 220, 170, 30, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('For more information about this report:', 25, 235);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('sustainability@company.com | www.company.com/sustainability', 25, 245);
};

const addPageNumbers = (pdf, totalPages) => {
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(8);
    pdf.text(`Page ${i} of ${totalPages}`, 180, 290);
  }
};

export default generateProfessionalESGReport;