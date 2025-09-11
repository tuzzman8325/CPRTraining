import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users } from 'lucide-react';

interface ClassEvent {
  id: string;
  title: string;
  type: 'BLS' | 'Heartsaver';
  date: Date;
  time: string;
  duration: string;
  available: number;
  capacity: number;
  price: number;
}

// TODO: Remove mock data - replace with real class data from backend
const mockClasses: ClassEvent[] = [
  {
    id: '1',
    title: 'BLS Provider',
    type: 'BLS',
    date: new Date(2024, 2, 15), // March 15
    time: '9:00 AM',
    duration: '4 hours',
    available: 5,
    capacity: 12,
    price: 85
  },
  {
    id: '2',
    title: 'Heartsaver CPR',
    type: 'Heartsaver',
    date: new Date(2024, 2, 18), // March 18
    time: '2:00 PM',
    duration: '3 hours',
    available: 8,
    capacity: 16,
    price: 65
  },
  {
    id: '3',
    title: 'BLS Renewal',
    type: 'BLS',
    date: new Date(2024, 2, 22), // March 22
    time: '10:00 AM',
    duration: '3 hours',
    available: 2,
    capacity: 10,
    price: 75
  }
];

export default function ClassCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState<ClassEvent | null>(null);

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
    return mockClasses.filter(cls => 
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
    console.log('Register for class:', cls.title);
    // TODO: Implement registration flow
  };

  const days = getDaysInMonth(currentDate);

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
    </div>
  );
}