export class TCFDScenarioEngine {
  static generateScenarios(baseData) {
    const scenarios = {
      '1.5C': { tempIncrease: 1.5, carbonPrice: 130, transitionRisk: 'high' },
      '2C': { tempIncrease: 2.0, carbonPrice: 75, transitionRisk: 'medium' },
      '3C': { tempIncrease: 3.0, carbonPrice: 25, transitionRisk: 'low' }
    };

    return Object.entries(scenarios).map(([name, params]) => ({
      name,
      ...this.calculateScenarioImpact(baseData, params)
    }));
  }

  static calculateScenarioImpact(baseData, scenario) {
    const { scope1 = 0, scope2 = 0, scope3 = 0, revenue = 0 } = baseData;
    const totalEmissions = scope1 + scope2 + scope3;
    
    const carbonCost = totalEmissions * scenario.carbonPrice;
    const revenueImpact = revenue * this.getRevenueImpactFactor(scenario.tempIncrease);
    const adaptationCost = revenue * this.getAdaptationCostFactor(scenario.tempIncrease);
    
    return {
      carbonCost,
      revenueImpact,
      adaptationCost,
      totalFinancialImpact: carbonCost + Math.abs(revenueImpact) + adaptationCost,
      riskLevel: this.assessRiskLevel(carbonCost, revenue)
    };
  }

  static getRevenueImpactFactor(tempIncrease) {
    const factors = { 1.5: -0.02, 2.0: -0.05, 3.0: -0.12 };
    return factors[tempIncrease] || -0.05;
  }

  static getAdaptationCostFactor(tempIncrease) {
    const factors = { 1.5: 0.01, 2.0: 0.03, 3.0: 0.08 };
    return factors[tempIncrease] || 0.03;
  }

  static assessRiskLevel(impact, revenue) {
    const ratio = impact / revenue;
    if (ratio > 0.1) return 'critical';
    if (ratio > 0.05) return 'high';
    if (ratio > 0.02) return 'medium';
    return 'low';
  }
}