import { CropTwin, ProactiveAlert } from '@/types/cropTwin';

export async function generateProactiveAlerts(cropTwin: CropTwin): Promise<ProactiveAlert[]> {
  const alerts: ProactiveAlert[] = [];
  const { cropData, sensorData, riskAssessment, weatherData, communitySignals, activityLog } = cropTwin;

  // 1. Critical Risk Alerts
  if (riskAssessment.overall > 70) {
    alerts.push({
      id: `critical_risk_${Date.now()}`,
      type: 'immediate',
      severity: 'critical',
      title: 'Critical Risk Detected',
      malayalamTitle: 'ഗുരുതരമായ അപകടസാധ്യത കണ്ടെത്തി',
      message: `Your ${cropData.name} crop is at ${riskAssessment.overall}% risk. Immediate action required.`,
      malayalamMessage: `നിങ്ങളുടെ ${cropData.malayalamName} വിളയ്ക്ക് ${riskAssessment.overall}% അപകടസാധ്യതയുണ്ട്. ഉടനടി നടപടി ആവശ്യം.`,
      actionRequired: true,
      dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
      location: cropData.fieldLocation,
      affectedCrops: [cropData.cropId]
    });
  }

  // 2. Pest Outbreak Alerts
  if (riskAssessment.breakdown.pest > 60) {
    const nearbyPestSignals = communitySignals.filter(s => 
      s.type === 'pest_sighting' && 
      calculateDistance(s.location, cropData.fieldLocation) < 2 // Within 2km
    );

    if (nearbyPestSignals.length > 0) {
      alerts.push({
        id: `pest_outbreak_${Date.now()}`,
        type: 'immediate',
        severity: 'critical',
        title: 'Pest Outbreak Warning',
        malayalamTitle: 'കീടബാധ മുന്നറിയിപ്പ്',
        message: `Pest outbreak detected within 2km of your field. ${nearbyPestSignals.length} confirmed sightings.`,
        malayalamMessage: `നിങ്ങളുടെ വയലിന്റെ 2 കിമീ ചുറ്റളവിൽ കീടബാധ കണ്ടെത്തി. ${nearbyPestSignals.length} സ്ഥിരീകരിച്ച കാഴ്ചകൾ.`,
        actionRequired: true,
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
        location: cropData.fieldLocation,
        affectedCrops: [cropData.cropId]
      });
    }
  }

  // 3. Water Stress Alerts
  if (sensorData.length > 0) {
    const latestSensor = sensorData[sensorData.length - 1];
    
    if (latestSensor.soilMoisture < 20) {
      alerts.push({
        id: `water_stress_${Date.now()}`,
        type: 'immediate',
        severity: 'warning',
        title: 'Severe Water Stress',
        malayalamTitle: 'ഗുരുതരമായ ജല സമ്മർദ്ദം',
        message: `Soil moisture critically low at ${latestSensor.soilMoisture}%. Immediate irrigation needed.`,
        malayalamMessage: `മണ്ണിലെ ജലാംശം ${latestSensor.soilMoisture}% ആയി അപകടകരമായി കുറഞ്ഞിരിക്കുന്നു. ഉടനടി ജലസേചനം ആവശ്യം.`,
        actionRequired: true,
        dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
        location: cropData.fieldLocation,
        affectedCrops: [cropData.cropId]
      });
    } else if (latestSensor.soilMoisture > 90) {
      alerts.push({
        id: `waterlog_risk_${Date.now()}`,
        type: 'immediate',
        severity: 'warning',
        title: 'Waterlogging Risk',
        malayalamTitle: 'ജലക്കെട്ട് അപകടസാധ്യത',
        message: `Soil moisture extremely high at ${latestSensor.soilMoisture}%. Drainage required to prevent root rot.`,
        malayalamMessage: `മണ്ണിലെ ജലാംശം ${latestSensor.soilMoisture}% ആയി അമിതമായി ഉയർന്നിരിക്കുന്നു. വേരഴുകൽ തടയാൻ ഡ്രെയിനേജ് ആവശ്യം.`,
        actionRequired: true,
        dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
        location: cropData.fieldLocation,
        affectedCrops: [cropData.cropId]
      });
    }
  }

  // 4. Weather-based Alerts
  for (const weatherAlert of weatherData.alerts) {
    alerts.push({
      id: `weather_${Date.now()}_${weatherAlert.type}`,
      type: weatherAlert.severity === 'alert' ? 'immediate' : 'upcoming',
      severity: weatherAlert.severity === 'alert' ? 'critical' : 'warning',
      title: `Weather Alert: ${weatherAlert.type.replace('_', ' ').toUpperCase()}`,
      malayalamTitle: `കാലാവസ്ഥാ മുന്നറിയിപ്പ്: ${getWeatherTypeInMalayalam(weatherAlert.type)}`,
      message: weatherAlert.message,
      malayalamMessage: weatherAlert.malayalamMessage,
      actionRequired: true,
      dueDate: weatherAlert.validUntil,
      location: cropData.fieldLocation,
      affectedCrops: [cropData.cropId]
    });
  }

  // 5. Growth Stage Transition Alerts
  const daysFromPlanting = cropData.currentStage.daysFromPlanting;
  const expectedTransitions = getExpectedStageTransitions(cropData.name);
  
  for (const transition of expectedTransitions) {
    if (Math.abs(daysFromPlanting - transition.expectedDay) <= 2) {
      alerts.push({
        id: `stage_transition_${Date.now()}`,
        type: 'upcoming',
        severity: 'info',
        title: `Growth Stage Transition: ${transition.nextStage}`,
        malayalamTitle: `വളർച്ച ഘട്ട മാറ്റം: ${transition.nextStageMalayalam}`,
        message: `Your crop is expected to transition to ${transition.nextStage} stage in ${transition.expectedDay - daysFromPlanting} days.`,
        malayalamMessage: `നിങ്ങളുടെ വിള ${transition.expectedDay - daysFromPlanting} ദിവസത്തിനുള്ളിൽ ${transition.nextStageMalayalam} ഘട്ടത്തിലേക്ക് മാറുമെന്ന് പ്രതീക്ഷിക്കുന്നു.`,
        actionRequired: false,
        dueDate: new Date(Date.now() + (transition.expectedDay - daysFromPlanting) * 24 * 60 * 60 * 1000),
        location: cropData.fieldLocation,
        affectedCrops: [cropData.cropId]
      });
    }
  }

  // 6. Fertilizer Application Reminders
  const lastFertilizerActivity = activityLog
    .filter(activity => activity.type === 'fertilizer')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

  if (lastFertilizerActivity) {
    const daysSinceLastFertilizer = (Date.now() - lastFertilizerActivity.timestamp.getTime()) / (24 * 60 * 60 * 1000);
    const fertilizerSchedule = getFertilizerSchedule(cropData.name, cropData.currentStage.stage);
    
    if (daysSinceLastFertilizer >= fertilizerSchedule.intervalDays) {
      alerts.push({
        id: `fertilizer_reminder_${Date.now()}`,
        type: 'upcoming',
        severity: 'info',
        title: 'Fertilizer Application Due',
        malayalamTitle: 'വള പ്രയോഗത്തിന്റെ സമയം',
        message: `It's been ${Math.round(daysSinceLastFertilizer)} days since last fertilizer application. ${fertilizerSchedule.recommendation} is recommended.`,
        malayalamMessage: `കഴിഞ്ഞ വള പ്രയോഗത്തിന് ${Math.round(daysSinceLastFertilizer)} ദിവസമായി. ${fertilizerSchedule.recommendationMalayalam} ശുപാർശ ചെയ്യുന്നു.`,
        actionRequired: true,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        location: cropData.fieldLocation,
        affectedCrops: [cropData.cropId]
      });
    }
  }

  // 7. Harvest Readiness Alerts
  if (cropData.currentStage.stage === 'maturity') {
    const harvestReadinessScore = calculateHarvestReadiness(cropTwin);
    
    if (harvestReadinessScore > 80) {
      alerts.push({
        id: `harvest_ready_${Date.now()}`,
        type: 'immediate',
        severity: 'info',
        title: 'Crop Ready for Harvest',
        malayalamTitle: 'വിളവെടുപ്പിന് തയ്യാർ',
        message: `Your ${cropData.name} is ${harvestReadinessScore}% ready for harvest. Consider market conditions before harvesting.`,
        malayalamMessage: `നിങ്ങളുടെ ${cropData.malayalamName} ${harvestReadinessScore}% വിളവെടുപ്പിന് തയ്യാറാണ്. വിളവെടുപ്പിന് മുമ്പ് വിപണി സാഹചര്യങ്ങൾ പരിഗണിക്കുക.`,
        actionRequired: true,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        location: cropData.fieldLocation,
        affectedCrops: [cropData.cropId]
      });
    }
  }

  // 8. Seasonal Alerts
  const seasonalAlerts = generateSeasonalAlerts(cropData, new Date());
  alerts.push(...seasonalAlerts);

  // 9. Equipment Maintenance Alerts
  const equipmentAlerts = generateEquipmentMaintenanceAlerts(activityLog);
  alerts.push(...equipmentAlerts);

  // 10. Community Risk Alerts
  const communityAlerts = generateCommunityRiskAlerts(communitySignals, cropData.fieldLocation);
  alerts.push(...communityAlerts);

  // Sort alerts by priority and due date
  return alerts.sort((a, b) => {
    const priorityOrder = { critical: 3, warning: 2, info: 1 };
    const aPriority = priorityOrder[a.severity];
    const bPriority = priorityOrder[b.severity];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
  });
}

// Helper functions
function calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function getWeatherTypeInMalayalam(type: string): string {
  const translations = {
    heavy_rain: 'കനത്ത മഴ',
    drought: 'വരൾച്ച',
    cyclone: 'ചുഴലിക്കാറ്റ്',
    heat_wave: 'ചൂട് തരംഗം'
  };
  return translations[type as keyof typeof translations] || type;
}

function getExpectedStageTransitions(cropName: string) {
  const transitions = {
    rice: [
      { expectedDay: 15, nextStage: 'vegetative', nextStageMalayalam: 'വളർച്ചാ ഘട്ടം' },
      { expectedDay: 65, nextStage: 'flowering', nextStageMalayalam: 'പൂവിടൽ ഘട്ടം' },
      { expectedDay: 85, nextStage: 'fruiting', nextStageMalayalam: 'കായ്ക്കൽ ഘട്ടം' },
      { expectedDay: 120, nextStage: 'maturity', nextStageMalayalam: 'പക്വത ഘട്ടം' }
    ],
    coconut: [
      { expectedDay: 180, nextStage: 'flowering', nextStageMalayalam: 'പൂവിടൽ ഘട്ടം' },
      { expectedDay: 365, nextStage: 'fruiting', nextStageMalayalam: 'കായ്ക്കൽ ഘട്ടം' }
    ]
  };
  
  const cropKey = cropName.toLowerCase();
  for (const [crop, trans] of Object.entries(transitions)) {
    if (cropKey.includes(crop)) {
      return trans;
    }
  }
  
  return [];
}

function getFertilizerSchedule(cropName: string, stage: string) {
  const schedules = {
    rice: {
      vegetative: { intervalDays: 15, recommendation: 'Urea 50kg/ha', recommendationMalayalam: 'യൂറിയ 50കി.ഗ്രാം/ഏക്കർ' },
      flowering: { intervalDays: 20, recommendation: 'DAP 25kg/ha', recommendationMalayalam: 'ഡിഎപി 25കി.ഗ്രാം/ഏക്കർ' },
      fruiting: { intervalDays: 25, recommendation: 'MOP 30kg/ha', recommendationMalayalam: 'എംഒപി 30കി.ഗ്രാം/ഏക്കർ' }
    }
  };
  
  const cropSchedules = schedules.rice;
  const stageSchedule = cropSchedules[stage as keyof typeof cropSchedules];
  
  return stageSchedule || { intervalDays: 21, recommendation: 'Balanced NPK', recommendationMalayalam: 'സമതുലിത NPK' };
}

function calculateHarvestReadiness(cropTwin: CropTwin): number {
  const { cropData, sensorData, riskAssessment } = cropTwin;
  
  let readiness = 70; // Base readiness for maturity stage
  
  // Health score contribution
  readiness += (cropTwin.healthScore - 70) * 0.3;
  
  // Risk assessment contribution (lower risk = higher readiness)
  readiness += (100 - riskAssessment.overall) * 0.2;
  
  // Days from planting (crop-specific optimal harvest window)
  const optimalHarvestDays = {
    rice: 130,
    coconut: 365,
    pepper: 240,
    cardamom: 180
  };
  
  const cropKey = cropData.name.toLowerCase();
  let optimalDays = 120; // Default
  
  for (const [crop, days] of Object.entries(optimalHarvestDays)) {
    if (cropKey.includes(crop)) {
      optimalDays = days;
      break;
    }
  }
  
  const daysFromPlanting = cropData.currentStage.daysFromPlanting;
  const daysDifference = Math.abs(daysFromPlanting - optimalDays);
  
  if (daysDifference <= 5) {
    readiness += 20; // Perfect timing
  } else if (daysDifference <= 10) {
    readiness += 10; // Good timing
  } else if (daysDifference > 20) {
    readiness -= 15; // Poor timing
  }
  
  return Math.min(100, Math.max(0, Math.round(readiness)));
}

function generateSeasonalAlerts(cropData: any, currentDate: Date): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  const currentMonth = currentDate.getMonth();
  
  // Kerala seasonal patterns
  if ([5, 6, 7, 8].includes(currentMonth)) { // Monsoon months
    alerts.push({
      id: `seasonal_monsoon_${Date.now()}`,
      type: 'seasonal',
      severity: 'info',
      title: 'Monsoon Season Preparations',
      malayalamTitle: 'മൺസൂൺ സീസൺ തയ്യാറെടുപ്പുകൾ',
      message: 'Monsoon season is active. Ensure proper drainage and disease prevention measures.',
      malayalamMessage: 'മൺസൂൺ സീസൺ സജീവമാണ്. ശരിയായ ഡ്രെയിനേജും രോഗ പ്രതിരോധ നടപടികളും ഉറപ്പാക്കുക.',
      actionRequired: false,
      location: cropData.fieldLocation,
      affectedCrops: [cropData.cropId]
    });
  }
  
  if ([2, 3, 4].includes(currentMonth)) { // Pre-monsoon months
    alerts.push({
      id: `seasonal_premonsoon_${Date.now()}`,
      type: 'seasonal',
      severity: 'info',
      title: 'Pre-monsoon Preparations',
      malayalamTitle: 'മൺസൂൺ പൂർവ തയ്യാറെടുപ്പുകൾ',
      message: 'Pre-monsoon season. Consider water conservation and heat protection measures.',
      malayalamMessage: 'മൺസൂൺ പൂർവ കാലം. ജല സംരക്ഷണവും ചൂട് സംരക്ഷണ നടപടികളും പരിഗണിക്കുക.',
      actionRequired: false,
      location: cropData.fieldLocation,
      affectedCrops: [cropData.cropId]
    });
  }
  
  return alerts;
}

function generateEquipmentMaintenanceAlerts(activityLog: any[]): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  
  // Check for equipment usage patterns
  const sprayingActivities = activityLog.filter(a => 
    a.type === 'pesticide' && 
    (Date.now() - a.timestamp.getTime()) < 30 * 24 * 60 * 60 * 1000 // Last 30 days
  );
  
  if (sprayingActivities.length > 5) {
    alerts.push({
      id: `equipment_maintenance_${Date.now()}`,
      type: 'upcoming',
      severity: 'info',
      title: 'Sprayer Maintenance Due',
      malayalamTitle: 'സ്പ്രേയർ അറ്റകുറ്റപ്പണി ആവശ്യം',
      message: 'Heavy sprayer usage detected. Schedule maintenance to ensure optimal performance.',
      malayalamMessage: 'സ്പ്രേയറിന്റെ അമിത ഉപയോഗം കണ്ടെത്തി. ഒപ്റ്റിമൽ പ്രകടനം ഉറപ്പാക്കാൻ അറ്റകുറ്റപ്പണി ആസൂത്രണം ചെയ്യുക.',
      actionRequired: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: { lat: 0, lng: 0 },
      affectedCrops: []
    });
  }
  
  return alerts;
}

function generateCommunityRiskAlerts(
  communitySignals: any[], 
  fieldLocation: { lat: number; lng: number }
): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  
  // Analyze community signals for area-wide risks
  const nearbySignals = communitySignals.filter(signal =>
    calculateDistance(signal.location, fieldLocation) < 10 // Within 10km
  );
  
  const diseaseOutbreaks = nearbySignals.filter(s => 
    s.type === 'disease_outbreak' && 
    (Date.now() - s.timestamp.getTime()) < 14 * 24 * 60 * 60 * 1000 // Last 14 days
  );
  
  if (diseaseOutbreaks.length > 3) {
    alerts.push({
      id: `community_disease_${Date.now()}`,
      type: 'upcoming',
      severity: 'warning',
      title: 'Area Disease Outbreak Alert',
      malayalamTitle: 'പ്രദേശിക രോഗബാധ മുന്നറിയിപ്പ്',
      message: `${diseaseOutbreaks.length} disease outbreaks reported in your area. Enhanced monitoring recommended.`,
      malayalamMessage: `നിങ്ങളുടെ പ്രദേശത്ത് ${diseaseOutbreaks.length} രോഗബാധകൾ റിപ്പോർട്ട് ചെയ്യപ്പെട്ടിട്ടുണ്ട്. കൂടുതൽ നിരീക്ഷണം ശുപാർശ ചെയ്യുന്നു.`,
      actionRequired: true,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      location: fieldLocation,
      affectedCrops: []
    });
  }
  
  return alerts;
}
