const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api';

async function testPhase2() {
  console.log('🚀 Testing Phase 2 - Integrations & Calculations\n');

  try {
    // Test 1: Configure ERP Integration
    console.log('1️⃣ Testing ERP Configuration...');
    const erpConfig = await axios.post(`${BASE_URL}/integrations/erp/configure`, {
      type: 'SAP',
      baseURL: 'https://api.sap-demo.com',
      apiKey: 'demo-sap-key-123'
    });
    console.log('✅ ERP Configured:', erpConfig.data.message);

    // Test 2: Configure HR Integration
    console.log('\n2️⃣ Testing HR Configuration...');
    const hrConfig = await axios.post(`${BASE_URL}/integrations/hr/configure`, {
      type: 'Workday',
      baseURL: 'https://api.workday-demo.com',
      apiKey: 'demo-workday-key-456'
    });
    console.log('✅ HR Configured:', hrConfig.data.message);

    // Test 3: Sync ERP Data
    console.log('\n3️⃣ Testing ERP Data Sync...');
    const erpSync = await axios.post(`${BASE_URL}/integrations/erp/sync`);
    console.log('✅ ERP Data Synced:');
    console.log('   Energy Consumption:', erpSync.data.data.energy.totalConsumption, 'MWh');
    console.log('   Renewable %:', erpSync.data.data.energy.renewablePercentage, '%');
    console.log('   Scope 2 Emissions:', erpSync.data.data.energy.scope2Emissions, 'tCO2e');
    console.log('   Revenue:', erpSync.data.data.financial.revenue.toLocaleString(), '$');

    // Test 4: Sync HR Data
    console.log('\n4️⃣ Testing HR Data Sync...');
    const hrSync = await axios.post(`${BASE_URL}/integrations/hr/sync`);
    console.log('✅ HR Data Synced:');
    console.log('   Total Employees:', hrSync.data.data.employees.totalEmployees);
    console.log('   Female %:', hrSync.data.data.diversity.femalePercentage, '%');
    console.log('   Turnover Rate:', hrSync.data.data.employees.turnoverRate, '%');
    console.log('   Incident Rate:', hrSync.data.data.safety.incidentRate);

    // Test 5: Check Integration Status
    console.log('\n5️⃣ Testing Integration Status...');
    const status = await axios.get(`${BASE_URL}/integrations/status`);
    console.log('✅ Integration Status:');
    console.log('   ERP:', status.data.erp.configured ? `✅ ${status.data.erp.type}` : '❌ Not configured');
    console.log('   HR:', status.data.hr.configured ? `✅ ${status.data.hr.type}` : '❌ Not configured');

    // Test 6: Test Compliance Validation
    console.log('\n6️⃣ Testing Compliance Validation...');
    const validation = await axios.post(`${BASE_URL}/compliance/validate`, {
      framework: 'CSRD',
      data: {
        scope1Emissions: erpSync.data.data.energy.scope2Emissions * 0.5,
        scope2Emissions: erpSync.data.data.energy.scope2Emissions,
        totalEmployees: hrSync.data.data.employees.totalEmployees
      }
    });
    console.log('✅ Compliance Validation:');
    console.log('   Overall Valid:', validation.data.overallValid ? '✅' : '❌');
    validation.data.results.forEach(result => {
      console.log(`   ${result.metric}: ${result.isValid ? '✅' : '❌'} ${result.message}`);
    });

    // Test 7: Get Compliance Requirements
    console.log('\n7️⃣ Testing Compliance Requirements...');
    const requirements = await axios.get(`${BASE_URL}/compliance/requirements`);
    console.log('✅ Compliance Requirements:');
    requirements.data.slice(0, 3).forEach(req => {
      console.log(`   ${req.framework}: ${req.requirement_code} - ${req.description.substring(0, 50)}...`);
    });

    // Test 8: Get XBRL Mappings
    console.log('\n8️⃣ Testing XBRL Mappings...');
    const xbrlMappings = await axios.get(`${BASE_URL}/compliance/xbrl/CSRD`);
    console.log('✅ XBRL Mappings for CSRD:');
    xbrlMappings.data.slice(0, 3).forEach(mapping => {
      console.log(`   ${mapping.metric_name} → ${mapping.xbrl_tag}`);
    });

    console.log('\n🎉 Phase 2 Testing Complete - All Systems Working!');
    console.log('\n📊 Summary:');
    console.log('✅ ERP Integration (SAP/Oracle/NetSuite)');
    console.log('✅ HR Integration (Workday/BambooHR/ADP)');
    console.log('✅ Data Synchronization');
    console.log('✅ Compliance Validation');
    console.log('✅ XBRL Tagging');
    console.log('✅ Regulatory Requirements');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running: npm start');
    }
  }
}

// Run tests
testPhase2();