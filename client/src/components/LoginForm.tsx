import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function LoginForm() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome to CPR Training</CardTitle>
            <CardDescription>
              Sign in to access your training records, register for classes, and manage your certifications
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Button 
              onClick={handleLogin}
              className="w-full"
              data-testid="button-login"
              disabled={isLoading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Redirecting..." : "Sign In with Replit"}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Login with your Replit account to access the platform.</p>
              <p className="mt-2">Supports Google, GitHub, email/password, and more.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}