import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localLoading, setLocalLoading] = useState(false);

  const { login, loginWithGoogle, error, clearError } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localLoading) return;

    clearError();
    setLocalLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      console.error('Login error:', err);
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
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      console.error('Google login error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header with back button */}
      <div className="p-4 md:p-6">
        <Link 
          to="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md mx-auto">
          {/* Logo/Brand */}
          <div className="text-center mb-6 md:mb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-primary-foreground font-bold text-xl">KS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{t('auth.login')}</h1>
            <p className="text-muted-foreground text-sm md:text-base">Welcome back to Krishi Sakhi</p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4 md:mb-6 bg-destructive/10 border-destructive/20 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 md:h-12 mb-4 md:mb-6 farming-button-secondary transition-[var(--transition-smooth)]"
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

          {/* Divider */}
          <div className="relative mb-4 md:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-4 text-muted-foreground">or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-sm font-medium text-foreground">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="pl-10 md:pl-12 h-11 md:h-12 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary transition-colors"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-sm font-medium text-foreground">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 md:pl-12 pr-10 md:pr-12 h-11 md:h-12 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary transition-colors"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {/* Login Button */}
            <Button 
              type="submit" 
              className="w-full h-11 md:h-12 farming-button-primary font-semibold transition-[var(--transition-smooth)] mt-6" 
              disabled={localLoading}
            >
              {localLoading ? (
                <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" />
              ) : null}
              {t('auth.login')}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6 md:mt-8 pt-4 border-t border-border">
            <p className="text-muted-foreground text-sm md:text-base">
              {t('auth.dontHaveAccount')}{' '}
              <Link 
                to="/signup" 
                className="text-foreground hover:underline font-medium"
              >
                {t('auth.signup')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
