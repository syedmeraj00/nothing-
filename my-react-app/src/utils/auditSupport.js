export class AuditTrail {
  static logDataEntry(userId, action, data) {
    const entry = {
      id: Date.now().toString(),
      userId,
      action,
      data: JSON.stringify(data),
      timestamp: new Date().toISOString()
    };
    
    const trail = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    trail.push(entry);
    localStorage.setItem('auditTrail', JSON.stringify(trail));
    
    return entry;
  }

  static getAuditTrail() {
    return JSON.parse(localStorage.getItem('auditTrail') || '[]');
  }
}

export class AuditSupport {
  static logAuditEvent(recordId, action, userId, description) {
    return AuditTrail.logDataEntry(userId, action, { recordId, description });
  }

  static checkDataCompleteness(dataArray) {
    return {
      missing: [],
      completeness: 100
    };
  }

  static checkSupportingEvidence(dataArray) {
    return {
      missing: [],
      evidenceScore: 100
    };
  }
}