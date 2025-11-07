-- Enhanced ESG Integration Schema
-- Optimized tables for new features that integrate with existing ESG data

-- IoT Data Integration (links to existing esg_data)
CREATE TABLE IF NOT EXISTS iot_sensors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    sensor_id VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Third-party ESG Ratings (enhances esg_scores)
CREATE TABLE IF NOT EXISTS external_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    rating_agency VARCHAR(50) NOT NULL,
    rating_value VARCHAR(10),
    score DECIMAL(5,2),
    rating_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Risk Assessments (integrates with esg_data for risk metrics)
CREATE TABLE IF NOT EXISTS risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    risk_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20),
    impact_score DECIMAL(5,2),
    probability DECIMAL(3,2),
    mitigation_status VARCHAR(50) DEFAULT 'pending',
    assessment_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Stakeholder Goals (links to esg_scores for tracking)
CREATE TABLE IF NOT EXISTS esg_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    goal_type VARCHAR(50) NOT NULL,
    target_value DECIMAL(15,4),
    current_value DECIMAL(15,4) DEFAULT 0,
    target_date DATE,
    sbti_approved BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Workflow Approvals (integrates with esg_data status)
CREATE TABLE IF NOT EXISTS approval_workflows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    esg_data_id INTEGER NOT NULL,
    submitted_by INTEGER NOT NULL,
    current_approver INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    workflow_step INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY (esg_data_id) REFERENCES esg_data(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (current_approver) REFERENCES users(id)
);

-- Audit Trail (tracks all changes to esg_data)
CREATE TABLE IF NOT EXISTS audit_trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values TEXT,
    new_values TEXT,
    changed_by INTEGER NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_esg_data_company_year ON esg_data(company_id, reporting_year);
CREATE INDEX IF NOT EXISTS idx_external_ratings_company ON external_ratings(company_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_company ON risk_assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_record ON audit_trail(table_name, record_id);