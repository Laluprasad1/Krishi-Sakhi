import { CropTwin, FederatedLearningModel, Activity } from '@/types/cropTwin';

interface LearningUpdate {
  cropType: string;
  region: string;
  seasonalPatterns: any;
  treatmentEffectiveness: any;
  riskPatterns: any;
  timestamp: Date;
}

interface GlobalModel {
  version: string;
  accuracy: number;
  participatingFarmers: number;
  lastUpdate: Date;
  regionSpecificInsights: { [region: string]: any };
}

export class FederatedLearningService {
  private globalModel: GlobalModel;
  private localUpdates: Map<string, LearningUpdate[]> = new Map();
  private privacyThreshold = 0.8; // Minimum privacy score required

  constructor() {
    this.globalModel = {
      version: '1.0.0',
      accuracy: 0.75,
      participatingFarmers: 0,
      lastUpdate: new Date(),
      regionSpecificInsights: {}
    };
  }

  // Update federated learning model with crop twin data
  async updateFederatedModel(cropTwin: CropTwin, activity?: Activity): Promise<void> {
    if (cropTwin.learningModel.privacyLevel !== 'high') {
      return; // Only process high privacy level data
    }

    const update = await this.generateLearningUpdate(cropTwin, activity);
    await this.addLocalUpdate(cropTwin.farmerId, update);
    await this.checkForGlobalModelUpdate();
  }

  // Generate learning insights from crop twin data
  private async generateLearningUpdate(cropTwin: CropTwin, activity?: Activity): Promise<LearningUpdate> {
    const { farmerProfile, cropData, sensorData, riskAssessment, recommendations, activityLog } = cropTwin;

    return {
      cropType: cropData.name,
      region: `${farmerProfile.location.district}_${farmerProfile.location.taluk}`,
      seasonalPatterns: await this.extractSeasonalPatterns(sensorData, cropData),
      treatmentEffectiveness: await this.analyzeTreatmentEffectiveness(activityLog, riskAssessment),
      riskPatterns: await this.extractRiskPatterns(riskAssessment, sensorData),
      timestamp: new Date()
    };
  }

  // Extract seasonal patterns from sensor data
  private async extractSeasonalPatterns(sensorData: any[], cropData: any): Promise<any> {
    if (sensorData.length < 30) {
      return null; // Insufficient data for pattern analysis
    }

    // Analyze temperature, humidity, and rainfall patterns
    const patterns = {
      temperaturePatterns: this.analyzeTemperaturePatterns(sensorData),
      humidityPatterns: this.analyzeHumidityPatterns(sensorData),
      rainfallPatterns: this.analyzeRainfallPatterns(sensorData),
      growthStageCorrelations: this.analyzeGrowthStageCorrelations(sensorData, cropData)
    };

    return this.anonymizeData(patterns);
  }

  // Analyze treatment effectiveness
  private async analyzeTreatmentEffectiveness(activityLog: Activity[], riskAssessment: any): Promise<any> {
    const treatments = activityLog.filter(activity => 
      ['pesticide', 'fertilizer', 'irrigation'].includes(activity.type)
    );

    if (treatments.length === 0) {
      return null;
    }

    const effectiveness = {
      pesticideEffectiveness: this.analyzePesticideEffectiveness(treatments, riskAssessment),
      fertilizerResponse: this.analyzeFertilizerResponse(treatments, riskAssessment),
      irrigationResponse: this.analyzeIrrigationResponse(treatments, riskAssessment)
    };

    return this.anonymizeData(effectiveness);
  }

  // Extract risk patterns
  private async extractRiskPatterns(riskAssessment: any, sensorData: any[]): Promise<any> {
    const patterns = {
      riskThresholds: this.identifyRiskThresholds(riskAssessment, sensorData),
      environmentalTriggers: this.identifyEnvironmentalTriggers(riskAssessment, sensorData),
      seasonalRiskVariations: this.analyzeSeasonalRiskVariations(riskAssessment)
    };

    return this.anonymizeData(patterns);
  }

  // Add local update to the queue
  private async addLocalUpdate(farmerId: string, update: LearningUpdate): Promise<void> {
    if (!this.localUpdates.has(farmerId)) {
      this.localUpdates.set(farmerId, []);
    }

    const updates = this.localUpdates.get(farmerId)!;
    updates.push(update);

    // Keep only last 100 updates per farmer
    if (updates.length > 100) {
      updates.splice(0, updates.length - 100);
    }
  }

  // Check if global model should be updated
  private async checkForGlobalModelUpdate(): Promise<void> {
    const totalUpdates = Array.from(this.localUpdates.values())
      .reduce((total, updates) => total + updates.length, 0);

    // Update global model when we have sufficient local updates
    if (totalUpdates >= 50) {
      await this.aggregateAndUpdateGlobalModel();
    }
  }

  // Aggregate local updates and update global model
  private async aggregateAndUpdateGlobalModel(): Promise<void> {
    const allUpdates = Array.from(this.localUpdates.values()).flat();
    
    // Group updates by crop type and region
    const groupedUpdates = this.groupUpdatesByCropAndRegion(allUpdates);

    // Aggregate insights using federated averaging
    const aggregatedInsights = await this.federatedAveraging(groupedUpdates);

    // Update global model
    this.globalModel = {
      ...this.globalModel,
      version: this.incrementVersion(this.globalModel.version),
      accuracy: await this.calculateGlobalAccuracy(aggregatedInsights),
      participatingFarmers: this.localUpdates.size,
      lastUpdate: new Date(),
      regionSpecificInsights: aggregatedInsights
    };

    // Clear processed updates
    this.localUpdates.clear();

    console.log('Global model updated:', {
      version: this.globalModel.version,
      accuracy: this.globalModel.accuracy,
      participatingFarmers: this.globalModel.participatingFarmers
    });
  }

  // Group updates by crop type and region
  private groupUpdatesByCropAndRegion(updates: LearningUpdate[]): { [key: string]: LearningUpdate[] } {
    const grouped: { [key: string]: LearningUpdate[] } = {};

    updates.forEach(update => {
      const key = `${update.cropType}_${update.region}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(update);
    });

    return grouped;
  }

  // Federated averaging algorithm
  private async federatedAveraging(groupedUpdates: { [key: string]: LearningUpdate[] }): Promise<any> {
    const aggregatedInsights: any = {};

    for (const [key, updates] of Object.entries(groupedUpdates)) {
      if (updates.length < 3) continue; // Require minimum 3 updates for aggregation

      aggregatedInsights[key] = {
        averageSeasonalPatterns: this.averageSeasonalPatterns(updates),
        averageTreatmentEffectiveness: this.averageTreatmentEffectiveness(updates),
        commonRiskPatterns: this.identifyCommonRiskPatterns(updates),
        sampleSize: updates.length,
        confidenceScore: this.calculateConfidenceScore(updates)
      };
    }

    return aggregatedInsights;
  }

  // Average seasonal patterns across updates
  private averageSeasonalPatterns(updates: LearningUpdate[]): any {
    const validPatterns = updates
      .map(u => u.seasonalPatterns)
      .filter(p => p !== null);

    if (validPatterns.length === 0) return null;

    // Aggregate temperature patterns
    const avgTemperature = validPatterns.reduce((acc, pattern) => {
      if (pattern.temperaturePatterns) {
        acc.count++;
        acc.sum += pattern.temperaturePatterns.average || 0;
        acc.variance += pattern.temperaturePatterns.variance || 0;
      }
      return acc;
    }, { sum: 0, variance: 0, count: 0 });

    return {
      averageTemperature: avgTemperature.count > 0 ? avgTemperature.sum / avgTemperature.count : null,
      temperatureVariance: avgTemperature.count > 0 ? avgTemperature.variance / avgTemperature.count : null,
      sampleSize: validPatterns.length
    };
  }

  // Average treatment effectiveness
  private averageTreatmentEffectiveness(updates: LearningUpdate[]): any {
    const validTreatments = updates
      .map(u => u.treatmentEffectiveness)
      .filter(t => t !== null);

    if (validTreatments.length === 0) return null;

    return {
      pesticideSuccess: this.calculateAverageSuccessRate(validTreatments, 'pesticideEffectiveness'),
      fertilizerResponse: this.calculateAverageResponse(validTreatments, 'fertilizerResponse'),
      sampleSize: validTreatments.length
    };
  }

  // Identify common risk patterns
  private identifyCommonRiskPatterns(updates: LearningUpdate[]): any {
    const riskPatterns = updates
      .map(u => u.riskPatterns)
      .filter(r => r !== null);

    if (riskPatterns.length === 0) return null;

    // Find patterns that appear in majority of updates
    const commonThresholds = this.findCommonThresholds(riskPatterns);
    const commonTriggers = this.findCommonTriggers(riskPatterns);

    return {
      commonThresholds,
      commonTriggers,
      patternFrequency: this.calculatePatternFrequency(riskPatterns)
    };
  }

  // Anonymize sensitive data before sharing
  private anonymizeData(data: any): any {
    if (!data) return null;

    // Remove any personally identifiable information
    // Apply differential privacy techniques
    const anonymized = JSON.parse(JSON.stringify(data));

    // Add noise to numerical values for privacy
    this.addDifferentialPrivacyNoise(anonymized);

    return anonymized;
  }

  // Add differential privacy noise
  private addDifferentialPrivacyNoise(data: any, epsilon: number = 0.1): void {
    const traverse = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] === 'number') {
          // Add Laplace noise for differential privacy
          const noise = this.generateLaplaceNoise(epsilon);
          obj[key] = Math.max(0, obj[key] + noise);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key]);
        }
      }
    };

    traverse(data);
  }

  // Generate Laplace noise for differential privacy
  private generateLaplaceNoise(epsilon: number): number {
    const u = Math.random() - 0.5;
    const scale = 1 / epsilon;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  // Get personalized recommendations based on global model
  async getPersonalizedRecommendations(cropTwin: CropTwin): Promise<any[]> {
    const { farmerProfile, cropData } = cropTwin;
    const key = `${cropData.name}_${farmerProfile.location.district}_${farmerProfile.location.taluk}`;

    const regionInsights = this.globalModel.regionSpecificInsights[key];
    if (!regionInsights) {
      return []; // No regional insights available
    }

    const recommendations = [];

    // Use global patterns to enhance local recommendations
    if (regionInsights.averageSeasonalPatterns) {
      recommendations.push(this.generateSeasonalRecommendation(regionInsights.averageSeasonalPatterns));
    }

    if (regionInsights.averageTreatmentEffectiveness) {
      recommendations.push(this.generateTreatmentRecommendation(regionInsights.averageTreatmentEffectiveness));
    }

    if (regionInsights.commonRiskPatterns) {
      recommendations.push(this.generateRiskPreventionRecommendation(regionInsights.commonRiskPatterns));
    }

    return recommendations.filter(r => r !== null);
  }

  // Helper methods for analysis
  private analyzeTemperaturePatterns(sensorData: any[]): any {
    const temperatures = sensorData.map(d => d.ambientTemperature);
    return {
      average: temperatures.reduce((a, b) => a + b, 0) / temperatures.length,
      variance: this.calculateVariance(temperatures),
      trend: this.calculateTrend(temperatures)
    };
  }

  private analyzeHumidityPatterns(sensorData: any[]): any {
    const humidity = sensorData.map(d => d.humidity);
    return {
      average: humidity.reduce((a, b) => a + b, 0) / humidity.length,
      variance: this.calculateVariance(humidity)
    };
  }

  private analyzeRainfallPatterns(sensorData: any[]): any {
    const rainfall = sensorData.map(d => d.rainfall);
    return {
      total: rainfall.reduce((a, b) => a + b, 0),
      frequency: rainfall.filter(r => r > 0).length,
      intensity: rainfall.length > 0 ? Math.max(...rainfall) : 0
    };
  }

  private analyzeGrowthStageCorrelations(sensorData: any[], cropData: any): any {
    // Correlate environmental conditions with growth stages
    return {
      optimalConditions: this.identifyOptimalGrowthConditions(sensorData, cropData),
      stressIndicators: this.identifyStressIndicators(sensorData, cropData)
    };
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
  }

  private calculateTrend(numbers: number[]): string {
    if (numbers.length < 2) return 'stable';
    
    const firstHalf = numbers.slice(0, Math.floor(numbers.length / 2));
    const secondHalf = numbers.slice(Math.floor(numbers.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 1) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private async calculateGlobalAccuracy(insights: any): Promise<number> {
    // Calculate accuracy based on aggregated insights quality
    const totalInsights = Object.keys(insights).length;
    const highConfidenceInsights = Object.values(insights)
      .filter((insight: any) => insight.confidenceScore > 0.7).length;
    
    return totalInsights > 0 ? highConfidenceInsights / totalInsights : 0.75;
  }

  private calculateConfidenceScore(updates: LearningUpdate[]): number {
    // Calculate confidence based on sample size and data quality
    const sampleSize = updates.length;
    const dataQuality = updates.filter(u => 
      u.seasonalPatterns && u.treatmentEffectiveness && u.riskPatterns
    ).length / sampleSize;
    
    return Math.min(0.95, 0.5 + (sampleSize * 0.1) + (dataQuality * 0.3));
  }

  // Placeholder methods for specific analyses
  private analyzePesticideEffectiveness(treatments: Activity[], riskAssessment: any): any {
    return { effectivenessScore: 0.75, sampleSize: treatments.length };
  }

  private analyzeFertilizerResponse(treatments: Activity[], riskAssessment: any): any {
    return { responseScore: 0.8, sampleSize: treatments.length };
  }

  private analyzeIrrigationResponse(treatments: Activity[], riskAssessment: any): any {
    return { responseScore: 0.85, sampleSize: treatments.length };
  }

  private identifyRiskThresholds(riskAssessment: any, sensorData: any[]): any {
    return { pestThreshold: 60, diseaseThreshold: 50, weatherThreshold: 70 };
  }

  private identifyEnvironmentalTriggers(riskAssessment: any, sensorData: any[]): any {
    return { temperatureTriggers: [30, 35], humidityTriggers: [80, 90] };
  }

  private analyzeSeasonalRiskVariations(riskAssessment: any): any {
    return { highRiskMonths: [6, 7, 8], lowRiskMonths: [12, 1, 2] };
  }

  private calculateAverageSuccessRate(treatments: any[], field: string): number {
    const values = treatments.map(t => t[field]?.effectivenessScore || 0).filter(v => v > 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private calculateAverageResponse(treatments: any[], field: string): number {
    const values = treatments.map(t => t[field]?.responseScore || 0).filter(v => v > 0);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }

  private findCommonThresholds(patterns: any[]): any {
    return { temperature: 28, humidity: 75, moisture: 50 };
  }

  private findCommonTriggers(patterns: any[]): any {
    return { highRisk: ['high_humidity', 'temperature_spike'], lowRisk: ['optimal_moisture'] };
  }

  private calculatePatternFrequency(patterns: any[]): any {
    return { frequency: 0.8, reliability: 0.85 };
  }

  private identifyOptimalGrowthConditions(sensorData: any[], cropData: any): any {
    return { temperature: [25, 30], humidity: [60, 75], moisture: [45, 65] };
  }

  private identifyStressIndicators(sensorData: any[], cropData: any): any {
    return { temperatureStress: 35, moistureStress: 20, humidityStress: 90 };
  }

  private generateSeasonalRecommendation(patterns: any): any {
    return {
      type: 'seasonal_insight',
      title: 'Seasonal Pattern Based Recommendation',
      content: 'Based on regional patterns, optimal planting window is approaching.',
      confidence: 0.8
    };
  }

  private generateTreatmentRecommendation(effectiveness: any): any {
    return {
      type: 'treatment_insight',
      title: 'Treatment Effectiveness Insight',
      content: 'Regional data shows higher success rates with organic treatments.',
      confidence: 0.75
    };
  }

  private generateRiskPreventionRecommendation(riskPatterns: any): any {
    return {
      type: 'risk_prevention',
      title: 'Risk Prevention Based on Regional Patterns',
      content: 'Early monitoring recommended based on common risk triggers in your area.',
      confidence: 0.85
    };
  }
}

// Export singleton instance
export const federatedLearningService = new FederatedLearningService();

// Update function for external use
export async function updateFederatedModel(cropTwin: CropTwin, activity?: Activity): Promise<void> {
  await federatedLearningService.updateFederatedModel(cropTwin, activity);
}
