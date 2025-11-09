import { CropTwin, FarmerProfile, CropData, SensorData, WeatherData, CommunitySignal, RiskAssessment, Recommendation, ProactiveAlert } from '@/types/cropTwin';
import { generateCropRecommendations } from './recommendationEngine.js';
import { assessCropRisks } from './riskAssessment.js';
import { generateProactiveAlerts } from './alertSystem.js';
import { updateFederatedModel } from './federatedLearning.js';

export class CropTwinEngine {
  private cropTwins: Map<string, CropTwin> = new Map();
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeRealTimeUpdates();
  }

  // Create a new crop twin for a farmer
  async createCropTwin(
    farmerId: string,
    farmerProfile: FarmerProfile,
    cropData: CropData
  ): Promise<CropTwin> {
    const cropTwinId = `${farmerId}_${cropData.cropId}_${Date.now()}`;
    
    const cropTwin: CropTwin = {
      id: cropTwinId,
      farmerId,
      farmerProfile,
      cropData,
      sensorData: [],
      weatherData: await this.fetchWeatherData(farmerProfile.location.coordinates),
      communitySignals: [],
      healthScore: 85, // Initial healthy score
      riskAssessment: await assessCropRisks(cropData, [], []),
      recommendations: [],
      activityLog: [],
      learningModel: {
        modelVersion: '1.0.0',
        lastUpdate: new Date(),
        localAccuracy: 0.75,
        globalContribution: 0,
        privacyLevel: 'high',
        dataPoints: 0,
        improvementSuggestions: [],
        malayalamImprovementSuggestions: []
      }
    };

    // Generate initial recommendations
    cropTwin.recommendations = await generateCropRecommendations(cropTwin);
    
    this.cropTwins.set(cropTwinId, cropTwin);
    this.startRealTimeUpdates(cropTwinId);
    
    return cropTwin;
  }

  // Update crop twin with new sensor data
  async updateSensorData(cropTwinId: string, sensorData: SensorData): Promise<void> {
    const cropTwin = this.cropTwins.get(cropTwinId);
    if (!cropTwin) throw new Error('Crop twin not found');

    cropTwin.sensorData.push(sensorData);
    
    // Keep only last 100 readings for performance
    if (cropTwin.sensorData.length > 100) {
      cropTwin.sensorData = cropTwin.sensorData.slice(-100);
    }

    await this.recalculateCropTwin(cropTwin);
  }

  // Update crop twin with community signals
  async updateCommunitySignals(cropTwinId: string, signal: CommunitySignal): Promise<void> {
    const cropTwin = this.cropTwins.get(cropTwinId);
    if (!cropTwin) throw new Error('Crop twin not found');

    // Check if signal is relevant (within 5km radius)
    const distance = this.calculateDistance(
      cropTwin.cropData.fieldLocation,
      signal.location
    );

    if (distance <= 5) {
      cropTwin.communitySignals.push(signal);
      await this.recalculateCropTwin(cropTwin);
    }
  }

  // Get proactive recommendations for a crop twin
  async getProactiveRecommendations(cropTwinId: string): Promise<Recommendation[]> {
    const cropTwin = this.cropTwins.get(cropTwinId);
    if (!cropTwin) throw new Error('Crop twin not found');

    return await generateCropRecommendations(cropTwin);
  }

  // Get current alerts for a crop twin
  async getProactiveAlerts(cropTwinId: string): Promise<ProactiveAlert[]> {
    const cropTwin = this.cropTwins.get(cropTwinId);
    if (!cropTwin) throw new Error('Crop twin not found');

    return await generateProactiveAlerts(cropTwin);
  }

  // Record farmer activity
  async recordActivity(cropTwinId: string, activity: any): Promise<void> {
    const cropTwin = this.cropTwins.get(cropTwinId);
    if (!cropTwin) throw new Error('Crop twin not found');

    cropTwin.activityLog.push(activity);
    
    // Update learning model with new activity
    await updateFederatedModel(cropTwin, activity);
    
    // Recalculate recommendations based on new activity
    await this.recalculateCropTwin(cropTwin);
  }

  // Get crop twin by ID
  getCropTwin(cropTwinId: string): CropTwin | undefined {
    return this.cropTwins.get(cropTwinId);
  }

  // Get all crop twins for a farmer
  getFarmerCropTwins(farmerId: string): CropTwin[] {
    return Array.from(this.cropTwins.values())
      .filter(twin => twin.farmerId === farmerId);
  }

  // Private methods
  private async recalculateCropTwin(cropTwin: CropTwin): Promise<void> {
    // Update risk assessment
    cropTwin.riskAssessment = await assessCropRisks(
      cropTwin.cropData,
      cropTwin.sensorData,
      cropTwin.communitySignals
    );

    // Calculate new health score
    cropTwin.healthScore = this.calculateHealthScore(cropTwin);

    // Generate updated recommendations
    cropTwin.recommendations = await generateCropRecommendations(cropTwin);

    // Update weather data
    cropTwin.weatherData = await this.fetchWeatherData(
      cropTwin.cropData.fieldLocation
    );

    // Update federated learning model
    await updateFederatedModel(cropTwin);
  }

  private calculateHealthScore(cropTwin: CropTwin): number {
    const risks = cropTwin.riskAssessment.breakdown;
    const sensorHealth = this.assessSensorHealth(cropTwin.sensorData);
    const communityImpact = this.assessCommunityImpact(cropTwin.communitySignals);

    // Weighted calculation
    const riskScore = (100 - (risks.pest + risks.disease + risks.weather + risks.nutrient + risks.water) / 5);
    const combinedScore = (riskScore * 0.4) + (sensorHealth * 0.4) + (communityImpact * 0.2);

    return Math.max(0, Math.min(100, combinedScore));
  }

  private assessSensorHealth(sensorData: SensorData[]): number {
    if (sensorData.length === 0) return 75; // Default score

    const latest = sensorData[sensorData.length - 1];
    let score = 100;

    // Assess soil moisture (optimal: 40-60%)
    if (latest.soilMoisture < 20 || latest.soilMoisture > 80) score -= 20;
    else if (latest.soilMoisture < 30 || latest.soilMoisture > 70) score -= 10;

    // Assess soil pH (optimal: 6.0-7.5)
    if (latest.soilPH < 5.5 || latest.soilPH > 8.0) score -= 15;
    else if (latest.soilPH < 6.0 || latest.soilPH > 7.5) score -= 5;

    // Assess temperature stress
    if (latest.soilTemperature < 10 || latest.soilTemperature > 40) score -= 15;

    return Math.max(0, score);
  }

  private assessCommunityImpact(signals: CommunitySignal[]): number {
    if (signals.length === 0) return 85; // Neutral score

    let impactScore = 85;
    const recentSignals = signals.filter(
      s => Date.now() - s.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    for (const signal of recentSignals) {
      switch (signal.type) {
        case 'pest_sighting':
        case 'disease_outbreak':
          impactScore -= signal.confidence * 10;
          break;
        case 'good_yield':
          impactScore += signal.confidence * 5;
          break;
      }
    }

    return Math.max(0, Math.min(100, impactScore));
  }

  private async fetchWeatherData(coordinates: { lat: number; lng: number }): Promise<WeatherData> {
    // Mock weather data - in production, integrate with weather API
    return {
      current: {
        temperature: 28,
        humidity: 75,
        rainfall: 0,
        windSpeed: 12,
        uvIndex: 6,
        pressure: 1013
      },
      forecast: [],
      alerts: []
    };
  }

  private calculateDistance(coord1: { lat: number; lng: number }, coord2: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private initializeRealTimeUpdates(): void {
    // Set up periodic updates every 15 minutes
    setInterval(() => {
      this.cropTwins.forEach(async (cropTwin) => {
        await this.recalculateCropTwin(cropTwin);
      });
    }, 15 * 60 * 1000);
  }

  private startRealTimeUpdates(cropTwinId: string): void {
    // Individual crop twin update every 5 minutes
    const interval = setInterval(async () => {
      const cropTwin = this.cropTwins.get(cropTwinId);
      if (cropTwin) {
        await this.recalculateCropTwin(cropTwin);
      } else {
        clearInterval(interval);
        this.updateIntervals.delete(cropTwinId);
      }
    }, 5 * 60 * 1000);

    this.updateIntervals.set(cropTwinId, interval);
  }

  // Cleanup method
  dispose(): void {
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();
    this.cropTwins.clear();
  }
}

export const cropTwinEngine = new CropTwinEngine();
