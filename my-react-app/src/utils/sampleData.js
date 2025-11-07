// Sample ESG data for testing reports
export const sampleESGData = [
  {
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
    submissionDate: '2024-01-15T10:30:00Z',
    status: 'Submitted'
  },
  {
    companyName: 'ESGenius Tech Solutions',
    sector: 'technology',
    region: 'north_america',
    reportingYear: 2023,
    environmental: {
      scope1Emissions: '1350',
      scope2Emissions: '2600',
      energyConsumption: '9200',
      renewableEnergyPercentage: '28',
      waterWithdrawal: '1650',
      wasteGenerated: '52',
      wasteRecycled: '28'
    },
    social: {
      totalEmployees: '135',
      femaleEmployeesPercentage: '38',
      employeeTurnoverRate: '12.2',
      trainingHoursPerEmployee: '18',
      communityInvestment: '95000',
      lostTimeInjuryRate: '1.2'
    },
    governance: {
      boardSize: '7',
      independentDirectorsPercentage: '57',
      femaleDirectorsPercentage: '29',
      ethicsTrainingCompletion: '88',
      corruptionIncidents: '0',
      dataBreaches: '1'
    },
    submissionDate: '2023-01-20T14:15:00Z',
    status: 'Submitted'
  }
];

export const addSampleDataToStorage = () => {
  try {
    const existingData = JSON.parse(localStorage.getItem('esgData') || '[]');
    
    // Only add sample data if no data exists
    if (existingData.length === 0) {
      localStorage.setItem('esgData', JSON.stringify(sampleESGData));
      console.log('Sample ESG data added to localStorage');
      return true;
    }
    
    console.log('Data already exists in localStorage');
    return false;
  } catch (error) {
    console.error('Error adding sample data:', error);
    return false;
  }
};