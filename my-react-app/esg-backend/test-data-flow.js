const db = require('./database/db');

console.log('🔍 Testing ESG Data Flow...\n');

// Test 1: Check if admin user exists
console.log('1. Checking admin user...');
db.get('SELECT * FROM users WHERE email = ?', ['admin@esgenius.com'], (err, user) => {
  if (err) {
    console.error('❌ Error checking user:', err);
    return;
  }
  
  if (user) {
    console.log('✅ Admin user found:', { id: user.id, email: user.email, role: user.role });
    
    // Test 2: Insert test ESG data
    console.log('\n2. Testing ESG data insertion...');
    
    const testData = {
      companyName: 'Test Flow Company',
      sector: 'technology',
      region: 'north_america',
      reportingYear: 2024,
      userId: user.id,
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
    
    // Create or get company
    db.get('SELECT id FROM companies WHERE name = ? AND created_by = ?', 
      [testData.companyName, testData.userId], (err, company) => {
      
      let companyId = company?.id;
      
      const saveTestData = (companyId) => {
        const categories = { 
          environmental: testData.environmental, 
          social: testData.social, 
          governance: testData.governance 
        };
        
        let savedCount = 0;
        let totalMetrics = 0;
        
        // Count total metrics
        Object.values(categories).forEach(category => {
          if (category) {
            totalMetrics += Object.keys(category).length;
          }
        });
        
        console.log(`📊 Saving ${totalMetrics} metrics...`);
        
        // Save each metric
        Object.entries(categories).forEach(([categoryName, metrics]) => {
          if (metrics) {
            Object.entries(metrics).forEach(([metricName, value]) => {
              db.run(
                'INSERT OR REPLACE INTO esg_data (company_id, user_id, reporting_year, category, metric_name, metric_value) VALUES (?, ?, ?, ?, ?, ?)',
                [companyId, testData.userId, testData.reportingYear, categoryName, metricName, parseFloat(value)],
                function(err) {
                  if (err) {
                    console.error('❌ Error saving metric:', metricName, err);
                  } else {
                    console.log(`✅ Saved: ${categoryName}.${metricName} = ${value}`);
                  }
                  savedCount++;
                  
                  // Test 3: Retrieve data when all saved
                  if (savedCount === totalMetrics) {
                    console.log('\n3. Testing data retrieval...');
                    
                    db.all(
                      `SELECT c.name as companyName, c.sector, c.region, e.reporting_year, e.category, e.metric_name, e.metric_value, e.created_at
                       FROM esg_data e 
                       JOIN companies c ON e.company_id = c.id 
                       WHERE e.user_id = ? 
                       ORDER BY e.created_at DESC`,
                      [testData.userId],
                      (err, data) => {
                        if (err) {
                          console.error('❌ Error retrieving data:', err);
                        } else {
                          console.log(`✅ Retrieved ${data.length} data points:`);
                          data.forEach(item => {
                            console.log(`   - ${item.companyName}: ${item.category}.${item.metric_name} = ${item.metric_value}`);
                          });
                          
                          // Test 4: Calculate scores
                          console.log('\n4. Testing score calculation...');
                          
                          db.all(
                            'SELECT category, AVG(metric_value) as avg_score FROM esg_data WHERE company_id = ? AND user_id = ? AND reporting_year = ? GROUP BY category',
                            [companyId, testData.userId, testData.reportingYear],
                            (err, scores) => {
                              if (err) {
                                console.error('❌ Error calculating scores:', err);
                              } else {
                                console.log('✅ Calculated scores:');
                                const scoreMap = {};
                                scores.forEach(score => {
                                  scoreMap[score.category] = score.avg_score;
                                  console.log(`   - ${score.category}: ${score.avg_score.toFixed(2)}`);
                                });
                                
                                const overallScore = Object.values(scoreMap).reduce((a, b) => a + b, 0) / Object.keys(scoreMap).length;
                                console.log(`   - Overall: ${overallScore.toFixed(2)}`);
                                
                                console.log('\n🎉 Data flow test completed successfully!');
                                console.log('\n📋 Summary:');
                                console.log(`   • User ID: ${testData.userId}`);
                                console.log(`   • Company ID: ${companyId}`);
                                console.log(`   • Metrics saved: ${totalMetrics}`);
                                console.log(`   • Data points retrieved: ${data.length}`);
                                console.log(`   • Categories with scores: ${scores.length}`);
                                
                                process.exit(0);
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              );
            });
          }
        });
      };
      
      if (companyId) {
        console.log(`✅ Using existing company ID: ${companyId}`);
        saveTestData(companyId);
      } else {
        console.log('📝 Creating new company...');
        db.run(
          'INSERT INTO companies (name, sector, region, created_by) VALUES (?, ?, ?, ?)',
          [testData.companyName, testData.sector, testData.region, testData.userId],
          function(err) {
            if (err) {
              console.error('❌ Error creating company:', err);
              process.exit(1);
            } else {
              console.log(`✅ Created company with ID: ${this.lastID}`);
              saveTestData(this.lastID);
            }
          }
        );
      }
    });
    
  } else {
    console.log('❌ Admin user not found. Creating admin user...');
    
    db.run(
      'INSERT INTO users (email, password_hash, full_name, role, status, approved_at) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin@esgenius.com', '$2b$10$admin123hash', 'ESG Admin', 'admin', 'approved', new Date().toISOString()],
      function(err) {
        if (err) {
          console.error('❌ Error creating admin user:', err);
        } else {
          console.log(`✅ Created admin user with ID: ${this.lastID}`);
          console.log('🔄 Please run the test again to continue...');
        }
        process.exit(0);
      }
    );
  }
});