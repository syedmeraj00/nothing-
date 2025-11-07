export class PredictiveAnalytics {
  static forecastEmissions(historicalData, years = 3) {
    if (historicalData.length < 2) return this.generateMockForecast(years);
    
    const trend = this.calculateTrend(historicalData);
    const forecast = [];
    
    const lastYear = Math.max(...historicalData.map(d => d.year));
    const lastValue = historicalData.find(d => d.year === lastYear)?.value || 0;
    
    for (let i = 1; i <= years; i++) {
      const projectedValue = lastValue * Math.pow(1 + trend, i);
      forecast.push({
        year: lastYear + i,
        value: Math.max(0, projectedValue),
        confidence: Math.max(0.5, 0.9 - (i * 0.1)),
        scenario: 'baseline'
      });
    }
    
    return forecast;
  }

  static calculateTrend(data) {
    const sortedData = data.sort((a, b) => a.year - b.year);
    if (sortedData.length < 2) return 0;
    
    const firstValue = sortedData[0].value;
    const lastValue = sortedData[sortedData.length - 1].value;
    const years = sortedData[sortedData.length - 1].year - sortedData[0].year;
    
    return years > 0 ? (lastValue - firstValue) / (firstValue * years) : 0;
  }

  static generateTargetTrajectory(currentValue, targetValue, targetYear, currentYear = new Date().getFullYear()) {
    const years = targetYear - currentYear;
    const annualReduction = (currentValue - targetValue) / years;
    const trajectory = [];
    
    for (let i = 0; i <= years; i++) {
      trajectory.push({
        year: currentYear + i,
        value: currentValue - (annualReduction * i),
        isTarget: i === years,
        reductionRequired: annualReduction
      });
    }
    
    return trajectory;
  }

  static assessTargetFeasibility(currentValue, targetValue, targetYear, historicalTrend) {
    const requiredReduction = (currentValue - targetValue) / currentValue;
    const years = targetYear - new Date().getFullYear();
    const requiredAnnualReduction = requiredReduction / years;
    
    const feasibility = {
      achievable: Math.abs(requiredAnnualReduction) <= 0.1,
      difficulty: this.getDifficultyLevel(requiredAnnualReduction),
      requiredAnnualReduction: requiredAnnualReduction * 100,
      historicalTrend: historicalTrend * 100,
      recommendations: []
    };
    
    if (!feasibility.achievable) {
      feasibility.recommendations.push('Consider extending target timeline');
      feasibility.recommendations.push('Implement aggressive reduction measures');
    }
    
    return feasibility;
  }

  static getDifficultyLevel(annualReduction) {
    const absReduction = Math.abs(annualReduction);
    if (absReduction <= 0.03) return 'easy';
    if (absReduction <= 0.06) return 'moderate';
    if (absReduction <= 0.1) return 'challenging';
    return 'very_difficult';
  }

  static generateMockForecast(years) {
    const baseValue = 10000;
    const forecast = [];
    
    for (let i = 1; i <= years; i++) {
      forecast.push({
        year: new Date().getFullYear() + i,
        value: baseValue * Math.pow(0.95, i), // 5% annual reduction
        confidence: 0.8 - (i * 0.1),
        scenario: 'baseline'
      });
    }
    
    return forecast;
  }

  static calculateROI(investment, annualSavings, years = 5) {
    const totalSavings = annualSavings * years;
    const roi = ((totalSavings - investment) / investment) * 100;
    const paybackPeriod = investment / annualSavings;
    
    return {
      roi: Math.round(roi * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 100) / 100,
      totalSavings,
      netBenefit: totalSavings - investment
    };
  }
}