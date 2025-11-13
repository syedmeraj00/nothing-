const db = require('./database/db');

setTimeout(() => {
  console.log('\n' + '='.repeat(70));
  console.log('🗑️  CLEARING ALL DATABASE DATA');
  console.log('='.repeat(70));

  // Disable foreign key constraints temporarily to allow deletion
  db.run('PRAGMA foreign_keys = OFF', (err) => {
    if (err) {
      console.error('❌ Error disabling foreign keys:', err);
      process.exit(1);
    }

    console.log('\n🔄 Deleting data from tables...\n');

    const tables = [
      'esg_data',
      'esg_scores',
      'emissions_data',
      'supplier_assessments',
      'materiality_assessments',
      'data_lineage',
      'compliance_requirements',
      'companies',
      'users'
    ];

    let completed = 0;

    tables.forEach(table => {
      db.run(`DELETE FROM ${table}`, (err) => {
        if (err) {
          console.warn(`⚠️  Could not clear ${table}:`, err.message);
        } else {
          console.log(`✅ Cleared: ${table}`);
        }
        completed++;

        if (completed === tables.length) {
          // Re-enable foreign keys
          db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
              console.error('❌ Error re-enabling foreign keys:', err);
            }

            console.log('\n' + '='.repeat(70));
            console.log('📊 VERIFICATION - Checking remaining data:');
            console.log('='.repeat(70) + '\n');

            // Verify deletions
            let verified = 0;
            tables.forEach(table => {
              db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
                const count = row ? row.count : 0;
                console.log(`  ${table}: ${count} records`);
                verified++;

                if (verified === tables.length) {
                  console.log('\n' + '='.repeat(70));
                  console.log('✅ Database cleared successfully!');
                  console.log('='.repeat(70) + '\n');
                  process.exit(0);
                }
              });
            });
          });
        }
      });
    });
  });
}, 500);
