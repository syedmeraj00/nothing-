const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3004/api';

const sampleData = {
  companyName: 'ESGenius Tech Solutions',
  sector: 'technology',
  region: 'north_america',
  reportingYear: 2024,
  environmental: {
    scope1Emissions: '1200',
    scope2Emissions: '2400',
    energyConsumption: '8500',
    renewableEnergyPercentage: '35',
    waterWithdrawal: '1500',
    wasteGenerated: '45',
    wasteRecycled: '32'
  },
  social: {
    totalEmployees: '150',
    femaleEmployeesPercentage: '42',
    employeeTurnoverRate: '8.5',
    trainingHoursPerEmployee: '24',
    communityInvestment: '125000',
    lostTimeInjuryRate: '0.8'
  },
  governance: {
    boardSize: '8',
    independentDirectorsPercentage: '62',
    femaleDirectorsPercentage: '38',
    ethicsTrainingCompletion: '95',
    corruptionIncidents: '0',
    dataBreaches: '0'
  },
  userId: 'admin@esgenius.com'
};

async function addSampleData() {
  try {
    console.log('Adding sample ESG data...');
    
    const response = await fetch(`${API_BASE}/esg/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleData)
    });
    
    const result = await response.json();
    console.log('✅ Sample data added:', result.message || result.error);
    
    // Verify data was saved
    console.log('\nVerifying data...');
    const verifyResponse = await fetch(`${API_BASE}/esg/verify/${sampleData.userId}`);
    const verifyResult = await verifyResponse.json();
    console.log('✅ Verification:', verifyResult.message);
    
    // Get KPIs
    console.log('\nFetching KPIs...');
    const kpiResponse = await fetch(`${API_BASE}/esg/kpis/${sampleData.userId}`);
    const kpiResult = await kpiResponse.json();
    console.log('✅ KPIs calculated:', {
      overall: kpiResult.overallScore,
      environmental: kpiResult.environmental,
      social: kpiResult.social,
      governance: kpiResult.governance
    });
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  }
}

addSampleData();