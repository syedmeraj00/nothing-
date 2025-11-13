const db = require('./database/db');

setTimeout(() => {
  console.log('\n=== DATABASE TABLES ===');
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Available tables:');
    tables.forEach(t => console.log('  -', t.name));

    console.log('\n=== REPORTS TABLE (if exists) ===');
    db.all('SELECT * FROM reports LIMIT 10', (err, rows) => {
      if (err) {
        console.log('❌ No reports table found');
      } else if (rows && rows.length > 0) {
        console.log('Found', rows.length, 'reports:');
        console.log(JSON.stringify(rows, null, 2));
      } else {
        console.log('⚠️ Reports table exists but is empty');
      }

      console.log('\n=== ALL TABLE SCHEMAS ===');
      db.all("SELECT sql FROM sqlite_master WHERE type='table' AND sql NOT NULL", (err, schemas) => {
        if (err) {
          console.error('Error:', err);
        } else {
          schemas.forEach(s => console.log(s.sql + ';\n'));
        }
        process.exit(0);
      });
    });
  });
}, 500);
