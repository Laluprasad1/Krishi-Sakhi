// Kerala Agricultural Pesticide Whitelist - Based on CIB&RC approved products for Kerala
// Following safety blueprint requirements: exact products, PHI, PPE, active ingredients

export interface PesticideProduct {
  tradeName: string;
  activeIngredient: string;
  concentration: string;
  targetPests: string[];
  targetCrops: string[];
  dosage: string;
  applicationMethod: string;
  ppeRequired: string[];
  preHarvestInterval: string; // PHI in days
  reentryInterval: string; // REI in hours
  price: string;
  manufacturer: string;
  cibrcRegistration: string;
  restrictions: string[];
}

export const APPROVED_PESTICIDES: Record<string, PesticideProduct> = {
  // FUNGICIDES - For Rice Blast, Sheath Blight
  'nativo': {
    tradeName: 'Nativo',
    activeIngredient: 'Tebuconazole 50% + Trifloxystrobin 25% WG',
    concentration: '75% WG',
    targetPests: ['Rice Blast', 'Sheath Blight', 'Brown Spot'],
    targetCrops: ['Paddy', 'Rice'],
    dosage: '0.4g/L or 150-200g/ha',
    applicationMethod: 'Foliar spray using knapsack sprayer',
    ppeRequired: ['Face mask', 'Gloves', 'Long-sleeved shirt', 'Eye protection'],
    preHarvestInterval: '37 days',
    reentryInterval: '12 hours',
    price: '₹2,800-3,200/250g',
    manufacturer: 'Bayer CropScience',
    cibrcRegistration: 'CIB-351',
    restrictions: ['Do not spray during flowering', 'Avoid windy conditions']
  },

  'tricyclazole': {
    tradeName: 'Tricyclazole 75% WP',
    activeIngredient: 'Tricyclazole',
    concentration: '75% WP',
    targetPests: ['Rice Blast', 'Neck Blast'],
    targetCrops: ['Paddy', 'Rice'],
    dosage: '0.6g/L or 300g/ha',
    applicationMethod: 'Foliar spray, 2-3 applications at 10-day intervals',
    ppeRequired: ['Respirator mask', 'Rubber gloves', 'Protective clothing'],
    preHarvestInterval: '30 days',
    reentryInterval: '24 hours',
    price: '₹180-220/100g',
    manufacturer: 'Multiple (Generic)',
    cibrcRegistration: 'CIB-78',
    restrictions: ['Maximum 3 applications per season', 'Do not mix with alkaline products']
  },

  'bavistin': {
    tradeName: 'Bavistin',
    activeIngredient: 'Carbendazim',
    concentration: '50% WP',
    targetPests: ['Sheath Blight', 'False Smut', 'Grain Discoloration'],
    targetCrops: ['Paddy', 'Rice', 'Coconut'],
    dosage: '1g/L or 500g/ha',
    applicationMethod: 'Foliar spray or soil drench',
    ppeRequired: ['Face mask', 'Gloves', 'Protective clothing'],
    preHarvestInterval: '21 days',
    reentryInterval: '12 hours',
    price: '₹180-220/100g',
    manufacturer: 'BASF India',
    cibrcRegistration: 'CIB-42',
    restrictions: ['Suspected carcinogen - use with extreme caution', 'Maximum 2 applications per season']
  },

  // INSECTICIDES - For Brown Planthopper, Stem Borer
  'confidor': {
    tradeName: 'Confidor',
    activeIngredient: 'Imidacloprid',
    concentration: '17.8% SL',
    targetPests: ['Brown Planthopper', 'White-backed Planthopper', 'Green Leafhopper'],
    targetCrops: ['Paddy', 'Rice'],
    dosage: '0.3ml/L or 125ml/ha',
    applicationMethod: 'Foliar spray or soil application',
    ppeRequired: ['Respirator mask', 'Chemical-resistant gloves', 'Long-sleeved shirt'],
    preHarvestInterval: '21 days',
    reentryInterval: '12 hours',
    price: '₹450-500/100ml',
    manufacturer: 'Bayer CropScience',
    cibrcRegistration: 'CIB-189',
    restrictions: ['Bee toxic - avoid spraying during flowering', 'Do not exceed 2 applications per season']
  },

  'actara': {
    tradeName: 'Actara',
    activeIngredient: 'Thiamethoxam',
    concentration: '25% WG',
    targetPests: ['Brown Planthopper', 'Stem Borer', 'Leaf Folder'],
    targetCrops: ['Paddy', 'Rice'],
    dosage: '0.3g/L or 100g/ha',
    applicationMethod: 'Foliar spray using high-volume sprayer',
    ppeRequired: ['Face shield', 'Nitrile gloves', 'Protective suit'],
    preHarvestInterval: '21 days',
    reentryInterval: '12 hours',
    price: '₹180-220/100g',
    manufacturer: 'Syngenta India',
    cibrcRegistration: 'CIB-278',
    restrictions: ['Highly toxic to bees', 'Apply only during evening hours']
  },

  'marshal': {
    tradeName: 'Marshal',
    activeIngredient: 'Carbosulfan',
    concentration: '25% EC',
    targetPests: ['Rhinoceros Beetle', 'Red Palm Weevil', 'Stem Borer'],
    targetCrops: ['Coconut', 'Paddy'],
    dosage: '2ml/L or 1L/ha',
    applicationMethod: 'Soil drench or crown application for coconut',
    ppeRequired: ['Full face respirator', 'Chemical-resistant gloves', 'Tyvek suit'],
    preHarvestInterval: '30 days',
    reentryInterval: '48 hours',
    price: '₹250-300/250ml',
    manufacturer: 'FMC India',
    cibrcRegistration: 'CIB-145',
    restrictions: ['Highly toxic - professional application recommended', 'Do not apply during windy conditions']
  },

  // BIO-PESTICIDES & ORGANIC OPTIONS
  'neem_oil': {
    tradeName: 'Neem Oil',
    activeIngredient: 'Azadirachtin',
    concentration: '1500-3000 ppm',
    targetPests: ['Aphids', 'Whiteflies', 'Thrips', 'Minor pests'],
    targetCrops: ['All crops'],
    dosage: '5ml/L or 3-5L/ha',
    applicationMethod: 'Foliar spray with surfactant',
    ppeRequired: ['Basic gloves', 'Face mask'],
    preHarvestInterval: '0 days (organic)',
    reentryInterval: '4 hours',
    price: '₹80-120/100ml',
    manufacturer: 'Various (Organic certified)',
    cibrcRegistration: 'Organic - No registration required',
    restrictions: ['Apply during cooler hours', 'May require multiple applications']
  },

  'copper_oxychloride': {
    tradeName: 'Blitox-50',
    activeIngredient: 'Copper Oxychloride',
    concentration: '50% WP',
    targetPests: ['Bacterial Blight', 'Bacterial Leaf Streak', 'Downy Mildew'],
    targetCrops: ['Paddy', 'Vegetables', 'Coconut'],
    dosage: '2g/L or 1.25kg/ha',
    applicationMethod: 'Foliar spray - thorough coverage required',
    ppeRequired: ['Dust mask', 'Gloves', 'Eye protection'],
    preHarvestInterval: '1 day',
    reentryInterval: '4 hours',
    price: '₹85-100/250g',
    manufacturer: 'Tata Rallis',
    cibrcRegistration: 'CIB-23',
    restrictions: ['Phytotoxic at high concentrations', 'Do not mix with alkaline fungicides']
  }
};

export const FERTILIZER_WHITELIST = {
  'urea': {
    name: 'IFFCO Urea',
    nutrient: '46% N',
    price: '₹266.5/45kg',
    application: 'Split application recommended',
    crops: ['All crops'],
    timing: 'Basal + Top dressing'
  },
  'factamfos': {
    name: 'Factamfos',
    nutrient: '20% N + 20% P2O5',
    price: '₹1,800/50kg',
    application: 'Basal application during land preparation',
    crops: ['Paddy', 'Coconut', 'Vegetables'],
    timing: 'Before transplanting/planting'
  },
  'mop': {
    name: 'Muriate of Potash (MOP)',
    nutrient: '60% K2O',
    price: '₹3,200/50kg',
    application: 'Split into 2-3 applications',
    crops: ['All crops'],
    timing: 'Flowering and fruit development stages'
  }
};

// Safety validation function
export function validatePesticideRecommendation(
  pesticide: string, 
  crop: string, 
  targetPest: string
): { isValid: boolean; warnings: string[]; requirements: string[] } {
  const product = APPROVED_PESTICIDES[pesticide.toLowerCase()];
  
  if (!product) {
    return {
      isValid: false,
      warnings: ['Product not in approved whitelist'],
      requirements: ['Use only CIB&RC registered products']
    };
  }

  const warnings: string[] = [];
  const requirements: string[] = [];

  // Check crop compatibility
  if (!product.targetCrops.some(c => c.toLowerCase().includes(crop.toLowerCase()))) {
    warnings.push(`Not specifically registered for ${crop}`);
  }

  // Check target pest
  if (!product.targetPests.some(p => p.toLowerCase().includes(targetPest.toLowerCase()))) {
    warnings.push(`May not be effective against ${targetPest}`);
  }

  // Add mandatory requirements
  requirements.push(`PPE Required: ${product.ppeRequired.join(', ')}`);
  requirements.push(`Pre-harvest Interval: ${product.preHarvestInterval}`);
  requirements.push(`Re-entry Interval: ${product.reentryInterval}`);
  
  if (product.restrictions.length > 0) {
    requirements.push(`Restrictions: ${product.restrictions.join('; ')}`);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    requirements
  };
}

export function getPesticideByTarget(crop: string, pest: string): PesticideProduct[] {
  return Object.values(APPROVED_PESTICIDES).filter(product => 
    product.targetCrops.some(c => c.toLowerCase().includes(crop.toLowerCase())) &&
    product.targetPests.some(p => p.toLowerCase().includes(pest.toLowerCase()))
  );
}
