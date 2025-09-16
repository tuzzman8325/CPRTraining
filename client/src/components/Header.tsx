import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Menu, Phone, Mail, Heart, User, Calendar, BookOpen, Settings, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ahaLogo from '@assets/generated_images/AHA_heart_torch_logo_550880cc.png';

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Heart },
    { href: '/classes', label: 'Classes', icon: BookOpen },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/about', label: 'About Us', icon: User },
  ];

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Business Name */}
          <Link href="/" className="flex items-center space-x-3 hover-elevate rounded-lg px-2 py-1" data-testid="link-home">
            <img 
              src={ahaLogo} 
              alt="American Heart Association" 
              className="h-12 w-12"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground">LifeSaver CPR Training</h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant={isActive(href) ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                  data-testid={`link-${label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
            
            {/* Auth Section */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2" data-testid="button-user-menu">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.username}
                    <div className="text-xs text-muted-foreground">
                      {isAdmin ? 'Administrator' : 'Client'}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-2 w-full">
                          <Shield className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button
                  variant={isActive('/login') ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                  data-testid="link-login"
                >
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </nav>


          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                {/* User Status - Mobile */}
                {isAuthenticated && (
                  <div className="px-3 py-2 bg-muted rounded-lg">
                    <div className="font-medium">{user?.username}</div>
                    <div className="text-sm text-muted-foreground">
                      <span>{isAdmin ? 'Administrator' : 'Client'}</span>
                    </div>
                  </div>
                )}
                
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive(href) ? "default" : "ghost"}
                      className="w-full justify-start space-x-2"
                      data-testid={`mobile-link-${label.toLowerCase()}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Button>
                  </Link>
                ))}
                
                {/* Auth Actions - Mobile */}
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start space-x-2"
                          data-testid="mobile-link-admin"
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full justify-start space-x-2"
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      data-testid="mobile-button-logout"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </Button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive('/login') ? "default" : "ghost"}
                      className="w-full justify-start space-x-2"
                      data-testid="mobile-link-login"
                    >
                      <User className="h-4 w-4" />
                      <span>Login</span>
                    </Button>
                  </Link>
                )}
                
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}