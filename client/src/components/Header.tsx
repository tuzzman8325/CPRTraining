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
import ecgLogo from '@assets/generated_images/ECG_heartbeat_blip_logo_8ad5d5c7.png';

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative overflow-hidden">
      {/* ECG Paper Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]" 
           style={{
             backgroundImage: `
               linear-gradient(to right, #dc2626 0.5px, transparent 0.5px),
               linear-gradient(to bottom, #dc2626 0.5px, transparent 0.5px),
               linear-gradient(to right, #dc2626 1px, transparent 1px),
               linear-gradient(to bottom, #dc2626 1px, transparent 1px)
             `,
             backgroundSize: '5px 5px, 5px 5px, 25px 25px, 25px 25px'
           }} 
      />
      
      {/* ECG Rhythm Line with Heartbeat Pattern */}
      <div className="absolute inset-0 flex items-center overflow-hidden">
        <div className="w-full h-px relative">
          <svg 
            className="absolute left-0 top-0 w-full h-8 -translate-y-1/2" 
            viewBox="0 0 800 32" 
            style={{
              opacity: 0.12,
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 70%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 70%, transparent 100%)'
            }}
          >
            <path 
              d="M0,16 L100,16 L110,16 L115,8 L120,24 L130,4 L135,28 L140,16 L150,16 L800,16" 
              stroke="#dc2626" 
              strokeWidth="1.5" 
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="flex h-16 items-center justify-between">
          {/* Business Name with ECG Integration */}
          <Link href="/" className="flex items-center space-x-3 hover-elevate rounded-lg px-2 py-1 relative" data-testid="link-home">
            <div className="flex flex-col relative">
              <h1 className="text-lg font-bold text-foreground relative z-10 bg-background/80 px-2 py-1 rounded">LifeSaver CPR Training</h1>
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