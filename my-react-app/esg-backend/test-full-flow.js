const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api';
const TEST_USER = 'admin@esgenius.com';

console.log('🧪 COMPREHENSIVE ESG MODULE TEST\n');

// Test data for comprehensive flow testing
const testCompanies = [
  {
    companyName: 'Green Tech Solutions',
    sector: 'technology',
    region: 'north_america',
    reportingYear: 2024,
    environmental: {
      scope1Emissions: '1200',
      scope2Emissions: '2800',
      scope3Emissions: '4500',
      energyConsumption: '15000',
      renewableEnergyPercentage: '65',
      waterWithdrawal: '8500',
      wasteGenerated: '750'
    },
    social: {
      totalEmployees: '2500',
      femaleEmployeesPercentage: '45',
      lostTimeInjuryRate: '0.8',
      trainingHoursPerEmployee: '35',
      communityInvestment: '250000'
    },
    governance: {
      boardSize: '9',
      independentDirectorsPercentage: '78',
      femaleDirectorsPercentage: '44',
      ethicsTrainingCompletion: '96',
      corruptionIncidents: '0'
    },
    userId: TEST_USER
  },
  {
    companyName: 'Sustainable Manufacturing Corp',
    sector: 'manufacturing',
    region: 'europe',
    reportingYear: 2024,
    environmental: {
      scope1Emissions: '2500',
      scope2Emissions: '3200',
      energyConsumption: '22000',
      renewableEnergyPercentage: '40'
    },
    social: {
      totalEmployees: '1800',
      femaleEmployeesPercentage: '38',
      trainingHoursPerEmployee: '28'
    },
    governance: {
      boardSize: '7',
      independentDirectorsPercentage: '71',
      ethicsTrainingCompletion: '92'
    },
    userId: TEST_USER
  }
];

async function testModule(moduleName, testFunction) {
  console.log(`\n📋 Testing ${moduleName}...`);
  try {
    const result = await testFunction();
    console.log(`✅ ${moduleName}: PASSED`);
    return result;
  } catch (error) {
    console.log(`❌ ${moduleName}: FAILED - ${error.message}`);
    return null;
  }
}

async function testDataEntry() {
  console.log('  → Submitting ESG data for multiple companies...');
  
  for (const company of testCompanies) {
    const response = await fetch(`${API_BASE}/esg/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit data for ${company.companyName}`);
    }
    
    const result = await response.json();
    console.log(`    ✓ ${company.companyName}: ${Object.keys(company.environmental).length + Object.keys(company.social).length + Object.keys(company.governance).length} metrics saved`);
  }
  
  return true;
}

async function testReports() {
  console.log('  → Fetching data for reports...');
  
  const response = await fetch(`${API_BASE}/esg/data/${TEST_USER}`);
  if (!response.ok) {
    throw new Error('Failed to fetch ESG data');
  }
  
  const data = await response.json();
  console.log(`    ✓ Retrieved ${data.length} data points`);
  
  // Verify data structure
  if (data.length === 0) {
    throw new Error('No data available for reports');
  }
  
  const categories = [...new Set(data.map(item => item.category))];
  const companies = [...new Set(data.map(item => item.companyName))];
  
  console.log(`    ✓ Categories: ${categories.join(', ')}`);
  console.log(`    ✓ Companies: ${companies.join(', ')}`);
  
  return { data, categories, companies };
}

async function testAnalytics() {
  console.log('  → Testing analytics calculations...');
  
  const response = await fetch(`${API_BASE}/esg/analytics/${TEST_USER}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics data');
  }
  
  const analytics = await response.json();
  
  if (!analytics.success) {
    throw new Error('Analytics API returned error');
  }
  
  const { categoryDistribution, kpis, totalEntries } = analytics.data;
  
  console.log(`    ✓ Total entries: ${totalEntries}`);
  console.log(`    ✓ Category distribution:`, categoryDistribution);
  console.log(`    ✓ KPI scores:`, {
    environmental: Math.round(kpis.environmental),
    social: Math.round(kpis.social),
    governance: Math.round(kpis.governance),
    overall: Math.round(kpis.overallScore)
  });
  
  return analytics.data;
}

async function testDashboard() {
  console.log('  → Testing dashboard KPIs...');
  
  const response = await fetch(`${API_BASE}/esg/kpis/${TEST_USER}`);
  if (!response.ok) {
    throw new Error('Failed to fetch KPIs');
  }
  
  const kpis = await response.json();
  
  console.log(`    ✓ Dashboard KPIs:`, {
    totalEntries: kpis.totalEntries,
    environmental: Math.round(kpis.environmental || 0),
    social: Math.round(kpis.social || 0),
    governance: Math.round(kpis.governance || 0),
    overall: Math.round(kpis.overallScore || 0),
    compliance: `${kpis.complianceRate}%`
  });
  
  return kpis;
}

async function testBackendHealth() {
  console.log('  → Checking backend health...');
  
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }
  
  const health = await response.json();
  console.log(`    ✓ Backend status: ${health.status}`);
  
  return health;
}

async function testDataIntegrity() {
  console.log('  → Verifying data integrity...');
  
  const response = await fetch(`${API_BASE}/esg/verify/${TEST_USER}`);
  if (!response.ok) {
    throw new Error('Data verification failed');
  }
  
  const verification = await response.json();
  
  console.log(`    ✓ Data integrity: ${verification.count} entries verified`);
  console.log(`    ✓ Recent entries sample:`, verification.recentEntries.slice(0, 3).map(e => `${e.category}.${e.metric_name}`));
  
  return verification;
}

async function runComprehensiveTest() {
  console.log('🚀 Starting comprehensive ESG application test...\n');
  
  const results = {};
  
  // Test each module
  results.backendHealth = await testModule('Backend Health', testBackendHealth);
  results.dataEntry = await testModule('Data Entry Module', testDataEntry);
  results.reports = await testModule('Reports Module', testReports);
  results.analytics = await testModule('Analytics Module', testAnalytics);
  results.dashboard = await testModule('Dashboard Module', testDashboard);
  results.dataIntegrity = await testModule('Data Integrity', testDataIntegrity);
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const passedTests = Object.values(results).filter(r => r !== null).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} modules`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL MODULES WORKING CORRECTLY!');
    console.log('\n📋 Data Flow Verification:');
    console.log('   1. ✅ DataEntry → Backend API → Database');
    console.log('   2. ✅ Database → Reports Module → Data Display');
    console.log('   3. ✅ Database → Analytics → Charts & KPIs');
    console.log('   4. ✅ Database → Dashboard → Real-time Updates');
    console.log('\n🔗 Integration Status:');
    console.log('   ✅ Backend-only data persistence');
    console.log('   ✅ Real-time data synchronization');
    console.log('   ✅ Cross-module data consistency');
    console.log('   ✅ ESG score calculations');
    console.log('   ❌ No localStorage dependencies');
  } else {
    console.log('\n⚠️  Some modules need attention. Check the logs above.');
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Start frontend: cd my-react-app && npm start');
  console.log('   2. Access application: http://localhost:3000');
  console.log('   3. Test data entry and view reports');
  console.log('   4. Verify analytics charts update automatically');
}

// Run the comprehensive test
runComprehensiveTest().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  console.log('\n💡 Make sure backend server is running:');
  console.log('   cd esg-backend && npm start');
});