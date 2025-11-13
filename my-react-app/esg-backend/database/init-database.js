const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Initialize database with complete schema
const initializeDatabase = () => {
  const dbPath = path.join(__dirname, 'esg_complete.sqlite');
  const schemaPath = path.join(__dirname, 'schema.sql');
  
  // Read schema file
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Create database
  const db = new sqlite3.Database(dbPath);
  
  // Execute schema
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error creating database schema:', err);
    } else {
      console.log('✅ Database schema created successfully');
      console.log('📊 Tables created:');
      console.log('  - users (authentication)');
      console.log('  - companies (company data)');
      console.log('  - esg_data (main ESG metrics)');
      console.log('  - environmental_data (environmental metrics)');
      console.log('  - social_data (social metrics)');
      console.log('  - governance_data (governance metrics)');
      console.log('  - reports (generated reports)');
      console.log('  - compliance_documents (compliance tracking)');
      console.log('  - analytics_metrics (analytics data)');
      console.log('  - dashboard_kpis (dashboard metrics)');
      console.log('  - supply_chain_suppliers (supply chain ESG)');
      console.log('  - stakeholders (stakeholder management)');
      console.log('  - esg_risks (risk management)');
      console.log('  - audit_trail (audit logging)');
      console.log('  - framework_compliance (compliance tracking)');
      console.log('  - data_quality_metrics (data quality)');
      console.log('  - materiality_topics (materiality assessment)');
      console.log('  - esg_targets (targets and goals)');
    }
  });
  
  db.close();
};

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };