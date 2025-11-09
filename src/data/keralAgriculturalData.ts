// Comprehensive Kerala Agricultural Database
// Real data for crops, pests, diseases, treatments, and farming practices

export interface CropVariety {
  name: string;
  malayalam: string;
  duration: string;
  yield: string;
  resistance: string[];
  suitability: string[];
}

export interface PestDisease {
  id: string;
  name: string;
  malayalam: string;
  type: 'pest' | 'disease' | 'nutrient_deficiency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  malayalam_symptoms: string[];
  causes: string[];
  affected_crops: string[];
  treatment: {
    immediate: string[];
    chemical: {
      product: string;
      dosage: string;
      application_method: string;
      frequency: string;
      precautions: string[];
    }[];
    organic: string[];
    cultural: string[];
  };
  prevention: string[];
  seasonal_occurrence: string[];
  images?: string[];
}

export interface CropData {
  id: string;
  name: string;
  malayalam: string;
  scientific_name: string;
  varieties: CropVariety[];
  planting_calendar: {
    season: string;
    months: string[];
    preparation: string[];
    sowing_method: string;
    spacing: string;
    depth: string;
  }[];
  soil_requirements: {
    ph_range: string;
    soil_type: string[];
    drainage: string;
    organic_matter: string;
  };
  climate_needs: {
    temperature: string;
    rainfall: string;
    humidity: string;
    sunlight: string;
  };
  fertilizer_program: {
    stage: string;
    days_after_planting: number;
    nutrients: {
      nitrogen: string;
      phosphorus: string;
      potassium: string;
    };
    organic_alternatives: string[];
  }[];
  irrigation: {
    method: string;
    frequency: string;
    critical_stages: string[];
    water_requirement: string;
  };
  pest_diseases: string[];
  harvest: {
    indicators: string[];
    method: string;
    post_harvest: string[];
  };
  market_info: {
    peak_seasons: string[];
    storage_methods: string[];
    value_addition: string[];
  };
}

export interface TreatmentProduct {
  name: string;
  malayalam: string;
  type: 'fungicide' | 'insecticide' | 'herbicide' | 'fertilizer' | 'organic';
  active_ingredient: string;
  dosage_per_liter: string;
  target_pests_diseases: string[];
  application_method: string[];
  safety_period: string;
  precautions: string[];
  availability: 'widely_available' | 'limited' | 'seasonal';
  cost_range: string;
}

// PADDY (Rice) - Kerala's Primary Crop
const PADDY_DATA: CropData = {
  id: 'paddy',
  name: 'Paddy',
  malayalam: 'നെല്ല്',
  scientific_name: 'Oryza sativa',
  varieties: [
    {
      name: 'Jyothi',
      malayalam: 'ജ്യോതി',
      duration: '125-130 days',
      yield: '4.5-5.5 tons/hectare',
      resistance: ['Blast', 'Brown plant hopper'],
      suitability: ['Kharif', 'Double crop areas']
    },
    {
      name: 'Uma',
      malayalam: 'ഉമ',
      duration: '115-120 days',
      yield: '4.0-5.0 tons/hectare',
      resistance: ['Bacterial blight'],
      suitability: ['Both seasons', 'High yielding']
    },
    {
      name: 'Rohini',
      malayalam: 'രോഹിണി',
      duration: '135-140 days',
      yield: '5.0-6.0 tons/hectare',
      resistance: ['Blast', 'Sheath blight'],
      suitability: ['Kharif season', 'Medium land']
    }
  ],
  planting_calendar: [
    {
      season: 'Kharif (Virippu)',
      months: ['May-June', 'മേയ്-ജൂൺ'],
      preparation: [
        'പാടശേഖരം ഉഴുതുമറിക്കുക',
        'വെള്ളം നിറച്ച് ആഴത്തിൽ കിളച്ചുകളയുക',
        'കളകൾ നീക്കം ചെയ്യുക',
        'നടീൽ 20 ദിവസം മുമ്പ് തൈകൾ തയ്യാറാക്കുക'
      ],
      sowing_method: 'വരി നടീൽ (SRI method preferred)',
      spacing: '20cm x 15cm',
      depth: '2-3cm'
    },
    {
      season: 'Rabi (Mundakan)',
      months: ['November-December', 'നവംബർ-ഡിസംബർ'],
      preparation: [
        'വിളവെടുപ്പിന് ശേഷം പാടം വൃത്തിയാക്കുക',
        'കുറച്ച് വെള്ളം നിറച്ച് കിളക്കുക',
        'ജൈവവളം ചേർക്കുക'
      ],
      sowing_method: 'നേരിട്ട് വിത്ത് വിതയ്ക്കൽ അല്ലെങ്കിൽ നടീൽ',
      spacing: '20cm x 10cm (തിരുത്തിയ സ്പേസിങ്)',
      depth: '2cm'
    }
  ],
  soil_requirements: {
    ph_range: '5.5-7.0',
    soil_type: ['കളിമണ്ണ്', 'കളി കലർന്ന പശിമണ്ണ്', 'ആഴമുള്ള മണ്ണ്'],
    drainage: 'നിയന്ത്രിത ജലനിർഗമനം (വെള്ളം നിലനിർത്താൻ കഴിയുന്ന)',
    organic_matter: 'മിനിമം 2.5% (കമ്പോസ്റ്റ് അല്ലെങ്കിൽ ചാണകവളം ആവശ്യം)'
  },
  climate_needs: {
    temperature: '20-35°C (വളർച്ചാകാലത്ത്), 18-20°C (പൂക്കാലത്ത്)',
    rainfall: '1000-2000mm വാർഷിക മഴ',
    humidity: '80-90% (കേരളത്തിന് അനുയോജ്യം)',
    sunlight: 'ദിവസത്തിൽ 4-6 മണിക്കൂർ നേരിട്ടുള്ള സൂര്യപ്രകാശം'
  },
  fertilizer_program: [
    {
      stage: 'Base Application (അടിവളം)',
      days_after_planting: 0,
      nutrients: {
        nitrogen: '40kg/hectare (യൂറിയ 87kg)',
        phosphorus: '20kg/hectare (സൂപ്പർ ഫോസ്ഫേറ്റ് 125kg)',
        potassium: '20kg/hectare (MOP 33kg)'
      },
      organic_alternatives: ['10-15 ടൺ ചാണകവളം', '5 ടൺ കമ്പോസ്റ്റ്', '2 ടൺ വേപ്പിൻ പിണ്ണാക്ക്']
    },
    {
      stage: 'First Top Dressing',
      days_after_planting: 25,
      nutrients: {
        nitrogen: '30kg/hectare (യൂറിയ 65kg)',
        phosphorus: '0kg',
        potassium: '10kg/hectare (MOP 17kg)'
      },
      organic_alternatives: ['ജീവാമൃതം 200 ലിറ്റർ/hectare', 'മത്സ്യ അമീനോ ആസിഡ് 2ml/ലിറ്റർ']
    },
    {
      stage: 'Second Top Dressing',
      days_after_planting: 45,
      nutrients: {
        nitrogen: '30kg/hectare (യൂറിയ 65kg)',
        phosphorus: '0kg',
        potassium: '10kg/hectare'
      },
      organic_alternatives: ['പഞ്ചഗവ്യം 3ml/ലിറ്റർ', 'വർമി വാഷ് 1:10 ratio']
    }
  ],
  irrigation: {
    method: 'നിയന്ത്രിത വെള്ളനിർത്തൽ (2-5cm ആഴം)',
    frequency: 'തുടർച്ചയായി (വേനൽക്കാലത്ത്), ഇടവിട്ട് (മഴക്കാലത്ത്)',
    critical_stages: ['നടീൽ കാലം', 'കിടാങ് വിടൽ സമയം', 'പൂക്കാലം', 'കതിർ നിറയുന്ന സമയം'],
    water_requirement: '1000-1200mm (സീസണിൽ)'
  },
  pest_diseases: ['blast', 'brown_spot', 'sheath_blight', 'stem_borer', 'leaf_folder', 'brown_planthopper'],
  harvest: {
    indicators: [
      'കതിരിന്റെ 80% മഞ്ഞനിറമാകുമ്പോൾ',
      'അരി കഠിനമായിക്കഴിഞ്ഞാൽ',
      'പുല്ലിന്റെ നിറം മാറുമ്പോൾ'
    ],
    method: 'കയ്യാലയോ ഹാർവെസ്റ്റർ ഉപയോഗിച്ചോ',
    post_harvest: [
      'ഉടനെ ഉണക്കുക (14% moisture വരെ)',
      'വൃത്തിയായി വിത്രീകരിക്കുക',
      'കീടരഹിത സ്റ്റോറിൽ സൂക്ഷിക്കുക'
    ]
  },
  market_info: {
    peak_seasons: ['ജനുവരി-മാർച്ച് (മുണ്ടകൻ)', 'സെപ്റ്റംബർ-ഒക്ടോബർ (വിരിപ്പു)'],
    storage_methods: ['വായുകടയാത്ത കണ്ടെയ്നർ', 'നീം ഇലകൾ ചേർത്ത് സൂക്ഷിപ്പ്'],
    value_addition: ['പാർബോയിൽഡ് റൈസ്', 'റെഡി ടു ഈറ്റ് പ്രൊഡക്ട്സ്', 'റൈസ് ബ്രാൻ ഓയിൽ']
  }
};

// MAJOR PESTS AND DISEASES
const RICE_BLAST: PestDisease = {
  id: 'rice_blast',
  name: 'Rice Blast',
  malayalam: 'നെൽ ബ്ലാസ്റ്റ്',
  type: 'disease',
  severity: 'high',
  symptoms: [
    'Leaf spots with gray centers and brown margins',
    'Neck blast causing panicle breakage',
    'Diamond-shaped lesions on leaves',
    'Whitish to gray spots with dark borders'
  ],
  malayalam_symptoms: [
    'ഇലയിൽ തവിട്ടുനിറത്തിലുള്ള അരികുകളോടു കൂടിയ ചാരനിറത്തിലുള്ള പാടുകൾ',
    'കഴുത്തു ബ്ലാസ്റ്റ് മൂലം കതിർ ഒടിയൽ',
    'ഇലയിൽ വജ്രാകൃതിയിലുള്ള മുറിവുകൾ',
    'കറുത്ത അരികുകളോടുകൂടിയ വെളുത്തതും ചാരനിറത്തിലുള്ളതുമായ പാടുകൾ'
  ],
  causes: [
    'Fungus Magnaporthe oryzae',
    'High humidity (>90%)',
    'Excessive nitrogen fertilization',
    'Water stress alternating with flooding'
  ],
  affected_crops: ['paddy'],
  treatment: {
    immediate: [
      'Remove affected plant parts immediately',
      'Improve field drainage',
      'Stop nitrogen application temporarily',
      'Spray fungicide within 24 hours'
    ],
    chemical: [
      {
        product: 'Tricyclazole 75% WP',
        dosage: '0.6g/liter',
        application_method: 'Foliar spray',
        frequency: '2 sprays 10 days apart',
        precautions: ['Wear mask and gloves', 'Spray during cool hours', 'Avoid during flowering']
      },
      {
        product: 'Carbendazim 50% WP',
        dosage: '1g/liter',
        application_method: 'Foliar spray',
        frequency: 'Single application',
        precautions: ['Do not mix with alkaline chemicals', 'Safe period: 37 days']
      }
    ],
    organic: [
      'വേപ്പെണ്ണ 5ml/ലിറ്റർ + അനിലിന് 2ml/ലിറ്റർ',
      'ബോർഡോ മിശ്രിതം 1% (10g CuSO4 + 10g കുമ്മായം/ലിറ്റർ)',
      'അജ്ഞാതവൃക്ഷ സത്തിന്റെ അർക്ക് 20ml/ലിറ്റർ',
      'ഇഞ്ചി-വെളുത്തുള്ളി പേസ്റ്റ് 20g/ലിറ്റർ'
    ],
    cultural: [
      'പ്രതിരോധശേഷിയുള്ള വിത്തിനങ്ങൾ ഉപയോഗിക്കുക',
      'വിത്ത് ട്രീറ്റ്മെന്റ് ട്രൈക്കോഡെർമ കൊണ്ട്',
      'സന്തുലിത വള പ്രയോഗം',
      'വയലിലെ ആർദ്രത നിയന്ത്രിക്കുക'
    ]
  },
  prevention: [
    'Use resistant varieties like Jyothi, Rohini',
    'Proper seed treatment with Tricyclazole',
    'Maintain optimal plant spacing',
    'Balanced fertilizer application',
    'Avoid water stagnation',
    'Remove crop residues after harvest'
  ],
  seasonal_occurrence: ['June-August', 'December-February', 'High humidity periods']
};

const BROWN_PLANTHOPPER: PestDisease = {
  id: 'brown_planthopper',
  name: 'Brown Planthopper',
  malayalam: 'തവിട്ട് ചാട്ടപ്പുഴു',
  type: 'pest',
  severity: 'critical',
  symptoms: [
    'Yellowing and drying of leaves from base',
    'Hopper burn - circular patches of dried plants',
    'Stunted plant growth',
    'Small brown insects visible at base of plants',
    'Honeydew deposits on leaves'
  ],
  malayalam_symptoms: [
    'ചെടിയുടെ അടിഭാഗത്തുനിന്നും ഇലകൾ മഞ്ഞയായി ഉണങ്ങൽ',
    'വൃത്താകൃതിയിലുള്ള ഉണങ്ങിയ പാടുകൾ',
    'ചെടിയുടെ വളർച്ച മുരടിക്കൽ',
    'ചെടിയുടെ അടിഭാഗത്ത് ചെറിയ തവിട്ട് നിറത്തിലുള്ള പ്രാണികൾ',
    'ഇലകളിൽ തേൻമഞ്ഞു പോലുള്ള നിക്ഷേപം'
  ],
  causes: [
    'Nilaparvata lugens pest',
    'High humidity and temperature',
    'Excessive nitrogen application',
    'Continuous flooding'
  ],
  affected_crops: ['paddy'],
  treatment: {
    immediate: [
      'Drain water from field completely',
      'Apply recommended insecticide immediately',
      'Remove severely affected plants',
      'Stop nitrogen fertilizer application'
    ],
    chemical: [
      {
        product: 'Imidacloprid 17.8% SL',
        dosage: '0.3ml/liter',
        application_method: 'Spray on lower parts of plants',
        frequency: 'Single application',
        precautions: ['Highly toxic to bees', 'Use only during pest attack', 'Safe period: 21 days']
      },
      {
        product: 'Buprofezin 25% SC',
        dosage: '2ml/liter',
        application_method: 'Foliar spray',
        frequency: 'Once per season',
        precautions: ['Target nymphal stages', 'Avoid during beneficial insect activity']
      }
    ],
    organic: [
      'വേപ്പെണ്ണ 5ml + അനിലിൻ 2ml/ലിറ്റർ',
      'കാരിയില പത്തിരി + ഇഞ്ചി + വെളുത്തുള്ളി കഷായം',
      'പുക കൊണ്ടുള്ള അപ്പാവനം വൈകുന്നേരങ്ങളിൽ',
      'ഫിഷ് ഓയിൽ സോപ്പ് 5ml/ലിറ്റർ'
    ],
    cultural: [
      'വെള്ളം വറ്റിച്ച് വയൽ ഉണക്കുക',
      'പ്രതിരോധശേഷിയുള്ള ഇനങ്ങൾ നടുക',
      'പക്ഷികൾക്കുള്ള വാസസ്ഥലം ഒരുക്കുക',
      'സന്തുലിത വള പ്രയോഗം'
    ]
  },
  prevention: [
    'Use BPH resistant varieties',
    'Avoid excessive nitrogen',
    'Maintain proper water management',
    'Encourage natural enemies like spiders',
    'Monitor regularly with light traps',
    'Avoid indiscriminate pesticide use'
  ],
  seasonal_occurrence: ['July-September', 'January-March', 'Peak during reproductive stage']
};

// COCONUT DATA
const COCONUT_DATA: CropData = {
  id: 'coconut',
  name: 'Coconut',
  malayalam: 'തേങ്ങ്',
  scientific_name: 'Cocos nucifera',
  varieties: [
    {
      name: 'West Coast Tall',
      malayalam: 'വെസ്റ്റ് കോസ്റ്റ് ടാൾ',
      duration: '5-7 years to bearing',
      yield: '80-120 nuts/palm/year',
      resistance: ['Drought tolerant', 'Wind resistant'],
      suitability: ['Coastal areas', 'Traditional variety']
    },
    {
      name: 'Malayan Dwarf',
      malayalam: 'മലയൻ കുള്ളൻ',
      duration: '3-4 years to bearing',
      yield: '150-200 nuts/palm/year',
      resistance: ['Early bearing'],
      suitability: ['High density planting', 'Intercropping']
    }
  ],
  planting_calendar: [
    {
      season: 'Pre-monsoon',
      months: ['April-May', 'ഏപ്രിൽ-മേയ്'],
      preparation: [
        '1m x 1m x 1m കുഴികൾ കുഴിക്കുക',
        'ഓരോ കുഴിയിലും 20kg കമ്പോസ്റ്റ് ചേർക്കുക',
        '1kg വേപ്പിൻപിണ്ണാക്ക് കലർത്തുക',
        'മണ്സൂൺ മുമ്പ് നടുക'
      ],
      sowing_method: 'തൈകൾ നടുക (8-10 മാസം പഴക്കമുള്ള)',
      spacing: '7.5m x 7.5m (triangular) or 8m x 8m (square)',
      depth: 'തേങ്ങ തുള്ളിന്റെ മുകൾ ഭാഗം മണ്ണിന്റെ തലത്തിൽ'
    }
  ],
  soil_requirements: {
    ph_range: '5.5-8.0',
    soil_type: ['മണൽ കലർന്ന പശിമണ്ണ്', 'എല്ലാ തരം മണ്ണും (ഉപ്പുവെള്ളം സഹിക്കും)'],
    drainage: 'നല്ല ജലനിർഗമനം ആവശ്യം',
    organic_matter: 'കൂടുതൽ ജൈവവസ്തു ആവശ്യം'
  },
  climate_needs: {
    temperature: '20-32°C',
    rainfall: '1000-2000mm (തുല്യമായി വിതരണം ചെയ്യപ്പെട്ട)',
    humidity: '60-80%',
    sunlight: 'സമ്പൂർണ്ണ സൂര്യപ്രകാശം'
  },
  fertilizer_program: [
    {
      stage: 'Adult Palm (5+ years)',
      days_after_planting: 365,
      nutrients: {
        nitrogen: '500g urea',
        phosphorus: '320g superphosphate', 
        potassium: '750g MOP'
      },
      organic_alternatives: ['25kg ചാണകവളം', '5kg വേപ്പിൻപിണ്ണാക്ക്', '2kg അസ്ഥിപ്പൊടി']
    }
  ],
  irrigation: {
    method: 'വൃത്താകൃതിയിലുള്ള ബേസിൻ ഇറിഗേഷൻ',
    frequency: 'വേനൽക്കാലത്ത് ആഴ്ചയിൽ 2-3 തവണ',
    critical_stages: ['വേനൽക്കാലം', 'പൂവിടൽ സമയം', 'കായ് രൂപീകരണം'],
    water_requirement: '40-50 liters/palm/day (വേനൽക്കാലത്ത്)'
  },
  pest_diseases: ['rhinoceros_beetle', 'red_palm_weevil', 'bud_rot', 'stem_bleeding'],
  harvest: {
    indicators: ['കായ് തവിട്ടുനിറമാകുമ്പോൾ (11-12 മാസം പഴക്കം)'],
    method: 'കയറി പറിക്കുക അല്ലെങ്കിൽ പൊക്കക്കോൽ ഉപയോഗിക്കുക',
    post_harvest: ['തേങ്ങ അടിയന്തിരമായി സംസ്കരിക്കുക', 'ഉണക്കി കോപ്ര ഉണ്ടാക്കുക']
  },
  market_info: {
    peak_seasons: ['ഡിസംബർ-മാർച്ച് (ഉണക്കിയ തേങ്ങയ്ക്ക്)', 'വർഷം മുഴുവനും (ഇളനീരിന്)'],
    storage_methods: ['തണുത്ത സ്ഥലത്ത് സൂക്ഷിക്കുക', 'ഈർപ്പം ഒഴിവാക്കുക'],
    value_addition: ['കോപ്ര', 'തേങ്ങാ എണ്ണ', 'ഡെസിക്കേറ്റഡ് കോക്കനട്ട്', 'കയർ ഉൽപ്പാദനം']
  }
};

// FERTILIZER PRODUCTS AVAILABLE IN KERALA
const FERTILIZER_PRODUCTS: TreatmentProduct[] = [
  {
    name: 'Urea',
    malayalam: 'യൂറിയ',
    type: 'fertilizer',
    active_ingredient: '46% Nitrogen',
    dosage_per_liter: 'Soil application: 5-10g per plant',
    target_pests_diseases: ['Nitrogen deficiency'],
    application_method: ['Soil application', 'Side dressing'],
    safety_period: 'No restriction',
    precautions: ['Store in dry place', 'Avoid over-application'],
    availability: 'widely_available',
    cost_range: '₹6-8 per kg'
  },
  {
    name: 'DAP (Di-ammonium Phosphate)',
    malayalam: 'ഡി.എ.പി',
    type: 'fertilizer',
    active_ingredient: '18% N, 46% P2O5',
    dosage_per_liter: 'Base application: 50-100kg/hectare',
    target_pests_diseases: ['Phosphorus deficiency'],
    application_method: ['Basal application', 'Band placement'],
    safety_period: 'No restriction',
    precautions: ['Apply before planting', 'Mix with soil'],
    availability: 'widely_available',
    cost_range: '₹25-30 per kg'
  },
  {
    name: 'Muriate of Potash (MOP)',
    malayalam: 'എം.ഒ.പി / പൊട്ടാഷ്',
    type: 'fertilizer',
    active_ingredient: '60% K2O',
    dosage_per_liter: '50-75kg/hectare',
    target_pests_diseases: ['Potassium deficiency'],
    application_method: ['Soil application', 'Split application'],
    safety_period: 'No restriction',
    precautions: ['Apply in split doses', 'Ensure soil moisture'],
    availability: 'widely_available',
    cost_range: '₹15-20 per kg'
  }
];

// PESTICIDE PRODUCTS AVAILABLE IN KERALA
const PESTICIDE_PRODUCTS: TreatmentProduct[] = [
  {
    name: 'Bavistin (Carbendazim 50% WP)',
    malayalam: 'ബാവിസ്റ്റിൻ',
    type: 'fungicide',
    active_ingredient: 'Carbendazim 50%',
    dosage_per_liter: '1g/liter',
    target_pests_diseases: ['Rice blast', 'Sheath blight', 'Powdery mildew'],
    application_method: ['Foliar spray', 'Seed treatment'],
    safety_period: '37 days',
    precautions: ['Wear protective gear', 'Avoid inhalation', 'Do not spray during flowering'],
    availability: 'widely_available',
    cost_range: '₹180-220 per 100g'
  },
  {
    name: 'Confidor (Imidacloprid 17.8% SL)',
    malayalam: 'കൺഫിഡോർ',
    type: 'insecticide',
    active_ingredient: 'Imidacloprid 17.8%',
    dosage_per_liter: '0.3ml/liter',
    target_pests_diseases: ['Brown planthopper', 'White fly', 'Thrips'],
    application_method: ['Foliar spray', 'Soil drench'],
    safety_period: '21 days',
    precautions: ['Highly toxic to bees', 'Use protective clothing', 'Avoid drift'],
    availability: 'widely_available',
    cost_range: '₹450-500 per 100ml'
  },
  {
    name: 'Neem Oil',
    malayalam: 'വേപ്പെണ്ണ',
    type: 'organic',
    active_ingredient: 'Azadirachtin 0.15%',
    dosage_per_liter: '5ml/liter + 2ml detergent',
    target_pests_diseases: ['Most sucking pests', 'Caterpillars', 'Fungal diseases'],
    application_method: ['Foliar spray'],
    safety_period: '3 days',
    precautions: ['Apply in evening', 'Add sticker for better coverage'],
    availability: 'widely_available',
    cost_range: '₹80-120 per 100ml'
  }
];

// SEASONAL CALENDAR FOR KERALA AGRICULTURE
const KERALA_AGRICULTURAL_CALENDAR = {
  january: {
    malayalam: 'ജനുവരി',
    weather: 'Cool and dry, post-monsoon',
    activities: [
      'നെൽ വിളവെടുപ്പ് (മുണ്ടകൻ)',
      'വാഴ നടീൽ',
      'പച്ചക്കറി വിത്ത് വിതയ്ക്കൽ',
      'തേങ്ങ വളപ്രയോഗം'
    ],
    pest_disease_pressure: 'Low to medium'
  },
  february: {
    malayalam: 'ഫെബ്രുവരി',
    weather: 'Warm and dry',
    activities: [
      'വേനൽക്കാല വിളകളുടെ തയ്യാറെടുപ്പ്',
      'ജലസേചനം വർദ്ധിപ്പിക്കുക',
      'കാപ്പി വിളവെടുപ്പ്',
      'കുരുമുളക് വള പ്രയോഗം'
    ],
    pest_disease_pressure: 'Medium (water stress related)'
  },
  march: {
    malayalam: 'മാർച്ച്',
    weather: 'Hot and dry, summer begins',
    activities: [
      'വേനൽക്കാല പച്ചക്കറികൾ വിതയ്ക്കൽ',
      'തേങ്ങാ തോപ്പിൽ ജലസേചനം',
      'മരം മുറിക്കൽ',
      'വേനൽക്കാല കൃഷിക്കായുള്ള ഭൂമി തയ്യാറാക്കൽ'
    ],
    pest_disease_pressure: 'Medium to high'
  }
  // ... (other months can be added similarly)
};

export {
  PADDY_DATA,
  COCONUT_DATA,
  RICE_BLAST,
  BROWN_PLANTHOPPER,
  FERTILIZER_PRODUCTS,
  PESTICIDE_PRODUCTS,
  KERALA_AGRICULTURAL_CALENDAR
};
