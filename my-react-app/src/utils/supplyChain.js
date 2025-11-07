// Supply Chain ESG Module
export class SupplyChain {
  static assessSupplierESG(supplier) {
    const assessment = {
      environmental: this.assessEnvironmentalPerformance(supplier),
      social: this.assessSocialPerformance(supplier),
      governance: this.assessGovernancePerformance(supplier),
      overall: 0
    };
    
    assessment.overall = (assessment.environmental + assessment.social + assessment.governance) / 3;
    return assessment;
  }

  static assessEnvironmentalPerformance(supplier) {
    const metrics = {
      carbonFootprint: supplier.carbonFootprint || 0,
      wasteManagement: supplier.wasteManagement || 0,
      energyEfficiency: supplier.energyEfficiency || 0,
      certifications: supplier.environmentalCertifications?.length || 0
    };
    
    return Object.values(metrics).reduce((a, b) => a + b, 0) / 4;
  }

  static assessSocialPerformance(supplier) {
    const metrics = {
      laborStandards: supplier.laborStandards || 0,
      healthSafety: supplier.healthSafety || 0,
      humanRights: supplier.humanRights || 0,
      communityImpact: supplier.communityImpact || 0
    };
    
    return Object.values(metrics).reduce((a, b) => a + b, 0) / 4;
  }

  static assessGovernancePerformance(supplier) {
    const metrics = {
      transparency: supplier.transparency || 0,
      ethics: supplier.ethics || 0,
      compliance: supplier.compliance || 0,
      riskManagement: supplier.riskManagement || 0
    };
    
    return Object.values(metrics).reduce((a, b) => a + b, 0) / 4;
  }

  static calculateScope3Emissions(suppliers, purchaseData) {
    return suppliers.map(supplier => {
      const purchases = purchaseData.filter(p => p.supplierId === supplier.id);
      const totalSpend = purchases.reduce((sum, p) => sum + p.amount, 0);
      const emissionFactor = supplier.emissionFactor || 0.5; // kg CO2e per $
      
      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        totalSpend,
        estimatedEmissions: totalSpend * emissionFactor,
        category: supplier.category
      };
    });
  }

  static identifySupplyChainRisks(suppliers) {
    return suppliers.map(supplier => {
      const risks = [];
      
      if (supplier.esgScore < 60) risks.push('Low ESG Performance');
      if (supplier.location && this.isHighRiskCountry(supplier.location)) risks.push('Geographic Risk');
      if (!supplier.certifications?.length) risks.push('Lack of Certifications');
      if (supplier.auditDate && this.isAuditOverdue(supplier.auditDate)) risks.push('Overdue Audit');
      
      return {
        supplierId: supplier.id,
        supplierName: supplier.name,
        riskLevel: this.calculateRiskLevel(risks.length),
        risks,
        recommendedActions: this.getRecommendedActions(risks)
      };
    });
  }

  static isHighRiskCountry(country) {
    const highRiskCountries = ['Country1', 'Country2']; // Simplified
    return highRiskCountries.includes(country);
  }

  static isAuditOverdue(auditDate) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return new Date(auditDate) < oneYearAgo;
  }

  static calculateRiskLevel(riskCount) {
    if (riskCount >= 3) return 'High';
    if (riskCount >= 2) return 'Medium';
    return 'Low';
  }

  static getRecommendedActions(risks) {
    const actions = {
      'Low ESG Performance': 'Conduct ESG improvement program',
      'Geographic Risk': 'Increase monitoring and due diligence',
      'Lack of Certifications': 'Require relevant certifications',
      'Overdue Audit': 'Schedule immediate audit'
    };
    
    return risks.map(risk => actions[risk]).filter(Boolean);
  }
}