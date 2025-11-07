export class DataQualityEngine {
  static validateData(data) {
    const score = this.calculateQualityScore(data);
    const issues = this.findIssues(data);
    
    return {
      overallScore: score,
      issues,
      isValid: score >= 70,
      recommendations: this.getRecommendations(issues)
    };
  }

  static calculateQualityScore(data) {
    let score = 100;
    
    // Completeness check
    if (!data.value) score -= 50;
    if (!data.unit) score -= 20;
    if (!data.source) score -= 15;
    if (!data.timestamp) score -= 15;
    
    return Math.max(0, score);
  }

  static findIssues(data) {
    const issues = [];
    
    if (!data.value) issues.push('Missing value');
    if (!data.unit) issues.push('Missing unit');
    if (data.value < 0 && !this.canBeNegative(data.metric)) {
      issues.push('Negative value not allowed');
    }
    
    return issues;
  }

  static canBeNegative(metric) {
    const negativeAllowed = ['change', 'variance', 'improvement'];
    return negativeAllowed.some(term => metric?.toLowerCase().includes(term));
  }

  static getRecommendations(issues) {
    return issues.map(issue => {
      switch(issue) {
        case 'Missing value': return 'Provide numeric value';
        case 'Missing unit': return 'Specify measurement unit';
        default: return 'Review data entry';
      }
    });
  }
}