import jsPDF from 'jspdf';

export const generateExecutiveProfessionalReport = (framework, data, options = {}) => {
  const pdf = new jsPDF();
  const {
    companyName = 'ESGenius Tech Solutions',
    reportPeriod = new Date().getFullYear(),
    executiveSummary = true,
    includeCharts = true,
    includeCompliance = true
  } = options;

  // Professional color scheme
  const colors = {
    primary: [0, 51, 102],      // Deep blue
    secondary: [0, 102, 51],     // Forest green  
    accent: [204, 153, 0],       // Gold
    text: [33, 37, 41],          // Dark gray
    lightGray: [248, 249, 250],  // Light background
    mediumGray: [108, 117, 125], // Medium gray
    success: [40, 167, 69],      // Success green
    warning: [255, 193, 7],      // Warning yellow
    danger: [220, 53, 69]        // Danger red
  };

  let pageCount = 1;

  // Executive Cover Page
  createExecutiveCoverPage(pdf, framework, companyName, reportPeriod, colors);
  
  // Executive Summary
  if (executiveSummary) {
    pdf.addPage();
    pageCount++;
    createExecutiveSummary(pdf, data, colors, framework);
  }
  
  // Key Performance Dashboard
  pdf.addPage();
  pageCount++;
  createKPIDashboard(pdf, data, colors);
  
  // ESG Performance Analysis
  pdf.addPage();
  pageCount++;
  createPerformanceAnalysis(pdf, data, colors);
  
  // Risk Assessment & Opportunities
  pdf.addPage();
  pageCount++;
  createRiskOpportunityAnalysis(pdf, data, colors);
  
  // Compliance & Governance
  if (includeCompliance) {
    pdf.addPage();
    pageCount++;
    createComplianceGovernance(pdf, framework, colors);
  }
  
  // Strategic Recommendations
  pdf.addPage();
  pageCount++;
  createStrategicRecommendations(pdf, data, colors);
  
  // Add professional footer to all pages
  addProfessionalFooters(pdf, pageCount, companyName);
  
  return pdf;
};

const createExecutiveCoverPage = (pdf, framework, companyName, reportPeriod, colors) => {
  // Professional header with gradient effect
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 80, 'F');
  
  // Company logo placeholder
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(15, 15, 30, 15, 2, 2, 'F');
  pdf.setTextColor(...colors.primary);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LOGO', 28, 24);
  
  // Company name and title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companyName, 15, 55);
  
  // Main report title
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(42);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESG PERFORMANCE', 15, 110);
  pdf.text('EXECUTIVE REPORT', 15, 135);
  
  // Framework and period
  pdf.setFillColor(...colors.secondary);
  pdf.roundedRect(15, 150, 80, 25, 3, 3, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${framework} Framework`, 20, 165);
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Reporting Period: ${reportPeriod}`, 15, 190);
  
  // Professional date and confidentiality
  pdf.setFontSize(12);
  pdf.setTextColor(...colors.mediumGray);
  pdf.text(`Report Date: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 15, 210);
  
  // Executive summary box
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 230, 180, 40, 5, 5, 'F');
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXECUTIVE BRIEFING', 20, 240);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This report provides strategic insights into our ESG performance,', 20, 250);
  pdf.text('risk assessment, and recommendations for sustainable growth.', 20, 260);
  
  // Confidentiality notice
  pdf.setTextColor(...colors.mediumGray);
  pdf.setFontSize(8);
  pdf.text('CONFIDENTIAL - For Executive Review Only', 15, 285);
};

const createExecutiveSummary = (pdf, data, colors, framework) => {
  // Professional header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXECUTIVE SUMMARY', 15, 25);
  
  // Key metrics overview
  const envData = data.filter(item => item.category === 'environmental');
  const socialData = data.filter(item => item.category === 'social');
  const govData = data.filter(item => item.category === 'governance');
  
  // Calculate performance scores
  const envScore = calculateCategoryScore(envData);
  const socialScore = calculateCategoryScore(socialData);
  const govScore = calculateCategoryScore(govData);
  const overallScore = Math.round((envScore + socialScore + govScore) / 3);
  
  // Performance scorecard
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 50, 180, 60, 5, 5, 'F');
  
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESG PERFORMANCE SCORECARD', 20, 65);
  
  // Score boxes
  const scoreBoxes = [
    { label: 'Environmental', score: envScore, x: 25 },
    { label: 'Social', score: socialScore, x: 75 },
    { label: 'Governance', score: govScore, x: 125 },
    { label: 'Overall ESG', score: overallScore, x: 175 }
  ];
  
  scoreBoxes.forEach(box => {
    const color = box.score >= 80 ? colors.success : 
                  box.score >= 60 ? colors.warning : colors.danger;
    
    pdf.setFillColor(...color);
    pdf.roundedRect(box.x - 15, 75, 30, 25, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(box.score.toString(), box.x - 5, 90);
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(box.label, box.x - 12, 98);
  });
  
  // Strategic insights
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STRATEGIC INSIGHTS', 15, 130);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const insights = [
    `• Overall ESG performance rated at ${overallScore}/100, indicating ${getPerformanceRating(overallScore)} performance`,
    `• ${data.length} key performance indicators tracked across all ESG dimensions`,
    `• Environmental initiatives show ${envScore >= 70 ? 'strong' : 'developing'} progress toward sustainability goals`,
    `• Social responsibility metrics demonstrate ${socialScore >= 70 ? 'excellent' : 'good'} stakeholder engagement`,
    `• Governance framework maintains ${govScore >= 70 ? 'robust' : 'adequate'} oversight and transparency`
  ];
  
  let yPos = 145;
  insights.forEach(insight => {
    pdf.text(insight, 20, yPos);
    yPos += 12;
  });
  
  // Key achievements box
  pdf.setFillColor(...colors.secondary);
  pdf.roundedRect(15, 200, 180, 50, 5, 5, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('KEY ACHIEVEMENTS & MILESTONES', 20, 215);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const achievements = [
    '✓ Comprehensive ESG data collection and monitoring system implemented',
    '✓ Alignment with international reporting standards and best practices',
    '✓ Stakeholder engagement initiatives expanded across all business units'
  ];
  
  yPos = 230;
  achievements.forEach(achievement => {
    pdf.text(achievement, 25, yPos);
    yPos += 10;
  });
};

const createKPIDashboard = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('KEY PERFORMANCE INDICATORS', 15, 25);
  
  // Environmental KPIs
  createKPISection(pdf, 'ENVIRONMENTAL METRICS', data.filter(d => d.category === 'environmental'), colors, 50);
  
  // Social KPIs  
  createKPISection(pdf, 'SOCIAL METRICS', data.filter(d => d.category === 'social'), colors, 120);
  
  // Governance KPIs
  createKPISection(pdf, 'GOVERNANCE METRICS', data.filter(d => d.category === 'governance'), colors, 190);
};

const createKPISection = (pdf, title, sectionData, colors, yStart) => {
  pdf.setFillColor(...colors.secondary);
  pdf.rect(15, yStart, 180, 20, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 20, yStart + 13);
  
  // KPI boxes
  if (sectionData.length > 0) {
    const kpis = sectionData.slice(0, 4);
    let xPos = 20;
    
    kpis.forEach(kpi => {
      pdf.setFillColor(...colors.lightGray);
      pdf.roundedRect(xPos, yStart + 25, 40, 35, 3, 3, 'F');
      
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(kpi.value?.toString() || '0', xPos + 5, yStart + 40);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const metricName = (kpi.metric || kpi.subcategory || 'Metric').substring(0, 15);
      pdf.text(metricName, xPos + 5, yStart + 50);
      
      xPos += 45;
    });
  } else {
    pdf.setTextColor(...colors.mediumGray);
    pdf.setFontSize(10);
    pdf.text('No data available', 20, yStart + 40);
  }
};

const createPerformanceAnalysis = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PERFORMANCE ANALYSIS', 15, 25);
  
  // Trend analysis
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PERFORMANCE TRENDS & BENCHMARKING', 15, 55);
  
  // Performance matrix
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 65, 180, 80, 5, 5, 'F');
  
  const categories = ['Environmental', 'Social', 'Governance'];
  const metrics = ['Current Score', 'Industry Avg', 'Best Practice', 'Trend'];
  
  // Table headers
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  let yPos = 80;
  pdf.text('Category', 20, yPos);
  pdf.text('Score', 70, yPos);
  pdf.text('Industry', 100, yPos);
  pdf.text('Best Practice', 130, yPos);
  pdf.text('Trend', 170, yPos);
  
  yPos += 15;
  
  // Performance data
  pdf.setFont('helvetica', 'normal');
  categories.forEach(category => {
    const categoryData = data.filter(d => d.category === category.toLowerCase());
    const score = calculateCategoryScore(categoryData);
    
    pdf.text(category, 20, yPos);
    pdf.text(score.toString(), 70, yPos);
    pdf.text('75', 100, yPos); // Mock industry average
    pdf.text('85', 130, yPos); // Mock best practice
    pdf.text(score >= 75 ? '↗' : '→', 170, yPos);
    
    yPos += 12;
  });
  
  // Strategic recommendations
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STRATEGIC RECOMMENDATIONS', 15, 170);
  
  const recommendations = [
    '1. Enhance environmental monitoring systems for real-time tracking',
    '2. Expand stakeholder engagement programs across all regions',
    '3. Strengthen governance frameworks with additional oversight mechanisms',
    '4. Implement advanced analytics for predictive ESG performance modeling'
  ];
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  yPos = 185;
  
  recommendations.forEach(rec => {
    pdf.text(rec, 20, yPos);
    yPos += 15;
  });
};

const createRiskOpportunityAnalysis = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RISK & OPPORTUNITY ANALYSIS', 15, 25);
  
  // Risk matrix
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ESG RISK ASSESSMENT', 15, 55);
  
  const risks = [
    { category: 'Climate Risk', level: 'Medium', impact: 'High', mitigation: 'Carbon reduction strategy' },
    { category: 'Social Risk', level: 'Low', impact: 'Medium', mitigation: 'Enhanced engagement' },
    { category: 'Governance Risk', level: 'Low', impact: 'Low', mitigation: 'Regular audits' }
  ];
  
  // Risk table
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 65, 180, 60, 5, 5, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Risk Category', 20, 80);
  pdf.text('Level', 80, 80);
  pdf.text('Impact', 120, 80);
  pdf.text('Mitigation', 160, 80);
  
  let yPos = 95;
  pdf.setFont('helvetica', 'normal');
  
  risks.forEach(risk => {
    pdf.text(risk.category, 20, yPos);
    
    // Color-coded risk level
    const levelColor = risk.level === 'High' ? colors.danger : 
                      risk.level === 'Medium' ? colors.warning : colors.success;
    pdf.setTextColor(...levelColor);
    pdf.text(risk.level, 80, yPos);
    
    pdf.setTextColor(...colors.text);
    pdf.text(risk.impact, 120, yPos);
    pdf.text(risk.mitigation.substring(0, 15), 160, yPos);
    
    yPos += 12;
  });
  
  // Opportunities section
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STRATEGIC OPPORTUNITIES', 15, 150);
  
  const opportunities = [
    '• Green technology investments for competitive advantage',
    '• Enhanced brand reputation through sustainability leadership',
    '• Cost savings through operational efficiency improvements',
    '• Access to sustainable finance and ESG-focused investors'
  ];
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  yPos = 165;
  
  opportunities.forEach(opp => {
    pdf.text(opp, 20, yPos);
    yPos += 15;
  });
};

const createComplianceGovernance = (pdf, framework, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('COMPLIANCE & GOVERNANCE', 15, 25);
  
  // Framework compliance
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REGULATORY COMPLIANCE STATUS', 15, 55);
  
  const complianceItems = [
    { framework: 'SEBI BRSR', status: 'Compliant', percentage: '95%' },
    { framework: 'GRI Standards', status: 'Compliant', percentage: '90%' },
    { framework: 'TCFD', status: 'In Progress', percentage: '75%' },
    { framework: 'SASB', status: 'Compliant', percentage: '85%' }
  ];
  
  // Compliance table
  pdf.setFillColor(...colors.lightGray);
  pdf.roundedRect(15, 65, 180, 80, 5, 5, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Framework', 20, 80);
  pdf.text('Status', 100, 80);
  pdf.text('Completion', 150, 80);
  
  let yPos = 95;
  pdf.setFont('helvetica', 'normal');
  
  complianceItems.forEach(item => {
    pdf.setTextColor(...colors.text);
    pdf.text(item.framework, 20, yPos);
    
    const statusColor = item.status === 'Compliant' ? colors.success : colors.warning;
    pdf.setTextColor(...statusColor);
    pdf.text(item.status, 100, yPos);
    
    pdf.setTextColor(...colors.text);
    pdf.text(item.percentage, 150, yPos);
    
    yPos += 15;
  });
  
  // Governance structure
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GOVERNANCE STRUCTURE', 15, 170);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const governance = [
    '• Board-level ESG oversight committee established',
    '• Regular ESG performance reviews and reporting',
    '• Integration of ESG metrics into executive compensation',
    '• Stakeholder engagement and feedback mechanisms'
  ];
  
  yPos = 185;
  governance.forEach(item => {
    pdf.text(item, 20, yPos);
    yPos += 12;
  });
};

const createStrategicRecommendations = (pdf, data, colors) => {
  // Header
  pdf.setFillColor(...colors.primary);
  pdf.rect(0, 0, 210, 35, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STRATEGIC RECOMMENDATIONS', 15, 25);
  
  // Priority actions
  pdf.setTextColor(...colors.text);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PRIORITY ACTIONS FOR NEXT PERIOD', 15, 55);
  
  const priorities = [
    {
      title: 'Environmental Excellence',
      actions: [
        'Implement carbon neutrality roadmap',
        'Enhance renewable energy adoption',
        'Strengthen waste reduction programs'
      ],
      timeline: 'Q1-Q2 2024'
    },
    {
      title: 'Social Impact Enhancement', 
      actions: [
        'Expand diversity and inclusion initiatives',
        'Strengthen community engagement programs',
        'Enhance employee wellbeing measures'
      ],
      timeline: 'Q2-Q3 2024'
    },
    {
      title: 'Governance Optimization',
      actions: [
        'Enhance ESG reporting transparency',
        'Strengthen risk management frameworks',
        'Expand stakeholder communication'
      ],
      timeline: 'Q3-Q4 2024'
    }
  ];
  
  let yPos = 70;
  
  priorities.forEach(priority => {
    // Priority box
    pdf.setFillColor(...colors.secondary);
    pdf.roundedRect(15, yPos, 180, 50, 5, 5, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(priority.title, 20, yPos + 15);
    
    pdf.setFontSize(8);
    pdf.text(`Timeline: ${priority.timeline}`, 150, yPos + 15);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    let actionY = yPos + 25;
    
    priority.actions.forEach(action => {
      pdf.text(`• ${action}`, 25, actionY);
      actionY += 8;
    });
    
    yPos += 60;
  });
};

const addProfessionalFooters = (pdf, totalPages, companyName) => {
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Footer line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 285, 195, 285);
    
    // Footer text
    pdf.setTextColor(128, 128, 128);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${companyName} - ESG Performance Report`, 15, 292);
    pdf.text(`Page ${i} of ${totalPages}`, 170, 292);
    pdf.text('Confidential', 95, 292);
  }
};

// Helper functions
const calculateCategoryScore = (categoryData) => {
  if (!categoryData || categoryData.length === 0) return 0;
  
  const total = categoryData.reduce((sum, item) => {
    const value = parseFloat(item.value) || 0;
    return sum + Math.min(value, 100); // Cap at 100
  }, 0);
  
  return Math.round(total / categoryData.length);
};

const getPerformanceRating = (score) => {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'satisfactory';
  return 'needs improvement';
};

export default generateExecutiveProfessionalReport;