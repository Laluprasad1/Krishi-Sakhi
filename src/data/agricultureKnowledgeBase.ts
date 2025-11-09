// Agricultural Knowledge Base for Kerala Farming
// Comprehensive data for crops, pests, diseases, treatments, and best practices

export interface CropInfo {
  name: string;
  malayalam: string;
  varieties: string[];
  plantingSeasons: string[];
  harvestTime: string;
  soilRequirements: {
    pH: string;
    type: string[];
    drainage: string;
  };
  climate: {
    temperature: string;
    rainfall: string;
    humidity: string;
  };
  spacing: {
    rowToRow: string;
    plantToPlant: string;
  };
  fertilizer: {
    organic: string[];
    chemical: NPKSchedule[];
  };
  commonPests: string[];
  commonDiseases: string[];
  irrigationSchedule: IrrigationGuide;
}

export interface NPKSchedule {
  stage: string;
  days: number;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  application: string;
}

export interface IrrigationGuide {
  frequency: string;
  amount: string;
  critical_periods: string[];
  method: string;
}

export interface PestDisease {
  id: string;
  name: string;
  malayalam: string;
  type: 'pest' | 'disease' | 'nutrient_deficiency';
  crops_affected: string[];
  symptoms: string[];
  malayalam_symptoms: string[];
  causes: string[];
  identification: {
    visual_signs: string[];
    affected_parts: string[];
    environmental_conditions: string[];
  };
  treatment: {
    cultural: string[];
    biological: string[];
    chemical: ChemicalTreatment[];
    organic: string[];
  };
  prevention: string[];
  severity_levels: {
    mild: string;
    moderate: string;
    severe: string;
  };
}

export interface ChemicalTreatment {
  name: string;
  active_ingredient: string;
  dosage: string;
  application_method: string;
  preharvest_interval: number;
  safety_equipment: string[];
  restrictions: string[];
}

export interface SoilAnalysis {
  pH: {
    ideal_range: { min: number; max: number };
    interpretation: {
      very_acidic: string;
      acidic: string;
      neutral: string;
      alkaline: string;
      very_alkaline: string;
    };
    correction: {
      acidic: string[];
      alkaline: string[];
    };
  };
  nutrients: {
    nitrogen: NutrientGuide;
    phosphorus: NutrientGuide;
    potassium: NutrientGuide;
    organic_matter: NutrientGuide;
  };
}

export interface NutrientGuide {
  ideal_range: string;
  deficiency_symptoms: string[];
  excess_symptoms: string[];
  sources: {
    organic: string[];
    chemical: string[];
  };
}

export interface WeatherAdvisory {
  condition: string;
  recommendation: string;
  malayalam: string;
  actions: string[];
  restrictions: string[];
}

// Kerala Crop Database
export const KERALA_CROPS: Record<string, CropInfo> = {
  paddy: {
    name: "Paddy (Rice)",
    malayalam: "നെൽ",
    varieties: ["Jyothi", "Asha", "Uma", "IR-64", "Ponni", "Kerala Sundari"],
    plantingSeasons: ["June-July (Virippu)", "November-December (Mundakan)", "March-April (Puncha)"],
    harvestTime: "110-130 days after transplanting",
    soilRequirements: {
      pH: "5.5-7.0",
      type: ["Clay loam", "Clay", "Alluvial"],
      drainage: "Poor drainage preferred for flooding"
    },
    climate: {
      temperature: "20-35°C",
      rainfall: "1200-1800mm annually",
      humidity: "60-80%"
    },
    spacing: {
      rowToRow: "20cm",
      plantToPlant: "10cm"
    },
    fertilizer: {
      organic: ["Cow dung manure 10t/ha", "Compost 5t/ha", "Green manure (Sesbania)"],
      chemical: [
        { stage: "Basal", days: 0, nitrogen: "40kg/ha", phosphorus: "20kg/ha", potassium: "20kg/ha", application: "Broadcasting before transplanting" },
        { stage: "Tillering", days: 21, nitrogen: "40kg/ha", phosphorus: "0", potassium: "20kg/ha", application: "Top dressing" },
        { stage: "Panicle", days: 45, nitrogen: "30kg/ha", phosphorus: "0", potassium: "10kg/ha", application: "Top dressing" }
      ]
    },
    commonPests: ["Brown Plant Hopper", "Rice Stem Borer", "Leaf Folder", "Gall Midge"],
    commonDiseases: ["Blast", "Bacterial Leaf Blight", "Sheath Blight", "Brown Spot"],
    irrigationSchedule: {
      frequency: "Maintain 2-5cm standing water",
      amount: "1500-2000L per square meter per season",
      critical_periods: ["Tillering stage", "Flowering stage", "Grain filling stage"],
      method: "Flooding with alternate wetting and drying"
    }
  },

  coconut: {
    name: "Coconut",
    malayalam: "തേങ്ങ്",
    varieties: ["West Coast Tall", "Lakshadweep Ordinary", "Chowghat Orange Dwarf", "Malayan Dwarf"],
    plantingSeasons: ["May-June (Pre-monsoon)", "September-October (Post-monsoon)"],
    harvestTime: "6-8 years after planting (starts bearing)",
    soilRequirements: {
      pH: "5.5-8.0",
      type: ["Sandy loam", "Red laterite", "Alluvial"],
      drainage: "Well-drained, water table 1-3m below surface"
    },
    climate: {
      temperature: "27-32°C",
      rainfall: "1200-2000mm annually",
      humidity: "60-80%"
    },
    spacing: {
      rowToRow: "7.5-9m",
      plantToPlant: "7.5-9m (triangular planting)"
    },
    fertilizer: {
      organic: ["Cow dung 50kg/palm/year", "Compost 25kg/palm/year", "Coir pith compost"],
      chemical: [
        { stage: "Young palm", days: 0, nitrogen: "100g/palm", phosphorus: "50g/palm", potassium: "140g/palm", application: "Split into 3 doses" },
        { stage: "Bearing palm", days: 0, nitrogen: "500g/palm", phosphorus: "320g/palm", potassium: "1200g/palm", application: "Split into 2-3 doses annually" }
      ]
    },
    commonPests: ["Red Palm Weevil", "Rhinoceros Beetle", "Coconut Mite", "Scale Insects"],
    commonDiseases: ["Root Wilt", "Stem Bleeding", "Bud Rot", "Leaf Blight"],
    irrigationSchedule: {
      frequency: "Weekly during dry season",
      amount: "150-200L per palm per week",
      critical_periods: ["Flowering", "Fruit development", "Dry season"],
      method: "Basin irrigation or drip irrigation"
    }
  },

  banana: {
    name: "Banana",
    malayalam: "വാഴ",
    varieties: ["Nendran", "Robusta", "Rasthali", "Poovan", "Red Banana", "Monthan"],
    plantingSeasons: ["February-March", "September-October"],
    harvestTime: "11-15 months after planting",
    soilRequirements: {
      pH: "6.0-7.5",
      type: ["Deep alluvial", "Clay loam", "Well-drained black soil"],
      drainage: "Good drainage essential, avoid waterlogging"
    },
    climate: {
      temperature: "26-30°C",
      rainfall: "1200-1500mm annually",
      humidity: "60-90%"
    },
    spacing: {
      rowToRow: "2-2.5m",
      plantToPlant: "1.8-2m"
    },
    fertilizer: {
      organic: ["Farm yard manure 20-25kg/plant", "Vermicompost 5kg/plant"],
      chemical: [
        { stage: "Planting", days: 0, nitrogen: "100g/plant", phosphorus: "50g/plant", potassium: "300g/plant", application: "Basal application" },
        { stage: "2nd month", days: 60, nitrogen: "100g/plant", phosphorus: "0", potassium: "100g/plant", application: "Top dressing" },
        { stage: "4th month", days: 120, nitrogen: "100g/plant", phosphorus: "0", potassium: "100g/plant", application: "Top dressing" }
      ]
    },
    commonPests: ["Nematodes", "Thrips", "Aphids", "Pseudostem Weevil"],
    commonDiseases: ["Panama Disease", "Black Sigatoka", "Bunchy Top", "Bacterial Soft Rot"],
    irrigationSchedule: {
      frequency: "Every 3-4 days",
      amount: "25-30L per plant per irrigation",
      critical_periods: ["Flowering", "Bunch development", "Summer months"],
      method: "Basin irrigation or drip irrigation"
    }
  },

  pepper: {
    name: "Black Pepper",
    malayalam: "കുരുമുളക്",
    varieties: ["Paniyur-1", "Karimunda", "Kalluvally", "Sreekara", "Subhakara"],
    plantingSeasons: ["May-June", "September-October"],
    harvestTime: "3-4 years after planting (starts bearing)",
    soilRequirements: {
      pH: "5.5-6.5",
      type: ["Well-drained laterite", "Forest loam", "Red sandy loam"],
      drainage: "Excellent drainage, avoid waterlogging"
    },
    climate: {
      temperature: "23-28°C",
      rainfall: "1500-2500mm annually",
      humidity: "75-85%"
    },
    spacing: {
      rowToRow: "2.5-3m",
      plantToPlant: "2.5-3m"
    },
    fertilizer: {
      organic: ["Compost 10kg/vine/year", "Cow dung 5kg/vine/year"],
      chemical: [
        { stage: "1st year", days: 0, nitrogen: "20g/vine", phosphorus: "18g/vine", potassium: "50g/vine", application: "Split into 3 doses" },
        { stage: "Mature vine", days: 0, nitrogen: "50g/vine", phosphorus: "50g/vine", potassium: "125g/vine", application: "Split into 3 doses annually" }
      ]
    },
    commonPests: ["Pollu Beetle", "Scale Insects", "Thrips", "Nematodes"],
    commonDiseases: ["Foot Rot", "Anthracnose", "Leaf Blight", "Slow Decline"],
    irrigationSchedule: {
      frequency: "Weekly during dry season",
      amount: "20-25L per vine per week",
      critical_periods: ["Flowering", "Berry development", "Dry months"],
      method: "Basin irrigation, avoid overhead irrigation"
    }
  }
};

// Pest and Disease Database
export const PEST_DISEASE_DB: Record<string, PestDisease> = {
  brown_plant_hopper: {
    id: "bph_001",
    name: "Brown Plant Hopper",
    malayalam: "തവിട്ട് ചെടി ചാടുന്ന പുഴു",
    type: "pest",
    crops_affected: ["paddy"],
    symptoms: [
      "Yellow to brown patches in rice fields",
      "Stunted plant growth",
      "Drying and burning of plants from base",
      "Honeydew excretion on leaves"
    ],
    malayalam_symptoms: [
      "നെൽവയലിൽ മഞ്ഞ മുതൽ തവിട്ട് പാടുകൾ",
      "ചെടിയുടെ വളർച്ച മുരടിക്കൽ",
      "ചെടികൾ അടിഭാഗത്ത് നിന്നും ഉണങ്ങി കരിയുന്നു",
      "ഇലകളിൽ തേൻ പോലുള്ള സ്രവണം"
    ],
    causes: [
      "High humidity and temperature",
      "Dense planting",
      "Excessive nitrogen fertilization",
      "Continuous flooding"
    ],
    identification: {
      visual_signs: ["Small brown insects on stem base", "Circular dying patches", "Sooty mold on leaves"],
      affected_parts: ["Stem base", "Lower leaves", "Entire plant in severe cases"],
      environmental_conditions: ["High humidity >80%", "Temperature 25-30°C", "Stagnant water"]
    },
    treatment: {
      cultural: [
        "Drain field water temporarily",
        "Remove alternate host plants",
        "Use resistant varieties like IR-64",
        "Maintain proper plant spacing"
      ],
      biological: [
        "Release Mirid bugs (Cyrtorhinus lividipennis)",
        "Use egg parasitoid Anagrus nilaparvatae",
        "Apply Metarhizium anisopliae fungus"
      ],
      chemical: [
        {
          name: "Imidacloprid 17.8% SL",
          active_ingredient: "Imidacloprid",
          dosage: "100ml per hectare",
          application_method: "Foliar spray",
          preharvest_interval: 21,
          safety_equipment: ["Mask", "Gloves", "Full body cover"],
          restrictions: ["Do not spray during flowering", "Avoid spraying in windy conditions"]
        }
      ],
      organic: [
        "Neem oil 5ml per liter spray",
        "Soap solution spray (2% concentration)",
        "Pongamia oil application"
      ]
    },
    prevention: [
      "Use certified disease-free seeds",
      "Follow recommended fertilizer schedule",
      "Maintain proper water management",
      "Regular field monitoring"
    ],
    severity_levels: {
      mild: "Less than 10% of field affected, sparse population",
      moderate: "10-25% field affected, visible damage to plants",
      severe: "More than 25% field affected, significant yield loss expected"
    }
  },

  blast_disease: {
    id: "blast_001",
    name: "Rice Blast",
    malayalam: "നെല്ലിന്റെ ബ്ലാസ്റ്റ് രോഗം",
    type: "disease",
    crops_affected: ["paddy"],
    symptoms: [
      "Diamond-shaped spots on leaves with gray centers",
      "Dark brown margins around spots",
      "Neck rot causing panicle breaking",
      "White to grayish powdery growth on spots"
    ],
    malayalam_symptoms: [
      "ഇലകളിൽ ചാരനിറത്തിലുള്ള മധ്യഭാഗവും വജ്രാകൃതിയിലുള്ള പാടുകൾ",
      "പാടുകളുടെ ചുറ്റും കറുത്ത തവിട്ട് അരികുകൾ",
      "കഴുത്ത് ചാരൽ മൂലം കതിരിന്റെ ഒടിവ്",
      "പാടുകളിൽ വെള്ള മുതൽ ചാര നിറത്തിലുള്ള പൊടി പോലുള്ള വളർച്ച"
    ],
    causes: [
      "Fungal pathogen Magnaporthe oryzae",
      "High humidity and moisture",
      "Cloudy weather with frequent rains",
      "Dense planting and poor air circulation"
    ],
    identification: {
      visual_signs: ["Spindle-shaped lesions", "Gray centers with dark borders", "Fungal sporulation"],
      affected_parts: ["Leaves", "Neck/panicle", "Nodes", "Seeds"],
      environmental_conditions: ["High humidity >90%", "Temperature 25-28°C", "Frequent dew formation"]
    },
    treatment: {
      cultural: [
        "Remove infected plant debris",
        "Improve field drainage",
        "Reduce plant density",
        "Balanced fertilization (avoid excess nitrogen)"
      ],
      biological: [
        "Apply Trichoderma viride",
        "Use Pseudomonas fluorescens",
        "Bacillus subtilis application"
      ],
      chemical: [
        {
          name: "Tricyclazole 75% WP",
          active_ingredient: "Tricyclazole",
          dosage: "600g per hectare",
          application_method: "Foliar spray",
          preharvest_interval: 30,
          safety_equipment: ["Respirator", "Protective clothing", "Gloves"],
          restrictions: ["Maximum 2 sprays per season", "Do not spray during grain filling"]
        }
      ],
      organic: [
        "Bordeaux mixture (1% solution)",
        "Copper oxychloride spray",
        "Garlic and ginger extract"
      ]
    },
    prevention: [
      "Use resistant varieties",
      "Crop rotation with non-host crops",
      "Seed treatment with fungicide",
      "Proper field sanitation"
    ],
    severity_levels: {
      mild: "Few scattered spots on lower leaves, no neck blast",
      moderate: "Multiple leaf spots, some neck infection, 10-25% yield loss",
      severe: "Extensive leaf blight, severe neck blast, >25% yield loss"
    }
  },

  coconut_red_palm_weevil: {
    id: "rpw_001",
    name: "Red Palm Weevil",
    malayalam: "ചുവന്ന പനമരം കുഴിയൻ പുഴു",
    type: "pest",
    crops_affected: ["coconut"],
    symptoms: [
      "Yellowing and wilting of fronds",
      "Holes in the stem with brown discharge",
      "Foul smell from infected palms",
      "Chewed fiber and frass around holes"
    ],
    malayalam_symptoms: [
      "ഇലകൾ മഞ്ഞയായി വാടുന്നു",
      "തണ്ടിൽ തവിട്ട് സ്രവവുമായി കുഴികൾ",
      "രോഗബാധിത മരങ്ങളിൽ നിന്നും ദുർഗന്ധം",
      "കുഴികൾക്കു ചുറ്റും ചവച്ച നാരുകളും മാലിന്യവും"
    ],
    causes: [
      "Adult weevil Rhynchophorus ferrugineus",
      "Wounds in palm provide entry points",
      "Poor palm hygiene and maintenance",
      "Spread from infected neighboring palms"
    ],
    identification: {
      visual_signs: ["Large reddish-brown weevils", "Grub tunnels in stem", "Fermenting palm sap smell"],
      affected_parts: ["Crown", "Upper trunk", "Growing point", "Leaf bases"],
      environmental_conditions: ["Warm humid weather", "Palms with wounds or cuts", "Poor drainage around palm base"]
    },
    treatment: {
      cultural: [
        "Remove severely infected palms immediately",
        "Clean wounds with antiseptic",
        "Regular inspection of palms",
        "Maintain palm hygiene"
      ],
      biological: [
        "Use pheromone traps",
        "Release entomopathogenic nematodes",
        "Apply Metarhizium anisopliae fungus"
      ],
      chemical: [
        {
          name: "Imidacloprid 17.8% SL",
          active_ingredient: "Imidacloprid",
          dosage: "2ml per liter injection",
          application_method: "Stem injection",
          preharvest_interval: 45,
          safety_equipment: ["Full protective gear", "Respirator", "Eye protection"],
          restrictions: ["Licensed applicator required", "Avoid contact with nuts"]
        }
      ],
      organic: [
        "Neem cake application around palm base",
        "Castor cake mixed with sand",
        "Mechanical removal of grubs"
      ]
    },
    prevention: [
      "Regular palm inspection",
      "Avoid creating wounds on palms",
      "Immediate treatment of any cuts",
      "Install pheromone traps"
    ],
    severity_levels: {
      mild: "Early infestation, few entry holes, palm still healthy",
      moderate: "Multiple tunnels, some frond yellowing, treatable",
      severe: "Extensive damage, crown collapse, palm likely to die"
    }
  }
};

// Soil Analysis Guidelines
export const SOIL_ANALYSIS: SoilAnalysis = {
  pH: {
    ideal_range: { min: 6.0, max: 7.5 },
    interpretation: {
      very_acidic: "Below 4.5 - Severely acidic, lime application essential",
      acidic: "4.5-6.0 - Acidic, apply dolomite lime",
      neutral: "6.0-7.5 - Ideal range for most crops",
      alkaline: "7.5-8.5 - Alkaline, add organic matter",
      very_alkaline: "Above 8.5 - Highly alkaline, gypsum application needed"
    },
    correction: {
      acidic: [
        "Apply dolomite lime 2-4 tons per hectare",
        "Add organic matter to buffer pH changes",
        "Split lime application over 2-3 seasons"
      ],
      alkaline: [
        "Apply elemental sulfur 500-1000 kg/ha",
        "Add acidifying fertilizers like ammonium sulfate",
        "Incorporate organic compost"
      ]
    }
  },
  nutrients: {
    nitrogen: {
      ideal_range: "Medium to high (280-560 kg/ha available N)",
      deficiency_symptoms: ["Yellowing of older leaves", "Stunted growth", "Poor tillering"],
      excess_symptoms: ["Excessive vegetative growth", "Delayed maturity", "Increased pest problems"],
      sources: {
        organic: ["Compost", "Farm yard manure", "Green manure", "Vermicompost"],
        chemical: ["Urea (46% N)", "Ammonium sulfate (21% N)", "CAN (25% N)"]
      }
    },
    phosphorus: {
      ideal_range: "Medium to high (22-56 kg/ha available P2O5)",
      deficiency_symptoms: ["Purple tinge on leaves", "Poor root development", "Delayed flowering"],
      excess_symptoms: ["Micronutrient deficiencies", "Reduced zinc availability"],
      sources: {
        organic: ["Rock phosphate", "Bone meal", "Compost"],
        chemical: ["Single super phosphate (16% P2O5)", "DAP (46% P2O5)", "Triple super phosphate (46% P2O5)"]
      }
    },
    potassium: {
      ideal_range: "Medium to high (280-560 kg/ha available K2O)",
      deficiency_symptoms: ["Marginal leaf burn", "Poor disease resistance", "Weak stems"],
      excess_symptoms: ["Magnesium deficiency", "Calcium deficiency"],
      sources: {
        organic: ["Wood ash", "Compost", "Banana peels"],
        chemical: ["Muriate of potash (60% K2O)", "Sulfate of potash (50% K2O)"]
      }
    },
    organic_matter: {
      ideal_range: "Above 2.5% for good soil health",
      deficiency_symptoms: ["Poor soil structure", "Low water retention", "Reduced microbial activity"],
      excess_symptoms: ["Nitrogen tie-up in extremely high levels (>8%)"],
      sources: {
        organic: ["Compost", "Farm yard manure", "Crop residues", "Green manure"],
        chemical: ["Not applicable - organic matter comes from organic sources only"]
      }
    }
  }
};

// Weather-based Advisories
export const WEATHER_ADVISORIES: Record<string, WeatherAdvisory> = {
  heavy_rain: {
    condition: "Heavy rainfall expected (>50mm in 24h)",
    recommendation: "Postpone all spray applications and harvest operations",
    malayalam: "കനത്ത മഴ പ്രതീക്ഷിക്കുന്നു - എല്ലാ തളിക്കലുകളും വിളവെടുപ്പും മാറ്റിവയ്ക്കുക",
    actions: [
      "Ensure proper drainage in fields",
      "Harvest ready crops before rain",
      "Protect stored grains from moisture"
    ],
    restrictions: [
      "No pesticide application",
      "Avoid field operations with machinery",
      "Do not apply fertilizers"
    ]
  },
  drought: {
    condition: "No rainfall for 15+ days, soil moisture low",
    recommendation: "Implement water conservation measures and drought-resistant practices",
    malayalam: "15 ദിവസത്തിൽ കൂടുതൽ മഴയില്ല - ജല സംരക്ഷണ നടപടികൾ സ്വീകരിക്കുക",
    actions: [
      "Apply mulch to conserve soil moisture",
      "Use drip irrigation if available",
      "Harvest rainwater for future use"
    ],
    restrictions: [
      "Reduce irrigation frequency but increase depth",
      "Avoid cultivation during hottest part of day",
      "Skip non-essential field operations"
    ]
  },
  high_wind: {
    condition: "Wind speed >35 km/h expected",
    recommendation: "Protect tall crops and postpone spray operations",
    malayalam: "ശക്തമായ കാറ്റ് പ്രതീക്ഷിക്കുന്നു - ഉയർന്ന വിളകൾ സംരക്ഷിക്കുകയും തളിക്കൽ മാറ്റിവയ്ക്കുകയും ചെയ്യുക",
    actions: [
      "Provide support stakes for tall plants",
      "Secure shade nets and protective covers",
      "Harvest mature fruits before wind damage"
    ],
    restrictions: [
      "No aerial spray applications",
      "Avoid pruning operations",
      "Do not remove plant supports"
    ]
  }
};

export default {
  KERALA_CROPS,
  PEST_DISEASE_DB,
  SOIL_ANALYSIS,
  WEATHER_ADVISORIES
};
