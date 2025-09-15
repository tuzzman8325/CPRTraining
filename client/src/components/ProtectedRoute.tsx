import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Show notification and redirect to Replit Auth
        toast({
          title: "Authentication Required",
          description: "You need to log in to access this page.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }

      if (requireAdmin && !isAdmin) {
        // Show notification and redirect to home if admin required but user is not admin
        toast({
          title: "Access Denied",
          description: "Admin privileges are required to access this page.",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation('/');
        }, 500);
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, setLocation, toast]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated or not admin when required
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}