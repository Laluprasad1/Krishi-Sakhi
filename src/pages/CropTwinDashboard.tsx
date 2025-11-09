import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sprout, 
  Brain, 
  Shield, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  Leaf,
  Droplets,
  Thermometer,
  Wind,
  Activity,
  Target,
  Eye,
  Zap,
  Globe,
  Lock,
  Mic,
  Volume2,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { cropTwinEngine } from '@/services/cropTwinEngine';
import { CropTwin, ProactiveAlert, Recommendation } from '@/types/cropTwin';

interface CropTwinDashboardProps {
  currentLang: boolean; // false = English, true = Malayalam
  onLanguageToggle: () => void;
  farmerId: string;
}

export default function CropTwinDashboard({ currentLang, onLanguageToggle, farmerId }: CropTwinDashboardProps) {
  const [cropTwins, setCropTwins] = useState<CropTwin[]>([]);
  const [selectedTwin, setSelectedTwin] = useState<CropTwin | null>(null);
  const [alerts, setAlerts] = useState<ProactiveAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Initialize crop twins
  useEffect(() => {
    initializeCropTwins();
    if (realTimeUpdates) {
      const interval = setInterval(() => {
        refreshCropTwins();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [farmerId, realTimeUpdates]);

  const initializeCropTwins = async () => {
    setIsLoading(true);
    
    // Create sample crop twins for demonstration
    const sampleCropTwins = await createSampleCropTwins();
    setCropTwins(sampleCropTwins);
    
    if (sampleCropTwins.length > 0) {
      const firstTwin = sampleCropTwins[0];
      setSelectedTwin(firstTwin);
      
      // Load alerts and recommendations
      const twinAlerts = await cropTwinEngine.getProactiveAlerts(firstTwin.id);
      const twinRecommendations = await cropTwinEngine.getProactiveRecommendations(firstTwin.id);
      
      setAlerts(twinAlerts);
      setRecommendations(twinRecommendations);
    }
    
    setIsLoading(false);
  };

  const createSampleCropTwins = async (): Promise<CropTwin[]> => {
    const farmerProfile = {
      id: farmerId,
      name: 'Mahesh',
      location: {
        district: 'Thiruvananthapuram',
        taluk: 'Neyyattinkara',
        village: 'Kulathoor',
        coordinates: { lat: 8.4037, lng: 76.9974 }
      },
      farmSize: 2.5,
      experience: 15,
      preferredLanguage: currentLang ? 'ml' : 'en' as 'ml' | 'en',
      communicationPreference: 'both' as 'voice' | 'text' | 'both',
      schemes: ['PM-KISAN', 'Kerala Karshaka Pension'],
      certifications: ['Organic Certification']
    };

    const cropData1 = {
      cropId: 'rice_001',
      name: 'Rice (Oryza sativa)',
      malayalamName: 'നെല്ല്',
      variety: 'Jyothi',
      plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      expectedHarvestDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
      currentStage: {
        name: 'Vegetative Growth',
        malayalamName: 'വളർച്ചാ ഘട്ടം',
        stage: 'vegetative' as const,
        daysFromPlanting: 45,
        healthScore: 85,
        riskFactors: []
      },
      area: 1.5,
      fieldLocation: { lat: 8.4037, lng: 76.9974 }
    };

    const cropData2 = {
      cropId: 'coconut_001',
      name: 'Coconut',
      malayalamName: 'തെങ്ങ്',
      variety: 'Dwarf Green',
      plantingDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
      expectedHarvestDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000), // 2 years from now
      currentStage: {
        name: 'Mature',
        malayalamName: 'പക്വത',
        stage: 'maturity' as const,
        daysFromPlanting: 365,
        healthScore: 92,
        riskFactors: []
      },
      area: 1.0,
      fieldLocation: { lat: 8.4040, lng: 76.9970 }
    };

    const twin1 = await cropTwinEngine.createCropTwin(farmerId, farmerProfile, cropData1);
    const twin2 = await cropTwinEngine.createCropTwin(farmerId, farmerProfile, cropData2);

    // Add sample sensor data
    await cropTwinEngine.updateSensorData(twin1.id, {
      timestamp: new Date(),
      soilMoisture: 45,
      soilTemperature: 26,
      soilPH: 6.2,
      ambientTemperature: 28,
      humidity: 72,
      lightIntensity: 35000,
      rainfall: 2.5
    });

    return [twin1, twin2];
  };

  const refreshCropTwins = async () => {
    if (selectedTwin) {
      const updatedTwin = cropTwinEngine.getCropTwin(selectedTwin.id);
      if (updatedTwin) {
        setSelectedTwin(updatedTwin);
        
        const twinAlerts = await cropTwinEngine.getProactiveAlerts(updatedTwin.id);
        const twinRecommendations = await cropTwinEngine.getProactiveRecommendations(updatedTwin.id);
        
        setAlerts(twinAlerts);
        setRecommendations(twinRecommendations);
      }
    }
  };

  const handleCropTwinSelect = async (twin: CropTwin) => {
    setSelectedTwin(twin);
    
    const twinAlerts = await cropTwinEngine.getProactiveAlerts(twin.id);
    const twinRecommendations = await cropTwinEngine.getProactiveRecommendations(twin.id);
    
    setAlerts(twinAlerts);
    setRecommendations(twinRecommendations);
  };

  const handleVoiceToggle = () => {
    setIsVoiceMode(!isVoiceMode);
    // Here you would integrate with voice synthesis/recognition
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang ? 'ml-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-lg font-semibold text-green-800">
            {currentLang ? 'ക്രോപ് ട്വിൻ ലോഡ് ചെയ്യുന്നു...' : 'Loading Crop Twin...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-800 flex items-center gap-3">
              <Brain className="h-8 w-8" />
              {currentLang ? 'കൃഷി സഖി - ഡിജിറ്റൽ ബന്ധു' : 'Krishi Sakhi - Digital Bandhu'}
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              {currentLang 
                ? 'നിങ്ങളുടെ വ്യക്തിഗത വിള സഹായി' 
                : 'Your Personal Crop Twin Companion'
              }
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleVoiceToggle}
              variant={isVoiceMode ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {isVoiceMode ? <Volume2 className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {currentLang ? 'വോയ്സ്' : 'Voice'}
            </Button>
            <Button 
              onClick={onLanguageToggle}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {currentLang ? 'EN' : 'മല'}
            </Button>
            <Badge variant="secondary" className="px-3 py-1">
              <Lock className="h-3 w-3 mr-1" />
              {currentLang ? 'സ്വകാര്യത സുരക്ഷിത' : 'Privacy Protected'}
            </Badge>
          </div>
        </div>

        {/* Crop Twin Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {currentLang ? 'നിങ്ങളുടെ വിള ട്വിൻസ്' : 'Your Crop Twins'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cropTwins.map((twin) => (
                <Card 
                  key={twin.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTwin?.id === twin.id ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleCropTwinSelect(twin)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">
                        {currentLang ? twin.cropData.malayalamName : twin.cropData.name}
                      </h3>
                      <Badge variant={twin.healthScore > 80 ? "default" : "secondary"}>
                        {twin.healthScore}%
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {currentLang ? 'ഘട്ടം' : 'Stage'}: {currentLang ? twin.cropData.currentStage.malayalamName : twin.cropData.currentStage.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {twin.cropData.area} {currentLang ? 'ഏക്കർ' : 'acres'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedTwin && (
          <>
            {/* Critical Alerts */}
            {alerts.filter(a => a.severity === 'critical').length > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>{currentLang ? 'അടിയന്തര മുന്നറിയിപ്പ്:' : 'Critical Alert:'}</strong>
                  <div className="mt-2 space-y-1">
                    {alerts.filter(a => a.severity === 'critical').map(alert => (
                      <div key={alert.id} className="flex items-center justify-between">
                        <span>{currentLang ? alert.malayalamMessage : alert.message}</span>
                        {alert.actionRequired && (
                          <Button size="sm" className="ml-2">
                            {currentLang ? 'നടപടി സ്വീകരിക്കുക' : 'Take Action'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">
                  {currentLang ? 'അവലോകനം' : 'Overview'}
                </TabsTrigger>
                <TabsTrigger value="health">
                  {currentLang ? 'ആരോഗ്യം' : 'Health'}
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  {currentLang ? 'ശുപാർശകൾ' : 'Recommendations'}
                </TabsTrigger>
                <TabsTrigger value="insights">
                  {currentLang ? 'ഉൾക്കാഴ്ചകൾ' : 'Insights'}
                </TabsTrigger>
                <TabsTrigger value="learning">
                  {currentLang ? 'പഠനം' : 'Learning'}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">{currentLang ? 'മൊത്തം ആരോഗ്യം' : 'Overall Health'}</p>
                          <p className="text-2xl font-bold">{selectedTwin.healthScore}%</p>
                        </div>
                        <Activity className="h-8 w-8 text-green-100" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">{currentLang ? 'അപകടസാധ്യത' : 'Risk Level'}</p>
                          <p className="text-2xl font-bold">{selectedTwin.riskAssessment.overall}%</p>
                        </div>
                        <Shield className="h-8 w-8 text-blue-100" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100">{currentLang ? 'ശുപാർശകൾ' : 'Active Recommendations'}</p>
                          <p className="text-2xl font-bold">{recommendations.length}</p>
                        </div>
                        <Brain className="h-8 w-8 text-purple-100" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100">{currentLang ? 'അലേർട്ടുകൾ' : 'Active Alerts'}</p>
                          <p className="text-2xl font-bold">{alerts.length}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-orange-100" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Real-time Environmental Data */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      {currentLang ? 'തത്സമയ പരിസ്ഥിതി ഡാറ്റ' : 'Real-time Environmental Data'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedTwin.sensorData.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(() => {
                          const latest = selectedTwin.sensorData[selectedTwin.sensorData.length - 1];
                          return (
                            <>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Thermometer className="h-6 w-6 mx-auto mb-2 text-red-500" />
                                <p className="text-sm text-gray-600">{currentLang ? 'താപനില' : 'Temperature'}</p>
                                <p className="text-lg font-bold">{latest.ambientTemperature}°C</p>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                                <p className="text-sm text-gray-600">{currentLang ? 'മണ്ണിലെ ജലാംശം' : 'Soil Moisture'}</p>
                                <p className="text-lg font-bold">{latest.soilMoisture}%</p>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Wind className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                                <p className="text-sm text-gray-600">{currentLang ? 'ആർദ്രത' : 'Humidity'}</p>
                                <p className="text-lg font-bold">{latest.humidity}%</p>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Eye className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                                <p className="text-sm text-gray-600">{currentLang ? 'pH' : 'Soil pH'}</p>
                                <p className="text-lg font-bold">{latest.soilPH}</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Health Tab */}
              <TabsContent value="health" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{currentLang ? 'വിള ആരോഗ്യ വിശകലനം' : 'Crop Health Analysis'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{currentLang ? 'മൊത്തം ആരോഗ്യം' : 'Overall Health'}</span>
                        <span>{selectedTwin.healthScore}%</span>
                      </div>
                      <Progress value={selectedTwin.healthScore} className="h-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedTwin.riskAssessment.breakdown).map(([risk, value]) => (
                        <div key={risk} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="capitalize font-medium">
                              {currentLang ? getRiskNameInMalayalam(risk) : risk.replace('_', ' ')}
                            </span>
                            <Badge variant={value > 50 ? "destructive" : value > 30 ? "secondary" : "default"}>
                              {100 - value}% {currentLang ? 'സുരക്ഷിത' : 'Safe'}
                            </Badge>
                          </div>
                          <Progress value={100 - value} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {currentLang ? rec.malayalamTitle : rec.title}
                        </CardTitle>
                        <Badge variant={
                          rec.priority === 'critical' ? 'destructive' : 
                          rec.priority === 'high' ? 'secondary' : 'default'
                        }>
                          {rec.priority}
                        </Badge>
                      </div>
                      <CardDescription>
                        {currentLang ? rec.malayalamDescription : rec.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {currentLang ? 'സമയം:' : 'Timing:'}
                          </span>
                          <span className="text-sm">
                            {currentLang ? rec.malayalamTiming : rec.timing}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {currentLang ? 'വിശ്വാസ്യത:' : 'Confidence:'}
                          </span>
                          <span className="text-sm">{Math.round(rec.confidence * 100)}%</span>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            const text = currentLang ? rec.malayalamDescription : rec.description;
                            if (isVoiceMode) speakText(text);
                          }}
                        >
                          {currentLang ? 'വിശദാംശങ്ങൾ കാണുക' : 'View Details'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      {currentLang ? 'AI അധിഷ്ഠിത ഉൾക്കാഴ്ചകൾ' : 'AI-Powered Insights'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          {currentLang ? 'വളർച്ചാ പ്രവചനം' : 'Growth Prediction'}
                        </h4>
                        <p className="text-blue-700">
                          {currentLang 
                            ? 'നിലവിലെ സാഹചര്യങ്ങൾ അടിസ്ഥാനമാക്കി, നിങ്ങളുടെ വിള പ്രതീക്ഷിച്ചതിലും 15% കൂടുതൽ വിളവ് നൽകും.'
                            : 'Based on current conditions, your crop is expected to yield 15% above average.'
                          }
                        </p>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-semibold text-green-800 mb-2">
                          {currentLang ? 'ഒപ്റ്റിമൈസേഷൻ സൂചന' : 'Optimization Tip'}
                        </h4>
                        <p className="text-green-700">
                          {currentLang 
                            ? 'സമീപത്തുള്ള കർഷകരുടെ ഡാറ്റ കാണിക്കുന്നത് പ്രഭാത സമയത്തെ ജലസേചനം 20% കൂടുതൽ ഫലപ്രദമാണെന്നാണ്.'
                            : 'Regional data suggests morning irrigation is 20% more effective in your area.'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Learning Tab */}
              <TabsContent value="learning" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      {currentLang ? 'ഫെഡറേറ്റഡ് ലേണിംഗ് സ്റ്റാറ്റസ്' : 'Federated Learning Status'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Users className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                        <p className="text-sm text-gray-600">{currentLang ? 'പങ്കാളി കർഷകർ' : 'Contributing Farmers'}</p>
                        <p className="text-lg font-bold">1,250</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Globe className="h-6 w-6 mx-auto mb-2 text-green-500" />
                        <p className="text-sm text-gray-600">{currentLang ? 'മാതൃക കൃത്യത' : 'Model Accuracy'}</p>
                        <p className="text-lg font-bold">{Math.round(selectedTwin.learningModel.localAccuracy * 100)}%</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-yellow-600" />
                        <span className="font-semibold text-yellow-800">
                          {currentLang ? 'സ്വകാര്യത സംരക്ഷണം' : 'Privacy Protection'}
                        </span>
                      </div>
                      <p className="text-yellow-700 text-sm">
                        {currentLang 
                          ? 'നിങ്ങളുടെ എല്ലാ ഡാറ്റയും പ്രാദേശികമായി സംഭരിച്ചിരിക്കുന്നു. കേവലം അജ്ഞാതമായ പാറ്റേണുകൾ മാത്രമേ പങ്കിടുന്നുള്ളൂ.'
                          : 'All your data stays local. Only anonymized patterns are shared to improve the global model.'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}

// Helper function to get risk names in Malayalam
function getRiskNameInMalayalam(risk: string): string {
  const translations = {
    pest: 'കീടങ്ങൾ',
    disease: 'രോഗങ്ങൾ',
    weather: 'കാലാവസ്ഥ',
    nutrient: 'പോഷകങ്ങൾ',
    water: 'വെള്ളം'
  };
  return translations[risk as keyof typeof translations] || risk;
}
