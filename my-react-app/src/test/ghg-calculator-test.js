import { GHGProtocolCalculator } from '../utils/ghgProtocolCalculator.js';

function testGHGCalculator() {
  console.log('🧮 Testing GHG Protocol Calculator\n');

  // Test Scope 1 Calculations
  console.log('1️⃣ Testing Scope 1 Emissions...');
  const scope1Data = {
    naturalGas: 10000, // m³
    diesel: 5000, // liters
    gasoline: 2000, // liters
    processEmissions: 100,
    fugitiveEmissions: 50
  };
  
  const scope1Result = GHGProtocolCalculator.calculateScope1(scope1Data);
  console.log('✅ Scope 1 Total:', scope1Result.total, 'tCO2e');
  console.log('   Fuel Combustion:', scope1Result.breakdown.fuelCombustion, 'tCO2e');
  console.log('   Process Emissions:', scope1Result.breakdown.processEmissions, 'tCO2e');

  // Test Scope 2 Calculations
  console.log('\n2️⃣ Testing Scope 2 Emissions...');
  const scope2Data = {
    electricityConsumption: 1000, // MWh
    steamConsumption: 200, // MWh
    coolingConsumption: 100, // MWh
    region: 'US'
  };
  
  const scope2Result = GHGProtocolCalculator.calculateScope2(scope2Data);
  console.log('✅ Scope 2 Total:', scope2Result.total, 'tCO2e');
  console.log('   Electricity:', scope2Result.breakdown.electricity, 'tCO2e');
  console.log('   Grid Factor:', scope2Result.gridFactor, 'tCO2e/MWh');

  // Test Scope 3 Calculations
  console.log('\n3️⃣ Testing Scope 3 Emissions...');
  const scope3Data = {
    purchasedGoods: 1000000, // $ spent
    businessTravel: 50000, // km
    employeeCommuting: 25000, // km
    wasteGenerated: 500 // tonnes
  };
  
  const scope3Result = GHGProtocolCalculator.calculateScope3(scope3Data);
  console.log('✅ Scope 3 Total:', scope3Result.total, 'tCO2e');
  console.log('   Categories Covered:', scope3Result.categories);
  console.log('   Business Travel:', scope3Result.breakdown.businessTravel, 'tCO2e');

  // Test Intensity Calculations
  console.log('\n4️⃣ Testing Intensity Metrics...');
  const totalEmissions = scope1Result.total + scope2Result.total + scope3Result.total;
  const intensityMetrics = {
    revenue: 10000000, // $10M
    employees: 500,
    production: 1000 // units
  };
  
  const intensities = GHGProtocolCalculator.calculateIntensity(totalEmissions, intensityMetrics);
  console.log('✅ Intensity Metrics:');
  console.log('   Revenue Intensity:', intensities.revenueIntensity, 'tCO2e/$');
  console.log('   Employee Intensity:', intensities.employeeIntensity, 'tCO2e/employee');
  console.log('   Production Intensity:', intensities.productionIntensity, 'tCO2e/unit');

  // Test Data Validation
  console.log('\n5️⃣ Testing Data Validation...');
  const validData = { scope1: 1000, scope2: 500, scope3: 2000 };
  const invalidData = { scope1: -100, scope2: 50000000, scope3: 0 };
  
  const validResult = GHGProtocolCalculator.validateGHGData(validData);
  const invalidResult = GHGProtocolCalculator.validateGHGData(invalidData);
  
  console.log('✅ Valid Data:', validResult.isValid ? '✅' : '❌', 'Total:', validResult.total, 'tCO2e');
  console.log('❌ Invalid Data:', invalidResult.isValid ? '✅' : '❌', 'Errors:', invalidResult.errors.length);
  
  console.log('\n🎯 GHG Calculator Testing Complete!');
  console.log('📊 Summary Results:');
  console.log(`   Total Emissions: ${totalEmissions.toFixed(2)} tCO2e`);
  console.log(`   Scope 1: ${scope1Result.total} tCO2e (${((scope1Result.total/totalEmissions)*100).toFixed(1)}%)`);
  console.log(`   Scope 2: ${scope2Result.total} tCO2e (${((scope2Result.total/totalEmissions)*100).toFixed(1)}%)`);
  console.log(`   Scope 3: ${scope3Result.total} tCO2e (${((scope3Result.total/totalEmissions)*100).toFixed(1)}%)`);
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  window.testGHGCalculator = testGHGCalculator;
} else {
  module.exports = { testGHGCalculator };
}

// Auto-run if called directly
if (typeof window === 'undefined' && require.main === module) {
  testGHGCalculator();
}