import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Calendar,
  DollarSign,
  Heart,
  Stethoscope
} from 'lucide-react';
import blsImage from '@assets/generated_images/BLS_provider_training_a0cd6457.png';
import heartsaverImage from '@assets/generated_images/Heartsaver_community_training_b3867bec.png';

export default function Classes() {
  const handleRegister = (courseType: string) => {
    console.log(`Register for ${courseType} course`);
    // TODO: Implement registration flow
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">CPR Training Courses</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              American Heart Association certified training courses designed to teach life-saving skills. 
              Choose the course that best fits your professional requirements and skill level.
            </p>
          </div>
        </section>

        {/* Course Details */}
        <section className="py-16">
          <div className="container mx-auto px-4 space-y-16">
            
            {/* BLS Provider Course */}
            <div className="max-w-6xl mx-auto">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-video md:aspect-auto md:h-full overflow-hidden">
                    <img 
                      src={blsImage}
                      alt="BLS Provider Training"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Stethoscope className="h-6 w-6 text-primary" />
                      <Badge className="bg-primary text-primary-foreground">BLS Provider</Badge>
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">Basic Life Support for Healthcare Providers</h2>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      This course is designed for healthcare professionals and trained first responders who provide care to 
                      patients in a wide variety of in-facility and prehospital settings. Students learn high-quality CPR 
                      for adults, children, and infants; use of bag-mask device; and relief of choking.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">4 hours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">Max 12 students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm">$85 per person</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm">2-year certification</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Course Includes:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>High-quality CPR for adults, children, and infants</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Use of automated external defibrillator (AED)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Use of bag-mask device</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Relief of choking in adults, children, and infants</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Team-based resuscitation scenarios</span>
                        </li>
                      </ul>
                    </div>

                    <Button 
                      onClick={() => handleRegister('BLS')}
                      size="lg"
                      className="w-full"
                      data-testid="button-register-bls"
                    >
                      Register for BLS Provider Course
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <Separator className="max-w-6xl mx-auto" />

            {/* Heartsaver Course */}
            <div className="max-w-6xl mx-auto">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-video md:aspect-auto md:h-full overflow-hidden md:order-2">
                    <img 
                      src={heartsaverImage}
                      alt="Heartsaver CPR Training"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 md:order-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Heart className="h-6 w-6 text-primary" />
                      <Badge variant="secondary">Heartsaver</Badge>
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4">Heartsaver CPR AED</h2>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      This course is designed for anyone with little or no medical training who needs a course completion 
                      card for their job, regulatory requirements, or other reasons, or anyone who wants to be prepared 
                      for an emergency in any setting.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">3 hours</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">Max 16 students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm">$65 per person</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm">2-year certification</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Course Includes:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Adult hands-only CPR and CPR with breaths</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Child CPR with breaths</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Infant CPR with breaths</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Use of automated external defibrillator (AED)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span>Relief of choking in adults, children, and infants</span>
                        </li>
                      </ul>
                    </div>

                    <Button 
                      onClick={() => handleRegister('Heartsaver')}
                      size="lg"
                      className="w-full"
                      data-testid="button-register-heartsaver"
                    >
                      Register for Heartsaver Course
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Next Steps Section */}
            <div className="max-w-4xl mx-auto text-center">
              <Card className="p-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Calendar className="h-6 w-6" />
                    <span>Ready to Get Started?</span>
                  </CardTitle>
                  <CardDescription className="text-lg">
                    View our upcoming class schedule and register for the course that fits your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button variant="outline" size="lg" data-testid="button-view-schedule">
                      <Calendar className="mr-2 h-5 w-5" />
                      View Class Schedule
                    </Button>
                    <Button variant="outline" size="lg" data-testid="button-contact-instructor">
                      Contact Instructor
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Have questions? Contact us at (555) 123-4567 or info@lifesavercpr.com
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}