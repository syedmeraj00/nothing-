export class GHGProtocolCalculator {
  static calculateScope1(data) {
    const { fuelCombustion = 0, processEmissions = 0, fugitiveEmissions = 0 } = data;
    
    // Emission factors (tCO2e per unit)
    const factors = {
      naturalGas: 0.0053, // per m³
      diesel: 2.68, // per liter
      gasoline: 2.31, // per liter
      coal: 2.42 // per kg
    };

    let total = 0;
    
    // Fuel combustion calculations
    if (data.naturalGas) total += data.naturalGas * factors.naturalGas;
    if (data.diesel) total += data.diesel * factors.diesel;
    if (data.gasoline) total += data.gasoline * factors.gasoline;
    if (data.coal) total += data.coal * factors.coal;
    
    // Add process and fugitive emissions
    total += processEmissions + fugitiveEmissions;
    
    return {
      total: Math.round(total * 100) / 100,
      breakdown: {
        fuelCombustion: Math.round((total - processEmissions - fugitiveEmissions) * 100) / 100,
        processEmissions,
        fugitiveEmissions
      }
    };
  }

  static calculateScope2(data) {
    const { electricityConsumption = 0, steamConsumption = 0, coolingConsumption = 0 } = data;
    
    // Grid emission factors by region (tCO2e per MWh)
    const gridFactors = {
      'US': 0.4,
      'EU': 0.3,
      'China': 0.6,
      'India': 0.8,
      'Global': 0.5
    };
    
    const region = data.region || 'Global';
    const factor = gridFactors[region] || gridFactors['Global'];
    
    const electricityEmissions = electricityConsumption * factor;
    const steamEmissions = steamConsumption * 0.2; // Steam factor
    const coolingEmissions = coolingConsumption * 0.15; // Cooling factor
    
    const total = electricityEmissions + steamEmissions + coolingEmissions;
    
    return {
      total: Math.round(total * 100) / 100,
      breakdown: {
        electricity: Math.round(electricityEmissions * 100) / 100,
        steam: Math.round(steamEmissions * 100) / 100,
        cooling: Math.round(coolingEmissions * 100) / 100
      },
      gridFactor: factor
    };
  }

  static calculateScope3(data) {
    const categories = {
      purchasedGoods: data.purchasedGoods || 0,
      capitalGoods: data.capitalGoods || 0,
      fuelEnergyActivities: data.fuelEnergyActivities || 0,
      upstreamTransport: data.upstreamTransport || 0,
      wasteGenerated: data.wasteGenerated || 0,
      businessTravel: data.businessTravel || 0,
      employeeCommuting: data.employeeCommuting || 0,
      downstreamTransport: data.downstreamTransport || 0,
      useOfProducts: data.useOfProducts || 0,
      endOfLifeTreatment: data.endOfLifeTreatment || 0
    };

    // Simplified emission factors
    const factors = {
      purchasedGoods: 0.5, // per $ spent
      capitalGoods: 0.3,
      businessTravel: 0.2, // per km
      employeeCommuting: 0.15,
      wasteGenerated: 0.4 // per tonne
    };

    let total = 0;
    const breakdown = {};

    Object.entries(categories).forEach(([category, value]) => {
      const factor = factors[category] || 0.1;
      const emissions = value * factor;
      breakdown[category] = Math.round(emissions * 100) / 100;
      total += emissions;
    });

    return {
      total: Math.round(total * 100) / 100,
      breakdown,
      categories: Object.keys(categories).length
    };
  }

  static calculateIntensity(emissions, metrics) {
    const intensities = {};
    
    if (metrics.revenue) {
      intensities.revenueIntensity = Math.round((emissions / metrics.revenue) * 1000000) / 1000000; // tCO2e per $
    }
    
    if (metrics.employees) {
      intensities.employeeIntensity = Math.round((emissions / metrics.employees) * 100) / 100; // tCO2e per employee
    }
    
    if (metrics.production) {
      intensities.productionIntensity = Math.round((emissions / metrics.production) * 100) / 100; // tCO2e per unit
    }
    
    return intensities;
  }

  static validateGHGData(data) {
    const errors = [];
    
    if (data.scope1 < 0 || data.scope2 < 0 || data.scope3 < 0) {
      errors.push('Emission values cannot be negative');
    }
    
    if (data.scope1 > 10000000 || data.scope2 > 10000000 || data.scope3 > 50000000) {
      errors.push('Emission values seem unusually high');
    }
    
    const total = (data.scope1 || 0) + (data.scope2 || 0) + (data.scope3 || 0);
    if (total === 0) {
      errors.push('At least one scope must have emissions data');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      total
    };
  }
}