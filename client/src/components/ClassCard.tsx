import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, DollarSign, Calendar } from 'lucide-react';

interface ClassCardProps {
  title: string;
  description: string;
  duration: string;
  capacity: number;
  price: number;
  nextDate: string;
  image: string;
  type: 'BLS' | 'Heartsaver';
  onRegister: () => void;
  onLearnMore: () => void;
}

export default function ClassCard({
  title,
  description,
  duration,
  capacity,
  price,
  nextDate,
  image,
  type,
  onRegister,
  onLearnMore
}: ClassCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-class-${type.toLowerCase()}`}>
      <div className="aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant={type === 'BLS' ? 'default' : 'secondary'} data-testid={`badge-${type.toLowerCase()}`}>
            {type} Course
          </Badge>
          <span className="text-lg font-bold text-primary">${price}</span>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Max {capacity} students</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Next class: <strong>{nextDate}</strong></span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          onClick={onRegister} 
          className="flex-1"
          data-testid={`button-register-${type.toLowerCase()}`}
        >
          Register Now
        </Button>
        <Button 
          variant="outline" 
          onClick={onLearnMore}
          data-testid={`button-learn-more-${type.toLowerCase()}`}
        >
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}