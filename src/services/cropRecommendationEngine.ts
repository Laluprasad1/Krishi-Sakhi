import { CropData } from '@/types/cropTwin';

export interface FarmerInput {
  farmSize: number; // in acres
  location: {
    district: string;
    taluk: string;
    village: string;
    coordinates: { lat: number; lng: number };
  };
  soilType: 'clay' | 'sandy' | 'loamy' | 'laterite' | 'alluvial';
  waterAvailability: 'abundant' | 'moderate' | 'scarce';
  experience: 'beginner' | 'intermediate' | 'expert';
  budget: 'low' | 'medium' | 'high';
  season: 'summer' | 'monsoon' | 'winter';
  previousCrops: string[];
  organicPreference: boolean;
  marketAccess: 'direct' | 'middleman' | 'cooperative' | 'online';
  laborAvailability: 'family' | 'hired' | 'mixed';
  irrigationFacility: 'none' | 'drip' | 'sprinkler' | 'flood' | 'rain_fed';
  // pH assessment - farmer-friendly approach
  soilCondition: 'very_acidic' | 'acidic' | 'neutral' | 'alkaline' | 'very_alkaline' | 'unknown';
  soilIndicators: {
    plantGrowth: 'poor' | 'average' | 'good'; // How do existing plants grow?
    soilColor: 'dark_black' | 'brown' | 'red' | 'yellow' | 'white_patches'; // Visual soil color
    waterDrainage: 'very_slow' | 'slow' | 'good' | 'too_fast'; // Water drainage
    commonWeeds: string[]; // What weeds grow commonly (indicates pH)
  };
}

export interface CropRecommendation {
  cropName: string;
  malayalamName: string;
  scientificName: string;
  suitabilityScore: number;
  expectedYield: number; // tons per acre
  expectedIncome: number; // rupees per acre
  investmentRequired: number; // rupees per acre
  roi: number; // return on investment percentage
  growthDuration: number; // days
  difficulty: 'easy' | 'medium' | 'hard';
  waterRequirement: 'low' | 'medium' | 'high';
  laborRequirement: 'low' | 'medium' | 'high';
  marketDemand: 'low' | 'medium' | 'high';
  riskFactors: string[];
  malayalamRiskFactors: string[];
  advantages: string[];
  malayalamAdvantages: string[];
  bestPlantingTime: string;
  malayalamBestPlantingTime: string;
  supportingSchemes: string[];
  malayalamSupportingSchemes: string[];
}

export class CropRecommendationEngine {
  private cropDatabase: { [key: string]: any } = {
    rice: {
      name: 'Rice',
      malayalamName: 'നെല്ല്',
      scientificName: 'Oryza sativa',
      baseYield: 3.5,
      baseIncome: 45000,
      baseInvestment: 25000,
      duration: 120,
      waterNeed: 'high',
      laborNeed: 'medium',
      suitableSoils: ['clay', 'loamy', 'alluvial'],
      suitableSeasons: ['monsoon', 'winter'],
      // September is perfect for 2nd crop (Virippu) planting
      septemberSuitability: 'high',
      // pH preferences for rice
      optimalPH: { min: 5.5, max: 7.0 },
      suitableSoilConditions: ['acidic', 'neutral'],
      difficulty: 'medium',
      riskFactors: ['Blast disease', 'Brown plant hopper', 'Flooding'],
      malayalamRiskFactors: ['ബ്ലാസ്റ്റ് രോഗം', 'തവിട്ട് ചാടുന്ന പുഴു', 'വെള്ളപ്പൊക്കം'],
      advantages: ['High demand', 'Government support', 'Traditional knowledge'],
      malayalamAdvantages: ['ഉയർന്ന ഡിമാൻഡ്', 'സർക്കാർ പിന്തുണ', 'പരമ്പരാഗത അറിവ്'],
      schemes: ['PM-KISAN', 'Rice subsidy scheme'],
      bestPlantingTime: 'September-October for second crop (Virippu)',
      malayalamBestPlantingTime: 'രണ്ടാം വിള (വിറിപ്പ്) സെപ്റ്റംബർ-ഒക്ടോബർ'
    },
    coconut: {
      name: 'Coconut',
      malayalamName: 'തെങ്ങ്',
      scientificName: 'Cocos nucifera',
      baseYield: 8000, // nuts per acre per year
      baseIncome: 60000,
      baseInvestment: 15000,
      duration: 2555, // 7 years to maturity
      waterNeed: 'medium',
      laborNeed: 'low',
      suitableSoils: ['sandy', 'loamy', 'laterite'],
      suitableSeasons: ['monsoon', 'summer'],
      // September is good for coconut sapling planting after monsoon
      septemberSuitability: 'medium',
      difficulty: 'easy',
      riskFactors: ['Root wilt', 'Rhinoceros beetle', 'Red palm weevil'],
      malayalamRiskFactors: ['വേരഴുകൽ', 'കാണ്ടാമൃഗ വണ്ട്', 'ചുവന്ന ഈന്തപ്പന വണ്ട്'],
      advantages: ['Long-term income', 'Multiple products', 'Low maintenance'],
      malayalamAdvantages: ['ദീർഘകാല വരുമാനം', 'ഒന്നിലധികം ഉൽപ്പന്നങ്ങൾ', 'കുറഞ്ഞ പരിചരണം'],
      schemes: ['Coconut Development Board schemes', 'Crop insurance'],
      bestPlantingTime: 'September-October good for sapling planting after monsoon',
      malayalamBestPlantingTime: 'മഴക്കാലത്തിന് ശേഷം സെപ്റ്റംബർ-ഒക്ടോബർ തൈകൾ നടാൻ നല്ലത്'
    },
    pepper: {
      name: 'Black Pepper',
      malayalamName: 'കുരുമുളക്',
      scientificName: 'Piper nigrum',
      baseYield: 1.5,
      baseIncome: 180000,
      baseInvestment: 45000,
      duration: 1095, // 3 years
      waterNeed: 'medium',
      laborNeed: 'high',
      suitableSoils: ['loamy', 'laterite'],
      suitableSeasons: ['monsoon'],
      // September is good for planting pepper vines after monsoon
      septemberSuitability: 'medium',
      difficulty: 'hard',
      riskFactors: ['Foot rot', 'Pollu beetle', 'Price volatility'],
      malayalamRiskFactors: ['കാൽചീയൽ', 'പൊള്ളു വണ്ട്', 'വില അസ്ഥിരത'],
      advantages: ['High value crop', 'Export potential', 'Spice board support'],
      malayalamAdvantages: ['ഉയർന്ന മൂല്യമുള്ള വിള', 'കയറ്റുമതി സാധ്യത', 'സ്പൈസ് ബോർഡ് പിന്തുണ'],
      schemes: ['Spice Board subsidies', 'Export promotion schemes'],
      bestPlantingTime: 'September-October after good monsoon rains',
      malayalamBestPlantingTime: 'നല്ല മഴയ്ക്ക് ശേഷം സെപ്റ്റംബർ-ഒക്ടോബർ'
    },
    cardamom: {
      name: 'Cardamom',
      malayalamName: 'ഏലം',
      scientificName: 'Elettaria cardamomum',
      baseYield: 0.8,
      baseIncome: 200000,
      baseInvestment: 50000,
      duration: 1095, // 3 years
      waterNeed: 'high',
      laborNeed: 'high',
      suitableSoils: ['loamy', 'laterite'],
      suitableSeasons: ['monsoon'],
      difficulty: 'hard',
      riskFactors: ['Capsule rot', 'Thrips', 'Shade management'],
      malayalamRiskFactors: ['കായ് ചീയൽ', 'ത്രിപ്സ്', 'നിഴൽ നിയന്ത്രണം'],
      advantages: ['Premium spice', 'High returns', 'Hill station suitable'],
      malayalamAdvantages: ['പ്രീമിയം മസാല', 'ഉയർന്ന വരുമാനം', 'മലനാട്ടിൽ അനുയോജ്യം'],
      schemes: ['Cardamom Board schemes', 'Hill area development']
    },
    banana: {
      name: 'Banana',
      malayalamName: 'വാഴ',
      scientificName: 'Musa acuminata',
      baseYield: 25,
      baseIncome: 75000,
      baseInvestment: 30000,
      duration: 365,
      waterNeed: 'high',
      laborNeed: 'medium',
      suitableSoils: ['loamy', 'alluvial'],
      suitableSeasons: ['monsoon', 'summer'],
      difficulty: 'medium',
      riskFactors: ['Panama disease', 'Nematodes', 'Wind damage'],
      malayalamRiskFactors: ['പനാമ രോഗം', 'നെമറ്റോഡുകൾ', 'കാറ്റിന്റെ നാശം'],
      advantages: ['Quick returns', 'High nutrition', 'Processing potential'],
      malayalamAdvantages: ['വേഗത്തിലുള്ള വരുമാനം', 'ഉയർന്ന പോഷകമൂല്യം', 'സംസ്കരണ സാധ്യത'],
      schemes: ['Banana mission', 'Horticulture schemes']
    },
    rubber: {
      name: 'Rubber',
      malayalamName: 'റബ്ബർ',
      scientificName: 'Hevea brasiliensis',
      baseYield: 1.8,
      baseIncome: 85000,
      baseInvestment: 20000,
      duration: 2555, // 7 years
      waterNeed: 'medium',
      laborNeed: 'medium',
      suitableSoils: ['laterite', 'loamy'],
      suitableSeasons: ['monsoon'],
      difficulty: 'medium',
      riskFactors: ['Leaf fall diseases', 'White root disease', 'Market fluctuation'],
      malayalamRiskFactors: ['ഇല വീഴ്ച രോഗങ്ങൾ', 'വെള്ള വേര് രോഗം', 'വിപണി ചാഞ്ചാട്ടം'],
      advantages: ['Steady income', 'Long productive life', 'Board support'],
      malayalamAdvantages: ['സ്ഥിരമായ വരുമാനം', 'ദീർഘ ഉൽപ്പാദന ജീവിതം', 'ബോർഡ് പിന്തുണ'],
      schemes: ['Rubber Board schemes', 'Replanting subsidies']
    },
    ginger: {
      name: 'Ginger',
      malayalamName: 'ഇഞ്ചി',
      scientificName: 'Zingiber officinale',
      baseYield: 4.5,
      baseIncome: 135000,
      baseInvestment: 40000,
      duration: 270,
      waterNeed: 'medium',
      laborNeed: 'high',
      suitableSoils: ['loamy', 'laterite'],
      suitableSeasons: ['monsoon'],
      difficulty: 'medium',
      riskFactors: ['Soft rot', 'Rhizome fly', 'Storage losses'],
      malayalamRiskFactors: ['മൃദു ചീയൽ', 'റൈസോം ഈച്ച', 'സംഭരണ നഷ്ടം'],
      advantages: ['High value', 'Medicinal properties', 'Processing demand'],
      malayalamAdvantages: ['ഉയർന്ന മൂല്യം', 'ഔഷധ ഗുണങ്ങൾ', 'സംസ്കരണ ആവശ്യം'],
      schemes: ['Spice development schemes', 'Organic certification support']
    },
    turmeric: {
      name: 'Turmeric',
      malayalamName: 'മഞ്ഞൾ',
      scientificName: 'Curcuma longa',
      baseYield: 3.8,
      baseIncome: 110000,
      baseInvestment: 35000,
      duration: 270,
      waterNeed: 'medium',
      laborNeed: 'medium',
      suitableSoils: ['loamy', 'alluvial'],
      // September is excellent for turmeric planting in Kerala
      septemberSuitability: 'high',
      suitableSeasons: ['monsoon'],
      difficulty: 'medium',
      riskFactors: ['Leaf blotch', 'Scale insects', 'Curing challenges'],
      malayalamRiskFactors: ['ഇല പൊള്ളൽ', 'സ്കേൽ പുഴുക്കൾ', 'ഉണക്കൽ വെല്ലുവിളികൾ'],
      advantages: ['Export quality', 'Health benefits', 'Value addition'],
      malayalamAdvantages: ['കയറ്റുമതി ഗുണമേന്മ', 'ആരോഗ്യ ഗുണങ്ങൾ', 'മൂല്യ വർദ്ധനവ്'],
      schemes: ['Turmeric mission', 'Quality improvement schemes'],
      bestPlantingTime: 'September-October is ideal for turmeric planting',
      malayalamBestPlantingTime: 'മഞ്ഞൾ നടാൻ സെപ്റ്റംബർ-ഒക്ടോബർ അനുയോജ്യം'
    },
    okra: {
      name: 'Okra (Lady\'s Finger)',
      malayalamName: 'വെണ്ടയ്ക്ക',
      scientificName: 'Abelmoschus esculentus',
      baseYield: 4.5,
      baseIncome: 35000,
      baseInvestment: 12000,
      duration: 90, // 3 months
      waterNeed: 'medium',
      laborNeed: 'medium',
      suitableSoils: ['loamy', 'sandy', 'alluvial'],
      suitableSeasons: ['summer', 'winter'],
      // September is perfect for okra as it's post-monsoon
      septemberSuitability: 'very_high',
      // pH preferences for okra
      optimalPH: { min: 6.0, max: 8.0 },
      suitableSoilConditions: ['neutral', 'alkaline'],
      difficulty: 'easy',
      riskFactors: ['Yellow vein mosaic virus', 'Fruit borer', 'Root rot'],
      malayalamRiskFactors: ['മഞ്ഞ് ഞരമ്പ് വൈറസ്', 'ഫ്രൂട് ബോറർ', 'വേരഴുകൽ'],
      advantages: ['Quick harvest', 'High demand', 'Multiple harvests'],
      malayalamAdvantages: ['പെട്ടെന്നുള്ള വിളവെടുപ്പ്', 'ഉയർന്ന ആവശ്യം', 'ഒന്നിലധികം വിളവ്'],
      schemes: ['Vegetable development schemes', 'Market linkage support'],
      bestPlantingTime: 'September-October perfect for post-monsoon planting',
      malayalamBestPlantingTime: 'മഴക്കാലത്തിന് ശേഷം സെപ്റ്റംബർ-ഒക്ടോബർ അനുയോജ്യം'
    },
    beans: {
      name: 'French Beans',
      malayalamName: 'ബീൻസ്',
      scientificName: 'Phaseolus vulgaris',
      baseYield: 3.2,
      baseIncome: 28000,
      baseInvestment: 10000,
      duration: 75, // 2.5 months
      waterNeed: 'medium',
      laborNeed: 'medium',
      suitableSoils: ['loamy', 'sandy'],
      suitableSeasons: ['winter', 'summer'],
      // September is excellent for beans - post monsoon, cooler weather coming
      septemberSuitability: 'very_high',
      // pH preferences for beans
      optimalPH: { min: 6.0, max: 7.5 },
      suitableSoilConditions: ['neutral', 'slightly_alkaline'],
      difficulty: 'easy',
      riskFactors: ['Anthracnose', 'Bean fly', 'Rust'],
      malayalamRiskFactors: ['ആന്ത്രക്നോസ്', 'ബീൻ ഈച്ച', 'തുരുമ്പ്'],
      advantages: ['Fast growing', 'Protein rich', 'Good market price'],
      malayalamAdvantages: ['വേഗം വളരുന്നത്', 'പ്രോട്ടീൻ സമൃദ്ധം', 'നല്ല വിപണി വില'],
      schemes: ['Vegetable mission', 'Nutritional garden schemes'],
      bestPlantingTime: 'September-November ideal for beans cultivation',
      malayalamBestPlantingTime: 'ബീൻസ് കൃഷിക്ക് സെപ്റ്റംബർ-നവംബർ അനുയോജ്യം'
    },
    tomato: {
      name: 'Tomato',
      malayalamName: 'തക്കാളി',
      scientificName: 'Solanum lycopersicum',
      baseYield: 8.5,
      baseIncome: 55000,
      baseInvestment: 18000,
      duration: 110, // 3.5 months
      waterNeed: 'medium',
      laborNeed: 'high',
      suitableSoils: ['loamy', 'sandy', 'alluvial'],
      suitableSeasons: ['winter', 'summer'],
      // September planting ensures harvest during peak demand (Dec-Jan)
      septemberSuitability: 'very_high',
      // pH preferences for tomato
      optimalPH: { min: 6.0, max: 7.0 },
      suitableSoilConditions: ['neutral'],
      difficulty: 'medium',
      riskFactors: ['Late blight', 'Fruit borer', 'Wilt diseases'],
      malayalamRiskFactors: ['ലേറ്റ് ബ്ലൈറ്റ്', 'ഫ്രൂട് ബോറർ', 'വാടൽ രോഗങ്ങൾ'],
      advantages: ['High yield potential', 'Good market demand', 'Processing opportunities'],
      malayalamAdvantages: ['ഉയർന്ന വിള സാധ്യത', 'നല്ല വിപണി ആവശ്യം', 'സംസ്കരണ അവസരങ്ങൾ'],
      schemes: ['Vegetable cluster development', 'Processing support schemes'],
      bestPlantingTime: 'September planting ensures December-January harvest during peak prices',
      malayalamBestPlantingTime: 'സെപ്റ്റംബർ നടൽ ഉയർന്ന വിലയുള്ള ഡിസംബർ-ജനുവരി വിളവെടുപ്പ് ഉറപ്പാക്കുന്നു'
    }
  };

  // Main recommendation function
  async generateRecommendations(farmerInput: FarmerInput): Promise<CropRecommendation[]> {
    const recommendations: CropRecommendation[] = [];

    for (const [cropKey, cropData] of Object.entries(this.cropDatabase)) {
      const suitabilityScore = this.calculateSuitabilityScore(farmerInput, cropData);
      
      if (suitabilityScore >= 40) { // Only recommend crops with 40%+ suitability
        const recommendation = this.createRecommendation(farmerInput, cropData, suitabilityScore);
        recommendations.push(recommendation);
      }
    }

    // Sort by suitability score (highest first)
    return recommendations.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  private calculateSuitabilityScore(farmerInput: FarmerInput, cropData: any): number {
    let score = 0;
    let maxScore = 0;

    // Soil compatibility (20 points)
    maxScore += 20;
    if (cropData.suitableSoils.includes(farmerInput.soilType)) {
      score += 20;
    } else {
      score += 5; // Partial points for adaptability
    }

    // Season compatibility (15 points)
    maxScore += 15;
    if (cropData.suitableSeasons.includes(farmerInput.season)) {
      score += 15;
    } else {
      score += 3;
    }

    // Water requirement vs availability (15 points)
    maxScore += 15;
    const waterScore = this.calculateWaterCompatibility(cropData.waterNeed, farmerInput.waterAvailability);
    score += waterScore;

    // Experience level compatibility (10 points)
    maxScore += 10;
    const experienceScore = this.calculateExperienceCompatibility(cropData.difficulty, farmerInput.experience);
    score += experienceScore;

    // Budget compatibility (10 points)
    maxScore += 10;
    const budgetScore = this.calculateBudgetCompatibility(cropData.baseInvestment, farmerInput.budget);
    score += budgetScore;

    // Farm size compatibility (10 points)
    maxScore += 10;
    const farmSizeScore = this.calculateFarmSizeCompatibility(farmerInput.farmSize, cropData.laborNeed);
    score += farmSizeScore;

    // Labor availability compatibility (10 points)
    maxScore += 10;
    const laborScore = this.calculateLaborCompatibility(cropData.laborNeed, farmerInput.laborAvailability);
    score += laborScore;

    // Market access compatibility (5 points)
    maxScore += 5;
    const marketScore = this.calculateMarketCompatibility(cropData.name, farmerInput.marketAccess);
    score += marketScore;

    // September planting bonus (15 points) - since it's currently September
    maxScore += 15;
    if (cropData.septemberSuitability) {
      switch (cropData.septemberSuitability) {
        case 'very_high':
          score += 15; // Perfect time for planting
          break;
        case 'high':
          score += 12; // Good time for planting
          break;
        case 'medium':
          score += 8; // Okay time for planting
          break;
        case 'low':
          score += 3; // Not ideal but possible
          break;
        default:
          score += 5; // Default for crops without specific September rating
      }
    } else {
      score += 5; // Default for crops without September suitability data
    }

    // Irrigation compatibility (5 points)
    maxScore += 5;
    const irrigationScore = this.calculateIrrigationCompatibility(cropData.waterNeed, farmerInput.irrigationFacility);
    score += irrigationScore;

    // pH/Soil condition compatibility (10 points)
    maxScore += 10;
    let soilCondition = farmerInput.soilCondition;
    if (soilCondition === 'unknown' && farmerInput.soilIndicators) {
      soilCondition = this.assessSoilCondition(farmerInput.soilIndicators);
    }
    const phScore = this.calculatePHCompatibility(cropData, soilCondition);
    score += phScore;

    return Math.round((score / maxScore) * 100);
  }

  private calculateWaterCompatibility(cropNeed: string, availability: string): number {
    const matrix = {
      low: { abundant: 15, moderate: 15, scarce: 12 },
      medium: { abundant: 15, moderate: 15, scarce: 8 },
      high: { abundant: 15, moderate: 12, scarce: 3 }
    };
    return matrix[cropNeed as keyof typeof matrix]?.[availability as keyof typeof matrix.low] || 0;
  }

  private calculateExperienceCompatibility(difficulty: string, experience: string): number {
    const matrix = {
      easy: { beginner: 10, intermediate: 10, expert: 10 },
      medium: { beginner: 5, intermediate: 10, expert: 10 },
      hard: { beginner: 2, intermediate: 7, expert: 10 }
    };
    return matrix[difficulty as keyof typeof matrix]?.[experience as keyof typeof matrix.easy] || 0;
  }

  private calculateBudgetCompatibility(investment: number, budget: string): number {
    const budgetRanges = {
      low: 30000,
      medium: 60000,
      high: 100000
    };

    const maxBudget = budgetRanges[budget as keyof typeof budgetRanges];
    if (investment <= maxBudget * 0.7) return 10;
    if (investment <= maxBudget) return 7;
    if (investment <= maxBudget * 1.3) return 4;
    return 1;
  }

  private calculateFarmSizeCompatibility(farmSize: number, laborNeed: string): number {
    if (laborNeed === 'low') return 10;
    if (laborNeed === 'medium') return farmSize >= 1 ? 10 : 6;
    if (laborNeed === 'high') return farmSize >= 2 ? 10 : farmSize >= 1 ? 7 : 4;
    return 5;
  }

  private calculateLaborCompatibility(cropLaborNeed: string, availability: string): number {
    const matrix = {
      low: { family: 10, hired: 10, mixed: 10 },
      medium: { family: 7, hired: 10, mixed: 10 },
      high: { family: 4, hired: 10, mixed: 8 }
    };
    return matrix[cropLaborNeed as keyof typeof matrix]?.[availability as keyof typeof matrix.low] || 0;
  }

  private calculateMarketCompatibility(cropName: string, marketAccess: string): number {
    const highValueCrops = ['Black Pepper', 'Cardamom', 'Ginger'];
    const isHighValue = highValueCrops.includes(cropName);

    if (marketAccess === 'direct' || marketAccess === 'cooperative') return 5;
    if (marketAccess === 'online' && isHighValue) return 5;
    if (marketAccess === 'middleman') return 3;
    return 2;
  }

  private calculateIrrigationCompatibility(waterNeed: string, irrigation: string): number {
    const matrix = {
      low: { none: 5, drip: 5, sprinkler: 5, flood: 5, rain_fed: 5 },
      medium: { none: 2, drip: 5, sprinkler: 5, flood: 4, rain_fed: 3 },
      high: { none: 1, drip: 5, sprinkler: 4, flood: 5, rain_fed: 2 }
    };
    return matrix[waterNeed as keyof typeof matrix]?.[irrigation as keyof typeof matrix.low] || 0;
  }

  private createRecommendation(farmerInput: FarmerInput, cropData: any, suitabilityScore: number): CropRecommendation {
    const adjustedYield = this.adjustYieldForConditions(cropData.baseYield, farmerInput, cropData);
    const adjustedIncome = this.adjustIncomeForConditions(cropData.baseIncome, farmerInput, cropData);
    const adjustedInvestment = this.adjustInvestmentForConditions(cropData.baseInvestment, farmerInput);

    return {
      cropName: cropData.name,
      malayalamName: cropData.malayalamName,
      scientificName: cropData.scientificName,
      suitabilityScore,
      expectedYield: adjustedYield,
      expectedIncome: adjustedIncome,
      investmentRequired: adjustedInvestment,
      roi: Math.round(((adjustedIncome - adjustedInvestment) / adjustedInvestment) * 100),
      growthDuration: cropData.duration,
      difficulty: cropData.difficulty,
      waterRequirement: cropData.waterNeed,
      laborRequirement: cropData.laborNeed,
      marketDemand: this.getMarketDemand(cropData.name),
      riskFactors: cropData.riskFactors,
      malayalamRiskFactors: cropData.malayalamRiskFactors,
      advantages: cropData.advantages,
      malayalamAdvantages: cropData.malayalamAdvantages,
      bestPlantingTime: this.getBestPlantingTime(cropData.name, farmerInput.season),
      malayalamBestPlantingTime: this.getBestPlantingTimeMalayalam(cropData.name, farmerInput.season),
      supportingSchemes: cropData.schemes || [],
      malayalamSupportingSchemes: this.translateSchemes(cropData.schemes || [])
    };
  }

  private adjustYieldForConditions(baseYield: number, farmerInput: FarmerInput, cropData: any): number {
    let multiplier = 1.0;

    // Adjust for soil type
    if (cropData.suitableSoils.includes(farmerInput.soilType)) {
      multiplier *= 1.1;
    } else {
      multiplier *= 0.8;
    }

    // Adjust for experience
    const experienceMultiplier = {
      beginner: 0.8,
      intermediate: 1.0,
      expert: 1.2
    };
    multiplier *= experienceMultiplier[farmerInput.experience];

    // Adjust for water availability
    if (cropData.waterNeed === 'high' && farmerInput.waterAvailability === 'scarce') {
      multiplier *= 0.6;
    } else if (cropData.waterNeed === 'low' && farmerInput.waterAvailability === 'abundant') {
      multiplier *= 1.1;
    }

    // Adjust for organic preference (typically 10-20% lower yield initially)
    if (farmerInput.organicPreference) {
      multiplier *= 0.85;
    }

    return Math.round(baseYield * multiplier * 100) / 100;
  }

  private adjustIncomeForConditions(baseIncome: number, farmerInput: FarmerInput, cropData: any): number {
    let multiplier = 1.0;

    // Organic premium (20-30% higher price)
    if (farmerInput.organicPreference) {
      multiplier *= 1.25;
    }

    // Market access premium
    const marketMultiplier = {
      direct: 1.2,
      cooperative: 1.15,
      online: 1.1,
      middleman: 0.9
    };
    multiplier *= marketMultiplier[farmerInput.marketAccess];

    // Location-based adjustments (Kerala districts)
    const locationMultiplier = this.getLocationMultiplier(farmerInput.location.district);
    multiplier *= locationMultiplier;

    return Math.round(baseIncome * multiplier);
  }

  private adjustInvestmentForConditions(baseInvestment: number, farmerInput: FarmerInput): number {
    let multiplier = 1.0;

    // Organic farming typically requires higher initial investment
    if (farmerInput.organicPreference) {
      multiplier *= 1.15;
    }

    // Scale economies
    if (farmerInput.farmSize > 3) {
      multiplier *= 0.9; // Bulk purchase advantages
    } else if (farmerInput.farmSize < 1) {
      multiplier *= 1.1; // Higher per-acre costs for small farms
    }

    return Math.round(baseInvestment * multiplier);
  }

  private getLocationMultiplier(district: string): number {
    const districtMultipliers = {
      'Thiruvananthapuram': 1.1,
      'Kollam': 1.05,
      'Pathanamthitta': 1.0,
      'Alappuzha': 1.05,
      'Kottayam': 1.1,
      'Idukki': 1.2, // Hill station premium
      'Ernakulam': 1.15,
      'Thrissur': 1.1,
      'Palakkad': 1.0,
      'Malappuram': 1.0,
      'Kozhikode': 1.05,
      'Wayanad': 1.15,
      'Kannur': 1.0,
      'Kasaragod': 1.0
    };

    return districtMultipliers[district as keyof typeof districtMultipliers] || 1.0;
  }

  private getMarketDemand(cropName: string): 'low' | 'medium' | 'high' {
    const highDemandCrops = ['Rice', 'Coconut', 'Banana', 'Ginger', 'Turmeric'];
    const mediumDemandCrops = ['Black Pepper', 'Cardamom', 'Rubber'];
    
    if (highDemandCrops.includes(cropName)) return 'high';
    if (mediumDemandCrops.includes(cropName)) return 'medium';
    return 'low';
  }

  private getBestPlantingTime(cropName: string, currentSeason: string): string {
    const plantingTimes = {
      'Rice': 'June-July (Kharif), November-December (Rabi)',
      'Coconut': 'May-June (Pre-monsoon)',
      'Black Pepper': 'May-June (Monsoon onset)',
      'Cardamom': 'April-May (Pre-monsoon)',
      'Banana': 'February-March, September-October',
      'Rubber': 'April-May (Monsoon onset)',
      'Ginger': 'April-May (Pre-monsoon)',
      'Turmeric': 'April-May (Pre-monsoon)'
    };

    return plantingTimes[cropName as keyof typeof plantingTimes] || 'Consult local agricultural officer';
  }

  private getBestPlantingTimeMalayalam(cropName: string, currentSeason: string): string {
    const plantingTimesMalayalam = {
      'Rice': 'ജൂൺ-ജൂലൈ (ഖരീഫ്), നവംബർ-ഡിസംബർ (റബി)',
      'Coconut': 'മെയ്-ജൂൺ (മൺസൂൺ പൂർവം)',
      'Black Pepper': 'മെയ്-ജൂൺ (മൺസൂൺ ആരംഭം)',
      'Cardamom': 'ഏപ്രിൽ-മെയ് (മൺസൂൺ പൂർവം)',
      'Banana': 'ഫെബ്രുവരി-മാർച്ച്, സെപ്റ്റംബർ-ഒക്ടോബർ',
      'Rubber': 'ഏപ്രിൽ-മെയ് (മൺസൂൺ ആരംഭം)',
      'Ginger': 'ഏപ്രിൽ-മെയ് (മൺസൂൺ പൂർവം)',
      'Turmeric': 'ഏപ്രിൽ-മെയ് (മൺസൂൺ പൂർവം)'
    };

    return plantingTimesMalayalam[cropName as keyof typeof plantingTimesMalayalam] || 'പ്രാദേശിക കാർഷിക ഓഫീസറെ സമീപിക്കുക';
  }

  private translateSchemes(schemes: string[]): string[] {
    const schemeTranslations = {
      'PM-KISAN': 'പിഎം-കിസാൻ',
      'Rice subsidy scheme': 'നെല്ല് സബ്സിഡി പദ്ധതി',
      'Coconut Development Board schemes': 'തെങ്ങ് വികസന ബോർഡ് പദ്ധതികൾ',
      'Crop insurance': 'വിള ഇൻഷുറൻസ്',
      'Spice Board subsidies': 'സ്പൈസ് ബോർഡ് സബ്സിഡികൾ',
      'Export promotion schemes': 'കയറ്റുമതി പ്രോത്സാഹന പദ്ധതികൾ',
      'Cardamom Board schemes': 'ഏലം ബോർഡ് പദ്ധതികൾ',
      'Hill area development': 'മലയോര വികസനം',
      'Banana mission': 'വാഴ മിഷൻ',
      'Horticulture schemes': 'ഹോർട്ടികൾച്ചർ പദ്ധതികൾ',
      'Rubber Board schemes': 'റബ്ബർ ബോർഡ് പദ്ധതികൾ',
      'Replanting subsidies': 'പുനർനടീൽ സബ്സിഡികൾ',
      'Spice development schemes': 'മസാല വികസന പദ്ധതികൾ',
      'Organic certification support': 'ജൈവ സാക്ഷ്യപത്ര പിന്തുണ',
      'Turmeric mission': 'മഞ്ഞൾ മിഷൻ',
      'Quality improvement schemes': 'ഗുണമേന്മ മെച്ചപ്പെടുത്തൽ പദ്ധതികൾ'
    };

    return schemes.map(scheme => 
      schemeTranslations[scheme as keyof typeof schemeTranslations] || scheme
    );
  }

  // pH Assessment methods for farmer-friendly soil condition detection
  assessSoilCondition(soilIndicators: any): 'very_acidic' | 'acidic' | 'neutral' | 'alkaline' | 'very_alkaline' {
    let acidityScore = 0;
    
    // Plant growth indicators
    if (soilIndicators.plantGrowth === 'poor') acidityScore += 2; // Could be too acidic/alkaline
    if (soilIndicators.plantGrowth === 'good') acidityScore += 0; // Likely neutral
    
    // Soil color indicators
    switch (soilIndicators.soilColor) {
      case 'dark_black': acidityScore -= 1; break; // Usually neutral to slightly acidic
      case 'brown': acidityScore += 0; break; // Neutral
      case 'red': acidityScore += 1; break; // Often acidic
      case 'yellow': acidityScore += 2; break; // Often very acidic
      case 'white_patches': acidityScore += 3; break; // Often alkaline
    }
    
    // Drainage patterns
    if (soilIndicators.waterDrainage === 'very_slow') acidityScore += 1; // Clay, often acidic
    if (soilIndicators.waterDrainage === 'too_fast') acidityScore += 2; // Sandy, often acidic
    
    // Determine condition based on score
    if (acidityScore <= -1) return 'neutral';
    if (acidityScore <= 1) return 'neutral';
    if (acidityScore <= 3) return 'acidic';
    if (acidityScore <= 5) return 'very_acidic';
    return 'alkaline';
  }

  calculatePHCompatibility(cropData: any, soilCondition: string): number {
    if (!cropData.suitableSoilConditions) return 5; // Default neutral score
    
    if (cropData.suitableSoilConditions.includes(soilCondition)) {
      return 10; // Perfect match
    } else if (soilCondition === 'neutral') {
      return 8; // Most crops tolerate neutral
    } else {
      return 3; // Poor match
    }
  }

  generateSoilPHRecommendations(soilCondition: string, malayalam: boolean = false): string[] {
    const recommendations: { [key: string]: { en: string[], ml: string[] } } = {
      'very_acidic': {
        en: [
          'Apply lime (2-3 tons per acre) to reduce acidity',
          'Add organic compost to buffer pH',
          'Consider acid-tolerant crops like tea, coffee',
          'Test soil pH before major amendments'
        ],
        ml: [
          'അമ്ലത്വം കുറയ്ക്കാൻ കുമ്മായം (ഏക്കറിന് 2-3 ടൺ) ചേർക്കുക',
          'pH ബഫർ ചെയ്യാൻ ജൈവ കമ്പോസ്റ്റ് ചേർക്കുക',
          'ചായ, കാപ്പി പോലുള്ള അമ്ല സഹിഷ്ണു വിളകൾ പരിഗണിക്കുക',
          'പ്രധാന മാറ്റങ്ങൾക്ക് മുമ്പ് മണ്ണിന്റെ pH പരിശോധിക്കുക'
        ]
      },
      'acidic': {
        en: [
          'Apply lime (1-2 tons per acre) if needed',
          'Good for crops like rice, tea, potatoes',
          'Add wood ash for gentle pH increase',
          'Monitor with simple pH test kit'
        ],
        ml: [
          'ആവശ്യമെങ്കിൽ കുമ്മായം (ഏക്കറിന് 1-2 ടൺ) ചേർക്കുക',
          'നെല്ല്, ചായ, ഉരുളക്കിഴങ്ങ് എന്നിവയ്ക്ക് നല്ലത്',
          'സൌമ്യമായ pH വർദ്ധനവിന് മരം ചാരം ചേർക്കുക',
          'ലളിതമായ pH ടെസ്റ്റ് കിറ്റ് ഉപയോഗിച്ച് നിരീക്ഷിക്കുക'
        ]
      },
      'neutral': {
        en: [
          'Excellent condition for most crops',
          'Maintain with regular organic matter',
          'Suitable for vegetables, grains, fruits',
          'No pH correction needed'
        ],
        ml: [
          'മിക്ക വിളകൾക്കും മികച്ച അവസ്ഥ',
          'പതിവായി ജൈവവസ്തു ചേർത്ത് പരിപാലിക്കുക',
          'പച്ചക്കറി, ധാന്യങ്ങൾ, പഴങ്ങൾ എന്നിവയ്ക്ക് അനുയോജ്യം',
          'pH തിരുത്തൽ ആവശ്യമില്ല'
        ]
      },
      'alkaline': {
        en: [
          'Add organic compost to reduce alkalinity',
          'Apply sulfur (50-100 kg per acre)',
          'Good for crops like spinach, cabbage',
          'Improve drainage if waterlogged'
        ],
        ml: [
          'ക്ഷാരത്വം കുറയ്ക്കാൻ ജൈവ കമ്പോസ്റ്റ് ചേർക്കുക',
          'സൾഫർ (ഏക്കറിന് 50-100 കിലോ) ചേർക്കുക',
          'ചീര, കാബേജ് എന്നിവയ്ക്ക് നല്ലത്',
          'വെള്ളം കെട്ടിനിൽക്കുന്നുവെങ്കിൽ ഡ്രെയിനേജ് മെച്ചപ്പെടുത്തുക'
        ]
      }
    };

    return recommendations[soilCondition]?.[malayalam ? 'ml' : 'en'] || [];
  }
}

export const cropRecommendationEngine = new CropRecommendationEngine();
