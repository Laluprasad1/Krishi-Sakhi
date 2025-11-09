import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, User, Mail, Lock, UserPlus, LogIn, Shield } from 'lucide-react';

interface CustomerAuthProps {
  onCustomerLogin: (customerData: any) => void;
  onSwitchToAdmin: () => void;
  currentLang: boolean;
}

export default function CustomerAuth({ onCustomerLogin, onSwitchToAdmin, currentLang }: CustomerAuthProps) {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Registration state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Get customers from localStorage
      const customers = JSON.parse(localStorage.getItem('krishiSakhiCustomers') || '[]');
      const customer = customers.find((c: any) => c.email === loginEmail && c.password === loginPassword);
      
      if (customer) {
        // Store customer session
        const customerSession = {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          isCustomer: true,
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('krishiSakhiCustomer', JSON.stringify(customerSession));
        onCustomerLogin(customerSession);
      } else {
        setError(currentLang 
          ? 'തെറ്റായ ഇമെയിൽ ഐഡി അല്ലെങ്കിൽ പാസ്‌വേർഡ്'
          : 'Invalid email or password'
        );
      }
    } catch (error) {
      setError(currentLang 
        ? 'ലോഗിൻ പ്രശ്‌നം. ദയവായി വീണ്ടും ശ്രമിക്കുക'
        : 'Login failed. Please try again'
      );
    }
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError(currentLang 
        ? 'പാസ്‌വേർഡുകൾ പൊരുത്തപ്പെടുന്നില്ല'
        : 'Passwords do not match'
      );
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError(currentLang 
        ? 'പാസ്‌വേർഡ് കുറഞ്ഞത് 6 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം'
        : 'Password must be at least 6 characters'
      );
      setIsLoading(false);
      return;
    }

    try {
      // Check if email already exists
      const customers = JSON.parse(localStorage.getItem('krishiSakhiCustomers') || '[]');
      const existingCustomer = customers.find((c: any) => c.email === registerData.email);
      
      if (existingCustomer) {
        setError(currentLang 
          ? 'ഈ ഇമെയിൽ ഐഡി ഇതിനകം രജിസ്റ്റർ ചെയ്‌തിട്ടുണ്ട്'
          : 'Email already registered'
        );
        setIsLoading(false);
        return;
      }
      
      // Create new customer
      const newCustomer = {
        id: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: registerData.name,
        email: registerData.email,
        password: registerData.password, // In production, this should be hashed
        phone: registerData.phone,
        isVerified: false,
        createdAt: new Date().toISOString(),
        orders: [],
        addresses: []
      };
      
      customers.push(newCustomer);
      localStorage.setItem('krishiSakhiCustomers', JSON.stringify(customers));
      
      setSuccess(currentLang 
        ? 'രജിസ്ട്രേഷൻ വിജയകരമായി പൂർത്തിയായി! ദയവായി ലോഗിൻ ചെയ്യുക'
        : 'Registration successful! Please login'
      );
      
      // Clear form
      setRegisterData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
      });
      
      // Switch to login tab after 2 seconds
      setTimeout(() => {
        setActiveTab('login');
        setSuccess('');
      }, 2000);
      
    } catch (error) {
      setError(currentLang 
        ? 'രജിസ്ട്രേഷൻ പ്രശ്‌നം. ദയവായി വീണ്ടും ശ്രമിക്കുക'
        : 'Registration failed. Please try again'
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            {currentLang ? 'കൃഷി സഖി മാർക്കറ്റ്‌പ്ലേസ്' : 'Krishi Sakhi Marketplace'}
          </CardTitle>
          <CardDescription>
            {currentLang 
              ? 'കാർഷിക ഉത്പന്നങ്ങൾ വാങ്ങുക, വിൽക്കുക'
              : 'Buy and sell agricultural products'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                {currentLang ? 'ലോഗിൻ' : 'Login'}
              </TabsTrigger>
              <TabsTrigger value="register">
                {currentLang ? 'രജിസ്റ്റർ' : 'Register'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">
                    {currentLang ? 'ഇമെയിൽ വിലാസം' : 'Email Address'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="loginEmail"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={currentLang ? 'ഇമെയിൽ വിലാസം നൽകുക' : 'Enter your email'}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loginPassword">
                    {currentLang ? 'പാസ്‌വേർഡ്' : 'Password'}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="loginPassword"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={currentLang ? 'പാസ്‌വേർഡ് നൽകുക' : 'Enter your password'}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {currentLang ? 'ലോഗിൻ ചെയ്യുന്നു...' : 'Logging in...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      {currentLang ? 'ലോഗിൻ' : 'Login'}
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert>
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="registerName">
                    {currentLang ? 'പൂർണ്ണ പേര്' : 'Full Name'}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="registerName"
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      placeholder={currentLang ? 'നിങ്ങളുടെ പേര് നൽകുക' : 'Enter your full name'}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerEmail">
                    {currentLang ? 'ഇമെയിൽ വിലാസം' : 'Email Address'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="registerEmail"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      placeholder={currentLang ? 'ഇമെയിൽ വിലാസം നൽകുക' : 'Enter your email'}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="registerPhone">
                    {currentLang ? 'ഫോൺ നമ്പർ' : 'Phone Number'}
                  </Label>
                  <Input
                    id="registerPhone"
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    placeholder={currentLang ? 'ഫോൺ നമ്പർ നൽകുക' : 'Enter your phone number'}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">
                      {currentLang ? 'പാസ്‌വേർഡ്' : 'Password'}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="registerPassword"
                        type={showRegPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        placeholder={currentLang ? 'പാസ്‌വേർഡ്' : 'Password'}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                      >
                        {showRegPassword ? (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        ) : (
                          <Eye className="h-3 w-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      {currentLang ? 'കൺഫേം പാസ്‌വേർഡ്' : 'Confirm Password'}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                        placeholder={currentLang ? 'കൺഫേം പാസ്‌വേർഡ്' : 'Confirm Password'}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3 w-3 text-gray-400" />
                        ) : (
                          <Eye className="h-3 w-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {currentLang ? 'രജിസ്റ്റർ ചെയ്യുന്നു...' : 'Registering...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      {currentLang ? 'രജിസ്റ്റർ ചെയ്യുക' : 'Register'}
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  {currentLang ? 'അല്ലെങ്കിൽ' : 'Or'}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onSwitchToAdmin}
              className="w-full mt-3 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              <Shield className="h-4 w-4 mr-2" />
              {currentLang ? 'അഡ്മിൻ ലോഗിൻ' : 'Admin Login'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}