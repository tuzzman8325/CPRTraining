import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ClassCard from '@/components/ClassCard';
import InstructorProfile from '@/components/InstructorProfile';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Class } from '@shared/schema';
import { format } from 'date-fns';
import blsImage from '@assets/generated_images/BLS_provider_training_a0cd6457.png';
import heartsaverImage from '@assets/generated_images/Heartsaver_community_training_b3867bec.png';

export default function Home() {
  // Fetch classes data
  const { data: classesResponse, isLoading } = useQuery<{ success: boolean; classes: Class[] }>({
    queryKey: ['/api/classes'],
  });

  const classes = classesResponse?.classes || [];

  // Process classes to find next upcoming class for each type
  const getNextClass = (type: 'BLS' | 'Heartsaver') => {
    const today = new Date();
    // Set to start of day to properly compare with class dates
    today.setHours(0, 0, 0, 0);
    
    const typeClasses = classes
      .filter(c => c.type === type)
      .filter(c => {
        const classDate = new Date(c.date);
        return classDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return typeClasses[0] || null;
  };

  const nextBLSClass = getNextClass('BLS');
  const nextHeartsaverClass = getNextClass('Heartsaver');

  const handleClassRegister = (type: string) => {
    console.log(`Register for ${type} class`);
    // TODO: Implement registration flow
  };

  const handleClassLearnMore = (type: string) => {
    console.log(`Learn more about ${type} class`);
    // TODO: Navigate to class details
  };

  // Loading state component
  const ClassCardSkeleton = () => (
    <div className="bg-card border border-border rounded-lg p-6">
      <Skeleton className="h-48 w-full mb-4 rounded" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Classes Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Available Training Courses</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose from our American Heart Association certified CPR courses designed for 
                different skill levels and professional requirements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
              {isLoading ? (
                <>
                  <ClassCardSkeleton />
                  <ClassCardSkeleton />
                </>
              ) : (
                <>
                  {/* BLS Class Card */}
                  {nextBLSClass ? (
                    <ClassCard
                      title={nextBLSClass.title}
                      description={`Advanced life support training for healthcare professionals, first responders, and emergency medical personnel. Includes high-quality CPR, use of bag-mask device, and team-based resuscitation. ${nextBLSClass.capacity - nextBLSClass.available} students enrolled, ${nextBLSClass.available} spots remaining.`}
                      duration={nextBLSClass.duration}
                      capacity={nextBLSClass.capacity}
                      price={nextBLSClass.price}
                      nextDate={`${format(new Date(nextBLSClass.date), 'MMMM d, yyyy')} at ${nextBLSClass.time}`}
                      image={blsImage}
                      type="BLS"
                      onRegister={() => handleClassRegister('BLS')}
                      onLearnMore={() => handleClassLearnMore('BLS')}
                    />
                  ) : (
                    <ClassCard
                      title="BLS Provider"
                      description="Advanced life support training for healthcare professionals, first responders, and emergency medical personnel. Includes high-quality CPR, use of bag-mask device, and team-based resuscitation."
                      duration="4 hours"
                      capacity={12}
                      price={85}
                      nextDate="No upcoming classes scheduled"
                      image={blsImage}
                      type="BLS"
                      onRegister={() => handleClassRegister('BLS')}
                      onLearnMore={() => handleClassLearnMore('BLS')}
                    />
                  )}
                  
                  {/* Heartsaver Class Card */}
                  {nextHeartsaverClass ? (
                    <ClassCard
                      title={nextHeartsaverClass.title}
                      description={`Essential CPR and AED training for community members, teachers, coaches, and lay rescuers. Perfect for those who want to learn life-saving skills for family and community. ${nextHeartsaverClass.capacity - nextHeartsaverClass.available} students enrolled, ${nextHeartsaverClass.available} spots remaining.`}
                      duration={nextHeartsaverClass.duration}
                      capacity={nextHeartsaverClass.capacity}
                      price={nextHeartsaverClass.price}
                      nextDate={`${format(new Date(nextHeartsaverClass.date), 'MMMM d, yyyy')} at ${nextHeartsaverClass.time}`}
                      image={heartsaverImage}
                      type="Heartsaver"
                      onRegister={() => handleClassRegister('Heartsaver')}
                      onLearnMore={() => handleClassLearnMore('Heartsaver')}
                    />
                  ) : (
                    <ClassCard
                      title="Heartsaver CPR"
                      description="Essential CPR and AED training for community members, teachers, coaches, and lay rescuers. Perfect for those who want to learn life-saving skills for family and community."
                      duration="3 hours"
                      capacity={16}
                      price={65}
                      nextDate="No upcoming classes scheduled"
                      image={heartsaverImage}
                      type="Heartsaver"
                      onRegister={() => handleClassRegister('Heartsaver')}
                      onLearnMore={() => handleClassLearnMore('Heartsaver')}
                    />
                  )}
                </>
              )}
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/calendar">
                  <Button size="lg" data-testid="button-view-calendar">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    View Class Calendar
                  </Button>
                </Link>
                <Link href="/classes">
                  <Button variant="outline" size="lg" data-testid="button-learn-more-classes">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Learn More About Classes
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Instructor Profile */}
        <InstructorProfile />

        {/* Quick Stats Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-lg opacity-90">Students Trained</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">10+</div>
                <div className="text-lg opacity-90">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-lg opacity-90">AHA Certified</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}