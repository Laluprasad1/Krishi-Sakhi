import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface EmailVerificationProps {
  onClose: () => void;
}

const EmailVerification = ({ onClose }: EmailVerificationProps) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const { currentUser, sendVerificationEmail, logout, error, clearError } = useAuth();
  const { t } = useLanguage();

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendSuccess(false);
    clearError();
    
    try {
      await sendVerificationEmail();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error('Error sending verification email:', err);
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!currentUser || currentUser.emailVerified) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg mx-auto">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-700 bg-clip-text text-transparent">
              {t('auth.verifyEmail')}
            </CardTitle>
            <CardDescription className="text-muted-foreground px-2">
              We've sent a verification link to:
              <br />
              <strong className="text-foreground text-base">{currentUser.email}</strong>
            </CardDescription>
          </CardHeader>

        <CardContent className="space-y-6 px-8 pb-8">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resendSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {t('auth.verificationSent')}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground space-y-2">
            <p>{t('auth.emailNotVerified')}</p>
            <p>Please check your email inbox and click the verification link to continue.</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              variant="outline"
              className="w-full h-12 border-2 font-medium"
            >
              {isResending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-5 w-5" />
              )}
              {t('auth.resendVerification')}
            </Button>

            <Button
              onClick={handleRefresh}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              I've verified my email
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full h-11 text-muted-foreground hover:text-foreground"
            >
              {t('auth.logout')}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Didn't receive the email? Check your spam folder or try resending.
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
