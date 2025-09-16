import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MapPin, Clock, Download, Heart, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PDFService, fetchClassesForPDF } from '@/lib/pdfService';
import ahaBadge from '@assets/generated_images/AHA_certification_badge_22dd9294.png';

export default function Footer() {
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownloadFlyer = async (type: string) => {
    setIsDownloading(type);
    
    try {
      // Fetch the latest classes data
      const classes = await fetchClassesForPDF();
      
      let result;
      switch (type) {
        case 'bls':
          result = await PDFService.downloadBLSFlyer(classes);
          break;
        case 'heartsaver':
          result = await PDFService.downloadHeartsaverFlyer(classes);
          break;
        case 'schedule':
          result = await PDFService.downloadClassSchedule(classes);
          break;
        default:
          throw new Error('Invalid flyer type');
      }
      
      if (result.success) {
        toast({
          title: 'Download Started',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} flyer is being downloaded.`,
        });
      } else {
        throw new Error(result.error || 'Failed to generate PDF');
      }
    } catch (error) {
      console.error(`Error downloading ${type} flyer:`, error);
      toast({
        title: 'Download Failed',
        description: `Failed to download ${type} flyer. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(null);
    }
  };

  const handleContactClick = (method: string) => {
    console.log(`Contact via ${method}`);
    // TODO: Implement contact functionality
  };

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Business Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src={ahaBadge} 
                alt="AHA Certified" 
                className="h-12 w-12"
              />
              <div>
                <h3 className="text-lg font-bold">LifeSaver CPR Training</h3>
                <p className="text-sm text-muted-foreground">AHA Certified Instructor</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional CPR and life support training serving our community with 
              American Heart Association certified instruction.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Saving lives through education</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Information</h4>
            <div className="space-y-3 text-sm">
              <button 
                onClick={() => handleContactClick('phone')}
                className="flex items-center space-x-2 hover-elevate rounded p-1 -m-1 w-full text-left"
                data-testid="button-contact-phone"
              >
                <Phone className="h-4 w-4 text-primary" />
                <span>(555) 123-4567</span>
              </button>
              
              <button 
                onClick={() => handleContactClick('email')}
                className="flex items-center space-x-2 hover-elevate rounded p-1 -m-1 w-full text-left"
                data-testid="button-contact-email"
              >
                <Mail className="h-4 w-4 text-primary" />
                <span>info@lifesavercpr.com</span>
              </button>
              
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <p>123 Training Center Lane</p>
                  <p>Medical Plaza, Suite 200</p>
                  <p>Healthcare City, HC 12345</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hours & Classes */}
          <div className="space-y-4">
            <h4 className="font-semibold">Training Hours</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Monday - Friday: 9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Saturday: 9:00 AM - 4:00 PM</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Sunday: By Appointment</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Available Courses:</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• BLS Provider (Healthcare Professionals)</li>
                <li>• Heartsaver CPR (Community Members)</li>
                <li>• CPR Renewal Courses</li>
                <li>• Group Training Available</li>
              </ul>
            </div>
          </div>

          {/* Downloads */}
          <div className="space-y-4">
            <h4 className="font-semibold">Download Materials</h4>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDownloadFlyer('bls')}
                disabled={isDownloading === 'bls'}
                className="w-full justify-start"
                data-testid="button-download-bls"
              >
                {isDownloading === 'bls' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isDownloading === 'bls' ? 'Generating...' : 'BLS Course Flyer'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDownloadFlyer('heartsaver')}
                disabled={isDownloading === 'heartsaver'}
                className="w-full justify-start"
                data-testid="button-download-heartsaver"
              >
                {isDownloading === 'heartsaver' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isDownloading === 'heartsaver' ? 'Generating...' : 'Heartsaver Flyer'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleDownloadFlyer('schedule')}
                disabled={isDownloading === 'schedule'}
                className="w-full justify-start"
                data-testid="button-download-schedule"
              >
                {isDownloading === 'schedule' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isDownloading === 'schedule' ? 'Generating...' : 'Class Schedule'}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p>All materials are provided in PDF format and include detailed course information, pricing, and registration instructions.</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            <p>&copy; 2024 LifeSaver CPR Training. All rights reserved.</p>
            <p>AHA Certified Instructor | Professional Training Standards</p>
          </div>
          
          <div className="text-sm text-muted-foreground text-center md:text-right">
            <p>American Heart Association Certified</p>
            <p>Professional Training Standards</p>
          </div>
        </div>
      </div>
    </footer>
  );
}