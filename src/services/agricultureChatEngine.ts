// Advanced Agricultural Chat Engine with NLU and Expert System
// Handles complex farming queries with structured responses

import { KERALA_CROPS, PEST_DISEASE_DB, SOIL_ANALYSIS, WEATHER_ADVISORIES } from '../data/agricultureKnowledgeBase';

export interface ChatQuery {
  id: string;
  userId: string;
  message: string;
  language: 'en' | 'ml';
  images?: string[];
  location?: {
    district: string;
    panchayat?: string;
    coordinates?: { lat: number; lng: number };
  };
  timestamp: Date;
}

export interface ChatResponse {
  id: string;
  queryId: string;
  shortAnswer: string;
  shortAnswerMalayalam?: string;
  why: string;
  whyMalayalam?: string;
  immediateSteps: string[];
  immediateStepsMalayalam?: string[];
  preventiveSteps: string[];
  preventiveStepsMalayalam?: string[];
  safetyNote?: string;
  safetyNoteMalayalam?: string;
  nextInfoNeeded?: string;
  nextInfoNeededMalayalam?: string;
  confidence: number;
  confidenceCategory?: string; // High/Medium/Low confidence with Malayalam
  shouldEscalate?: boolean; // Based on confidence threshold from blueprint
  intent: string;
  entities: Record<string, any>;
  escalateToHuman: boolean;
  relatedTopics: string[];
  timestamp: Date;
}

export interface NLUResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  language: 'en' | 'ml';
}

export interface Intent {
  name: string;
  patterns: string[];
  malayalamPatterns: string[];
  handler: (query: ChatQuery, entities: Record<string, any>) => Promise<ChatResponse>;
}

export class AgricultureChatEngine {
  private intents: Intent[];
  private cropNames: Map<string, string>;
  private pestNames: Map<string, string>;

  constructor() {
    this.intents = this.initializeIntents();
    this.cropNames = this.initializeCropNames();
    this.pestNames = this.initializePestNames();
  }

  private initializeCropNames(): Map<string, string> {
    const cropMap = new Map<string, string>();
    Object.entries(KERALA_CROPS).forEach(([key, crop]) => {
      cropMap.set(crop.name.toLowerCase(), key);
      cropMap.set(crop.malayalam, key);
      crop.varieties.forEach(variety => {
        cropMap.set(variety.toLowerCase(), key);
      });
    });
    // Add common variations
    cropMap.set('rice', 'paddy');
    cropMap.set('നെൽ', 'paddy');
    cropMap.set('തേങ്ങ്', 'coconut');
    cropMap.set('വാഴ', 'banana');
    cropMap.set('കുരുമുളക്', 'pepper');
    return cropMap;
  }

  private initializePestNames(): Map<string, string> {
    const pestMap = new Map<string, string>();
    Object.entries(PEST_DISEASE_DB).forEach(([key, pest]) => {
      pestMap.set(pest.name.toLowerCase(), key);
      pestMap.set(pest.malayalam.toLowerCase(), key);
    });
    return pestMap;
  }

  private initializeIntents(): Intent[] {
    return [
      {
        name: 'weather_query',
        patterns: [
          'weather', 'rain', 'temperature', 'climate', 'forecast', 'when to spray', 'weather today',
          'should I spray', 'wind speed', 'humidity', 'when will it rain'
        ],
        malayalamPatterns: [
          'കാലാവസ്ഥ', 'മഴ', 'താപനില', 'ഇന്ന് കാലാവസ്ഥ', 'തളിക്കാമോ', 'കാറ്റിന്റെ വേഗത'
        ],
        handler: this.handleWeatherQuery.bind(this)
      },
      {
        name: 'pest_disease_identification',
        patterns: [
          'pest', 'disease', 'problem with', 'spots on leaves', 'yellowing', 'wilting', 'holes in leaves',
          'insects', 'fungus', 'bacterial', 'viral', 'what is this', 'identify', 'diagnosis'
        ],
        malayalamPatterns: [
          'കീടം', 'രോഗം', 'ഇലയിൽ പാടുകൾ', 'മഞ്ഞ നിറം', 'വാടൽ', 'ഇലയിൽ കുഴികൾ', 'പുഴുക്കൾ'
        ],
        handler: this.handlePestDiseaseQuery.bind(this)
      },
      {
        name: 'fertilizer_recommendation',
        patterns: [
          'fertilizer', 'nutrition', 'NPK', 'soil health', 'organic manure', 'compost', 'nutrients',
          'feeding', 'soil test', 'pH', 'lime', 'gypsum'
        ],
        malayalamPatterns: [
          'വളം', 'പോഷകം', 'മണ്ണിന്റെ ആരോഗ്യം', 'ജൈവവളം', 'കമ്പോസ്റ്റ്', 'മണ്ണ് പരിശോധന'
        ],
        handler: this.handleFertilizerQuery.bind(this)
      },
      {
        name: 'irrigation_guidance',
        patterns: [
          'water', 'irrigation', 'watering', 'drought', 'dry soil', 'water schedule', 'drip irrigation',
          'how much water', 'when to water', 'water management'
        ],
        malayalamPatterns: [
          'വെള്ളം', 'നനയ്ക്കൽ', 'വരൾച്ച', 'വെള്ളത്തിന്റെ അളവ്', 'എപ്പോൾ വെള്ളം കൊടുക്കണം'
        ],
        handler: this.handleIrrigationQuery.bind(this)
      },
      {
        name: 'crop_guidance',
        patterns: [
          'how to grow', 'planting', 'sowing', 'harvest', 'crop calendar', 'variety', 'spacing',
          'cultivation', 'farming tips', 'best practices', 'yield improvement'
        ],
        malayalamPatterns: [
          'എങ്ങനെ കൃഷി ചെയ്യാം', 'നടൽ', 'വിതയ്ക്കൽ', 'വിളവെടുപ്പ്', 'ഇനം', 'കൃഷി രീതി'
        ],
        handler: this.handleCropGuidanceQuery.bind(this)
      },
      {
        name: 'market_price_query',
        patterns: [
          'price', 'market', 'mandi', 'sell', 'buyer', 'cost', 'profit', 'market rate', 'selling price'
        ],
        malayalamPatterns: [
          'വില', 'മാർക്കറ്റ്', 'വിൽക്കാൻ', 'വാങ്ങുന്നവർ', 'ലാഭം', 'മാർക്കറ്റ് നിരക്ക്'
        ],
        handler: this.handleMarketQuery.bind(this)
      },
      {
        name: 'organic_farming',
        patterns: [
          'organic', 'natural', 'bio', 'sustainable', 'chemical-free', 'eco-friendly', 'biodegradable',
          'compost making', 'vermicompost', 'green manure'
        ],
        malayalamPatterns: [
          'ജൈവ', 'പ്രകൃതിദത്ത', 'രാസവസ്തുരഹിത', 'പരിസ്ഥിതി സൗഹൃദ', 'കമ്പോസ്റ്റ് ഉണ്ടാക്കൽ'
        ],
        handler: this.handleOrganicFarmingQuery.bind(this)
      },
      {
        name: 'emergency_help',
        patterns: [
          'emergency', 'urgent', 'help', 'dying plants', 'severe damage', 'immediate attention',
          'crisis', 'loss', 'disaster'
        ],
        malayalamPatterns: [
          'അടിയന്തര', 'ഉടനെ സഹായം', 'ചെടികൾ മരിക്കുന്നു', 'കടുത്ത നാശം', 'പ്രതിസന്ധി'
        ],
        handler: this.handleEmergencyQuery.bind(this)
      }
    ];
  }

  async processQuery(query: ChatQuery): Promise<ChatResponse> {
    try {
      // Step 1: Natural Language Understanding
      const nluResult = await this.performNLU(query.message, query.language);

      // Step 2: Entity extraction and enrichment
      const enrichedEntities = await this.enrichEntities(query, nluResult.entities);

      // Step 3: Find appropriate handler
      const intent = this.intents.find(i => i.name === nluResult.intent);
      
      if (!intent) {
        return this.createFallbackResponse(query, nluResult);
      }

      // Step 4: Generate expert response
      const response = await intent.handler(query, enrichedEntities);
      response.intent = nluResult.intent;
      response.confidence = nluResult.confidence;

      // Step 5: Add safety checks and escalation logic
      this.applySafetyChecks(response, query);

      return response;

    } catch (error) {
      console.error('Error processing query:', error);
      return this.createErrorResponse(query);
    }
  }

  private async performNLU(message: string, language: 'en' | 'ml'): Promise<NLUResult> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Enhanced pattern matching with scoring
    let bestMatch = { intent: 'general_query', confidence: 0.3 };

    for (const intent of this.intents) {
      const patterns = language === 'ml' ? intent.malayalamPatterns : intent.patterns;
      let score = 0;

      for (const pattern of patterns) {
        if (normalizedMessage.includes(pattern.toLowerCase())) {
          score += 0.8;
          
          // Boost score for exact matches
          if (normalizedMessage === pattern.toLowerCase()) {
            score += 0.2;
          }
          
          // Boost score for pattern at start of message
          if (normalizedMessage.startsWith(pattern.toLowerCase())) {
            score += 0.1;
          }
        }
      }

      if (score > bestMatch.confidence) {
        bestMatch = { intent: intent.name, confidence: Math.min(score, 0.95) };
      }
    }

    // Extract entities
    const entities = await this.extractEntities(normalizedMessage, language);

    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      entities,
      language
    };
  }

  private async extractEntities(message: string, language: 'en' | 'ml'): Promise<Record<string, any>> {
    const entities: Record<string, any> = {};

    // Extract crop mentions
    for (const [cropName, cropKey] of this.cropNames.entries()) {
      if (message.includes(cropName)) {
        entities.crop = cropKey;
        entities.cropName = cropName;
        break;
      }
    }

    // Extract pest/disease mentions
    for (const [pestName, pestKey] of this.pestNames.entries()) {
      if (message.includes(pestName)) {
        entities.pest = pestKey;
        entities.pestName = pestName;
        break;
      }
    }

    // Extract numbers (for quantities, areas, etc.)
    const numbers = message.match(/\d+(?:\.\d+)?/g);
    if (numbers) {
      entities.numbers = numbers.map(n => parseFloat(n));
    }

    // Extract area units
    const areaMatches = message.match(/(\d+(?:\.\d+)?)\s*(hectare|acre|cent|ഹെക്ടർ|ഏക്കർ|സെന്റ്)/gi);
    if (areaMatches) {
      entities.area = areaMatches[0];
    }

    // Extract time references
    const timeWords = ['today', 'tomorrow', 'yesterday', 'week', 'month', 'ഇന്ന്', 'നാളെ', 'ഇന്നലെ'];
    for (const timeWord of timeWords) {
      if (message.includes(timeWord)) {
        entities.timeReference = timeWord;
        break;
      }
    }

    // Extract severity indicators
    const severityWords = ['severe', 'mild', 'bad', 'serious', 'കടുത്ത', 'നേരിയ', 'മോശം'];
    for (const severityWord of severityWords) {
      if (message.includes(severityWord)) {
        entities.severity = severityWord;
        break;
      }
    }

    return entities;
  }

  private async enrichEntities(query: ChatQuery, entities: Record<string, any>): Promise<Record<string, any>> {
    // Add location context if available
    if (query.location) {
      entities.location = query.location;
    }

    // Add seasonal context
    const currentMonth = new Date().getMonth() + 1;
    entities.season = this.getCurrentSeason(currentMonth);

    // Add image analysis context if images are provided
    if (query.images && query.images.length > 0) {
      entities.hasImages = true;
      entities.imageCount = query.images.length;
    }

    return entities;
  }

  private getCurrentSeason(month: number): string {
    if (month >= 6 && month <= 9) return 'monsoon';
    if (month >= 10 && month <= 1) return 'post_monsoon';
    if (month >= 2 && month <= 5) return 'summer';
    return 'unknown';
  }

  // Intent Handlers

  private async handleWeatherQuery(query: ChatQuery, entities: Record<string, any>): Promise<ChatResponse> {
    const cropKey = entities.crop;
    const crop = cropKey ? KERALA_CROPS[cropKey] : null;

    let shortAnswer = "Weather conditions are important for farming decisions.";
    let shortAnswerMalayalam = "കൃഷിതീരുമാനങ്ങൾക്ക് കാലാവസ്ഥാസാഹചര്യങ്ങൾ പ്രധാനമാണ്.";

    const immediateSteps = [
      "Check local weather forecast for next 3-5 days",
      "Monitor humidity levels (>80% increases disease risk)",
      "Avoid spraying if rain expected within 6 hours"
    ];

    const immediateStepsMalayalam = [
      "അടുത്ത 3-5 ദിവസത്തെ പ്രാദേശിക കാലാവസ്ഥാ പ്രവചനം പരിശോധിക്കുക",
      "ആർദ്രതയുടെ നില നിരീക്ഷിക്കുക (80% ൽ കൂടുതൽ ആയാൽ രോഗസാധ്യത വർധിക്കും)",
      "6 മണിക്കൂറിനുള്ളിൽ മഴ പ്രതീക്ഷിക്കുന്നുണ്ടെങ്കിൽ തളിക്കൽ ഒഴിവാക്കുക"
    ];

    // Add crop-specific weather advice
    if (crop) {
      shortAnswer = `Weather guidance for ${crop.name} cultivation.`;
      shortAnswerMalayalam = `${crop.malayalam} കൃഷിക്കുള്ള കാലാവസ്ഥാ മാർഗ്ഗനിർദ്ദേശം.`;
      
      immediateSteps.push(`Optimal temperature for ${crop.name}: ${crop.climate.temperature}`);
      immediateSteps.push(`Required annual rainfall: ${crop.climate.rainfall}`);
    }

    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer,
      shortAnswerMalayalam,
      why: "Weather directly affects crop health, pest activity, and treatment effectiveness.",
      whyMalayalam: "കാലാവസ്ഥ വിളയുടെ ആരോഗ്യത്തെയും കീടപ്രവർത്തനത്തെയും ചികിത്സയുടെ ഫലപ്രാപ്തിയെയും നേരിട്ട് ബാധിക്കുന്നു.",
      immediateSteps,
      immediateStepsMalayalam,
      preventiveSteps: [
        "Install weather monitoring station or use mobile app",
        "Follow integrated weather-based crop management",
        "Maintain farm diary with weather observations"
      ],
      preventiveStepsMalayalam: [
        "കാലാവസ്ഥാ നിരീക്ഷണ കേന്ദ്രം സ്ഥാപിക്കുകയോ മൊബൈൽ ആപ്പ് ഉപയോഗിക്കുകയോ ചെയ്യുക",
        "കാലാവസ്ഥാധിഷ്ഠിത സംയോജിത വിള പരിപാലനം പിന്തുടരുക",
        "കാലാവസ്ഥാ നിരീക്ഷണങ്ങളുമായി കാർഷിക ഡയറി പരിപാലിക്കുക"
      ],
      confidence: 0.85,
      intent: 'weather_query',
      entities,
      escalateToHuman: false,
      relatedTopics: ['irrigation', 'pest_management', 'spray_timing'],
      timestamp: new Date()
    };
  }

  private async handlePestDiseaseQuery(query: ChatQuery, entities: Record<string, any>): Promise<ChatResponse> {
    const cropKey = entities.crop;
    const pestKey = entities.pest;
    const hasImages = entities.hasImages || false;

    let confidence = 0.7;
    let escalateToHuman = false;

    // If no crop or pest identified and no images, lower confidence
    if (!cropKey && !pestKey && !hasImages) {
      confidence = 0.4;
      escalateToHuman = true;
    }

    let shortAnswer = "Pest and disease identification requires careful observation.";
    let shortAnswerMalayalam = "കീടരോഗ തിരിച്ചറിയലിന് ശ്രദ്ധാപൂർവമായ നിരീക്ഷണം ആവശ്യമാണ്.";

    const immediateSteps = [
      "Take clear photos of affected plant parts (leaves, stems, fruits)",
      "Note symptoms: color changes, spots, holes, wilting",
      "Check both upper and lower leaf surfaces"
    ];

    const immediateStepsMalayalam = [
      "ബാധിത സസ്യഭാഗങ്ങളുടെ (ഇലകൾ, തണ്ടുകൾ, ഫലങ്ങൾ) വ്യക്തമായ ഫോട്ടോകൾ എടുക്കുക",
      "ലക്ഷണങ്ങൾ ശ്രദ്ധിക്കുക: നിറമാറ്റം, പാടുകൾ, കുഴികൾ, വാടൽ",
      "ഇലയുടെ മുകളിലും താഴെയുമുള്ള പ്രതലങ്ങൾ പരിശോധിക്കുക"
    ];

    // If specific pest/disease identified
    if (pestKey && PEST_DISEASE_DB[pestKey]) {
      const pestInfo = PEST_DISEASE_DB[pestKey];
      shortAnswer = `Identified: ${pestInfo.name}`;
      shortAnswerMalayalam = `തിരിച്ചറിഞ്ഞത്: ${pestInfo.malayalam}`;
      confidence = 0.9;

      // Add specific treatment recommendations
      immediateSteps.length = 0;
      immediateSteps.push(...pestInfo.treatment.cultural.slice(0, 3));
      
      if (pestInfo.treatment.organic.length > 0) {
        immediateSteps.push(`Organic treatment: ${pestInfo.treatment.organic[0]}`);
      }

      immediateStepsMalayalam.length = 0;
      immediateStepsMalayalam.push(...pestInfo.malayalam_symptoms.slice(0, 2));
    }

    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer,
      shortAnswerMalayalam,
      why: "Early identification and treatment prevent crop losses and reduce treatment costs.",
      whyMalayalam: "നേരത്തെ തിരിച്ചറിയലും ചികിത്സയും വിളനഷ്ടം തടയുകയും ചികിത്സാചെലവ് കുറയ്ക്കുകയും ചെയ്യുന്നു.",
      immediateSteps,
      immediateStepsMalayalam,
      preventiveSteps: [
        "Regular field monitoring (weekly inspection)",
        "Maintain field sanitation",
        "Use resistant varieties when available",
        "Follow integrated pest management (IPM)"
      ],
      preventiveStepsMalayalam: [
        "പതിവ് വയൽ നിരീക്ഷണം (ആഴ്ചതോറുമുള്ള പരിശോധന)",
        "വയലിന്റെ ശുചിത്വം പാലിക്കുക",
        "ലഭ്യമാകുമ്പോൾ പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ ഉപയോഗിക്കുക",
        "സംയോജിത കീട പരിപാലനം (IPM) പിന്തുടരുക"
      ],
      safetyNote: "Always wear protective equipment when applying treatments. Follow label instructions.",
      safetyNoteMalayalam: "ചികിത്സകൾ പ്രയോഗിക്കുമ്പോൾ എപ്പോഴും സുരക്ഷാ ഉപകരണങ്ങൾ ധരിക്കുക. ലേബൽ നിർദ്ദേശങ്ങൾ പാലിക്കുക.",
      nextInfoNeeded: hasImages ? "Please describe the symptoms in detail" : "Please upload clear photos of affected plants",
      nextInfoNeededMalayalam: hasImages ? "ദയവായി ലക്ഷണങ്ങൾ വിശദമായി വിവരിക്കുക" : "ദയവായി ബാധിത ചെടികളുടെ വ്യക്തമായ ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക",
      confidence,
      intent: 'pest_disease_identification',
      entities,
      escalateToHuman,
      relatedTopics: ['organic_treatment', 'chemical_pesticides', 'prevention'],
      timestamp: new Date()
    };
  }

  private async handleFertilizerQuery(query: ChatQuery, entities: Record<string, any>): Promise<ChatResponse> {
    const cropKey = entities.crop;
    const crop = cropKey ? KERALA_CROPS[cropKey] : null;

    let shortAnswer = "Soil testing is the foundation of proper fertilization.";
    let shortAnswerMalayalam = "ശരിയായ വളപ്രയോഗത്തിന്റെ അടിസ്ഥാനം മണ്ണ് പരിശോധനയാണ്.";

    const immediateSteps = [
      "Get soil test done from nearest agricultural lab",
      "Test for pH, N, P, K, and organic matter",
      "Collect samples from 0-15cm depth from multiple spots"
    ];

    const immediateStepsMalayalam = [
      "അടുത്തുള്ള കാർഷിക ലാബിൽ നിന്നും മണ്ണ് പരിശോധന നടത്തുക",
      "pH, N, P, K, ജൈവവസ്തു എന്നിവ പരിശോധിക്കുക",
      "വിവിധ സ്ഥലങ്ങളിൽ നിന്നും 0-15 സെ.മീ ആഴത്തിൽ നിന്നും സാമ്പിളുകൾ ശേഖരിക്കുക"
    ];

    // Add crop-specific fertilizer recommendations
    if (crop) {
      shortAnswer = `Fertilizer guidance for ${crop.name} cultivation.`;
      shortAnswerMalayalam = `${crop.malayalam} കൃഷിക്കുള്ള വള മാർഗ്ഗനിർദ്ദേശം.`;
      
      immediateSteps.length = 0;
      crop.fertilizer.chemical.forEach((schedule, index) => {
        immediateSteps.push(`${schedule.stage}: N-${schedule.nitrogen}, P-${schedule.phosphorus}, K-${schedule.potassium}`);
      });
      
      if (crop.fertilizer.organic.length > 0) {
        immediateSteps.push(`Organic: ${crop.fertilizer.organic[0]}`);
      }
    }

    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer,
      shortAnswerMalayalam,
      why: "Balanced nutrition ensures optimal growth, yield, and disease resistance.",
      whyMalayalam: "സന്തുലിത പോഷണം ഒപ്റ്റിമൽ വളർച്ചയും വിളവും രോഗപ്രതിരോധവും ഉറപ്പാക്കുന്നു.",
      immediateSteps,
      immediateStepsMalayalam,
      preventiveSteps: [
        "Apply organic matter regularly (compost/FYM)",
        "Follow soil test recommendations",
        "Use split application for better efficiency",
        "Monitor plant response and adjust accordingly"
      ],
      preventiveStepsMalayalam: [
        "പതിവായി ജൈവവസ്തുക്കൾ പ്രയോഗിക്കുക (കമ്പോസ്റ്റ്/FYM)",
        "മണ്ണ് പരിശോധനാ ശുപാർശകൾ പാലിക്കുക",
        "മികച്ച കാര്യക്ഷമതയ്ക്കായി വിഭജിത പ്രയോഗം ഉപയോഗിക്കുക",
        "ചെടിയുടെ പ്രതികരണം നിരീക്ഷിക്കുകയും അതനുസരിച്ച് ക്രമീകരിക്കുകയും ചെയ്യുക"
      ],
      safetyNote: "Avoid over-fertilization. Follow recommended doses to prevent nutrient imbalance.",
      safetyNoteMalayalam: "അധിക വളപ്രയോഗം ഒഴിവാക്കുക. പോഷക അസന്തുലനം തടയാൻ ശുപാർശചെയ്ത അളവ് പാലിക്കുക.",
      confidence: 0.8,
      intent: 'fertilizer_recommendation',
      entities,
      escalateToHuman: false,
      relatedTopics: ['soil_health', 'organic_farming', 'crop_nutrition'],
      timestamp: new Date()
    };
  }

  private async handleIrrigationQuery(query: ChatQuery, entities: Record<string, any>): Promise<ChatResponse> {
    const cropKey = entities.crop;
    const crop = cropKey ? KERALA_CROPS[cropKey] : null;
    const season = entities.season;

    let shortAnswer = "Proper irrigation timing and quantity are crucial for crop success.";
    let shortAnswerMalayalam = "വിള വിജയത്തിന് ശരിയായ നനയ്ക്കൽ സമയവും അളവും നിർണായകമാണ്.";

    const immediateSteps = [
      "Check soil moisture at 6-inch depth",
      "Water early morning (6-8 AM) or evening (4-6 PM)",
      "Apply water slowly for deep penetration"
    ];

    const immediateStepsMalayalam = [
      "6 ഇഞ്ച് ആഴത്തിൽ മണ്ണിലെ ഈർപ്പം പരിശോധിക്കുക",
      "അതിരാവിലെ (6-8 AM) അല്ലെങ്കിൽ വൈകുന്നേരം (4-6 PM) വെള്ളം കൊടുക്കുക",
      "ആഴത്തിലുള്ള നുഴഞ്ഞുകയറ്റത്തിനായി സാവധാനം വെള്ളം പ്രയോഗിക്കുക"
    ];

    // Add crop-specific irrigation guidance
    if (crop && crop.irrigationSchedule) {
      shortAnswer = `Irrigation guidance for ${crop.name}.`;
      shortAnswerMalayalam = `${crop.malayalam}ന് വെള്ളപ്രയോഗ മാർഗ്ഗനിർദ്ദേശം.`;
      
      immediateSteps[0] = `Frequency: ${crop.irrigationSchedule.frequency}`;
      immediateSteps[1] = `Amount: ${crop.irrigationSchedule.amount}`;
      immediateSteps[2] = `Method: ${crop.irrigationSchedule.method}`;
    }

    // Season-specific advice
    let seasonalAdvice = [];
    if (season === 'monsoon') {
      seasonalAdvice = ["Ensure proper drainage", "Reduce irrigation frequency"];
    } else if (season === 'summer') {
      seasonalAdvice = ["Increase irrigation frequency", "Use mulching to conserve water"];
    }

    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer,
      shortAnswerMalayalam,
      why: "Proper water management prevents stress, diseases, and ensures optimal nutrient uptake.",
      whyMalayalam: "ശരിയായ ജല പരിപാലനം സമ്മർദ്ദവും രോഗങ്ങളും തടയുകയും ഒപ്റ്റിമൽ പോഷക ആഗിരണം ഉറപ്പാക്കുകയും ചെയ്യുന്നു.",
      immediateSteps: [...immediateSteps, ...seasonalAdvice],
      immediateStepsMalayalam,
      preventiveSteps: [
        "Install drip irrigation for water efficiency",
        "Use moisture meters for accurate monitoring",
        "Apply organic mulch to reduce water loss",
        "Create water harvesting systems"
      ],
      preventiveStepsMalayalam: [
        "ജല കാര്യക്ഷമതയ്ക്കായി ഡ്രിപ്പ് ഇറിഗേഷൻ സ്ഥാപിക്കുക",
        "കൃത്യമായ നിരീക്ഷണത്തിനായി ഈർപ്പമാപിനികൾ ഉപയോഗിക്കുക",
        "ജലനഷ്ടം കുറയ്ക്കാൻ ജൈവ മൾച്ച് പ്രയോഗിക്കുക",
        "ജലസമ്പാദ്യ സംവിധാനങ്ങൾ സൃഷ്ടിക്കുക"
      ],
      confidence: 0.8,
      intent: 'irrigation_guidance',
      entities,
      escalateToHuman: false,
      relatedTopics: ['water_conservation', 'drip_irrigation', 'mulching'],
      timestamp: new Date()
    };
  }

  private async handleCropGuidanceQuery(query: ChatQuery, entities: Record<string, any>): Promise<ChatResponse> {
    const cropKey = entities.crop;
    const crop = cropKey ? KERALA_CROPS[cropKey] : null;

    if (!crop) {
      return this.createFallbackResponse(query, {
        intent: 'crop_guidance',
        confidence: 0.4,
        entities,
        language: query.language
      });
    }

    const shortAnswer = `Complete cultivation guide for ${crop.name} (${crop.malayalam}).`;
    const shortAnswerMalayalam = `${crop.name} (${crop.malayalam}) ന്റെ സമ്പൂർണ്ണ കൃഷി മാർഗ്ഗദർശി.`;

    const immediateSteps = [
      `Best varieties: ${crop.varieties.slice(0, 3).join(', ')}`,
      `Planting seasons: ${crop.plantingSeasons.join(', ')}`,
      `Spacing: ${crop.spacing.rowToRow} x ${crop.spacing.plantToPlant}`,
      `Harvest time: ${crop.harvestTime}`
    ];

    const immediateStepsMalayalam = [
      `മികച്ച ഇനങ്ങൾ: ${crop.varieties.slice(0, 3).join(', ')}`,
      `നടീൽ കാലം: ${crop.plantingSeasons.join(', ')}`,
      `അകലം: ${crop.spacing.rowToRow} x ${crop.spacing.plantToPlant}`,
      `വിളവെടുപ്പ് സമയം: ${crop.harvestTime}`
    ];

    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer,
      shortAnswerMalayalam,
      why: "Following proper cultivation practices ensures maximum yield and quality produce.",
      whyMalayalam: "ശരിയായ കൃഷി രീതികൾ പിന്തുടരുന്നത് പരമാവധി വിളവും ഗുണമേന്മയുള്ള ഉൽപ്പാദനവും ഉറപ്പാക്കുന്നു.",
      immediateSteps,
      immediateStepsMalayalam,
      preventiveSteps: [
        `Soil requirements: pH ${crop.soilRequirements.pH}, ${crop.soilRequirements.type.join(' or ')}`,
        `Climate needs: ${crop.climate.temperature}, ${crop.climate.rainfall}`,
        `Common issues to watch: ${crop.commonPests.slice(0, 2).join(', ')}`,
        "Regular monitoring and timely interventions"
      ],
      preventiveStepsMalayalam: [
        `മണ്ണിന്റെ ആവശ്യകതകൾ: pH ${crop.soilRequirements.pH}, ${crop.soilRequirements.type.join(' അല്ലെങ്കിൽ ')}`,
        `കാലാവസ്ഥാ ആവശ്യങ്ങൾ: ${crop.climate.temperature}, ${crop.climate.rainfall}`,
        `ശ്രദ്ധിക്കേണ്ട സാധാരണ പ്രശ്നങ്ങൾ: ${crop.commonPests.slice(0, 2).join(', ')}`,
        "പതിവ് നിരീക്ഷണവും സമയോചിത ഇടപെടലുകളും"
      ],
      confidence: 0.95,
      intent: 'crop_guidance',
      entities,
      escalateToHuman: false,
      relatedTopics: ['fertilizer', 'irrigation', 'pest_management', 'harvest'],
      timestamp: new Date()
    };
  }

  private async handleMarketQuery(query: ChatQuery, entities: Record<string, any>): Promise<ChatResponse> {
    // This would integrate with real market APIs in production
    const shortAnswer = "Market prices vary daily. Check multiple sources for best rates.";
    const shortAnswerMalayalam = "മാർക്കറ്റ് വില ദിവസേന മാറുന്നു. മികച്ച നിരക്കുകൾക്കായി ഒന്നിലധികം ഉറവിടങ്ങൾ പരിശോധിക്കുക.";

    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer,
      shortAnswerMalayalam,
      why: "Current market information helps in making profitable selling decisions.",
      whyMalayalam: "നിലവിലെ മാർക്കറ്റ് വിവരങ്ങൾ ലാഭകരമായ വിൽപ്പന തീരുമാനങ്ങൾ എടുക്കാൻ സഹായിക്കുന്നു.",
      immediateSteps: [
        "Check today's rates at nearest mandi/market",
        "Compare prices across different markets",
        "Consider transportation and handling costs"
      ],
      immediateStepsMalayalam: [
        "അടുത്തുള്ള മണ്ഡി/മാർക്കറ്റിൽ ഇന്നത്തെ നിരക്കുകൾ പരിശോധിക്കുക",
        "വിവിധ മാർക്കറ്റുകളിലെ വിലകൾ താരതമ്യം ചെയ്യുക",
        "ഗതാഗതവും കൈകാര്യം ചെയ്യലും ചിലവുകൾ പരിഗണിക്കുക"
      ],
      preventiveSteps: [
        "Maintain quality standards for better prices",
        "Consider direct marketing to consumers",
        "Join farmer producer organizations (FPOs)",
        "Store produce properly to extend selling window"
      ],
      confidence: 0.7,
      intent: 'market_price_query',
      entities,
      escalateToHuman: false,
      relatedTopics: ['post_harvest', 'storage', 'value_addition'],
      timestamp: new Date()
    };
  }

  private async handleOrganicFarmingQuery(query: ChatQuery, entities: Record<string, any>): Promise<ChatResponse> {
    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer: "Organic farming builds soil health and produces chemical-free food.",
      shortAnswerMalayalam: "ജൈവ കൃഷി മണ്ണിന്റെ ആരോഗ്യം വർദ്ധിപ്പിക്കുകയും രാസവസ്തുരഹിത ഭക്ഷണം ഉത്പാദിപ്പിക്കുകയും ചെയ്യുന്നു.",
      why: "Organic practices improve soil fertility, biodiversity, and long-term sustainability.",
      whyMalayalam: "ജൈവ രീതികൾ മണ്ണിന്റെ ഫലഭൂയിഷ്ഠത, ജൈവവൈവിധ്യം, ദീർഘകാല സുസ്ഥിരത എന്നിവ മെച്ചപ്പെടുത്തുന്നു.",
      immediateSteps: [
        "Start composting farm organic waste",
        "Use neem oil and botanical pesticides",
        "Introduce beneficial insects and microorganisms",
        "Replace chemical fertilizers gradually with organic alternatives"
      ],
      immediateStepsMalayalam: [
        "കാർഷിക ജൈവാവശിഷ്ടങ്ങളുടെ കമ്പോസ്റ്റിംഗ് ആരംഭിക്കുക",
        "വേപ്പെണ്ണയും സസ്യാധിഷ്ഠിത കീടനാശിനികളും ഉപയോഗിക്കുക",
        "ഉപകാരപ്രദമായ പ്രാണികളെയും സൂക്ഷ്മാണുക്കളെയും പരിചയപ്പെടുത്തുക",
        "രാസ വളങ്ങളെ ക്രമേണ ജൈവ ബദലുകൾ ഉപയോഗിച്ച് മാറ്റിസ്ഥാപിക്കുക"
      ],
      preventiveSteps: [
        "Obtain organic certification for premium pricing",
        "Maintain detailed records of all inputs used",
        "Create biodiversity zones around fields",
        "Join organic farmer networks for knowledge sharing"
      ],
      preventiveStepsMalayalam: [
        "പ്രീമിയം വിലനിർണ്ണയത്തിനായി ജൈവ സർട്ടിഫിക്കേഷൻ നേടുക",
        "ഉപയോഗിച്ച എല്ലാ ഇൻപുട്ടുകളുടെയും വിശദമായ രേഖകൾ സൂക്ഷിക്കുക",
        "വയലുകൾക്ക് ചുറ്റും ജൈവവൈവിധ്യ മേഖലകൾ സൃഷ്ടിക്കുക",
        "അറിവ് പങ്കിടലിനായി ജൈവ കർഷക ശൃംഖലകളിൽ ചേരുക"
      ],
      confidence: 0.85,
      intent: 'organic_farming',
      entities,
      escalateToHuman: false,
      relatedTopics: ['composting', 'biological_pest_control', 'soil_health'],
      timestamp: new Date()
    };
  }

  private async handleEmergencyQuery(query: ChatQuery, entities: Record<string, any>): Promise<ChatResponse> {
    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer: "Emergency agricultural situation detected. Immediate expert consultation recommended.",
      shortAnswerMalayalam: "അടിയന്തര കാർഷിക സാഹചര്യം കണ്ടെത്തി. ഉടനടി വിദഗ്ധ കൺസൾട്ടേഷൻ ശുപാർശ ചെയ്യുന്നു.",
      why: "Rapid response can prevent complete crop loss and minimize economic damage.",
      whyMalayalam: "വേഗത്തിലുള്ള പ്രതികരണം സമ്പൂർണ്ണ വിളനാശം തടയാനും സാമ്പത്തിക നാശനഷ്ടം കുറയ്ക്കാനും കഴിയും.",
      immediateSteps: [
        "Contact local agricultural extension officer immediately",
        "Take multiple photos of the problem from different angles",
        "Isolate affected plants if disease is suspected",
        "Document exactly when symptoms first appeared"
      ],
      immediateStepsMalayalam: [
        "പ്രാദേശിക കാർഷിക വിപുലീകരണ ഉദ്യോഗസ്ഥനുമായി ഉടനടി ബന്ധപ്പെടുക",
        "വിവിധ കോണുകളിൽ നിന്നും പ്രശ്നത്തിന്റെ ഒന്നിലധികം ഫോട്ടോകൾ എടുക്കുക",
        "രോഗം സംശയിക്കുന്നുണ്ടെങ്കിൽ ബാധിത ചെടികളെ വേർതിരിക്കുക",
        "ലക്ഷണങ്ങൾ ആദ്യമായി പ്രത്യക്ഷപ്പെട്ടത് എപ്പോൾ എന്ന് കൃത്യമായി രേഖപ്പെടുത്തുക"
      ],
      preventiveSteps: [
        "Establish emergency contact numbers for agricultural experts",
        "Keep emergency treatment supplies ready",
        "Maintain crop insurance for financial protection",
        "Regular monitoring prevents emergencies"
      ],
      safetyNote: "Do not use untested treatments in emergency. Always consult experts first.",
      safetyNoteMalayalam: "അടിയന്തരാവസ്ഥയിൽ പരിശോധിക്കാത്ത ചികിത്സകൾ ഉപയോഗിക്കരുത്. എപ്പോഴും ആദ്യം വിദഗ്ധരുമായി കൂടിയാലോചിക്കുക.",
      confidence: 0.9,
      intent: 'emergency_help',
      entities,
      escalateToHuman: true,
      relatedTopics: ['expert_consultation', 'crop_insurance', 'emergency_protocols'],
      timestamp: new Date()
    };
  }

  // Utility methods

  private createFallbackResponse(query: ChatQuery, nluResult: NLUResult): ChatResponse {
    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer: "I understand you need farming guidance. Could you be more specific?",
      shortAnswerMalayalam: "നിങ്ങൾക്ക് കാർഷിക മാർഗ്ഗനിർദ്ദേശം ആവശ്യമാണെന്ന് ഞാൻ മനസ്സിലാക്കുന്നു. കൂടുതൽ വ്യക്തമായി പറയാമോ?",
      why: "More specific information helps provide accurate recommendations.",
      whyMalayalam: "കൂടുതൽ വ്യക്തമായ വിവരങ്ങൾ കൃത്യമായ ശുപാർശകൾ നൽകാൻ സഹായിക്കുന്നു.",
      immediateSteps: [
        "Specify your crop and growth stage",
        "Describe the specific problem or question",
        "Mention your location (district/panchayat) if relevant"
      ],
      immediateStepsMalayalam: [
        "നിങ്ങളുടെ വിളയും വളർച്ചാ ഘട്ടവും വ്യക്തമാക്കുക",
        "നിർദ്ദിഷ്ട പ്രശ്നമോ ചോദ്യമോ വിവരിക്കുക",
        "പ്രസക്തമാണെങ്കിൽ നിങ്ങളുടെ സ്ഥാനം (ജില്ല/പഞ്ചായത്ത്) പരാമർശിക്കുക"
      ],
      preventiveSteps: [
        "Use keywords like 'pest', 'disease', 'fertilizer', 'weather'",
        "Upload photos if you have plant problems",
        "Ask one question at a time for better responses"
      ],
      confidence: nluResult.confidence,
      intent: nluResult.intent,
      entities: nluResult.entities,
      escalateToHuman: false,
      relatedTopics: ['crop_guidance', 'pest_management', 'fertilizer', 'irrigation'],
      timestamp: new Date()
    };
  }

  private createErrorResponse(query: ChatQuery): ChatResponse {
    return {
      id: this.generateId(),
      queryId: query.id,
      shortAnswer: "Sorry, I encountered an error processing your request.",
      shortAnswerMalayalam: "ക്ഷമിക്കണം, നിങ്ങളുടെ അഭ്യർത്ഥന പ്രോസസ്സ് ചെയ്യുന്നതിൽ എനിക്ക് ഒരു പിശക് നേരിട്ടു.",
      why: "Technical issues can occasionally occur in complex systems.",
      whyMalayalam: "സങ്കീർണ്ണ സിസ്റ്റങ്ങളിൽ ഇടയ്ക്കിടെ സാങ്കേതിക പ്രശ്നങ്ങൾ ഉണ്ടാകാം.",
      immediateSteps: [
        "Please try rephrasing your question",
        "Check if you included all necessary information",
        "Contact our support team if the problem persists"
      ],
      immediateStepsMalayalam: [
        "ദയവായി നിങ്ങളുടെ ചോദ്യം പുനർനിർമ്മിക്കാൻ ശ്രമിക്കുക",
        "ആവശ്യമായ എല്ലാ വിവരങ്ങളും ഉൾപ്പെടുത്തിയിട്ടുണ്ടോയെന്ന് പരിശോധിക്കുക",
        "പ്രശ്നം നിലനിൽക്കുകയാണെങ്കിൽ ഞങ്ങളുടെ സപ്പോർട്ട് ടീമുമായി ബന്ധപ്പെടുക"
      ],
      preventiveSteps: [],
      confidence: 0.1,
      intent: 'error',
      entities: {},
      escalateToHuman: true,
      relatedTopics: [],
      timestamp: new Date()
    };
  }

  private applySafetyChecks(response: ChatResponse, query: ChatQuery): void {
    // Check for chemical recommendations
    const hasChemicalMention = response.immediateSteps.some(step => 
      step.toLowerCase().includes('spray') || 
      step.toLowerCase().includes('pesticide') ||
      step.toLowerCase().includes('fungicide')
    );

    if (hasChemicalMention) {
      response.safetyNote = response.safetyNote || "Always wear protective equipment when handling chemicals. Follow label instructions carefully.";
      response.safetyNoteMalayalam = response.safetyNoteMalayalam || "രാസവസ്തുക്കൾ കൈകാര്യം ചെയ്യുമ്പോൾ എപ്പോഴും സംരക്ഷണ ഉപകരണങ്ങൾ ധരിക്കുക. ലേബൽ നിർദ്ദേശങ്ങൾ ശ്രദ്ധാപൂർവം പാലിക്കുക.";
    }

    // Escalate if confidence is too low
    if (response.confidence < 0.5) {
      response.escalateToHuman = true;
      response.nextInfoNeeded = response.nextInfoNeeded || "This query needs expert review for accurate guidance.";
      response.nextInfoNeededMalayalam = response.nextInfoNeededMalayalam || "കൃത്യമായ മാർഗ്ഗനിർദ്ദേശത്തിനായി ഈ ചോദ്യത്തിന് വിദഗ്ധ അവലോകനം ആവശ്യമാണ്.";
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default AgricultureChatEngine;
