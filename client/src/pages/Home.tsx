import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ClassCard from '@/components/ClassCard';
import ClassRegistrationDialog from '@/components/ClassRegistrationDialog';
import InstructorProfile from '@/components/InstructorProfile';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Calendar as CalendarIcon, BookOpen, Phone, Mail } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Class, ClassType } from '@shared/schema';
import { parseLocalDate } from '@/lib/utils';

export default function Home() {
  // Registration dialog state
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch class types with their classes
  const { data: groupedClassesResponse, isLoading } = useQuery<{ 
    success: boolean; 
    groupedClasses: { classType: ClassType; classes: Class[] }[] 
  }>({
    queryKey: ['/api/classes/grouped-by-type'],
  });

  const groupedClasses = groupedClassesResponse?.groupedClasses || [];

  // Process classes to find next upcoming class for each type
  const getNextUpcomingClass = (classes: Class[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingClasses = classes
      .filter(c => {
        const classDate = parseLocalDate(c.date);
        return classDate >= today;
      })
      .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());
    
    return upcomingClasses[0] || null;
  };

  const handleClassRegister = (nextClass: Class | null) => {
    if (nextClass && nextClass.available > 0) {
      setSelectedClass(nextClass);
      setIsRegistrationOpen(true);
    } else {
      // Navigate to classes page if no available class found
      setLocation('/classes');
    }
  };

  const handleClassLearnMore = () => {
    // Navigate to the detailed classes page
    setLocation('/classes');
  };

  const handleRegistrationClose = () => {
    setIsRegistrationOpen(false);
    setSelectedClass(null);
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
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-foreground">Choose Your Course</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Professional American Heart Association certified CPR training courses designed for 
                different skill levels and professional requirements. Start your life-saving journey today.
              </p>
            </div>

            <div className={`grid gap-8 max-w-6xl mx-auto mb-12 ${groupedClasses.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <ClassCardSkeleton key={index} />
                ))
              ) : groupedClasses.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2 text-foreground">No Class Types Available</h3>
                  <p className="text-muted-foreground">Check back soon for upcoming training opportunities.</p>
                </div>
              ) : (
                groupedClasses.map((group) => {
                  const nextClass = getNextUpcomingClass(group.classes);
                  return (
                    <ClassCard
                      key={group.classType.id}
                      classType={group.classType}
                      nextClass={nextClass}
                      onRegister={() => handleClassRegister(nextClass)}
                      onLearnMore={handleClassLearnMore}
                    />
                  );
                })
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

      </main>

      {/* Professional Contact Section */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Contact Us</h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ready to start your CPR training? Get in touch with our certified instructors to learn more about our courses and schedule your training today.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-3 text-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">Call Us</div>
                  <div className="text-muted-foreground">(555) 123-4567</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3 text-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">Email Us</div>
                  <div className="text-muted-foreground">info@lifesavercpr.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Registration Dialog */}
      <ClassRegistrationDialog
        isOpen={isRegistrationOpen}
        onClose={handleRegistrationClose}
        classData={selectedClass}
      />
    </div>
  );
}