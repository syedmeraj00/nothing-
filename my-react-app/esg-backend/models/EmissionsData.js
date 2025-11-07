const db = require('../database/db');

class EmissionsData {
  static async create(data) {
    const { companyId, reportingYear, scope, emissionSource, co2Equivalent, calculationMethod, createdBy } = data;
    
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO emissions_data 
        (company_id, reporting_year, scope, emission_source, co2_equivalent, calculation_method, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run([companyId, reportingYear, scope, emissionSource, co2Equivalent, calculationMethod, createdBy], 
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...data });
        });
      stmt.finalize();
    });
  }

  static async getByCompany(companyId, year = null) {
    return new Promise((resolve, reject) => {
      const query = year 
        ? 'SELECT * FROM emissions_data WHERE company_id = ? AND reporting_year = ? ORDER BY scope, emission_source'
        : 'SELECT * FROM emissions_data WHERE company_id = ? ORDER BY reporting_year DESC, scope';
      
      const params = year ? [companyId, year] : [companyId];
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async calculateTotalsByScope(companyId, year) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT scope, SUM(co2_equivalent) as total_emissions
        FROM emissions_data 
        WHERE company_id = ? AND reporting_year = ?
        GROUP BY scope
        ORDER BY scope
      `, [companyId, year], (err, rows) => {
        if (err) reject(err);
        else {
          const result = { scope1: 0, scope2: 0, scope3: 0 };
          rows.forEach(row => {
            result[`scope${row.scope}`] = row.total_emissions;
          });
          result.total = result.scope1 + result.scope2 + result.scope3;
          resolve(result);
        }
      });
    });
  }

  static async validateEmissionData(data) {
    const errors = [];
    
    if (!data.scope || ![1, 2, 3].includes(data.scope)) {
      errors.push('Scope must be 1, 2, or 3');
    }
    
    if (!data.co2Equivalent || data.co2Equivalent < 0) {
      errors.push('CO2 equivalent must be a positive number');
    }
    
    if (data.co2Equivalent > 10000000) {
      errors.push('CO2 equivalent seems unusually high');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}

module.exports = EmissionsData;