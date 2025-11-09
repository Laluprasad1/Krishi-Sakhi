import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import ChatInterface from "@/components/ChatInterface";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [showChat, setShowChat] = useState(false);
  const { t } = useLanguage();

  if (showChat) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-8 px-4">
          <div className="container mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setShowChat(false)}
                className="text-farming-light hover:text-foreground transition-colors text-sm"
              >
                {t('hero.back')}
              </button>
            </div>
            <ChatInterface />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <div onClick={() => setShowChat(true)} className="cursor-pointer">
          <HeroSection />
        </div>
        <FeaturesSection />
        <AboutSection />
        <ContactSection />
      </main>
    </div>
  );
};

export default Index;
