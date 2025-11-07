// Advanced Analytics & Calculations Module
export class ESGAnalytics {
  static calculateGHGEmissions(data) {
    const { scope1, scope2, scope3 } = data;
    return {
      totalEmissions: scope1 + scope2 + scope3,
      scope1,
      scope2,
      scope3,
      intensity: (scope1 + scope2 + scope3) / data.revenue
    };
  }

  static performScenarioAnalysis(baseData, scenarios) {
    return scenarios.map(scenario => ({
      name: scenario.name,
      projectedEmissions: baseData.emissions * scenario.factor,
      riskLevel: scenario.factor > 1.2 ? 'high' : 'medium',
      mitigationCost: baseData.emissions * scenario.costPerTonne
    }));
  }

  static calculateTrends(historicalData) {
    const sorted = historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));
    const trend = sorted.length > 1 ? 
      (sorted[sorted.length - 1].value - sorted[0].value) / sorted[0].value * 100 : 0;
    
    return {
      trend: trend.toFixed(2),
      direction: trend > 0 ? 'increasing' : 'decreasing',
      volatility: this.calculateVolatility(sorted)
    };
  }

  static calculateVolatility(data) {
    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2)) / values.length;
    return Math.sqrt(variance);
  }

  static benchmarkAgainstIndustry(companyData, industryAverage) {
    return {
      performance: companyData.value < industryAverage ? 'above_average' : 'below_average',
      percentile: ((industryAverage - companyData.value) / industryAverage * 100).toFixed(1),
      gap: Math.abs(companyData.value - industryAverage)
    };
  }
}