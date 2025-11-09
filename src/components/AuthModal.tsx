import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) => {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [localLoading, setLocalLoading] = useState(false);

  const { login, signup, loginWithGoogle, error, clearError } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localLoading) return;

    clearError();
    setLocalLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        onClose();
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await signup(formData.email, formData.password, formData.name);
        // Keep modal open to show verification message
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (localLoading) return;
    
    clearError();
    setLocalLoading(true);
    
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error('Google auth error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-3 text-center pb-6">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              {mode === 'login' ? t('auth.login') : t('auth.signup')}
            </CardTitle>
            <CardDescription className="text-muted-foreground px-2">
              {mode === 'login' 
                ? 'Welcome back! Sign in to access your farming dashboard'
                : 'Join our farming community and get started today'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base border-2 hover:border-google-blue hover:shadow-md transition-all duration-200"
            onClick={handleGoogleLogin}
            disabled={localLoading}
          >
            {localLoading ? (
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            ) : (
              <FcGoogle className="mr-3 h-5 w-5" />
            )}
            {t('auth.loginWithGoogle')}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-muted-foreground font-medium">or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('auth.name')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-11 h-12 border-2 focus:border-green-500 transition-colors"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-11 h-12 border-2 focus:border-green-500 transition-colors"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-11 pr-12 h-12 border-2 focus:border-green-500 transition-colors"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-11 h-12 border-2 focus:border-green-500 transition-colors"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 mt-8" 
              disabled={localLoading}
            >
              {localLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : null}
              {mode === 'login' ? t('auth.login') : t('auth.signup')}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center">
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-muted-foreground">
                  {mode === 'login' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
                </span>
              </div>
            </div>
            
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-2 font-medium"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={localLoading}
            >
              {mode === 'login' ? t('auth.signup') : t('auth.login')}
            </Button>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-6">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
              disabled={localLoading}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthModal;
