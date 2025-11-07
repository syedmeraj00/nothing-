const axios = require('axios');

class ERPConnector {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.type = config.type; // 'SAP', 'Oracle', 'NetSuite'
  }

  async getEnergyData(startDate, endDate) {
    try {
      const endpoint = this.getEnergyEndpoint();
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        params: { startDate, endDate }
      });
      
      return this.transformEnergyData(response.data);
    } catch (error) {
      console.error('ERP Energy data fetch failed:', error.message);
      return this.getMockEnergyData();
    }
  }

  async getFinancialData(year) {
    try {
      const endpoint = this.getFinancialEndpoint();
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        params: { year }
      });
      
      return this.transformFinancialData(response.data);
    } catch (error) {
      console.error('ERP Financial data fetch failed:', error.message);
      return this.getMockFinancialData();
    }
  }

  getEnergyEndpoint() {
    const endpoints = {
      SAP: '/api/energy/consumption',
      Oracle: '/rest/energy/data',
      NetSuite: '/services/energy'
    };
    return endpoints[this.type] || '/api/energy';
  }

  getFinancialEndpoint() {
    const endpoints = {
      SAP: '/api/financial/revenue',
      Oracle: '/rest/financial/summary',
      NetSuite: '/services/financial'
    };
    return endpoints[this.type] || '/api/financial';
  }

  transformEnergyData(data) {
    return {
      totalConsumption: data.total || 0,
      renewablePercentage: data.renewable_pct || 0,
      scope2Emissions: (data.total || 0) * 0.5, // Grid emission factor
      period: data.period
    };
  }

  transformFinancialData(data) {
    return {
      revenue: data.revenue || 0,
      operatingCosts: data.costs || 0,
      year: data.year
    };
  }

  getMockEnergyData() {
    return {
      totalConsumption: Math.floor(Math.random() * 100000) + 50000,
      renewablePercentage: Math.floor(Math.random() * 50) + 25,
      scope2Emissions: Math.floor(Math.random() * 25000) + 10000,
      period: new Date().toISOString().slice(0, 7)
    };
  }

  getMockFinancialData() {
    return {
      revenue: Math.floor(Math.random() * 10000000) + 5000000,
      operatingCosts: Math.floor(Math.random() * 5000000) + 2000000,
      year: new Date().getFullYear()
    };
  }
}

module.exports = ERPConnector;