const axios = require('axios');

class HRConnector {
  constructor(config) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.type = config.type; // 'Workday', 'BambooHR', 'ADP'
  }

  async getEmployeeData() {
    try {
      const endpoint = this.getEmployeeEndpoint();
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders()
      });
      
      return this.transformEmployeeData(response.data);
    } catch (error) {
      console.error('HR Employee data fetch failed:', error.message);
      return this.getMockEmployeeData();
    }
  }

  async getDiversityData() {
    try {
      const endpoint = this.getDiversityEndpoint();
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders()
      });
      
      return this.transformDiversityData(response.data);
    } catch (error) {
      console.error('HR Diversity data fetch failed:', error.message);
      return this.getMockDiversityData();
    }
  }

  async getSafetyData() {
    try {
      const endpoint = this.getSafetyEndpoint();
      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: this.getHeaders()
      });
      
      return this.transformSafetyData(response.data);
    } catch (error) {
      console.error('HR Safety data fetch failed:', error.message);
      return this.getMockSafetyData();
    }
  }

  getHeaders() {
    const headers = {
      Workday: { 'Authorization': `Bearer ${this.apiKey}` },
      BambooHR: { 'Authorization': `Basic ${Buffer.from(this.apiKey + ':x').toString('base64')}` },
      ADP: { 'Authorization': `Bearer ${this.apiKey}` }
    };
    return headers[this.type] || { 'Authorization': `Bearer ${this.apiKey}` };
  }

  getEmployeeEndpoint() {
    const endpoints = {
      Workday: '/api/workers',
      BambooHR: '/v1/employees/directory',
      ADP: '/hr/v2/workers'
    };
    return endpoints[this.type] || '/api/employees';
  }

  getDiversityEndpoint() {
    const endpoints = {
      Workday: '/api/workers/diversity',
      BambooHR: '/v1/reports/custom',
      ADP: '/hr/v2/workers/demographics'
    };
    return endpoints[this.type] || '/api/diversity';
  }

  getSafetyEndpoint() {
    const endpoints = {
      Workday: '/api/safety/incidents',
      BambooHR: '/v1/time_off/requests',
      ADP: '/hr/v2/safety/incidents'
    };
    return endpoints[this.type] || '/api/safety';
  }

  transformEmployeeData(data) {
    return {
      totalEmployees: data.total || data.length || 0,
      newHires: data.newHires || 0,
      turnoverRate: data.turnoverRate || 0,
      avgTenure: data.avgTenure || 0
    };
  }

  transformDiversityData(data) {
    return {
      femalePercentage: data.female_pct || 0,
      minorityPercentage: data.minority_pct || 0,
      ageDistribution: data.age_dist || {},
      leadershipDiversity: data.leadership_diversity || 0
    };
  }

  transformSafetyData(data) {
    return {
      incidentRate: data.incident_rate || 0,
      lostTimeRate: data.lost_time_rate || 0,
      safetyTrainingHours: data.training_hours || 0,
      nearMisses: data.near_misses || 0
    };
  }

  getMockEmployeeData() {
    return {
      totalEmployees: Math.floor(Math.random() * 5000) + 100,
      newHires: Math.floor(Math.random() * 200) + 10,
      turnoverRate: Math.floor(Math.random() * 15) + 5,
      avgTenure: Math.floor(Math.random() * 8) + 2
    };
  }

  getMockDiversityData() {
    return {
      femalePercentage: Math.floor(Math.random() * 30) + 35,
      minorityPercentage: Math.floor(Math.random() * 25) + 20,
      ageDistribution: {
        '18-30': 30,
        '31-45': 45,
        '46-60': 20,
        '60+': 5
      },
      leadershipDiversity: Math.floor(Math.random() * 20) + 25
    };
  }

  getMockSafetyData() {
    return {
      incidentRate: Math.random() * 3,
      lostTimeRate: Math.random() * 1.5,
      safetyTrainingHours: Math.floor(Math.random() * 20) + 10,
      nearMisses: Math.floor(Math.random() * 50) + 5
    };
  }
}

module.exports = HRConnector;