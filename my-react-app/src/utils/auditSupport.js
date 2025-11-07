// Assurance & Audit Support Module
export class AuditSupport {
  static createEvidenceRepository(dataPoint, evidence) {
    return {
      id: Date.now().toString(),
      dataPointId: dataPoint.id,
      evidence: {
        sourceDocuments: evidence.sourceDocuments || [],
        calculations: evidence.calculations || [],
        approvals: evidence.approvals || [],
        thirdPartyVerification: evidence.thirdPartyVerification || null
      },
      metadata: {
        createdBy: evidence.createdBy,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        accessLevel: evidence.accessLevel || 'internal'
      },
      auditTrail: this.initializeAuditTrail(evidence.createdBy)
    };
  }

  static initializeAuditTrail(user) {
    return [{
      action: 'created',
      user,
      timestamp: new Date().toISOString(),
      details: 'Evidence repository created'
    }];
  }

  static logAuditEvent(repositoryId, action, user, details) {
    const repository = this.getEvidenceRepository(repositoryId);
    if (!repository) return null;

    const auditEvent = {
      action,
      user,
      timestamp: new Date().toISOString(),
      details,
      sessionId: this.generateSessionId()
    };

    repository.auditTrail.push(auditEvent);
    repository.metadata.lastUpdated = new Date().toISOString();
    
    this.saveEvidenceRepository(repository);
    return auditEvent;
  }

  static lockDataForAudit(dataId, auditorId, lockReason) {
    const lock = {
      dataId,
      auditorId,
      lockReason,
      lockedAt: new Date().toISOString(),
      status: 'locked',
      unlockConditions: ['audit_complete', 'auditor_release']
    };

    this.saveLock(dataId, lock);
    this.logAuditEvent(dataId, 'data_locked', auditorId, `Data locked for audit: ${lockReason}`);
    
    return lock;
  }

  static unlockDataAfterAudit(dataId, auditorId, auditResults) {
    const lock = this.getLock(dataId);
    if (!lock || lock.auditorId !== auditorId) {
      throw new Error('Unauthorized unlock attempt');
    }

    lock.status = 'unlocked';
    lock.unlockedAt = new Date().toISOString();
    lock.auditResults = auditResults;

    this.saveLock(dataId, lock);
    this.logAuditEvent(dataId, 'data_unlocked', auditorId, 'Data unlocked after audit completion');
    
    return lock;
  }

  static generateAuditReport(dataSet, auditorInfo) {
    const auditFindings = this.performAuditChecks(dataSet);
    
    return {
      auditId: Date.now().toString(),
      auditor: auditorInfo,
      scope: {
        dataPoints: dataSet.length,
        categories: [...new Set(dataSet.map(d => d.category))],
        timeframe: this.getTimeframe(dataSet)
      },
      findings: auditFindings,
      opinion: this.determineAuditOpinion(auditFindings),
      recommendations: this.generateRecommendations(auditFindings),
      assuranceLevel: auditorInfo.assuranceLevel || 'limited',
      completedAt: new Date().toISOString()
    };
  }

  static performAuditChecks(dataSet) {
    const findings = [];

    // Check data completeness
    const completenessCheck = this.checkDataCompleteness(dataSet);
    if (completenessCheck.issues.length > 0) {
      findings.push({
        type: 'completeness',
        severity: 'medium',
        description: 'Data completeness issues identified',
        details: completenessCheck.issues
      });
    }

    // Check calculation accuracy
    const accuracyCheck = this.checkCalculationAccuracy(dataSet);
    if (accuracyCheck.errors.length > 0) {
      findings.push({
        type: 'accuracy',
        severity: 'high',
        description: 'Calculation errors identified',
        details: accuracyCheck.errors
      });
    }

    // Check supporting evidence
    const evidenceCheck = this.checkSupportingEvidence(dataSet);
    if (evidenceCheck.missing.length > 0) {
      findings.push({
        type: 'evidence',
        severity: 'medium',
        description: 'Missing supporting evidence',
        details: evidenceCheck.missing
      });
    }

    // Check compliance with standards
    const complianceCheck = this.checkStandardsCompliance(dataSet);
    if (complianceCheck.violations.length > 0) {
      findings.push({
        type: 'compliance',
        severity: 'high',
        description: 'Standards compliance violations',
        details: complianceCheck.violations
      });
    }

    return findings;
  }

  static checkDataCompleteness(dataSet) {
    const requiredFields = ['companyName', 'category', 'metric', 'value', 'unit', 'timestamp'];
    const issues = [];

    dataSet.forEach((data, index) => {
      const missingFields = requiredFields.filter(field => !data[field]);
      if (missingFields.length > 0) {
        issues.push(`Record ${index + 1}: Missing fields - ${missingFields.join(', ')}`);
      }
    });

    return { issues };
  }

  static checkCalculationAccuracy(dataSet) {
    const errors = [];

    dataSet.forEach((data, index) => {
      // Check for calculation-based metrics
      if (data.metric?.toLowerCase().includes('intensity') || data.metric?.toLowerCase().includes('ratio')) {
        if (!data.calculationMethod) {
          errors.push(`Record ${index + 1}: Missing calculation method for ${data.metric}`);
        }
      }

      // Check for reasonable value ranges
      if (typeof data.value === 'number') {
        if (data.value < 0 && !this.canBeNegative(data.metric)) {
          errors.push(`Record ${index + 1}: Negative value for ${data.metric} may be incorrect`);
        }
      }
    });

    return { errors };
  }

  static checkSupportingEvidence(dataSet) {
    const missing = [];

    dataSet.forEach((data, index) => {
      const evidence = this.getEvidenceRepository(data.id);
      if (!evidence || evidence.evidence.sourceDocuments.length === 0) {
        missing.push(`Record ${index + 1}: No supporting documentation for ${data.metric}`);
      }
    });

    return { missing };
  }

  static checkStandardsCompliance(dataSet) {
    const violations = [];

    dataSet.forEach((data, index) => {
      // Check framework code format
      if (data.frameworkCode && !this.isValidFrameworkCode(data.frameworkCode)) {
        violations.push(`Record ${index + 1}: Invalid framework code format - ${data.frameworkCode}`);
      }

      // Check unit consistency
      if (!this.isUnitConsistent(data.metric, data.unit)) {
        violations.push(`Record ${index + 1}: Unit ${data.unit} inconsistent with metric ${data.metric}`);
      }
    });

    return { violations };
  }

  static determineAuditOpinion(findings) {
    const highSeverityCount = findings.filter(f => f.severity === 'high').length;
    const mediumSeverityCount = findings.filter(f => f.severity === 'medium').length;

    if (highSeverityCount === 0 && mediumSeverityCount === 0) {
      return 'unqualified'; // Clean opinion
    } else if (highSeverityCount === 0 && mediumSeverityCount <= 2) {
      return 'qualified'; // Opinion with exceptions
    } else if (highSeverityCount <= 2) {
      return 'adverse'; // Significant issues
    } else {
      return 'disclaimer'; // Unable to form opinion
    }
  }

  static generateRecommendations(findings) {
    const recommendations = [];

    findings.forEach(finding => {
      switch (finding.type) {
        case 'completeness':
          recommendations.push('Implement mandatory field validation before data submission');
          break;
        case 'accuracy':
          recommendations.push('Establish calculation review process and automated validation rules');
          break;
        case 'evidence':
          recommendations.push('Require supporting documentation upload for all data entries');
          break;
        case 'compliance':
          recommendations.push('Provide training on ESG reporting standards and framework requirements');
          break;
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  static grantAuditorAccess(auditorId, dataScope, permissions) {
    const access = {
      auditorId,
      dataScope,
      permissions,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      status: 'active'
    };

    this.saveAuditorAccess(auditorId, access);
    return access;
  }

  static revokeAuditorAccess(auditorId) {
    const access = this.getAuditorAccess(auditorId);
    if (access) {
      access.status = 'revoked';
      access.revokedAt = new Date().toISOString();
      this.saveAuditorAccess(auditorId, access);
    }
    return access;
  }

  // Helper methods
  static canBeNegative(metric) {
    const negativeAllowed = ['change', 'variance', 'difference', 'improvement'];
    return negativeAllowed.some(term => metric?.toLowerCase().includes(term));
  }

  static isValidFrameworkCode(code) {
    const patterns = [
      /^GRI-\d{3}-\d+$/, // GRI format
      /^[A-Z]{2}-[A-Z]{3}-\d{3}[a-z]\.\d+$/, // SASB format
      /^TCFD-[A-Z]+$/ // TCFD format
    ];
    return patterns.some(pattern => pattern.test(code));
  }

  static isUnitConsistent(metric, unit) {
    const consistencyRules = {
      emission: ['tCO2e', 'kgCO2e', 'tCO2'],
      energy: ['kWh', 'MWh', 'GWh', 'TJ'],
      water: ['m3', 'liters', 'gallons'],
      waste: ['tonnes', 'kg', 'lbs']
    };

    const metricType = Object.keys(consistencyRules).find(type => 
      metric?.toLowerCase().includes(type)
    );

    return metricType ? consistencyRules[metricType].includes(unit) : true;
  }

  static generateSessionId() {
    return Math.random().toString(36).substr(2, 9);
  }

  static getTimeframe(dataSet) {
    const dates = dataSet.map(d => new Date(d.timestamp)).sort();
    return {
      from: dates[0]?.toISOString(),
      to: dates[dates.length - 1]?.toISOString()
    };
  }

  // Storage methods (simplified for demo)
  static getEvidenceRepository(id) {
    return JSON.parse(localStorage.getItem(`evidence_${id}`) || 'null');
  }

  static saveEvidenceRepository(repository) {
    localStorage.setItem(`evidence_${repository.id}`, JSON.stringify(repository));
  }

  static getLock(dataId) {
    return JSON.parse(localStorage.getItem(`lock_${dataId}`) || 'null');
  }

  static saveLock(dataId, lock) {
    localStorage.setItem(`lock_${dataId}`, JSON.stringify(lock));
  }

  static getAuditorAccess(auditorId) {
    return JSON.parse(localStorage.getItem(`auditor_access_${auditorId}`) || 'null');
  }

  static saveAuditorAccess(auditorId, access) {
    localStorage.setItem(`auditor_access_${auditorId}`, JSON.stringify(access));
  }
}