import { Button } from "@/components/ui/button";
import { MessageCircle, Users, BarChart3, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-farmer.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-foreground">
                {t('hero.title')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="farming-button-primary px-8 py-6 text-lg"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {t('hero.cta')}
              </Button>
              
              {currentUser ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      size="lg"
                      className="farming-button-secondary px-8 py-6 text-lg w-full sm:w-auto"
                    >
                      <BarChart3 className="mr-2 h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/crop-twin">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-6 text-lg w-full sm:w-auto hover:from-green-700 hover:to-blue-700"
                    >
                      <Brain className="mr-2 h-5 w-5" />
                      Digital Bandhu
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  className="farming-button-secondary px-8 py-6 text-lg"
                >
                  <Users className="mr-2 h-5 w-5" />
                  {t('nav.features')}
                </Button>
              )}
            </div>

            {/* Marketplace Quick Access */}
            {currentUser && (
              <div className="pt-4">
                <Link to="/dashboard?tab=marketplace">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 text-lg w-full sm:w-auto hover:from-orange-600 hover:to-red-600 shadow-lg"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    🛒 കൃഷി മാർക്കറ്റ് | Krishi Market
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  വിത്തുകൾ, വളങ്ങൾ, ഉപകരണങ്ങൾ വാങ്ങാനും വിൽക്കാനും | Buy & Sell Seeds, Fertilizers, Tools
                </p>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-farming">
              <p className="text-sm text-farming-light mb-2">Trusted by Kerala farmers</p>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>✓ Malayalam Support</span>
                <span>✓ Voice Input</span>
                <span>✓ Offline Mode</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="farming-card p-0 overflow-hidden">
              <img
                src={heroImage}
                alt="Kerala farmer using Krishi Sakhi mobile app"
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Floating Feature Card */}
            <div className="absolute -bottom-6 -left-6 farming-card bg-primary text-primary-foreground p-4 max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="h-4 w-4" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <p className="text-xs opacity-90">
                "മഴക്കാലത്ത് നെല്ല് കൃഷിക്ക് എന്താണ് ചെയ്യേണ്ടത്?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;