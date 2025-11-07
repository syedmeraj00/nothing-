const db = require('../database/db');
const crypto = require('crypto');

class AuditTrail {
  static async log(recordId, tableName, action, oldValues, newValues, userId, sourceSystem = 'manual') {
    const hash = this.generateHash(recordId + tableName + action + JSON.stringify(newValues));
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO data_lineage 
        (record_id, table_name, action, old_values, new_values, source_system, created_by, hash_signature)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([
        recordId, tableName, action, 
        JSON.stringify(oldValues), JSON.stringify(newValues),
        sourceSystem, userId, hash
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, hash });
      });
      stmt.finalize();
    });
  }

  static async getTrail(recordId, tableName = null) {
    return new Promise((resolve, reject) => {
      const query = tableName 
        ? 'SELECT * FROM data_lineage WHERE record_id = ? AND table_name = ? ORDER BY created_at DESC'
        : 'SELECT * FROM data_lineage WHERE record_id = ? ORDER BY created_at DESC';
      
      const params = tableName ? [recordId, tableName] : [recordId];
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows.map(row => ({
          ...row,
          old_values: row.old_values ? JSON.parse(row.old_values) : null,
          new_values: row.new_values ? JSON.parse(row.new_values) : null
        })));
      });
    });
  }

  static async validateIntegrity(recordId, tableName) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM data_lineage WHERE record_id = ? AND table_name = ? ORDER BY created_at',
        [recordId, tableName],
        (err, rows) => {
          if (err) reject(err);
          else {
            const isValid = rows.every(row => {
              const expectedHash = this.generateHash(
                row.record_id + row.table_name + row.action + row.new_values
              );
              return row.hash_signature === expectedHash;
            });
            resolve({ isValid, recordCount: rows.length });
          }
        }
      );
    });
  }

  static generateHash(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  static async getAuditSummary(companyId, startDate, endDate) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          table_name,
          action,
          COUNT(*) as count,
          DATE(created_at) as date
        FROM data_lineage dl
        JOIN users u ON dl.created_by = u.id
        JOIN companies c ON c.created_by = u.id
        WHERE c.id = ? AND DATE(dl.created_at) BETWEEN ? AND ?
        GROUP BY table_name, action, DATE(created_at)
        ORDER BY created_at DESC
      `, [companyId, startDate, endDate], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = AuditTrail;