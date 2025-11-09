import { CropData, SensorData, CommunitySignal, RiskAssessment, RiskTrend } from '@/types/cropTwin';

export async function assessCropRisks(
  cropData: CropData,
  sensorData: SensorData[],
  communitySignals: CommunitySignal[]
): Promise<RiskAssessment> {
  
  const pestRisk = await calculatePestRisk(cropData, sensorData, communitySignals);
  const diseaseRisk = await calculateDiseaseRisk(cropData, sensorData, communitySignals);
  const weatherRisk = await calculateWeatherRisk(cropData, sensorData);
  const nutrientRisk = await calculateNutrientRisk(cropData, sensorData);
  const waterRisk = await calculateWaterRisk(cropData, sensorData);

  const overallRisk = (pestRisk + diseaseRisk + weatherRisk + nutrientRisk + waterRisk) / 5;

  const trends = await calculateRiskTrends(
    { pest: pestRisk, disease: diseaseRisk, weather: weatherRisk, nutrient: nutrientRisk, water: waterRisk },
    sensorData
  );

  return {
    overall: Math.round(overallRisk),
    breakdown: {
      pest: Math.round(pestRisk),
      disease: Math.round(diseaseRisk),
      weather: Math.round(weatherRisk),
      nutrient: Math.round(nutrientRisk),
      water: Math.round(waterRisk)
    },
    trends
  };
}

async function calculatePestRisk(
  cropData: CropData,
  sensorData: SensorData[],
  communitySignals: CommunitySignal[]
): Promise<number> {
  let riskScore = 0;

  // Base risk by crop stage
  const stageRisk = {
    germination: 10,
    vegetative: 25,
    flowering: 45, // Peak pest attraction
    fruiting: 35,
    maturity: 20
  };
  riskScore += stageRisk[cropData.currentStage.stage] || 20;

  // Environmental conditions from sensors
  if (sensorData.length > 0) {
    const latest = sensorData[sensorData.length - 1];
    
    // Temperature risk (pests thrive in 25-35°C)
    if (latest.ambientTemperature >= 25 && latest.ambientTemperature <= 35) {
      riskScore += 15;
    }
    
    // Humidity risk (high humidity favors pest development)
    if (latest.humidity > 70) {
      riskScore += 10;
    }
    
    // Rainfall pattern (stagnant water increases pest breeding)
    if (latest.rainfall > 5 && latest.soilMoisture > 80) {
      riskScore += 12;
    }
  }

  // Community signals impact
  const recentPestSignals = communitySignals.filter(signal =>
    signal.type === 'pest_sighting' &&
    (Date.now() - signal.timestamp.getTime()) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
  );

  riskScore += recentPestSignals.length * 8;

  // Seasonal risk for Kerala crops
  const currentMonth = new Date().getMonth();
  const monsoonMonths = [5, 6, 7, 8, 9]; // June to October
  if (monsoonMonths.includes(currentMonth)) {
    riskScore += 10; // Higher pest pressure during monsoon
  }

  return Math.min(100, Math.max(0, riskScore));
}

async function calculateDiseaseRisk(
  cropData: CropData,
  sensorData: SensorData[],
  communitySignals: CommunitySignal[]
): Promise<number> {
  let riskScore = 0;

  // Base disease susceptibility by crop stage
  const stageRisk = {
    germination: 30, // Vulnerable seedling stage
    vegetative: 20,
    flowering: 25,
    fruiting: 35, // High disease pressure
    maturity: 15
  };
  riskScore += stageRisk[cropData.currentStage.stage] || 25;

  // Environmental disease factors
  if (sensorData.length > 0) {
    const latest = sensorData[sensorData.length - 1];
    
    // High humidity promotes fungal diseases
    if (latest.humidity > 80) {
      riskScore += 20;
    } else if (latest.humidity > 70) {
      riskScore += 10;
    }
    
    // Temperature stress weakens plant immunity
    if (latest.ambientTemperature < 15 || latest.ambientTemperature > 35) {
      riskScore += 15;
    }
    
    // Poor drainage increases root rot risk
    if (latest.soilMoisture > 85) {
      riskScore += 18;
    }
    
    // Soil pH affects nutrient uptake and disease resistance
    if (latest.soilPH < 5.5 || latest.soilPH > 8.0) {
      riskScore += 12;
    }
  }

  // Community disease reports
  const recentDiseaseSignals = communitySignals.filter(signal =>
    signal.type === 'disease_outbreak' &&
    (Date.now() - signal.timestamp.getTime()) < 14 * 24 * 60 * 60 * 1000 // Last 14 days
  );

  riskScore += recentDiseaseSignals.length * 12;

  // Crop-specific disease risks (Kerala context)
  const cropDiseaseRisk = {
    'rice': 25, // Blast, sheath blight
    'coconut': 15, // Root wilt, leaf spot
    'pepper': 35, // Foot rot, anthracnose
    'cardamom': 40, // Rhizome rot, capsule rot
    'banana': 30, // Panama disease, black sigatoka
    'rubber': 20 // Leaf fall diseases
  };

  const cropName = cropData.name.toLowerCase();
  for (const [crop, risk] of Object.entries(cropDiseaseRisk)) {
    if (cropName.includes(crop)) {
      riskScore += risk;
      break;
    }
  }

  return Math.min(100, Math.max(0, riskScore));
}

async function calculateWeatherRisk(
  cropData: CropData,
  sensorData: SensorData[]
): Promise<number> {
  let riskScore = 0;

  if (sensorData.length === 0) return 25; // Default moderate risk

  const latest = sensorData[sensorData.length - 1];
  
  // Temperature stress assessment
  const optimalTempRanges = {
    rice: { min: 20, max: 35 },
    coconut: { min: 25, max: 32 },
    pepper: { min: 18, max: 28 },
    cardamom: { min: 15, max: 25 },
    banana: { min: 26, max: 30 }
  };

  const cropName = cropData.name.toLowerCase();
  let tempRange = { min: 20, max: 30 }; // Default

  for (const [crop, range] of Object.entries(optimalTempRanges)) {
    if (cropName.includes(crop)) {
      tempRange = range;
      break;
    }
  }

  if (latest.ambientTemperature < tempRange.min) {
    riskScore += (tempRange.min - latest.ambientTemperature) * 3;
  } else if (latest.ambientTemperature > tempRange.max) {
    riskScore += (latest.ambientTemperature - tempRange.max) * 3;
  }

  // Rainfall stress
  if (latest.rainfall > 100) { // Heavy rainfall
    riskScore += 25;
  } else if (latest.rainfall === 0 && latest.soilMoisture < 30) { // Drought stress
    riskScore += 30;
  }

  // Wind stress
  if (sensorData.length >= 7) {
    const avgWindSpeed = sensorData.slice(-7).reduce((sum, data) => sum + (data.rainfall || 0), 0) / 7;
    if (avgWindSpeed > 20) { // High wind stress
      riskScore += 15;
    }
  }

  // Seasonal weather patterns
  const currentMonth = new Date().getMonth();
  const criticalMonths = {
    pre_monsoon: [3, 4], // April-May (heat stress)
    monsoon: [5, 6, 7, 8], // June-September (excess moisture)
    post_monsoon: [9, 10], // October-November (disease pressure)
    winter: [11, 0, 1, 2] // December-March (cold stress for tropical crops)
  };

  if (criticalMonths.monsoon.includes(currentMonth)) {
    riskScore += 15; // Higher weather risk during monsoon
  } else if (criticalMonths.pre_monsoon.includes(currentMonth)) {
    riskScore += 20; // Heat stress risk
  }

  return Math.min(100, Math.max(0, riskScore));
}

async function calculateNutrientRisk(
  cropData: CropData,
  sensorData: SensorData[]
): Promise<number> {
  let riskScore = 0;

  if (sensorData.length === 0) return 30; // Default moderate-high risk without data

  const latest = sensorData[sensorData.length - 1];

  // Soil pH impact on nutrient availability
  const optimalPH = 6.5;
  const pHDeviation = Math.abs(latest.soilPH - optimalPH);
  
  if (pHDeviation > 1.5) {
    riskScore += 30; // Severe nutrient lockup
  } else if (pHDeviation > 1.0) {
    riskScore += 20;
  } else if (pHDeviation > 0.5) {
    riskScore += 10;
  }

  // Crop stage nutrient requirements
  const stageNutrientDemand = {
    germination: 15, // Low demand
    vegetative: 35, // High N demand
    flowering: 40, // High P demand
    fruiting: 45, // High K demand
    maturity: 20 // Reduced demand
  };

  riskScore += stageNutrientDemand[cropData.currentStage.stage] || 25;

  // Soil moisture impact on nutrient uptake
  if (latest.soilMoisture < 30) {
    riskScore += 25; // Drought stress reduces nutrient uptake
  } else if (latest.soilMoisture > 85) {
    riskScore += 20; // Waterlogging reduces nutrient availability
  }

  // Soil temperature impact
  if (latest.soilTemperature < 15 || latest.soilTemperature > 35) {
    riskScore += 15; // Extreme temperatures reduce nutrient cycling
  }

  // Crop-specific nutrient requirements and deficiency risks
  const cropNutrientRisk = {
    rice: 25, // Silicon, zinc deficiency common
    coconut: 30, // Potassium, boron deficiency
    pepper: 35, // Calcium, magnesium sensitive
    cardamom: 40, // High nutrient demand
    banana: 35, // Potassium hungry crop
    rubber: 20 // Generally hardy
  };

  const cropName = cropData.name.toLowerCase();
  for (const [crop, risk] of Object.entries(cropNutrientRisk)) {
    if (cropName.includes(crop)) {
      riskScore += risk;
      break;
    }
  }

  return Math.min(100, Math.max(0, riskScore));
}

async function calculateWaterRisk(
  cropData: CropData,
  sensorData: SensorData[]
): Promise<number> {
  let riskScore = 0;

  if (sensorData.length === 0) return 25; // Default moderate risk

  const latest = sensorData[sensorData.length - 1];

  // Soil moisture assessment
  const optimalMoisture = {
    rice: { min: 70, max: 90 }, // Paddy requires high moisture
    coconut: { min: 40, max: 70 },
    pepper: { min: 50, max: 75 },
    cardamom: { min: 60, max: 80 },
    banana: { min: 55, max: 75 }
  };

  const cropName = cropData.name.toLowerCase();
  let moistureRange = { min: 40, max: 70 }; // Default

  for (const [crop, range] of Object.entries(optimalMoisture)) {
    if (cropName.includes(crop)) {
      moistureRange = range;
      break;
    }
  }

  if (latest.soilMoisture < moistureRange.min) {
    riskScore += (moistureRange.min - latest.soilMoisture) * 2;
  } else if (latest.soilMoisture > moistureRange.max) {
    riskScore += (latest.soilMoisture - moistureRange.max) * 1.5;
  }

  // Recent rainfall pattern analysis
  if (sensorData.length >= 7) {
    const recentRainfall = sensorData.slice(-7).reduce((sum, data) => sum + data.rainfall, 0);
    
    if (recentRainfall === 0) {
      riskScore += 30; // No rainfall in 7 days
    } else if (recentRainfall > 200) {
      riskScore += 25; // Excessive rainfall
    }
    
    // Rainfall distribution (consistency check)
    const rainyDays = sensorData.slice(-7).filter(data => data.rainfall > 0).length;
    if (rainyDays < 2 && recentRainfall > 0) {
      riskScore += 15; // Irregular rainfall pattern
    }
  }

  // Crop stage water sensitivity
  const stageWaterSensitivity = {
    germination: 40, // Critical for seedling establishment
    vegetative: 25, // Moderate requirement
    flowering: 45, // Critical for flower development
    fruiting: 35, // Important for fruit development
    maturity: 20 // Lower requirement
  };

  riskScore += stageWaterSensitivity[cropData.currentStage.stage] || 25;

  // Soil drainage assessment (based on moisture retention patterns)
  if (sensorData.length >= 3) {
    const moistureTrend = sensorData.slice(-3).map(data => data.soilMoisture);
    const moistureVariation = Math.max(...moistureTrend) - Math.min(...moistureTrend);
    
    if (moistureVariation < 5 && latest.soilMoisture > 80) {
      riskScore += 20; // Poor drainage suspected
    }
  }

  // Evapotranspiration estimation
  if (latest.ambientTemperature > 30 && latest.humidity < 50) {
    riskScore += 15; // High evapotranspiration conditions
  }

  return Math.min(100, Math.max(0, riskScore));
}

async function calculateRiskTrends(
  currentRisks: { [key: string]: number },
  sensorData: SensorData[]
): Promise<RiskTrend[]> {
  const trends: RiskTrend[] = [];

  if (sensorData.length < 7) {
    // Insufficient data for trend analysis
    return Object.keys(currentRisks).map(factor => ({
      factor,
      direction: 'stable' as const,
      confidence: 0.3,
      timeframe: '7 days'
    }));
  }

  // Analyze trends for each risk factor
  for (const [factor, currentRisk] of Object.entries(currentRisks)) {
    const trend = await analyzeTrendForFactor(factor, sensorData, currentRisk);
    trends.push(trend);
  }

  return trends;
}

async function analyzeTrendForFactor(
  factor: string,
  sensorData: SensorData[],
  currentRisk: number
): Promise<RiskTrend> {
  const recentData = sensorData.slice(-7); // Last 7 readings
  const olderData = sensorData.slice(-14, -7); // Previous 7 readings

  if (olderData.length < 3) {
    return {
      factor,
      direction: 'stable',
      confidence: 0.4,
      timeframe: '7 days'
    };
  }

  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let confidence = 0.6;

  switch (factor) {
    case 'pest':
      // Temperature and humidity trends affect pest risk
      const recentTemp = average(recentData.map(d => d.ambientTemperature));
      const olderTemp = average(olderData.map(d => d.ambientTemperature));
      const recentHumidity = average(recentData.map(d => d.humidity));
      const olderHumidity = average(olderData.map(d => d.humidity));

      if ((recentTemp > olderTemp + 2) && (recentHumidity > olderHumidity + 5)) {
        direction = 'increasing';
        confidence = 0.8;
      } else if ((recentTemp < olderTemp - 2) || (recentHumidity < olderHumidity - 10)) {
        direction = 'decreasing';
        confidence = 0.7;
      }
      break;

    case 'disease':
      // Humidity and moisture trends affect disease risk
      const recentMoisture = average(recentData.map(d => d.soilMoisture));
      const olderMoisture = average(olderData.map(d => d.soilMoisture));
      const recentHumidityD = average(recentData.map(d => d.humidity));
      const olderHumidityD = average(olderData.map(d => d.humidity));

      if ((recentMoisture > olderMoisture + 10) && (recentHumidityD > olderHumidityD + 5)) {
        direction = 'increasing';
        confidence = 0.85;
      } else if ((recentMoisture < olderMoisture - 10) && (recentHumidityD < olderHumidityD - 5)) {
        direction = 'decreasing';
        confidence = 0.8;
      }
      break;

    case 'water':
      // Soil moisture trend analysis
      const moistureTrend = recentData.map(d => d.soilMoisture);
      const isDecreasing = moistureTrend.every((val, i) => i === 0 || val <= moistureTrend[i - 1]);
      const isIncreasing = moistureTrend.every((val, i) => i === 0 || val >= moistureTrend[i - 1]);

      if (isDecreasing && average(moistureTrend) < 40) {
        direction = 'increasing'; // Water risk is increasing
        confidence = 0.9;
      } else if (isIncreasing && average(moistureTrend) > 70) {
        direction = 'increasing'; // Waterlogging risk
        confidence = 0.8;
      } else if (moistureTrend[moistureTrend.length - 1] > moistureTrend[0] + 10) {
        direction = 'decreasing'; // Water risk decreasing
        confidence = 0.7;
      }
      break;

    case 'nutrient':
      // pH and moisture stability affects nutrient risk
      const pHTrend = recentData.map(d => d.soilPH);
      const pHVariation = Math.max(...pHTrend) - Math.min(...pHTrend);
      
      if (pHVariation > 0.5) {
        direction = 'increasing'; // Unstable pH increases nutrient risk
        confidence = 0.7;
      } else if (average(pHTrend) > 6.0 && average(pHTrend) < 7.0) {
        direction = 'decreasing'; // Optimal pH reduces risk
        confidence = 0.75;
      }
      break;

    case 'weather':
      // Temperature and rainfall variability
      const tempVariation = Math.max(...recentData.map(d => d.ambientTemperature)) - 
                           Math.min(...recentData.map(d => d.ambientTemperature));
      const totalRainfall = recentData.reduce((sum, d) => sum + d.rainfall, 0);

      if (tempVariation > 8 || totalRainfall > 150) {
        direction = 'increasing';
        confidence = 0.8;
      } else if (tempVariation < 3 && totalRainfall < 20 && totalRainfall > 5) {
        direction = 'decreasing';
        confidence = 0.7;
      }
      break;
  }

  return {
    factor,
    direction,
    confidence,
    timeframe: '7 days'
  };
}

function average(numbers: number[]): number {
  return numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
}
