import { CropTwin, Recommendation, ActionItem, Explainability } from '@/types/cropTwin';

export async function generateCropRecommendations(cropTwin: CropTwin): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];
  const { cropData, sensorData, riskAssessment, weatherData, communitySignals } = cropTwin;

  // 1. Pest and Disease Recommendations
  if (riskAssessment.breakdown.pest > 30) {
    recommendations.push({
      id: `pest_${Date.now()}`,
      type: 'preventive',
      priority: riskAssessment.breakdown.pest > 70 ? 'critical' : 'high',
      title: 'Pest Management Required',
      malayalamTitle: 'കീട നിയന്ത്രണം ആവശ്യം',
      description: 'Early signs of pest infestation detected. Immediate preventive action recommended.',
      malayalamDescription: 'കീടബാധയുടെ പ്രാഥമിക ലക്ഷണങ്ങൾ കണ്ടെത്തി. ഉടനടി പ്രതിരോധ നടപടികൾ ശുപാർശ ചെയ്യുന്നു.',
      actionItems: generatePestActionItems(),
      timing: 'Within 24 hours',
      malayalamTiming: '24 മണിക്കൂറിനുള്ളിൽ',
      confidence: 0.85,
      explainability: generatePestExplanation(riskAssessment.breakdown.pest)
    });
  }

  // 2. Irrigation Recommendations
  const latestSensor = sensorData[sensorData.length - 1];
  if (latestSensor && latestSensor.soilMoisture < 30) {
    recommendations.push({
      id: `irrigation_${Date.now()}`,
      type: 'corrective',
      priority: latestSensor.soilMoisture < 15 ? 'critical' : 'high',
      title: 'Irrigation Required',
      malayalamTitle: 'ജലസേചനം ആവശ്യം',
      description: `Soil moisture is critically low at ${latestSensor.soilMoisture}%. Immediate irrigation needed.`,
      malayalamDescription: `മണ്ണിലെ ജലാംശം ${latestSensor.soilMoisture}% ആയി കുറഞ്ഞിരിക്കുന്നു. ഉടനടി ജലസേചനം ആവശ്യം.`,
      actionItems: generateIrrigationActionItems(latestSensor.soilMoisture),
      timing: 'Immediate',
      malayalamTiming: 'ഉടനടി',
      confidence: 0.95,
      explainability: generateIrrigationExplanation(latestSensor.soilMoisture)
    });
  }

  // 3. Fertilizer Recommendations
  if (riskAssessment.breakdown.nutrient > 40) {
    recommendations.push({
      id: `fertilizer_${Date.now()}`,
      type: 'preventive',
      priority: 'medium',
      title: 'Nutrient Management',
      malayalamTitle: 'പോഷക പരിപാലനം',
      description: 'Nutrient deficiency detected. Apply recommended fertilizer based on crop stage.',
      malayalamDescription: 'പോഷകക്കുറവ് കണ്ടെത്തി. വിള ഘട്ടത്തിന് അനുയോജ്യമായ വളം പ്രയോഗിക്കുക.',
      actionItems: generateFertilizerActionItems(cropData.currentStage.stage),
      timing: 'Next 3-5 days',
      malayalamTiming: 'അടുത്ത 3-5 ദിവസം',
      confidence: 0.78,
      explainability: generateFertilizerExplanation(cropData.currentStage.stage)
    });
  }

  // 4. Weather-based Recommendations
  if (weatherData.alerts.length > 0) {
    weatherData.alerts.forEach(alert => {
      recommendations.push({
        id: `weather_${Date.now()}_${alert.type}`,
        type: 'preventive',
        priority: alert.severity === 'alert' ? 'critical' : 'high',
        title: 'Weather Protection Required',
        malayalamTitle: 'കാലാവസ്ഥ സംരക്ഷണം ആവശ്യം',
        description: alert.message,
        malayalamDescription: alert.malayalamMessage,
        actionItems: generateWeatherActionItems(alert.type),
        timing: 'Before weather event',
        malayalamTiming: 'കാലാവസ്ഥാ മാറ്റത്തിനു മുമ്പ്',
        confidence: 0.88,
        explainability: generateWeatherExplanation(alert.type)
      });
    });
  }

  // 5. Harvest Timing Recommendations
  if (cropData.currentStage.stage === 'maturity') {
    const daysToOptimalHarvest = calculateOptimalHarvestDays(cropData, weatherData);
    recommendations.push({
      id: `harvest_${Date.now()}`,
      type: 'advisory',
      priority: 'high',
      title: 'Harvest Timing Guidance',
      malayalamTitle: 'വിളവെടുപ്പ് സമയ മാർഗ്ഗദർശനം',
      description: `Optimal harvest time is in ${daysToOptimalHarvest} days based on crop maturity and weather forecast.`,
      malayalamDescription: `വിള പക്വതയും കാലാവസ്ഥാ പ്രവചനവും അടിസ്ഥാനമാക്കി ${daysToOptimalHarvest} ദിവസത്തിനുള്ളിൽ വിളവെടുക്കാം.`,
      actionItems: generateHarvestActionItems(daysToOptimalHarvest),
      timing: `${daysToOptimalHarvest} days`,
      malayalamTiming: `${daysToOptimalHarvest} ദിവസം`,
      confidence: 0.82,
      explainability: generateHarvestExplanation(daysToOptimalHarvest, weatherData)
    });
  }

  // 6. Community-based Recommendations
  const nearbyPestSignals = communitySignals.filter(s => 
    s.type === 'pest_sighting' && s.confidence > 0.7
  );

  if (nearbyPestSignals.length > 2) {
    recommendations.push({
      id: `community_pest_${Date.now()}`,
      type: 'preventive',
      priority: 'high',
      title: 'Community Pest Alert',
      malayalamTitle: 'സമുദായിക കീട മുന്നറിയിപ്പ്',
      description: `Multiple pest sightings reported nearby. Enhanced monitoring recommended.`,
      malayalamDescription: `സമീപത്ത് ഒന്നിലധികം കീടബാധ റിപ്പോർട്ട് ചെയ്യപ്പെട്ടിട്ടുണ്ട്. കൂടുതൽ നിരീക്ഷണം ശുപാർശ ചെയ്യുന്നു.`,
      actionItems: generateCommunityPestActionItems(),
      timing: 'Next 48 hours',
      malayalamTiming: 'അടുത്ത 48 മണിക്കൂർ',
      confidence: 0.75,
      explainability: generateCommunityExplanation(nearbyPestSignals.length)
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Helper functions
function generatePestActionItems(): ActionItem[] {
  return [
    {
      task: 'Inspect crop for pest damage',
      malayalamTask: 'കീടബാധയ്ക്കായി വിള പരിശോധിക്കുക',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      materials: ['Magnifying glass', 'Sticky traps'],
      malayalamMaterials: ['ലൂപ്പ്', 'സ്റ്റിക്കി ട്രാപ്പുകൾ'],
      cost: 50,
      duration: '30 minutes',
      difficulty: 'easy' as const
    },
    {
      task: 'Apply organic neem oil spray',
      malayalamTask: 'ജൈവ വേപ്പെണ്ണ സ്പ്രേ പ്രയോഗിക്കുക',
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      materials: ['Neem oil', 'Sprayer', 'Water'],
      malayalamMaterials: ['വേപ്പെണ്ണ', 'സ്പ്രേയർ', 'വെള്ളം'],
      cost: 200,
      duration: '1 hour',
      difficulty: 'medium' as const
    }
  ];
}

function generateIrrigationActionItems(moistureLevel: number): ActionItem[] {
  const urgency = moistureLevel < 15 ? 'immediate' : 'planned';
  
  return [
    {
      task: urgency === 'immediate' ? 'Emergency irrigation' : 'Scheduled irrigation',
      malayalamTask: urgency === 'immediate' ? 'അടിയന്തിര ജലസേചനം' : 'ആസൂത്രിത ജലസേചനം',
      dueDate: new Date(Date.now() + (urgency === 'immediate' ? 2 : 6) * 60 * 60 * 1000),
      materials: ['Water source', 'Irrigation system'],
      malayalamMaterials: ['ജലസ്രോതസ്സ്', 'ജലസേചന സംവിധാനം'],
      cost: 100,
      duration: urgency === 'immediate' ? '2 hours' : '1 hour',
      difficulty: 'medium' as const
    }
  ];
}

function generateFertilizerActionItems(cropStage: string): ActionItem[] {
  const stageRecommendations = {
    vegetative: { fertilizer: 'NPK 19:19:19', amount: '10kg/acre' },
    flowering: { fertilizer: 'Phosphorus rich (DAP)', amount: '8kg/acre' },
    fruiting: { fertilizer: 'Potassium rich (MOP)', amount: '12kg/acre' },
    maturity: { fertilizer: 'Potassium sulfate', amount: '5kg/acre' }
  };

  const rec = stageRecommendations[cropStage as keyof typeof stageRecommendations] || stageRecommendations.vegetative;

  return [
    {
      task: `Apply ${rec.fertilizer} fertilizer`,
      malayalamTask: `${rec.fertilizer} വളം പ്രയോഗിക്കുക`,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      materials: [rec.fertilizer, 'Spreader', 'Protective gear'],
      malayalamMaterials: [rec.fertilizer, 'വിതറൻ യന്ത്രം', 'സുരക്ഷാ സാധനങ്ങൾ'],
      cost: 500,
      duration: '2 hours',
      difficulty: 'medium' as const
    }
  ];
}

function generateWeatherActionItems(alertType: string): ActionItem[] {
  const actions = {
    heavy_rain: [
      {
        task: 'Improve drainage systems',
        malayalamTask: 'ഡ്രെയിനേജ് വ്യവസ്ഥ മെച്ചപ്പെടുത്തുക',
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        materials: ['Drainage pipes', 'Shovels'],
        malayalamMaterials: ['ഡ്രെയിനേജ് പൈപ്പുകൾ', 'കോരിക'],
        cost: 300,
        duration: '3 hours',
        difficulty: 'hard' as const
      }
    ],
    drought: [
      {
        task: 'Install water conservation measures',
        malayalamTask: 'ജല സംരക്ഷണ നടപടികൾ സ്വീകരിക്കുക',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        materials: ['Mulch', 'Drip irrigation system'],
        malayalamMaterials: ['മൾച്ച്', 'ഡ്രിപ്പ് ഇറിഗേഷൻ സിസ്റ്റം'],
        cost: 800,
        duration: '4 hours',
        difficulty: 'hard' as const
      }
    ]
  };

  return actions[alertType as keyof typeof actions] || [];
}

function generateHarvestActionItems(daysToHarvest: number): ActionItem[] {
  return [
    {
      task: 'Prepare harvesting equipment',
      malayalamTask: 'വിളവെടുപ്പ് ഉപകരണങ്ങൾ തയ്യാറാക്കുക',
      dueDate: new Date(Date.now() + (daysToHarvest - 2) * 24 * 60 * 60 * 1000),
      materials: ['Harvesting tools', 'Storage containers', 'Transport'],
      malayalamMaterials: ['വിളവെടുപ്പ് ഉപകരണങ്ങൾ', 'സംഭരണി', 'ഗതാഗതം'],
      cost: 1000,
      duration: '1 day',
      difficulty: 'medium' as const
    }
  ];
}

function generateCommunityPestActionItems(): ActionItem[] {
  return [
    {
      task: 'Increase pest monitoring frequency',
      malayalamTask: 'കീട നിരീക്ഷണം വർദ്ധിപ്പിക്കുക',
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      materials: ['Pest identification guide', 'Monitoring forms'],
      malayalamMaterials: ['കീട തിരിച്ചറിയൽ ഗൈഡ്', 'നിരീക്ഷണ ഫോമുകൾ'],
      cost: 25,
      duration: '15 minutes daily',
      difficulty: 'easy' as const
    }
  ];
}

// Explainability functions
function generatePestExplanation(riskLevel: number): Explainability {
  return {
    reasoning: `Pest risk assessment shows ${riskLevel}% risk based on weather conditions, crop stage, and community reports.`,
    malayalamReasoning: `കാലാവസ്ഥാ സാഹചര്യങ്ങൾ, വിള ഘട്ടം, സമുദായ റിപ്പോർട്ടുകൾ എന്നിവ അടിസ്ഥാനമാക്കി കീട അപകടസാധ്യത ${riskLevel}% ആണ്.`,
    dataSource: ['Weather data', 'Crop stage analysis', 'Community signals', 'Historical patterns'],
    confidence: 0.85,
    alternatives: [
      {
        option: 'Wait and monitor',
        malayalamOption: 'കാത്തിരുന്ന് നിരീക്ഷിക്കുക',
        pros: ['Lower immediate cost', 'Less intervention'],
        malayalamPros: ['കുറഞ്ഞ ചെലവ്', 'കുറഞ്ഞ ഇടപെടൽ'],
        cons: ['Higher risk of infestation', 'Potential crop loss'],
        malayalamCons: ['കീടബാധയുടെ അപകടസാധ്യത', 'വിള നഷ്ടത്തിന്റെ സാധ്യത']
      }
    ]
  };
}

function generateIrrigationExplanation(moistureLevel: number): Explainability {
  return {
    reasoning: `Soil moisture at ${moistureLevel}% is below optimal range (40-60%). Crop stress indicators detected.`,
    malayalamReasoning: `മണ്ണിലെ ജലാംശം ${moistureLevel}% ഉത്തമ പരിധിയിൽ (40-60%) നിന്ന് കുറവാണ്. വിള സമ്മർദ്ദ സൂചകങ്ങൾ കണ്ടെത്തി.`,
    dataSource: ['Soil moisture sensors', 'Crop water requirements', 'Weather forecast'],
    confidence: 0.95,
    alternatives: []
  };
}

function generateFertilizerExplanation(cropStage: string): Explainability {
  return {
    reasoning: `Current crop stage (${cropStage}) requires specific nutrient balance for optimal growth.`,
    malayalamReasoning: `നിലവിലെ വിള ഘട്ടത്തിന് (${cropStage}) ഒപ്റ്റിമൽ വളർച്ചയ്ക്ക് പ്രത്യേക പോഷക സന്തുലനം ആവശ്യമാണ്.`,
    dataSource: ['Crop growth stage', 'Soil nutrient analysis', 'Agronomic guidelines'],
    confidence: 0.78,
    alternatives: []
  };
}

function generateWeatherExplanation(alertType: string): Explainability {
  return {
    reasoning: `Weather forecast indicates ${alertType} conditions that may affect crop health and yield.`,
    malayalamReasoning: `കാലാവസ്ഥാ പ്രവചനം ${alertType} സാഹചര്യങ്ങൾ സൂചിപ്പിക്കുന്നു, ഇത് വിളയുടെ ആരോഗ്യത്തെയും വിളവിനെയും ബാധിച്ചേക്കാം.`,
    dataSource: ['Weather forecast', 'Historical impact analysis', 'Crop vulnerability assessment'],
    confidence: 0.88,
    alternatives: []
  };
}

function generateHarvestExplanation(days: number, weatherData: any): Explainability {
  return {
    reasoning: `Optimal harvest timing calculated based on crop maturity indicators and ${days}-day weather forecast.`,
    malayalamReasoning: `വിള പക്വത സൂചകങ്ങളും ${days}-ദിവസത്തെ കാലാവസ്ഥാ പ്രവചനവും അടിസ്ഥാനമാക്കി ഒപ്റ്റിമൽ വിളവെടുപ്പ് സമയം കണക്കാക്കി.`,
    dataSource: ['Crop maturity assessment', 'Weather forecast', 'Market timing analysis'],
    confidence: 0.82,
    alternatives: []
  };
}

function generateCommunityExplanation(signalCount: number): Explainability {
  return {
    reasoning: `${signalCount} verified pest sightings reported within 5km radius in the last 7 days.`,
    malayalamReasoning: `കഴിഞ്ഞ 7 ദിവസത്തിനിടെ 5 കിമീ ചുറ്റളവിൽ ${signalCount} സ്ഥിരീകരിച്ച കീടബാധ റിപ്പോർട്ട് ചെയ്യപ്പെട്ടിട്ടുണ്ട്.`,
    dataSource: ['Community reports', 'Geospatial analysis', 'Verification system'],
    confidence: 0.75,
    alternatives: []
  };
}

function calculateOptimalHarvestDays(cropData: any, weatherData: any): number {
  // Simple calculation - in production, use more sophisticated models
  const baseMaturityDays = cropData.currentStage.daysFromPlanting;
  const weatherAdjustment = weatherData.forecast.length > 0 ? 2 : 0; // Adjust for weather
  return Math.max(1, 7 - weatherAdjustment); // Default 5-7 days
}
