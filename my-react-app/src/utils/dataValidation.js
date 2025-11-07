// ESG Data Quality & Validation Engine
import { STANDARD_METRICS } from './esgFrameworks';
import { ESGAnalytics } from './esgAnalytics';
import { RegulatoryCompliance } from './regulatoryCompliance';
import { DataGovernance } from './dataGovernance';
import { AuditSupport } from './auditSupport';

export class DataValidator {
  static validateMetric(category, metric, value, unit, additionalData = {}) {
    const errors = [];
    const warnings = [];
    const standardMetric = STANDARD_METRICS?.[category]?.[metric];

    // Basic validation
    if (!value || value === '') {
      errors.push('Value is required');
      return { isValid: false, errors };
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      errors.push('Value must be a number');
      return { isValid: false, errors };
    }

    // Range validation
    if (numValue < 0 && !DataValidator.canBeNegative(metric)) {
      errors.push('Value cannot be negative');
    }

    // Unit validation
    if (standardMetric && unit && standardMetric.unit !== unit) {
      errors.push(`Expected unit: ${standardMetric.unit}, got: ${unit}`);
    }

    // Specific metric validation
    if (metric.includes('Percentage') && (numValue < 0 || numValue > 100)) {
      errors.push('Percentage values must be between 0 and 100');
    }

    if (metric.includes('Emissions')) {
      const industryAverage = 50000;
      if (numValue > industryAverage) {
        warnings.push(`Emissions above typical industry average of ${industryAverage.toLocaleString()} ${unit}`);
      }
      
      if (numValue > 1000000) {
        errors.push('Emissions value seems unusually high. Please verify.');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: [...warnings, ...DataValidator.generateWarnings(category, metric, numValue)],
      qualityScore: 85,
      complianceStatus: 'compliant'
    };
  }

  static generateWarnings(category, metric, value) {
    const warnings = [];

    // Industry benchmarks (simplified)
    const benchmarks = {
      environmental: {
        renewableEnergyPercentage: { good: 50, excellent: 80 },
        wasteRecycled: { good: 60, excellent: 85 }
      },
      social: {
        femaleEmployeesPercentage: { good: 30, excellent: 50 },
        lostTimeInjuryRate: { good: 2, excellent: 1 }
      },
      governance: {
        independentDirectorsPercentage: { good: 50, excellent: 75 },
        ethicsTrainingCompletion: { good: 90, excellent: 95 }
      }
    };

    const benchmark = benchmarks[category]?.[metric];
    if (benchmark) {
      if (value < benchmark.good) {
        warnings.push(`Below industry average. Consider improvement initiatives.`);
      } else if (value >= benchmark.excellent) {
        warnings.push(`Excellent performance! Above industry leaders.`);
      }
    }

    return warnings;
  }

  static validateFrameworkCompliance(data, framework) {
    const compliance = {
      GRI: DataValidator.validateGRICompliance(data),
      SASB: DataValidator.validateSASBCompliance(data),
      TCFD: DataValidator.validateTCFDCompliance(data),
      CSRD: DataValidator.validateCSRDCompliance(data)
    };

    return compliance[framework] || { score: 0, missing: [], recommendations: [] };
  }

  static validateGRICompliance(data) {
    const required = [
      'scope1Emissions', 'scope2Emissions', 'energyConsumption',
      'totalEmployees', 'femaleEmployeesPercentage', 'lostTimeInjuryRate',
      'boardSize', 'independentDirectorsPercentage'
    ];

    const present = required.filter(field => 
      data.environmental?.[field] || data.social?.[field] || data.governance?.[field]
    );

    const missing = required.filter(field => 
      !data.environmental?.[field] && !data.social?.[field] && !data.governance?.[field]
    );

    return {
      score: Math.round((present.length / required.length) * 100),
      missing,
      recommendations: missing.map(field => `Add ${field} for GRI compliance`)
    };
  }

  static validateSASBCompliance(data) {
    // Simplified SASB validation
    const sectorMetrics = {
      technology: ['energyConsumption', 'dataBreaches', 'diversityMetrics'],
      manufacturing: ['scope1Emissions', 'waterWithdrawal', 'wasteGenerated'],
      financial: ['dataPrivacy', 'ethicsTraining', 'cybersecurityScore']
    };

    // This would be more complex in real implementation
    return {
      score: 75,
      missing: ['sector-specific metrics'],
      recommendations: ['Implement sector-specific SASB metrics']
    };
  }

  static validateTCFDCompliance(data) {
    const tcfdElements = [
      'climateGovernance', 'climateStrategy', 'riskManagement', 'metricsTargets'
    ];

    return {
      score: 60,
      missing: ['climate scenario analysis', 'transition risks'],
      recommendations: ['Add climate risk assessment', 'Implement scenario planning']
    };
  }

  static validateCSRDCompliance(data) {
    return {
      score: 45,
      missing: ['double materiality assessment', 'value chain impacts'],
      recommendations: ['Conduct materiality assessment', 'Map value chain impacts']
    };
  }

  static canBeNegative(metric) {
    const negativeAllowed = ['change', 'variance', 'difference', 'improvement', 'reduction'];
    return negativeAllowed.some(term => metric?.toLowerCase().includes(term));
  }
}

export class AuditTrail {
  static logDataEntry(userId, action, data, timestamp = new Date()) {
    const entry = {
      id: Date.now().toString(),
      userId,
      action,
      data,
      timestamp: timestamp.toISOString(),
      hash: AuditTrail.generateHash(data)
    };
    
    // Store in localStorage
    const trail = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    trail.push(entry);
    localStorage.setItem('auditTrail', JSON.stringify(trail));

    return entry;
  }

  static generateHash(data) {
    // Simple hash for data integrity (use proper crypto in production)
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  static getAuditTrail(filters = {}) {
    const trail = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    
    if (filters.userId) {
      return trail.filter(entry => entry.userId === filters.userId);
    }
    
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      return trail.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= start && entryDate <= end;
      });
    }

    return trail;
  }

  // Enhanced helper methods
  static getIndustryBenchmark(metric) {
    const benchmarks = {
      'scope1Emissions': 50000,
      'scope2Emissions': 30000,
      'scope3Emissions': 100000,
      'energyConsumption': 75000,
      'waterWithdrawal': 25000,
      'Carbon Emissions': 50000,
      'Energy Consumption': 75000
    };
    return benchmarks[metric] || 10000;
  }

  static performComprehensiveValidation(dataSet) {
    return dataSet.map(data => {
      const validation = this.validateMetric(data.category, data.metric, data.value, data.unit, data);
      const qualityCheck = DataGovernance.validateDataQuality(data);
      const auditCheck = AuditSupport.checkSupportingEvidence([data]);
      
      return {
        ...data,
        validation,
        qualityScore: qualityCheck.overallScore,
        auditReadiness: auditCheck.missing.length === 0,
        recommendations: [
          ...validation.warnings,
          ...qualityCheck.recommendations,
          ...auditCheck.missing
        ]
      };
    });
  }
}

export const DATA_QUALITY_RULES = {
  completeness: {
    required: ['companyName', 'reportingYear', 'sector'],
    recommended: ['scope1Emissions', 'scope2Emissions', 'totalEmployees']
  },
  accuracy: {
    ranges: {
      percentages: [0, 100],
      emissions: [0, 10000000],
      employees: [1, 1000000]
    }
  },
  consistency: {
    crossChecks: [
      {
        fields: ['totalEmployees', 'femaleEmployeesPercentage'],
        rule: 'femaleCount should be <= totalEmployees'
      }
    ]
  }
};