const API_BASE = 'http://localhost:3002/api';

class APIService {
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      return response.ok ? await response.json() : { error: 'API Error' };
    } catch (error) {
      console.warn('API unavailable:', error.message);
      return { error: 'Backend offline' };
    }
  }

  // ERP Integration
  static configureERP(config) {
    return this.request('/integrations/erp/configure', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  static syncERP() {
    return this.request('/integrations/erp/sync', { method: 'POST' });
  }

  // HR Integration  
  static configureHR(config) {
    return this.request('/integrations/hr/configure', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  static syncHR() {
    return this.request('/integrations/hr/sync', { method: 'POST' });
  }

  // Integration Status
  static getIntegrationStatus() {
    return this.request('/integrations/status');
  }

  // Compliance Validation
  static validateCompliance(data) {
    return this.request('/compliance/validate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // GHG Calculations
  static calculateGHG(data) {
    return this.request('/ghg/calculate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ESG Data Management
  static saveESGData(data) {
    return this.request('/esg/data', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static getESGData(userId) {
    return this.request(`/esg/data/${userId}`);
  }

  static getESGScores(userId) {
    return this.request(`/esg/scores/${userId}`);
  }

  static getESGKPIs(userId) {
    return this.request(`/esg/kpis/${userId}`);
  }

  // Analytics Data
  static getAnalyticsData(userId) {
    return this.request(`/esg/analytics/${userId}`);
  }
}

export default APIService;