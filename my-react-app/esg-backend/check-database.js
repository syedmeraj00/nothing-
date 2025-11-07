const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'esg.db');

console.log('🔍 Checking ESG Database...');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }
  
  console.log('✅ Connected to SQLite database');
  
  // Check tables
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error getting tables:', err);
      return;
    }
    
    console.log('\n📋 Available Tables:');
    tables.forEach(table => console.log(`  - ${table.name}`));
    
    // Check ESG data
    db.all("SELECT COUNT(*) as count FROM esg_data", (err, result) => {
      if (err) {
        console.error('Error counting ESG data:', err);
      } else {
        console.log(`\n📊 Total ESG entries: ${result[0].count}`);
      }
      
      // Show recent entries
      db.all(`
        SELECT c.name as company, e.category, e.metric_name, e.metric_value, e.created_at
        FROM esg_data e 
        JOIN companies c ON e.company_id = c.id 
        ORDER BY e.created_at DESC 
        LIMIT 5
      `, (err, data) => {
        if (err) {
          console.error('Error getting recent data:', err);
        } else {
          console.log('\n🕒 Recent ESG Entries:');
          if (data.length === 0) {
            console.log('  No data found');
          } else {
            data.forEach((row, i) => {
              console.log(`  ${i+1}. ${row.company} - ${row.category}.${row.metric_name}: ${row.metric_value} (${row.created_at})`);
            });
          }
        }
        
        // Check companies
        db.all("SELECT * FROM companies ORDER BY created_at DESC LIMIT 3", (err, companies) => {
          if (err) {
            console.error('Error getting companies:', err);
          } else {
            console.log('\n🏢 Recent Companies:');
            if (companies.length === 0) {
              console.log('  No companies found');
            } else {
              companies.forEach((company, i) => {
                console.log(`  ${i+1}. ${company.name} (${company.sector}) - Created: ${company.created_at}`);
              });
            }
          }
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
            } else {
              console.log('\n✅ Database check complete');
            }
          });
        });
      });
    });
  });
});