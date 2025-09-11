import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, Award } from 'lucide-react';
import heroImage from '@assets/generated_images/CPR_training_hero_image_7815ecc9.png';

export default function Hero() {
  const handleRegisterClick = () => {
    console.log('Navigate to class registration');
    // TODO: Implement navigation to class registration
  };

  const handleLearnMoreClick = () => {
    console.log('Navigate to about section');
    // TODO: Implement scroll to about section
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage}
          alt="Professional CPR Training"
          className="w-full h-full object-cover"
        />
        {/* Dark wash overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="max-w-2xl">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Save Lives with 
            <span className="text-primary"> AHA Certified</span> CPR Training
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 leading-relaxed">
            Professional CPR and life support training courses taught by certified instructors. 
            Learn the skills that matter when every second counts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={handleRegisterClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-register-now"
            >
              Register for Classes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleLearnMoreClick}
              className="bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AHA Certified</h3>
                <p className="text-sm text-gray-300">Official Training Center</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">500+ Students</h3>
                <p className="text-sm text-gray-300">Trained Successfully</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Expert Instructor</h3>
                <p className="text-sm text-gray-300">Years of Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}