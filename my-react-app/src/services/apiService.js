// ✅ FIXED: Changed from port 3004 to 3001 (where backend actually runs)
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class APIService {
  static async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(`API Error (${response.status}):`, data.error || data);
        return { error: data.error || 'API Error', status: response.status };
      }
      return data;
    } catch (error) {
      console.error('API request failed:', error.message);
      return { error: `API unavailable: ${error.message}` };
    }
  }

  static getFallbackData(endpoint, method = 'GET') {
    console.warn(`[FALLBACK] No data available for ${endpoint}`);
    return { error: 'Backend offline or endpoint not found' };
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
  static async saveESGData(data) {
    try {
      const result = await this.request('/esg/data', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      
      if (result.error) {
        console.error('Save failed:', result.error);
        return { success: false, message: result.error, data: null };
      }
      
      return { success: true, data: result, message: 'Data saved successfully' };
    } catch (error) {
      console.error('Save error:', error);
      return { success: false, message: error.message, data: null };
    }
  }

  static async getESGData(userId = 'admin@esgenius.com') {
    try {
      const encodedUserId = encodeURIComponent(userId);
      const result = await this.request(`/esg/data/${encodedUserId}`);
      
      if (result.error) {
        console.error('Fetch failed:', result.error);
        return { success: false, data: [], message: result.error };
      }
      
      // result is either an array (from esg.js) or contains data field
      const data = Array.isArray(result) ? result : (result.data || []);
      
      return { 
        success: data && data.length > 0, 
        data: data, 
        message: data.length > 0 ? 'Data loaded' : 'No data found'
      };
    } catch (error) {
      console.error('Fetch error:', error);
      return { success: false, data: [], message: error.message };
    }
  }

  static getESGScores(userId) {
    return this.request(`/esg/scores/${userId}`);
  }

  static getESGKPIs(userId) {
    return this.request(`/esg/kpis/${userId}`);
  }

  static async deleteESGData(id) {
    try {
      const result = await this.request(`/esg/data/${id}`, {
        method: 'DELETE'
      });
      
      if (result.error) {
        console.error('Delete failed:', result.error);
        return { success: false, message: result.error };
      }
      
      return { success: true, message: 'Data deleted successfully' };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, message: error.message };
    }
  }

  // Analytics Data
  static getAnalyticsData(userId) {
    return this.request(`/esg/analytics/${userId}`);
  }
}

export default APIService;