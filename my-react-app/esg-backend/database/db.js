const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'esg.db');

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const enhancedSchemaPath = path.join(__dirname, 'enhanced-schema.sql');
  
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database initialized successfully');
      
      // Apply enhanced schema if exists
      if (fs.existsSync(enhancedSchemaPath)) {
        const enhancedSchema = fs.readFileSync(enhancedSchemaPath, 'utf8');
        db.exec(enhancedSchema, (err) => {
          if (err) {
            console.error('Error applying enhanced schema:', err);
          } else {
            console.log('Enhanced schema applied successfully');
          }
        });
      }
    }
  });
}

module.exports = db;