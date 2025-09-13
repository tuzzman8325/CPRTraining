import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClassRegistrationDialog from '@/components/ClassRegistrationDialog';
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
  Stethoscope,
  Loader2
} from 'lucide-react';
import { Class } from '@shared/schema';
import blsImage from '@assets/generated_images/BLS_provider_training_a0cd6457.png';
import heartsaverImage from '@assets/generated_images/Heartsaver_community_training_b3867bec.png';

export default function Classes() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Fetch available classes from API
  const { data: classesData, isLoading } = useQuery({
    queryKey: ['/api/classes'],
    select: (response: any) => response.classes,
  });

  const classes = classesData || [];

  // Process classes data to extract course type information
  const courseInfo = useMemo(() => {
    const blsClasses = classes.filter((cls: Class) => cls.type === 'BLS');
    const heartsaverClasses = classes.filter((cls: Class) => cls.type === 'Heartsaver');

    // Helper function to get next upcoming class
    const getNextClass = (courseClasses: Class[]) => {
      const today = new Date();
      const upcoming = courseClasses
        .filter(cls => new Date(cls.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return upcoming[0] || null;
    };

    // Helper function to format price
    const formatPrice = (priceInCents: number) => {
      if (priceInCents === 1) return 'Contact for pricing';
      return `$${(priceInCents / 100).toFixed(2)}`;
    };

    // Helper function to format date
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    const nextBLS = getNextClass(blsClasses);
    const nextHeartsaver = getNextClass(heartsaverClasses);

    return {
      BLS: {
        classes: blsClasses,
        nextClass: nextBLS,
        duration: nextBLS?.duration || '4 hours',
        capacity: nextBLS?.capacity || 12,
        price: nextBLS ? formatPrice(nextBLS.price) : 'Contact for pricing',
        enrolled: nextBLS ? nextBLS.capacity - nextBLS.available : 0,
        available: nextBLS?.available || 0,
        nextDate: nextBLS ? formatDate(nextBLS.date) : null,
        nextTime: nextBLS?.time || null,
        hasUpcoming: !!nextBLS
      },
      Heartsaver: {
        classes: heartsaverClasses,
        nextClass: nextHeartsaver,
        duration: nextHeartsaver?.duration || '3 hours',
        capacity: nextHeartsaver?.capacity || 16,
        price: nextHeartsaver ? formatPrice(nextHeartsaver.price) : 'Contact for pricing',
        enrolled: nextHeartsaver ? nextHeartsaver.capacity - nextHeartsaver.available : 0,
        available: nextHeartsaver?.available || 0,
        nextDate: nextHeartsaver ? formatDate(nextHeartsaver.date) : null,
        nextTime: nextHeartsaver?.time || null,
        hasUpcoming: !!nextHeartsaver
      }
    };
  }, [classes]);
  
  const handleRegister = (courseType: string) => {
    // Find an available class of the selected type
    const availableClass = classes.find((cls: Class) => 
      cls.type === courseType && cls.available > 0
    );
    
    if (availableClass) {
      setSelectedClass(availableClass);
      setIsRegistrationOpen(true);
    } else {
      // For static course info display when no specific class is scheduled
      console.log(`No available ${courseType} classes currently scheduled`);
    }
  };

  const handleRegistrationClose = () => {
    setIsRegistrationOpen(false);
    setSelectedClass(null);
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
                        <span className="text-sm" data-testid="text-bls-duration">{courseInfo.BLS.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm" data-testid="text-bls-capacity">Max {courseInfo.BLS.capacity} students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm" data-testid="text-bls-price">{courseInfo.BLS.price}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm">2-year certification</span>
                      </div>
                    </div>

                    {/* Next Class Information */}
                    {courseInfo.BLS.hasUpcoming && (
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>Next Class</span>
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span data-testid="text-bls-next-date">{courseInfo.BLS.nextDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span data-testid="text-bls-next-time">{courseInfo.BLS.nextTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Enrolled:</span>
                            <span data-testid="text-bls-enrollment">{courseInfo.BLS.enrolled} students</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available:</span>
                            <span className={`font-medium ${courseInfo.BLS.available <= 3 ? 'text-orange-600' : 'text-green-600'}`} data-testid="text-bls-available">
                              {courseInfo.BLS.available} spots remaining
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!courseInfo.BLS.hasUpcoming && (
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>No Upcoming Classes</span>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Contact us to request a new BLS class or check back later for updated schedule.
                        </p>
                      </div>
                    )}

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
                      disabled={isLoading || !courseInfo.BLS.hasUpcoming || courseInfo.BLS.available === 0}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading Classes...
                        </>
                      ) : !courseInfo.BLS.hasUpcoming ? (
                        "No BLS Classes Scheduled"
                      ) : courseInfo.BLS.available === 0 ? (
                        "BLS Classes Full - Contact for Waitlist"
                      ) : (
                        `Register for BLS Provider Course (${courseInfo.BLS.available} spots available)`
                      )}
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
                        <span className="text-sm" data-testid="text-heartsaver-duration">{courseInfo.Heartsaver.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm" data-testid="text-heartsaver-capacity">Max {courseInfo.Heartsaver.capacity} students</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm" data-testid="text-heartsaver-price">{courseInfo.Heartsaver.price}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span className="text-sm">2-year certification</span>
                      </div>
                    </div>

                    {/* Next Class Information */}
                    {courseInfo.Heartsaver.hasUpcoming && (
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>Next Class</span>
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span data-testid="text-heartsaver-next-date">{courseInfo.Heartsaver.nextDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Time:</span>
                            <span data-testid="text-heartsaver-next-time">{courseInfo.Heartsaver.nextTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Enrolled:</span>
                            <span data-testid="text-heartsaver-enrollment">{courseInfo.Heartsaver.enrolled} students</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Available:</span>
                            <span className={`font-medium ${courseInfo.Heartsaver.available <= 3 ? 'text-orange-600' : 'text-green-600'}`} data-testid="text-heartsaver-available">
                              {courseInfo.Heartsaver.available} spots remaining
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!courseInfo.Heartsaver.hasUpcoming && (
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>No Upcoming Classes</span>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Contact us to request a new Heartsaver class or check back later for updated schedule.
                        </p>
                      </div>
                    )}

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
                      disabled={isLoading || !courseInfo.Heartsaver.hasUpcoming || courseInfo.Heartsaver.available === 0}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading Classes...
                        </>
                      ) : !courseInfo.Heartsaver.hasUpcoming ? (
                        "No Heartsaver Classes Scheduled"
                      ) : courseInfo.Heartsaver.available === 0 ? (
                        "Heartsaver Classes Full - Contact for Waitlist"
                      ) : (
                        `Register for Heartsaver Course (${courseInfo.Heartsaver.available} spots available)`
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Class Summary Section */}
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Calendar className="h-6 w-6" />
                    <span>Upcoming Classes Summary</span>
                  </CardTitle>
                  <CardDescription className="text-lg">
                    See what courses are available and get started with your CPR certification today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading class information...</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* BLS Summary */}
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-3">
                            <Stethoscope className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">BLS Provider</h3>
                          </div>
                          {courseInfo.BLS.hasUpcoming ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Next class:</span>
                                <span data-testid="text-bls-summary-date">{courseInfo.BLS.nextDate?.split(',')[1]?.trim()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Available spots:</span>
                                <span className={courseInfo.BLS.available <= 3 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'} data-testid="text-bls-summary-available">
                                  {courseInfo.BLS.available} of {courseInfo.BLS.capacity}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <span data-testid="text-bls-summary-price">{courseInfo.BLS.price}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground" data-testid="text-bls-summary-none">
                              No upcoming BLS classes scheduled
                            </p>
                          )}
                        </div>

                        {/* Heartsaver Summary */}
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center space-x-2 mb-3">
                            <Heart className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Heartsaver CPR AED</h3>
                          </div>
                          {courseInfo.Heartsaver.hasUpcoming ? (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Next class:</span>
                                <span data-testid="text-heartsaver-summary-date">{courseInfo.Heartsaver.nextDate?.split(',')[1]?.trim()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Available spots:</span>
                                <span className={courseInfo.Heartsaver.available <= 3 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'} data-testid="text-heartsaver-summary-available">
                                  {courseInfo.Heartsaver.available} of {courseInfo.Heartsaver.capacity}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Price:</span>
                                <span data-testid="text-heartsaver-summary-price">{courseInfo.Heartsaver.price}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground" data-testid="text-heartsaver-summary-none">
                              No upcoming Heartsaver classes scheduled
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          data-testid="button-view-schedule"
                          onClick={() => window.location.href = '/calendar'}
                        >
                          <Calendar className="mr-2 h-5 w-5" />
                          View Full Schedule
                        </Button>
                        <Button variant="outline" size="lg" data-testid="button-contact-instructor">
                          Contact Instructor
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Total upcoming classes: <span data-testid="text-total-classes">{classes.length}</span> | 
                        Questions? Contact us at (555) 123-4567 or info@lifesavercpr.com
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
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