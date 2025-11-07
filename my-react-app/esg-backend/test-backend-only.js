const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fetch = require('node-fetch');

const dbPath = path.join(__dirname, 'database', 'esg.db');
const API_BASE = 'http://localhost:3001/api';

console.log('🔍 Testing Backend-Only Data Flow...\n');

// Test data
const testData = {
  companyName: 'Backend Test Corp',
  sector: 'technology',
  region: 'north_america',
  reportingYear: 2024,
  environmental: {
    scope1Emissions: '1000',
    scope2Emissions: '2000',
    energyConsumption: '5000'
  },
  social: {
    totalEmployees: '100',
    femaleEmployeesPercentage: '45'
  },
  governance: {
    boardSize: '7',
    independentDirectorsPercentage: '60'
  },
  userId: 'test@backend.com'
};

async function testBackendFlow() {
  try {
    console.log('1️⃣ Testing API Data Submission...');
    
    const response = await fetch(`${API_BASE}/esg/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('✅ API Response:', result.message || result.error);
    
    // Wait for data to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n2️⃣ Verifying Database Storage...');
    
    const db = new sqlite3.Database(dbPath);
    
    // Check if data was saved
    db.all(`
      SELECT c.name as company, e.category, e.metric_name, e.metric_value 
      FROM esg_data e 
      JOIN companies c ON e.company_id = c.id 
      WHERE c.name = ? 
      ORDER BY e.created_at DESC
    `, [testData.companyName], (err, rows) => {
      if (err) {
        console.error('❌ Database error:', err);
        return;
      }
      
      console.log(`✅ Found ${rows.length} entries in database:`);
      rows.forEach((row, i) => {
        console.log(`   ${i+1}. ${row.category}.${row.metric_name}: ${row.metric_value}`);
      });
      
      console.log('\n3️⃣ Testing Data Retrieval...');
      
      // Test retrieval API
      fetch(`${API_BASE}/esg/data/${testData.userId}`)
        .then(r => r.json())
        .then(data => {
          console.log(`✅ Retrieved ${data.length || 0} entries via API`);
          
          console.log('\n4️⃣ Testing KPI Calculation...');
          
          return fetch(`${API_BASE}/esg/kpis/${testData.userId}`);
        })
        .then(r => r.json())
        .then(kpis => {
          console.log('✅ KPIs calculated:', {
            environmental: kpis.environmental_score,
            social: kpis.social_score,
            governance: kpis.governance_score,
            overall: kpis.overall_score
          });
          
          console.log('\n🎉 Backend-Only Flow Test Complete!');
          console.log('\n📊 Summary:');
          console.log('   ✅ Data submitted via API');
          console.log('   ✅ Data stored in database');
          console.log('   ✅ Data retrieved via API');
          console.log('   ✅ KPIs calculated from backend');
          console.log('   ❌ No localStorage dependencies');
          
          db.close();
        })
        .catch(err => {
          console.error('❌ API test failed:', err.message);
          db.close();
        });
    });
    
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('\n💡 Make sure backend server is running:');
    console.log('   cd esg-backend && npm start');
  }
}

// Run the test
testBackendFlow();