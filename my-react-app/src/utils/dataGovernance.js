// Data Quality & Governance Module
export class DataGovernance {
  static validateDataQuality(data) {
    const checks = {
      completeness: this.checkCompleteness(data),
      accuracy: this.checkAccuracy(data),
      consistency: this.checkConsistency(data),
      timeliness: this.checkTimeliness(data),
      validity: this.checkValidity(data)
    };
    
    const overallScore = Object.values(checks).reduce((sum, check) => sum + check.score, 0) / 5;
    
    return {
      overallScore: Math.round(overallScore),
      checks,
      issues: this.identifyIssues(checks),
      recommendations: this.getRecommendations(checks)
    };
  }

  static checkCompleteness(data) {
    const requiredFields = ['companyName', 'category', 'metric', 'value', 'unit', 'timestamp'];
    const presentFields = requiredFields.filter(field => data[field] !== undefined && data[field] !== '');
    const score = (presentFields.length / requiredFields.length) * 100;
    
    return {
      score: Math.round(score),
      missingFields: requiredFields.filter(field => !presentFields.includes(field)),
      status: score >= 90 ? 'good' : score >= 70 ? 'acceptable' : 'poor'
    };
  }

  static checkAccuracy(data) {
    const checks = [];
    let score = 100;
    
    // Check for reasonable value ranges
    if (data.category === 'environmental' && data.metric?.toLowerCase().includes('emission')) {
      if (data.value < 0) {
        checks.push('Negative emission value detected');
        score -= 30;
      }
      if (data.value > 1000000) {
        checks.push('Unusually high emission value');
        score -= 20;
      }
    }
    
    // Check unit consistency
    if (data.metric?.toLowerCase().includes('emission') && !data.unit?.toLowerCase().includes('co2')) {
      checks.push('Unit may not match metric type');
      score -= 15;
    }
    
    return {
      score: Math.max(0, score),
      issues: checks,
      status: score >= 90 ? 'good' : score >= 70 ? 'acceptable' : 'poor'
    };
  }

  static checkConsistency(data) {
    // Check against historical data patterns
    const historicalData = this.getHistoricalData(data.companyName, data.metric);
    let score = 100;
    const issues = [];
    
    if (historicalData.length > 0) {
      const avgValue = historicalData.reduce((sum, d) => sum + d.value, 0) / historicalData.length;
      const deviation = Math.abs(data.value - avgValue) / avgValue;
      
      if (deviation > 0.5) {
        issues.push('Value deviates significantly from historical average');
        score -= 25;
      }
    }
    
    return {
      score,
      issues,
      status: score >= 90 ? 'good' : score >= 70 ? 'acceptable' : 'poor'
    };
  }

  static checkTimeliness(data) {
    const dataAge = Date.now() - new Date(data.timestamp).getTime();
    const daysOld = dataAge / (1000 * 60 * 60 * 24);
    
    let score = 100;
    const issues = [];
    
    if (daysOld > 90) {
      issues.push('Data is more than 90 days old');
      score -= 40;
    } else if (daysOld > 30) {
      issues.push('Data is more than 30 days old');
      score -= 20;
    }
    
    return {
      score,
      daysOld: Math.round(daysOld),
      issues,
      status: score >= 90 ? 'good' : score >= 70 ? 'acceptable' : 'poor'
    };
  }

  static checkValidity(data) {
    let score = 100;
    const issues = [];
    
    // Check data format validity
    if (typeof data.value !== 'number' || isNaN(data.value)) {
      issues.push('Invalid numeric value');
      score -= 50;
    }
    
    // Check category validity
    const validCategories = ['environmental', 'social', 'governance'];
    if (!validCategories.includes(data.category?.toLowerCase())) {
      issues.push('Invalid ESG category');
      score -= 30;
    }
    
    return {
      score,
      issues,
      status: score >= 90 ? 'good' : score >= 70 ? 'acceptable' : 'poor'
    };
  }

  static createApprovalWorkflow(data, approvers) {
    return {
      id: Date.now().toString(),
      data,
      status: 'pending',
      currentApprover: approvers[0],
      approvers,
      approvalHistory: [],
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
  }

  static processApproval(workflowId, approverId, decision, comments) {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) return null;
    
    const approval = {
      approverId,
      decision, // 'approved', 'rejected', 'needs_revision'
      comments,
      timestamp: new Date().toISOString()
    };
    
    workflow.approvalHistory.push(approval);
    
    if (decision === 'approved') {
      const currentIndex = workflow.approvers.indexOf(approverId);
      if (currentIndex < workflow.approvers.length - 1) {
        workflow.currentApprover = workflow.approvers[currentIndex + 1];
      } else {
        workflow.status = 'approved';
        workflow.currentApprover = null;
      }
    } else if (decision === 'rejected') {
      workflow.status = 'rejected';
      workflow.currentApprover = null;
    }
    
    return workflow;
  }

  static createVersionControl(data, user) {
    const existingVersions = this.getVersions(data.id) || [];
    const newVersion = {
      version: existingVersions.length + 1,
      data: { ...data },
      user,
      timestamp: new Date().toISOString(),
      changes: this.identifyChanges(existingVersions[existingVersions.length - 1]?.data, data)
    };
    
    existingVersions.push(newVersion);
    this.saveVersions(data.id, existingVersions);
    
    return newVersion;
  }

  static identifyChanges(oldData, newData) {
    if (!oldData) return ['Initial version'];
    
    const changes = [];
    Object.keys(newData).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes.push(`${key}: ${oldData[key]} → ${newData[key]}`);
      }
    });
    
    return changes;
  }

  static getHistoricalData(companyName, metric) {
    // Simulate historical data retrieval
    return [];
  }

  static getWorkflow(workflowId) {
    // Simulate workflow retrieval
    return null;
  }

  static getVersions(dataId) {
    // Simulate version retrieval
    return JSON.parse(localStorage.getItem(`versions_${dataId}`) || '[]');
  }

  static saveVersions(dataId, versions) {
    localStorage.setItem(`versions_${dataId}`, JSON.stringify(versions));
  }

  static identifyIssues(checks) {
    const issues = [];
    Object.entries(checks).forEach(([checkType, result]) => {
      if (result.status === 'poor') {
        issues.push(`${checkType}: ${result.issues?.join(', ') || 'Quality issues detected'}`);
      }
    });
    return issues;
  }

  static getRecommendations(checks) {
    const recommendations = [];
    Object.entries(checks).forEach(([checkType, result]) => {
      if (result.status !== 'good') {
        switch (checkType) {
          case 'completeness':
            recommendations.push('Complete all required fields before submission');
            break;
          case 'accuracy':
            recommendations.push('Verify data values and units for accuracy');
            break;
          case 'consistency':
            recommendations.push('Review data for consistency with historical patterns');
            break;
          case 'timeliness':
            recommendations.push('Update data more frequently to ensure timeliness');
            break;
          case 'validity':
            recommendations.push('Ensure data formats and categories are valid');
            break;
        }
      }
    });
    return recommendations;
  }
}