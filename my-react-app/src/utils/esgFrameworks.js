// ESG Reporting Frameworks and Standards
export const ESG_FRAMEWORKS = {
  GRI: {
    name: "GRI Standards",
    description: "Global Reporting Initiative Standards",
    categories: {
      environmental: {
        "GRI-302": "Energy",
        "GRI-305": "Emissions", 
        "GRI-303": "Water and Effluents",
        "GRI-306": "Waste"
      },
      social: {
        "GRI-401": "Employment",
        "GRI-403": "Occupational Health and Safety",
        "GRI-405": "Diversity and Equal Opportunity"
      },
      governance: {
        "GRI-2-9": "Governance structure and composition",
        "GRI-205": "Anti-corruption"
      }
    }
  },
  SASB: {
    name: "SASB Standards",
    description: "Sustainability Accounting Standards Board",
    categories: {
      environmental: ["Energy Management", "GHG Emissions", "Water Management"],
      social: ["Labor Practices", "Employee Health & Safety", "Human Rights"],
      governance: ["Business Ethics", "Competitive Behavior", "Management of Legal & Regulatory Environment"]
    }
  },
  TCFD: {
    name: "TCFD Recommendations", 
    description: "Task Force on Climate-related Financial Disclosures",
    pillars: ["Governance", "Strategy", "Risk Management", "Metrics and Targets"]
  },
  CSRD: {
    name: "CSRD/ESRS",
    description: "Corporate Sustainability Reporting Directive",
    standards: ["ESRS E1-E5 (Environmental)", "ESRS S1-S4 (Social)", "ESRS G1-G2 (Governance)"]
  }
};

export const STANDARD_METRICS = {
  environmental: {
    scope1Emissions: { unit: "tCO2e", framework: "GRI-305-1", description: "Direct GHG emissions" },
    scope2Emissions: { unit: "tCO2e", framework: "GRI-305-2", description: "Energy indirect GHG emissions" },
    scope3Emissions: { unit: "tCO2e", framework: "GRI-305-3", description: "Other indirect GHG emissions" },
    energyConsumption: { unit: "MWh", framework: "GRI-302-1", description: "Energy consumption within organization" },
    renewableEnergyPercentage: { unit: "%", framework: "GRI-302-1", description: "Renewable energy share" },
    waterWithdrawal: { unit: "m³", framework: "GRI-303-3", description: "Water withdrawal" },
    wasteGenerated: { unit: "tonnes", framework: "GRI-306-3", description: "Waste generated" }
  },
  social: {
    totalEmployees: { unit: "count", framework: "GRI-2-7", description: "Total number of employees" },
    femaleEmployeesPercentage: { unit: "%", framework: "GRI-405-1", description: "Female employees percentage" },
    lostTimeInjuryRate: { unit: "rate", framework: "GRI-403-9", description: "Lost-time injury frequency rate" },
    trainingHoursPerEmployee: { unit: "hours", framework: "GRI-404-1", description: "Average training hours per employee" }
  },
  governance: {
    boardSize: { unit: "count", framework: "GRI-2-9", description: "Total board members" },
    independentDirectorsPercentage: { unit: "%", framework: "GRI-2-9", description: "Independent directors percentage" },
    ethicsTrainingCompletion: { unit: "%", framework: "GRI-205-2", description: "Ethics training completion rate" }
  }
};

export const MATERIALITY_TOPICS = [
  { id: "climate_change", name: "Climate Change", category: "environmental" },
  { id: "energy_management", name: "Energy Management", category: "environmental" },
  { id: "water_management", name: "Water Management", category: "environmental" },
  { id: "waste_management", name: "Waste & Circular Economy", category: "environmental" },
  { id: "employee_wellbeing", name: "Employee Health & Wellbeing", category: "social" },
  { id: "diversity_inclusion", name: "Diversity & Inclusion", category: "social" },
  { id: "human_rights", name: "Human Rights", category: "social" },
  { id: "data_privacy", name: "Data Privacy & Security", category: "governance" },
  { id: "business_ethics", name: "Business Ethics & Anti-corruption", category: "governance" },
  { id: "supply_chain", name: "Supply Chain Management", category: "governance" }
];