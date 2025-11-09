export interface FarmerProfile {
  id: string;
  name: string;
  location: {
    district: string;
    taluk: string;
    village: string;
    coordinates: { lat: number; lng: number };
  };
  farmSize: number;
  experience: number;
  preferredLanguage: 'ml' | 'en';
  communicationPreference: 'voice' | 'text' | 'both';
  schemes: string[];
  certifications: string[];
}

export interface CropData {
  cropId: string;
  name: string;
  malayalamName: string;
  variety: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  currentStage: CropStage;
  area: number;
  fieldLocation: { lat: number; lng: number };
}

export interface CropStage {
  name: string;
  malayalamName: string;
  stage: 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity';
  daysFromPlanting: number;
  healthScore: number;
  riskFactors: RiskFactor[];
}

export interface RiskFactor {
  type: 'pest' | 'disease' | 'weather' | 'nutrient' | 'water';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  malayalamDescription: string;
  recommendation: string;
  malayalamRecommendation: string;
}

export interface SensorData {
  timestamp: Date;
  soilMoisture: number;
  soilTemperature: number;
  soilPH: number;
  ambientTemperature: number;
  humidity: number;
  lightIntensity: number;
  rainfall: number;
}

export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    uvIndex: number;
    pressure: number;
  };
  forecast: WeatherForecast[];
  alerts: WeatherAlert[];
}

export interface WeatherForecast {
  date: Date;
  temperature: { min: number; max: number };
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
}

export interface WeatherAlert {
  type: 'heavy_rain' | 'drought' | 'cyclone' | 'heat_wave';
  severity: 'watch' | 'warning' | 'alert';
  message: string;
  malayalamMessage: string;
  validUntil: Date;
}

export interface CommunitySignal {
  farmerId: string;
  location: { lat: number; lng: number };
  observation: string;
  malayalamObservation: string;
  type: 'pest_sighting' | 'disease_outbreak' | 'good_yield' | 'market_price';
  timestamp: Date;
  confidence: number;
  verified: boolean;
}

export interface CropTwin {
  id: string;
  farmerId: string;
  farmerProfile: FarmerProfile;
  cropData: CropData;
  sensorData: SensorData[];
  weatherData: WeatherData;
  communitySignals: CommunitySignal[];
  healthScore: number;
  riskAssessment: RiskAssessment;
  recommendations: Recommendation[];
  activityLog: Activity[];
  learningModel: FederatedLearningModel;
}

export interface RiskAssessment {
  overall: number;
  breakdown: {
    pest: number;
    disease: number;
    weather: number;
    nutrient: number;
    water: number;
  };
  trends: RiskTrend[];
}

export interface RiskTrend {
  factor: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: string;
}

export interface Recommendation {
  id: string;
  type: 'preventive' | 'corrective' | 'advisory';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  malayalamTitle: string;
  description: string;
  malayalamDescription: string;
  actionItems: ActionItem[];
  timing: string;
  malayalamTiming: string;
  confidence: number;
  explainability: Explainability;
}

export interface ActionItem {
  task: string;
  malayalamTask: string;
  dueDate: Date;
  materials: string[];
  malayalamMaterials: string[];
  cost: number;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Explainability {
  reasoning: string;
  malayalamReasoning: string;
  dataSource: string[];
  confidence: number;
  alternatives: Alternative[];
}

export interface Alternative {
  option: string;
  malayalamOption: string;
  pros: string[];
  malayalamPros: string[];
  cons: string[];
  malayalamCons: string[];
}

export interface Activity {
  id: string;
  type: 'planting' | 'irrigation' | 'fertilizer' | 'pesticide' | 'harvest' | 'observation';
  timestamp: Date;
  description: string;
  malayalamDescription: string;
  location: { lat: number; lng: number };
  materials: string[];
  cost: number;
  photos: string[];
  notes: string;
  malayalamNotes: string;
  schemeEligible: boolean;
  verified: boolean;
}

export interface FederatedLearningModel {
  modelVersion: string;
  lastUpdate: Date;
  localAccuracy: number;
  globalContribution: number;
  privacyLevel: 'high' | 'medium' | 'low';
  dataPoints: number;
  improvementSuggestions: string[];
  malayalamImprovementSuggestions: string[];
}

export interface ProactiveAlert {
  id: string;
  type: 'immediate' | 'upcoming' | 'seasonal';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  malayalamTitle: string;
  message: string;
  malayalamMessage: string;
  actionRequired: boolean;
  dueDate?: Date;
  location: { lat: number; lng: number };
  affectedCrops: string[];
}

export interface SchemeTracking {
  schemeId: string;
  schemeName: string;
  malayalamSchemeName: string;
  eligibilityCriteria: string[];
  trackedActivities: string[];
  completionPercentage: number;
  requiredDocuments: Document[];
  status: 'eligible' | 'applied' | 'approved' | 'rejected' | 'completed';
}

export interface Document {
  type: string;
  malayalamType: string;
  required: boolean;
  submitted: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}
