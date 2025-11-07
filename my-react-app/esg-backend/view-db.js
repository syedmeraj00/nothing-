const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'esg.db');
const db = new sqlite3.Database(dbPath);

console.log('=== ESG Database Contents ===\n');

// View all tables
db.serialize(() => {
  // Users table
  console.log('USERS TABLE:');
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) console.error(err);
    else console.table(rows);
    
    // Companies table
    console.log('\nCOMPANIES TABLE:');
    db.all("SELECT * FROM companies", (err, rows) => {
      if (err) console.error(err);
      else console.table(rows);
      
      // ESG Data table
      console.log('\nESG DATA TABLE:');
      db.all("SELECT * FROM esg_data LIMIT 10", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
        
        // ESG Scores table
        console.log('\nESG SCORES TABLE:');
        db.all("SELECT * FROM esg_scores", (err, rows) => {
          if (err) console.error(err);
          else console.table(rows);
          
          db.close();
        });
      });
    });
  });
});