import { useState, useEffect } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { Class } from '@shared/schema';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

console.log(`Loading Stripe in ${import.meta.env.DEV ? 'development' : 'production'} mode`);
const stripePromise = loadStripe(stripePublicKey);

const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  classData: Class;
  clientSecret: string;
  paymentIntentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const RegistrationForm = ({ classData, clientSecret, paymentIntentId, onSuccess, onCancel }: RegistrationFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (formData: RegistrationFormData) => {
    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Stripe is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Payment intent status:', paymentIntent?.status);
      if (paymentIntent?.status === 'succeeded') {
        console.log('Creating registration record...');
        const registrationData = {
          classId: classData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          paymentIntentId: paymentIntent.id,
          amountPaid: paymentIntent.amount,
          status: 'confirmed'
        };
        console.log('Registration data:', registrationData);
        
        try {
          const registrationResponse = await apiRequest('POST', '/api/registrations', registrationData);
          console.log('Registration response:', registrationResponse);
          
          if (!registrationResponse.ok) {
            const errorData = await registrationResponse.json();
            console.error('Registration failed:', errorData);
            throw new Error(errorData.error || 'Registration failed');
          }
          
          console.log('Registration successful!');
        } catch (registrationError) {
          console.error('Registration error:', registrationError);
          throw registrationError;
        }

        toast({
          title: "Registration Successful!",
          description: `You have been registered for ${classData.title}. You will receive a confirmation email shortly.`,
        });

        onSuccess();
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 space-y-6 pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              data-testid="input-first-name"
              className={errors.firstName ? 'border-destructive' : ''}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              data-testid="input-last-name"
              className={errors.lastName ? 'border-destructive' : ''}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            data-testid="input-email"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            data-testid="input-phone"
          />
        </div>

        <div className="border rounded-lg p-4 bg-muted/50">
          <Label className="text-sm font-medium mb-2 block">Payment Information</Label>
          <PaymentElement />
        </div>
      </div>

      <div className="flex justify-between pt-6 mt-6 border-t bg-background flex-shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          data-testid="button-cancel-registration"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isSubmitting}
          data-testid="button-complete-registration"
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${classData.price} & Register`
          )}
        </Button>
      </div>
    </form>
  );
};

interface ClassRegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classData: Class | null;
}

export default function ClassRegistrationDialog({ isOpen, onClose, classData }: ClassRegistrationDialogProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [paymentIntentId, setPaymentIntentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initializePayment = async () => {
    if (!classData) return;

    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: classData.price,
        classId: classData.id,
        classTitle: classData.title
      });

      const data = await response.json();

      if (data.success) {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } else {
        throw new Error(data.error || 'Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize payment when dialog opens and class data is available
  useEffect(() => {
    if (isOpen && classData && !clientSecret) {
      initializePayment();
    }
  }, [isOpen, classData, clientSecret]);

  const handleClose = () => {
    setClientSecret("");
    setPaymentIntentId("");
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
    // Trigger a refresh of class data to update availability
    window.location.reload();
  };

  if (!classData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">Register for {classData.title}</DialogTitle>
          <div className="text-sm text-muted-foreground mt-2">
            <p><strong>Date:</strong> {new Date(classData.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {classData.time}</p>
            <p><strong>Duration:</strong> {classData.duration}</p>
            <p><strong>Price:</strong> ${classData.price}</p>
            <p><strong>Available Spots:</strong> {classData.available} of {classData.capacity}</p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Initializing payment...</span>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <RegistrationForm
                classData={classData}
                clientSecret={clientSecret}
                paymentIntentId={paymentIntentId}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <p>Unable to initialize payment. Please try again.</p>
              <Button onClick={handleClose} className="mt-4">Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}