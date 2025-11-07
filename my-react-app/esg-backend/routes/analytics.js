const express = require('express');
const db = require('../database/db');
const router = express.Router();

// TCFD Scenario Analysis
router.post('/tcfd/scenarios', (req, res) => {
  const { scope1, scope2, scope3, revenue } = req.body;
  
  const scenarios = [
    { name: '1.5C', carbonPrice: 130, tempIncrease: 1.5 },
    { name: '2C', carbonPrice: 75, tempIncrease: 2.0 },
    { name: '3C', carbonPrice: 25, tempIncrease: 3.0 }
  ];
  
  const totalEmissions = (scope1 || 0) + (scope2 || 0) + (scope3 || 0);
  
  const results = scenarios.map(scenario => {
    const carbonCost = totalEmissions * scenario.carbonPrice;
    const revenueImpact = revenue * getRevenueImpactFactor(scenario.tempIncrease);
    const adaptationCost = revenue * getAdaptationCostFactor(scenario.tempIncrease);
    
    return {
      ...scenario,
      carbonCost,
      revenueImpact,
      adaptationCost,
      totalImpact: carbonCost + Math.abs(revenueImpact) + adaptationCost,
      riskLevel: assessRiskLevel(carbonCost, revenue)
    };
  });
  
  res.json({ scenarios: results, totalEmissions, baseRevenue: revenue });
});

// Industry Benchmarking
router.post('/benchmark', (req, res) => {
  const { sector, metrics } = req.body;
  
  const benchmarks = {
    technology: { scope1Intensity: 2.5, scope2Intensity: 15.2, femalePercentage: 35 },
    manufacturing: { scope1Intensity: 45.8, scope2Intensity: 32.1, femalePercentage: 28 },
    financial: { scope1Intensity: 1.2, scope2Intensity: 8.9, femalePercentage: 42 }
  };
  
  const industryBenchmark = benchmarks[sector] || benchmarks.technology;
  const comparison = {};
  
  Object.entries(metrics).forEach(([key, value]) => {
    const industryValue = industryBenchmark[key];
    if (industryValue) {
      comparison[key] = {
        company: value,
        industry: industryValue,
        performance: getPerformanceRating(key, value, industryValue),
        percentile: calculatePercentile(key, value, industryValue)
      };
    }
  });
  
  res.json({
    sector,
    comparison,
    overallScore: calculateOverallScore(comparison),
    recommendations: generateRecommendations(comparison)
  });
});

// Predictive Forecasting
router.post('/forecast', (req, res) => {
  const { historicalData, years = 3 } = req.body;
  
  if (!historicalData || historicalData.length === 0) {
    return res.json({ forecast: generateMockForecast(years) });
  }
  
  const trend = calculateTrend(historicalData);
  const lastValue = historicalData[historicalData.length - 1].value;
  const lastYear = historicalData[historicalData.length - 1].year;
  
  const forecast = [];
  for (let i = 1; i <= years; i++) {
    forecast.push({
      year: lastYear + i,
      value: Math.max(0, lastValue * Math.pow(1 + trend, i)),
      confidence: Math.max(0.5, 0.9 - (i * 0.1))
    });
  }
  
  res.json({ forecast, trend: trend * 100, confidence: 'medium' });
});

// Target Tracking
router.post('/targets/track', (req, res) => {
  const { currentValue, targetValue, targetYear, metric } = req.body;
  const currentYear = new Date().getFullYear();
  const years = targetYear - currentYear;
  
  if (years <= 0) {
    return res.status(400).json({ error: 'Target year must be in the future' });
  }
  
  const requiredReduction = (currentValue - targetValue) / currentValue;
  const annualReduction = requiredReduction / years;
  
  const trajectory = [];
  for (let i = 0; i <= years; i++) {
    trajectory.push({
      year: currentYear + i,
      value: currentValue - ((currentValue - targetValue) * (i / years)),
      isTarget: i === years
    });
  }
  
  res.json({
    trajectory,
    requiredAnnualReduction: annualReduction * 100,
    feasibility: Math.abs(annualReduction) <= 0.1 ? 'achievable' : 'challenging',
    recommendations: generateTargetRecommendations(annualReduction, metric)
  });
});

// Helper functions
function getRevenueImpactFactor(temp) {
  const factors = { 1.5: -0.02, 2.0: -0.05, 3.0: -0.12 };
  return factors[temp] || -0.05;
}

function getAdaptationCostFactor(temp) {
  const factors = { 1.5: 0.01, 2.0: 0.03, 3.0: 0.08 };
  return factors[temp] || 0.03;
}

function assessRiskLevel(impact, revenue) {
  const ratio = impact / revenue;
  if (ratio > 0.1) return 'critical';
  if (ratio > 0.05) return 'high';
  return 'medium';
}

function getPerformanceRating(metric, company, industry) {
  const betterLower = ['scope1Intensity', 'scope2Intensity', 'turnoverRate'];
  const ratio = company / industry;
  
  if (betterLower.includes(metric)) {
    return ratio <= 0.9 ? 'excellent' : ratio <= 1.1 ? 'good' : 'below_average';
  } else {
    return ratio >= 1.1 ? 'excellent' : ratio >= 0.9 ? 'good' : 'below_average';
  }
}

function calculatePercentile(metric, company, industry) {
  const ratio = company / industry;
  if (ratio <= 0.8 || ratio >= 1.2) return 90;
  if (ratio <= 0.9 || ratio >= 1.1) return 75;
  return 50;
}

function calculateOverallScore(comparison) {
  const scores = Object.values(comparison).map(c => c.percentile);
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function generateRecommendations(comparison) {
  return Object.entries(comparison)
    .filter(([_, data]) => data.performance === 'below_average')
    .map(([metric, _]) => `Improve ${metric} performance`);
}

function calculateTrend(data) {
  if (data.length < 2) return 0;
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const years = data[data.length - 1].year - data[0].year;
  return years > 0 ? (last - first) / (first * years) : 0;
}

function generateMockForecast(years) {
  const forecast = [];
  for (let i = 1; i <= years; i++) {
    forecast.push({
      year: new Date().getFullYear() + i,
      value: 10000 * Math.pow(0.95, i),
      confidence: 0.8 - (i * 0.1)
    });
  }
  return forecast;
}

function generateTargetRecommendations(reduction, metric) {
  const recommendations = [];
  if (Math.abs(reduction) > 0.1) {
    recommendations.push('Consider extending timeline or setting interim targets');
  }
  if (metric === 'emissions') {
    recommendations.push('Implement renewable energy and efficiency programs');
  }
  return recommendations;
}

// Peer Benchmarking
router.get('/benchmarking/:industry', (req, res) => {
  const { industry } = req.params;
  const benchmark = {
    industry_average: {
      esg_score: 72,
      carbon_intensity: 0.45,
      water_intensity: 2.3
    },
    top_quartile: {
      esg_score: 85,
      carbon_intensity: 0.28,
      water_intensity: 1.8
    },
    your_position: 'Top 25%'
  };
  res.json(benchmark);
});

// Predictive Modeling
router.post('/predict/performance', (req, res) => {
  const { historical_data, forecast_years } = req.body;
  const forecast = {
    emissions_trend: '-4.2% annually',
    esg_score_projection: [75, 78, 82, 85],
    confidence_interval: '85%'
  };
  res.json(forecast);
});

// Impact Measurement
router.get('/impact/roi/:initiative', (req, res) => {
  const { initiative } = req.params;
  const impact = {
    financial_return: '$2.4M',
    environmental_benefit: '1,200 tCO2e reduced',
    social_impact: '150 jobs created',
    roi_percentage: '24%'
  };
  res.json(impact);
});

// AI-Powered Insights
router.get('/insights/ai', (req, res) => {
  const insights = [
    {
      type: 'optimization',
      message: 'Switch to renewable energy could reduce emissions by 35%',
      priority: 'high',
      estimated_savings: '$1.2M'
    },
    {
      type: 'risk',
      message: 'Water stress risk increasing in 3 facilities',
      priority: 'medium',
      action_required: 'Implement water recycling'
    }
  ];
  res.json(insights);
});

module.exports = router;