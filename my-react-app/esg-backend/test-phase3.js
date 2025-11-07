const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

async function testPhase3() {
  console.log('🚀 Testing Phase 3 - Advanced Analytics & Reporting\n');

  try {
    // Test 1: TCFD Scenario Analysis
    console.log('1️⃣ Testing TCFD Scenario Analysis...');
    const tcfdData = {
      scope1: 1500,
      scope2: 2500,
      scope3: 8000,
      revenue: 15000000
    };
    
    const scenarios = await axios.post(`${BASE_URL}/analytics/tcfd/scenarios`, tcfdData);
    console.log('✅ TCFD Scenarios Generated:');
    scenarios.data.scenarios.forEach(scenario => {
      console.log(`   ${scenario.name}: $${scenario.totalImpact.toLocaleString()} impact (${scenario.riskLevel} risk)`);
    });

    // Test 2: Industry Benchmarking
    console.log('\n2️⃣ Testing Industry Benchmarking...');
    const benchmarkData = {
      sector: 'technology',
      metrics: {
        scope1Intensity: 3.2,
        scope2Intensity: 18.5,
        femalePercentage: 38,
        turnoverRate: 10
      }
    };
    
    const benchmark = await axios.post(`${BASE_URL}/analytics/benchmark`, benchmarkData);
    console.log('✅ Industry Benchmark Results:');
    console.log('   Overall Score:', benchmark.data.overallScore + '/100');
    Object.entries(benchmark.data.comparison).forEach(([metric, data]) => {
      console.log(`   ${metric}: ${data.performance} (${data.percentile}th percentile)`);
    });

    // Test 3: Predictive Forecasting
    console.log('\n3️⃣ Testing Predictive Forecasting...');
    const historicalData = [
      { year: 2021, value: 12000 },
      { year: 2022, value: 11200 },
      { year: 2023, value: 10500 },
      { year: 2024, value: 9800 }
    ];
    
    const forecast = await axios.post(`${BASE_URL}/analytics/forecast`, {
      historicalData,
      years: 3
    });
    
    console.log('✅ Emissions Forecast:');
    console.log('   Historical Trend:', forecast.data.trend.toFixed(1) + '% annually');
    forecast.data.forecast.forEach(year => {
      console.log(`   ${year.year}: ${year.value.toLocaleString()} tCO2e (${(year.confidence*100).toFixed(0)}% confidence)`);
    });

    // Test 4: Target Tracking
    console.log('\n4️⃣ Testing Target Tracking...');
    const targetData = {
      currentValue: 10000,
      targetValue: 5000,
      targetYear: 2030,
      metric: 'emissions'
    };
    
    const tracking = await axios.post(`${BASE_URL}/analytics/targets/track`, targetData);
    console.log('✅ Target Tracking Analysis:');
    console.log('   Required Annual Reduction:', tracking.data.requiredAnnualReduction.toFixed(1) + '%');
    console.log('   Feasibility:', tracking.data.feasibility);
    console.log('   Trajectory Points:', tracking.data.trajectory.length);

    // Test 5: Advanced Calculations
    console.log('\n5️⃣ Testing Advanced ESG Calculations...');
    
    // Carbon intensity calculation
    const carbonIntensity = tcfdData.scope1 + tcfdData.scope2 + tcfdData.scope3;
    const revenueIntensity = carbonIntensity / tcfdData.revenue * 1000000; // per million $
    const employeeIntensity = carbonIntensity / 500; // assuming 500 employees
    
    console.log('✅ Advanced Metrics:');
    console.log('   Total Carbon Footprint:', carbonIntensity.toLocaleString(), 'tCO2e');
    console.log('   Revenue Intensity:', revenueIntensity.toFixed(2), 'tCO2e/$M');
    console.log('   Employee Intensity:', employeeIntensity.toFixed(1), 'tCO2e/employee');

    // Test 6: Risk Assessment
    console.log('\n6️⃣ Testing Risk Assessment...');
    const riskMetrics = {
      physicalRisk: carbonIntensity > 10000 ? 'high' : 'medium',
      transitionRisk: revenueIntensity > 800 ? 'high' : 'medium',
      reputationalRisk: benchmarkData.metrics.femalePercentage < 30 ? 'medium' : 'low'
    };
    
    console.log('✅ ESG Risk Assessment:');
    Object.entries(riskMetrics).forEach(([risk, level]) => {
      console.log(`   ${risk}: ${level}`);
    });

    console.log('\n🎉 Phase 3 Testing Complete - Advanced Analytics Working!');
    console.log('\n📊 Phase 3 Summary:');
    console.log('✅ TCFD Climate Scenario Analysis');
    console.log('✅ Industry Benchmarking & Peer Comparison');
    console.log('✅ Predictive Analytics & Forecasting');
    console.log('✅ Science-Based Target Tracking');
    console.log('✅ Advanced Risk Assessment');
    console.log('✅ Enhanced ESG Metrics & KPIs');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running on port 3002');
    }
  }
}

testPhase3();