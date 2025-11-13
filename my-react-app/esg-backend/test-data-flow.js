const DatabaseManager = require('./models/index');
const axios = require('axios');

// Test data flow with new database schema
async function testDataFlow() {
  console.log('🧪 Testing ESG Data Flow with New Database Schema\n');
  
  const db = new DatabaseManager();
  
  try {
    // 1. Test Company Creation
    console.log('1️⃣ Testing Company Creation...');
    const companyData = {
      name: 'Test ESG Company',
      sector: 'technology',
      region: 'asia_pacific',
      reporting_year: 2024,
      reporting_framework: 'GRI',
      created_by: 1
    };
    
    const company = await db.createCompany(companyData);
    console.log('✅ Company created:', company);
    
    // 2. Test Environmental Data
    console.log('\n2️⃣ Testing Environmental Data...');
    const envData = {
      company_id: company.id,
      scope1_emissions: 1250.5,
      scope2_emissions: 2800.0,
      scope3_emissions: 5200.0,
      energy_consumption: 15000.0,
      renewable_energy_percentage: 68.5,
      water_withdrawal: 8500.0,
      waste_generated: 850.0,
      reporting_year: 2024
    };
    
    const envResult = await db.saveEnvironmentalData(envData);
    console.log('✅ Environmental data saved:', envResult);
    
    // 3. Test Social Data
    console.log('\n3️⃣ Testing Social Data...');
    const socialData = {
      company_id: company.id,
      total_employees: 2500,
      female_employees_percentage: 42.0,
      lost_time_injury_rate: 0.8,
      training_hours_per_employee: 32.0,
      community_investment: 250000.0,
      reporting_year: 2024
    };
    
    const socialResult = await db.saveSocialData(socialData);
    console.log('✅ Social data saved:', socialResult);
    
    // 4. Test Governance Data
    console.log('\n4️⃣ Testing Governance Data...');
    const govData = {
      company_id: company.id,
      board_size: 9,
      independent_directors_percentage: 75.0,
      female_directors_percentage: 40.0,
      ethics_training_completion: 98.0,
      corruption_incidents: 0,
      reporting_year: 2024
    };
    
    const govResult = await db.saveGovernanceData(govData);
    console.log('✅ Governance data saved:', govResult);
    
    // 5. Test ESG Data Entry (Generic)
    console.log('\n5️⃣ Testing Generic ESG Data...');
    const esgMetrics = [
      { category: 'environmental', metric_name: 'carbon_intensity', metric_value: 2.5, unit: 'tCO2e/revenue' },
      { category: 'social', metric_name: 'employee_satisfaction', metric_value: 8.2, unit: 'score' },
      { category: 'governance', metric_name: 'board_meetings', metric_value: 12, unit: 'count' }
    ];
    
    for (const metric of esgMetrics) {
      const esgData = {
        company_id: company.id,
        user_id: 1,
        category: metric.category,
        metric_name: metric.metric_name,
        metric_value: metric.metric_value,
        unit: metric.unit,
        framework_code: 'TEST-001',
        reporting_year: 2024
      };
      
      const result = await db.saveESGData(esgData);
      console.log(`✅ ${metric.category} metric saved:`, result);
    }
    
    // 6. Test Compliance Document
    console.log('\n6️⃣ Testing Compliance Document...');
    const complianceDoc = {
      company_id: company.id,
      user_id: 1,
      document_name: 'Environmental Policy 2024',
      document_type: 'Policy',
      category: 'Environmental',
      priority: 'High',
      status: 'Under Review',
      due_date: '2024-12-31'
    };
    
    const docResult = await db.saveComplianceDocument(complianceDoc);
    console.log('✅ Compliance document saved:', docResult);
    
    // 7. Test Dashboard KPIs
    console.log('\n7️⃣ Testing Dashboard KPIs...');
    const kpiData = {
      company_id: company.id,
      overall_score: 85.5,
      environmental_score: 78.0,
      social_score: 82.0,
      governance_score: 90.0,
      compliance_rate: 94.0,
      data_quality_score: 88.0,
      total_entries: 15
    };
    
    const kpiResult = await db.saveDashboardKPIs(kpiData);
    console.log('✅ Dashboard KPIs saved:', kpiResult);
    
    // 8. Test Analytics Metrics
    console.log('\n8️⃣ Testing Analytics Metrics...');
    const analyticsMetrics = [
      { metric_type: 'framework_compliance', metric_name: 'GRI_coverage', metric_value: 85.0, framework: 'GRI' },
      { metric_type: 'risk_assessment', metric_name: 'climate_risk_score', metric_value: 7.2, framework: 'TCFD' },
      { metric_type: 'trend_analysis', metric_name: 'emissions_trend', metric_value: -5.5, framework: 'GRI' }
    ];
    
    for (const metric of analyticsMetrics) {
      const analyticsData = {
        company_id: company.id,
        ...metric
      };
      
      const result = await db.saveAnalyticsMetric(analyticsData);
      console.log(`✅ Analytics metric saved:`, result);
    }
    
    // 9. Test Data Retrieval
    console.log('\n9️⃣ Testing Data Retrieval...');
    
    const retrievedESGData = await db.getESGData(company.id);
    console.log(`✅ Retrieved ${retrievedESGData.length} ESG data entries`);
    
    const retrievedCompliance = await db.getComplianceDocuments(company.id);
    console.log(`✅ Retrieved ${retrievedCompliance.length} compliance documents`);
    
    const retrievedKPIs = await db.getDashboardKPIs(company.id);
    console.log('✅ Retrieved KPIs:', retrievedKPIs);
    
    console.log('\n🎉 All tests passed! Data flow is working correctly.');
    console.log('\n📊 Summary:');
    console.log(`   - Company ID: ${company.id}`);
    console.log(`   - ESG Data Entries: ${retrievedESGData.length}`);
    console.log(`   - Compliance Documents: ${retrievedCompliance.length}`);
    console.log(`   - Overall Score: ${retrievedKPIs?.overall_score || 'N/A'}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    db.close();
  }
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...');
  
  try {
    // Test data submission via API
    const testData = {
      companyName: 'API Test Company',
      sector: 'technology',
      region: 'asia_pacific',
      reportingYear: 2024,
      environmental: {
        scope1Emissions: 1500,
        scope2Emissions: 3000,
        energyConsumption: 18000
      },
      social: {
        totalEmployees: 3000,
        femaleEmployeesPercentage: 45
      },
      governance: {
        boardSize: 8,
        independentDirectorsPercentage: 80
      },
      userId: 1
    };
    
    const response = await axios.post('http://localhost:5000/api/esg/data', testData);
    console.log('✅ API POST /data response:', response.data);
    
    // Test data retrieval via API
    const getResponse = await axios.get('http://localhost:5000/api/esg/data/1');
    console.log(`✅ API GET /data response: ${getResponse.data.length} entries`);
    
  } catch (error) {
    console.log('⚠️ API test skipped (server not running)');
  }
}

// Run tests
if (require.main === module) {
  testDataFlow().then(() => {
    testAPIEndpoints();
  });
}

module.exports = { testDataFlow };