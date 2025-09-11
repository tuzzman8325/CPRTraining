import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Award, GraduationCap, Users, Clock } from 'lucide-react';
import instructorImage from '@assets/generated_images/Instructor_professional_headshot_3df231f9.png';

export default function InstructorProfile() {
  const handleContact = (method: 'phone' | 'email') => {
    console.log(`Contact instructor via ${method}`);
    // TODO: Implement contact functionality
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Meet Your Instructor</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn from a certified professional with years of experience in emergency medical training
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-3 gap-0">
                {/* Profile Image */}
                <div className="md:col-span-1">
                  <div className="aspect-square md:aspect-auto md:h-full overflow-hidden">
                    <img 
                      src={instructorImage}
                      alt="Professional Instructor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Profile Information */}
                <div className="md:col-span-2 p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Sarah Johnson, RN</h3>
                      <p className="text-lg text-primary font-semibold mb-4">
                        AHA Certified Instructor
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        With over 10 years of experience in emergency medicine and training, 
                        Sarah brings real-world expertise to every class. As a registered nurse 
                        and certified AHA instructor, she has trained hundreds of healthcare 
                        professionals and community members in life-saving techniques.
                      </p>
                    </div>

                    {/* Credentials */}
                    <div>
                      <h4 className="font-semibold mb-3">Certifications & Experience</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-sm">
                          <Award className="h-4 w-4 text-primary" />
                          <span>AHA BLS Instructor</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span>Registered Nurse (RN)</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Users className="h-4 w-4 text-primary" />
                          <span>500+ Students Trained</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>10+ Years Experience</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Emergency Medicine</Badge>
                        <Badge variant="secondary">Critical Care</Badge>
                        <Badge variant="secondary">Pediatric CPR</Badge>
                        <Badge variant="secondary">ACLS</Badge>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-t pt-6">
                      <h4 className="font-semibold mb-3">Get in Touch</h4>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          variant="outline" 
                          onClick={() => handleContact('phone')}
                          className="flex items-center space-x-2"
                          data-testid="button-call-instructor"
                        >
                          <Phone className="h-4 w-4" />
                          <span>(555) 123-4567</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleContact('email')}
                          className="flex items-center space-x-2"
                          data-testid="button-email-instructor"
                        >
                          <Mail className="h-4 w-4" />
                          <span>sarah@lifesavercpr.com</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}