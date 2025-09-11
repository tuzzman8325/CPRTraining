import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Phone, Mail, Heart, User, Calendar, BookOpen } from 'lucide-react';
import ahaBadge from '@assets/generated_images/AHA_certification_badge_22dd9294.png';

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: Heart },
    { href: '/classes', label: 'Classes', icon: BookOpen },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/login', label: 'Login', icon: User },
  ];

  const isActive = (href: string) => location === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Business Name */}
          <Link href="/" className="flex items-center space-x-3 hover-elevate rounded-lg px-2 py-1" data-testid="link-home">
            <img 
              src={ahaBadge} 
              alt="AHA Certified" 
              className="h-10 w-10"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground">LifeSaver CPR Training</h1>
              <p className="text-xs text-muted-foreground">AHA Certified Training Center</p>
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
          </nav>

          {/* Contact Info - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>(555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>info@lifesavercpr.com</span>
            </div>
          </div>

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
                
                <div className="border-t pt-4 mt-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>(555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>info@lifesavercpr.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}