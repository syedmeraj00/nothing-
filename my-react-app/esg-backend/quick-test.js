const axios = require('axios');

async function quickTest() {
  try {
    console.log('Testing server health...');
    const health = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server is running:', health.data.message);
    
    console.log('\nTesting routes...');
    
    // Test if integrations route exists
    try {
      const status = await axios.get('http://localhost:3001/api/integrations/status');
      console.log('✅ Integrations route working:', status.data);
    } catch (error) {
      console.log('❌ Integrations route failed:', error.response?.status || error.code);
    }
    
    // Test compliance route
    try {
      const requirements = await axios.get('http://localhost:3001/api/compliance/requirements');
      console.log('✅ Compliance route working, found', requirements.data.length, 'requirements');
    } catch (error) {
      console.log('❌ Compliance route failed:', error.response?.status || error.code);
    }
    
  } catch (error) {
    console.log('❌ Server not running. Please start with: npm start');
    console.log('Error:', error.code);
  }
}

quickTest();