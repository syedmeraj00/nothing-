const db = require('./database/db');

setTimeout(() => {
  console.log('\n' + '='.repeat(70));
  console.log('📊 DATA USED BY @REPORTS MODULE');
  console.log('='.repeat(70));

  const userId = 'admin@esgenius.com';
  console.log(`\n🔍 Querying for user: ${userId}\n`);

  // Query 1: ESG Data (what Reports.refreshData fetches)
  console.log('1️⃣  ESG_DATA for Reports (Raw metric rows):');
  console.log('-'.repeat(70));
  
  db.all(
    `SELECT c.name as companyName, c.sector, c.region, e.reporting_year, 
            e.category, e.metric_name, e.metric_value, e.created_at
     FROM esg_data e 
     JOIN companies c ON e.company_id = c.id 
     WHERE e.user_id = ? 
     ORDER BY e.reporting_year DESC, e.category, e.metric_name
     LIMIT 30`,
    [userId],
    (err, esgData) => {
      if (err) {
        console.error('❌ Error:', err);
        process.exit(1);
      }

      if (!esgData || esgData.length === 0) {
        console.log('⚠️  No ESG data found for user:', userId);
      } else {
        console.log(`✅ Found ${esgData.length} metric records\n`);
        
        // Group by company and year for display
        const grouped = {};
        esgData.forEach(row => {
          const key = `${row.companyName} (${row.reporting_year})`;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(row);
        });

        Object.entries(grouped).forEach(([key, rows]) => {
          console.log(`\n📍 ${key}:`);
          console.log(`   Sector: ${rows[0].sector || 'N/A'}, Region: ${rows[0].region || 'N/A'}`);
          
          // Group by category
          const byCategory = {};
          rows.forEach(r => {
            if (!byCategory[r.category]) byCategory[r.category] = [];
            byCategory[r.category].push(r);
          });

          Object.entries(byCategory).forEach(([cat, catRows]) => {
            console.log(`   ${cat.toUpperCase()}:`);
            catRows.forEach(r => {
              console.log(`     • ${r.metric_name}: ${r.metric_value}`);
            });
          });
        });
      }

      // Query 2: ESG Scores (aggregated)
      console.log('\n\n2️⃣  ESG_SCORES (Aggregated scores by company/year):');
      console.log('-'.repeat(70));
      
      db.all(
        `SELECT s.*, c.name as companyName
         FROM esg_scores s 
         JOIN companies c ON s.company_id = c.id 
         WHERE s.user_id = ? 
         ORDER BY s.reporting_year DESC
         LIMIT 10`,
        [userId],
        (err, scores) => {
          if (err) {
            console.error('❌ Error:', err);
            process.exit(1);
          }

          if (!scores || scores.length === 0) {
            console.log('⚠️  No ESG scores found');
          } else {
            console.log(`✅ Found ${scores.length} score records\n`);
            scores.forEach(s => {
              console.log(`📈 ${s.companyName} (${s.reporting_year}):`);
              console.log(`   Environmental: ${s.environmental_score}`);
              console.log(`   Social: ${s.social_score}`);
              console.log(`   Governance: ${s.governance_score}`);
              console.log(`   Overall: ${s.overall_score}\n`);
            });
          }

          // Query 3: Summary statistics
          console.log('\n3️⃣  SUMMARY STATISTICS FOR REPORTS:');
          console.log('-'.repeat(70));
          
          db.all(
            `SELECT 
               COUNT(DISTINCT c.id) as total_companies,
               COUNT(DISTINCT e.reporting_year) as total_years,
               COUNT(e.id) as total_metrics,
               GROUP_CONCAT(DISTINCT e.reporting_year) as years,
               GROUP_CONCAT(DISTINCT e.category) as categories
             FROM esg_data e 
             JOIN companies c ON e.company_id = c.id 
             WHERE e.user_id = ?`,
            [userId],
            (err, stats) => {
              if (err) {
                console.error('❌ Error:', err);
                process.exit(1);
              }

              if (stats && stats.length > 0) {
                const s = stats[0];
                console.log(`\n📊 Data Overview:`);
                console.log(`   Total Companies: ${s.total_companies}`);
                console.log(`   Total Years: ${s.total_years} (${s.years})`);
                console.log(`   Total Metrics: ${s.total_metrics}`);
                console.log(`   Categories: ${s.categories}`);
              }

              // Query 4: Emissions data (if available)
              console.log('\n\n4️⃣  EMISSIONS_DATA (Scope-based emissions):');
              console.log('-'.repeat(70));
              
              db.all(
                `SELECT e.*, c.name as companyName
                 FROM emissions_data e 
                 JOIN companies c ON e.company_id = c.id 
                 ORDER BY e.reporting_year DESC, e.scope
                 LIMIT 10`,
                (err, emissions) => {
                  if (err || !emissions || emissions.length === 0) {
                    console.log('⚠️  No emissions data found');
                  } else {
                    console.log(`✅ Found ${emissions.length} emissions records\n`);
                    emissions.forEach(e => {
                      console.log(`📊 ${e.companyName} (${e.reporting_year}) - Scope ${e.scope}:`);
                      console.log(`   Source: ${e.emission_source}`);
                      console.log(`   CO2 Equivalent: ${e.co2_equivalent}`);
                      console.log(`   Method: ${e.calculation_method}`);
                      console.log(`   Status: ${e.verification_status}\n`);
                    });
                  }

                  console.log('='.repeat(70));
                  console.log('✅ Data query complete!');
                  console.log('='.repeat(70));
                  process.exit(0);
                }
              );
            }
          );
        }
      );
    }
  );
}, 500);
