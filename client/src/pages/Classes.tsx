import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClassRegistrationDialog from '@/components/ClassRegistrationDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Clock, 
  Users, 
  Award, 
  CheckCircle, 
  Calendar,
  DollarSign,
  Loader2,
  ChevronDown,
  MapPin
} from 'lucide-react';
import { Class, ClassType } from '@shared/schema';
import { parseLocalDate } from '@/lib/utils';

// ClassCard component for individual classes within each type section
function ClassCard({ classData, onRegister }: { classData: Class; onRegister: (classData: Class) => void }) {
  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 1) return 'Contact for pricing';
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isUpcoming = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const classDate = parseLocalDate(classData.date);
    return classDate >= today;
  };

  const isAvailable = classData.available > 0;
  const upcoming = isUpcoming();

  return (
    <Card className={`hover-elevate ${!upcoming ? 'opacity-75' : ''}`} data-testid={`card-class-${classData.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2" data-testid={`text-class-title-${classData.id}`}>
              {classData.title}
            </CardTitle>
            {classData.description && (
              <CardDescription className="line-clamp-2" data-testid={`text-class-description-${classData.id}`}>
                {classData.description}
              </CardDescription>
            )}
          </div>
          <Badge variant={upcoming ? "default" : "secondary"} className="ml-2">
            {upcoming ? "Upcoming" : "Past"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {classData.image && (
          <div className="aspect-video overflow-hidden rounded-md">
            <img 
              src={classData.image}
              alt={classData.title}
              className="w-full h-full object-cover"
              data-testid={`img-class-${classData.id}`}
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span data-testid={`text-class-date-${classData.id}`}>{formatDate(classData.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-primary" />
            <span data-testid={`text-class-time-${classData.id}`}>{classData.time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span data-testid={`text-class-capacity-${classData.id}`}>
              {classData.available} of {classData.capacity} spots
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span data-testid={`text-class-price-${classData.id}`}>{formatPrice(classData.price)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span>Duration: {classData.duration}</span>
        </div>

        <Button 
          onClick={() => onRegister(classData)}
          className="w-full"
          data-testid={`button-register-${classData.id}`}
          disabled={!upcoming || !isAvailable}
        >
          {!upcoming ? (
            "Class Completed"
          ) : !isAvailable ? (
            "Class Full - Contact for Waitlist"
          ) : (
            `Register (${classData.available} spots remaining)`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Empty state component for class types with no classes
function EmptyClassTypeState({ classType }: { classType: ClassType }) {
  return (
    <Card className="text-center py-8" data-testid={`empty-state-${classType.id}`}>
      <CardContent>
        <div className="space-y-4">
          <div className="text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No {classType.displayName} Classes Scheduled</h3>
            <p className="text-sm max-w-md mx-auto">
              Currently no upcoming {classType.displayName.toLowerCase()} classes are scheduled. 
              Contact us to request a new class or check back later for updates.
            </p>
          </div>
          <Button variant="outline" data-testid={`button-contact-${classType.id}`}>
            Request {classType.displayName} Class
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Classes() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Fetch classes grouped by type from the new API endpoint
  const { data: groupedData, isLoading, error } = useQuery({
    queryKey: ['/api/classes/grouped-by-type'],
    select: (response: any) => response.groupedClasses,
  });

  const groupedClasses = groupedData || [];

  const handleRegister = (classData: Class) => {
    setSelectedClass(classData);
    setIsRegistrationOpen(true);
  };

  const handleRegistrationClose = () => {
    setIsRegistrationOpen(false);
    setSelectedClass(null);
  };

  // Calculate totals for summary
  const totalClasses = groupedClasses.reduce((total: number, group: any) => total + group.classes.length, 0);
  const totalUpcomingClasses = groupedClasses.reduce((total: number, group: any) => {
    const upcomingClasses = group.classes.filter((cls: Class) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const classDate = parseLocalDate(cls.date);
      return classDate >= today;
    });
    return total + upcomingClasses.length;
  }, 0);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center">
            <CardContent>
              <h2 className="text-xl font-semibold mb-2">Error Loading Classes</h2>
              <p className="text-muted-foreground">Unable to load class information. Please try again later.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

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
              Browse our available course types and register for upcoming classes.
            </p>
            {!isLoading && (
              <div className="mt-6 text-sm text-muted-foreground">
                <span data-testid="text-total-upcoming-classes">{totalUpcomingClasses}</span> upcoming classes available from 
                <span data-testid="text-total-class-types"> {groupedClasses.length}</span> course types
              </div>
            )}
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading class information...</p>
            </div>
          </section>
        )}

        {/* Dynamic Class Type Sections */}
        {!isLoading && (
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              {groupedClasses.length === 0 ? (
                <Card className="text-center py-12" data-testid="empty-state-all-classes">
                  <CardContent>
                    <Calendar className="h-16 w-16 mx-auto mb-6 opacity-50" />
                    <h2 className="text-2xl font-semibold mb-4">No Classes Available</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Currently no classes are scheduled. Please contact us to learn about upcoming training opportunities.
                    </p>
                    <Button data-testid="button-contact-instructor">Contact Instructor</Button>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="multiple" defaultValue={groupedClasses.map((group: any) => group.classType.id)} className="space-y-4">
                  {groupedClasses.map((group: any) => {
                    const { classType, classes } = group;
                    const upcomingClasses = classes.filter((cls: Class) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const classDate = parseLocalDate(cls.date);
                      return classDate >= today;
                    });

                    return (
                      <AccordionItem 
                        key={classType.id} 
                        value={classType.id}
                        data-testid={`accordion-item-${classType.id}`}
                      >
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center space-x-3">
                              <h2 className="text-2xl font-bold">{classType.displayName}</h2>
                              <Badge variant="secondary" data-testid={`badge-class-count-${classType.id}`}>
                                {upcomingClasses.length} upcoming
                              </Badge>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-6 space-y-6">
                            {/* Class Type Description */}
                            {classType.description && (
                              <div className="bg-muted/30 rounded-lg p-4" data-testid={`description-${classType.id}`}>
                                <p className="text-muted-foreground">{classType.description}</p>
                              </div>
                            )}

                            {/* Classes Grid */}
                            {classes.length === 0 ? (
                              <EmptyClassTypeState classType={classType} />
                            ) : (
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid={`classes-grid-${classType.id}`}>
                                {classes
                                  .sort((a: Class, b: Class) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
                                  .map((classData: Class) => (
                                    <ClassCard 
                                      key={classData.id} 
                                      classData={classData} 
                                      onRegister={handleRegister}
                                    />
                                  ))}
                              </div>
                            )}

                            {/* Summary for this class type */}
                            {classes.length > 0 && (
                              <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                                <h4 className="font-semibold mb-2">Class Summary</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Total Classes:</span>
                                    <div className="font-medium" data-testid={`summary-total-${classType.id}`}>{classes.length}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Upcoming:</span>
                                    <div className="font-medium" data-testid={`summary-upcoming-${classType.id}`}>{upcomingClasses.length}</div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Available Spots:</span>
                                    <div className="font-medium" data-testid={`summary-available-${classType.id}`}>
                                      {upcomingClasses.reduce((total: number, cls: Class) => total + cls.available, 0)}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Price Range:</span>
                                    <div className="font-medium" data-testid={`summary-price-range-${classType.id}`}>
                                      {classes.length > 0 ? (
                                        (() => {
                                          const prices = classes.map((cls: Class) => cls.price).filter((price: number) => price > 1);
                                          if (prices.length === 0) return 'Contact for pricing';
                                          const min = Math.min(...prices);
                                          const max = Math.max(...prices);
                                          return min === max ? `$${(min / 100).toFixed(2)}` : `$${(min / 100).toFixed(2)} - $${(max / 100).toFixed(2)}`;
                                        })()
                                      ) : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}

              {/* Call to Action Section */}
              {groupedClasses.length > 0 && (
                <div className="mt-12 text-center">
                  <Card className="p-8">
                    <CardContent>
                      <h3 className="text-xl font-semibold mb-4">Ready to Get Certified?</h3>
                      <p className="text-muted-foreground mb-6">
                        Choose from our available courses above to start your CPR certification journey. 
                        All courses are American Heart Association certified.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" data-testid="button-view-calendar">
                          <Calendar className="mr-2 h-5 w-5" />
                          View Full Calendar
                        </Button>
                        <Button variant="outline" size="lg" data-testid="button-contact-instructor">
                          Contact Instructor
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

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