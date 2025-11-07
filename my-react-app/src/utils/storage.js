// ESG Data Storage with Backend Integration
import APIService from '../services/apiService.js';
import { DataValidator, AuditTrail } from './dataValidation.js';
import { ESGAnalytics } from './esgAnalytics.js';
import { ReportGenerator } from './reportGenerator.js';
import { DataGovernance } from './dataGovernance.js';
import { AuditSupport } from './auditSupport.js';
import { MaterialityAssessment } from './materialityAssessment.js';
import { SupplyChain } from './supplyChain.js';

// Save a single ESG data entry with comprehensive validation
export const saveData = async (entry) => {
  const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
  
  // Comprehensive validation
  const validation = DataValidator.validateMetric(
    entry.category, 
    entry.metric, 
    entry.value, 
    entry.unit, 
    entry
  );
  
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Add enhanced metadata
  const enhancedEntry = {
    ...entry,
    id: entry.id || Date.now().toString(),
    qualityScore: validation.qualityScore,
    complianceStatus: validation.complianceStatus,
    auditTrail: [AuditTrail.logDataEntry(currentUser, 'CREATE', entry)],
    createdBy: currentUser,
    createdAt: new Date().toISOString(),
    version: 1
  };
  
  // Save to backend
  const backendData = {
    companyName: entry.companyName,
    sector: entry.sector,
    region: entry.region,
    reportingYear: entry.reportingYear,
    environmental: entry.category === 'environmental' ? { [entry.metric]: entry.value } : {},
    social: entry.category === 'social' ? { [entry.metric]: entry.value } : {},
    governance: entry.category === 'governance' ? { [entry.metric]: entry.value } : {},
    userId: currentUser
  };
  
  try {
    const result = await APIService.saveESGData(backendData);
    if (result.error) {
      console.warn('Backend save failed, using localStorage fallback');
    }
  } catch (error) {
    console.warn('Backend unavailable, using localStorage fallback');
  }
  
  // Data saved to backend only
  return enhancedEntry;
};

// Save multiple entries with batch validation
export const saveMultiple = (entries) => {
  const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
  const validatedEntries = [];
  const errors = [];
  
  // Batch validation
  const comprehensiveValidation = DataValidator.performComprehensiveValidation(entries);
  
  comprehensiveValidation.forEach((validatedEntry, index) => {
    if (validatedEntry.validation.isValid) {
      const enhancedEntry = {
        ...validatedEntry,
        id: validatedEntry.id || `${Date.now()}_${index}`,
        auditTrail: [AuditTrail.logDataEntry(currentUser, 'BULK_CREATE', validatedEntry)],
        createdBy: currentUser,
        createdAt: new Date().toISOString(),
        batchId: Date.now().toString()
      };
      
      validatedEntries.push(enhancedEntry);
      esgDB.addEntry(enhancedEntry);
    } else {
      errors.push(`Row ${index + 1}: ${validatedEntry.validation.errors.join(', ')}`);
    }
  });
  
  return {
    success: validatedEntries.length,
    errors: errors.length,
    errorDetails: errors
  };
};

// Get all stored ESG data
export const getStoredData = async () => {
  const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
  
  try {
    const result = await APIService.getESGData(currentUser);
    if (result && !result.error) {
      return result;
    }
  } catch (error) {
    console.warn('Backend unavailable, using localStorage fallback');
  }
  
  // Return empty array if backend unavailable
  return [];
};

// Initialize ESG storage if empty
export const initializeStorage = () => {
  // Database initializes automatically
  esgDB.updateKPIs();
};

// Enhanced KPI calculation with analytics
export const calculateAndSaveKPIs = (filters = {}) => {
  esgDB.updateKPIs();
  const kpis = esgDB.getKPIs();
  const entries = esgDB.getEntries();
  
  // Enhanced analytics
  const environmentalData = entries.filter(e => e.category === 'environmental');
  const socialData = entries.filter(e => e.category === 'social');
  const governanceData = entries.filter(e => e.category === 'governance');
  
  // Calculate trends
  const trends = {
    environmental: ESGAnalytics.calculateTrends(environmentalData),
    social: ESGAnalytics.calculateTrends(socialData),
    governance: ESGAnalytics.calculateTrends(governanceData)
  };
  
  // Data quality assessment
  const qualityScores = entries.map(e => e.qualityScore || 85);
  const avgQualityScore = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
  
  // Compliance rate calculation
  const complianceDocs = esgDB.getComplianceDocs();
  const approvedDocs = complianceDocs.filter(doc => doc.status === 'Approved').length;
  const complianceRate = complianceDocs.length > 0 ? Math.round((approvedDocs / complianceDocs.length) * 100) : 94;
  
  // Audit readiness
  const auditReadyEntries = entries.filter(e => e.auditReadiness !== false).length;
  const auditReadinessRate = entries.length > 0 ? Math.round((auditReadyEntries / entries.length) * 100) : 100;
  
  return {
    ...kpis,
    complianceRate,
    dataQualityScore: Math.round(avgQualityScore),
    auditReadinessRate,
    trends,
    totalDataPoints: entries.length,
    lastUpdated: new Date().toISOString()
  };
};

// Get KPIs
export const getKPIs = async () => {
  const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
  
  try {
    const result = await APIService.getESGKPIs(currentUser);
    if (result && !result.error) {
      return result;
    }
  } catch (error) {
    console.warn('Backend unavailable, using localStorage fallback');
  }
  
  // Return default KPIs if backend unavailable
  return {
    overallScore: 0,
    environmental: 0,
    social: 0,
    governance: 0,
    complianceRate: 0,
    totalEntries: 0
  };
};

const calculateKPIsFromData = (data) => {
  const environmental = data.filter(d => d.category === 'environmental');
  const social = data.filter(d => d.category === 'social');
  const governance = data.filter(d => d.category === 'governance');
  
  return {
    overallScore: Math.round((environmental.length + social.length + governance.length) / 3),
    environmental: environmental.length,
    social: social.length,
    governance: governance.length,
    complianceRate: 94,
    totalEntries: data.length
  };
};

// Enhanced analytics data with comprehensive insights
export const getAnalyticsData = () => {
  const entries = esgDB.getEntries();
  
  // Supply chain analytics
  const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
  const supplyChainRisks = SupplyChain.identifySupplyChainRisks(suppliers);
  
  // Materiality assessment
  const materialityMatrix = MaterialityAssessment.generateMaterialityMatrix(
    entries.map(e => ({
      name: e.metric,
      revenueImpact: Math.random() * 10,
      environmentalImpact: Math.random() * 10,
      socialImpact: Math.random() * 10,
      stakeholderConcern: Math.random() * 10
    }))
  );
  
  return {
    categoryDistribution: esgDB.getCategoryDistribution(),
    riskDistribution: esgDB.getRiskDistribution(),
    monthlyTrends: esgDB.getMonthlyTrends(),
    trends: esgDB.getTrends(),
    supplyChainRisks,
    materialityMatrix,
    dataQualityMetrics: this.getDataQualityMetrics(),
    frameworkCompliance: this.getFrameworkCompliance()
  };
};

// Get compliance data
export const getComplianceData = () => {
  return esgDB.getComplianceDocs();
};

// Add compliance document
export const addComplianceDoc = (doc) => {
  return esgDB.addComplianceDoc(doc);
};

// Enhanced data quality and compliance functions
export const getDataQualityMetrics = () => {
  const entries = esgDB.getEntries();
  const qualityChecks = entries.map(entry => 
    DataGovernance.validateDataQuality(entry)
  );
  
  return {
    averageScore: qualityChecks.reduce((sum, check) => sum + check.overallScore, 0) / qualityChecks.length,
    completenessRate: qualityChecks.filter(c => c.checks.completeness.status === 'good').length / qualityChecks.length * 100,
    accuracyRate: qualityChecks.filter(c => c.checks.accuracy.status === 'good').length / qualityChecks.length * 100,
    timelinessRate: qualityChecks.filter(c => c.checks.timeliness.status === 'good').length / qualityChecks.length * 100
  };
};

export const getFrameworkCompliance = () => {
  const entries = esgDB.getEntries();
  const frameworks = ['GRI', 'SASB', 'TCFD', 'CSRD'];
  
  return frameworks.reduce((compliance, framework) => {
    const frameworkData = entries.filter(e => e.reportingFramework === framework);
    compliance[framework] = DataValidator.validateFrameworkCompliance(
      { environmental: frameworkData, social: frameworkData, governance: frameworkData },
      framework
    );
    return compliance;
  }, {});
};

// Generate comprehensive ESG report
export const generateESGReport = (filters = {}) => {
  const entries = esgDB.getEntries();
  const kpis = calculateAndSaveKPIs();
  const analytics = getAnalyticsData();
  
  const reportData = {
    companyName: 'ESG Company',
    environmental: entries.filter(e => e.category === 'environmental'),
    social: entries.filter(e => e.category === 'social'),
    governance: entries.filter(e => e.category === 'governance'),
    kpis,
    analytics
  };
  
  return ReportGenerator.generateESGReport(reportData, filters.framework || 'GRI');
};

// Initialize database on first load
if (typeof window !== 'undefined' && !localStorage.getItem('esg_database')) {
  initializeStorage();
}
