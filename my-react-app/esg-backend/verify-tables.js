const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Verify all tables and data
const verifyDatabase = () => {
  const dbPath = path.join(__dirname, 'database/esg_complete.sqlite');
  const db = new sqlite3.Database(dbPath);
  
  console.log('🔍 Verifying Database Tables and Data\n');
  
  // Check all tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    console.log('📊 Available Tables:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.name}`);
    });
    
    console.log('\n📈 Data in Each Table:');
    
    // Check data in each table
    const checkTable = (tableName) => {
      return new Promise((resolve) => {
        db.all(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
          if (err) {
            console.log(`   ❌ ${tableName}: Error - ${err.message}`);
          } else {
            const count = result[0].count;
            console.log(`   ${count > 0 ? '✅' : '⚪'} ${tableName}: ${count} records`);
          }
          resolve();
        });
      });
    };
    
    // Check all tables
    Promise.all(tables.map(table => checkTable(table.name))).then(() => {
      
      // Show sample data from key tables
      console.log('\n📋 Sample Data:');
      
      // Companies
      db.all('SELECT * FROM companies LIMIT 3', (err, companies) => {
        if (!err && companies.length > 0) {
          console.log('\n🏢 Companies:');
          companies.forEach(company => {
            console.log(`   - ${company.name} (${company.sector}, ${company.region})`);
          });
        }
        
        // ESG Data
        db.all('SELECT * FROM esg_data LIMIT 5', (err, esgData) => {
          if (!err && esgData.length > 0) {
            console.log('\n📊 ESG Data:');
            esgData.forEach(data => {
              console.log(`   - ${data.category}.${data.metric_name}: ${data.metric_value}`);
            });
          }
          
          // Environmental Data
          db.all('SELECT * FROM environmental_data LIMIT 3', (err, envData) => {
            if (!err && envData.length > 0) {
              console.log('\n🌱 Environmental Data:');
              envData.forEach(data => {
                console.log(`   - Scope 1: ${data.scope1_emissions}, Scope 2: ${data.scope2_emissions}`);
              });
            }
            
            // Social Data
            db.all('SELECT * FROM social_data LIMIT 3', (err, socialData) => {
              if (!err && socialData.length > 0) {
                console.log('\n👥 Social Data:');
                socialData.forEach(data => {
                  console.log(`   - Employees: ${data.total_employees}, Female %: ${data.female_employees_percentage}`);
                });
              }
              
              // Governance Data
              db.all('SELECT * FROM governance_data LIMIT 3', (err, govData) => {
                if (!err && govData.length > 0) {
                  console.log('\n⚖️ Governance Data:');
                  govData.forEach(data => {
                    console.log(`   - Board Size: ${data.board_size}, Independent %: ${data.independent_directors_percentage}`);
                  });
                }
                
                // Dashboard KPIs
                db.all('SELECT * FROM dashboard_kpis LIMIT 3', (err, kpis) => {
                  if (!err && kpis.length > 0) {
                    console.log('\n📈 Dashboard KPIs:');
                    kpis.forEach(kpi => {
                      console.log(`   - Overall: ${kpi.overall_score}, E: ${kpi.environmental_score}, S: ${kpi.social_score}, G: ${kpi.governance_score}`);
                    });
                  }
                  
                  // Compliance Documents
                  db.all('SELECT * FROM compliance_documents LIMIT 3', (err, docs) => {
                    if (!err && docs.length > 0) {
                      console.log('\n📋 Compliance Documents:');
                      docs.forEach(doc => {
                        console.log(`   - ${doc.document_name} (${doc.status})`);
                      });
                    }
                    
                    console.log('\n✅ Database verification complete!');
                    db.close();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// Run verification
if (require.main === module) {
  verifyDatabase();
}

module.exports = { verifyDatabase };