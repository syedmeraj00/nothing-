// Enhanced ESG Frameworks and Standards
export const ESG_FRAMEWORKS = {
  TCFD: {
    name: 'Task Force on Climate-related Financial Disclosures',
    pillars: {
      governance: ['Board oversight', 'Management role'],
      strategy: ['Climate risks/opportunities', 'Business impact', 'Scenario analysis'],
      riskManagement: ['Risk identification', 'Risk assessment', 'Risk integration'],
      metricsTargets: ['Climate metrics', 'Scope 1-3 emissions', 'Climate targets']
    },
    requiredMetrics: ['scope1_emissions', 'scope2_emissions', 'scope3_emissions', 'climate_risk_assessment']
  },
  
  SASB: {
    name: 'Sustainability Accounting Standards Board',
    industries: {
      technology: ['Data Security', 'Employee Engagement', 'Intellectual Property'],
      healthcare: ['Product Safety', 'Access & Affordability', 'Data Privacy'],
      financials: ['Systemic Risk Management', 'Customer Privacy', 'Financial Inclusion']
    },
    requiredMetrics: ['industry_specific_kpis', 'materiality_assessment', 'stakeholder_engagement']
  },

  CDP: {
    name: 'Carbon Disclosure Project',
    categories: {
      climate: ['Governance', 'Risks & Opportunities', 'Business Strategy', 'Targets & Performance'],
      water: ['Water Accounting', 'Business Impact', 'Procedures & Performance'],
      forests: ['Timber Products', 'Palm Oil', 'Cattle Products', 'Soy']
    },
    scoring: { A: 'Leadership', B: 'Management', C: 'Awareness', D: 'Disclosure', F: 'No Data' }
  },

  EU_TAXONOMY: {
    name: 'EU Taxonomy Regulation',
    objectives: [
      'Climate change mitigation',
      'Climate change adaptation', 
      'Sustainable use of water',
      'Transition to circular economy',
      'Pollution prevention',
      'Biodiversity protection'
    ],
    criteria: ['substantial_contribution', 'dnsh_assessment', 'minimum_safeguards'],
    kpis: ['taxonomy_aligned_revenue', 'taxonomy_aligned_capex', 'taxonomy_aligned_opex']
  },

  CSRD: {
    name: 'Corporate Sustainability Reporting Directive',
    standards: ['ESRS E1-E5', 'ESRS S1-S4', 'ESRS G1-G2'],
    requirements: ['Double materiality', 'Value chain impact', 'Forward-looking information'],
    timeline: { 2024: 'Large companies', 2025: 'Listed SMEs', 2026: 'Non-EU companies' }
  }
};

export const INDUSTRY_BENCHMARKS = {
  technology: {
    environmental: { carbon_intensity: 0.12, renewable_energy: 78, water_efficiency: 85 },
    social: { diversity_ratio: 45, employee_satisfaction: 82, training_hours: 40 },
    governance: { board_independence: 85, ethics_score: 92, transparency: 88 }
  },
  manufacturing: {
    environmental: { carbon_intensity: 0.45, renewable_energy: 35, water_efficiency: 65 },
    social: { diversity_ratio: 32, employee_satisfaction: 75, training_hours: 32 },
    governance: { board_independence: 75, ethics_score: 85, transparency: 78 }
  },
  financial: {
    environmental: { carbon_intensity: 0.08, renewable_energy: 65, water_efficiency: 90 },
    social: { diversity_ratio: 48, employee_satisfaction: 88, training_hours: 45 },
    governance: { board_independence: 92, ethics_score: 95, transparency: 94 }
  }
};

export const AI_INSIGHTS_ENGINE = {
  generateInsights: (data, industry) => {
    const insights = [];
    const benchmarks = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.technology;
    
    // Carbon performance analysis
    if (data.carbon_emissions && benchmarks.environmental.carbon_intensity) {
      const performance = data.carbon_emissions / benchmarks.environmental.carbon_intensity;
      if (performance < 0.8) {
        insights.push({
          type: 'positive',
          category: 'Environmental',
          message: `Carbon intensity 20% below industry average - excellent performance`,
          impact: 'high',
          recommendation: 'Consider setting science-based targets to maintain leadership'
        });
      }
    }

    // Diversity analysis
    if (data.diversity_ratio && benchmarks.social.diversity_ratio) {
      const gap = data.diversity_ratio - benchmarks.social.diversity_ratio;
      if (gap < -5) {
        insights.push({
          type: 'improvement',
          category: 'Social',
          message: `Diversity ratio ${Math.abs(gap)}% below industry average`,
          impact: 'medium',
          recommendation: 'Implement targeted diversity and inclusion programs'
        });
      }
    }

    return insights;
  },

  predictTrends: (historicalData) => {
    // Simple trend analysis
    const trends = {};
    Object.keys(historicalData).forEach(metric => {
      const values = historicalData[metric];
      if (values.length >= 2) {
        const trend = values[values.length - 1] - values[values.length - 2];
        trends[metric] = {
          direction: trend > 0 ? 'increasing' : 'decreasing',
          magnitude: Math.abs(trend),
          confidence: values.length > 4 ? 'high' : 'medium'
        };
      }
    });
    return trends;
  }
};

export const REGULATORY_COMPLIANCE = {
  checkCompliance: (data, framework) => {
    const requirements = ESG_FRAMEWORKS[framework]?.requiredMetrics || [];
    const coverage = requirements.filter(req => data[req]).length / requirements.length * 100;
    
    return {
      framework,
      coverage: Math.round(coverage),
      missing: requirements.filter(req => !data[req]),
      status: coverage >= 80 ? 'compliant' : coverage >= 50 ? 'partial' : 'non-compliant'
    };
  },

  generateComplianceReport: (data) => {
    const frameworks = Object.keys(ESG_FRAMEWORKS);
    return frameworks.map(framework => REGULATORY_COMPLIANCE.checkCompliance(data, framework));
  }
};

export const STAKEHOLDER_REPORTS = {
  investors: {
    focus: ['Financial materiality', 'Risk management', 'Long-term value'],
    metrics: ['ROI on sustainability', 'ESG ratings', 'Climate risk exposure'],
    format: 'Executive summary with financial impact'
  },
  
  regulators: {
    focus: ['Compliance', 'Mandatory disclosures', 'Audit trail'],
    metrics: ['Regulatory KPIs', 'Compliance status', 'Verification data'],
    format: 'Detailed technical report with evidence'
  },
  
  customers: {
    focus: ['Product sustainability', 'Supply chain ethics', 'Environmental impact'],
    metrics: ['Carbon footprint', 'Ethical sourcing', 'Circular economy'],
    format: 'Visual dashboard with key highlights'
  },
  
  employees: {
    focus: ['Workplace culture', 'Career development', 'Company values'],
    metrics: ['Diversity metrics', 'Training opportunities', 'Safety record'],
    format: 'Interactive report with personal relevance'
  }
};

export const DATA_QUALITY_CHECKS = {
  validateData: (entry) => {
    const issues = [];
    
    // Completeness check
    if (!entry.value || entry.value === '') {
      issues.push({ type: 'error', message: 'Missing value' });
    }
    
    // Range validation
    if (entry.category === 'environmental' && entry.metric === 'renewable_energy' && entry.value > 100) {
      issues.push({ type: 'warning', message: 'Renewable energy percentage cannot exceed 100%' });
    }
    
    // Consistency check
    if (entry.timestamp && new Date(entry.timestamp) > new Date()) {
      issues.push({ type: 'error', message: 'Future date not allowed' });
    }
    
    // Source verification
    if (!entry.source || entry.source.length < 3) {
      issues.push({ type: 'warning', message: 'Data source should be specified' });
    }
    
    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 20))
    };
  },

  auditTrail: {
    log: (action, user, data) => {
      const entry = {
        id: Date.now(),
        action,
        user,
        timestamp: new Date().toISOString(),
        data: JSON.stringify(data),
        ip: 'localhost' // In real app, get actual IP
      };
      
      const trail = JSON.parse(localStorage.getItem('audit_trail') || '[]');
      trail.unshift(entry);
      localStorage.setItem('audit_trail', JSON.stringify(trail.slice(0, 1000))); // Keep last 1000 entries
      
      return entry;
    },
    
    getTrail: (filters = {}) => {
      const trail = JSON.parse(localStorage.getItem('audit_trail') || '[]');
      return trail.filter(entry => {
        if (filters.user && entry.user !== filters.user) return false;
        if (filters.action && entry.action !== filters.action) return false;
        if (filters.dateFrom && new Date(entry.timestamp) < new Date(filters.dateFrom)) return false;
        return true;
      });
    }
  }
};