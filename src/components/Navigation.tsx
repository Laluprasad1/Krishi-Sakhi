import { Button } from "@/components/ui/button";
import { Home, Layers3, Info, Mail, MessageSquare, User, LogOut, Brain } from "lucide-react";
import { ExpandableTabs } from "@/components/ui/expandable-tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import EmailVerification from "@/components/EmailVerification";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { t } = useLanguage();
  const { currentUser, logout } = useAuth();
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = ['hero', 'features', 'about', 'contact'];

  const handleTabChange = (index: number | null) => {
    if (index !== null && sections[index]) {
      scrollToSection(sections[index]);
    }
  };

  const tabs = [
    { title: t('nav.home'), icon: Home },
    { title: t('nav.features'), icon: Layers3 },
    { title: t('nav.about'), icon: Info },
    { title: t('nav.contact'), icon: Mail },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">KS</span>
            </div>
            <span className="font-bold text-lg text-foreground">Krishi Sakhi</span>
          </div>

          {/* Expandable Navigation Tabs */}
          <div className="hidden md:flex">
            <ExpandableTabs 
              tabs={tabs} 
              className="border-border bg-background"
              onChange={handleTabChange}
            />
          </div>

          {/* Language Toggle & Auth */}
          <div className="flex items-center space-x-4">
            {currentUser && (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Layers3 className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/crop-twin">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-blue-50 border-green-300">
                    <Brain className="h-4 w-4" />
                    Crop Twin
                  </Button>
                </Link>
              </>
            )}
            <LanguageSwitcher />

            {currentUser ? (
              <>
                {!currentUser.emailVerified && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    onClick={() => setShowEmailVerification(true)}
                  >
                    Verify Email
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {currentUser.displayName || currentUser.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="farming-button-secondary"
                  >
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    size="sm" 
                    className="farming-button-primary"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {t('auth.signup')}
                  </Button>
                </Link>
              </div>
            )}

            <Button size="sm" className="farming-button-primary hidden sm:inline-flex">
              <MessageSquare className="h-4 w-4 mr-1" />
              {t('nav.chat')}
            </Button>

            {/* Mobile Navigation - Simple tabs for mobile */}
            <div className="md:hidden">
              <ExpandableTabs 
                tabs={tabs.slice(0, 2)} 
                className="border-border bg-background scale-90"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <EmailVerification onClose={() => setShowEmailVerification(false)} />
      )}
    </nav>
  );
};

export default Navigation;