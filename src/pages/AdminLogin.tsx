import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLoginProps {
  onAdminLogin: (isAdmin: boolean) => void;
  currentLang: boolean;
}

const ADMIN_EMAIL = 'maheshch1094@gmail.com';

export default function AdminLogin({ onAdminLogin, currentLang }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Admin authentication - only allow specific email
    if (email === ADMIN_EMAIL && password === '@Mahesh06') {
      // Store admin session
      localStorage.setItem('krishiSakhiAdmin', JSON.stringify({
        email: ADMIN_EMAIL,
        isAdmin: true,
        loginTime: new Date().toISOString()
      }));
      onAdminLogin(true);
    } else {
      setError(currentLang 
        ? 'തെറ്റായ ഇമെയിൽ ഐഡി അല്ലെങ്കിൽ പാസ്‌വേർഡ്. ആഡ്മിൻ ആക്‌സസ് പരിമിതമാണ്.'
        : 'Invalid email or password. Admin access is restricted.'
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            {currentLang ? 'അഡ്മിൻ ലോഗിൻ' : 'Admin Login'}
          </CardTitle>
          <CardDescription>
            {currentLang 
              ? 'കൃഷി സഖി ഡാഷ്‌ബോർഡ് ആക്‌സസ് ചെയ്യുക'
              : 'Access Krishi Sakhi Admin Dashboard'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">
                {currentLang ? 'ഇമെയിൽ വിലാസം' : 'Email Address'}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentLang ? 'ഇമെയിൽ വിലാസം നൽകുക' : 'Enter your email'}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {currentLang ? 'പാസ്‌വേർഡ്' : 'Password'}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={currentLang ? 'പാസ്‌വേർഡ് നൽകുക' : 'Enter your password'}
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="text-amber-800">
                {currentLang 
                  ? '⚠️ ആഡ്മിൻ ആക്‌സസ് maheshch1094@gmail.com മാത്രമായി പരിമിതപ്പെടുത്തിയിരിക്കുന്നു'
                  : '⚠️ Admin access is restricted to maheshch1094@gmail.com only'
                }
              </p>
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
                  <Shield className="h-4 w-4" />
                  {currentLang ? 'ആഡ്മിൻ ലോഗിൻ' : 'Admin Login'}
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              {currentLang 
                ? 'ഉപഭോക്താവായി തിരിച്ചുപോകണോ?'
                : 'Want to go back as customer?'
              }
            </p>
            <Button 
              variant="link" 
              onClick={() => onAdminLogin(false)}
              className="text-green-600 hover:text-green-700"
            >
              {currentLang ? 'ഉപഭോക്തൃ പോർട്ടൽ' : 'Customer Portal'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}