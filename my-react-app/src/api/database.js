// Simple in-memory database with localStorage persistence
class ESGDatabase {
  constructor() {
    this.data = this.loadFromStorage();
  }

  loadFromStorage() {
    const stored = localStorage.getItem('esg_database');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialize with empty data
    return {
      entries: [],
      compliance: [],
      kpis: {
        overallScore: 0,
        complianceRate: 0,
        environmental: 0,
        social: 0,
        governance: 0,
        totalEntries: 0,
        lastUpdated: new Date().toISOString()
      },
      trends: []
    };
  }

  saveToStorage() {
    localStorage.setItem('esg_database', JSON.stringify(this.data));
  }

  // ESG Entries
  addEntry(entry) {
    const newEntry = {
      ...entry,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'active'
    };
    this.data.entries.push(newEntry);
    this.updateKPIs();
    this.saveToStorage();
    return newEntry;
  }

  getEntries(filters = {}) {
    let entries = this.data.entries.filter(entry => entry.status === 'active');
    
    if (filters.category) {
      entries = entries.filter(entry => entry.category === filters.category);
    }
    if (filters.dateFrom) {
      entries = entries.filter(entry => new Date(entry.timestamp) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      entries = entries.filter(entry => new Date(entry.timestamp) <= new Date(filters.dateTo));
    }
    
    return entries;
  }

  // Compliance Documents
  addComplianceDoc(doc) {
    const newDoc = {
      ...doc,
      id: Date.now(),
      uploadedAt: new Date().toISOString(),
      status: doc.status || 'Pending Review'
    };
    this.data.compliance.push(newDoc);
    this.saveToStorage();
    return newDoc;
  }

  getComplianceDocs(filters = {}) {
    let docs = this.data.compliance;
    
    if (filters.category) {
      docs = docs.filter(doc => doc.category && doc.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.status) {
      docs = docs.filter(doc => doc.status === filters.status);
    }
    
    return docs;
  }

  // KPI Calculations
  updateKPIs() {
    const entries = this.getEntries();
    const compliance = this.data.compliance;
    
    // Calculate category scores
    const envEntries = entries.filter(e => e.category === 'environmental');
    const socEntries = entries.filter(e => e.category === 'social');
    const govEntries = entries.filter(e => e.category === 'governance');
    
    const envScore = this.calculateCategoryScore(envEntries);
    const socScore = this.calculateCategoryScore(socEntries);
    const govScore = this.calculateCategoryScore(govEntries);
    
    // Overall score (weighted average)
    const overallScore = Math.round((envScore * 0.4 + socScore * 0.3 + govScore * 0.3));
    
    // Compliance rate
    const approvedDocs = compliance.filter(doc => doc.status === 'Approved').length;
    const complianceRate = compliance.length > 0 ? Math.round((approvedDocs / compliance.length) * 100) : 0;
    
    this.data.kpis = {
      overallScore,
      complianceRate,
      environmental: envScore,
      social: socScore,
      governance: govScore,
      totalEntries: entries.length,
      lastUpdated: new Date().toISOString()
    };
    
    // Add to trends
    this.data.trends.push({
      timestamp: new Date().toISOString(),
      overallScore,
      environmental: envScore,
      social: socScore,
      governance: govScore
    });
    
    // Keep only last 30 trend points
    if (this.data.trends.length > 30) {
      this.data.trends = this.data.trends.slice(-30);
    }
    
    this.saveToStorage();
  }

  calculateCategoryScore(entries) {
    if (entries.length === 0) return 0;
    
    let totalScore = 0;
    entries.forEach(entry => {
      // Calculate score based on target achievement
      const achievement = entry.target > 0 ? (entry.value / entry.target) * 100 : 50;
      const score = Math.min(Math.max(achievement, 0), 100);
      totalScore += score;
    });
    
    return Math.round(totalScore / entries.length);
  }

  getKPIs() {
    return this.data.kpis;
  }

  getTrends(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return this.data.trends.filter(trend => 
      new Date(trend.timestamp) >= cutoff
    );
  }

  // Analytics data
  getCategoryDistribution() {
    const entries = this.getEntries();
    const distribution = {
      environmental: entries.filter(e => e.category === 'environmental').length,
      social: entries.filter(e => e.category === 'social').length,
      governance: entries.filter(e => e.category === 'governance').length
    };
    return distribution;
  }

  getRiskDistribution() {
    const entries = this.getEntries();
    const distribution = {
      high: entries.filter(e => e.riskLevel === 'high').length,
      medium: entries.filter(e => e.riskLevel === 'medium').length,
      low: entries.filter(e => e.riskLevel === 'low').length
    };
    return distribution;
  }

  getMonthlyTrends() {
    const entries = this.getEntries();
    const monthlyData = {};
    
    entries.forEach(entry => {
      const month = new Date(entry.timestamp).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    return monthlyData;
  }

  // Reports data
  getReportData(template) {
    const entries = this.getEntries();
    const kpis = this.getKPIs();
    const compliance = this.getComplianceDocs();
    
    return {
      template,
      generatedAt: new Date().toISOString(),
      kpis,
      entries: entries.slice(0, 10), // Latest 10 entries
      compliance: compliance.slice(0, 5), // Latest 5 compliance docs
      categoryDistribution: this.getCategoryDistribution(),
      trends: this.getTrends(7) // Last 7 days
    };
  }
}

// Create singleton instance
const esgDB = new ESGDatabase();

export default esgDB;