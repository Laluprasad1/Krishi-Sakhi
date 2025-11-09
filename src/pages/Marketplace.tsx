import React, { useState, useEffect } from 'react';
import { MarketplaceProvider } from '@/contexts/MarketplaceContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Store, 
  Users, 
  Shield, 
  Sprout, 
  Leaf,
  Package,
  IndianRupee,
  ArrowRight,
  Star
} from 'lucide-react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import CustomerAuth from './CustomerAuth';
import CustomerShop from './CustomerShop';

interface MarketplaceProps {
  currentLang: boolean;
}

export default function Marketplace({ currentLang }: MarketplaceProps) {
  const [userType, setUserType] = useState<'none' | 'admin' | 'customer'>('none');
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Check for existing sessions on load
  useEffect(() => {
    const savedAdmin = localStorage.getItem('krishiSakhiAdmin');
    const savedCustomer = localStorage.getItem('krishiSakhiCustomer');
    
    if (savedAdmin) {
      try {
        const adminSession = JSON.parse(savedAdmin);
        setAdminData(adminSession);
        setUserType('admin');
        setIsAdminView(true);
        setShowWelcome(false);
      } catch (error) {
        localStorage.removeItem('krishiSakhiAdmin');
      }
    } else if (savedCustomer) {
      try {
        const customerSession = JSON.parse(savedCustomer);
        setCustomerData(customerSession);
        setUserType('customer');
        setIsAdminView(false);
        setShowWelcome(false);
      } catch (error) {
        localStorage.removeItem('krishiSakhiCustomer');
      }
    }
  }, []);

  const handleAdminLogin = (isAdmin: boolean) => {
    if (isAdmin) {
      setUserType('admin');
      setAdminData({ email: 'maheshch1094@gmail.com', isAdmin: true });
      setIsAdminView(true);
    } else {
      setIsAdminView(false);
      setUserType('none');
    }
  };

  const handleCustomerLogin = (customer: any) => {
    setCustomerData(customer);
    setUserType('customer');
    setIsAdminView(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('krishiSakhiAdmin');
    localStorage.removeItem('krishiSakhiCustomer');
    setUserType('none');
    setAdminData(null);
    setCustomerData(null);
    setIsAdminView(false);
  };

  const handleSwitchToAdmin = () => {
    setIsAdminView(true);
    setUserType('none');
    setShowWelcome(false);
  };

  const handleStartShopping = () => {
    setIsAdminView(false);
    setUserType('none');
    setShowWelcome(false);
  };

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Store className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {currentLang ? 'കൃഷി സഖി മാർക്കറ്റ്‌പ്ലേസ്' : 'Krishi Sakhi Marketplace'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {currentLang 
              ? 'കേരളത്തിലെ കർഷകർക്കായി സ്പെഷ്യൽ ഓൺലൈൻ മാർക്കറ്റ്. വിത്തുകൾ, വളങ്ങൾ, ഉപകരണങ്ങൾ വാങ്ങാനും വിൽക്കാനും.'
              : 'Kerala\'s special online marketplace for farmers. Buy & sell seeds, fertilizers, tools and more.'
            }
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">
                {currentLang ? 'വിത്തുകൾ & ചെടികൾ' : 'Seeds & Plants'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                {currentLang 
                  ? 'ഉയർന്ന നിലവാരമുള്ള വിത്തുകൾ, തൈകൾ, ഓർഗാനിക് വിത്തുകൾ'
                  : 'High-quality seeds, saplings, organic varieties'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-blue-800">
                {currentLang ? 'വളങ്ങൾ & കീടനാശിനികൾ' : 'Fertilizers & Pesticides'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                {currentLang 
                  ? 'ജൈവ വളങ്ങൾ, രാസ വളങ്ങൾ, പ്രകൃതിദത്ത കീടനാശിനികൾ'
                  : 'Organic fertilizers, chemical fertilizers, natural pesticides'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-800">
                {currentLang ? 'കാർഷിക ഉപകരണങ്ങൾ' : 'Farming Tools'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                {currentLang 
                  ? 'കാർഷിക യന്ത്രങ്ങൾ, കൈ ഉപകരണങ്ങൾ, ആധുനിക സാങ്കേതികവിദ്യകൾ'
                  : 'Farm machinery, hand tools, modern agricultural technology'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            {currentLang ? 'എന്തുകൊണ്ട് കൃഷി സഖി മാർക്കറ്റ്?' : 'Why Krishi Sakhi Marketplace?'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <IndianRupee className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">
                {currentLang ? 'മികച്ച വില' : 'Best Prices'}
              </h3>
              <p className="text-sm text-gray-600">
                {currentLang ? 'നേരിട്ടുള്ള വിപണനം' : 'Direct from source'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">
                {currentLang ? 'വിശ്വസനീയത' : 'Trusted Quality'}
              </h3>
              <p className="text-sm text-gray-600">
                {currentLang ? 'പരിശോധിച്ച ഉത്പന്നങ്ങൾ' : 'Verified products'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">
                {currentLang ? 'എളുപ്പത്തിൽ ഉപയോഗം' : 'Easy to Use'}
              </h3>
              <p className="text-sm text-gray-600">
                {currentLang ? 'മലയാളം സപ്പോർട്ട്' : 'Malayalam support'}
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">
                {currentLang ? 'കമ്മ്യൂണിറ്റി' : 'Community'}
              </h3>
              <p className="text-sm text-gray-600">
                {currentLang ? 'കർഷക സമൂഹം' : 'Farmer network'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              size="lg" 
              onClick={handleStartShopping}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg flex items-center justify-center"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {currentLang ? 'ഷോപ്പിംഗ് ആരംഭിക്കുക' : 'Start Shopping'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-gray-500 text-sm">
              {currentLang ? 'അല്ലെങ്കിൽ' : 'or'}
            </span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSwitchToAdmin}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Shield className="mr-2 h-4 w-4" />
            {currentLang ? 'അഡ്മിൻ ലോഗിൻ' : 'Admin Login'}
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">500+</div>
            <div className="text-sm text-gray-600">
              {currentLang ? 'ഉത്പന്നങ്ങൾ' : 'Products'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">50+</div>
            <div className="text-sm text-gray-600">
              {currentLang ? 'വിൽപ്പനക്കാർ' : 'Sellers'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">1000+</div>
            <div className="text-sm text-gray-600">
              {currentLang ? 'സന്തുഷ്ട ഉപഭോക്താക്കൾ' : 'Happy Customers'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">
              {currentLang ? 'സപ്പോർട്ട്' : 'Support'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MarketplaceProvider>
      <div className="marketplace-app">
        {showWelcome && userType === 'none' && !isAdminView && (
          <WelcomeScreen />
        )}
        
        {userType === 'none' && isAdminView && !showWelcome && (
          <AdminLogin 
            onAdminLogin={handleAdminLogin}
            currentLang={currentLang}
          />
        )}
        
        {userType === 'none' && !isAdminView && !showWelcome && (
          <CustomerAuth 
            onCustomerLogin={handleCustomerLogin}
            onSwitchToAdmin={handleSwitchToAdmin}
            currentLang={currentLang}
          />
        )}
        
        {userType === 'admin' && (
          <AdminDashboard 
            onLogout={handleLogout}
            currentLang={currentLang}
          />
        )}
        
        {userType === 'customer' && customerData && (
          <CustomerShop 
            customer={customerData}
            onLogout={handleLogout}
            currentLang={currentLang}
          />
        )}
      </div>
    </MarketplaceProvider>
  );
}