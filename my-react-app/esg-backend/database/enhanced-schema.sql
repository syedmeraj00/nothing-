-- Enhanced ESG Database Schema - Phase 1
-- Optimized for performance and compliance

-- Emissions tracking with GHG Protocol compliance
CREATE TABLE IF NOT EXISTS emissions_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    reporting_year INTEGER NOT NULL,
    scope INTEGER NOT NULL CHECK (scope IN (1, 2, 3)),
    emission_source VARCHAR(255) NOT NULL,
    co2_equivalent DECIMAL(15,4) NOT NULL,
    calculation_method VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'unverified',
    data_quality_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Supply chain assessments
CREATE TABLE IF NOT EXISTS supplier_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_category VARCHAR(100),
    assessment_date DATE NOT NULL,
    esg_score DECIMAL(5,2) CHECK (esg_score >= 0 AND esg_score <= 100),
    environmental_score DECIMAL(5,2),
    social_score DECIMAL(5,2),
    governance_score DECIMAL(5,2),
    risk_level VARCHAR(20) DEFAULT 'medium',
    scope3_emissions DECIMAL(15,4),
    audit_findings TEXT,
    created_by INTEGER NOT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Materiality assessments with double materiality
CREATE TABLE IF NOT EXISTS materiality_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    topic_id VARCHAR(100) NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    impact_materiality DECIMAL(3,1) CHECK (impact_materiality >= 1 AND impact_materiality <= 5),
    financial_materiality DECIMAL(3,1) CHECK (financial_materiality >= 1 AND financial_materiality <= 5),
    stakeholder_priority DECIMAL(3,1) CHECK (stakeholder_priority >= 1 AND stakeholder_priority <= 5),
    overall_score DECIMAL(3,1) GENERATED ALWAYS AS ((impact_materiality + financial_materiality + stakeholder_priority) / 3) STORED,
    assessment_year INTEGER NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Data lineage and audit trail
CREATE TABLE IF NOT EXISTS data_lineage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values TEXT,
    new_values TEXT,
    source_system VARCHAR(100),
    extraction_method VARCHAR(100),
    validation_status VARCHAR(50) DEFAULT 'pending',
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    hash_signature VARCHAR(64),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Compliance requirements tracking
CREATE TABLE IF NOT EXISTS compliance_requirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    framework VARCHAR(50) NOT NULL,
    requirement_code VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    mandatory BOOLEAN DEFAULT FALSE,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'pending',
    company_id INTEGER,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Data validation rules
CREATE TABLE IF NOT EXISTS validation_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    min_value DECIMAL(15,4),
    max_value DECIMAL(15,4),
    required_unit VARCHAR(50),
    validation_formula TEXT,
    error_message TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- XBRL taxonomy mapping
CREATE TABLE IF NOT EXISTS xbrl_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    framework VARCHAR(50) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    xbrl_tag VARCHAR(255) NOT NULL,
    namespace VARCHAR(255),
    data_type VARCHAR(50),
    active BOOLEAN DEFAULT TRUE
);

-- Insert default validation rules
INSERT OR IGNORE INTO validation_rules (metric_name, category, min_value, max_value, required_unit, error_message) VALUES
('scope1Emissions', 'environmental', 0, 10000000, 'tCO2e', 'Scope 1 emissions must be between 0 and 10M tCO2e'),
('scope2Emissions', 'environmental', 0, 10000000, 'tCO2e', 'Scope 2 emissions must be between 0 and 10M tCO2e'),
('scope3Emissions', 'environmental', 0, 50000000, 'tCO2e', 'Scope 3 emissions must be between 0 and 50M tCO2e'),
('femaleEmployeesPercentage', 'social', 0, 100, '%', 'Female employees percentage must be between 0 and 100'),
('independentDirectorsPercentage', 'governance', 0, 100, '%', 'Independent directors percentage must be between 0 and 100');

-- Insert default XBRL mappings for CSRD
INSERT OR IGNORE INTO xbrl_mappings (framework, metric_name, xbrl_tag, namespace, data_type) VALUES
('CSRD', 'scope1Emissions', 'esrs:DirectGHGEmissions', 'http://xbrl.efrag.org/taxonomy/2023-12-22/esrs', 'monetary'),
('CSRD', 'scope2Emissions', 'esrs:IndirectGHGEmissions', 'http://xbrl.efrag.org/taxonomy/2023-12-22/esrs', 'monetary'),
('CSRD', 'totalEmployees', 'esrs:TotalNumberOfEmployees', 'http://xbrl.efrag.org/taxonomy/2023-12-22/esrs', 'shares'),
('GRI', 'scope1Emissions', 'gri:GRI-305-1', 'http://www.globalreporting.org/taxonomy/2023', 'monetary');

-- Insert default compliance requirements
INSERT OR IGNORE INTO compliance_requirements (framework, requirement_code, description, mandatory, deadline) VALUES
('CSRD', 'ESRS-E1', 'Climate change disclosures', TRUE, '2025-01-01'),
('CSRD', 'ESRS-S1', 'Own workforce disclosures', TRUE, '2025-01-01'),
('CSRD', 'ESRS-G1', 'Business conduct disclosures', TRUE, '2025-01-01'),
('SEC', 'Climate-Rule', 'SEC Climate Disclosure Rule', TRUE, '2025-03-31');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_emissions_company_year ON emissions_data(company_id, reporting_year);
CREATE INDEX IF NOT EXISTS idx_materiality_company_year ON materiality_assessments(company_id, assessment_year);
CREATE INDEX IF NOT EXISTS idx_data_lineage_record ON data_lineage(record_id, table_name);
CREATE INDEX IF NOT EXISTS idx_supplier_company ON supplier_assessments(company_id, assessment_date);