export class IndustryBenchmarking {
  static benchmarks = {
    technology: {
      scope1Intensity: 2.5, scope2Intensity: 15.2, femalePercentage: 35,
      turnoverRate: 12, safetyRate: 0.8, boardDiversity: 28
    },
    manufacturing: {
      scope1Intensity: 45.8, scope2Intensity: 32.1, femalePercentage: 28,
      turnoverRate: 8, safetyRate: 3.2, boardDiversity: 22
    },
    financial: {
      scope1Intensity: 1.2, scope2Intensity: 8.9, femalePercentage: 42,
      turnoverRate: 15, safetyRate: 0.3, boardDiversity: 35
    },
    retail: {
      scope1Intensity: 12.3, scope2Intensity: 25.7, femalePercentage: 58,
      turnoverRate: 22, safetyRate: 2.1, boardDiversity: 31
    }
  };

  static compareToIndustry(companyData, sector = 'technology') {
    const benchmark = this.benchmarks[sector] || this.benchmarks.technology;
    const results = {};

    Object.entries(benchmark).forEach(([metric, industryValue]) => {
      const companyValue = companyData[metric] || 0;
      results[metric] = {
        company: companyValue,
        industry: industryValue,
        performance: this.getPerformanceRating(metric, companyValue, industryValue),
        percentile: this.calculatePercentile(metric, companyValue, industryValue)
      };
    });

    return {
      sector,
      overallScore: this.calculateOverallScore(results),
      metrics: results,
      recommendations: this.generateRecommendations(results)
    };
  }

  static getPerformanceRating(metric, company, industry) {
    const betterLower = ['scope1Intensity', 'scope2Intensity', 'turnoverRate', 'safetyRate'];
    const isLowerBetter = betterLower.includes(metric);
    
    const ratio = company / industry;
    
    if (isLowerBetter) {
      if (ratio <= 0.8) return 'excellent';
      if (ratio <= 0.95) return 'good';
      if (ratio <= 1.1) return 'average';
      return 'below_average';
    } else {
      if (ratio >= 1.2) return 'excellent';
      if (ratio >= 1.05) return 'good';
      if (ratio >= 0.9) return 'average';
      return 'below_average';
    }
  }

  static calculatePercentile(metric, company, industry) {
    const betterLower = ['scope1Intensity', 'scope2Intensity', 'turnoverRate', 'safetyRate'];
    const isLowerBetter = betterLower.includes(metric);
    
    const ratio = company / industry;
    
    if (isLowerBetter) {
      if (ratio <= 0.7) return 90;
      if (ratio <= 0.85) return 75;
      if (ratio <= 1.0) return 50;
      if (ratio <= 1.2) return 25;
      return 10;
    } else {
      if (ratio >= 1.3) return 90;
      if (ratio >= 1.15) return 75;
      if (ratio >= 1.0) return 50;
      if (ratio >= 0.85) return 25;
      return 10;
    }
  }

  static calculateOverallScore(results) {
    const scores = Object.values(results).map(r => r.percentile);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  static generateRecommendations(results) {
    const recommendations = [];
    
    Object.entries(results).forEach(([metric, data]) => {
      if (data.performance === 'below_average') {
        recommendations.push(this.getRecommendation(metric, data));
      }
    });

    return recommendations;
  }

  static getRecommendation(metric, data) {
    const recommendations = {
      scope1Intensity: 'Implement energy efficiency programs and switch to cleaner fuels',
      scope2Intensity: 'Increase renewable energy procurement and improve energy management',
      femalePercentage: 'Enhance diversity recruitment and inclusive workplace policies',
      turnoverRate: 'Improve employee engagement and retention programs',
      safetyRate: 'Strengthen safety training and workplace safety protocols',
      boardDiversity: 'Increase board diversity through targeted recruitment'
    };

    return {
      metric,
      priority: data.percentile < 25 ? 'high' : 'medium',
      action: recommendations[metric] || 'Review and improve performance',
      gap: Math.abs(data.company - data.industry)
    };
  }
}