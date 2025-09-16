import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, Award } from 'lucide-react';
import { useLocation } from 'wouter';
import heroImage from '@assets/generated_images/CPR_training_hero_image_7815ecc9.png';

export default function Hero() {
  const [, setLocation] = useLocation();
  
  const handleRegisterClick = () => {
    setLocation('/classes');
  };

  const handleLearnMoreClick = () => {
    console.log('Navigate to about section');
    // TODO: Implement scroll to about section
  };

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Save Lives with 
            <span className="text-primary"> AHA Certified</span> CPR Training
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Professional CPR and life support training courses taught by certified instructors. 
            Learn the skills that matter when every second counts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={handleRegisterClick}
              className="min-w-48"
              data-testid="button-register-now"
            >
              View Available Classes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleLearnMoreClick}
              className="min-w-48"
              data-testid="button-learn-more"
            >
              Learn More About Us
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">AHA Certified</h3>
                <p className="text-sm text-muted-foreground">Official Training Center</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">Expert Instruction</h3>
                <p className="text-sm text-muted-foreground">Professional Certified Instructors</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-foreground">Proven Results</h3>
                <p className="text-sm text-muted-foreground">Life-Saving Skills Training</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}