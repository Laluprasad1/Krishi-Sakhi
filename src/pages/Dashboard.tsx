import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Sprout, 
  Droplets, 
  Sun, 
  TrendingUp, 
  TrendingDown,
  Users, 
  MessageSquare, 
  AlertTriangle,
  Leaf,
  Calendar,
  MapPin,
  IndianRupee,
  Thermometer,
  Wind,
  Eye,
  Activity,
  Search,
  Target,
  Award,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  DollarSign,
  Clock,
  Zap,
  Shield,
  TreePine,
  Scissors,
  RefreshCw,
  TestTube,
  Cloud,
  Calculator,
  PieChart,
  FileText,
  Bell,
  Settings,
  Download,
  Info,
  BarChart3,
  GraduationCap,
  BookOpen,
  HelpCircle,
  Play,
  X,
  ChevronRight,
  ShoppingCart,
  ChevronLeft,
  Lightbulb,
  Heart,
  UserCheck,
  Store
} from 'lucide-react';
import { cropRecommendationEngine, FarmerInput, CropRecommendation } from '@/services/cropRecommendationEngine';
import Marketplace from './Marketplace';

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
}

interface CropData {
  name: string;
  stage: string;
  health: number;
  nextAction: string;
  daysToHarvest: number;
}

interface MarketPrice {
  crop: string;
  price: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export default function Dashboard() {
  const [currentLang, setCurrentLang] = useState(false); // false = English, true = Malayalam
  const [selectedLocation, setSelectedLocation] = useState('Thiruvananthapuram');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  // Beginner Guide System
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [userExperience, setUserExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [showSmartNotifications, setShowSmartNotifications] = useState(true);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<Array<{role: 'user' | 'ai', content: string, timestamp: Date}>>([]);
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [issueReport, setIssueReport] = useState({ type: '', description: '', contact: '' });
  
  // Navigation breadcrumbs
  const getBreadcrumbs = () => {
    const breadcrumbs = [
      { label: currentLang ? 'ഹോം' : 'Home', active: false }
    ];
    
    if (showCropRecommendation) {
      breadcrumbs.push({ 
        label: currentLang ? 'വിള ശുപാർശ' : 'Crop Recommendation', 
        active: true 
      });
      if (recommendationStep > 0) {
        breadcrumbs.push({ 
          label: currentLang ? `ഘട്ടം ${recommendationStep}` : `Step ${recommendationStep}`, 
          active: true 
        });
      }
    } else if (showTutorial) {
      breadcrumbs.push({ 
        label: currentLang ? 'ടൂറിന്റോറിയൽ' : 'Tutorial', 
        active: true 
      });
    } else {
      breadcrumbs.push({ 
        label: currentLang ? 'ഡാഷ്ബോർഡ്' : 'Dashboard', 
        active: true 
      });
    }
    
    return breadcrumbs;
  };

  // Get context-aware back button text
  const getBackButtonText = () => {
    if (showCropRecommendation) {
      return currentLang ? 'ഡാഷ്ബോർഡിലേക്ക്' : 'To Dashboard';
    } else if (showTutorial) {
      return currentLang ? 'ടൂറിന്റോറിയൽ അവസാനിപ്പിക്കുക' : 'Exit Tutorial';
    } else if (showWelcomeModal) {
      return currentLang ? 'തിരിച്ചുപോകുക' : 'Go Back';
    } else if (showAIChat) {
      return currentLang ? 'ചാറ്റ് അടയ്ക്കുക' : 'Close Chat';
    } else if (showIssueReport) {
      return currentLang ? 'റിപ്പോർട്ട് അടയ്ക്കുക' : 'Close Report';
    } else {
      return currentLang ? 'മുമ്പത്തെ പേജിലേക്ക്' : 'Previous Page';
    }
  };
  
  // Crop recommendation state
  const [showCropRecommendation, setShowCropRecommendation] = useState(false);
  const [farmerInput, setFarmerInput] = useState<Partial<FarmerInput>>({});
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>([]);
  const [recommendationStep, setRecommendationStep] = useState(1);

  // Mock data - In real app, this would come from APIs
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 28,
    humidity: 78,
    rainfall: 15.5,
    windSpeed: 12,
    condition: 'Partly Cloudy'
  });

  // Check if user is first-time visitor
  useEffect(() => {
    const hasVisited = localStorage.getItem('dashboardVisited');
    if (!hasVisited) {
      setIsFirstTime(true);
      setShowWelcomeModal(true);
    } else {
      setIsFirstTime(false);
    }
  }, []);

  // Enhanced Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // ESC key to go back/close any modal
      if (event.key === 'Escape') {
        event.preventDefault();
        if (showCropRecommendation) {
          resetRecommendation();
        } else if (showTutorial) {
          setShowTutorial(false);
          setTutorialStep(0);
        } else if (showWelcomeModal) {
          setShowWelcomeModal(false);
        } else if (showAIChat) {
          setShowAIChat(false);
        } else if (showIssueReport) {
          setShowIssueReport(false);
        } else {
          // Navigate to home page or previous page
          if (window.history.length > 1) {
            window.history.back();
          } else {
            // If no history, go to root
            window.location.href = '/';
          }
        }
      }
      
      // Alt+C to open AI Chat
      if (event.altKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        setShowAIChat(true);
      }
      
      // Alt+H to show help/tutorial
      if (event.altKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        setShowTutorial(true);
        setTutorialStep(0);
      }
      
      // Alt+R to open issue report
      if (event.altKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        setShowIssueReport(true);
      }
      
      // Ctrl+B for browser back (additional option)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [showCropRecommendation, showTutorial, showWelcomeModal, showAIChat, showIssueReport]);

  const handleWelcomeComplete = (experience: 'beginner' | 'intermediate' | 'advanced') => {
    setUserExperience(experience);
    localStorage.setItem('dashboardVisited', 'true');
    localStorage.setItem('userExperience', experience);
    setShowWelcomeModal(false);
    
    if (experience === 'beginner') {
      setTimeout(() => setShowTutorial(true), 1000);
    }
  };

  const [cropData, setCropData] = useState<CropData[]>([
    {
      name: 'Rice (Oryza sativa)',
      stage: 'Flowering',
      health: 85,
      nextAction: 'Apply Potash fertilizer',
      daysToHarvest: 45
    },
    {
      name: 'Coconut',
      stage: 'Mature',
      health: 92,
      nextAction: 'Harvest ready nuts',
      daysToHarvest: 0
    },
    {
      name: 'Pepper',
      stage: 'Vegetative',
      health: 76,
      nextAction: 'Check for pest infestation',
      daysToHarvest: 120
    }
  ]);

  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([
    { crop: 'Rice', price: 2100, change: 5.2, trend: 'up' },
    { crop: 'Coconut', price: 25, change: -2.1, trend: 'down' },
    { crop: 'Pepper', price: 580, change: 8.7, trend: 'up' },
    { crop: 'Cardamom', price: 1250, change: 0.5, trend: 'stable' }
  ]);

  const stats = {
    totalFarmers: 15420,
    activeCrops: 8,
    totalQueries: 2847,
    successRate: 94.5
  };

  // Tutorial steps for beginners
  const tutorialSteps = [
    {
      title: currentLang ? 'സ്വാഗതം!' : 'Welcome!',
      content: currentLang ? 'ഈ ഡാഷ്ബോർഡ് നിങ്ങളുടെ കൃഷിയെ സഹായിക്കും' : 'This dashboard will help you with all your farming needs',
      target: 'overview'
    },
    {
      title: currentLang ? 'വിള ഉപദേശം' : 'Crop Advisor',
      content: currentLang ? 'നിങ്ങളുടെ മണ്ണിനും കാലാവസ്ഥയ്ക്കും അനുയോജ്യമായ വിളകൾ കണ്ടെത്തുക' : 'Find the best crops for your soil and climate conditions',
      target: 'recommendations'
    },
    {
      title: currentLang ? 'കാലാവസ്ഥ വിവരങ്ങൾ' : 'Weather Information',
      content: currentLang ? 'പ്രാദേശിക കാലാവസ്ഥാ വിവരങ്ങൾ ലഭിക്കുക' : 'Get local weather information for better farming decisions',
      target: 'weather'
    },
    {
      title: currentLang ? 'വിപണി വിലകൾ' : 'Market Prices',
      content: currentLang ? 'നിങ്ങളുടെ ഉത്പാദനങ്ങളുടെ ഏറ്റവും പുതിയ വിലകൾ അറിയുക' : 'Stay updated with the latest market prices for your produce',
      target: 'market'
    }
  ];

  // Beginner-friendly farming tips
  const beginnerTips = [
    {
      title: currentLang ? 'മണ്ണ് പരിശോധന' : 'Soil Testing',
      content: currentLang ? 'വിള നടാൻ മുമ്പ് മണ്ണിന്റെ ഗുണനിലവാരം പരിശോധിക്കുക' : 'Always test your soil quality before planting crops',
      icon: TestTube
    },
    {
      title: currentLang ? 'സമയബന্ധിത നടീൽ' : 'Timely Planting',
      content: currentLang ? 'ഓരോ വിളയ്ക്കും ഉചിതമായ സമയത്ത് നടുക' : 'Plant each crop at the right season for best results',
      icon: Calendar
    },
    {
      title: currentLang ? 'വെള്ളം ലാഭിക്കുക' : 'Water Conservation',
      content: currentLang ? 'ഡ്രിപ്പ് ഇറിഗേഷൻ ഉപയോഗിച്ച് വെള്ളം ലാഭിക്കുക' : 'Use drip irrigation to save water and improve crop yield',
      icon: Droplets
    },
    {
      title: currentLang ? 'ജൈവ വളം' : 'Organic Fertilizers',
      content: currentLang ? 'മണ്ണിന്റെ ആരോഗ്യത്തിനായി ജൈവ വളങ്ങൾ ഉപയോഗിക്കുക' : 'Use organic fertilizers to improve soil health naturally',
      icon: Leaf
    }
  ];

  // Smart notifications based on weather and season
  const getSmartNotifications = () => {
    const today = new Date();
    const month = today.getMonth() + 1; // JavaScript months are 0-indexed
    const notifications = [];

    // Weather-based notifications
    if (weatherData.temperature > 30) {
      notifications.push({
        type: 'weather',
        icon: Sun,
        title: currentLang ? 'ഉയർന്ന താപനില മുന്നറിയിപ്പ്' : 'High Temperature Alert',
        content: currentLang 
          ? 'ഇന്ന് വളരെ ചൂടാണ്! രാവിലെ 6-7 മണിക്കും വൈകുന്നേരം 5-6 മണിക്കും വെള്ളം നൽകുക. ചെടികൾക്ക് തണൽ നൽകുക.'
          : 'Very hot today! Water plants at 6-7 AM and 5-6 PM. Provide shade to protect crops.'
      });
    } else if (weatherData.humidity > 80) {
      notifications.push({
        type: 'weather',
        icon: Droplets,
        title: currentLang ? 'ഉയർന്ന ഈർപ്പം' : 'High Humidity Alert',
        content: currentLang 
          ? 'ഇന്ന് വായുവിൽ കൂടുതൽ ഈർപ്പമുണ്ട്. ഫംഗസ് രോഗങ്ങൾ ഉണ്ടാകാം. ചെടികൾക്ക് വായുസഞ്ചാരം ഉറപ്പാക്കുക.'
          : 'High humidity today. Watch for fungal diseases. Ensure good air circulation around plants.'
      });
    }

    // Seasonal notifications
    if (month === 9) { // September
      notifications.push({
        type: 'seasonal',
        icon: Calendar,
        title: currentLang ? 'സെപ്റ്റംബർ പ്രത്യേകം' : 'September Special',
        content: currentLang 
          ? 'പോസ്റ്റ്-മൺസൂൺ സീസൺ! വെണ്ടയ്ക്ക, തക്കാളി, മഞ്ഞൾ, ഇഞ്ചി നടാനുള്ള മികച്ച സമയം.'
          : 'Post-monsoon season! Perfect time to plant okra, tomato, turmeric, and ginger.'
      });
    }

    // Daily practical tips
    const practicalTips = [
      {
        type: 'practical',
        icon: Lightbulb,
        title: currentLang ? 'ഇന്നത്തെ പ്രായോഗിക ടിപ്പ്' : 'Today\'s Practical Tip',
        content: currentLang 
          ? 'ചെടികളുടെ ചുവട്ടിൽ പരുവ ഇട്ടാൽ വെള്ളം സമ്പാദിക്കാനും കളകൾ കുറയ്ക്കാനും സാധിക്കും.'
          : 'Use mulch around plants to retain moisture and reduce weeds naturally.'
      },
      {
        type: 'practical',
        icon: TestTube,
        title: currentLang ? 'മണ്ണ് പരിശോധന' : 'Soil Check',
        content: currentLang 
          ? 'മണ്ണിന്റെ pH 6.0-7.0 ആയിരിക്കണം. കളിമണ്ണിൽ കുറച്ച് മണൽ ചേർത്താൽ വെള്ളം കെട്ടാൻ സാധിക്കില്ല.'
          : 'Soil pH should be 6.0-7.0. Add sand to clay soil to improve drainage.'
      }
    ];

    // Add a random practical tip
    const randomTip = practicalTips[Math.floor(Math.random() * practicalTips.length)];
    notifications.push(randomTip);

    return notifications.slice(0, 3); // Return max 3 notifications
  };

  // Handle crop recommendation form
  const handleCropRecommendation = async () => {
    if (!validateFarmerInput()) {
      console.log('Validation failed:', farmerInput);
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      // Create a complete FarmerInput object with defaults for missing fields
      const completeInput: FarmerInput = {
        farmSize: farmerInput.farmSize!,
        location: {
          district: farmerInput.location?.district!,
          taluk: farmerInput.location?.taluk || 'Unknown',
          village: farmerInput.location?.village || 'Unknown',
          coordinates: farmerInput.location?.coordinates || { lat: 0, lng: 0 }
        },
        soilType: farmerInput.soilType!,
        waterAvailability: farmerInput.waterAvailability!,
        experience: farmerInput.experience!,
        budget: farmerInput.budget!,
        season: farmerInput.season!,
        previousCrops: farmerInput.previousCrops || [],
        organicPreference: farmerInput.organicPreference || false,
        marketAccess: farmerInput.marketAccess || 'middleman',
        laborAvailability: 'family',
        irrigationFacility: farmerInput.waterAvailability === 'abundant' ? 'flood' : 
                            farmerInput.waterAvailability === 'moderate' ? 'drip' : 'rain_fed',
        soilCondition: farmerInput.soilCondition || 'unknown',
        soilIndicators: farmerInput.soilIndicators || {
          plantGrowth: 'average',
          soilColor: 'brown',
          waterDrainage: 'good',
          commonWeeds: []
        }
      };
      
      console.log('Generating recommendations for:', completeInput);
      const recommendations = await cropRecommendationEngine.generateRecommendations(completeInput);
      console.log('Generated recommendations:', recommendations);
      
      if (recommendations.length === 0) {
        alert('No suitable crops found for your conditions. Please try adjusting your inputs.');
        return;
      }
      
      setCropRecommendations(recommendations);
      setRecommendationStep(3); // Go to results step
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Error generating recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateFarmerInput = (): boolean => {
    return !!(
      farmerInput.farmSize && 
      farmerInput.location?.district && 
      farmerInput.soilType && 
      farmerInput.waterAvailability &&
      farmerInput.experience &&
      farmerInput.budget &&
      farmerInput.season &&
      farmerInput.marketAccess
    );
  };

  const resetRecommendation = () => {
    setShowCropRecommendation(false);
    setRecommendationStep(1);
    setFarmerInput({});
    setCropRecommendations([]);
  };

  // Enhanced navigation functions
  const goToStep = (step: number) => {
    setRecommendationStep(step);
  };

  const handleStartOver = () => {
    resetRecommendation();
    if (userExperience === 'beginner') {
      setRecommendationStep(0); // Start with beginner wizard
    }
  };

  // AI Chat functionality
  const handleAIChat = async () => {
    if (!aiChatInput.trim()) return;
    
    const userMessage = {
      role: 'user' as const,
      content: aiChatInput,
      timestamp: new Date()
    };
    
    setAiChatMessages(prev => [...prev, userMessage]);
    setAiChatInput('');
    
    // Simulate AI response (in real app, this would call actual AI API)
    setTimeout(() => {
      const aiResponse = {
        role: 'ai' as const,
        content: getAIResponse(userMessage.content),
        timestamp: new Date()
      };
      setAiChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('soil') || input.includes('മണ്ണ്')) {
      return currentLang 
        ? 'മണ്ണ് പരിശോധനയ്ക്ക് pH മീറ്റർ ഉപയോഗിക്കുക. നല്ല മണ്ണിന് pH 6.0-7.0 ആയിരിക്കണം. കളിമണ്ണിൽ മണൽ ചേർത്താൽ വെള്ളം കെട്ടാത്തതാക്കാം.'
        : 'For soil testing, use a pH meter. Good soil should have pH 6.0-7.0. Add sand to clay soil to improve drainage.';
    }
    
    if (input.includes('water') || input.includes('വെള്ളം')) {
      return currentLang
        ? 'ചെടികൾക്ക് രാവിലെ 6-8 മണിക്കും വൈകുന്നേരം 5-7 മണിക്കും വെള്ളം നൽകുക. ഉച്ചയ്ക്ക് വെള്ളം നൽകരുത്.'
        : 'Water plants early morning (6-8 AM) or evening (5-7 PM). Avoid watering during noon when it\'s hot.';
    }
    
    if (input.includes('pest') || input.includes('കീട')) {
      return currentLang
        ? 'ജൈവ കീടനാശിനികൾ ഉപയോഗിക്കുക. നീം ഓയിൽ, സോപ്പ് വെള്ളം എന്നിവ നല്ലതാണ്. ആഴ്ചയിൽ രണ്ടുതവണ തളിക്കുക.'
        : 'Use organic pesticides like neem oil and soap water. Spray twice a week in early morning or evening.';
    }
    
    if (input.includes('crop') || input.includes('വിള')) {
      return currentLang
        ? 'സെപ്റ്റംബറിൽ വെണ്ടയ്ക്ക, തക്കാളി, മഞ്ഞൾ, ഇഞ്ചി നടാം. നിങ്ങളുടെ മണ്ണിനും കാലാവസ്ഥയ്ക്കും അനുയോജ്യമായ വിള തിരഞ്ഞെടുക്കാൻ വിള ശുപാർശ ടാബ് ഉപയോഗിക്കുക.'
        : 'In September, you can plant okra, tomato, turmeric, and ginger. Use the Crop Recommendation tab to find crops suitable for your soil and climate.';
    }
    
    return currentLang
      ? 'നിങ്ങളുടെ ചോദ്യം മനസ്സിലായില്ല. കൃഷിയെക്കുറിച്ചുള്ള കൃത്യമായ ചോദ്യങ്ങൾ ചോദിക്കുക - മണ്ണ്, വെള്ളം, കീടങ്ങൾ, വിളകൾ എന്നിവയെക്കുറിച്ച്.'
      : 'I didn\'t understand your question. Please ask specific farming questions about soil, water, pests, or crops.';
  };

  const keralasDistricts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha', 'Kottayam', 
    'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad', 'Malappuram', 
    'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  return (
    <div className="min-h-screen bg-white p-4 relative">
      {/* Floating Back Button */}
      <div className="fixed bottom-6 left-6 z-50 group">
        <Button 
          onClick={() => {
            // Enhanced back functionality
            if (showCropRecommendation) {
              resetRecommendation();
            } else if (showTutorial) {
              setShowTutorial(false);
              setTutorialStep(0);
            } else if (showWelcomeModal) {
              setShowWelcomeModal(false);
            } else if (showAIChat) {
              setShowAIChat(false);
            } else if (showIssueReport) {
              setShowIssueReport(false);
            } else {
              // Navigate to home page or previous page
              if (window.history.length > 1) {
                window.history.back();
              } else {
                // If no history, go to root
                window.location.href = '/';
              }
            }
          }}
          size="lg"
          className="rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-14 h-14 hover:scale-110"
          title={getBackButtonText()}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {getBackButtonText()}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Prominent Back Button */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Prominent Back Button */}
              <Button 
                onClick={() => {
                  // Enhanced back functionality
                  if (showCropRecommendation) {
                    resetRecommendation();
                  } else if (showTutorial) {
                    setShowTutorial(false);
                    setTutorialStep(0);
                  } else if (showWelcomeModal) {
                    setShowWelcomeModal(false);
                  } else if (showAIChat) {
                    setShowAIChat(false);
                  } else if (showIssueReport) {
                    setShowIssueReport(false);
                  } else {
                    // Navigate to home page or previous page
                    if (window.history.length > 1) {
                      window.history.back();
                    } else {
                      // If no history, go to root
                      window.location.href = '/';
                    }
                  }
                }}
                variant="outline"
                size="lg"
                className="flex items-center gap-3 border-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg px-6 py-3"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold">
                  {currentLang ? 'മടങ്ങുക' : 'Back'}
                </span>
              </Button>
              <div className="border-l-2 border-green-300 pl-4">
                <h1 className="text-3xl font-bold text-green-800 mb-1">
                  {currentLang ? 'കൃഷി സഖി - ഡിജിറ്റൽ ബന്ധു' : 'Krishi Sakhi - Digital Bandhu'}
                </h1>
                <p className="text-green-700 text-sm">
                  {currentLang 
                    ? 'കേരളത്തിലെ കാർഷിക പ്രവർത്തനങ്ങളുടെ ഒരു സമഗ്ര വീക്ഷണം' 
                    : 'Your comprehensive digital farming companion for Kerala agriculture'
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <select 
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 bg-white text-green-800 shadow-sm"
              >
                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                <option value="Kochi">Kochi</option>
                <option value="Kozhikode">Kozhikode</option>
                <option value="Thrissur">Thrissur</option>
              </select>
              <Button 
                onClick={() => setCurrentLang(!currentLang)}
                variant="outline"
                className="flex items-center gap-2 border-green-600 text-green-700 hover:bg-green-600 hover:text-white shadow-sm"
              >
                {currentLang ? 'EN' : 'ML'}
              </Button>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">
                  {currentLang ? 'സജീവം' : 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Bar */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-sm">
              {getBreadcrumbs().map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                  <span className={`${crumb.active ? 'text-green-700 font-semibold bg-green-100 px-2 py-1 rounded-full' : 'text-gray-500'}`}>
                    {crumb.label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Quick Navigation Buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setActiveTab('overview')}
                className={`${activeTab === 'overview' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-green-700'}`}
              >
                <Eye className="h-4 w-4 mr-1" />
                {currentLang ? 'ഹോം' : 'Home'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setActiveTab('recommendations')}
                className={`${activeTab === 'recommendations' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-green-700'}`}
              >
                <Target className="h-4 w-4 mr-1" />
                {currentLang ? 'വിള' : 'Crops'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowAIChat(true)}
                className="text-gray-600 hover:text-green-700 hover:bg-blue-50 transition-colors"
                title={currentLang ? 'AI സഹായി - കൃഷിയുടെ സംശയങ്ങൾ ചോദിക്കുക (Alt+C)' : 'AI Assistant - Ask farming questions (Alt+C)'}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {currentLang ? 'AI സഹായി' : 'AI Assistant'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowTutorial(true)}
                className="text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors"
                title={currentLang ? 'സഹായം - ട്യൂട്ടോറിയൽ കാണുക (Alt+H)' : 'Help - View tutorial (Alt+H)'}
              >
                <BookOpen className="h-4 w-4 mr-1" />
                {currentLang ? 'സഹായം' : 'Help'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowIssueReport(true)}
                className="text-gray-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
                title={currentLang ? 'പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക (Alt+R)' : 'Report an Issue (Alt+R)'}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                {currentLang ? 'റിപ്പോർട്ട്' : 'Report'}
              </Button>
              
              {/* Enhanced Keyboard Shortcuts Indicator */}
              <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border">
                <div className="flex items-center gap-1">
                  <span>ESC:</span>
                  <span className="bg-gray-200 px-2 py-1 rounded text-gray-700">
                    {currentLang ? 'മടങ്ങുക' : 'Back'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Alt+C:</span>
                  <span className="bg-blue-200 px-2 py-1 rounded text-blue-700">
                    {currentLang ? 'AI' : 'AI'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Alt+H:</span>
                  <span className="bg-green-200 px-2 py-1 rounded text-green-700">
                    {currentLang ? 'സഹായം' : 'Help'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Alt+R:</span>
                  <span className="bg-orange-200 px-2 py-1 rounded text-orange-700">
                    {currentLang ? 'റിപ്പോർട്ട്' : 'Report'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black text-white border border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300">{currentLang ? 'ആകെ കർഷകർ' : 'Total Farmers'}</p>
                  <p className="text-2xl font-bold">{stats.totalFarmers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black border border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">{currentLang ? 'സജീവ വിളകൾ' : 'Active Crops'}</p>
                  <p className="text-2xl font-bold">{stats.activeCrops}</p>
                </div>
                <Sprout className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-100 text-black border border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">{currentLang ? 'ആകെ ചോദ്യങ്ങൾ' : 'Total Queries'}</p>
                  <p className="text-2xl font-bold">{stats.totalQueries.toLocaleString()}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white text-black border border-gray-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">{currentLang ? 'വിജയ നിരക്ക്' : 'Success Rate'}</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Notifications for Beginners */}
        {userExperience === 'beginner' && showSmartNotifications && (
          <Card className="bg-gradient-to-r from-cyan-50 to-teal-50 border-2 border-cyan-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-cyan-100 p-2 rounded-full">
                  <Bell className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-cyan-800">
                        {currentLang ? '🔔 ഇന്നത്തെ സ്മാർട്ട് ടിപ്പുകൾ' : '🔔 Today\'s Smart Tips'}
                      </h4>
                      <span className="text-xs bg-cyan-200 text-cyan-700 px-2 py-1 rounded-full">
                        {currentLang ? `${selectedLocation} അടിസ്ഥാനമാക്കി` : `Based on ${selectedLocation}`}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => setShowSmartNotifications(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {getSmartNotifications().map((notification, index) => {
                      const IconComponent = notification.icon;
                      const colorMap = {
                        weather: 'orange',
                        seasonal: 'green', 
                        practical: 'yellow'
                      };
                      const color = colorMap[notification.type as keyof typeof colorMap] || 'blue';
                      
                      return (
                        <div key={index} className="bg-white p-3 rounded-lg border border-cyan-100 hover:border-cyan-200 transition-colors">
                          <div className="flex items-center gap-2 mb-1">
                            <IconComponent className={`h-4 w-4 text-${color}-500`} />
                            <span className="text-sm font-medium text-gray-800">
                              {notification.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {notification.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                      onClick={() => {
                        // In a real app, this would show more notifications
                        alert(currentLang ? 'കൂടുതൽ ടിപ്പുകൾ ഉടൻ ലഭ്യമാകും!' : 'More tips coming soon!');
                      }}
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      {currentLang ? 'കൂടുതൽ ടിപ്പുകൾ' : 'More Tips'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                      onClick={() => setActiveTab('calendar')}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {currentLang ? 'കലണ്ടർ കാണുക' : 'View Calendar'}
                    </Button>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    💡 {currentLang 
                      ? 'ഈ ടിപ്പുകൾ നിങ്ങളുടെ സ്ഥലത്തെ കാലാവസ്ഥയും സീസണും അടിസ്ഥാനമാക്കിയുള്ളതാണ്'
                      : 'These tips are personalized based on your location\'s weather and season'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Beginner Helper Panel - Only show for beginners */}
        {userExperience === 'beginner' && (
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <GraduationCap className="h-5 w-5" />
                {currentLang ? 'കാർഷിക സഹായി' : 'Farming Helper'}
              </CardTitle>
              <CardDescription className="text-green-700">
                {currentLang 
                  ? 'കൃഷിയിൽ പുതിയവർക്കുള്ള സഹായ സൂചനകൾ' 
                  : 'Quick tips and guidance for new farmers'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {beginnerTips.map((tip, index) => {
                  const IconComponent = tip.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 transition-colors">
                      <div className="bg-green-100 p-2 rounded-full">
                        <IconComponent className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-green-800 mb-1">{tip.title}</h4>
                        <p className="text-xs text-green-600">{tip.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button 
                  onClick={() => setShowTutorial(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {currentLang ? 'ടൂറിന്റോറിയൽ ആരംഭിക്കുക' : 'Start Tutorial'}
                </Button>
                <Button 
                  onClick={() => setActiveTab('recommendations')}
                  size="sm"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Target className="h-4 w-4 mr-1" />
                  {currentLang ? 'വിള ശുപാർശ' : 'Get Crop Advice'}
                </Button>
                <Button 
                  onClick={() => setUserExperience('intermediate')}
                  size="sm"
                  variant="ghost"
                  className="text-green-600 hover:bg-green-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  {currentLang ? 'മറയ്ക്കുക' : 'Hide Helper'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-9 min-w-max bg-gray-100 border border-gray-300">
              <TabsTrigger value="overview" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">
                <Activity className="h-4 w-4 mr-1" />
                {currentLang ? 'അവലോകനം' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">
                <Target className="h-4 w-4 mr-1" />
                {currentLang ? 'വിള ശുപാർശ' : 'Crop Advisor'}
              </TabsTrigger>
              <TabsTrigger value="crops" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">
                <Leaf className="h-4 w-4 mr-1" />
                {currentLang ? 'വിളകൾ' : 'My Crops'}
              </TabsTrigger>
              <TabsTrigger value="weather" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">
                <Cloud className="h-4 w-4 mr-1" />
                {currentLang ? 'കാലാവസ്ഥ' : 'Weather'}
              </TabsTrigger>
              <TabsTrigger value="market" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">
                <DollarSign className="h-4 w-4 mr-1" />
                {currentLang ? 'വിപണി' : 'Market'}
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-black">
                <ShoppingCart className="h-4 w-4 mr-1" />
                {currentLang ? 'മാർക്കറ്റ്‌പ്ലേസ്' : 'Marketplace'}
              </TabsTrigger>
              <TabsTrigger value="financial" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">
                <Calculator className="h-4 w-4 mr-1" />
                {currentLang ? 'സാമ്പത്തികം' : 'Finance'}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">
                <Calendar className="h-4 w-4 mr-1" />
                {currentLang ? 'കലണ്ടർ' : 'Calendar'}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-black data-[state=active]:text-white text-black">
                <BarChart3 className="h-4 w-4 mr-1" />
                {currentLang ? 'വിശകലനം' : 'Analytics'}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Educational Cards for Beginners */}
            {userExperience === 'beginner' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Sprout className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">
                          {currentLang ? 'വിള തിരഞ്ഞെടുക്കൽ' : 'Crop Selection'}
                        </h4>
                        <p className="text-xs text-blue-600 mb-2">
                          {currentLang ? 'നിങ്ങളുടെ മണ്ണിന് അനുയോജ്യമായ വിളകൾ തിരഞ്ഞെടുക്കുക' : 'Choose crops that suit your soil and climate'}
                        </p>
                        <Button size="sm" variant="outline" className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => setActiveTab('recommendations')}>
                          {currentLang ? 'ആരംഭിക്കുക' : 'Get Started'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Cloud className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">
                          {currentLang ? 'കാലാവസ്ഥ ട്രാക്കിംഗ്' : 'Weather Tracking'}
                        </h4>
                        <p className="text-xs text-green-600 mb-2">
                          {currentLang ? 'കാലാവസ്ഥ അടിസ്ഥാനമാക്കി കൃഷി പ്ലാൻ ചെയ്യുക' : 'Plan your farming based on weather patterns'}
                        </p>
                        <Button size="sm" variant="outline" className="text-xs border-green-300 text-green-700 hover:bg-green-50" onClick={() => setActiveTab('weather')}>
                          {currentLang ? 'കാണുക' : 'View Weather'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-1">
                          {currentLang ? 'വിപണി വിലകൾ' : 'Market Prices'}
                        </h4>
                        <p className="text-xs text-purple-600 mb-2">
                          {currentLang ? 'ലാഭകരമായ വിളകൾ തിരിച്ചറിയുക' : 'Identify profitable crops for better income'}
                        </p>
                        <Button size="sm" variant="outline" className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => setActiveTab('market')}>
                          {currentLang ? 'പരിശോധിക്കുക' : 'Check Prices'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities - Enhanced for beginners */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {currentLang ? 'സമീപകാല പ്രവർത്തനങ്ങൾ' : 'Recent Activities'}
                    {userExperience === 'beginner' && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        {currentLang ? 'ടിപ്പുകൾ ഉൾപ്പെടെ' : 'With Tips'}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">
                        {currentLang ? 'തേങ്ങാ തോട്ടങ്ങളിൽ കീട ആക്രമണ മുന്നറിയിപ്പ്' : 'New pest alert issued for coconut farms'}
                      </p>
                      <p className="text-xs text-red-600">2 hours ago</p>
                      {userExperience === 'beginner' && (
                        <p className="text-xs text-red-700 mt-1 bg-red-100 p-2 rounded">
                          💡 {currentLang ? 'ടിപ്പ്: നിയമിത ഇടവേളകളിൽ ഇലകളും തണ്ടുകളും പരിശോധിക്കുക' : 'Tip: Check leaves and stems regularly for early pest detection'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        {currentLang ? 'നെല്ലിന്റെ വിപണി വില അപ്‌ഡേറ്റ് ചെയ്തു' : 'Market prices updated for rice'}
                      </p>
                      <p className="text-xs text-green-600">4 hours ago</p>
                      {userExperience === 'beginner' && (
                        <p className="text-xs text-green-700 mt-1 bg-green-100 p-2 rounded">
                          💰 {currentLang ? 'ടിപ്പ്: വില കൂടുതലുള്ള സമയത്ത് വിൽക്കാൻ ശ്രമിക്കുക' : 'Tip: Try to sell when prices are higher for better profits'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">
                        {currentLang ? 'കാലാവസ്ഥാ പ്രവചനം അപ്‌ഡേറ്റ് ചെയ്തു' : 'Weather forecast updated'}
                      </p>
                      <p className="text-xs text-blue-600">6 hours ago</p>
                      {userExperience === 'beginner' && (
                        <p className="text-xs text-blue-700 mt-1 bg-blue-100 p-2 rounded">
                          🌧️ {currentLang ? 'ടിപ്പ്: മഴയ്ക്ക് മുമ്പ് വിളകൾ പരിരക്ഷിക്കുക' : 'Tip: Protect crops before heavy rain arrives'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions - Enhanced for beginners */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {currentLang ? 'പെട്ടെന്നുള്ള പ്രവർത്തനങ്ങൾ' : 'Quick Actions'}
                    {userExperience === 'beginner' && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        {currentLang ? 'പുതുമുഖങ്ങൾക്ക്' : 'For Beginners'}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userExperience === 'beginner' ? (
                    <>
                      <Button 
                        className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-800 border-green-200" 
                        variant="outline"
                        onClick={() => setActiveTab('recommendations')}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        {currentLang ? '🌱 എന്റെ ആദ്യ വിള തിരഞ്ഞെടുക്കുക' : '🌱 Choose My First Crop'}
                        <span className="ml-auto text-xs bg-green-200 px-2 py-1 rounded">
                          {currentLang ? 'ആരംഭിക്കുക' : 'Start Here'}
                        </span>
                      </Button>
                      <Button 
                        className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200" 
                        variant="outline"
                        onClick={() => setShowTutorial(true)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {currentLang ? '📚 ടൂറിന്റോറിയൽ കാണുക' : '📚 Watch Tutorial'}
                      </Button>
                      <Button 
                        className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200" 
                        variant="outline"
                        onClick={() => setActiveTab('weather')}
                      >
                        <Cloud className="h-4 w-4 mr-2" />
                        {currentLang ? '🌤️ ഇന്നത്തെ കാലാവസ്ഥ' : '🌤️ Today\'s Weather'}
                      </Button>
                      <Button 
                        className="w-full justify-start bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200" 
                        variant="outline"
                        onClick={() => setActiveTab('market')}
                      >
                        <IndianRupee className="h-4 w-4 mr-2" />
                        {currentLang ? '💰 വിപണി വിലകൾ പഠിക്കുക' : '💰 Learn Market Prices'}
                      </Button>
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            {currentLang ? 'ദിവസത്തെ ടിപ്പ്' : 'Tip of the Day'}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700">
                          {currentLang 
                            ? 'മണ്ണിന്റെ ഈർപ്പം പരിശോധിക്കാൻ വിരൽ 2 ഇഞ്ച് മണ്ണിൽ കയറ്റി നോക്കുക!'
                            : 'Check soil moisture by inserting your finger 2 inches deep into the soil!'
                          }
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setShowAIChat(true)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {currentLang ? 'AI സഹായി ചാറ്റ്' : 'Chat with AI Assistant'}
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('calendar')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        {currentLang ? 'വിള കലണ്ടർ' : 'Crop Calendar'}
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => setShowIssueReport(true)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {currentLang ? 'പ്രശ്ന റിപ്പോർട്ട്' : 'Report Issue'}
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('market')}>
                        <IndianRupee className="h-4 w-4 mr-2" />
                        {currentLang ? 'വിപണി വില' : 'Market Prices'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                  {currentLang ? 'അടിയന്തര അലേർട്ടുകൾ' : 'Important Alerts'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>{currentLang ? 'കീട ആക്രമണ മുന്നറിയിപ്പ്:' : 'Pest Attack Warning:'}</strong>
                    {currentLang 
                      ? ' തെങ്ങിൽ റെഡ് പാം വീവിലിന്റെ സാന്നിധ്യം റിപ്പോർട്ട് ചെയ്യപ്പെട്ടിട്ടുണ്ട്. ഉടനടി പ്രതിരോധ നടപടികൾ സ്വീകരിക്കുക.'
                      : ' Red Palm Weevil presence reported in coconut farms. Take immediate preventive measures.'
                    }
                  </AlertDescription>
                </Alert>
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Sun className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>{currentLang ? 'കാലാവസ്ഥ അപ്‌ഡേറ്റ്:' : 'Weather Update:'}</strong>
                    {currentLang 
                      ? ' അടുത്ത 3 ദിവസത്തിനുള്ളിൽ ഇടത്തരം മഴയ്ക്ക് സാധ്യത. വിള സംരക്ഷണ നടപടികൾ സ്വീകരിക്കുക.'
                      : ' Moderate rainfall expected in next 3 days. Take crop protection measures.'
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Educational Cards and Infographics for Beginners */}
            {userExperience === 'beginner' && (
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <BookOpen className="h-6 w-6" />
                    {currentLang ? '📚 കൃഷി പഠനം' : '📚 Farming Education'}
                  </CardTitle>
                  <CardDescription className="text-indigo-700">
                    {currentLang 
                      ? 'കൃഷിയെക്കുറിച്ചുള്ള അടിസ്ഥാന കാര്യങ്ങൾ പഠിക്കുക'
                      : 'Learn the basics of farming with visual guides'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Soil Types Card */}
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-brown-100 p-2 rounded-full">
                          <TreePine className="h-5 w-5 text-amber-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          {currentLang ? 'മണ്ണിന്റെ തരങ്ങൾ' : 'Soil Types'}
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-amber-600 rounded-full"></div>
                          <span className="text-gray-700">
                            {currentLang ? 'കളിമണ്ണ് - നെല്ലിന് നല്ലത്' : 'Clay - Good for rice'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-700">
                            {currentLang ? 'മണൽ - വെണ്ടയ്ക്കിന് നല്ലത്' : 'Sandy - Good for okra'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                          <span className="text-gray-700">
                            {currentLang ? 'ചാരം - പച്ചക്കറികൾക്ക് നല്ലത്' : 'Loamy - Good for vegetables'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Crop Lifecycle Card */}
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Sprout className="h-5 w-5 text-green-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          {currentLang ? 'വിളയുടെ ജീവിതചക്രം' : 'Crop Lifecycle'}
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">1</span>
                          <span className="text-gray-700">
                            {currentLang ? 'വിത്ത്' : 'Seed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">2</span>
                          <span className="text-gray-700">
                            {currentLang ? 'മുള' : 'Sprout'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">3</span>
                          <span className="text-gray-700">
                            {currentLang ? 'വളർച്ച' : 'Growth'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">4</span>
                          <span className="text-gray-700">
                            {currentLang ? 'വിളവെടുപ്പ്' : 'Harvest'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Watering Schedule Card */}
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Droplets className="h-5 w-5 text-blue-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          {currentLang ? 'വെള്ളം നൽകൽ' : 'Watering Guide'}
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Sun className="h-3 w-3 text-yellow-500" />
                          <span className="text-gray-700">
                            {currentLang ? 'രാവിലെ: മികച്ച സമയം' : 'Morning: Best time'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cloud className="h-3 w-3 text-gray-500" />
                          <span className="text-gray-700">
                            {currentLang ? 'വൈകുന്നേരം: നല്ല സമയം' : 'Evening: Good time'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <X className="h-3 w-3 text-red-500" />
                          <span className="text-gray-700">
                            {currentLang ? 'ഉച്ചയ്ക്ക്: ഒഴിവാക്കുക' : 'Noon: Avoid'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Common Pests Card */}
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          {currentLang ? 'സാധാരണ കീടങ്ങൾ' : 'Common Pests'}
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          <span className="text-gray-700">
                            {currentLang ? 'ഇലപ്പുഴു: പച്ചയായ കീടങ്ങൾ' : 'Aphids: Green tiny insects'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span className="text-gray-700">
                            {currentLang ? 'ഇലക്കാശ്: ഇലകളിൽ പാടുകൾ' : 'Leaf spots: Brown patches'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Seasonal Crops Card */}
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          {currentLang ? 'സീസൺ വിളകൾ' : 'Seasonal Crops'}
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            {currentLang ? 'ഇപ്പോൾ' : 'Now'}
                          </span>
                          <span className="text-gray-700">
                            {currentLang ? 'വെണ്ടയ്ക്ക, തക്കാളി' : 'Okra, Tomato'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {currentLang ? 'ഒക്ടോബർ' : 'Oct'}
                          </span>
                          <span className="text-gray-700">
                            {currentLang ? 'ബീൻസ്, കാരറ്റ്' : 'Beans, Carrot'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Reference Card */}
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <Info className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h4 className="font-semibold text-gray-800">
                          {currentLang ? 'പെട്ടെന്നുള്ള റെഫറൻസ്' : 'Quick Reference'}
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-700">
                          🌱 {currentLang ? 'വിത്ത് ആഴം: വിത്തിന്റെ 2-3 മടങ്ങ്' : 'Seed depth: 2-3 times seed size'}
                        </div>
                        <div className="text-gray-700">
                          📏 {currentLang ? 'ചെടികൾ തമ്മിലുള്ള അകലം: 30cm' : 'Plant spacing: 30cm apart'}
                        </div>
                        <div className="text-gray-700">
                          💧 {currentLang ? 'വെള്ളം: ദിവസവും കുറച്ച്' : 'Water: Little daily'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">
                        {currentLang ? 'നിങ്ങൾക്കറിയാമോ?' : 'Did You Know?'}
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      {currentLang 
                        ? 'കേരളത്തിലെ കാലാവസ്ഥ വർഷത്തിൽ 3 സീസണുകളുണ്ട്: പ്രീ-മൺസൂൺ, മൺസൂൺ, പോസ്റ്റ്-മൺസൂൺ. ഓരോ സീസണിലും വ്യത്യസ്ത വിളകൾ നടാം!'
                        : 'Kerala has 3 farming seasons: Pre-monsoon, Monsoon, and Post-monsoon. Different crops grow best in each season!'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Crop Recommendation Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            {!showCropRecommendation ? (
              // Landing page for crop recommendation
              <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-green-800 flex items-center justify-center gap-3">
                    <Target className="h-8 w-8" />
                    {currentLang ? 'സ്മാർട്ട് വിള ശുപാർശ സംവിധാനം' : 'Smart Crop Recommendation System'}
                  </CardTitle>
                  
                  {/* September Special Banner */}
                  <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-lg p-4 mb-4 mx-auto max-w-2xl">
                    <div className="flex items-center justify-center gap-2 text-orange-800 font-bold text-lg">
                      <Calendar className="h-6 w-6" />
                      {currentLang ? '🌾 സെപ്റ്റംബർ പ്രത്യേകം!' : '🌾 September Special!'}
                    </div>
                    <p className="text-orange-700 text-sm mt-2">
                      {currentLang 
                        ? 'മഴക്കാലത്തിന് ശേഷമുള്ള ഈ സമയം വെണ്ടയ്ക്ക, തക്കാളി, ബീൻസ്, മഞ്ഞൾ എന്നിവയ്ക്ക് അനുയോജ്യമാണ്!'
                        : 'Post-monsoon September is perfect for okra, tomato, beans, turmeric and many vegetables!'
                      }
                    </p>
                  </div>

                  <CardDescription className="text-lg text-green-700">
                    {currentLang 
                      ? 'നിങ്ങളുടെ കൃഷിഭൂമിക്ക് ഏറ്റവും അനുയോജ്യമായ വിളകൾ കണ്ടെത്താൻ AI സഹായിയെ ഉപയോഗിക്കുക'
                      : 'Use AI-powered analysis to find the best crops for your farm based on your specific conditions'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Beginner Options */}
                  {userExperience === 'beginner' && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 mb-6">
                      <div className="text-center mb-4">
                        <GraduationCap className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                        <h3 className="text-xl font-bold text-yellow-800 mb-2">
                          {currentLang ? '🌱 പുതുമുഖങ്ങൾക്കുള്ള സഹായം' : '🌱 Beginner\'s Guide'}
                        </h3>
                        <p className="text-yellow-700 text-sm">
                          {currentLang 
                            ? 'കൃഷിയിൽ പുതിയവരാണോ? ഞങ്ങൾ നിങ്ങളെ സഹായിക്കും!'
                            : 'New to farming? We\'ll guide you through every step!'
                          }
                        </p>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <Button 
                          className="w-full bg-green-100 hover:bg-green-200 text-green-800 border-green-300 py-6" 
                          variant="outline"
                          onClick={() => {
                            setRecommendationStep(0); // Start with beginner wizard
                            setShowCropRecommendation(true);
                          }}
                        >
                          <Sprout className="h-5 w-5 mr-2" />
                          <div className="text-left">
                            <div className="font-semibold">
                              {currentLang ? 'സിമ്പിൾ വിസാർഡ്' : 'Simple Wizard'}
                            </div>
                            <div className="text-xs">
                              {currentLang ? 'എളുപ്പമുള്ള ചോദ്യങ്ങൾ' : 'Easy step-by-step questions'}
                            </div>
                          </div>
                        </Button>
                        
                        <Button 
                          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 py-6" 
                          variant="outline"
                          onClick={() => setShowTutorial(true)}
                        >
                          <BookOpen className="h-5 w-5 mr-2" />
                          <div className="text-left">
                            <div className="font-semibold">
                              {currentLang ? 'കൃഷി പഠിക്കുക' : 'Learn Farming'}
                            </div>
                            <div className="text-xs">
                              {currentLang ? 'അടിസ്ഥാന കാര്യങ്ങൾ' : 'Basic farming concepts'}
                            </div>
                          </div>
                        </Button>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <p className="text-xs text-yellow-600">
                          {currentLang 
                            ? '💡 ടിപ്പ്: സിമ്പിൾ വിസാർഡ് ഉപയോഗിച്ച് നിങ്ങളുടെ ആദ്യ വിള തിരഞ്ഞെടുക്കുക'
                            : '💡 Tip: Use the Simple Wizard to choose your first crop easily'
                          }
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                      <Search className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                      <h3 className="font-semibold text-lg mb-2">
                        {currentLang ? 'വിശദമായ വിശകലനം' : 'Detailed Analysis'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {currentLang 
                          ? 'മണ്ണ്, കാലാവസ്ഥ, ജലം, അനുഭവം എന്നിവ വിശകലനം ചെയ്യുന്നു'
                          : 'Analyzes soil, climate, water, experience and more factors'
                        }
                      </p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                      <Award className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="font-semibold text-lg mb-2">
                        {currentLang ? 'വ്യക്തിഗത ശുപാർശകൾ' : 'Personalized Recommendations'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {currentLang 
                          ? 'നിങ്ങളുടെ സാഹചര്യത്തിന് അനുയോജ്യമായ വിളകൾ'
                          : 'Tailored crop suggestions based on your unique conditions'
                        }
                      </p>
                    </div>
                    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
                      <h3 className="font-semibold text-lg mb-2">
                        {currentLang ? 'ലാഭക്ഷമത പ്രവചനം' : 'Profitability Forecast'}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {currentLang 
                          ? 'പ്രതീക്ഷിക്കുന്ന വരുമാനവും നിക്ഷേപവും കണക്കാക്കുന്നു'
                          : 'Calculates expected income, investment and ROI'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      size="lg" 
                      className="px-8 py-6 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => setShowCropRecommendation(true)}
                    >
                      <Search className="mr-2 h-5 w-5" />
                      {currentLang ? 'ശുപാർശ ആരംഭിക്കുക' : 'Start Crop Recommendation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Crop recommendation form and results
              <div className="space-y-4">
                {/* Beginner Wizard Step 0 */}
                {recommendationStep === 0 && (
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2 text-yellow-800">
                        <GraduationCap className="h-6 w-6" />
                        {currentLang ? 'കൃഷി പ്രാഥമിക വിവരങ്ങൾ' : 'Farming Basics Wizard'}
                      </CardTitle>
                      <CardDescription className="text-yellow-700">
                        {currentLang 
                          ? 'ഇവ സിമ്പിൾ ചോദ്യങ്ങളാണ്. നിങ്ങളുടെ അറിവനുസരിച്ച് ഉത്തരം നൽകുക'
                          : 'Simple questions to understand your farming situation. Answer based on what you know'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6">
                        {/* Simple Questions for Beginners */}
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded-lg border border-yellow-200">
                            <Label className="text-base font-semibold text-gray-800 mb-3 block">
                              {currentLang ? '🏡 നിങ്ങളുടെ കൃഷിഭൂമി എത്ര വലുതാണ്?' : '🏡 How big is your farming area?'}
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {[
                                {value: 0.25, label: currentLang ? 'ചെറുത് (1/4 ഏക്കർ)' : 'Small (1/4 acre)'},
                                {value: 0.5, label: currentLang ? 'ഇടത്തരം (1/2 ഏക്കർ)' : 'Medium (1/2 acre)'},
                                {value: 1, label: currentLang ? 'വലുത് (1 ഏക്കർ)' : 'Large (1 acre)'},
                                {value: 2, label: currentLang ? 'വളരെ വലുത് (2+ ഏക്കർ)' : 'Very Large (2+ acres)'}
                              ].map((option) => (
                                <Button
                                  key={option.value}
                                  variant={farmerInput.farmSize === option.value ? "default" : "outline"}
                                  className={`text-xs p-3 h-auto ${farmerInput.farmSize === option.value ? 'bg-yellow-600 text-white' : 'text-yellow-700 border-yellow-300'}`}
                                  onClick={() => setFarmerInput({...farmerInput, farmSize: option.value})}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border border-yellow-200">
                            <Label className="text-base font-semibold text-gray-800 mb-3 block">
                              {currentLang ? '💰 നിങ്ങൾക്ക് കൃഷിക്ക് എത്ര പണം ചിലവാക്കാം?' : '💰 How much can you invest in farming?'}
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {[
                                {value: 'low' as const, label: currentLang ? '₹5,000 - ₹15,000' : '₹5,000 - ₹15,000'},
                                {value: 'medium' as const, label: currentLang ? '₹15,000 - ₹50,000' : '₹15,000 - ₹50,000'},
                                {value: 'high' as const, label: currentLang ? '₹50,000+' : '₹50,000+'}
                              ].map((option) => (
                                <Button
                                  key={option.value}
                                  variant={farmerInput.budget === option.value ? "default" : "outline"}
                                  className={`text-xs p-3 h-auto ${farmerInput.budget === option.value ? 'bg-yellow-600 text-white' : 'text-yellow-700 border-yellow-300'}`}
                                  onClick={() => setFarmerInput({...farmerInput, budget: option.value})}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border border-yellow-200">
                            <Label className="text-base font-semibold text-gray-800 mb-3 block">
                              {currentLang ? '💧 വെള്ളം എങ്ങനെ ലഭിക്കുന്നു?' : '💧 How do you get water for crops?'}
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                              {[
                                {value: 'scarce' as const, label: currentLang ? '🌧️ മഴ മാത്രം' : '🌧️ Rain only'},
                                {value: 'moderate' as const, label: currentLang ? '🚰 കിണർ/ബോർവെൽ' : '🚰 Well/Borewell'},
                                {value: 'abundant' as const, label: currentLang ? '🏞️ കനാൽ/നദി' : '🏞️ Canal/River'}
                              ].map((option) => (
                                <Button
                                  key={option.value}
                                  variant={farmerInput.waterAvailability === option.value ? "default" : "outline"}
                                  className={`text-xs p-3 h-auto ${farmerInput.waterAvailability === option.value ? 'bg-yellow-600 text-white' : 'text-yellow-700 border-yellow-300'}`}
                                  onClick={() => setFarmerInput({...farmerInput, waterAvailability: option.value})}
                                >
                                  {option.label}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border border-yellow-200">
                            <Label className="text-base font-semibold text-gray-800 mb-3 block">
                              {currentLang ? '🎯 നിങ്ങൾ എന്തിനാണ് കൃഷി ചെയ്യുന്നത്?' : '🎯 What\'s your main farming goal?'}
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {[
                                {label: currentLang ? '🏠 വീട്ടിലെ ഉപയോഗത്തിന്' : '🏠 For home consumption'},
                                {label: currentLang ? '💰 വിറ്റു പണം ഉണ്ടാക്കാൻ' : '💰 To sell and make money'},
                                {label: currentLang ? '🌱 പഠിക്കാൻ/പരീക്ഷിക്കാൻ' : '🌱 To learn and experiment'}
                              ].map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 hover:bg-yellow-50 rounded">
                                  <Checkbox 
                                    id={`goal-${index}`}
                                    className="text-yellow-600"
                                  />
                                  <label htmlFor={`goal-${index}`} className="text-sm text-gray-700 cursor-pointer">
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-800">
                              {currentLang ? 'സഹായകരമായ ടിപ്പ്' : 'Helpful Tip'}
                            </span>
                          </div>
                          <p className="text-sm text-green-700">
                            {currentLang 
                              ? 'ആദ്യമായി കൃഷി ചെയ്യുന്നവർക്ക് ചെറിയ വിസ്തീർണ്ണത്തിൽ ആരംഭിക്കാം. വെണ്ടയ്ക്ക, തക്കാളി, ചീര പോലുള്ള എളുപ്പത്തിൽ വളരുന്ന വിളകൾ തിരഞ്ഞെടുക്കുക.'
                              : 'For beginners, start with a small area. Choose easy-to-grow crops like okra, tomato, and spinach.'
                            }
                          </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={resetRecommendation}
                            className="border-gray-300"
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {currentLang ? 'മടങ്ങുക' : 'Back'}
                          </Button>
                          <Button 
                            onClick={() => {
                              // Set some basic defaults for beginners
                              setFarmerInput({
                                ...farmerInput,
                                location: {...farmerInput.location, district: selectedLocation},
                                experience: 'beginner',
                                season: 'winter',
                                soilType: 'loamy',
                                marketAccess: 'direct'
                              });
                              setRecommendationStep(1);
                            }}
                            disabled={!farmerInput.farmSize || !farmerInput.budget || !farmerInput.waterAvailability}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            {currentLang ? 'അടുത്ത ഘട്ടം' : 'Next Step'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {recommendationStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5" />
                        {currentLang ? 'കൃഷിഭൂമി വിവരങ്ങൾ' : 'Farm Information'}
                      </CardTitle>
                      <CardDescription>
                        {currentLang 
                          ? 'നിങ്ങളുടെ കൃഷിഭൂമിയെക്കുറിച്ചുള്ള അടിസ്ഥാന വിവരങ്ങൾ പങ്കിടുക'
                          : 'Share basic information about your farm and conditions'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {currentLang ? 'കൃഷിഭൂമിയുടെ വലുപ്പം (ഏക്കർ)' : 'Farm Size (Acres)'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input 
                            type="number" 
                            placeholder="2.5"
                            value={farmerInput.farmSize || ''}
                            onChange={(e) => setFarmerInput({...farmerInput, farmSize: parseFloat(e.target.value)})}
                            className={!farmerInput.farmSize ? 'border-red-300 focus:border-red-500' : ''}
                            required
                          />
                          {!farmerInput.farmSize && (
                            <p className="text-xs text-red-600">
                              {currentLang ? 'കൃഷിഭൂമിയുടെ വലുപ്പം ആവശ്യമാണ്' : 'Farm size is required for crop recommendations'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {currentLang ? 'ജില്ല' : 'District'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            onValueChange={(value) => setFarmerInput({...farmerInput, location: {...farmerInput.location, district: value}})}
                            required
                          >
                            <SelectTrigger className={!farmerInput.location?.district ? 'border-red-300 focus:border-red-500' : ''}>
                              <SelectValue placeholder={currentLang ? 'ജില്ല തിരഞ്ഞെടുക്കുക' : 'Select District'} />
                            </SelectTrigger>
                            <SelectContent>
                              {keralasDistricts.map(district => (
                                <SelectItem key={district} value={district}>{district}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!farmerInput.location?.district && (
                            <p className="text-xs text-red-600">
                              {currentLang ? 'ജില്ല തിരഞ്ഞെടുക്കുക കാലാവസ്ഥയ്ക്കനുസരിച്ചുള്ള ശുപാർശകൾക്കായി' : 'District is required for climate-based recommendations'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {currentLang ? 'മണ്ണിന്റെ തരം' : 'Soil Type'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            onValueChange={(value) => setFarmerInput({...farmerInput, soilType: value as any})}
                            required
                          >
                            <SelectTrigger className={!farmerInput.soilType ? 'border-red-300 focus:border-red-500' : ''}>
                              <SelectValue placeholder={currentLang ? 'മണ്ണിന്റെ തരം' : 'Select Soil Type'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="clay">{currentLang ? 'കളിമണ്ണ്' : 'Clay'}</SelectItem>
                              <SelectItem value="sandy">{currentLang ? 'മണൽ മണ്ണ്' : 'Sandy'}</SelectItem>
                              <SelectItem value="loamy">{currentLang ? 'എക്കൽ മണ്ണ്' : 'Loamy'}</SelectItem>
                              <SelectItem value="laterite">{currentLang ? 'ലാറ്ററൈറ്റ്' : 'Laterite'}</SelectItem>
                              <SelectItem value="alluvial">{currentLang ? 'വളക്കൂറുള്ള മണ്ണ്' : 'Alluvial'}</SelectItem>
                            </SelectContent>
                          </Select>
                          {!farmerInput.soilType && (
                            <p className="text-xs text-red-600">
                              {currentLang ? 'മണ്ണിന്റെ തരം ശരിയായ വിള തിരഞ്ഞെടുപ്പിന് ആവശ്യമാണ്' : 'Soil type is essential for proper crop selection'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {currentLang ? 'ജലസൗകര്യം' : 'Water Availability'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            onValueChange={(value) => setFarmerInput({...farmerInput, waterAvailability: value as any})}
                            required
                          >
                            <SelectTrigger className={!farmerInput.waterAvailability ? 'border-red-300 focus:border-red-500' : ''}>
                              <SelectValue placeholder={currentLang ? 'ജലസൗകര്യം' : 'Water Availability'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="abundant">{currentLang ? 'സമൃദ്ധം' : 'Abundant'}</SelectItem>
                              <SelectItem value="moderate">{currentLang ? 'മിതമായത്' : 'Moderate'}</SelectItem>
                              <SelectItem value="scarce">{currentLang ? 'കുറവ്' : 'Scarce'}</SelectItem>
                            </SelectContent>
                          </Select>
                          {!farmerInput.waterAvailability && (
                            <p className="text-xs text-red-600">
                              {currentLang ? 'ജലസൗകര്യം വിള തിരഞ്ഞെടുപ്പിന് പ്രധാനമാണ്' : 'Water availability is crucial for crop recommendations'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Soil Condition Assessment */}
                      <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                          <TestTube className="h-5 w-5" />
                          {currentLang ? 'മണ്ണിന്റെ അവസ്ഥ വിലയിരുത്തൽ' : 'Soil Condition Assessment'}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {currentLang 
                            ? 'pH ടെസ്റ്റ് ഇല്ലെങ്കിലും ഈ സൂചകങ്ങൾ കൊണ്ട് മണ്ണിന്റെ അവസ്ഥ അറിയാം'
                            : "Don't know pH? These simple indicators help us assess your soil condition"
                          }
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{currentLang ? 'ചെടികളുടെ വളർച്ച' : 'Plant Growth'}</Label>
                            <Select onValueChange={(value) => setFarmerInput({
                              ...farmerInput, 
                              soilIndicators: {...farmerInput.soilIndicators, plantGrowth: value as any}
                            })}>
                              <SelectTrigger>
                                <SelectValue placeholder={currentLang ? 'തിരഞ്ഞെടുക്കുക' : 'Select'} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="poor">{currentLang ? 'മോശം വളർച്ച' : 'Poor growth'}</SelectItem>
                                <SelectItem value="average">{currentLang ? 'ശരാശരി വളർച്ച' : 'Average growth'}</SelectItem>
                                <SelectItem value="good">{currentLang ? 'നല്ല വളർച്ച' : 'Good growth'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>{currentLang ? 'മണ്ണിന്റെ നിറം' : 'Soil Color'}</Label>
                            <Select onValueChange={(value) => setFarmerInput({
                              ...farmerInput, 
                              soilIndicators: {...farmerInput.soilIndicators, soilColor: value as any}
                            })}>
                              <SelectTrigger>
                                <SelectValue placeholder={currentLang ? 'നിറം തിരഞ്ഞെടുക്കുക' : 'Select color'} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dark_black">{currentLang ? 'കടും കറുപ്പ്' : 'Dark black'}</SelectItem>
                                <SelectItem value="brown">{currentLang ? 'തവിട്ട്' : 'Brown'}</SelectItem>
                                <SelectItem value="red">{currentLang ? 'ചുവപ്പ്' : 'Red'}</SelectItem>
                                <SelectItem value="yellow">{currentLang ? 'മഞ്ഞ' : 'Yellow'}</SelectItem>
                                <SelectItem value="white_patches">{currentLang ? 'വെള്ള പാടുകൾ' : 'White patches'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>{currentLang ? 'വെള്ളം ഊറൽ' : 'Water Drainage'}</Label>
                            <Select onValueChange={(value) => setFarmerInput({
                              ...farmerInput, 
                              soilIndicators: {...farmerInput.soilIndicators, waterDrainage: value as any}
                            })}>
                              <SelectTrigger>
                                <SelectValue placeholder={currentLang ? 'ഊറൽ വേഗത' : 'Drainage speed'} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="very_slow">{currentLang ? 'വളരെ മന്ദം' : 'Very slow'}</SelectItem>
                                <SelectItem value="slow">{currentLang ? 'മന്ദം' : 'Slow'}</SelectItem>
                                <SelectItem value="good">{currentLang ? 'നല്ലത്' : 'Good'}</SelectItem>
                                <SelectItem value="too_fast">{currentLang ? 'വളരെ വേഗം' : 'Too fast'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>{currentLang ? 'സാധാരണ കളകൾ' : 'Common Weeds'}</Label>
                            <Input 
                              placeholder={currentLang ? 'കുളവാഴ, പുല്ല്...' : 'Grass types, weeds...'} 
                              onChange={(e) => setFarmerInput({
                                ...farmerInput, 
                                soilIndicators: {
                                  ...farmerInput.soilIndicators, 
                                  commonWeeds: e.target.value.split(',').map(w => w.trim())
                                }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Required Fields Summary */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-yellow-800">
                              {currentLang ? 'ആവശ്യമായ വിവരങ്ങൾ' : 'Required Information'}
                            </h4>
                            <div className="mt-2 text-xs text-yellow-700">
                              <div className="grid grid-cols-2 gap-2">
                                <div className={`flex items-center gap-1 ${farmerInput.farmSize ? 'text-green-700' : 'text-red-700'}`}>
                                  {farmerInput.farmSize ? '✓' : '✗'} {currentLang ? 'കൃഷിഭൂമി വലുപ്പം' : 'Farm Size'}
                                </div>
                                <div className={`flex items-center gap-1 ${farmerInput.location?.district ? 'text-green-700' : 'text-red-700'}`}>
                                  {farmerInput.location?.district ? '✓' : '✗'} {currentLang ? 'ജില്ല' : 'District'}
                                </div>
                                <div className={`flex items-center gap-1 ${farmerInput.soilType ? 'text-green-700' : 'text-red-700'}`}>
                                  {farmerInput.soilType ? '✓' : '✗'} {currentLang ? 'മണ്ണിന്റെ തരം' : 'Soil Type'}
                                </div>
                                <div className={`flex items-center gap-1 ${farmerInput.waterAvailability ? 'text-green-700' : 'text-red-700'}`}>
                                  {farmerInput.waterAvailability ? '✓' : '✗'} {currentLang ? 'ജലസൗകര്യം' : 'Water Availability'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={resetRecommendation}>
                          {currentLang ? 'റദ്ദാക്കുക' : 'Cancel'}
                        </Button>
                        <Button 
                          onClick={() => setRecommendationStep(2)}
                          disabled={!farmerInput.farmSize || !farmerInput.location?.district || !farmerInput.soilType || !farmerInput.waterAvailability}
                          className={(!farmerInput.farmSize || !farmerInput.location?.district || !farmerInput.soilType || !farmerInput.waterAvailability) 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                          }
                        >
                          {currentLang ? 'അടുത്തത്' : 'Next'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {recommendationStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {currentLang ? 'കാർഷിക വിവരങ്ങൾ' : 'Farming Details'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {currentLang ? 'കൃഷി അനുഭവം' : 'Farming Experience'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            onValueChange={(value) => setFarmerInput({...farmerInput, experience: value as any})}
                            required
                          >
                            <SelectTrigger className={!farmerInput.experience ? 'border-red-300 focus:border-red-500' : ''}>
                              <SelectValue placeholder={currentLang ? 'അനുഭവം തിരഞ്ഞെടുക്കുക' : 'Select Experience'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">{currentLang ? 'തുടക്കക്കാരൻ' : 'Beginner (0-2 years)'}</SelectItem>
                              <SelectItem value="intermediate">{currentLang ? 'ഇടത്തരം' : 'Intermediate (3-10 years)'}</SelectItem>
                              <SelectItem value="expert">{currentLang ? 'വിദഗ്ധൻ' : 'Expert (10+ years)'}</SelectItem>
                            </SelectContent>
                          </Select>
                          {!farmerInput.experience && (
                            <p className="text-xs text-red-600">
                              {currentLang ? 'അനുഭവ നില ശുപാർശകൾക്ക് സഹായിക്കും' : 'Experience level helps customize recommendations'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {currentLang ? 'ബജറ്റ്' : 'Budget Range'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            onValueChange={(value) => setFarmerInput({...farmerInput, budget: value as any})}
                            required
                          >
                            <SelectTrigger className={!farmerInput.budget ? 'border-red-300 focus:border-red-500' : ''}>
                              <SelectValue placeholder={currentLang ? 'ബജറ്റ് തിരഞ്ഞെടുക്കുക' : 'Select Budget'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">{currentLang ? 'കുറഞ്ഞത് (₹30,000 വരെ)' : 'Low (Up to ₹30,000)'}</SelectItem>
                              <SelectItem value="medium">{currentLang ? 'ഇടത്തരം (₹30,000-₹60,000)' : 'Medium (₹30,000-₹60,000)'}</SelectItem>
                              <SelectItem value="high">{currentLang ? 'കൂടുതൽ (₹60,000+)' : 'High (₹60,000+)'}</SelectItem>
                            </SelectContent>
                          </Select>
                          {!farmerInput.budget && (
                            <p className="text-xs text-red-600">
                              {currentLang ? 'ബജറ്റ് വിള തിരഞ്ഞെടുപ്പിന് പ്രധാനമാണ്' : 'Budget is essential for crop profitability analysis'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {currentLang ? 'സീസൺ' : 'Planting Season'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            onValueChange={(value) => setFarmerInput({...farmerInput, season: value as any})}
                            required
                          >
                            <SelectTrigger className={!farmerInput.season ? 'border-red-300 focus:border-red-500' : ''}>
                              <SelectValue placeholder={currentLang ? 'സീസൺ തിരഞ്ഞെടുക്കുക' : 'Select Season'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="summer">{currentLang ? 'വേനൽക്കാലം' : 'Summer'}</SelectItem>
                              <SelectItem value="monsoon">{currentLang ? 'മൺസൂൺ' : 'Monsoon'}</SelectItem>
                              <SelectItem value="winter">
                                {currentLang ? 'ശീതകാലം (സെപ്റ്റംബർ ഇപ്പോൾ അനുയോജ്യം!)' : 'Winter (September ideal now!)'}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-green-600 font-medium">
                            {currentLang 
                              ? '💡 സെപ്റ്റംബർ മാസം ശീതകാല വിളകൾക്ക് മികച്ച സമയമാണ്!'
                              : '💡 September is perfect for winter crops - post-monsoon planting!'
                            }
                          </p>
                          {!farmerInput.season && (
                            <p className="text-xs text-red-600">
                              {currentLang ? 'സീസൺ വിള ശുപാർശകൾക്ക് അത്യാവശ്യമാണ്' : 'Season is critical for crop timing recommendations'}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            {currentLang ? 'വിപണി പ്രവേശനം' : 'Market Access'}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Select 
                            onValueChange={(value) => setFarmerInput({...farmerInput, marketAccess: value as any})}
                            required
                          >
                            <SelectTrigger className={!farmerInput.marketAccess ? 'border-red-300 focus:border-red-500' : ''}>
                              <SelectValue placeholder={currentLang ? 'വിപണി പ്രവേശനം' : 'Market Access'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="direct">{currentLang ? 'നേരിട്ട്' : 'Direct to Consumer'}</SelectItem>
                              <SelectItem value="middleman">{currentLang ? 'ഇടനിലക്കാരൻ' : 'Through Middleman'}</SelectItem>
                              <SelectItem value="cooperative">{currentLang ? 'സഹകരണസംഘം' : 'Cooperative Society'}</SelectItem>
                              <SelectItem value="online">{currentLang ? 'ഓൺലൈൻ' : 'Online Platform'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="organic"
                            checked={farmerInput.organicPreference || false}
                            onCheckedChange={(checked) => setFarmerInput({...farmerInput, organicPreference: checked as boolean})}
                          />
                          <Label htmlFor="organic">
                            {currentLang ? 'ജൈവ കൃഷിയാണ് താൽപ്പര്യം' : 'Prefer organic farming'}
                          </Label>
                        </div>
                      </div>

                      {/* Final Validation Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-800">
                              {currentLang ? 'വിള ശുപാർശകൾക്കായി ആവശ്യമായ വിവരങ്ങൾ' : 'Information Status for Crop Recommendations'}
                            </h4>
                            <div className="mt-2 text-xs">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <div className={`flex items-center gap-1 ${farmerInput.experience ? 'text-green-700' : 'text-red-700'}`}>
                                  {farmerInput.experience ? '✓' : '✗'} {currentLang ? 'അനുഭവം' : 'Experience'}
                                </div>
                                <div className={`flex items-center gap-1 ${farmerInput.budget ? 'text-green-700' : 'text-red-700'}`}>
                                  {farmerInput.budget ? '✓' : '✗'} {currentLang ? 'ബജറ്റ്' : 'Budget'}
                                </div>
                                <div className={`flex items-center gap-1 ${farmerInput.season ? 'text-green-700' : 'text-red-700'}`}>
                                  {farmerInput.season ? '✓' : '✗'} {currentLang ? 'സീസൺ' : 'Season'}
                                </div>
                                <div className={`flex items-center gap-1 ${farmerInput.marketAccess ? 'text-green-700' : 'text-red-700'}`}>
                                  {farmerInput.marketAccess ? '✓' : '✗'} {currentLang ? 'വിപണി' : 'Market'}
                                </div>
                              </div>
                              {!validateFarmerInput() && (
                                <p className="mt-2 text-red-600 text-xs">
                                  {currentLang 
                                    ? 'ശുപാർശകൾ സൃഷ്ടിക്കാൻ മുകളിലുള്ള എല്ലാ ആവശ്യമായ ഫീൽഡുകളും പൂരിപ്പിക്കുക'
                                    : 'Please fill all required fields above to generate recommendations'
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setRecommendationStep(1)}>
                          <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                          {currentLang ? 'മുമ്പത്തേത്' : 'Previous'}
                        </Button>
                        <Button 
                          onClick={handleCropRecommendation}
                          disabled={!validateFarmerInput() || isLoading}
                          className={`${!validateFarmerInput() || isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                          }`}
                        >
                          {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                          {currentLang ? 'ശുപാർശകൾ സൃഷ്ടിക്കുക' : 'Generate Recommendations'}
                          <Zap className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {recommendationStep === 3 && cropRecommendations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-green-800">
                        {currentLang ? 'നിങ്ങൾക്കുള്ള വിള ശുപാർശകൾ' : 'Crop Recommendations for You'}
                      </h2>
                      <Button variant="outline" onClick={resetRecommendation}>
                        {currentLang ? 'പുതിയ ശുപാർശ' : 'New Recommendation'}
                      </Button>
                    </div>

                    <div className="grid gap-6">
                      {cropRecommendations.slice(0, 5).map((rec, index) => (
                        <Card key={index} className={`${index === 0 ? 'ring-2 ring-green-500 bg-gradient-to-r from-green-50 to-blue-50' : ''}`}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {index === 0 && <Star className="h-6 w-6 text-yellow-500 fill-current" />}
                                <div>
                                  <CardTitle className="text-xl">
                                    {currentLang ? rec.malayalamName : rec.cropName}
                                    {index === 0 && (
                                      <Badge className="ml-2 bg-green-600">
                                        {currentLang ? 'ഏറ്റവും നല്ലത്' : 'Best Match'}
                                      </Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="text-sm italic">
                                    {rec.scientificName}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge variant={rec.suitabilityScore > 80 ? "default" : rec.suitabilityScore > 60 ? "secondary" : "outline"} className="text-lg px-3 py-1">
                                {rec.suitabilityScore}% {currentLang ? 'അനുയോജ്യത' : 'Match'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-4 gap-4">
                              <div className="text-center p-3 bg-green-100 rounded-lg">
                                <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
                                <p className="text-xs text-gray-600">{currentLang ? 'പ്രതീക്ഷിക്കുന്ന വരുമാനം' : 'Expected Income'}</p>
                                <p className="font-bold text-green-800">₹{rec.expectedIncome.toLocaleString()}</p>
                              </div>
                              <div className="text-center p-3 bg-blue-100 rounded-lg">
                                <IndianRupee className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                                <p className="text-xs text-gray-600">{currentLang ? 'നിക്ഷേപം' : 'Investment'}</p>
                                <p className="font-bold text-blue-800">₹{rec.investmentRequired.toLocaleString()}</p>
                              </div>
                              <div className="text-center p-3 bg-yellow-100 rounded-lg">
                                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                                <p className="text-xs text-gray-600">{currentLang ? 'ROI' : 'ROI'}</p>
                                <p className="font-bold text-yellow-800">{rec.roi}%</p>
                              </div>
                              <div className="text-center p-3 bg-purple-100 rounded-lg">
                                <Clock className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                                <p className="text-xs text-gray-600">{currentLang ? 'കാലാവധി' : 'Duration'}</p>
                                <p className="font-bold text-purple-800">{Math.round(rec.growthDuration/30)} {currentLang ? 'മാസം' : 'months'}</p>
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  {currentLang ? 'ഗുണങ്ങൾ' : 'Advantages'}
                                </h4>
                                <ul className="text-sm space-y-1">
                                  {(currentLang ? rec.malayalamAdvantages : rec.advantages).slice(0, 3).map((advantage, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      {advantage}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                  <Shield className="h-4 w-4" />
                                  {currentLang ? 'അപകട ഘടകങ്ങൾ' : 'Risk Factors'}
                                </h4>
                                <ul className="text-sm space-y-1">
                                  {(currentLang ? rec.malayalamRiskFactors : rec.riskFactors).slice(0, 3).map((risk, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                      {risk}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                {currentLang ? 'ഏറ്റവും നല്ല നടൽ സമയം' : 'Best Planting Time'}
                              </h4>
                              <p className="text-sm text-gray-700">
                                {currentLang ? rec.malayalamBestPlantingTime : rec.bestPlantingTime}
                              </p>
                            </div>

                            {/* Soil pH Recommendations */}
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <TestTube className="h-4 w-4 text-yellow-600" />
                                {currentLang ? 'മണ്ണിന്റെ pH ശുപാർശകൾ' : 'Soil pH Recommendations'}
                              </h4>
                              <div className="space-y-2">
                                {(() => {
                                  const soilCondition = farmerInput.soilCondition === 'unknown' || !farmerInput.soilCondition
                                    ? cropRecommendationEngine.assessSoilCondition(farmerInput.soilIndicators || {
                                        plantGrowth: 'average',
                                        soilColor: 'brown',
                                        waterDrainage: 'good',
                                        commonWeeds: []
                                      })
                                    : farmerInput.soilCondition;
                                  
                                  const phRecommendations = cropRecommendationEngine.generateSoilPHRecommendations(soilCondition, currentLang);
                                  
                                  return (
                                    <div>
                                      <p className="text-sm font-medium text-yellow-800 mb-2">
                                        {currentLang ? `മണ്ണിന്റെ അവസ്ഥ: ${
                                          soilCondition === 'acidic' ? 'അമ്ലീയം' :
                                          soilCondition === 'alkaline' ? 'ക്ഷാരീയം' :
                                          soilCondition === 'neutral' ? 'നിഷ്പക്ഷം' :
                                          soilCondition === 'very_acidic' ? 'വളരെ അമ്ലീയം' :
                                          'വളരെ ക്ഷാരീയം'
                                        }` : `Soil Condition: ${soilCondition.replace('_', ' ')}`}
                                      </p>
                                      <ul className="text-sm space-y-1">
                                        {phRecommendations.slice(0, 2).map((recommendation, i) => (
                                          <li key={i} className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
                                            <span className="text-yellow-700">{recommendation}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>

                            {rec.supportingSchemes.length > 0 && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Award className="h-4 w-4 text-blue-600" />
                                  {currentLang ? 'പിന്തുണാ പദ്ധതികൾ' : 'Supporting Schemes'}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {(currentLang ? rec.malayalamSupportingSchemes : rec.supportingSchemes).map((scheme, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {scheme}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Crops Tab */}
          <TabsContent value="crops" className="space-y-4">
            <div className="grid gap-4">
              {cropData.map((crop, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        {crop.name}
                      </CardTitle>
                      <Badge variant={crop.health > 80 ? "default" : crop.health > 60 ? "secondary" : "destructive"}>
                        {currentLang ? 'ആരോഗ്യം' : 'Health'}: {crop.health}%
                      </Badge>
                    </div>
                    <CardDescription>
                      {currentLang ? 'ഘട്ടം' : 'Stage'}: {crop.stage} | 
                      {crop.daysToHarvest > 0 
                        ? ` ${crop.daysToHarvest} ${currentLang ? 'ദിവസം ബാക്കി' : 'days to harvest'}`
                        : ` ${currentLang ? 'വിളവെടുപ്പ് തയ്യാർ' : 'Ready for harvest'}`
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{currentLang ? 'ആരോഗ്യ നിലവാരം' : 'Health Status'}</span>
                          <span>{crop.health}%</span>
                        </div>
                        <Progress value={crop.health} className="h-2" />
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">
                          <strong>{currentLang ? 'അടുത്ത പ്രവർത്തനം:' : 'Next Action:'}</strong> {crop.nextAction}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Enhanced Weather Tab */}
          <TabsContent value="weather" className="space-y-6">
            {/* Current Weather */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">{currentLang ? 'താപനില' : 'Temperature'}</p>
                      <p className="text-3xl font-bold text-orange-600">{weatherData.temperature}°C</p>
                      <p className="text-sm text-gray-500">{currentLang ? 'അനുഭവപ്പെടുന്നത് 32°C' : 'Feels like 32°C'}</p>
                    </div>
                    <Thermometer className="h-12 w-12 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">{currentLang ? 'ആർദ്രത' : 'Humidity'}</p>
                      <p className="text-3xl font-bold text-blue-600">{weatherData.humidity}%</p>
                      <p className="text-sm text-gray-500">{currentLang ? 'ഉയർന്ന ആർദ്രത' : 'High humidity'}</p>
                    </div>
                    <Droplets className="h-12 w-12 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">{currentLang ? 'മഴ (24h)' : 'Rainfall (24h)'}</p>
                      <p className="text-3xl font-bold text-green-600">{weatherData.rainfall}mm</p>
                      <p className="text-sm text-gray-500">{currentLang ? 'ഇന്നലെ 12mm' : 'Yesterday 12mm'}</p>
                    </div>
                    <Cloud className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">{currentLang ? 'കാറ്റിന്റെ വേഗത' : 'Wind Speed'}</p>
                      <p className="text-3xl font-bold text-gray-600">{weatherData.windSpeed} km/h</p>
                      <p className="text-sm text-gray-500">{currentLang ? 'വടക്ക് പടി��്ഞാറ്' : 'NW Direction'}</p>
                    </div>
                    <Wind className="h-12 w-12 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weather Alerts */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Bell className="h-5 w-5" />
                  {currentLang ? 'കാലാവസ്ഥാ മുന്നറിയിപ്പ്' : 'Weather Alerts'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <strong>{currentLang ? 'കനത്ത മഴ മുന്നറിയിപ്പ്:' : 'Heavy Rain Alert:'}</strong>
                      {currentLang 
                        ? ' അടുത്ത 48 മണിക്കൂറിനുള്ളിൽ 50-100mm മഴയ്ക്ക് സാധ്യത. വിള സംരക്ഷണ നടപടികൾ സ്വീകരിക്കുക.'
                        : ' Expected 50-100mm rainfall in next 48 hours. Take crop protection measures.'
                      }
                    </AlertDescription>
                  </Alert>
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>{currentLang ? 'കൃഷി ശുപാർശ:' : 'Farming Recommendation:'}</strong>
                      {currentLang 
                        ? ' ഉയർന്ന ആർദ്രതയും മഴയും കാരണം ഫംഗസ് രോഗങ്ങൾക്ക് സാധ്യത. പ്രതിരോധ സ്പ്രേ ചെയ്യുക.'
                        : ' High humidity and rainfall may cause fungal diseases. Apply preventive sprays.'
                      }
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            {/* 7-Day Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {currentLang ? '7 ദിവസത്തെ പ്രവചനം' : '7-Day Weather Forecast'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {[
                    {day: 'Today', temp: 28, rain: 15, icon: '🌦️'},
                    {day: 'Tomorrow', temp: 30, rain: 8, icon: '⛅'},
                    {day: 'Wed', temp: 26, rain: 25, icon: '🌧️'},
                    {day: 'Thu', temp: 29, rain: 5, icon: '☀️'},
                    {day: 'Fri', temp: 31, rain: 0, icon: '☀️'},
                    {day: 'Sat', temp: 27, rain: 12, icon: '🌤️'},
                    {day: 'Sun', temp: 28, rain: 18, icon: '🌦️'}
                  ].map((forecast, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-600 mb-2">{currentLang && forecast.day === 'Today' ? 'ഇന്ന്' : 
                        currentLang && forecast.day === 'Tomorrow' ? 'നാളെ' : forecast.day}</p>
                      <div className="text-3xl mb-2">{forecast.icon}</div>
                      <p className="text-lg font-bold text-gray-800">{forecast.temp}°C</p>
                      <p className="text-sm text-blue-600">{forecast.rain}mm</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{currentLang ? '7 ദിവസത്തെ പ്രവചനം' : '7-Day Forecast'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium">{day}</p>
                      <Sun className="h-6 w-6 mx-auto my-2 text-yellow-500" />
                      <p className="text-xs">{25 + index}°C</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-6">
            {/* Market Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'ഇന്നത്തെ ഏറ്റവും ഉയർന്ന വില' : 'Today\'s Highest Price'}</p>
                      <p className="text-xl font-bold text-green-600">{currentLang ? 'നെൽ - ₹2,850' : 'Rice - ₹2,850'}</p>
                      <p className="text-xs text-green-500">+8.5% {currentLang ? 'ഇന്നലെയെ അപേക്ഷിച്ച്' : 'vs yesterday'}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'ശരാശരി വില' : 'Average Market Price'}</p>
                      <p className="text-xl font-bold text-blue-600">₹2,245</p>
                      <p className="text-xs text-blue-500">{currentLang ? 'എല്ലാ വിളകളുടെയും' : 'across all crops'}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'വിൽപ്പന ശുപാർശ' : 'Selling Recommendation'}</p>
                      <p className="text-xl font-bold text-orange-600">{currentLang ? 'ഉടൻ വിൽക്കുക' : 'Sell Now'}</p>
                      <p className="text-xs text-orange-500">{currentLang ? 'നല്ല വില ലഭിക്കും' : 'favorable prices'}</p>
                    </div>
                    <Bell className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Alerts & Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    {currentLang ? 'വില അലേർട്ടുകൾ' : 'Price Alerts'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="text-sm font-medium text-green-800">{currentLang ? 'നെൽ വില ഉയർന്നു!' : 'Rice Price Alert!'}</p>
                          <p className="text-xs text-green-600">{currentLang ? '₹2,850/ക്വിന്റൽ - വിൽക്കാൻ നല്ല സമയം' : '₹2,850/quintal - Good time to sell'}</p>
                        </div>
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="text-sm font-medium text-orange-800">{currentLang ? 'തക്കാളി വില കുറഞ്ഞു' : 'Tomato Price Drop'}</p>
                          <p className="text-xs text-orange-600">{currentLang ? '₹1,200/ക്വിന്റൽ - കൂടുതൽ കാത്തിരിക്കുക' : '₹1,200/quintal - Wait for better rates'}</p>
                        </div>
                      </div>
                      <TrendingDown className="h-5 w-5 text-orange-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">{currentLang ? 'വെളുത്തുള്ളി ഡിമാൻ്റ് കൂടുതൽ' : 'High Demand for Onions'}</p>
                          <p className="text-xs text-blue-600">{currentLang ? '₹3,500/ക്വിന്റൽ - മികച്ച വില' : '₹3,500/quintal - Excellent price'}</p>
                        </div>
                      </div>
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {currentLang ? 'വില ട്രെൻഡ് (7 ദിവസം)' : 'Price Trends (7 Days)'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Rice', 'Wheat', 'Onions', 'Tomatoes'].map((crop, index) => {
                      const trends = [
                        { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [2650, 2700, 2720, 2780, 2800, 2830, 2850] },
                        { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [2200, 2180, 2150, 2170, 2190, 2200, 2180] },
                        { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [3200, 3300, 3400, 3450, 3480, 3500, 3520] },
                        { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [1400, 1350, 1300, 1250, 1200, 1180, 1200] }
                      ];
                      const trendColor = index === 0 ? 'green' : index === 1 ? 'blue' : index === 2 ? 'purple' : 'red';
                      
                      return (
                        <div key={crop} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{currentLang && crop === 'Rice' ? 'നെൽ' : 
                              currentLang && crop === 'Wheat' ? 'ഗോതമ്പ്' : 
                              currentLang && crop === 'Onions' ? 'വെളുത്തുള്ളി' : 
                              currentLang && crop === 'Tomatoes' ? 'തക്കാളി' : crop}</span>
                            <span className="text-sm font-bold">₹{trends[index].values[6].toLocaleString()}</span>
                          </div>
                          <div className="flex items-end h-8 space-x-1">
                            {trends[index].values.map((value, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center">
                                <div 
                                  className={`w-full bg-${trendColor}-500 rounded-t`} 
                                  style={{height: `${(value / Math.max(...trends[index].values)) * 100}%`}}
                                ></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Market Prices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    {currentLang ? 'ഇന്നത്തെ വിപണി വില' : 'Today\'s Market Prices'}
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {currentLang ? 'ഡൗൺലോഡ്' : 'Download'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {marketPrices.map((item, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{item.crop}</h3>
                              <p className="text-2xl font-bold flex items-center">
                                <IndianRupee className="h-5 w-5" />
                                {item.price.toLocaleString()}
                                <span className="text-sm text-gray-500 ml-1">
                                  /{currentLang ? 'ക്വിന്റൽ' : 'quintal'}
                                </span>
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.trend === 'up' ? 'bg-green-100 text-green-800' : 
                                  item.trend === 'down' ? 'bg-red-100 text-red-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.trend === 'up' ? (currentLang ? 'ഉയർന്നു' : 'Rising') : 
                                   item.trend === 'down' ? (currentLang ? 'കുറഞ്ഞു' : 'Falling') : 
                                   (currentLang ? 'സ്ഥിരം' : 'Stable')}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {currentLang ? 'അവസാനം അപ്ഡേറ്റ്: 2 മണിക്കൂർ മുമ്പ്' : 'Last updated: 2hrs ago'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center gap-1 ${
                              item.trend === 'up' ? 'text-green-600' : 
                              item.trend === 'down' ? 'text-red-600' : 
                              'text-gray-600'
                            }`}>
                              <TrendingUp className={`h-4 w-4 ${
                                item.trend === 'down' ? 'rotate-180' : ''
                              }`} />
                              <span className="font-medium">
                                {item.change > 0 ? '+' : ''}{item.change}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {currentLang ? 'കഴിഞ്ഞ ആഴ്ച' : 'vs last week'}
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                              {currentLang ? 'വിൽക്കുക' : 'Sell Now'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'മൊത്തം വരുമാനം' : 'Total Income'}</p>
                      <p className="text-2xl font-bold text-green-600">₹45,000</p>
                      <p className="text-xs text-green-500">{currentLang ? '+12% കഴിഞ്ഞ മാസത്തിൽ നിന്നും' : '+12% from last month'}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'മൊത്തം ചെലവ്' : 'Total Expenses'}</p>
                      <p className="text-2xl font-bold text-red-600">₹28,500</p>
                      <p className="text-xs text-red-500">{currentLang ? '+5% കഴിഞ്ഞ മാസത്തിൽ നിന്നും' : '+5% from last month'}</p>
                    </div>
                    <Calculator className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'നെറ്റ് ലാഭം' : 'Net Profit'}</p>
                      <p className="text-2xl font-bold text-blue-600">₹16,500</p>
                      <p className="text-xs text-blue-500">{currentLang ? '+23% കഴിഞ്ഞ മാസത്തിൽ നിന്നും' : '+23% from last month'}</p>
                    </div>
                    <PieChart className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'ROI' : 'ROI'}</p>
                      <p className="text-2xl font-bold text-purple-600">57.9%</p>
                      <p className="text-xs text-purple-500">{currentLang ? 'ശരാശരിക്ക് മുകളിൽ' : 'Above average'}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expense Categories & Income Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calculator className="h-5 w-5 mr-2" />
                    {currentLang ? 'ചെലവ് വിഭാഗങ്ങൾ' : 'Expense Breakdown'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLang ? 'വിത്തും വളവും' : 'Seeds & Fertilizers'}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <span className="text-sm font-medium">₹12,825</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLang ? 'തൊഴിൽ ചെലവ്' : 'Labor Costs'}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{width: '30%'}}></div>
                        </div>
                        <span className="text-sm font-medium">₹8,550</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLang ? 'ഉപകരണങ്ങൾ' : 'Equipment & Tools'}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{width: '15%'}}></div>
                        </div>
                        <span className="text-sm font-medium">₹4,275</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLang ? 'ജലസേചനം' : 'Irrigation & Water'}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '10%'}}></div>
                        </div>
                        <span className="text-sm font-medium">₹2,850</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {currentLang ? 'വരുമാന സ്രോതസ്സുകൾ' : 'Income Sources'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLang ? 'നെൽ വിൽപ്പന' : 'Rice Harvest'}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                        <span className="text-sm font-medium">₹27,000</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLang ? 'പച്ചക്കറി വിൽപ്പന' : 'Vegetable Sales'}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm font-medium">₹11,250</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{currentLang ? 'പാൽ ഉൽപ്പന്നങ്ങൾ' : 'Dairy Products'}</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-teal-500 h-2 rounded-full" style={{width: '15%'}}></div>
                        </div>
                        <span className="text-sm font-medium">₹6,750</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Goals & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    {currentLang ? 'സാമ്പത്തിക ലക്ഷ്യങ്ങൾ' : 'Financial Goals'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{currentLang ? 'പുതിയ ഉപകരണങ്ങൾ' : 'New Equipment Fund'}</span>
                        <span className="text-sm">₹15,000 / ₹50,000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{currentLang ? '30% പൂർത്തിയായി • 8 മാസം ബാക്കി' : '30% complete • 8 months remaining'}</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{currentLang ? 'എമർജൻസി ഫണ്ട്' : 'Emergency Fund'}</span>
                        <span className="text-sm">₹8,500 / ₹25,000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full" style={{width: '34%'}}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{currentLang ? '34% പൂർത്തിയായി • ശരിയായ വഴിയിൽ' : '34% complete • On track'}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{currentLang ? 'ഭൂമി വിപുലീകരണം' : 'Land Expansion'}</span>
                        <span className="text-sm">₹45,000 / ₹200,000</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-purple-600 h-3 rounded-full" style={{width: '22%'}}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{currentLang ? '22% പൂർത്തിയായി • 2 വർഷം ബാക്കി' : '22% complete • 2 years remaining'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    {currentLang ? 'സമീപകാല ഇടപാടുകൾ' : 'Recent Transactions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-green-700">{currentLang ? 'നെൽ വിൽപ്പന' : 'Rice Sale'}</p>
                        <p className="text-xs text-green-600">{currentLang ? 'സെപ്റ്റംബർ 15, 2024' : 'Sep 15, 2024'}</p>
                      </div>
                      <span className="text-sm font-bold text-green-700">+₹15,000</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-red-700">{currentLang ? 'വള വാങ്ങൽ' : 'Fertilizer Purchase'}</p>
                        <p className="text-xs text-red-600">{currentLang ? 'സെപ്റ്റംബർ 12, 2024' : 'Sep 12, 2024'}</p>
                      </div>
                      <span className="text-sm font-bold text-red-700">-₹3,500</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-green-700">{currentLang ? 'പച്ചക്കറി മാർക്കറ്റ്' : 'Vegetable Market'}</p>
                        <p className="text-xs text-green-600">{currentLang ? 'സെപ്റ്റംബർ 10, 2024' : 'Sep 10, 2024'}</p>
                      </div>
                      <span className="text-sm font-bold text-green-700">+₹2,800</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-red-700">{currentLang ? 'തൊഴിൽ പേയ്മെന്റ്' : 'Labor Payment'}</p>
                        <p className="text-xs text-red-600">{currentLang ? 'സെപ്റ്റംബർ 8, 2024' : 'Sep 8, 2024'}</p>
                      </div>
                      <span className="text-sm font-bold text-red-700">-₹4,200</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4">
                    <FileText className="h-4 w-4 mr-2" />
                    {currentLang ? 'എല്ലാ ഇടപാടുകളും കാണുക' : 'View All Transactions'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'ഈ ആഴ്ചയിലെ കൃഷി പ്രവർത്തനങ്ങൾ' : 'This Week\'s Tasks'}</p>
                      <p className="text-2xl font-bold text-blue-600">7</p>
                      <p className="text-xs text-blue-500">{currentLang ? '3 പ്രധാനപ്പെട്ടത്' : '3 high priority'}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'വിളവെടുപ്പ് സമയം' : 'Harvest Ready'}</p>
                      <p className="text-2xl font-bold text-green-600">2</p>
                      <p className="text-xs text-green-500">{currentLang ? 'വിളകൾ തയ്യാർ' : 'crops ready'}</p>
                    </div>
                    <Leaf className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'പുതിയ നടീൽ' : 'New Plantings'}</p>
                      <p className="text-2xl font-bold text-purple-600">4</p>
                      <p className="text-xs text-purple-500">{currentLang ? 'സെപ്റ്റംബർ സീസൺ' : 'September season'}</p>
                    </div>
                    <Sprout className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* This Week's Schedule & Seasonal Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {currentLang ? 'ഈ ആഴ്ചയിലെ പ്രവർത്തനങ്ങൾ' : 'This Week\'s Schedule'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-red-600 font-medium">MON</span>
                        <span className="text-lg font-bold text-red-700">16</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-red-800">{currentLang ? 'നെൽ വിളവെടുപ്പ്' : 'Rice Harvest'}</h4>
                        <p className="text-sm text-red-600">{currentLang ? 'ഫീൽഡ് A - 2 ഏക്കർ' : 'Field A - 2 acres'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="destructive" className="text-xs">{currentLang ? 'അടിയന്തരം' : 'Urgent'}</Badge>
                          <Clock className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500">6:00 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-orange-600 font-medium">TUE</span>
                        <span className="text-lg font-bold text-orange-700">17</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-800">{currentLang ? 'വള പ്രയോഗം' : 'Fertilizer Application'}</h4>
                        <p className="text-sm text-orange-600">{currentLang ? 'പച്ചക്കറി പ്ലോട്ട്' : 'Vegetable plot'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{currentLang ? 'ഇടത്തരം' : 'Medium'}</Badge>
                          <Clock className="h-3 w-3 text-orange-500" />
                          <span className="text-xs text-orange-500">8:00 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-blue-600 font-medium">WED</span>
                        <span className="text-lg font-bold text-blue-700">18</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-800">{currentLang ? 'നടീൽ തയ്യാറെടുപ്പ്' : 'Planting Preparation'}</h4>
                        <p className="text-sm text-blue-600">{currentLang ? 'കിഴങ്ങുവർഗ്ഗങ്ങൾ' : 'Root vegetables'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{currentLang ? 'കുറഞ്ഞത്' : 'Low'}</Badge>
                          <Clock className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-blue-500">7:00 AM</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-green-600 font-medium">THU</span>
                        <span className="text-lg font-bold text-green-700">19</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">{currentLang ? 'കീടനാശിനി തളിക്കൽ' : 'Pest Control Spray'}</h4>
                        <p className="text-sm text-green-600">{currentLang ? 'തേങ്ങാ തോട്ടം' : 'Coconut grove'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">{currentLang ? 'ഇടത്തരം' : 'Medium'}</Badge>
                          <Clock className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">6:30 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sprout className="h-5 w-5 mr-2" />
                    {currentLang ? 'സെപ്റ്റംബർ സീസൺ ശുപാർശകൾ' : 'September Season Recommendations'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>{currentLang ? 'അനുയോജ്യമായ സമയം!' : 'Perfect Timing!'}</strong><br />
                        {currentLang ? 'സെപ്റ്റംബർ മാസം ഈ വിളകൾ നടാൻ ഏറ്റവും നല്ല സമയമാണ്' : 'September is ideal for planting these crops'}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-800">{currentLang ? 'റാഡിഷ്' : 'Radish'}</span>
                        </div>
                        <p className="text-xs text-green-700">{currentLang ? '25-30 ദിവസം' : '25-30 days'}</p>
                        <p className="text-xs text-green-600">{currentLang ? 'വിളവ്: ഉയർന്നത്' : 'Yield: High'}</p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="h-4 w-4 text-purple-600" />
                          <span className="font-medium text-purple-800">{currentLang ? 'കാരറ്റ്' : 'Carrot'}</span>
                        </div>
                        <p className="text-xs text-purple-700">{currentLang ? '70-80 ദിവസം' : '70-80 days'}</p>
                        <p className="text-xs text-purple-600">{currentLang ? 'വിളവ്: മികച്ചത്' : 'Yield: Excellent'}</p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="h-4 w-4 text-orange-600" />
                          <span className="font-medium text-orange-800">{currentLang ? 'കബേജ്' : 'Cabbage'}</span>
                        </div>
                        <p className="text-xs text-orange-700">{currentLang ? '90-120 ദിവസം' : '90-120 days'}</p>
                        <p className="text-xs text-orange-600">{currentLang ? 'വിളവ്: നല്ലത്' : 'Yield: Good'}</p>
                      </div>

                      <div className="p-3 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="h-4 w-4 text-teal-600" />
                          <span className="font-medium text-teal-800">{currentLang ? 'സ്പിനാച്ച്' : 'Spinach'}</span>
                        </div>
                        <p className="text-xs text-teal-700">{currentLang ? '30-45 ദിവസം' : '30-45 days'}</p>
                        <p className="text-xs text-teal-600">{currentLang ? 'വിളവ്: ഉയർന്നത്' : 'Yield: High'}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {currentLang ? 'സെപ്റ്റംബർ പ്രത്യേകതകൾ' : 'September Special Tips'}
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• {currentLang ? 'മൺസൂൺ കഴിഞ്ഞ് മണ്ണ് തയ്യാറാക്കുക' : 'Prepare soil after monsoon'}</li>
                        <li>• {currentLang ? 'ഓർഗാനിക് വള പ്രയോഗിക്കുക' : 'Apply organic fertilizers'}</li>
                        <li>• {currentLang ? 'ഡ്രെയിനേജ് ശ്രദ്ധിക്കുക' : 'Focus on proper drainage'}</li>
                        <li>• {currentLang ? 'കീടനാശിനി സ്പ്രേ ആവശ്യമെങ്കിൽ' : 'Pest control spray if needed'}</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Crop Timeline & Reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    {currentLang ? 'വിള വളർച്ചാ ട്രാക്കർ' : 'Crop Growth Tracker'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">{currentLang ? 'നെൽ (ഫീൽഡ് A)' : 'Rice (Field A)'}</h4>
                        <Badge variant="secondary">{currentLang ? '120 ദിവസം' : 'Day 120'}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{currentLang ? 'വിളവെടുപ്പ് പുരോഗതി' : 'Harvest Progress'}</span>
                          <span>95%</span>
                        </div>
                        <Progress value={95} className="h-2" />
                        <p className="text-xs text-green-600">{currentLang ? '2-3 ദിവസത്തിനുള്ളിൽ വിളവെടുപ്പിന് തയ്യാർ' : 'Ready for harvest in 2-3 days'}</p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">{currentLang ? 'തക്കാളി' : 'Tomatoes'}</h4>
                        <Badge variant="secondary">{currentLang ? '45 ദിവസം' : 'Day 45'}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{currentLang ? 'വളർച്ചാ പുരോഗതി' : 'Growth Progress'}</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                        <p className="text-xs text-orange-600">{currentLang ? 'പൂവിടൽ ഘട്ടം - വള ആവശ്യം' : 'Flowering stage - needs fertilizer'}</p>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">{currentLang ? 'വെളുത്തുള്ളി' : 'Onions'}</h4>
                        <Badge variant="secondary">{currentLang ? '90 ദിവസം' : 'Day 90'}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{currentLang ? 'വളർച്ചാ പുരോഗതി' : 'Growth Progress'}</span>
                          <span>80%</span>
                        </div>
                        <Progress value={80} className="h-2" />
                        <p className="text-xs text-blue-600">{currentLang ? 'ബൾബ് രൂപീകരണ ഘട്ടം' : 'Bulb formation stage'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    {currentLang ? 'അടുത്ത 7 ദിവസത്തെ റിമൈൻഡറുകൾ' : 'Next 7 Days Reminders'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-yellow-800">{currentLang ? 'നെൽ വിളവെടുപ്പ്' : 'Rice Harvest Due'}</h5>
                        <p className="text-sm text-yellow-700">{currentLang ? 'സെപ്റ്റംബർ 18 - കാലാവസ്ഥ അനുകൂലമായിരിക്കുമ്പോൾ' : 'Sept 18 - When weather is favorable'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Droplets className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-blue-800">{currentLang ? 'ജലസേചനം' : 'Irrigation Schedule'}</h5>
                        <p className="text-sm text-blue-700">{currentLang ? 'സെപ്റ്റംബർ 20 - പച്ചക്കറി പ്ലോട്ടിന്' : 'Sept 20 - For vegetable plot'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <TestTube className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-green-800">{currentLang ? 'മണ്ണ് പരിശോധന' : 'Soil Testing'}</h5>
                        <p className="text-sm text-green-700">{currentLang ? 'സെപ്റ്റംബർ 22 - പുതിയ സീസണിന് മുമ്പ്' : 'Sept 22 - Before new season'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-purple-800">{currentLang ? 'കീടനിയന്ത്രണം' : 'Pest Control'}</h5>
                        <p className="text-sm text-purple-700">{currentLang ? 'സെപ്റ്റംബർ 25 - തേങ്ങാ തോട്ടത്തിന്' : 'Sept 25 - For coconut grove'}</p>
                      </div>
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      {currentLang ? 'പൂർണ്ണ കലണ്ടർ കാണുക' : 'View Full Calendar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'മൊത്തം വിളവ്' : 'Total Yield'}</p>
                      <p className="text-2xl font-bold text-green-600">2.8 {currentLang ? 'ടൺ' : 'tonnes'}</p>
                      <p className="text-xs text-green-500">+15% {currentLang ? 'കഴിഞ്ഞ വർഷം' : 'vs last year'}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'കൃഷിയിടം' : 'Farm Area'}</p>
                      <p className="text-2xl font-bold text-blue-600">5.2 {currentLang ? 'ഏക്കർ' : 'acres'}</p>
                      <p className="text-xs text-blue-500">{currentLang ? 'ഉൽപ്പാദനക്ഷമത' : 'productive area'}</p>
                    </div>
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'ശരാശരി ROI' : 'Average ROI'}</p>
                      <p className="text-2xl font-bold text-purple-600">42.3%</p>
                      <p className="text-xs text-purple-500">{currentLang ? 'മികച്ച പ്രകടനം' : 'excellent performance'}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{currentLang ? 'സാങ്കേതിക സ്കോർ' : 'Tech Score'}</p>
                      <p className="text-2xl font-bold text-orange-600">8.7/10</p>
                      <p className="text-xs text-orange-500">{currentLang ? 'AI ശുപാർശകൾ' : 'AI recommendations'}</p>
                    </div>
                    <Star className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Yield Analytics & Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    {currentLang ? 'വിള വിളവ് വിശകലനം' : 'Crop Yield Analysis'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { crop: 'Rice', yield: '1200', target: '1000', color: 'green' },
                      { crop: 'Tomatoes', yield: '850', target: '800', color: 'red' },
                      { crop: 'Onions', yield: '600', target: '650', color: 'purple' },
                      { crop: 'Coconut', yield: '2800', target: '3000', color: 'orange' }
                    ].map((item, index) => {
                      const achievement = (parseInt(item.yield) / parseInt(item.target)) * 100;
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {currentLang && item.crop === 'Rice' ? 'നെൽ' : 
                               currentLang && item.crop === 'Tomatoes' ? 'തക്കാളി' : 
                               currentLang && item.crop === 'Onions' ? 'വെളുത്തുള്ളി' : 
                               currentLang && item.crop === 'Coconut' ? 'തേങ്ങ' : item.crop}
                            </span>
                            <div className="text-right">
                              <span className="text-sm font-bold">{item.yield} kg</span>
                              <span className="text-xs text-gray-500 ml-1">/ {item.target} kg</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`bg-${item.color}-500 h-3 rounded-full flex items-center justify-end pr-2`} 
                              style={{width: `${Math.min(achievement, 100)}%`}}
                            >
                              {achievement >= 100 && <span className="text-xs text-white font-bold">✓</span>}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {achievement.toFixed(1)}% {currentLang ? 'ലക്ഷ്യം നേടി' : 'target achieved'}
                            {achievement >= 100 && (
                              <span className="text-green-600 ml-1">
                                (+{(achievement - 100).toFixed(1)}% {currentLang ? 'അധികം' : 'extra'})
                              </span>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    {currentLang ? '6 മാസത്തെ പ്രകടന ട്രെൻഡ്' : '6-Month Performance Trend'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-1 text-xs text-center text-gray-500 mb-2">
                      <span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{currentLang ? 'വരുമാനം (₹000s)' : 'Revenue (₹000s)'}</span>
                        <span className="text-sm text-green-600">↗ +23%</span>
                      </div>
                      <div className="flex items-end h-16 space-x-1">
                        {[35, 42, 38, 55, 48, 62].map((value, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-green-500 rounded-t flex items-end justify-center" 
                              style={{height: `${(value / 62) * 100}%`}}
                            >
                              <span className="text-xs text-white font-bold mb-1">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{currentLang ? 'ചെലവുകൾ (₹000s)' : 'Expenses (₹000s)'}</span>
                        <span className="text-sm text-red-600">↗ +8%</span>
                      </div>
                      <div className="flex items-end h-16 space-x-1">
                        {[28, 30, 32, 35, 33, 38].map((value, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-red-500 rounded-t flex items-end justify-center" 
                              style={{height: `${(value / 38) * 100}%`}}
                            >
                              <span className="text-xs text-white font-bold mb-1">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">{currentLang ? 'ലാഭം (₹000s)' : 'Profit (₹000s)'}</span>
                        <span className="text-sm text-blue-600">↗ +45%</span>
                      </div>
                      <div className="flex items-end h-16 space-x-1">
                        {[7, 12, 6, 20, 15, 24].map((value, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-blue-500 rounded-t flex items-end justify-center" 
                              style={{height: `${(value / 24) * 100}%`}}
                            >
                              <span className="text-xs text-white font-bold mb-1">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Crop Comparison & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    {currentLang ? 'വിള അനുപാത വിശകലനം' : 'Crop Distribution Analysis'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-2">
                          <span className="text-white font-bold">45%</span>
                        </div>
                        <p className="text-sm font-medium">{currentLang ? 'നെൽ' : 'Rice'}</p>
                        <p className="text-xs text-gray-500">2.3 {currentLang ? 'ഏക്കർ' : 'acres'}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center mb-2">
                          <span className="text-white font-bold">30%</span>
                        </div>
                        <p className="text-sm font-medium">{currentLang ? 'പച്ചക്കറികൾ' : 'Vegetables'}</p>
                        <p className="text-xs text-gray-500">1.6 {currentLang ? 'ഏക്കർ' : 'acres'}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="w-16 h-16 mx-auto bg-orange-500 rounded-full flex items-center justify-center mb-2">
                          <span className="text-white font-bold">20%</span>
                        </div>
                        <p className="text-sm font-medium">{currentLang ? 'തേങ്ങ' : 'Coconut'}</p>
                        <p className="text-xs text-gray-500">1.0 {currentLang ? 'ഏക്കർ' : 'acres'}</p>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="w-16 h-16 mx-auto bg-purple-500 rounded-full flex items-center justify-center mb-2">
                          <span className="text-white font-bold">5%</span>
                        </div>
                        <p className="text-sm font-medium">{currentLang ? 'മറ്റുള്ളവ' : 'Others'}</p>
                        <p className="text-xs text-gray-500">0.3 {currentLang ? 'ഏക്കർ' : 'acres'}</p>
                      </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>{currentLang ? 'ശുപാർശ:' : 'Recommendation:'}</strong><br />
                        {currentLang ? 
                          'പച്ചക്കറി വിഭാഗം 35%-ലേക്ക് വർദ്ധിപ്പിക്കുന്നത് ലാഭകരമായിരിക്കും' : 
                          'Consider increasing vegetable area to 35% for better profitability'}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2" />
                    {currentLang ? 'AI സ്മാർട്ട് ഇൻസൈറ്റുകൾ' : 'AI Smart Insights'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">{currentLang ? 'മികച്ച പ്രകടനം' : 'Top Performance'}</span>
                      </div>
                      <p className="text-sm text-green-700">
                        {currentLang ? 
                          'നിങ്ങളുടെ നെൽകൃഷി മേഖലയിലെ ശരാശരിയേക്കാൾ 20% കൂടുതൽ വിളവ് നൽകുന്നു' : 
                          'Your rice farming yields 20% more than regional average'}
                      </p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-orange-800">{currentLang ? 'മെച്ചപ്പെടുത്താൻ കഴിയുന്നത്' : 'Improvement Opportunity'}</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        {currentLang ? 
                          'ജലസേചന കാര്യക്ഷമത 15% വർദ്ധിപ്പിച്ചാൽ വാർഷിക ചെലവ് ₹8,000 കുറയും' : 
                          'Optimizing irrigation efficiency by 15% could save ₹8,000 annually'}
                      </p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-800">{currentLang ? 'സീസൺ പ്രവചനം' : 'Seasonal Prediction'}</span>
                      </div>
                      <p className="text-sm text-purple-700">
                        {currentLang ? 
                          'അടുത്ത സീസണിൽ തക്കാളിയുടെ വില 25% വർദ്ധനവ് പ്രതീക്ഷിക്കുന്നു' : 
                          'Next season predicts 25% price increase for tomatoes'}
                      </p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-teal-600" />
                        <span className="font-medium text-teal-800">{currentLang ? 'നൂതന സാങ്കേതികവിദ്യ' : 'Tech Innovation'}</span>
                      </div>
                      <p className="text-sm text-teal-700">
                        {currentLang ? 
                          'ഡ്രോൺ സ്പ്രേയിംഗ് സാങ്കേതികവിദ്യ അപ്നാവുചെയ്യുന്നത് 30% കാര്യക്ഷമത വർദ്ധിപ്പിക്കും' : 
                          'Adopting drone spraying technology could increase efficiency by 30%'}
                      </p>
                    </div>

                    <Button className="w-full mt-4">
                      <Download className="h-4 w-4 mr-2" />
                      {currentLang ? 'പൂർണ്ണ റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക' : 'Download Full Report'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <Marketplace currentLang={currentLang} />
          </TabsContent>
        </Tabs>

        {/* Welcome Modal for new users */}
        <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-800">
                <Heart className="h-5 w-5" />
                {currentLang ? 'കൃഷി സഹകാരി കണക്ടിലേക്ക് സ്വാഗതം!' : 'Welcome to Krishi Sahakari Connect!'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {currentLang 
                  ? 'ഞങ്ങൾ നിങ്ങളുടെ കൃഷി യാത്രയിൽ സഹായിക്കാൻ ഇവിടെയുണ്ട്' 
                  : 'We\'re here to help you on your farming journey'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <GraduationCap className="h-16 w-16 mx-auto text-green-600 mb-4" />
                <p className="text-sm text-gray-700 mb-4">
                  {currentLang 
                    ? 'നിങ്ങളുടെ കൃഷി അനുഭവം എത്രയാണ്?' 
                    : 'What\'s your farming experience level?'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => handleWelcomeComplete('beginner')}
                  className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-800 border border-green-200"
                  variant="outline"
                >
                  <Sprout className="h-4 w-4 mr-2" />
                  {currentLang ? 'പുതുമുഖം (ഗൈഡൻസ് വേണം)' : 'Beginner (Need guidance)'}
                </Button>
                
                <Button 
                  onClick={() => handleWelcomeComplete('intermediate')}
                  className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
                  variant="outline"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {currentLang ? 'ഇടത്തരം (കുറച്ച് അനുഭവം ഉണ്ട്)' : 'Intermediate (Some experience)'}
                </Button>
                
                <Button 
                  onClick={() => handleWelcomeComplete('advanced')}
                  className="w-full justify-start bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200"
                  variant="outline"
                >
                  <Award className="h-4 w-4 mr-2" />
                  {currentLang ? 'വിദഗ്ധൻ (വിപുലമായ അനുഭവം)' : 'Advanced (Extensive experience)'}
                </Button>
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                {currentLang 
                  ? 'നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും ഇത് മാറ്റാം' 
                  : 'You can change this anytime in settings'
                }
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Tutorial Modal */}
        <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {currentLang ? 'ഡാഷ്ബോർഡ് ടൂറിന്റോറിയൽ' : 'Dashboard Tutorial'}
              </DialogTitle>
              <DialogDescription>
                {currentLang 
                  ? `ഘട്ടം ${tutorialStep + 1} / ${tutorialSteps.length}` 
                  : `Step ${tutorialStep + 1} of ${tutorialSteps.length}`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Lightbulb className="h-10 w-10 text-blue-600" />
                </div>
                
                <h3 className="text-lg font-semibold mb-2">
                  {tutorialSteps[tutorialStep]?.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {tutorialSteps[tutorialStep]?.content}
                </p>
                
                <Progress value={(tutorialStep + 1) / tutorialSteps.length * 100} className="mb-4" />
              </div>
              
              <div className="flex justify-between">
                <Button 
                  onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                  disabled={tutorialStep === 0}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {currentLang ? 'മുമ്പത്തേത്' : 'Previous'}
                </Button>
                
                {tutorialStep < tutorialSteps.length - 1 ? (
                  <Button 
                    onClick={() => {
                      setTutorialStep(tutorialStep + 1);
                      const nextStep = tutorialSteps[tutorialStep + 1];
                      if (nextStep?.target) {
                        setActiveTab(nextStep.target);
                      }
                    }}
                    size="sm"
                  >
                    {currentLang ? 'അടുത്തത്' : 'Next'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => {
                      setShowTutorial(false);
                      setTutorialStep(0);
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {currentLang ? 'പൂർത്തിയായി' : 'Finish'}
                  </Button>
                )}
              </div>
              
              <Button 
                onClick={() => {
                  setShowTutorial(false);
                  setTutorialStep(0);
                }}
                variant="ghost"
                size="sm"
                className="w-full text-gray-500"
              >
                {currentLang ? 'ടൂറിന്റോറിയൽ ഒഴിവാക്കുക' : 'Skip Tutorial'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Chat Modal */}
        <Dialog open={showAIChat} onOpenChange={setShowAIChat}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                {currentLang ? 'കൃഷി AI സഹായി' : 'Farming AI Assistant'}
              </DialogTitle>
              <DialogDescription>
                {currentLang 
                  ? 'കൃഷിയെക്കുറിച്ചുള്ള നിങ്ങളുടെ സംശയങ്ങൾ ചോദിക്കുക' 
                  : 'Ask your farming questions and get instant help'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col h-96">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
                {aiChatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <p className="text-sm">
                      {currentLang 
                        ? 'കൃഷിയെക്കുറിച്ച് എന്തെങ്കിലും ചോദിക്കുക! മണ്ണ്, വെള്ളം, കീടങ്ങൾ, വിളകൾ...'
                        : 'Ask me anything about farming! Soil, water, pests, crops...'
                      }
                    </p>
                  </div>
                ) : (
                  aiChatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-white border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Chat Input */}
              <div className="flex gap-2 mt-4">
                <Input
                  value={aiChatInput}
                  onChange={(e) => setAiChatInput(e.target.value)}
                  placeholder={currentLang ? 'കൃഷിയെക്കുറിച്ച് ചോദിക്കുക...' : 'Ask about farming...'}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                  className="flex-1"
                />
                <Button onClick={handleAIChat} disabled={!aiChatInput.trim()}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  currentLang ? 'മണ്ണ് പരിശോധന എങ്ങനെ?' : 'How to test soil?',
                  currentLang ? 'എപ്പോൾ വെള്ളം നൽകണം?' : 'When to water plants?',
                  currentLang ? 'കീടങ്ങളെ എങ്ങനെ തടയാം?' : 'How to prevent pests?',
                  currentLang ? 'ഈ മാസം എന്ത് വിള നടാം?' : 'What crop to plant this month?'
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      setAiChatInput(suggestion);
                      handleAIChat();
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Issue Report Modal */}
        <Dialog open={showIssueReport} onOpenChange={setShowIssueReport}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                {currentLang ? 'പ്രശ്നം റിപ്പോർട്ട് ചെയ്യുക' : 'Report an Issue'}
              </DialogTitle>
              <DialogDescription>
                {currentLang 
                  ? 'കൃഷിയിൽ നേരിടുന്ന പ്രശ്നങ്ങൾ ഞങ്ങളെ അറിയിക്കുക. ഞങ്ങൾ സഹായിക്കാൻ ശ്രമിക്കും.'
                  : 'Let us know about any farming issues you\'re facing. We\'ll try to help you.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{currentLang ? 'പ്രശ്നത്തിന്റെ തരം' : 'Issue Type'}</Label>
                <Select onValueChange={(value) => setIssueReport({...issueReport, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={currentLang ? 'തരം തിരഞ്ഞെടുക്കുക' : 'Select issue type'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pest">{currentLang ? 'കീട പ്രശ്നം' : 'Pest Problem'}</SelectItem>
                    <SelectItem value="disease">{currentLang ? 'രോഗ പ്രശ്നം' : 'Plant Disease'}</SelectItem>
                    <SelectItem value="soil">{currentLang ? 'മണ്ണ് പ്രശ്നം' : 'Soil Issue'}</SelectItem>
                    <SelectItem value="water">{currentLang ? 'വെള്ളം പ്രശ്നം' : 'Water Problem'}</SelectItem>
                    <SelectItem value="weather">{currentLang ? 'കാലാവസ്ഥ പ്രശ്നം' : 'Weather Related'}</SelectItem>
                    <SelectItem value="market">{currentLang ? 'വിപണി പ്രശ്നം' : 'Market Issue'}</SelectItem>
                    <SelectItem value="technical">{currentLang ? 'സാങ്കേതിക പ്രശ്നം' : 'Technical Issue'}</SelectItem>
                    <SelectItem value="other">{currentLang ? 'മറ്റുള്ളവ' : 'Other'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{currentLang ? 'പ്രശ്നത്തിന്റെ വിവരണം' : 'Issue Description'}</Label>
                <Textarea 
                  placeholder={currentLang 
                    ? 'നിങ്ങളുടെ പ്രശ്നം വിശദമായി വിവരിക്കുക...'
                    : 'Describe your issue in detail...'
                  }
                  value={issueReport.description}
                  onChange={(e) => setIssueReport({...issueReport, description: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>{currentLang ? 'ബന്ധപ്പെടാനുള്ള നമ്പർ (ഓപ്ഷണൽ)' : 'Contact Number (Optional)'}</Label>
                <Input 
                  placeholder={currentLang ? 'ഫോൺ നമ്പർ' : 'Phone number'}
                  value={issueReport.contact}
                  onChange={(e) => setIssueReport({...issueReport, contact: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowIssueReport(false);
                    setIssueReport({ type: '', description: '', contact: '' });
                  }}
                  className="flex-1"
                >
                  {currentLang ? 'റദ്ദാക്കുക' : 'Cancel'}
                </Button>
                <Button 
                  onClick={() => {
                    if (issueReport.type && issueReport.description) {
                      // In a real app, this would send to backend
                      alert(currentLang 
                        ? 'നിങ്ങളുടെ പ്രശ്നം രേഖപ്പെടുത്തി! ഞങ്ങൾ ഉടൻ സഹായിക്കും.'
                        : 'Your issue has been recorded! We will contact you soon.'
                      );
                      setShowIssueReport(false);
                      setIssueReport({ type: '', description: '', contact: '' });
                    } else {
                      alert(currentLang 
                        ? 'ദയവായി പ്രശ്നത്തിന്റെ തരവും വിവരണവും നൽകുക'
                        : 'Please select issue type and provide description'
                      );
                    }
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {currentLang ? 'സമർപ്പിക്കുക' : 'Submit'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Floating Marketplace Quick Access Button */}
      <div className="fixed bottom-6 right-6 z-40 group">
        <Button 
          onClick={() => {
            // Auto-switch to marketplace tab
            const marketplaceTab = document.querySelector('[data-value="marketplace"]') as HTMLElement;
            if (marketplaceTab) {
              marketplaceTab.click();
            }
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-white"
          title={currentLang ? 'കൃഷി മാർക്കറ്റ്' : 'Krishi Market'}
        >
          <div className="flex flex-col items-center">
            <Store className="h-6 w-6" />
            <span className="text-xs">🛒</span>
          </div>
        </Button>
        
        {/* Tooltip */}
        <div className="absolute bottom-20 right-0 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {currentLang ? 'കൃഷി മാർക്കറ്റ്‌പ്ലേസ്' : 'Krishi Marketplace'}
          <div className="absolute top-full right-4 w-2 h-2 bg-black rotate-45 transform -translate-y-1"></div>
        </div>
      </div>
    </div>
  );
}
