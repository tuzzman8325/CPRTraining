import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, Loader2 } from 'lucide-react';
import { Class } from '@shared/schema';
import ClassRegistrationDialog from '@/components/ClassRegistrationDialog';

// Extend Class type to include a Date object for calendar display
interface ClassEvent extends Omit<Class, 'date'> {
  date: Date;
}

// Convert API date strings to Date objects for calendar display
const convertClassesToEvents = (classes: Class[]): ClassEvent[] => {
  return classes.map(cls => ({
    ...cls,
    date: new Date(cls.date + 'T00:00:00') // Add time to ensure local timezone
  }));
};

export default function ClassCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<ClassEvent | null>(null);
  const [registrationClass, setRegistrationClass] = useState<Class | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  // Fetch classes from API
  const { data: classesResponse, isLoading, error } = useQuery<{success: boolean; classes: Class[]}>({
    queryKey: ['/api/classes'],
  });

  // Convert API response to ClassEvent objects
  const classes = classesResponse?.success && classesResponse.classes 
    ? convertClassesToEvents(classesResponse.classes) 
    : [];

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getClassesForDate = (date: Date | null) => {
    if (!date) return [];
    return classes.filter(cls => 
      cls.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const handleClassSelect = (cls: ClassEvent) => {
    setSelectedClass(cls);
    console.log('Selected class:', cls.title);
  };

  const handleRegister = (cls: ClassEvent) => {
    // Convert ClassEvent back to Class for the registration dialog
    const classForRegistration: Class = {
      ...cls,
      date: cls.date.toISOString().split('T')[0] // Convert Date back to YYYY-MM-DD string
    };
    setRegistrationClass(classForRegistration);
    setIsRegistrationOpen(true);
  };

  const handleRegistrationClose = () => {
    setIsRegistrationOpen(false);
    setRegistrationClass(null);
  };

  const days = getDaysInMonth(currentDate);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Loading classes...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load classes</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Class Schedule</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateMonth('prev')}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold min-w-[140px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => navigateMonth('next')}
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                const classes = getClassesForDate(date);
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      min-h-[80px] p-1 border rounded-md 
                      ${date ? 'hover-elevate cursor-pointer' : ''}
                      ${isToday ? 'bg-primary/10 border-primary/20' : ''}
                    `}
                    data-testid={date ? `calendar-day-${date.getDate()}` : 'calendar-empty'}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {classes.map(cls => (
                            <button
                              key={cls.id}
                              onClick={() => handleClassSelect(cls)}
                              className="w-full text-left"
                              data-testid={`class-${cls.id}`}
                            >
                              <Badge 
                                variant={cls.type === 'BLS' ? 'default' : 'secondary'}
                                className="text-xs px-1 py-0"
                              >
                                {cls.type}
                              </Badge>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Details */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClass ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedClass.title}</h3>
                  <Badge variant={selectedClass.type === 'BLS' ? 'default' : 'secondary'}>
                    {selectedClass.type} Course
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClass.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClass.time} ({selectedClass.duration})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClass.available} spots available</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold">Price: ${selectedClass.price}</span>
                  </div>
                  <Button 
                    onClick={() => handleRegister(selectedClass)}
                    className="w-full"
                    disabled={selectedClass.available === 0}
                    data-testid="button-register-selected"
                  >
                    {selectedClass.available === 0 ? 'Class Full' : 'Register Now'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a class from the calendar to view details
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Dialog */}
      <ClassRegistrationDialog
        isOpen={isRegistrationOpen}
        onClose={handleRegistrationClose}
        classData={registrationClass}
      />
    </div>
  );
}