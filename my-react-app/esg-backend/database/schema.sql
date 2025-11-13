-- ESG Application Database Schema
-- Complete SQL schema for all modules

-- Users and Authentication
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Companies
CREATE TABLE companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(100),
    region VARCHAR(100),
    reporting_year INTEGER,
    reporting_framework VARCHAR(50),
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ESG Data Entry
CREATE TABLE esg_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    user_id INTEGER,
    category VARCHAR(50) NOT NULL, -- environmental, social, governance
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,4),
    unit VARCHAR(50),
    framework_code VARCHAR(50),
    reporting_year INTEGER,
    data_source VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Environmental Data
CREATE TABLE environmental_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    scope1_emissions DECIMAL(15,4),
    scope2_emissions DECIMAL(15,4),
    scope3_emissions DECIMAL(15,4),
    energy_consumption DECIMAL(15,4),
    renewable_energy_percentage DECIMAL(5,2),
    water_withdrawal DECIMAL(15,4),
    waste_generated DECIMAL(15,4),
    reporting_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Social Data
CREATE TABLE social_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    total_employees INTEGER,
    female_employees_percentage DECIMAL(5,2),
    lost_time_injury_rate DECIMAL(8,4),
    training_hours_per_employee DECIMAL(8,2),
    community_investment DECIMAL(15,2),
    reporting_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Governance Data
CREATE TABLE governance_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    board_size INTEGER,
    independent_directors_percentage DECIMAL(5,2),
    female_directors_percentage DECIMAL(5,2),
    ethics_training_completion DECIMAL(5,2),
    corruption_incidents INTEGER,
    reporting_year INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Reports
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    user_id INTEGER,
    report_type VARCHAR(100), -- dashboard, compliance, analytics, custom
    report_name VARCHAR(255),
    report_data TEXT, -- JSON data
    framework VARCHAR(50),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Compliance Documents
CREATE TABLE compliance_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    user_id INTEGER,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    category VARCHAR(50), -- Environmental, Social, Governance
    priority VARCHAR(20), -- High, Medium, Low
    status VARCHAR(50), -- Pending Review, Under Review, Approved, Rejected
    file_path VARCHAR(500),
    due_date DATE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Analytics Data
CREATE TABLE analytics_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    metric_type VARCHAR(100), -- framework_compliance, risk_assessment, trend_analysis
    metric_name VARCHAR(255),
    metric_value DECIMAL(15,4),
    calculation_date DATE,
    framework VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Dashboard KPIs
CREATE TABLE dashboard_kpis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    overall_score DECIMAL(5,2),
    environmental_score DECIMAL(5,2),
    social_score DECIMAL(5,2),
    governance_score DECIMAL(5,2),
    compliance_rate DECIMAL(5,2),
    data_quality_score DECIMAL(5,2),
    total_entries INTEGER,
    calculation_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Supply Chain ESG
CREATE TABLE supply_chain_suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_category VARCHAR(100),
    country VARCHAR(100),
    esg_score DECIMAL(5,2),
    risk_level VARCHAR(20), -- Low, Medium, High
    certification_status VARCHAR(100),
    last_assessment_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Stakeholder Management
CREATE TABLE stakeholders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    stakeholder_name VARCHAR(255) NOT NULL,
    stakeholder_type VARCHAR(100), -- Investor, Customer, Employee, Community, Regulator
    engagement_level VARCHAR(50), -- High, Medium, Low
    influence_level VARCHAR(50), -- High, Medium, Low
    contact_info TEXT,
    last_engagement_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Risk Management
CREATE TABLE esg_risks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    risk_name VARCHAR(255) NOT NULL,
    risk_category VARCHAR(50), -- Environmental, Social, Governance
    risk_level VARCHAR(20), -- Low, Medium, High, Critical
    probability DECIMAL(3,2), -- 0.00 to 1.00
    impact_score INTEGER, -- 1 to 10
    mitigation_strategy TEXT,
    owner VARCHAR(255),
    status VARCHAR(50), -- Open, In Progress, Mitigated, Closed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Audit Trail
CREATE TABLE audit_trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100), -- CREATE, UPDATE, DELETE, VIEW, EXPORT
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Framework Compliance Tracking
CREATE TABLE framework_compliance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    framework VARCHAR(50), -- GRI, SASB, TCFD, CSRD
    standard_code VARCHAR(100), -- GRI-305-1, SASB-TC-SI-130a.1
    compliance_status VARCHAR(50), -- Compliant, Partial, Gap, Not Applicable
    coverage_percentage DECIMAL(5,2),
    last_updated DATE,
    notes TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Data Quality Metrics
CREATE TABLE data_quality_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    metric_type VARCHAR(100), -- completeness, accuracy, timeliness, consistency
    score DECIMAL(5,2),
    assessment_date DATE,
    details TEXT, -- JSON with specific quality checks
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Materiality Assessment
CREATE TABLE materiality_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    topic_name VARCHAR(255) NOT NULL,
    business_impact DECIMAL(3,2), -- 0.00 to 10.00
    stakeholder_concern DECIMAL(3,2), -- 0.00 to 10.00
    materiality_score DECIMAL(5,2),
    priority_level VARCHAR(20), -- High, Medium, Low
    framework_alignment VARCHAR(255), -- Which frameworks this topic relates to
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Targets and Goals
CREATE TABLE esg_targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER,
    target_name VARCHAR(255) NOT NULL,
    category VARCHAR(50), -- Environmental, Social, Governance
    target_value DECIMAL(15,4),
    current_value DECIMAL(15,4),
    unit VARCHAR(50),
    target_year INTEGER,
    baseline_year INTEGER,
    status VARCHAR(50), -- On Track, At Risk, Behind, Achieved
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Create indexes for better performance
CREATE INDEX idx_esg_data_company_category ON esg_data(company_id, category);
CREATE INDEX idx_esg_data_year ON esg_data(reporting_year);
CREATE INDEX idx_compliance_docs_status ON compliance_documents(status);
CREATE INDEX idx_audit_trail_user_date ON audit_trail(user_id, created_at);
CREATE INDEX idx_framework_compliance_company ON framework_compliance(company_id, framework);

-- Insert default admin user
INSERT INTO users (email, password_hash, role) VALUES 
('admin@esgenius.com', '$2b$10$hash', 'admin');

-- Insert sample company
INSERT INTO companies (name, sector, region, reporting_year, reporting_framework, created_by) VALUES 
('ESGenius Tech Solutions', 'technology', 'asia_pacific', 2024, 'GRI', 1);