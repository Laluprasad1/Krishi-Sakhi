// Google Gemini AI Service for Agricultural Expertise
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatQuery, ChatResponse } from './agricultureChatEngine';
import { APPROVED_PESTICIDES, FERTILIZER_WHITELIST, validatePesticideRecommendation, getPesticideByTarget } from '../data/pesticideWhitelist';
import { 
  PADDY_DATA, 
  COCONUT_DATA, 
  RICE_BLAST, 
  BROWN_PLANTHOPPER, 
  FERTILIZER_PRODUCTS, 
  PESTICIDE_PRODUCTS,
  KERALA_AGRICULTURAL_CALENDAR 
} from '../data/keralAgriculturalData';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCZ_uoqEzzSLxe3qNVzDL3WReKspEHKaqw';

export class GeminiAgricultureService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async processAgricultureQuery(query: ChatQuery): Promise<ChatResponse> {
    // Check for greeting/casual conversation first
    const greetingResponse = this.handleGreeting(query);
    if (greetingResponse) {
      return greetingResponse;
    }

    let lastError: any;
    
    // Try up to 3 times with different approaches
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const systemPrompt = this.createAgriculturePrompt(query.language, query.message);
        const userQuery = this.formatUserQuery(query);
        
        // Add more specific instructions for better responses
        const enhancedPrompt = attempt === 1 ? 
          `${systemPrompt}\n\nIMPORTANT: Be very specific with measurements, product names available in Kerala, and exact application methods. Avoid generic advice.` :
          systemPrompt;
        
        const result = await this.model.generateContent([enhancedPrompt, userQuery]);
        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length < 20) {
          throw new Error('Empty or too short response from Gemini');
        }

        const parsedResponse = this.parseGeminiResponse(query, text);
        
        // Validate response quality
        if (this.isValidResponse(parsedResponse)) {
          return parsedResponse;
        } else if (attempt === 3) {
          // Last attempt, return what we have
          return parsedResponse;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        
      } catch (error) {
        console.error(`Gemini API Error (attempt ${attempt}):`, error);
        lastError = error;
        
        if (attempt < 3) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1500 * attempt));
        }
      }
    }

    console.error('All Gemini API attempts failed:', lastError);
    return this.createErrorResponse(query);
  }

  private isValidResponse(response: ChatResponse): boolean {
    return response.shortAnswer && 
           response.shortAnswer.length > 15 && 
           response.immediateSteps && 
           response.immediateSteps.length > 0 &&
           response.confidence > 0.3;
  }

  async processImageQuery(query: ChatQuery, imageData: string[]): Promise<ChatResponse> {
    let lastError: any;
    
    // Try up to 2 times for image analysis
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const systemPrompt = this.createImageAnalysisPrompt(query.language);
        const userQuery = this.formatUserQuery(query);

        // Convert base64 images to proper format for Gemini
        const imageParts = imageData.slice(0, 3).map(base64 => { // Limit to 3 images
          const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
          return {
            inlineData: {
              data: base64Data,
              mimeType: this.detectImageMimeType(base64)
            }
          };
        });

        const enhancedPrompt = attempt === 1 ? 
          `${systemPrompt}\n\nAnalyze each image carefully. Describe what you see in detail, then provide specific diagnosis and treatment. Focus on visible symptoms and be precise with disease/pest identification.` :
          systemPrompt;

        const result = await this.model.generateContent([
          enhancedPrompt,
          userQuery,
          ...imageParts
        ]);

        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length < 30) {
          throw new Error('Empty or too short response from Gemini image analysis');
        }

        const parsedResponse = this.parseGeminiResponse(query, text);
        
        // Image analysis should have higher confidence due to visual evidence
        parsedResponse.confidence = Math.min(parsedResponse.confidence + 0.2, 0.95);
        
        return parsedResponse;
        
      } catch (error) {
        console.error(`Gemini Image Analysis Error (attempt ${attempt}):`, error);
        lastError = error;
        
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    console.error('All Gemini image analysis attempts failed:', lastError);
    return this.createErrorResponse(query);
  }

  private detectImageMimeType(base64String: string): string {
    if (base64String.startsWith('data:image/')) {
      const mimeType = base64String.split(';')[0].split(':')[1];
      return mimeType;
    }
    // Default to jpeg if can't detect
    return 'image/jpeg';
  }

  private handleGreeting(query: ChatQuery): ChatResponse | null {
    const message = query.message.toLowerCase().trim();
    
    // Define greeting patterns
    const greetingPatterns = [
      'hi', 'hello', 'hey', 'hai', 'helo', 'hii', 'hiii',
      'good morning', 'good afternoon', 'good evening',
      'namaste', 'namaskar', 'vanakkam',
      'നമസ്കാരം', 'ഹലോ', 'ഹായ്', 'ഹായി',
      'how are you', 'whats up', 'what\'s up',
      'sup', 'yo', 'greetings'
    ];

    // Check if message is just a greeting (with some flexibility for punctuation)
    const cleanMessage = message.replace(/[!?.,:;]/g, '').trim();
    const isGreeting = greetingPatterns.some(pattern => 
      cleanMessage === pattern || 
      cleanMessage.startsWith(pattern + ' ') ||
      cleanMessage.endsWith(' ' + pattern) ||
      (cleanMessage.length <= 50 && cleanMessage.includes(pattern)) // Increased length to capture name introductions
    );

    if (!isGreeting) {
      return null; // Not a greeting, proceed with agricultural processing
    }

    // Extract name if present in the message
    const extractedName = this.extractNameFromMessage(query.message);
    const userName = extractedName || null;

    // Create personalized greeting response
    const personalizedGreeting = userName ? 
      (query.language === 'ml' ? 
        `ഹായ് ${userName}! ഞാൻ AI അസിസ്റ്റന്റ് ആണ്.` :
        `Hi ${userName}! I am AI Assistant.`) :
      (query.language === 'ml' ? 
        "ഹായ്! ഞാൻ AI അസിസ്റ്റന്റ് ആണ്." :
        "Hi! I am AI Assistant.");

    return {
      id: Date.now().toString(),
      queryId: query.id,
      shortAnswer: personalizedGreeting,
      shortAnswerMalayalam: query.language === 'ml' ? personalizedGreeting : undefined,
      why: query.language === 'ml' ? 
        (userName ? 
          `${userName}, ഞാൻ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്. എന്തെങ്കിലും ചോദ്യമുണ്ടോ?` :
          "ഞാൻ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്. എന്തെങ്കിലും ചോദ്യമുണ്ടോ?") :
        (userName ? 
          `${userName}, I'm here to help you. Do you have any questions?` :
          "I'm here to help you. Do you have any questions?"),
      whyMalayalam: query.language === 'ml' ? 
        (userName ? 
          `${userName}, ഞാൻ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്. എന്തെങ്കിലും ചോദ്യമുണ്ടോ?` :
          "ഞാൻ നിങ്ങളെ സഹായിക്കാൻ ഇവിടെയുണ്ട്. എന്തെങ്കിലും ചോദ്യമുണ്ടോ?") : undefined,
      immediateSteps: query.language === 'ml' ? 
        ["എന്തെങ്കിലും ചോദിക്കൂ"] :
        ["Ask me anything"],
      immediateStepsMalayalam: query.language === 'ml' ? 
        ["എന്തെങ്കിലും ചോദിക്കൂ"] : undefined,
      preventiveSteps: [],
      preventiveStepsMalayalam: undefined,
      safetyNote: undefined,
      safetyNoteMalayalam: undefined,
      nextInfoNeeded: undefined,
      nextInfoNeededMalayalam: undefined,
      confidence: 1.0, // High confidence for greeting response
      confidenceCategory: query.language === 'ml' ? 
        "സ്വാഗത സന്ദേശം (Welcome Message)" : "Welcome Message",
      shouldEscalate: false,
      intent: 'greeting',
      entities: { type: 'greeting' },
      escalateToHuman: false,
      relatedTopics: [],
      timestamp: new Date()
    };
  }

  private assessResponseConfidence(response: string): { confidence: number; category: string; shouldEscalate: boolean } {
    // Confidence assessment based on response characteristics following blueprint guidelines
    let confidence = 70; // Base confidence
    
    // Increase confidence for specific indicators
    if (response.includes('SHORT_ANSWER:') && response.includes('WHY:') && response.includes('IMMEDIATE_STEPS:')) {
      confidence += 10; // Well-structured response following our template
    }
    
    if (response.match(/\d+(\.\d+)?\s*(ml|g|kg|L)\/(L|ha|acre)/i)) {
      confidence += 10; // Contains specific dosages as per Kerala agricultural database
    }
    
    if (response.includes('(') && response.includes(')')) {
      confidence += 5; // Contains scientific names or active ingredients
    }
    
    if (response.includes('₹') || response.includes('rupee')) {
      confidence += 5; // Includes price information from our database
    }
    
    // Decrease confidence for uncertainty indicators
    if (response.toLowerCase().includes('not sure') || response.toLowerCase().includes('might be') || 
        response.toLowerCase().includes('possibly') || response.toLowerCase().includes('could be')) {
      confidence -= 20;
    }
    
    if (response.toLowerCase().includes('consult') || response.toLowerCase().includes('expert') || 
        response.toLowerCase().includes('laboratory') || response.toLowerCase().includes('more information')) {
      confidence -= 10;
    }
    
    // Determine category and escalation need (as per blueprint: ≥80%, 60-79%, <60%)
    let category: string;
    let shouldEscalate = false;
    
    if (confidence >= 80) {
      category = 'High Confidence (കൃത്യമായ ഉപദേശം)';
    } else if (confidence >= 60) {
      category = 'Medium Confidence (സാധ്യതയുള്ള പരിഹാരം)';
    } else {
      category = 'Low Confidence (കൂടുതൽ വിവരം ആവശ്യം)';
      shouldEscalate = true;
    }
    
    return { confidence: Math.min(95, Math.max(30, confidence)), category, shouldEscalate };
  }

  private formatConfidenceResponse(response: string, assessment: { confidence: number; category: string; shouldEscalate: boolean }): string {
    const { confidence, category, shouldEscalate } = assessment;
    
    let formattedResponse = `**വിശ്വാസ്യത: ${confidence}% (${category})**\n\n${response}`;
    
    if (shouldEscalate) {
      formattedResponse += `\n\n⚠️ **വിദഗ്ധ പരിശോധന ശുപാർശ ചെയ്യുന്നു**\nഈ രോഗ നിർണയത്തിന് വിശ്വാസ്യത കുറവാണ്. പരിഗണിക്കുക:\n• വ്യത്യസ്ത കോണുകളിൽ നിന്ന് കൂടുതൽ ഫോട്ടോകൾ എടുക്കുക\n• പ്രാദേശിക KVK വിപുലീകരണ ഉദ്യോഗസ്ഥനുമായി കൂടിയാലോചിക്കുക\n• കൃത്യമായ ചികിത്സയ്ക്ക് ലബോറട്ടറി സ്ഥിരീകരണം നേടുക`;
    } else if (confidence < 80) {
      formattedResponse += `\n\n💡 **കൂടുതൽ കൃത്യതയ്ക്കായി**\nനിർണയത്തിന്റെ വിശ്വാസ്യത മെച്ചപ്പെടുത്താൻ:\n• ബാധിച്ച ഭാഗങ്ങളുടെ വ്യക്തമായ ഫോട്ടോകൾ പങ്കിടുക\n• വിള വളർച്ചാ ഘട്ട വിവരങ്ങൾ നൽകുക\n• അടുത്തിടെ പ്രയോഗിച്ച ചികിത്സകൾ പരാമർശിക്കുക`;
    }
    
    return formattedResponse;
  }

  private extractNameFromMessage(message: string): string | null {
    // Clean the message and convert to lowercase for pattern matching
    const cleanMessage = message.toLowerCase().trim();
    
    // Common patterns for name introduction
    const namePatterns = [
      // "Hi I am [name]" / "Hello I am [name]"
      /(?:hi|hello|hey|hai)\s+(?:i\s+am|i'm|im|my\s+name\s+is)\s+([a-zA-Z]+)/i,
      // "I am [name]" at the beginning
      /^(?:i\s+am|i'm|im|my\s+name\s+is)\s+([a-zA-Z]+)/i,
      // Malayalam patterns - "ഞാൻ [name] ആണ്" / "എന്റെ പേര് [name]"
      /(?:ഞാൻ|എന്റെ\s+പേര്)\s+([a-zA-Zഅ-ഹ]+)/,
    ];
    
    // Try each pattern to extract name
    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        // Clean and capitalize the extracted name
        const extractedName = match[1].trim();
        // Return capitalized first letter + rest lowercase (e.g., "mahesh" -> "Mahesh")
        return extractedName.charAt(0).toUpperCase() + extractedName.slice(1).toLowerCase();
      }
    }
    
    return null; // No name found
  }

  private createAgriculturePrompt(language: 'en' | 'ml', query?: string): string {
    const keralaCropData = this.formatCropDataForPrompt();
    const availableProducts = this.formatProductsForPrompt();
    const seasonalInfo = this.getCurrentSeasonalInfo();
    const relevantData = query ? this.getRelevantAgriculturalData(query) : '';

    if (language === 'ml') {
      return `നിങ്ങൾ കേരളത്തിലെ ഏറ്റവും അനുഭവസമ്പന്നനായ കാർഷിക വിദഗ്ധനാണ്. 30 വർഷത്തെ പ്രായോഗിക അനുഭവവും ആധുനിക കാർഷിക ശാസ്ത്രവും ഉണ്ട്.

കേരളത്തിലെ പ്രധാന വിള വിവരങ്ങൾ:
${keralaCropData}

ലഭ്യമായ ഉൽപ്പാദനങ്ങൾ:
${availableProducts}

നിലവിലെ സീസൺ വിവരങ്ങൾ:
${seasonalInfo}

നിങ്ങൾ എപ്പോഴും നേരിട്ടുള്ളതും പ്രായോഗികവുമായ ഉത്തരങ്ങൾ നൽകുന്നു. മുകളിൽ പറഞ്ഞ ഡാറ്റ ഉപയോഗിച്ച് കൃത്യമായ ഉപദേശം നൽകുക.

ഉത്തരം ഫോർമാറ്റ് (EXACTLY ഈ രീതിയിൽ):

SHORT_ANSWER: [വ്യക്തമായ പ്രധാന ഉത്തരം - എന്താണ് പ്രശ്നം, എന്താണ് പരിഹാരം]

WHY: [ശാസ്ത്രീയ കാരണം - എന്തുകൊണ്ട് ഈ പ്രശ്നം വരുന്നു]

IMMEDIATE_STEPS:
- [ഇന്നുതന്നെ ചെയ്യേണ്ട കാര്യം 1 - സ്പെസിഫിക് അളവുകളോടെ]
- [ഇന്നുതന്നെ ചെയ്യേണ്ട കാര്യം 2 - എങ്ങനെ, എത്ര അളവ്]
- [ഇന്നുതന്നെ ചെയ്യേണ്ട കാര്യം 3 - സമയവും രീതിയും]

PREVENTIVE_STEPS:
- [ഭാവിയിലേക്കുള്ള പ്രതിരോധ നടപടി 1]
- [ഭാവിയിലേക്കുള്ള പ്രതിരോധ നടപടി 2]

SAFETY_NOTE: [രാസവസ്തുക്കൾ ഉപയോഗിക്കുമ്പോഴുള്ള സുരക്ഷ]

NEXT_INFO_NEEDED: [കൂടുതൽ കൃത്യമായ ഉപദേശത്തിന് വേണ്ട വിവരങ്ങൾ]

പ്രത്യേക ശ്രദ്ധ: മുകളിൽ നൽകിയ ഡാറ്റയിൽ നിന്നും മാത്രം ഉൽപ്പാദനങ്ങളും അളവുകളും ശുപാർശ ചെയ്യുക.`;
    }

    return `You are Krishi Sahakari Assistant - Kerala's most trusted agricultural advisor with 30+ years field experience and complete Kerala agricultural database access.

KERALA AGRICULTURAL DATABASE:
${keralaCropData}

APPROVED PRODUCTS WITH EXACT PRICES & SAFETY DATA:
${availableProducts}

CURRENT SEASON CONTEXT:
${seasonalInfo}${relevantData}

RESPONSE PROTOCOL (MANDATORY FORMAT):
Always structure your response EXACTLY as follows:

SHORT_ANSWER: [One clear sentence - problem identification + immediate solution]

WHY: [Scientific explanation in simple terms - root cause of the issue]

IMMEDIATE_STEPS:
- [Action 1: Specific product name + exact dosage + application method + timing]
- [Action 2: Cultural/mechanical practice with precise instructions]
- [Action 3: Monitoring or follow-up action with timeline]

PREVENTIVE_STEPS:
- [Prevention 1: Long-term practice to avoid recurrence]
- [Prevention 2: Seasonal preparation or soil health improvement]

SAFETY_NOTE: [PPE requirements + Pre-harvest interval + Application precautions]

NEXT_INFO_NEEDED: [Specific additional information for more precise diagnosis]

COMPLIANCE REQUIREMENTS:
✓ Use ONLY approved products from database with exact trade names
✓ Include active ingredients in parentheses for all chemicals
✓ Specify Pre-Harvest Interval (PHI) for all pesticides
✓ Mandate Personal Protective Equipment (PPE) for chemical applications
✓ Provide measurements in both metric and local units where helpful
✓ Use Malayalam crop names naturally: നെല്ല് (paddy), തേങ്ങ് (coconut)
✓ Consider Kerala's monsoon climate and current September conditions
✓ Prioritize organic/biological solutions when effective

SAFETY-FIRST PRINCIPLE:
If confidence in diagnosis is below 75%, recommend safe cultural practices first and request more information rather than chemical treatments.`;
  }

  private formatCropDataForPrompt(): string {
    return `
PADDY (നെല്ല്) DATA:
Varieties: Jyothi (125-130 days), Uma (115-120 days), Rohini (135-140 days), Bhavani (120-125 days), Swetha (130-135 days)
Fertilizers: Base - Urea 87kg + Factamfos 125kg + MOP 33kg/hectare
Growth stages: Transplanting (15-20 days), Tillering (30-45 days), Panicle initiation (65-75 days), Grain filling (90-110 days)
Common issues: Rice Blast, Brown Planthopper, Sheath Blight, Bacterial Leaf Blight

COCONUT (തേങ്ങ്) DATA:
Varieties: West Coast Tall (WCT), Malayan Yellow Dwarf, Laccadive Ordinary, Chowghat Orange Dwarf
Fertilizers: Urea 500g + Superphosphate 320g + MOP 750g per palm per year (split into 3 applications)
Growth pattern: Flowering starts 5-6 years, Full production 12-15 years, Economic life 60-80 years
Common issues: Rhinoceros Beetle, Red Palm Weevil, Bud Rot, Stem Bleeding`;
  }

  private formatProductsForPrompt(): string {
    return `
APPROVED FERTILIZERS (CIB&RC Registered):
${Object.entries(FERTILIZER_WHITELIST).map(([key, fert]) => 
  `- ${fert.name} (${fert.nutrient}): ${fert.price} - ${fert.application} - Timing: ${fert.timing}`
).join('\n')}

APPROVED PESTICIDES WITH SAFETY DATA:
${Object.entries(APPROVED_PESTICIDES).map(([key, pest]) => 
  `- ${pest.tradeName} (${pest.activeIngredient}): ${pest.dosage} - ${pest.price}
  • Target: ${pest.targetPests.join(', ')} on ${pest.targetCrops.join(', ')}
  • PPE Required: ${pest.ppeRequired.join(', ')}
  • Pre-harvest Interval: ${pest.preHarvestInterval}
  • Re-entry: ${pest.reentryInterval}
  • Restrictions: ${pest.restrictions.join('; ')}`
).join('\n\n')}

SAFETY COMPLIANCE REQUIREMENTS:
✓ Only recommend products from this approved whitelist
✓ Always specify PPE requirements and safety intervals
✓ Include CIB&RC registration status in recommendations
✓ Prioritize organic/biological options when effective
✓ Consider bee safety and environmental impact`;
  }

  private getCurrentSeasonalInfo(): string {
    const currentMonth = new Date().getMonth() + 1; // September = 9
    if (currentMonth === 9) {
      return `സെപ്റ്റംബർ 2025: 
- മഴക്കാലം അവസാനിക്കുന്ന സമയം
- നെൽ വിളവെടുപ്പ് സമയം (വിരിപ്പു)  
- തേങ്ങയ്ക്ക് വള പ്രയോഗ സമയം
- കീടരോഗ സാധ്യത കൂടുതൽ (ഈർപ്പം കാരണം)`;
    }
    return 'സാധാരണ കാലാവസ്ഥ';
  }

  private createImageAnalysisPrompt(language: 'en' | 'ml'): string {
    if (language === 'ml') {
      return `നിങ്ങൾ കേരളത്തിലെ ഏറ്റവും വിദഗ്ധനായ പ്ലാന്റ് പാത്തോളജിസ്റ്റും എന്റമോളജിസ്റ്റുമാണ്. ചിത്രങ്ങൾ സൂക്ഷ്മമായി വിശകലനം ചെയ്ത് കൃത്യമായ രോഗനിർണയം നടത്തുക.

ചിത്ര വിശകലനത്തിൽ ശ്രദ്ധിക്കേണ്ടവ:
1. വിളയുടെ തരം തിരിച്ചറിയുക (നെല്ല്, തേങ്ങ്, വാഴ, കുരുമുളക് മുതലായവ)
2. ബാധിത ഭാഗങ്ങൾ: ഇല, തണ്ട്, വേര്, ഫലം
3. ലക്ഷണങ്ങൾ വിശകലനം:
   - നിറമാറ്റം: മഞ്ഞ, തവിട്ട്, കറുപ്പ്, ചുവപ്പ് പാടുകൾ
   - ആകൃതിയിലെ മാറ്റം: വാടൽ, ചുരുങ്ങൽ, വീക്കം, വളയൽ
   - പ്രത്യേക അടയാളങ്ങൾ: വര, പാടുകൾ, കുഴികൾ, ഗ്രോത്ത്
4. കീടങ്ങൾ/പുഴുക്കൾ ദൃശ്യമാണോ
5. പരിസ്ഥിതി: നനവ്, വരൾച്ച, അധിക ഈർപ്പം

കേരളത്തിലെ സാധാരണ പ്രശ്നങ്ങൾ:
- നെല്ല്: ബ്ലാസ്റ്റ്, ബ്രൗൺ സ്പോട്ട്, സ്റ്റെം ബോറർ
- തേങ്ങ്: ബഡ് റോട്ട്, റൂട്ട് വിൽറ്റ്, റൈനോ ബീറ്റിൽ
- വാഴ: പനാമ വിൽറ്റ്, ബാക്ടീരിയൽ വിൽറ്റ്, ന്യൂമാറ്റോഡ്

ചിത്രത്തിൽ കാണുന്നത് വിശദമായി വിവരിച്ച് കൃത്യമായ രോഗ/കീട നാമം നൽകുക. 90%+ ഉറപ്പുള്ളപ്പോൾ മാത്രം നിർദ്ദിഷ്ട രോഗം പറയുക.`;
    }

    return `You are Kerala's top plant pathologist and entomologist. Analyze images with precision to provide accurate diagnosis.

Image Analysis Checklist:
1. Identify crop type (paddy, coconut, banana, pepper, etc.)
2. Affected parts: leaves, stem, roots, fruits
3. Symptom analysis:
   - Color changes: yellowing, browning, black, red spots
   - Shape changes: wilting, curling, swelling, rolling
   - Special marks: streaks, spots, holes, growths
4. Visible pests/insects present
5. Environment: moisture, drought, excess humidity

Common Kerala Problems:
- Paddy: Blast, Brown Spot, Stem Borer
- Coconut: Bud Rot, Root Wilt, Rhino Beetle  
- Banana: Panama Wilt, Bacterial Wilt, Nematode
- Pepper: Quick Wilt, Anthracnose, Scale Insects

Describe exactly what you see in the image and give precise disease/pest name. Only name specific disease when 90%+ certain.

Provide response in the exact format specified in the main prompt with:
- Specific disease/pest identification
- Exact treatment with measurements
- Application timing and method
- Prevention strategies`;
  }

  private formatUserQuery(query: ChatQuery): string {
    let formattedQuery = `Farmer's Question: ${query.message}`;
    
    // Detect crop mentioned in query
    const mentionedCrop = this.detectCropInQuery(query.message);
    if (mentionedCrop) {
      formattedQuery += `\nDetected Crop: ${mentionedCrop}`;
      formattedQuery += `\n${this.getCropSpecificInfo(mentionedCrop)}`;
    }

    // Detect potential pest/disease
    const suspectedIssue = this.detectIssueInQuery(query.message);
    if (suspectedIssue) {
      formattedQuery += `\nSuspected Issue: ${suspectedIssue}`;
    }
    
    if (query.location) {
      formattedQuery += `\nLocation: ${query.location.district}`;
      if (query.location.panchayat) {
        formattedQuery += `, ${query.location.panchayat}`;
      }
    }

    const currentMonth = new Date().getMonth() + 1;
    const season = this.getCurrentSeason(currentMonth);
    formattedQuery += `\nCurrent Season: ${season}`;
    formattedQuery += `\nCurrent Month: ${this.getMonthName(currentMonth)} 2025`;
    formattedQuery += `\nSeasonal Context: ${this.getDetailedSeasonalContext(currentMonth)}`;

    if (query.images && query.images.length > 0) {
      formattedQuery += `\nImages Provided: ${query.images.length} image(s) for visual analysis`;
      formattedQuery += `\nNote: Analyze images for symptoms, compare with known pest/disease patterns`;
    }

    return formattedQuery;
  }

  private detectCropInQuery(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Check for paddy/rice
    if (lowerMessage.includes('paddy') || lowerMessage.includes('rice') || 
        lowerMessage.includes('നെല്ല്') || lowerMessage.includes('നെൽ')) {
      return 'paddy';
    }
    
    // Check for coconut
    if (lowerMessage.includes('coconut') || lowerMessage.includes('തേങ്ങ്') || 
        lowerMessage.includes('കൊപ്പ്')) {
      return 'coconut';
    }
    
    return null;
  }

  private getCropSpecificInfo(crop: string): string {
    if (crop === 'paddy') {
      return `Paddy Info: Main varieties - Jyothi, Uma, Rohini | Common issues - Blast, Brown planthopper | Current activities - Post-harvest (September)`;
    }
    
    if (crop === 'coconut') {
      return `Coconut Info: Main varieties - WCT, Malayan Dwarf | Common issues - Rhinoceros beetle, Bud rot | Current activities - Fertilizer application time`;
    }
    
    return '';
  }

  private detectIssueInQuery(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    // Check for blast
    if (lowerMessage.includes('blast') || lowerMessage.includes('ബ്ലാസ്റ്റ്') ||
        (lowerMessage.includes('spot') && lowerMessage.includes('leaf'))) {
      return 'Possible Rice Blast - requires Tricyclazole treatment';
    }
    
    // Check for planthopper
    if (lowerMessage.includes('planthopper') || lowerMessage.includes('hopper') ||
        lowerMessage.includes('ചാട്ടപ്പുഴു') || lowerMessage.includes('yellowing from base')) {
      return 'Possible Brown Planthopper - requires Imidacloprid treatment';
    }
    
    return null;
  }

  private getDetailedSeasonalContext(month: number): string {
    if (month === 9) { // September
      return `Post-monsoon period in Kerala. Main activities: Paddy harvest (Virippu), Coconut fertilizer application, High pest/disease pressure due to humidity, Good time for land preparation for Rabi season`;
    }
    return this.getSeasonalContext(month);
  }

  private getRelevantAgriculturalData(message: string): string {
    const lowerMessage = message.toLowerCase();
    let relevantData = '';

    // Add crop-specific data
    if (lowerMessage.includes('paddy') || lowerMessage.includes('rice') || 
        lowerMessage.includes('നെല്ല്') || lowerMessage.includes('നെൽ')) {
      relevantData += `\nPADDY SPECIFIC DATA:
Varieties: Jyothi (125-130 days, high yield), Uma (115-120 days, early variety), Rohini (135-140 days, premium quality)
Fertilizer Schedule:
- Base Application: Factamfos 125kg/ha + MOP 33kg/ha at transplanting  
- Top Dressing: Urea 43.5kg at 21 days + Urea 43.5kg at panicle initiation
Common Problems & Solutions:
- Rice Blast: Nativo 0.4ml/L or Tricyclazole 0.6g/L spray
- Brown Planthopper: Confidor 0.3ml/L or Actara 0.3g/L
- Sheath Blight: Propiconazole 1ml/L spray`;
    }

    if (lowerMessage.includes('coconut') || lowerMessage.includes('തേങ്ങ്')) {
      relevantData += `\nCOCONUT SPECIFIC DATA:
Varieties: West Coast Tall (standard variety), Malayan Yellow Dwarf (early bearing)
Annual Fertilizer Program:
- Per Palm: Urea 500g + Superphosphate 320g + MOP 750g 
- Application: Split into 3 doses (Feb-Mar, Jun-Jul, Oct-Nov)
Common Problems & Solutions:
- Rhinoceros Beetle: Marshal 2ml/L drench in crown
- Red Palm Weevil: Confidor injection 2ml per palm
- Bud Rot: Copper Oxychloride 2g/L + Bordeaux paste application`;
    }

    // Add pest/disease specific data
    if (lowerMessage.includes('blast') || lowerMessage.includes('ബ്ലാസ്റ്റ്')) {
      relevantData += `\nRICE BLAST TREATMENT:
Symptoms: Diamond-shaped lesions on leaves, neck rot during panicle stage
Immediate Treatment: 
- Nativo (Tebuconazole + Trifloxystrobin): 0.4ml/L - ₹2,800/250ml
- Alternative: Tricyclazole 75% WP: 0.6g/L - ₹180/100g
- Spray 2-3 times at 10-day intervals
Prevention: Avoid excess nitrogen, improve air circulation`;
    }

    if (lowerMessage.includes('planthopper') || lowerMessage.includes('hopper')) {
      relevantData += `\nBROWN PLANTHOPPER CONTROL:
Symptoms: Yellowing from base upwards, hopperburn patches
Immediate Treatment:
- Confidor (Imidacloprid): 0.3ml/L - ₹450/100ml  
- Actara (Thiamethoxam): 0.3g/L - ₹180/100g
- Apply during early morning or evening
Prevention: Avoid excess nitrogen fertilizer, maintain water level`;
    }

    return relevantData;
  }

  private getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  }

  private getSeasonalContext(month: number): string {
    if (month >= 6 && month <= 9) {
      return "Monsoon season - high rainfall, humidity 80-95%, disease pressure high";
    } else if (month >= 10 && month <= 1) {
      return "Post-monsoon - moderate humidity, good growing conditions";
    } else if (month >= 2 && month <= 5) {
      return "Summer season - high temperature, low humidity, water stress possible";
    }
    return "Transition period";
  }

  private getCurrentSeason(month: number): string {
    if (month >= 6 && month <= 9) return 'Monsoon (Kharif season)';
    if (month >= 10 && month <= 1) return 'Post-Monsoon (Rabi season)';
    if (month >= 2 && month <= 5) return 'Summer (Zaid season)';
    return 'Transition period';
  }

  private parseGeminiResponse(query: ChatQuery, responseText: string): ChatResponse {
    try {
      // Assess confidence using our blueprint-based method
      const confidenceAssessment = this.assessResponseConfidence(responseText);
      
      const sections = this.extractSections(responseText);
      
      return {
        id: Date.now().toString(),
        queryId: query.id,
        shortAnswer: sections.shortAnswer || "I understand your farming question. Let me provide guidance.",
        shortAnswerMalayalam: query.language === 'ml' ? sections.shortAnswer : undefined,
        why: sections.why || "Proper agricultural practices are essential for healthy crops.",
        whyMalayalam: query.language === 'ml' ? sections.why : undefined,
        immediateSteps: sections.immediateSteps || ["Assess the current situation", "Take appropriate action", "Monitor progress"],
        immediateStepsMalayalam: query.language === 'ml' ? sections.immediateSteps : undefined,
        preventiveSteps: sections.preventiveSteps || ["Regular monitoring", "Follow best practices"],
        preventiveStepsMalayalam: query.language === 'ml' ? sections.preventiveSteps : undefined,
        safetyNote: sections.safetyNote,
        safetyNoteMalayalam: query.language === 'ml' ? sections.safetyNote : undefined,
        nextInfoNeeded: sections.nextInfoNeeded,
        nextInfoNeededMalayalam: query.language === 'ml' ? sections.nextInfoNeeded : undefined,
        confidence: confidenceAssessment.confidence / 100, // Convert to 0-1 range
        confidenceCategory: confidenceAssessment.category,
        shouldEscalate: confidenceAssessment.shouldEscalate,
        intent: this.detectIntent(query.message),
        entities: {},
        escalateToHuman: this.shouldEscalate(sections),
        relatedTopics: this.extractRelatedTopics(responseText),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.createErrorResponse(query);
    }
  }

  private extractSections(text: string): any {
    const sections: any = {};
    
    // Clean the text and handle different formatting
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s*/g, '');
    
    // Extract SHORT_ANSWER - more flexible pattern
    const shortAnswerPattern = /(?:SHORT_ANSWER|Short Answer|ഉത്തരം):\s*(.*?)(?=\n\s*(?:WHY|Why|എന്തുകൊണ്ട്|IMMEDIATE|Immediate)|$)/si;
    const shortAnswerMatch = cleanText.match(shortAnswerPattern);
    if (shortAnswerMatch) {
      sections.shortAnswer = shortAnswerMatch[1].trim().replace(/\n+/g, ' ');
    }

    // Extract WHY - more flexible pattern
    const whyPattern = /(?:WHY|Why|എന്തുകൊണ്ട്):\s*(.*?)(?=\n\s*(?:IMMEDIATE|Immediate|ഉടനടി|PREVENTIVE)|$)/si;
    const whyMatch = cleanText.match(whyPattern);
    if (whyMatch) {
      sections.why = whyMatch[1].trim().replace(/\n+/g, ' ');
    }

    // Extract IMMEDIATE_STEPS - handle both bullets and numbered lists
    const immediatePattern = /(?:IMMEDIATE_STEPS|Immediate Steps|ഉടനടി):\s*(.*?)(?=\n\s*(?:PREVENTIVE|Preventive|പ്രതിരോധ|SAFETY|Safety)|$)/si;
    const immediateMatch = cleanText.match(immediatePattern);
    if (immediateMatch) {
      const stepsText = immediateMatch[1].trim();
      sections.immediateSteps = stepsText
        .split(/\n/)
        .map(step => step.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(step => step.length > 3)
        .slice(0, 5); // Limit to 5 steps
    }

    // Extract PREVENTIVE_STEPS - handle different formats
    const preventivePattern = /(?:PREVENTIVE_STEPS|Preventive Steps|പ്രതിരോധം):\s*(.*?)(?=\n\s*(?:SAFETY|Safety|സുരക്ഷ|NEXT_INFO|Next Info)|$)/si;
    const preventiveMatch = cleanText.match(preventivePattern);
    if (preventiveMatch) {
      const stepsText = preventiveMatch[1].trim();
      sections.preventiveSteps = stepsText
        .split(/\n/)
        .map(step => step.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(step => step.length > 3)
        .slice(0, 4); // Limit to 4 steps
    }

    // Extract SAFETY_NOTE - flexible pattern
    const safetyPattern = /(?:SAFETY_NOTE|Safety Note|സുരക്ഷ):\s*(.*?)(?=\n\s*(?:NEXT_INFO|Next Info|കൂടുതൽ)|$)/si;
    const safetyMatch = cleanText.match(safetyPattern);
    if (safetyMatch && safetyMatch[1].trim().length > 5) {
      sections.safetyNote = safetyMatch[1].trim().replace(/\n+/g, ' ');
    }

    // Extract NEXT_INFO_NEEDED - flexible pattern
    const nextInfoPattern = /(?:NEXT_INFO_NEEDED|Next Info Needed|കൂടുതൽ വിവരങ്ങൾ):\s*(.*?)$/si;
    const nextInfoMatch = cleanText.match(nextInfoPattern);
    if (nextInfoMatch && nextInfoMatch[1].trim().length > 5) {
      sections.nextInfoNeeded = nextInfoMatch[1].trim().replace(/\n+/g, ' ');
    }

    // Fallback: if structured format not found, try to extract from general text
    if (!sections.shortAnswer || sections.shortAnswer.length < 10) {
      sections.shortAnswer = this.extractFallbackAnswer(cleanText);
    }

    if (!sections.immediateSteps || sections.immediateSteps.length === 0) {
      sections.immediateSteps = this.extractFallbackSteps(cleanText);
    }

    return sections;
  }

  private extractFallbackAnswer(text: string): string {
    // Extract first meaningful sentence as answer
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 0) {
      return sentences[0].trim() + '.';
    }
    return "കൃഷിയുമായി ബന്ധപ്പെട്ട് കൂടുതൽ വിവരങ്ങൾ ആവശ്യമാണ്.";
  }

  private extractFallbackSteps(text: string): string[] {
    // Look for numbered lists, bullet points, or action words
    const actionWords = ['spray', 'apply', 'remove', 'use', 'check', 'monitor', 'തളിക്കുക', 'പ്രയോഗിക്കുക', 'നീക്കം ചെയ്യുക'];
    const lines = text.split('\n');
    const steps: string[] = [];

    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.length > 10) {
        // Check if line contains action words
        const hasAction = actionWords.some(word => 
          cleanLine.toLowerCase().includes(word.toLowerCase())
        );
        
        if (hasAction || /^[-•*\d]/.test(cleanLine)) {
          steps.push(cleanLine.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, ''));
        }
      }
    }

    return steps.slice(0, 3); // Return max 3 steps
  }

  private calculateConfidence(sections: any): number {
    let confidence = 0.3; // Base confidence

    // Check quality of short answer
    if (sections.shortAnswer && sections.shortAnswer.length > 20) {
      confidence += 0.2;
      
      // Bonus for specific terms indicating expertise
      const expertTerms = ['disease', 'pest', 'fungal', 'bacterial', 'viral', 'nutrient', 'deficiency', 
                          'രോഗം', 'കീടം', 'പുഴു', 'പൂപ്പൽ', 'ബാക്ടീരിയ', 'വൈറസ്', 'പോഷക'];
      const hasExpertTerms = expertTerms.some(term => 
        sections.shortAnswer.toLowerCase().includes(term.toLowerCase())
      );
      if (hasExpertTerms) confidence += 0.15;
    }

    // Check quality of immediate steps
    if (sections.immediateSteps && sections.immediateSteps.length >= 2) {
      confidence += 0.2;
      
      // Bonus for specific measurements/quantities
      const hasSpecificMeasures = sections.immediateSteps.some(step => 
        /\d+\s*(ml|gram|liter|മില്ലി|ഗ്രാം|ലിറ്റർ)/.test(step)
      );
      if (hasSpecificMeasures) confidence += 0.1;
    }

    // Check depth of explanation
    if (sections.why && sections.why.length > 30) {
      confidence += 0.15;
    }

    // Check preventive measures
    if (sections.preventiveSteps && sections.preventiveSteps.length >= 2) {
      confidence += 0.1;
    }

    // Penalty for generic responses
    const genericPhrases = ['more information needed', 'consult expert', 'കൂടുതൽ വിവരം', 'വിദഗ്ധനെ സമീപിക്കുക'];
    const isGeneric = genericPhrases.some(phrase => 
      sections.shortAnswer?.toLowerCase().includes(phrase.toLowerCase())
    );
    if (isGeneric) confidence -= 0.2;

    return Math.max(0.1, Math.min(confidence, 0.95));
  }

  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Pest identification
    const pestKeywords = ['pest', 'insect', 'bug', 'worm', 'കീടം', 'പുഴു', 'കീട്', 'പ്രാണി'];
    if (pestKeywords.some(keyword => lowerMessage.includes(keyword))) return 'pest_identification';
    
    // Disease identification  
    const diseaseKeywords = ['disease', 'spot', 'rot', 'wilt', 'fungus', 'bacterial', 'viral', 
                           'രോഗം', 'പാട്', 'ചീയൽ', 'വാടൽ', 'പൂപ്പൽ', 'ബാക്ടീരിയ', 'വൈറസ്'];
    if (diseaseKeywords.some(keyword => lowerMessage.includes(keyword))) return 'disease_identification';
    
    // Fertilizer and nutrition
    const fertilizerKeywords = ['fertilizer', 'nutrition', 'npk', 'urea', 'compost', 'manure',
                              'വളം', 'പോഷണം', 'യൂറിയ', 'കമ്പോസ്റ്റ്', 'ചാണകം'];
    if (fertilizerKeywords.some(keyword => lowerMessage.includes(keyword))) return 'fertilizer_recommendation';
    
    // Weather and climate
    const weatherKeywords = ['weather', 'rain', 'temperature', 'climate', 'monsoon',
                           'കാലാവസ്ഥ', 'മഴ', 'താപനില', 'മൺസൂൺ'];
    if (weatherKeywords.some(keyword => lowerMessage.includes(keyword))) return 'weather_guidance';
    
    // Irrigation and water
    const irrigationKeywords = ['water', 'irrigation', 'watering', 'drought', 'drip',
                              'വെള്ളം', 'നനയ്ക്കൽ', 'വരൾച്ച', 'ഡ്രിപ്'];
    if (irrigationKeywords.some(keyword => lowerMessage.includes(keyword))) return 'irrigation_guidance';
    
    // Organic farming
    const organicKeywords = ['organic', 'natural', 'bio', 'sustainable', 'chemical-free',
                           'ജൈവ', 'പ്രകൃതിദത്ത', 'രാസമുക്ത'];
    if (organicKeywords.some(keyword => lowerMessage.includes(keyword))) return 'organic_farming';
    
    // Market and prices
    const marketKeywords = ['price', 'market', 'sell', 'buy', 'cost', 'rate',
                          'വില', 'മാർക്കറ്റ്', 'വിൽക്കുക', 'വാങ്ങുക', 'നിരക്ക്'];
    if (marketKeywords.some(keyword => lowerMessage.includes(keyword))) return 'market_guidance';
    
    // Emergency situations
    const emergencyKeywords = ['emergency', 'urgent', 'dying', 'help', 'crisis', 'severe',
                             'അടിയന്തര', 'ഉടൻ', 'മരിക്കുന്നു', 'സഹായം', 'പ്രതിസന്ധി'];
    if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) return 'emergency_help';
    
    // Crop specific guidance
    const cropKeywords = ['grow', 'plant', 'cultivation', 'farming', 'harvest', 'yield',
                         'വളർത്തുക', 'നടുക', 'കൃഷി', 'വിളവെടുപ്പ്', 'ഉൽപാദനം'];
    if (cropKeywords.some(keyword => lowerMessage.includes(keyword))) return 'crop_guidance';
    
    return 'general_agriculture';
  }

  private shouldEscalate(sections: any): boolean {
    if (!sections.shortAnswer || sections.shortAnswer.length < 10) return true;
    
    const text = JSON.stringify(sections).toLowerCase();
    const dangerWords = ['emergency', 'urgent', 'dying', 'severe', 'crisis', 'അടിയന്തര', 'മരിക്കുന്നു'];
    
    return dangerWords.some(word => text.includes(word));
  }

  private extractRelatedTopics(text: string): string[] {
    const topics = [];
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('fertilizer') || lowerText.includes('വളം')) topics.push('fertilization');
    if (lowerText.includes('water') || lowerText.includes('വെള്ളം')) topics.push('irrigation');
    if (lowerText.includes('spray') || lowerText.includes('തളിക്കൽ')) topics.push('pest_control');
    if (lowerText.includes('organic') || lowerText.includes('ജൈവ')) topics.push('organic_farming');
    
    return topics;
  }

  private createErrorResponse(query: ChatQuery): ChatResponse {
    const isEnglish = query.language === 'en';
    
    return {
      id: Date.now().toString(),
      queryId: query.id,
      shortAnswer: isEnglish 
        ? "I'm temporarily unable to provide agricultural advice. Please try asking your question differently."
        : "ഞാൻ താൽക്കാലികമായി കാർഷിക ഉപദേശം നൽകാൻ കഴിയുന്നില്ല. ദയവായി നിങ്ങളുടെ ചോദ്യം വ്യത്യസ്തമായി ചോദിക്കാൻ ശ്രമിക്കുക.",
      shortAnswerMalayalam: !isEnglish 
        ? "ഞാൻ താൽക്കാലികമായി കാർഷിക ഉപദേശം നൽകാൻ കഴിയുന്നില്ല. ദയവായി നിങ്ങളുടെ ചോദ്യം വ്യത്യസ്തമായി ചോദിക്കാൻ ശ്രമിക്കുക."
        : undefined,
      why: isEnglish 
        ? "AI systems may experience temporary connectivity or processing issues."
        : "AI സിസ്റ്റങ്ങൾക്ക് താൽക്കാലിക കണക്റ്റിവിറ്റി അല്ലെങ്കിൽ പ്രോസസ്സിംഗ് പ്രശ്നങ്ങൾ അനുഭവപ്പെടാം.",
      whyMalayalam: !isEnglish ? "AI സിസ്റ്റങ്ങൾക്ക് താൽക്കാലിക കണക്റ്റിവിറ്റി അല്ലെങ്കിൽ പ്രോസസ്സിംഗ് പ്രശ്നങ്ങൾ അനുഭവപ്പെടാം." : undefined,
      immediateSteps: isEnglish ? [
        "Try asking a more specific question about your crop",
        "Mention the exact problem (disease, pest, growth issue)",
        "Include details like crop type, symptoms, and location",
        "Check your internet connection and try again"
      ] : [
        "നിങ്ങളുടെ വിളയെക്കുറിച്ച് കൂടുതൽ വ്യക്തമായ ചോദ്യം ചോദിക്കാൻ ശ്രമിക്കുക",
        "കൃത്യമായ പ്രശ്നം പരാമർശിക്കുക (രോഗം, കീടം, വളർച്ചാ പ്രശ്നം)",
        "വിളയുടെ തരം, ലക്ഷണങ്ങൾ, സ്ഥാനം എന്നിവയുടെ വിശദാംശങ്ങൾ ഉൾപ്പെടുത്തുക",
        "നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക"
      ],
      immediateStepsMalayalam: !isEnglish ? [
        "നിങ്ങളുടെ വിളയെക്കുറിച്ച് കൂടുതൽ വ്യക്തമായ ചോദ്യം ചോദിക്കാൻ ശ്രമിക്കുക",
        "കൃത്യമായ പ്രശ്നം പരാമർശിക്കുക (രോഗം, കീടം, വളർച്ചാ പ്രശ്നം)",
        "വിളയുടെ തരം, ലക്ഷണങ്ങൾ, സ്ഥാനം എന്നിവയുടെ വിശദാംശങ്ങൾ ഉൾപ്പെടുത്തുക",
        "നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക"
      ] : undefined,
      preventiveSteps: isEnglish ? [
        "Contact your local agricultural extension officer",
        "Visit the nearest Krishi Bhavan for immediate help",
        "Consult with experienced farmers in your area"
      ] : [
        "നിങ്ങളുടെ പ്രാദേശിക കാർഷിക വിപുലീകരണ ഉദ്യോഗസ്ഥനുമായി ബന്ധപ്പെടുക",
        "ഉടനടി സഹായത്തിനായി അടുത്തുള്ള കൃഷിഭവൻ സന്ദർശിക്കുക",
        "നിങ്ങളുടെ പ്രദേശത്തെ പരിചയസമ്പന്നരായ കർഷകരുമായി കൂടിയാലോചിക്കുക"
      ],
      preventiveStepsMalayalam: !isEnglish ? [
        "നിങ്ങളുടെ പ്രാദേശിക കാർഷിക വിപുലീകരണ ഉദ്യോഗസ്ഥനുമായി ബന്ധപ്പെടുക",
        "ഉടനടി സഹായത്തിനായി അടുത്തുള്ള കൃഷിഭവൻ സന്ദർശിക്കുക",
        "നിങ്ങളുടെ പ്രദേശത്തെ പരിചയസമ്പന്നരായ കർഷകരുമായി കൂടിയാലോചിക്കുക"
      ] : undefined,
      confidence: 0.1,
      intent: 'error',
      entities: {},
      escalateToHuman: true,
      relatedTopics: ['expert_consultation', 'local_support'],
      timestamp: new Date()
    };
  }
}

export default GeminiAgricultureService;
