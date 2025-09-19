import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { ClassType, Class } from '@shared/schema';

interface ClassCardProps {
  classType: ClassType;
  nextClass: Class | null;
  onRegister: () => void;
  onLearnMore: () => void;
}

export default function ClassCard({
  classType,
  nextClass,
  onRegister,
  onLearnMore
}: ClassCardProps) {
  // Get default fallback image based on class type
  const getDefaultImage = (typeName: string) => {
    switch (typeName.toLowerCase()) {
      case 'bls':
        return '/assets/generated_images/BLS_provider_training_a0cd6457.png';
      case 'heartsaver':
        return '/assets/generated_images/Heartsaver_community_training_b3867bec.png';
      default:
        return '/assets/generated_images/CPR_training_hero_image_7815ecc9.png';
    }
  };

  const image = nextClass?.image || getDefaultImage(classType.name);
  const hasUpcomingClass = nextClass !== null;
  
  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-class-${classType.name.toLowerCase()}`}>
      <div className="aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={classType.displayName}
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge 
            variant={classType.badgeColor as "default" | "secondary" | "destructive" | "outline"} 
            data-testid={`badge-${classType.name.toLowerCase()}`}
          >
            {classType.badgeLabel}
          </Badge>
          {hasUpcomingClass && (
            <span className="text-lg font-bold text-primary">${nextClass.price}</span>
          )}
        </div>
        <CardTitle className="text-xl">{classType.displayName}</CardTitle>
        <CardDescription className="text-sm">
          {nextClass?.description || classType.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {hasUpcomingClass ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{nextClass.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Max {nextClass.capacity} students</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Next class: <strong>{new Date(nextClass.date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })} at {nextClass.time}</strong></span>
            </div>
            
            {nextClass.available > 0 && (
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                {nextClass.available} spots available
              </div>
            )}
          </>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming classes scheduled</p>
            <p className="text-xs mt-1">Check our full calendar for future dates</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          onClick={onRegister} 
          className="flex-1"
          disabled={!hasUpcomingClass || (nextClass && nextClass.available <= 0)}
          data-testid={`button-register-${classType.name.toLowerCase()}`}
        >
          {hasUpcomingClass && nextClass && nextClass.available > 0 ? 'Register Now' : 'View Schedule'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onLearnMore}
          data-testid={`button-learn-more-${classType.name.toLowerCase()}`}
        >
          Learn More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}