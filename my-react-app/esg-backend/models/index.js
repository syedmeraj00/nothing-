// Database Models for all ESG modules
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/esg_complete.sqlite');

class DatabaseManager {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
  }

  // Users
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      const { email, password_hash, role = 'user' } = userData;
      this.db.run(
        'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
        [email, password_hash, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Companies
  async createCompany(companyData) {
    return new Promise((resolve, reject) => {
      const { name, sector, region, reporting_year, reporting_framework, created_by } = companyData;
      this.db.run(
        'INSERT INTO companies (name, sector, region, reporting_year, reporting_framework, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [name, sector, region, reporting_year, reporting_framework, created_by],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // ESG Data
  async saveESGData(esgData) {
    return new Promise((resolve, reject) => {
      const { company_id, user_id, category, metric_name, metric_value, unit, framework_code, reporting_year } = esgData;
      this.db.run(
        'INSERT INTO esg_data (company_id, user_id, category, metric_name, metric_value, unit, framework_code, reporting_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [company_id, user_id, category, metric_name, metric_value, unit, framework_code, reporting_year],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Environmental Data
  async saveEnvironmentalData(envData) {
    return new Promise((resolve, reject) => {
      const { company_id, scope1_emissions, scope2_emissions, scope3_emissions, energy_consumption, renewable_energy_percentage, water_withdrawal, waste_generated, reporting_year } = envData;
      this.db.run(
        'INSERT INTO environmental_data (company_id, scope1_emissions, scope2_emissions, scope3_emissions, energy_consumption, renewable_energy_percentage, water_withdrawal, waste_generated, reporting_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [company_id, scope1_emissions, scope2_emissions, scope3_emissions, energy_consumption, renewable_energy_percentage, water_withdrawal, waste_generated, reporting_year],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Social Data
  async saveSocialData(socialData) {
    return new Promise((resolve, reject) => {
      const { company_id, total_employees, female_employees_percentage, lost_time_injury_rate, training_hours_per_employee, community_investment, reporting_year } = socialData;
      this.db.run(
        'INSERT INTO social_data (company_id, total_employees, female_employees_percentage, lost_time_injury_rate, training_hours_per_employee, community_investment, reporting_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [company_id, total_employees, female_employees_percentage, lost_time_injury_rate, training_hours_per_employee, community_investment, reporting_year],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Governance Data
  async saveGovernanceData(govData) {
    return new Promise((resolve, reject) => {
      const { company_id, board_size, independent_directors_percentage, female_directors_percentage, ethics_training_completion, corruption_incidents, reporting_year } = govData;
      this.db.run(
        'INSERT INTO governance_data (company_id, board_size, independent_directors_percentage, female_directors_percentage, ethics_training_completion, corruption_incidents, reporting_year) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [company_id, board_size, independent_directors_percentage, female_directors_percentage, ethics_training_completion, corruption_incidents, reporting_year],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Compliance Documents
  async saveComplianceDocument(docData) {
    return new Promise((resolve, reject) => {
      const { company_id, user_id, document_name, document_type, category, priority, status, due_date } = docData;
      this.db.run(
        'INSERT INTO compliance_documents (company_id, user_id, document_name, document_type, category, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [company_id, user_id, document_name, document_type, category, priority, status, due_date],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Reports
  async saveReport(reportData) {
    return new Promise((resolve, reject) => {
      const { company_id, user_id, report_type, report_name, report_data, framework } = reportData;
      this.db.run(
        'INSERT INTO reports (company_id, user_id, report_type, report_name, report_data, framework) VALUES (?, ?, ?, ?, ?, ?)',
        [company_id, user_id, report_type, report_name, JSON.stringify(report_data), framework],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Analytics
  async saveAnalyticsMetric(metricData) {
    return new Promise((resolve, reject) => {
      const { company_id, metric_type, metric_name, metric_value, framework } = metricData;
      this.db.run(
        'INSERT INTO analytics_metrics (company_id, metric_type, metric_name, metric_value, framework, calculation_date) VALUES (?, ?, ?, ?, ?, DATE("now"))',
        [company_id, metric_type, metric_name, metric_value, framework],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Dashboard KPIs
  async saveDashboardKPIs(kpiData) {
    return new Promise((resolve, reject) => {
      const { company_id, overall_score, environmental_score, social_score, governance_score, compliance_rate, data_quality_score, total_entries } = kpiData;
      this.db.run(
        'INSERT INTO dashboard_kpis (company_id, overall_score, environmental_score, social_score, governance_score, compliance_rate, data_quality_score, total_entries, calculation_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, DATE("now"))',
        [company_id, overall_score, environmental_score, social_score, governance_score, compliance_rate, data_quality_score, total_entries],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Get methods for all modules
  async getESGData(company_id) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM esg_data WHERE company_id = ? ORDER BY created_at DESC',
        [company_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getComplianceDocuments(company_id) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM compliance_documents WHERE company_id = ? ORDER BY uploaded_at DESC',
        [company_id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getDashboardKPIs(company_id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM dashboard_kpis WHERE company_id = ? ORDER BY calculation_date DESC LIMIT 1',
        [company_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseManager;