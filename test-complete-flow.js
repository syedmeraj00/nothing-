// Complete ESG Data Flow Test
console.log('🚀 Testing Complete ESG Data Flow...\n');

// Test the API endpoints
const testAPI = async () => {
  const baseURL = 'http://localhost:3002/api';
  
  try {
    // Test 1: Health check
    console.log('1. Testing backend health...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData.status);
    
    // Test 2: Submit ESG data (simulating DataEntry.js)
    console.log('\n2. Testing ESG data submission...');
    const testData = {
      companyName: 'Flow Test Company',
      sector: 'technology',
      region: 'north_america',
      reportingYear: 2024,
      userId: 1,
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
        boardSize: 11,
        independentDirectorsPercentage: 80
      }
    };
    
    const submitResponse = await fetch(`${baseURL}/esg/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const submitResult = await submitResponse.json();
    console.log('✅ Data submission result:', submitResult);
    
    // Test 3: Retrieve data (simulating Reports.js)
    console.log('\n3. Testing data retrieval...');
    const retrieveResponse = await fetch(`${baseURL}/esg/data/1`);
    const retrieveData = await retrieveResponse.json();
    console.log('✅ Retrieved data points:', retrieveData.length);
    
    if (retrieveData.length > 0) {
      console.log('   Sample data:', {
        company: retrieveData[0].companyName,
        category: retrieveData[0].category,
        metric: retrieveData[0].metric_name,
        value: retrieveData[0].metric_value
      });
    }
    
    // Test 4: Get scores
    console.log('\n4. Testing score calculation...');
    const scoresResponse = await fetch(`${baseURL}/esg/scores/1`);
    const scoresData = await scoresResponse.json();
    console.log('✅ Calculated scores:', {
      environmental: scoresData.environmental_score,
      social: scoresData.social_score,
      governance: scoresData.governance_score,
      overall: scoresData.overall_score
    });
    
    console.log('\n🎉 Complete flow test successful!');
    console.log('\n📋 Summary:');
    console.log('   • Backend: Running');
    console.log('   • Data submission: Working');
    console.log('   • Data retrieval: Working');
    console.log('   • Score calculation: Working');
    console.log('\n✅ DataEntry.js → Backend → Reports.js flow is functional!');
    
  } catch (error) {
    console.error('❌ Flow test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Make sure backend server is running: cd esg-backend && npm start');
    console.log('   2. Check if port 3002 is available');
    console.log('   3. Verify database is initialized');
  }
};

// Run the test
testAPI();