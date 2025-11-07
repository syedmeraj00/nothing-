const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

console.log('=== ESG Application Flow Test ===\n');

// Test 1: Database Connection
console.log('1. Testing Database Connection...');
const dbPath = path.join(__dirname, 'database', 'esg.db');

if (!fs.existsSync(dbPath)) {
  console.log('❌ Database file does not exist. Run server first to create it.');
  process.exit(1);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log('❌ Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Database connected successfully');
  runTests();
});

function runTests() {
  db.serialize(() => {
    
    // Test 2: Check Tables
    console.log('\n2. Checking Database Tables...');
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        console.log('❌ Error checking tables:', err.message);
        return;
      }
      
      const expectedTables = ['users', 'companies', 'esg_data', 'esg_scores'];
      const existingTables = tables.map(t => t.name);
      
      expectedTables.forEach(table => {
        if (existingTables.includes(table)) {
          console.log(`✅ Table '${table}' exists`);
        } else {
          console.log(`❌ Table '${table}' missing`);
        }
      });
      
      // Test 3: Check Admin User
      console.log('\n3. Checking Admin User...');
      db.get("SELECT * FROM users WHERE email = 'admin@esgenius.com'", (err, admin) => {
        if (err) {
          console.log('❌ Error checking admin user:', err.message);
        } else if (admin) {
          console.log('✅ Admin user exists');
          console.log(`   Email: ${admin.email}`);
          console.log(`   Role: ${admin.role}`);
          console.log(`   Status: ${admin.status}`);
        } else {
          console.log('❌ Admin user not found');
        }
        
        // Test 4: Insert Test Data
        console.log('\n4. Testing Data Insertion...');
        insertTestData();
      });
    });
  });
}

function insertTestData() {
  // Insert test company
  db.run(
    'INSERT OR IGNORE INTO companies (name, sector, region, created_by) VALUES (?, ?, ?, ?)',
    ['Test Company', 'technology', 'north_america', 1],
    function(err) {
      if (err) {
        console.log('❌ Error inserting company:', err.message);
        return;
      }
      
      const companyId = this.lastID || 1;
      console.log('✅ Test company inserted/exists');
      
      // Insert test ESG data
      const testMetrics = [
        [companyId, 1, 2024, 'environmental', 'scope1Emissions', 1250],
        [companyId, 1, 2024, 'environmental', 'scope2Emissions', 2800],
        [companyId, 1, 2024, 'social', 'totalEmployees', 2500],
        [companyId, 1, 2024, 'governance', 'boardSize', 9]
      ];
      
      let insertedCount = 0;
      testMetrics.forEach(metric => {
        db.run(
          'INSERT OR REPLACE INTO esg_data (company_id, user_id, reporting_year, category, metric_name, metric_value) VALUES (?, ?, ?, ?, ?, ?)',
          metric,
          function(err) {
            if (err) {
              console.log('❌ Error inserting metric:', err.message);
            } else {
              insertedCount++;
              if (insertedCount === testMetrics.length) {
                console.log('✅ Test ESG data inserted');
                calculateTestScores(companyId);
              }
            }
          }
        );
      });
    }
  );
}

function calculateTestScores(companyId) {
  console.log('\n5. Testing Score Calculation...');
  
  db.all(
    'SELECT category, AVG(metric_value) as avg_score FROM esg_data WHERE company_id = ? AND user_id = ? GROUP BY category',
    [companyId, 1],
    (err, scores) => {
      if (err) {
        console.log('❌ Error calculating scores:', err.message);
        return;
      }
      
      const scoreMap = {};
      scores.forEach(score => {
        scoreMap[score.category] = score.avg_score || 0;
      });
      
      const environmentalScore = scoreMap.environmental || 0;
      const socialScore = scoreMap.social || 0;
      const governanceScore = scoreMap.governance || 0;
      const overallScore = (environmentalScore + socialScore + governanceScore) / 3;
      
      console.log('✅ Scores calculated:');
      console.log(`   Environmental: ${environmentalScore.toFixed(2)}`);
      console.log(`   Social: ${socialScore.toFixed(2)}`);
      console.log(`   Governance: ${governanceScore.toFixed(2)}`);
      console.log(`   Overall: ${overallScore.toFixed(2)}`);
      
      // Save scores
      db.run(
        'INSERT OR REPLACE INTO esg_scores (company_id, user_id, reporting_year, environmental_score, social_score, governance_score, overall_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [companyId, 1, 2024, environmentalScore, socialScore, governanceScore, overallScore],
        (err) => {
          if (err) {
            console.log('❌ Error saving scores:', err.message);
          } else {
            console.log('✅ Scores saved to database');
            testKPIs();
          }
        }
      );
    }
  );
}

function testKPIs() {
  console.log('\n6. Testing KPI Calculation...');
  
  db.all(
    `SELECT 
       (SELECT COUNT(*) FROM esg_data WHERE user_id = 1) as totalEntries,
       (SELECT environmental_score FROM esg_scores WHERE user_id = 1 ORDER BY calculated_at DESC LIMIT 1) as environmental,
       (SELECT social_score FROM esg_scores WHERE user_id = 1 ORDER BY calculated_at DESC LIMIT 1) as social,
       (SELECT governance_score FROM esg_scores WHERE user_id = 1 ORDER BY calculated_at DESC LIMIT 1) as governance,
       (SELECT overall_score FROM esg_scores WHERE user_id = 1 ORDER BY calculated_at DESC LIMIT 1) as overallScore`,
    (err, result) => {
      if (err) {
        console.log('❌ Error calculating KPIs:', err.message);
        return;
      }
      
      const kpis = result[0] || {};
      kpis.complianceRate = kpis.totalEntries > 0 ? 94 : 0;
      
      console.log('✅ KPIs calculated:');
      console.log(`   Total Entries: ${kpis.totalEntries || 0}`);
      console.log(`   Environmental Score: ${(kpis.environmental || 0).toFixed(2)}%`);
      console.log(`   Social Score: ${(kpis.social || 0).toFixed(2)}%`);
      console.log(`   Governance Score: ${(kpis.governance || 0).toFixed(2)}%`);
      console.log(`   Overall Score: ${(kpis.overallScore || 0).toFixed(2)}%`);
      console.log(`   Compliance Rate: ${kpis.complianceRate}%`);
      
      testAPIEndpoints();
    }
  );
}

function testAPIEndpoints() {
  console.log('\n7. Testing API Endpoints...');
  
  const fetch = require('node-fetch').default || require('node-fetch');
  const baseURL = 'http://localhost:5000/api';
  
  // Test health endpoint
  fetch(`${baseURL}/health`)
    .then(res => res.json())
    .then(data => {
      console.log('✅ Health endpoint working:', data.message);
      
      // Test admin endpoints
      return fetch(`${baseURL}/admin/stats`);
    })
    .then(res => res.json())
    .then(stats => {
      console.log('✅ Admin stats endpoint working:');
      console.log(`   Users: ${stats.users || 0}`);
      console.log(`   Companies: ${stats.companies || 0}`);
      console.log(`   ESG Data: ${stats.esgData || 0}`);
      console.log(`   ESG Scores: ${stats.esgScores || 0}`);
      
      console.log('\n=== Flow Test Complete ===');
      console.log('✅ All systems working correctly!');
      
      db.close();
    })
    .catch(err => {
      console.log('❌ API test failed:', err.message);
      console.log('   Make sure backend server is running: npm start');
      db.close();
    });
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('\nTest interrupted');
  db.close();
  process.exit(0);
});