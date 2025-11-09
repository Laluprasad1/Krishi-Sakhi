import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Send, Mic, Loader2, Camera, AlertTriangle, CheckCircle, Clock, Leaf, MapPin, ThumbsUp, ThumbsDown, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import GeminiAgricultureService from "@/services/geminiService";
import { ChatQuery, ChatResponse } from "@/services/agricultureChatEngine";
import { feedbackEscalationService, createFeedbackButtons } from "@/services/feedbackEscalationService";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  response?: ChatResponse;
  images?: string[];
}

const ChatInterface = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: language === 'en' 
        ? "Hello! I'm powered by Google Gemini AI and specialized in Kerala agriculture. I can analyze your crop photos, identify diseases and pests, recommend fertilizers, provide weather guidance, and help with organic farming. Upload photos or ask questions in English or Malayalam!"
        : "ഹലോ! ഞാൻ Google Gemini AI ആധാരിതവും കേരള കൃഷിയിൽ സ്പെഷ്യലൈസ്ഡുമാണ്. നിങ്ങളുടെ വിള ഫോട്ടോകൾ വിശകലനം ചെയ്യാനും രോഗങ്ങളും കീടങ്ങളും തിരിച്ചറിയാനും വള ശുപാർശ ചെയ്യാനും കാലാവസ്ഥാ മാർഗ്ഗനിർദ്ദേശം നൽകാനും ജൈവ കൃഷിയെ സഹായിക്കാനും എനിക്ക് കഴിയും. ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുകയോ ഇംഗ്ലീഷിലോ മലയാളത്തിലോ ചോദ്യങ്ങൾ ചോദിക്കുകയോ ചെയ്യുക!",
      sender: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [geminiService] = useState(new GeminiAgricultureService());
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setSelectedImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const processMessage = async (userMessage: string): Promise<ChatResponse> => {
    const query: ChatQuery = {
      id: Date.now().toString(),
      userId: 'user_1',
      message: userMessage,
      language: language,
      images: selectedImages.length > 0 ? selectedImages : undefined,
      location: {
        district: 'Kerala', // This could be dynamic based on user location
        panchayat: 'Unknown'
      },
      timestamp: new Date()
    };

    // Use Gemini AI for processing
    if (selectedImages.length > 0) {
      return await geminiService.processImageQuery(query, selectedImages);
    } else {
      return await geminiService.processAgricultureQuery(query);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
      images: selectedImages.length > 0 ? [...selectedImages] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setSelectedImages([]);
    setIsLoading(true);

    try {
      const response = await processMessage(currentInput);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'en' ? response.shortAnswer : (response.shortAnswerMalayalam || response.shortAnswer),
        sender: 'assistant',
        timestamp: new Date(),
        response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: language === 'en' 
          ? "Sorry, I encountered an error. Please try again or contact support."
          : "ക്ഷമിക്കണം, എനിക്ക് ഒരു പിശക് നേരിട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുകയോ സപ്പോർട്ടുമായി ബന്ധപ്പെടുകയോ ചെയ്യുക.",
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input functionality would be implemented here
  };

  const clearImages = () => {
    setSelectedImages([]);
  };

  const quickReplies = language === 'en' ? [
    "Weather forecast",
    "Pest control",
    "Disease identification",
    "Market prices",
    "Organic farming",
    "Irrigation help"
  ] : [
    "കാലാവസ്ഥാ പ്രവചനം",
    "കീട നിയന്ത്രണം", 
    "രോഗ തിരിച്ചറിയൽ",
    "മാർക്കറ്റ് വില",
    "ജൈവ കൃഷി",
    "നനയ്ക്കൽ സഹായം"
  ];

  const renderExpertResponse = (response: ChatResponse) => {
    const currentLang = language === 'en';
    
    return (
      <div className="space-y-4 mt-3">
        {/* Why Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {currentLang ? "Why This Matters" : "എന്തുകൊണ്ട് ഇത് പ്രധാനം"}
            </span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {currentLang ? response.why : (response.whyMalayalam || response.why)}
          </p>
        </div>

        {/* Immediate Steps */}
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {currentLang ? "Immediate Actions" : "ഉടനടി നടപടികൾ"}
            </span>
          </div>
          <ul className="space-y-1">
            {(currentLang ? response.immediateSteps : (response.immediateStepsMalayalam || response.immediateSteps)).map((step, index) => (
              <li key={index} className="text-sm text-green-700 dark:text-green-300 flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Preventive Steps */}
        {response.preventiveSteps && response.preventiveSteps.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {currentLang ? "Prevention & Long-term Care" : "പ്രതിരോധവും ദീർഘകാല പരിചരണവും"}
              </span>
            </div>
            <ul className="space-y-1">
              {(currentLang ? response.preventiveSteps : (response.preventiveStepsMalayalam || response.preventiveSteps)).map((step, index) => (
                <li key={index} className="text-sm text-yellow-700 dark:text-yellow-300 flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Note */}
        {response.safetyNote && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <strong>{currentLang ? "Safety:" : "സുരക്ഷ:"}</strong> {currentLang ? response.safetyNote : (response.safetyNoteMalayalam || response.safetyNote)}
            </AlertDescription>
          </Alert>
        )}

        {/* Confidence and Intent */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Badge variant={response.confidence > 0.8 ? "default" : response.confidence > 0.5 ? "secondary" : "destructive"}>
            {Math.round(response.confidence * 100)}% {currentLang ? "confident" : "ആത്മവിശ്വാസം"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {response.intent.replace('_', ' ')}
          </Badge>
          {response.escalateToHuman && (
            <Badge variant="destructive" className="text-xs">
              {currentLang ? "Expert review needed" : "വിദഗ്ധ അവലോകനം ആവശ്യം"}
            </Badge>
          )}
        </div>

        {/* Next Info Needed */}
        {response.nextInfoNeeded && (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                {currentLang ? "Need More Info:" : "കൂടുതൽ വിവരങ്ങൾ ആവശ്യം:"}
              </span>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {currentLang ? response.nextInfoNeeded : (response.nextInfoNeededMalayalam || response.nextInfoNeeded)}
            </p>
          </div>
        )}

        {/* Feedback Buttons */}
        {response.intent !== 'greeting' && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {currentLang ? "Was this response helpful?" : "ഈ ഉത്തരം സഹായകരമായിരുന്നോ?"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                className="flex items-center gap-2 bg-green-100 border-2 border-green-500 text-green-800 hover:bg-green-200 font-semibold shadow-lg"
                onClick={() => {
                  const feedback = createFeedbackButtons(response.id, 'user123');
                  feedback.helpful();
                  alert(currentLang ? "Thank you for your feedback!" : "ഫീഡ്‌ബാക്കിന് നന്ദി!");
                }}
              >
                <ThumbsUp className="h-4 w-4" />
                {currentLang ? "👍 Helpful" : "👍 ഉപകാരപ്രദം"}
              </Button>
              
              <Button 
                size="sm" 
                className="flex items-center gap-2 bg-red-100 border-2 border-red-500 text-red-800 hover:bg-red-200 font-semibold shadow-lg"
                onClick={() => {
                  const feedback = createFeedbackButtons(response.id, 'user123');
                  feedback.notHelpful();
                  alert(currentLang ? "Thanks for letting us know!" : "അറിയിച്ചതിന് നന്ദി!");
                }}
              >
                <ThumbsDown className="h-4 w-4" />
                {currentLang ? "👎 Not Helpful" : "👎 ഉപകാരമില്ല"}
              </Button>
            
              {(response.shouldEscalate || (response.confidence && response.confidence < 0.7)) && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-2 bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100 hover:border-orange-400 transition-all duration-200"
                  onClick={() => {
                    const feedback = createFeedbackButtons(response.id, 'user123');
                    feedback.requestExpert();
                  }}
                >
                  <Users className="h-3 w-3" />
                  {currentLang ? "Ask Expert" : "വിദഗ്ധനോട് ചോദിക്കൂ"}
                </Button>
              )}
              
              {/* Confidence Display */}
              {response.confidenceCategory && (
                <Badge variant="secondary" className="ml-auto">
                  {response.confidenceCategory}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-background">
      {/* Chat Header */}
      <div className="farming-card mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{t('chat.title')}</h3>
            <p className="text-sm text-farming-light">
              {language === 'en' 
                ? "Powered by Gemini AI • Kerala Agriculture Expert • Disease ID • Pest Control"
                : "Gemini AI ആധാരിത • കേരള കൃഷി വിദഗ്ധൻ • രോഗ തിരിച്ചറിയൽ • കീട നിയന്ത്രണം"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-lg ${
                message.sender === 'user'
                  ? 'chat-bubble-user ml-auto'
                  : 'chat-bubble-assistant mr-auto'
              }`}
            >
              {/* User message with images */}
              {message.sender === 'user' && (
                <div>
                  {message.images && message.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {message.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>
              )}
              
              {/* Assistant message with expert response */}
              {message.sender === 'assistant' && (
                <div>
                  <p className="text-sm font-medium mb-2">{message.content}</p>
                  {message.response && renderExpertResponse(message.response)}
                </div>
              )}
              
              <span className={`text-xs mt-2 block ${
                message.sender === 'user' ? 'text-farming-light' : 'opacity-70'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble-assistant mr-auto flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">
                {language === 'en' ? "Gemini AI analyzing your farming question..." : "Gemini AI നിങ്ങളുടെ കാർഷിക ചോദ്യം വിശകലനം ചെയ്യുന്നു..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="mb-4 farming-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {language === 'en' ? "Selected Images:" : "തിരഞ്ഞെടുത്ത ചിത്രങ്ങൾ:"}
            </span>
            <Button variant="ghost" size="sm" onClick={clearImages} className="text-xs">
              {language === 'en' ? "Clear" : "മായ്ക്കുക"}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {selectedImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Selected ${index + 1}`}
                className="w-full h-16 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Replies */}
      <div className="mb-4">
        <p className="text-sm text-farming-light mb-2">
          {language === 'en' ? "Quick actions:" : "വേഗത്തിലുള്ള പ്രവർത്തനങ്ങൾ:"}
        </p>
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="farming-button-secondary text-xs"
              onClick={() => setInput(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="farming-card">
        <div className="flex items-center space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'en' 
              ? "Describe your farming question or upload crop photos..." 
              : "നിങ്ങളുടെ കാർഷിക ചോദ്യം വിവരിക്കുക അല്ലെങ്കിൽ വിള ഫോട്ടോകൾ അപ്‌ലോഡ് ചെയ്യുക..."}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-farming-light hover:text-foreground"
          >
            <Camera className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoiceInput}
            className={`p-2 ${isListening ? 'bg-red-100 text-red-600' : 'text-farming-light'}`}
          >
            <Mic className="h-4 w-4" />
          </Button>

          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="farming-button-primary"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-farming-light mt-2">
          {language === 'en' 
            ? "Powered by Google Gemini AI • Malayalam & English • Advanced Photo Analysis • Kerala Agriculture"
            : "Google Gemini AI ആധാരിത • മലയാളം & ഇംഗ്ലീഷ് • വിപുലമായ ഫോട്ടോ വിശകലനം • കേരള കൃഷി"
          }
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;