const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEnhancedModules() {
  console.log('🚀 Testing Enhanced ESG Modules\n');

  try {
    // Test Data Collection
    console.log('📊 Testing Data Collection Module...');
    await axios.post(`${BASE_URL}/data-collection/ingest/iot`, {
      sensorId: 'TEMP_001',
      dataType: 'temperature',
      value: 23.5,
      timestamp: new Date().toISOString()
    });
    console.log('✅ IoT Data Ingestion: SUCCESS');

    const esgRatings = await axios.post(`${BASE_URL}/data-collection/sources/esg-ratings`);
    console.log('✅ ESG Ratings Integration:', esgRatings.data);

    // Test Reporting
    console.log('\n📈 Testing Enhanced Reporting...');
    const tcfdReport = await axios.get(`${BASE_URL}/reporting/frameworks/TCFD`);
    console.log('✅ TCFD Framework:', tcfdReport.data);

    const liveData = await axios.get(`${BASE_URL}/reporting/dashboard/live`);
    console.log('✅ Live Dashboard:', liveData.data);

    // Test Risk Management
    console.log('\n⚠️ Testing Risk Management...');
    const climateRisk = await axios.post(`${BASE_URL}/risk-management/climate/assess`, {
      location: 'New York',
      assets: ['facility_1', 'facility_2'],
      timeHorizon: '2030'
    });
    console.log('✅ Climate Risk Assessment:', climateRisk.data.physicalRisks);

    const vendors = await axios.get(`${BASE_URL}/risk-management/supply-chain/vendors`);
    console.log('✅ Supply Chain Risk:', vendors.data.length, 'vendors assessed');

    // Test Stakeholder Engagement
    console.log('\n👥 Testing Stakeholder Engagement...');
    const materiality = await axios.post(`${BASE_URL}/stakeholders/materiality/survey`, {
      stakeholderType: 'investors',
      responses: { climate: 9, governance: 8, social: 7 }
    });
    console.log('✅ Materiality Assessment:', materiality.data.materialityMatrix.highPriority);

    const sbti = await axios.post(`${BASE_URL}/stakeholders/goals/science-based`, {
      companyId: 1,
      baseline: 2020,
      targetYear: 2030
    });
    console.log('✅ SBTi Goals:', sbti.data.status);

    // Test Enhanced Analytics
    console.log('\n🔍 Testing Enhanced Analytics...');
    const benchmark = await axios.get(`${BASE_URL}/analytics/benchmarking/technology`);
    console.log('✅ Peer Benchmarking:', benchmark.data.your_position);

    const insights = await axios.get(`${BASE_URL}/analytics/insights/ai`);
    console.log('✅ AI Insights:', insights.data.length, 'recommendations');

    // Test Workflow
    console.log('\n⚙️ Testing Workflow Management...');
    const workflow = await axios.post(`${BASE_URL}/workflow/approval/submit`, {
      dataId: 123,
      submittedBy: 'user@company.com',
      approvers: ['manager@company.com', 'director@company.com']
    });
    console.log('✅ Approval Workflow:', workflow.data.status);

    const tasks = await axios.get(`${BASE_URL}/workflow/tasks/dashboard`);
    console.log('✅ Task Dashboard:', tasks.data.length, 'tasks');

    console.log('\n🎉 ALL ENHANCED MODULES TESTED SUCCESSFULLY!');
    console.log('\n📋 New Capabilities Added:');
    console.log('• IoT Data Ingestion & Third-party ESG Ratings');
    console.log('• Multi-framework Reporting (SASB, TCFD, EU Taxonomy)');
    console.log('• Climate Risk Assessment & Supply Chain Monitoring');
    console.log('• Materiality Assessment & SBTi Integration');
    console.log('• Peer Benchmarking & AI-powered Insights');
    console.log('• Approval Workflows & Audit Trails');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnhancedModules();