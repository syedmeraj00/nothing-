// Minimal ESG API for data operations
const esgAPI = {
  async getAnalyticsData() {
    try {
      const response = await fetch('http://localhost:3004/api/esg/analytics');
      if (response.ok) {
        return await response.json();
      } else {
        // Fallback to mock data if backend unavailable
        return {
          success: true,
          data: {
            categoryDistribution: { environmental: 15, social: 12, governance: 8 },
            riskDistribution: { high: 2, medium: 8, low: 25 },
            monthlyTrends: { "Jan": 5, "Feb": 8, "Mar": 12, "Apr": 15, "May": 18, "Jun": 22 },
            kpis: { overallScore: 78, environmental: 82, social: 75, governance: 77, complianceRate: 94 },
            trends: [],
            totalEntries: 35
          }
        };
      }
    } catch (error) {
      console.warn('Backend unavailable, using fallback data');
      return {
        success: true,
        data: {
          categoryDistribution: { environmental: 15, social: 12, governance: 8 },
          riskDistribution: { high: 2, medium: 8, low: 25 },
          monthlyTrends: { "Jan": 5, "Feb": 8, "Mar": 12, "Apr": 15, "May": 18, "Jun": 22 },
          kpis: { overallScore: 78, environmental: 82, social: 75, governance: 77, complianceRate: 94 },
          trends: [],
          totalEntries: 35
        }
      };
    }
  },

  async getComplianceData() {
    return {
      success: true,
      data: {
        documents: [
          {
            id: 1,
            name: "Environmental Policy",
            uploadedAt: "2025-07-14 10:30 AM",
            status: "Approved",
            category: "Environmental",
            priority: "High",
            dueDate: "2025-08-15",
            progress: 100
          }
        ]
      }
    };
  },

  async getDashboardData() {
    return {
      success: true,
      data: {
        kpis: { overallScore: 78, environmental: 82, social: 75, governance: 77 }
      }
    };
  },

  async addComplianceDocument(doc) {
    return { success: true, data: doc };
  }
};

export default esgAPI;