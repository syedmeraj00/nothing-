// Materiality Assessment Module
export class MaterialityAssessment {
  static createStakeholderSurvey(stakeholderType) {
    const questions = {
      investor: [
        'How important is climate risk disclosure?',
        'Rate the significance of diversity metrics',
        'Importance of supply chain transparency'
      ],
      employee: [
        'How important is workplace safety?',
        'Rate the significance of career development',
        'Importance of work-life balance'
      ],
      customer: [
        'How important is product sustainability?',
        'Rate the significance of ethical sourcing',
        'Importance of data privacy'
      ]
    };
    return questions[stakeholderType] || questions.investor;
  }

  static calculateMaterialityScore(responses, weights = {}) {
    const defaultWeights = { investor: 0.4, employee: 0.3, customer: 0.3 };
    const finalWeights = { ...defaultWeights, ...weights };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(responses).forEach(([stakeholder, score]) => {
      if (finalWeights[stakeholder]) {
        totalScore += score * finalWeights[stakeholder];
        totalWeight += finalWeights[stakeholder];
      }
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  static generateMaterialityMatrix(issues) {
    return issues.map(issue => ({
      name: issue.name,
      financialMateriality: this.assessFinancialMateriality(issue),
      impactMateriality: this.assessImpactMateriality(issue),
      overallPriority: this.calculatePriority(issue)
    }));
  }

  static assessFinancialMateriality(issue) {
    const factors = {
      revenue_impact: issue.revenueImpact || 0,
      cost_impact: issue.costImpact || 0,
      regulatory_risk: issue.regulatoryRisk || 0
    };
    
    return Object.values(factors).reduce((a, b) => a + b, 0) / 3;
  }

  static assessImpactMateriality(issue) {
    const factors = {
      environmental_impact: issue.environmentalImpact || 0,
      social_impact: issue.socialImpact || 0,
      stakeholder_concern: issue.stakeholderConcern || 0
    };
    
    return Object.values(factors).reduce((a, b) => a + b, 0) / 3;
  }

  static calculatePriority(issue) {
    const financial = this.assessFinancialMateriality(issue);
    const impact = this.assessImpactMateriality(issue);
    return Math.sqrt(financial * financial + impact * impact);
  }

  static identifyMaterialTopics(matrix, threshold = 7) {
    return matrix
      .filter(item => item.overallPriority >= threshold)
      .sort((a, b) => b.overallPriority - a.overallPriority);
  }
}