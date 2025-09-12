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
// Load Stripe conditionally only when needed
const getStripePromise = () => {
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  if (!stripePublicKey) {
    throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
  }

  console.log(`Loading Stripe in ${import.meta.env.DEV ? 'development' : 'production'} mode`);
  return loadStripe(stripePublicKey);
};

const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
});

const discountCodeSchema = z.object({
  code: z.string().min(1, 'Please enter a discount code'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;
type DiscountCodeData = z.infer<typeof discountCodeSchema>;

interface RegistrationFormProps {
  classData: Class;
  clientSecret?: string;
  paymentIntentId?: string;
  discountCode?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface DiscountCodeFormProps {
  onValidCode: (code: string) => void;
  onProceedWithPayment: () => void;
  onCancel: () => void;
}

const DiscountCodeForm = ({ onValidCode, onProceedWithPayment, onCancel }: DiscountCodeFormProps) => {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<DiscountCodeData>({
    resolver: zodResolver(discountCodeSchema),
  });

  const codeValue = watch('code');

  const validateCode = async (data: DiscountCodeData) => {
    setIsValidating(true);
    
    try {
      const response = await apiRequest('POST', '/api/validate-discount-code', {
        code: data.code.toUpperCase()
      });

      const result = await response.json();
      console.log('Discount code validation:', result);

      if (result.success && result.valid) {
        toast({
          title: "Valid Discount Code!",
          description: "This code provides free registration for this class.",
        });
        onValidCode(data.code.toUpperCase());
      } else {
        toast({
          title: "Invalid Code",
          description: result.reason || "This discount code is not valid.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Discount code validation error:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate discount code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Registration Options</h3>
        <p className="text-sm text-muted-foreground">
          Have a discount code? Enter it below for free registration, or proceed with payment.
        </p>
      </div>

      <form onSubmit={handleSubmit(validateCode)} className="space-y-4">
        <div>
          <Label htmlFor="discountCode">Discount Code (Optional)</Label>
          <Input
            id="discountCode"
            {...register('code')}
            data-testid="input-discount-code"
            placeholder="ABCD-EFGH"
            className={`uppercase ${errors.code ? 'border-destructive' : ''}`}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              register('code').onChange(e);
            }}
          />
          {errors.code && (
            <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!codeValue || isValidating}
            data-testid="button-validate-code"
            className="flex-1"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Apply Code'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onProceedWithPayment}
            data-testid="button-proceed-payment"
            className="flex-1"
          >
            Pay Instead
          </Button>
        </div>
      </form>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          data-testid="button-cancel-discount"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

const RegistrationForm = ({ classData, clientSecret, paymentIntentId, discountCode, onSuccess, onCancel }: RegistrationFormProps) => {
  // Only use Stripe hooks when payment is needed (no discount code)
  const stripe = !discountCode ? useStripe() : null;
  const elements = !discountCode ? useElements() : null;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (formData: RegistrationFormData) => {
    setIsSubmitting(true);

    try {
      // Handle discount code registration (no payment needed)
      if (discountCode) {
        console.log('Processing discount code registration...');
        const registrationData = {
          classId: classData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          paymentIntentId: null,
          amountPaid: null,
          status: 'confirmed',
          discountCodeId: null // This will be handled by the backend
        };

        // Mark the discount code as used
        const codeResponse = await apiRequest('POST', '/api/discount-codes/use', {
          code: discountCode
        });

        if (!codeResponse.ok) {
          throw new Error('Failed to apply discount code');
        }

        console.log('Registration data (discount):', registrationData);
        
        const registrationResponse = await apiRequest('POST', '/api/registrations', registrationData);
        console.log('Registration response:', registrationResponse);
        
        if (!registrationResponse.ok) {
          const errorData = await registrationResponse.json();
          console.error('Registration failed:', errorData);
          throw new Error(errorData.error || 'Registration failed');
        }
        
        console.log('Discount registration successful!');

        toast({
          title: "Registration Successful!",
          description: `You have been registered for ${classData.title} using your discount code. You will receive a confirmation email shortly.`,
        });

        onSuccess();
        return;
      }

      // Handle payment registration
      if (!stripe || !elements) {
        toast({
          title: "Payment Error",
          description: "Stripe is not ready. Please try again.",
          variant: "destructive",
        });
        return;
      }

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
        console.log('Registration data (payment):', registrationData);
        
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

        {discountCode && (
          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
            <Label className="text-sm font-medium mb-2 block text-green-800 dark:text-green-200">
              Discount Code Applied
            </Label>
            <p className="text-sm text-green-700 dark:text-green-300">
              Code <strong>{discountCode}</strong> applied - Registration is free!
            </p>
          </div>
        )}

        {!discountCode && clientSecret && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-sm font-medium mb-2 block">Payment Information</Label>
            <PaymentElement />
          </div>
        )}
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
          disabled={discountCode ? isSubmitting : (!stripe || isSubmitting)}
          data-testid="button-complete-registration"
          className="min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : discountCode ? (
            'Complete Free Registration'
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
  const [discountCode, setDiscountCode] = useState<string>("");
  const [showDiscountForm, setShowDiscountForm] = useState(true);
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

  // Initialize payment when proceeding with payment (not on dialog open)
  useEffect(() => {
    if (isOpen && classData && !clientSecret && !showDiscountForm && !discountCode) {
      initializePayment();
    }
  }, [isOpen, classData, clientSecret, showDiscountForm, discountCode]);

  const handleClose = () => {
    setClientSecret("");
    setPaymentIntentId("");
    setDiscountCode("");
    setShowDiscountForm(true);
    onClose();
  };

  const handleValidDiscountCode = (code: string) => {
    setDiscountCode(code);
    setShowDiscountForm(false);
  };

  const handleProceedWithPayment = () => {
    setShowDiscountForm(false);
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
          {showDiscountForm ? (
            <DiscountCodeForm
              onValidCode={handleValidDiscountCode}
              onProceedWithPayment={handleProceedWithPayment}
              onCancel={handleClose}
            />
          ) : discountCode ? (
            <RegistrationForm
              classData={classData}
              discountCode={discountCode}
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Initializing payment...</span>
            </div>
          ) : clientSecret ? (
            <Elements stripe={getStripePromise()} options={{ clientSecret }}>
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