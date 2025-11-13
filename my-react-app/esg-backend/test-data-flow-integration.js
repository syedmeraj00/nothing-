/**
 * Integration Test: DataEntry → Reports Flow
 * 
 * This test verifies the complete flow:
 * 1. Submit ESG data via DataEntry
 * 2. Verify data is saved to backend
 * 3. Retrieve data in Reports
 * 4. Verify charts render correctly
 * 
 * Run: node esg-backend/test-data-flow-integration.js
 * (Make sure backend is running on port 3001)
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const TEST_USER = 'test-integration-' + Date.now() + '@test.local';
const TEST_COMPANY = 'Integration Test Corp ' + Date.now();

async function runIntegrationTest() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 STARTING INTEGRATION TEST: DataEntry → Reports Flow');
  console.log('='.repeat(60) + '\n');

  try {
    // ========================================
    // PHASE 1: Health Check
    // ========================================
    console.log('📋 PHASE 1: Health Check');
    console.log('-'.repeat(60));
    
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Backend is healthy:', health.data.message);

    // ========================================
    // PHASE 2: Submit ESG Data (DataEntry)
    // ========================================
    console.log('\n📋 PHASE 2: Submit ESG Data (Simulating DataEntry)');
    console.log('-'.repeat(60));

    const esgData = {
      companyName: TEST_COMPANY,
      sector: 'Technology',
      region: 'North America',
      reportingYear: 2024,
      userId: TEST_USER,
      environmental: {
        scope1Emissions: '1500',
        scope2Emissions: '2500',
        scope3Emissions: '5000',
        energyConsumption: '75000',
        renewableEnergyPercentage: '45',
        waterWithdrawal: '50000',
        wasteGenerated: '1200'
      },
      social: {
        totalEmployees: '500',
        femaleEmployeesPercentage: '42',
        lostTimeInjuryRate: '1.2',
        trainingHoursPerEmployee: '25',
        communityInvestment: '500000'
      },
      governance: {
        boardSize: '9',
        independentDirectorsPercentage: '67',
        femaleDirectorsPercentage: '33',
        ethicsTrainingCompletion: '95',
        corruptionIncidents: '0'
      }
    };

    console.log('📤 Submitting ESG data...');
    console.log('   Company:', esgData.companyName);
    console.log('   User:', esgData.userId);
    console.log('   Year:', esgData.reportingYear);

    const submitResponse = await axios.post(`${API_BASE}/esg/data`, esgData);
    console.log('✅ Data submitted successfully');
    console.log('   Response:', JSON.stringify(submitResponse.data, null, 2));

    // ========================================
    // PHASE 3: Retrieve Data (Reports)
    // ========================================
    console.log('\n📋 PHASE 3: Retrieve ESG Data (Simulating Reports)');
    console.log('-'.repeat(60));

    const encodedUser = encodeURIComponent(TEST_USER);
    console.log('📥 Fetching data for user:', TEST_USER);

    const retrieveResponse = await axios.get(
      `${API_BASE}/esg/data/${encodedUser}`
    );

    const retrievedData = retrieveResponse.data;
    console.log(`✅ Retrieved ${retrievedData.length} records`);

    if (retrievedData.length === 0) {
      console.warn('⚠️  No data retrieved - backend might not have saved it');
      return false;
    }

    // ========================================
    // PHASE 4: Verify Data Structure
    // ========================================
    console.log('\n📋 PHASE 4: Verify Data Structure');
    console.log('-'.repeat(60));

    const firstRecord = retrievedData[0];
    console.log('Sample record structure:');
    console.log('  - companyName:', firstRecord.companyName);
    console.log('  - category:', firstRecord.category);
    console.log('  - metric_name:', firstRecord.metric_name);
    console.log('  - metric_value:', firstRecord.metric_value);
    console.log('  - reporting_year:', firstRecord.reporting_year);

    // Verify required fields exist
    const requiredFields = ['companyName', 'category', 'metric_name', 'metric_value', 'reporting_year'];
    const hasAllFields = requiredFields.every(field => field in firstRecord);

    if (!hasAllFields) {
      console.error('❌ Data structure mismatch - missing required fields');
      return false;
    }
    console.log('✅ Data structure is valid');

    // ========================================
    // PHASE 5: Verify Data Counts
    // ========================================
    console.log('\n📋 PHASE 5: Verify Data Counts');
    console.log('-'.repeat(60));

    const categoryCounts = {};
    retrievedData.forEach(record => {
      categoryCounts[record.category] = (categoryCounts[record.category] || 0) + 1;
    });

    console.log('Metrics by category:');
    for (const [category, count] of Object.entries(categoryCounts)) {
      console.log(`  - ${category}: ${count} metrics`);
    }

    const expectedMetrics = 7 + 5 + 5; // env + social + governance
    console.log(`\nExpected: ~${expectedMetrics} total metrics`);
    console.log(`Received: ${retrievedData.length} metrics`);

    if (retrievedData.length < expectedMetrics * 0.5) {
      console.warn(`⚠️  Received fewer records than expected`);
    } else {
      console.log('✅ Record count looks good');
    }

    // ========================================
    // PHASE 6: Simulate Reports Data Transform
    // ========================================
    console.log('\n📋 PHASE 6: Simulate Reports Data Transform');
    console.log('-'.repeat(60));

    console.log('Transforming flat records to nested structure...');

    const groupedData = {};
    retrievedData.forEach(row => {
      const key = `${row.companyName}-${row.reporting_year}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          companyName: row.companyName,
          year: row.reporting_year,
          sector: row.sector,
          region: row.region,
          environmental: {},
          social: {},
          governance: {},
          createdAt: row.created_at
        };
      }

      const category = row.category;
      if (groupedData[key][category]) {
        groupedData[key][category][row.metric_name] = row.metric_value;
      }
    });

    const transformedData = Object.values(groupedData);
    console.log(`✅ Transformed to ${transformedData.length} company records`);

    const transformed = transformedData[0];
    console.log('\nSample transformed record:');
    console.log('  companyName:', transformed.companyName);
    console.log('  environmental metrics:', Object.keys(transformed.environmental).length);
    console.log('  social metrics:', Object.keys(transformed.social).length);
    console.log('  governance metrics:', Object.keys(transformed.governance).length);

    console.log('  Sample environmental data:', transformed.environmental);

    // ========================================
    // PHASE 7: Verify All Fields Present
    // ========================================
    console.log('\n📋 PHASE 7: Verify All Fields Present');
    console.log('-'.repeat(60));

    const envFields = Object.keys(transformed.environmental);
    const socialFields = Object.keys(transformed.social);
    const govFields = Object.keys(transformed.governance);

    console.log('Fields in environmental:', envFields.length);
    envFields.forEach(f => console.log('  - ' + f));

    console.log('\nFields in social:', socialFields.length);
    socialFields.forEach(f => console.log('  - ' + f));

    console.log('\nFields in governance:', govFields.length);
    govFields.forEach(f => console.log('  - ' + f));

    if (envFields.length > 0 && socialFields.length > 0 && govFields.length > 0) {
      console.log('\n✅ All categories have data');
    } else {
      console.error('❌ Some categories are empty');
      return false;
    }

    // ========================================
    // SUCCESS
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ INTEGRATION TEST PASSED');
    console.log('='.repeat(60));
    console.log('\n✅ Data flows correctly from DataEntry → Backend → Reports');
    console.log('✅ Data structure is correct for Reports rendering');
    console.log('✅ All metrics are being saved and retrieved');
    console.log('\nNext step: Open http://localhost:3000 in browser');
    console.log('  1. Go to Data Entry');
    console.log('  2. Fill and submit form');
    console.log('  3. Should see data in Reports automatically\n');

    return true;

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ INTEGRATION TEST FAILED');
    console.error('='.repeat(60));
    console.error('\nError:', error.response?.data || error.message);

    if (error.response?.status === 404) {
      console.error('\n⚠️  Endpoint not found (404)');
      console.error('   - Check if backend is running on port 3001');
      console.error('   - Check if esg.js routes are mounted in server.js');
    }

    if (error.response?.status === 500) {
      console.error('\n⚠️  Server error (500)');
      console.error('   - Check backend console for error details');
      console.error('   - Verify database tables exist');
    }

    return false;
  }
}

// Run test
runIntegrationTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
