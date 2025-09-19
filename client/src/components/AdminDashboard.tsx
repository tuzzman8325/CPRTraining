import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TimeInput } from '@/components/ui/time-input';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Class, InsertClass, insertClassSchema, ClassType, InsertClassType, insertClassTypeSchema, Registration, DiscountCode, InsertDiscountCode, insertDiscountCodeSchema, Client, InsertClient, insertClientSchema, User, EmailSettings, InsertEmailSettings } from '@shared/schema';
import { ImageSelector } from '@/components/ui/image-selector';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';

// Enriched Registration type with discount code information
interface EnrichedRegistration extends Registration {
  discountCode?: {
    code: string;
    description: string;
  } | null;
}

// API Response types
interface ClassesResponse {
  success: boolean;
  classes: Class[];
}

interface ClassResponse {
  success: boolean;
  class: Class;
  message: string;
}

interface RegistrationsResponse {
  success: boolean;
  registrations: EnrichedRegistration[];
}

interface DiscountCodesResponse {
  success: boolean;
  discountCodes: DiscountCode[];
}

interface DiscountCodeResponse {
  success: boolean;
  discountCode: DiscountCode;
  message: string;
}

interface ClientsResponse {
  success: boolean;
  clients: Client[];
}

interface ClientResponse {
  success: boolean;
  client: Client;
  message: string;
}

interface UsersResponse {
  success: boolean;
  users: User[];
}

interface UserResponse {
  success: boolean;
  user: User;
  message: string;
}

interface ClassTypesResponse {
  success: boolean;
  classTypes: ClassType[];
}

interface ClassTypeResponse {
  success: boolean;
  classType: ClassType;
  message: string;
}

interface EmailSettingsResponse {
  success: boolean;
  emailSettings: EmailSettings;
}

interface EmailSettingsUpdateResponse {
  success: boolean;
  emailSettings: EmailSettings;
  message: string;
}

interface EmailTestResponse {
  success: boolean;
  message: string;
}

import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Users, 
  Calendar,
  Award,
  DollarSign,
  BookOpen,
  ClipboardList,
  Ticket,
  Copy,
  ChevronDown,
  ChevronRight,
  FileText,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Shield,
  UserMinus,
  BarChart3,
  Mail,
  Send
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';


// Inner component that uses sidebar context
function AdminDashboardContent() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Collapsible section state - only one section open at a time
  const [openSection, setOpenSection] = useState<string>('');
  
  // Mobile detection - safe to use here since we're inside SidebarProvider
  const isMobile = useIsMobile();
  
  // Client state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  
  // Client filters and pagination
  const [clientFilters, setClientFilters] = useState({
    certificationStatus: 'all',
    courseType: 'all',
    registrationDateRange: 'all',
    lastCourseDateRange: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;
  
  // Class state
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  const [isClassDetailsDialogOpen, setIsClassDetailsDialogOpen] = useState(false);
  const [classDetailsData, setClassDetailsData] = useState<{
    classData: Class;
    registrations: Registration[];
  } | null>(null);

  // Registration state
  const [registrationSearchTerm, setRegistrationSearchTerm] = useState('');

  // Discount Code state
  const [discountCodeSearchTerm, setDiscountCodeSearchTerm] = useState('');
  const [selectedDiscountCode, setSelectedDiscountCode] = useState<DiscountCode | null>(null);
  const [isAddDiscountCodeDialogOpen, setIsAddDiscountCodeDialogOpen] = useState(false);
  const [isEditDiscountCodeDialogOpen, setIsEditDiscountCodeDialogOpen] = useState(false);

  // User Management state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserForDeletion, setSelectedUserForDeletion] = useState<User | null>(null);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);

  // Class Type Management state
  const [classTypeSearchTerm, setClassTypeSearchTerm] = useState('');
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(null);
  const [isAddClassTypeDialogOpen, setIsAddClassTypeDialogOpen] = useState(false);
  const [isEditClassTypeDialogOpen, setIsEditClassTypeDialogOpen] = useState(false);

  // Email Configuration state
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [isTestEmailLoading, setIsTestEmailLoading] = useState(false);

  // Roster state
  const [isGeneratingRoster, setIsGeneratingRoster] = useState(false);
  
  // React Query hooks for clients
  const { data: clientsData, isLoading: clientsLoading } = useQuery<ClientsResponse>({
    queryKey: ['/api/clients'],
  });

  // React Query hooks for classes
  const { data: classesData, isLoading: classesLoading } = useQuery<ClassesResponse>({
    queryKey: ['/api/classes'],
  });

  // React Query hooks for registrations  
  const { data: registrationsData, isLoading: registrationsLoading, refetch: refetchRegistrations } = useQuery<RegistrationsResponse>({
    queryKey: ['/api/registrations'],
    queryFn: () => fetch('/api/registrations?' + Date.now()).then(res => res.json()),
    staleTime: 0, // Force fresh fetch
    gcTime: 0, // Don't cache during development (React Query v5)
  });

  // React Query hooks for discount codes
  const { data: discountCodesData, isLoading: discountCodesLoading } = useQuery<DiscountCodesResponse>({
    queryKey: ['/api/discount-codes'],
  });

  // React Query hooks for users
  const { data: usersData, isLoading: usersLoading } = useQuery<UsersResponse>({
    queryKey: ['/api/users'],
  });

  // React Query hooks for class types
  const { data: classTypesData, isLoading: classTypesLoading } = useQuery<ClassTypesResponse>({
    queryKey: ['/api/class-types'],
  });

  // React Query hooks for email settings
  const { data: emailSettingsData, isLoading: emailSettingsLoading, refetch: refetchEmailSettings } = useQuery<EmailSettingsResponse>({
    queryKey: ['/api/email-settings'],
  });
  
  const clients: Client[] = clientsData?.clients || [];
  const classes: Class[] = classesData?.classes || [];
  const discountCodes: DiscountCode[] = discountCodesData?.discountCodes || [];
  const users: User[] = usersData?.users || [];
  const classTypes: ClassType[] = classTypesData?.classTypes || [];
  const emailSettings: EmailSettings = emailSettingsData?.emailSettings || {
    id: 'default',
    senderEmail: 'noreply@example.com',
    replyToEmail: null,
    businessName: 'CPR Training Center',
    businessPhone: null,
    businessAddress: null,
    emailSignature: 'Thank you for choosing our professional CPR training services!',
    confirmationEmailTemplate: null,
    enableEmailConfirmations: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const createClassMutation = useMutation({
    mutationFn: async (data: InsertClass) => {
      return await apiRequest('POST', '/api/classes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      setIsAddClassDialogOpen(false);
      toast({ title: "Success", description: "Class created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create class: ${error.message}`, variant: "destructive" });
    }
  });
  
  const updateClassMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertClass> }) => {
      return await apiRequest('PUT', `/api/classes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      setIsEditClassDialogOpen(false);
      setSelectedClass(null);
      toast({ title: "Success", description: "Class updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update class: ${error.message}`, variant: "destructive" });
    }
  });
  
  const deleteClassMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      toast({ title: "Success", description: "Class deleted successfully" });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to delete class";
      
      // Handle specific constraint errors from the backend
      if (error.response?.status === 409) {
        // Conflict status indicates constraint violation
        const errorData = error.response.data;
        if (errorData.registrationCount) {
          errorMessage = `Cannot delete class - ${errorData.registrationCount} student${errorData.registrationCount > 1 ? 's are' : ' is'} registered. Please cancel all registrations first.`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = "Cannot delete class due to existing registrations. Please cancel all registrations first.";
        }
      } else if (error.response?.data?.error) {
        // Use specific error message from backend
        errorMessage = error.response.data.error;
      } else {
        // Fallback to generic error message
        errorMessage = `Failed to delete class: ${error.message}`;
      }
      
      toast({ 
        title: "Cannot Delete Class", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  });
  
  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/registrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/registrations'] });
      toast({ title: "Success", description: "Registration deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete registration: ${error.message}`, variant: "destructive" });
    }
  });

  // Discount Code mutations
  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: InsertDiscountCode) => {
      return await apiRequest('POST', '/api/discount-codes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discount-codes'] });
      setIsAddDiscountCodeDialogOpen(false);
      toast({ title: "Success", description: "Discount code created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create discount code: ${error.message}`, variant: "destructive" });
    }
  });

  const updateDiscountCodeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertDiscountCode> }) => {
      return await apiRequest('PUT', `/api/discount-codes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discount-codes'] });
      setIsEditDiscountCodeDialogOpen(false);
      setSelectedDiscountCode(null);
      toast({ title: "Success", description: "Discount code updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update discount code: ${error.message}`, variant: "destructive" });
    }
  });

  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/discount-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discount-codes'] });
      toast({ title: "Success", description: "Discount code deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete discount code: ${error.message}`, variant: "destructive" });
    }
  });

  // Client mutations
  const createClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      return await apiRequest('POST', '/api/clients', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsAddClientDialogOpen(false);
      toast({ title: "Success", description: "Client created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create client: ${error.message}`, variant: "destructive" });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertClient> }) => {
      return await apiRequest('PUT', `/api/clients/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate clients cache to force fresh data fetch
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      // Small delay to ensure cache invalidation completes before closing dialog
      setTimeout(() => {
        // Clear form state completely
        editClientForm.reset();
        setIsEditDialogOpen(false);
        setSelectedClient(null);
      }, 100);
      
      toast({ title: "Success", description: "Client updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update client: ${error.message}`, variant: "destructive" });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({ title: "Success", description: "Client deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete client: ${error.message}`, variant: "destructive" });
    }
  });

  // User role update mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'user' | 'admin' }) => {
      return await apiRequest('PUT', `/api/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({ title: "Success", description: "User role updated successfully" });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to update user role";
      
      // Handle specific error messages from backend
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = `Failed to update user role: ${error.message}`;
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  });

  // User delete mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['/api/users'] });
      setIsDeleteUserDialogOpen(false);
      setSelectedUserForDeletion(null);
      toast({ title: "Success", description: "User deleted successfully" });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to delete user";
      
      // Handle specific constraint errors from the backend
      if (error.response?.status === 409) {
        // Conflict status indicates constraint violation
        const errorData = error.response.data;
        if (errorData.registrationCount) {
          errorMessage = `Cannot delete user - ${errorData.registrationCount} registration${errorData.registrationCount > 1 ? 's exist' : ' exists'}. Please cancel all registrations first.`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = "Cannot delete user due to existing registrations. Please cancel all registrations first.";
        }
      } else if (error.response?.data?.error) {
        // Use specific error message from backend
        errorMessage = error.response.data.error;
      } else {
        // Fallback to generic error message
        errorMessage = `Failed to delete user: ${error.message}`;
      }
      
      toast({ 
        title: "Cannot Delete User", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  });

  // Class Type mutations
  const createClassTypeMutation = useMutation({
    mutationFn: async (data: InsertClassType) => {
      return await apiRequest('POST', '/api/class-types', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-types'] });
      setIsAddClassTypeDialogOpen(false);
      toast({ title: "Success", description: "Class type created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to create class type: ${error.message}`, variant: "destructive" });
    }
  });

  const updateClassTypeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertClassType> }) => {
      return await apiRequest('PUT', `/api/class-types/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-types'] });
      setIsEditClassTypeDialogOpen(false);
      setSelectedClassType(null);
      toast({ title: "Success", description: "Class type updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update class type: ${error.message}`, variant: "destructive" });
    }
  });

  const deleteClassTypeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/class-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/class-types'] });
      toast({ title: "Success", description: "Class type deleted successfully" });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to delete class type";
      
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        if (errorData.classCount) {
          errorMessage = `Cannot delete class type - ${errorData.classCount} class${errorData.classCount > 1 ? 'es are' : ' is'} using this type. Please reassign all classes first.`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else {
          errorMessage = "Cannot delete class type due to existing classes. Please reassign all classes first.";
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else {
        errorMessage = `Failed to delete class type: ${error.message}`;
      }
      
      toast({ 
        title: "Cannot Delete Class Type", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  });

  // Email Settings mutations
  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (data: Partial<InsertEmailSettings>) => {
      return await apiRequest('PUT', '/api/email-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/email-settings'] });
      refetchEmailSettings();
      toast({ title: "Success", description: "Email settings updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update email settings: ${error.message}`, variant: "destructive" });
    }
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: async (data: { testRecipient: string }) => {
      return await apiRequest('POST', '/api/send-test-email', data);
    },
    onSuccess: () => {
      setTestEmailRecipient('');
      setIsTestEmailLoading(false);
      toast({ title: "Success", description: "Test email sent successfully!" });
    },
    onError: (error) => {
      setIsTestEmailLoading(false);
      toast({ title: "Error", description: `Failed to send test email: ${error.message}`, variant: "destructive" });
    }
  });
  
  // Form setup for adding classes
  const addClassForm = useForm<InsertClass>({
    resolver: zodResolver(insertClassSchema.extend({
      description: z.string().min(10, "Description must be at least 10 characters").optional(),
      date: insertClassSchema.shape.date.refine(
        (date) => {
          const inputDate = new Date(date + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate >= today;
        },
        { message: "Date must be in the future" }
      ),
      capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
      available: z.coerce.number().min(0, "Available spots cannot be negative"),
      price: z.coerce.number().min(0, "Price cannot be negative")
    })),
    defaultValues: {
      title: '',
      type: 'BLS',
      classTypeId: '',
      description: '',
      image: '',
      date: '',
      time: '',
      duration: '',
      capacity: 1,
      available: 1,
      price: 0
    }
  });
  
  // Form setup for editing classes
  const editClassForm = useForm<InsertClass>({
    resolver: zodResolver(insertClassSchema.extend({
      description: z.string().min(10, "Description must be at least 10 characters").optional(),
      date: insertClassSchema.shape.date.refine(
        (date) => {
          const inputDate = new Date(date + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate >= today;
        },
        { message: "Date must be in the future" }
      ),
      capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
      available: z.coerce.number().min(0, "Available spots cannot be negative"),
      price: z.coerce.number().min(0, "Price cannot be negative")
    })),
  });

  // Form setup for adding discount codes
  const addDiscountCodeForm = useForm<InsertDiscountCode>({
    resolver: zodResolver(insertDiscountCodeSchema.extend({
      maxUses: z.coerce.number().min(1, "Max uses must be at least 1").optional().nullable(),
    })),
    defaultValues: {
      code: '',
      expiresAt: '',
      isActive: true,
      maxUses: null,
      description: ''
    }
  });

  // Form setup for editing discount codes
  const editDiscountCodeForm = useForm<InsertDiscountCode>({
    resolver: zodResolver(insertDiscountCodeSchema.extend({
      maxUses: z.coerce.number().min(1, "Max uses must be at least 1").optional().nullable(),
    })),
  });

  // Form setup for adding clients
  const addClientForm = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema.extend({
      registrationDate: insertClientSchema.shape.registrationDate.refine(
        (date) => {
          const inputDate = new Date(date + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate <= today;
        },
        { message: "Registration date cannot be in the future" }
      ),
      lastCourseDate: insertClientSchema.shape.lastCourseDate.refine(
        (date) => {
          const inputDate = new Date(date + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate <= today;
        },
        { message: "Last course date cannot be in the future" }
      )
    })),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      registrationDate: '',
      lastCourseDate: '',
      completedCourses: []
    }
  });

  // Form setup for editing clients
  const editClientForm = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema.extend({
      registrationDate: insertClientSchema.shape.registrationDate.refine(
        (date) => {
          const inputDate = new Date(date + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate <= today;
        },
        { message: "Registration date cannot be in the future" }
      ),
      lastCourseDate: insertClientSchema.shape.lastCourseDate.refine(
        (date) => {
          const inputDate = new Date(date + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate <= today;
        },
        { message: "Last course date cannot be in the future" }
      )
    })),
  });

  // Form setup for adding class types
  const addClassTypeForm = useForm<InsertClassType>({
    resolver: zodResolver(insertClassTypeSchema.extend({
      description: z.string().optional(),
    })),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      isActive: true,
      badgeLabel: '',
      badgeColor: 'default'
    }
  });

  // Form setup for editing class types
  const editClassTypeForm = useForm<InsertClassType>({
    resolver: zodResolver(insertClassTypeSchema.extend({
      description: z.string().optional(),
    })),
  });

  // Helper function for date filtering
  const getDateRangeFilter = (range: string, date: string) => {
    if (range === 'all' || !date) return true;
    
    const clientDate = new Date(date);
    const now = new Date();
    
    switch (range) {
      case 'thisYear':
        return clientDate.getFullYear() === now.getFullYear();
      case 'last6Months':
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return clientDate >= sixMonthsAgo;
      case 'last30Days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return clientDate >= thirtyDaysAgo;
      default:
        return true;
    }
  };

  const filteredClients = clients.filter(client => {
    // Text search filter
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Certification status filter
    const matchesCertificationStatus = 
      clientFilters.certificationStatus === 'all' ||
      client.certificationStatus === clientFilters.certificationStatus;

    // Course type filter
    const matchesCourseType = 
      clientFilters.courseType === 'all' ||
      (clientFilters.courseType === 'bls' && client.completedCourses.includes('BLS')) ||
      (clientFilters.courseType === 'heartsaver' && client.completedCourses.includes('Heartsaver')) ||
      (clientFilters.courseType === 'both' && client.completedCourses.includes('BLS') && client.completedCourses.includes('Heartsaver')) ||
      (clientFilters.courseType === 'none' && client.completedCourses.length === 0);

    // Registration date range filter
    const matchesRegistrationDate = getDateRangeFilter(
      clientFilters.registrationDateRange,
      client.registrationDate
    );

    // Last course date range filter
    const matchesLastCourseDate = getDateRangeFilter(
      clientFilters.lastCourseDateRange,
      client.lastCourseDate || ''
    );

    return matchesSearch && matchesCertificationStatus && matchesCourseType && 
           matchesRegistrationDate && matchesLastCourseDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);
  const startIndex = (currentPage - 1) * clientsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + clientsPerPage);
  
  // Reset to page 1 when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };
  
  const filteredClasses = classes.filter(classItem =>
    classItem.title.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
    classItem.type.toLowerCase().includes(classSearchTerm.toLowerCase())
  );

  const registrations = registrationsData?.registrations || [];
  const filteredRegistrations = registrations.filter(registration =>
    registration.firstName.toLowerCase().includes(registrationSearchTerm.toLowerCase()) ||
    registration.lastName.toLowerCase().includes(registrationSearchTerm.toLowerCase()) ||
    registration.email.toLowerCase().includes(registrationSearchTerm.toLowerCase())
  );

  const filteredDiscountCodes = discountCodes.filter(code =>
    code.code.toLowerCase().includes(discountCodeSearchTerm.toLowerCase()) ||
    (code.description && code.description.toLowerCase().includes(discountCodeSearchTerm.toLowerCase())) ||
    code.createdBy.toLowerCase().includes(discountCodeSearchTerm.toLowerCase())
  );

  const filteredClassTypes = classTypes.filter(classType =>
    classType.name.toLowerCase().includes(classTypeSearchTerm.toLowerCase()) ||
    classType.displayName.toLowerCase().includes(classTypeSearchTerm.toLowerCase()) ||
    (classType.description && classType.description.toLowerCase().includes(classTypeSearchTerm.toLowerCase()))
  );

  // Client handlers
  const handleEdit = (client: Client) => {
    // Always find the latest client data from the current clients list
    // to ensure we have the most up-to-date information
    const latestClient = clients.find(c => c.id === client.id) || client;
    setSelectedClient(latestClient);
    
    // Force a complete form reset to clear any stale state
    editClientForm.reset();
    
    // Then set the fresh data
    editClientForm.reset({
      firstName: latestClient.firstName,
      lastName: latestClient.lastName,
      email: latestClient.email,
      phone: latestClient.phone || '',
      registrationDate: latestClient.registrationDate,
      lastCourseDate: latestClient.lastCourseDate || '',
      completedCourses: latestClient.completedCourses || []
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const handleAddClient = () => {
    addClientForm.reset();
    setIsAddClientDialogOpen(true);
  };

  const onAddClientSubmit = (data: InsertClient) => {
    createClientMutation.mutate(data);
  };

  const onEditClientSubmit = (data: InsertClient) => {
    if (selectedClient) {
      updateClientMutation.mutate({ id: selectedClient.id, data });
    }
  };
  
  // Class handlers
  const handleAddClass = () => {
    addClassForm.reset();
    setIsAddClassDialogOpen(true);
  };
  
  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    editClassForm.reset({
      title: classItem.title,
      type: classItem.type,
      date: classItem.date,
      time: classItem.time,
      duration: classItem.duration,
      capacity: classItem.capacity,
      available: classItem.available,
      price: classItem.price,
      image: classItem.image || '',
      description: classItem.description || '',
      classTypeId: classItem.classTypeId || ''
    });
    setIsEditClassDialogOpen(true);
  };
  
  const handleDeleteClass = (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteClassMutation.mutate(classId);
    }
  };
  
  const onAddClassSubmit = (data: InsertClass) => {
    createClassMutation.mutate(data);
  };
  
  const onEditClassSubmit = (data: InsertClass) => {
    if (selectedClass) {
      updateClassMutation.mutate({ id: selectedClass.id, data });
    }
  };
  
  // Registration handlers
  const handleDeleteRegistration = (registrationId: string) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      deleteRegistrationMutation.mutate(registrationId);
    }
  };

  // Discount Code handlers
  const handleAddDiscountCode = () => {
    addDiscountCodeForm.reset();
    setIsAddDiscountCodeDialogOpen(true);
  };

  const handleEditDiscountCode = (discountCode: DiscountCode) => {
    setSelectedDiscountCode(discountCode);
    editDiscountCodeForm.reset({
      code: discountCode.code,
      expiresAt: new Date(discountCode.expiresAt).toISOString().split('T')[0],
      isActive: discountCode.isActive,
      maxUses: discountCode.maxUses,
      description: discountCode.description || ''
    });
    setIsEditDiscountCodeDialogOpen(true);
  };

  const handleDeleteDiscountCode = (discountCodeId: string) => {
    if (window.confirm('Are you sure you want to delete this discount code?')) {
      deleteDiscountCodeMutation.mutate(discountCodeId);
    }
  };

  const onAddDiscountCodeSubmit = (data: InsertDiscountCode) => {
    createDiscountCodeMutation.mutate(data);
  };

  const onEditDiscountCodeSubmit = (data: InsertDiscountCode) => {
    if (selectedDiscountCode) {
      updateDiscountCodeMutation.mutate({ id: selectedDiscountCode.id, data });
    }
  };

  // Class Type handlers
  const handleAddClassType = () => {
    addClassTypeForm.reset();
    setIsAddClassTypeDialogOpen(true);
  };

  const handleEditClassType = (classType: ClassType) => {
    setSelectedClassType(classType);
    editClassTypeForm.reset({
      name: classType.name,
      displayName: classType.displayName,
      description: classType.description || '',
      isActive: classType.isActive,
      badgeLabel: classType.badgeLabel,
      badgeColor: classType.badgeColor
    });
    setIsEditClassTypeDialogOpen(true);
  };

  const handleDeleteClassType = (classTypeId: string) => {
    if (window.confirm('Are you sure you want to delete this class type? This action cannot be undone.')) {
      deleteClassTypeMutation.mutate(classTypeId);
    }
  };

  const onAddClassTypeSubmit = (data: InsertClassType) => {
    createClassTypeMutation.mutate(data);
  };

  const onEditClassTypeSubmit = (data: InsertClassType) => {
    if (selectedClassType) {
      updateClassTypeMutation.mutate({ id: selectedClassType.id, data });
    }
  };

  const copyDiscountCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Copied!", description: `Discount code "${code}" copied to clipboard` });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({ title: "Copy failed", description: "Failed to copy to clipboard", variant: "destructive" });
    }
  };

  // View class details function
  const handleViewClassDetails = async (classItem: Class) => {
    try {
      // Add cache-busting parameter to force fresh data
      const response = await fetch(`/api/classes/${classItem.id}/roster?${Date.now()}`);
      const data = await response.json();
      
      if (data.success) {
        setClassDetailsData({
          classData: data.classData,
          registrations: data.registrations
        });
        setIsClassDetailsDialogOpen(true);
      } else {
        throw new Error(data.error || 'Failed to load class details');
      }
    } catch (error) {
      console.error('Load class details error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load class details",
        variant: "destructive" 
      });
    }
  };

  // Roster generation function
  const handleGenerateRoster = async (classItem: Class) => {
    try {
      setIsGeneratingRoster(true);
      
      const response = await fetch(`/api/classes/${classItem.id}/roster`);
      const data = await response.json();
      
      if (data.success) {
        // Import the PDF generation functions dynamically
        const { pdf } = await import('@react-pdf/renderer');
        const { ClassRosterPDF } = await import('./ClassRosterPDF');
        
        // Generate PDF blob
        const pdfBlob = await pdf(
          <ClassRosterPDF
            classData={data.classData}
            registrations={data.registrations}
            generatedDate={new Date().toLocaleDateString('en-US')}
          />
        ).toBlob();
        
        // Create download link
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${classItem.title.replace(/[^a-zA-Z0-9]/g, '_')}_roster_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({ 
          title: "Roster Generated", 
          description: `Class roster for "${classItem.title}" has been downloaded` 
        });
      } else {
        throw new Error(data.error || 'Failed to generate roster');
      }
    } catch (error) {
      console.error('Generate roster error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to generate class roster",
        variant: "destructive" 
      });
    } finally {
      setIsGeneratingRoster(false);
    }
  };

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.certificationStatus === 'active').length,
    totalCertifications: clients.reduce((sum, client) => sum + client.completedCourses.length, 0),
    totalClasses: classes.length,
    availableSpots: classes.reduce((sum, classItem) => sum + classItem.available, 0),
    totalRegistrations: registrations.length,
    pendingRegistrations: registrations.filter(r => r.status === 'pending').length,
    monthlyRevenue: (() => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      return registrations
        .filter(r => {
          // Only include confirmed registrations
          if (r.status !== 'confirmed') return false;
          
          // Only include registrations from current month/year
          const regDate = new Date(r.registrationDate);
          return regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear;
        })
        .reduce((sum, r) => sum + (r.amountPaid || 0), 0) / 100; // Convert cents to dollars
    })()
  };

  // Toggle collapsible sections
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  // Sidebar Statistics Component using proper Shadcn components
  const DashboardSidebar = () => (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center space-x-2 p-2">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold text-sm">Dashboard Totals</h2>
            <p className="text-xs text-muted-foreground">Overview</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Statistics</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2" role="region" aria-label="Dashboard statistics">
            {/* Total Clients */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">Total Clients</p>
                  <p className="text-lg font-bold">{stats.totalClients}</p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Active Clients */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">Active Clients</p>
                  <p className="text-lg font-bold">{stats.activeClients}</p>
                </div>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Total Classes */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">Total Classes</p>
                  <p className="text-lg font-bold">{stats.totalClasses}</p>
                </div>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Available Spots */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">Available Spots</p>
                  <p className="text-lg font-bold">{stats.availableSpots}</p>
                </div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Total Registrations */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">Total Registrations</p>
                  <p className="text-lg font-bold">{stats.totalRegistrations}</p>
                </div>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Pending Registrations */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">Pending Registrations</p>
                  <p className="text-lg font-bold">{stats.pendingRegistrations}</p>
                </div>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Total Certifications */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">Total Certifications</p>
                  <p className="text-lg font-bold">{stats.totalCertifications}</p>
                </div>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>

            {/* Monthly Revenue */}
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  <p className="text-lg font-bold">${stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <div className="flex h-screen w-full">
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1 bg-muted/30">
          {/* Header with Sidebar Toggle */}
          <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger 
                size="icon" 
                data-testid="button-sidebar-toggle"
                aria-label="Toggle dashboard sidebar"
                className="shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage your CPR training clients, classes and records</p>
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-6">

        {/* User Management */}
        <Collapsible open={openSection === 'users'} onOpenChange={() => toggleSection('users')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" data-testid="section-header-users">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">User Management</CardTitle>
                      <CardDescription>
                        Manage user accounts and permissions
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {users.length} users
                    </Badge>
                    {openSection === 'users' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>

                {/* Users Cards for Mobile/Tablet */}
                <div className="md:hidden space-y-3">
                  {usersLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                  ) : (() => {
                    const filteredUsers = users.filter(user => 
                      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                      (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase())
                    );
                    
                    if (filteredUsers.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          {userSearchTerm ? `No users found matching "${userSearchTerm}"` : 'No users found'}
                        </div>
                      );
                    }
                    
                    return filteredUsers.map((user) => {
                      const isCurrentUser = currentUser?.id === user.id;
                      const canDemote = user.role === 'admin' && !isCurrentUser;
                      
                      return (
                        <Card key={user.id} className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {user.firstName && user.lastName ? 
                                      `${user.firstName} ${user.lastName}` : 
                                      user.email || 'Unknown User'
                                    }
                                  </span>
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="text-xs">You</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                              </div>
                              <Badge 
                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                                className={user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                              >
                                {user.role}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              {user.role === 'user' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateUserRoleMutation.mutate({ id: user.id, role: 'admin' })}
                                  disabled={updateUserRoleMutation.isPending}
                                  className="flex items-center gap-1"
                                >
                                  <Shield className="h-3 w-3" />
                                  Make Admin
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (canDemote) {
                                      updateUserRoleMutation.mutate({ id: user.id, role: 'user' });
                                    }
                                  }}
                                  disabled={updateUserRoleMutation.isPending || !canDemote}
                                  className="flex items-center gap-1"
                                  title={!canDemote ? 'Cannot demote your own account' : ''}
                                >
                                  <UserMinus className="h-3 w-3" />
                                  Make User
                                </Button>
                              )}
                              {!isCurrentUser && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  disabled={deleteUserMutation.isPending}
                                  className="flex items-center gap-1 text-destructive hover:text-destructive"
                                >
                                  <Trash className="h-3 w-3" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    });
                  })()}
                </div>

                {/* Users Table for Desktop */}
                <div className="hidden md:block">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3">User</TableHead>
                          <TableHead className="w-1/4">Role</TableHead>
                          <TableHead className="w-5/12">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersLoading ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8" data-testid="loading-users">
                              Loading users...
                            </TableCell>
                          </TableRow>
                        ) : (() => {
                          const filteredUsers = users.filter(user => 
                            `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                            (user.email || '').toLowerCase().includes(userSearchTerm.toLowerCase())
                          );
                          
                          if (filteredUsers.length === 0) {
                            return (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground" data-testid="no-users-found">
                                  {userSearchTerm ? `No users found matching "${userSearchTerm}"` : 'No users found'}
                                </TableCell>
                              </TableRow>
                            );
                          }
                          
                          return filteredUsers.map((user) => {
                            const isCurrentUser = currentUser?.id === user.id;
                            const canDemote = user.role === 'admin' && !isCurrentUser;
                            
                            return (
                              <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                                <TableCell className="py-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">
                                        {user.firstName && user.lastName ? 
                                          `${user.firstName} ${user.lastName}` : 
                                          user.email || 'Unknown User'
                                        }
                                      </span>
                                      {isCurrentUser && (
                                        <Badge variant="outline" className="text-xs" data-testid="badge-current-user">
                                          You
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="py-3">
                                  <Badge 
                                    variant={user.role === 'admin' ? 'default' : 'secondary'}
                                    className={user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                                    data-testid={`badge-role-${user.role}`}
                                  >
                                    {user.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="flex gap-2">
                                    {user.role === 'user' ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateUserRoleMutation.mutate({ id: user.id, role: 'admin' })}
                                        disabled={updateUserRoleMutation.isPending}
                                        data-testid={`button-promote-${user.id}`}
                                        className="flex items-center gap-1"
                                      >
                                        <Shield className="h-3 w-3" />
                                        Make Admin
                                      </Button>
                                    ) : (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => {
                                                if (canDemote) {
                                                  updateUserRoleMutation.mutate({ id: user.id, role: 'user' });
                                                }
                                              }}
                                              disabled={updateUserRoleMutation.isPending}
                                              aria-disabled={!canDemote}
                                              data-testid={`button-demote-${user.id}`}
                                              className={`flex items-center gap-1 ${!canDemote ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                              <UserMinus className="h-3 w-3" />
                                              Make User
                                            </Button>
                                          </span>
                                        </TooltipTrigger>
                                        {!canDemote && (
                                          <TooltipContent>
                                            <p>You cannot demote your own account to prevent admin lockout</p>
                                          </TooltipContent>
                                        )}
                                      </Tooltip>
                                    )}
                                    
                                    {/* Delete User Button */}
                                    {!isCurrentUser && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span>
                                        <Button
                                          size="sm"
                                          variant={isCurrentUser ? "outline" : "destructive"}
                                          onClick={() => {
                                            if (!isCurrentUser) {
                                              setSelectedUserForDeletion(user);
                                              setIsDeleteUserDialogOpen(true);
                                            }
                                          }}
                                          disabled={deleteUserMutation.isPending || isCurrentUser}
                                          aria-disabled={isCurrentUser}
                                          data-testid={`button-delete-${user.id}`}
                                          className={isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                          <Trash className="h-4 w-4" />
                                        </Button>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{isCurrentUser ? 'You cannot delete your own account to prevent admin lockout' : 'Delete user account'}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()
                      }
                    </TableBody>
                  </Table>
                </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Client Management */}
        <Collapsible open={openSection === 'clients'} onOpenChange={() => toggleSection('clients')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" data-testid="section-header-clients">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Client Management</CardTitle>
                      <CardDescription>
                        View and manage all registered clients
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {clients.length} clients
                    </Badge>
                    {openSection === 'clients' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        resetPagination();
                      }}
                      className="pl-10"
                      data-testid="input-search-clients"
                    />
                  </div>
                  <Button 
                    onClick={handleAddClient}
                    data-testid="button-add-client"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                  </Button>
                </div>
                
                {/* Quick Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select 
                    value={clientFilters.certificationStatus} 
                    onValueChange={(value) => {
                      setClientFilters(prev => ({ ...prev, certificationStatus: value }));
                      resetPagination();
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Summary */}
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Showing {paginatedClients.length} of {filteredClients.length} clients</span>
                  {clientFilters.certificationStatus !== 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setClientFilters({
                          certificationStatus: 'all',
                          courseType: 'all',
                          registrationDateRange: 'all',
                          lastCourseDateRange: 'all'
                        });
                        resetPagination();
                      }}
                      className="h-6 px-2 text-xs"
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>

                {/* Client Cards for Mobile/Tablet */}
                <div className="lg:hidden space-y-3">
                  {clientsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading clients...</div>
                  ) : paginatedClients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {filteredClients.length === 0 ? 'No clients found' : 'No clients on this page'}
                    </div>
                  ) : (
                    paginatedClients.map((client) => (
                      <Card key={client.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{client.firstName} {client.lastName}</div>
                              <p className="text-sm text-muted-foreground">{client.email}</p>
                              {client.phone && (
                                <p className="text-sm text-muted-foreground">{client.phone}</p>
                              )}
                            </div>
                            <Badge variant={
                              client.certificationStatus === 'active' ? 'success' : 
                              client.certificationStatus === 'update' ? 'warning' : 
                              'destructive'
                            }>
                              {client.certificationStatus}
                            </Badge>
                          </div>
                          
                          {client.completedCourses.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {client.completedCourses.map((courseId, idx) => {
                                const classItem = classes.find(c => c.id === courseId);
                                const classType = classTypes.find(ct => ct.id === classItem?.classTypeId);
                                const badgeColor = (classType?.badgeColor || 'outline') as 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'purple' | 'pink' | 'teal' | 'outline';
                                const displayName = classType?.badgeLabel || classItem?.type || courseId;
                                return (
                                  <Badge key={idx} variant={badgeColor} className="text-xs">
                                    {displayName}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t">
                            <div className="text-xs text-muted-foreground">
                              Registered: {client.registrationDate}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(client)}
                                className="flex items-center gap-1"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(client.id)}
                                className="flex items-center gap-1 text-destructive hover:text-destructive"
                              >
                                <Trash className="h-3 w-3" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                {/* Client Table for Desktop */}
                <div className="hidden lg:block">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/4">Client</TableHead>
                          <TableHead className="w-1/6">Status</TableHead>
                          <TableHead className="w-1/4">Courses</TableHead>
                          <TableHead className="w-1/6">Last Course</TableHead>
                          <TableHead className="w-1/6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientsLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Loading clients...
                            </TableCell>
                          </TableRow>
                        ) : paginatedClients.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              {filteredClients.length === 0 ? 'No clients found' : 'No clients on this page'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedClients.map((client) => (
                            <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                              <TableCell className="py-3">
                                <div>
                                  <div className="font-medium">{client.firstName} {client.lastName}</div>
                                  <p className="text-sm text-muted-foreground">{client.email}</p>
                                  {client.phone && (
                                    <p className="text-xs text-muted-foreground">{client.phone}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge variant={
                                  client.certificationStatus === 'active' ? 'success' : 
                                  client.certificationStatus === 'update' ? 'warning' : 
                                  'destructive'
                                }>
                                  {client.certificationStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex gap-1 flex-wrap">
                                  {client.completedCourses.length > 0 ? client.completedCourses.map((courseId, idx) => {
                                    const classItem = classes.find(c => c.id === courseId);
                                    const classType = classTypes.find(ct => ct.id === classItem?.classTypeId);
                                    const badgeColor = (classType?.badgeColor || 'outline') as 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'purple' | 'pink' | 'teal' | 'outline';
                                    const displayName = classType?.badgeLabel || classItem?.type || courseId;
                                    return (
                                      <Badge key={idx} variant={badgeColor} className="text-xs">
                                        {displayName}
                                      </Badge>
                                    );
                                  }) : (
                                    <span className="text-sm text-muted-foreground">None</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-3">
                                <span className="text-sm">{client.lastCourseDate || 'Never'}</span>
                              </TableCell>
                              <TableCell className="py-3">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(client)}
                                    className="flex items-center gap-1"
                                    data-testid={`button-edit-${client.id}`}
                                  >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDelete(client.id)}
                                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                                    data-testid={`button-delete-${client.id}`}
                                  >
                                    <Trash className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Simplified Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        data-testid="button-previous-page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        data-testid="button-next-page"
                      >
                        Next
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Class Management */}
        <Collapsible open={openSection === 'classes'} onOpenChange={() => toggleSection('classes')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" data-testid="section-header-classes">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Class Management</CardTitle>
                      <CardDescription>
                        View and manage all training classes
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {classes.length} classes
                    </Badge>
                    {openSection === 'classes' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes by title or type..."
                  value={classSearchTerm}
                  onChange={(e) => setClassSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-classes"
                />
              </div>
              <Button 
                onClick={handleAddClass}
                data-testid="button-add-class"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </div>

            {/* Classes Table */}
            {classesLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading classes...</div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No classes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredClasses.map((classItem) => (
                        <TableRow key={classItem.id} data-testid={`row-class-${classItem.id}`}>
                          <TableCell className="font-medium">{classItem.title}</TableCell>
                          <TableCell>
                            {(() => {
                              const classType = classTypes.find(ct => ct.id === classItem.classTypeId);
                              const badgeColor = (classType?.badgeColor || 'default') as 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'purple' | 'pink' | 'teal' | 'outline';
                              const badgeLabel = classType?.badgeLabel || classItem.type;
                              return (
                                <Badge variant={badgeColor}>
                                  {badgeLabel}
                                </Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>{classItem.date}</TableCell>
                          <TableCell>{classItem.time}</TableCell>
                          <TableCell>{classItem.duration}</TableCell>
                          <TableCell>{classItem.capacity}</TableCell>
                          <TableCell>
                            <Badge variant={classItem.available > 0 ? 'default' : 'destructive'}>
                              {classItem.available}
                            </Badge>
                          </TableCell>
                          <TableCell>${classItem.price}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`button-actions-${classItem.id}`}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleViewClassDetails(classItem)}
                                  data-testid={`button-view-details-${classItem.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditClass(classItem)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleGenerateRoster(classItem)}
                                  disabled={isGeneratingRoster}
                                  data-testid={`button-generate-roster-${classItem.id}`}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  {isGeneratingRoster ? 'Generating...' : 'Generate Roster'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClass(classItem.id)}
                                  className="text-destructive"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Registration Management */}
        <Collapsible open={openSection === 'registrations'} onOpenChange={() => toggleSection('registrations')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" data-testid="section-header-registrations">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Registration Management</CardTitle>
                      <CardDescription>
                        View and manage all class registrations
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {registrations.length} registrations
                    </Badge>
                    {openSection === 'registrations' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search registrations by name or email..."
                value={registrationSearchTerm}
                onChange={(e) => setRegistrationSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-registrations"
              />
            </div>

            {/* Registrations Table */}
            {registrationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading registrations...</div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount Paid</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No registrations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRegistrations.map((registration) => {
                        const relatedClass = classes.find(c => c.id === registration.classId);
                        return (
                          <TableRow key={registration.id} data-testid={`row-registration-${registration.id}`}>
                            <TableCell className="font-medium">
                              {registration.firstName} {registration.lastName}
                            </TableCell>
                            <TableCell>{registration.email}</TableCell>
                            <TableCell>{registration.phone || 'N/A'}</TableCell>
                            <TableCell>
                              {relatedClass ? (
                                <div>
                                  <div className="font-medium">{relatedClass.title}</div>
                                  <Badge variant="outline" className="text-xs">
                                    {relatedClass.type}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Class not found</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  registration.status === 'confirmed' ? 'default' :
                                  registration.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }
                              >
                                {registration.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {(registration as any).discountCode ? (
                                `Discount Code: ${(registration as any).discountCode.code}`
                              ) : registration.amountPaid ? (
                                `$${(registration.amountPaid / 100).toFixed(2)}`
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell>{registration.registrationDate}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" data-testid={`button-actions-${registration.id}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteRegistration(registration.id)}
                                    className="text-destructive"
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Discount Code Management */}
        <Collapsible open={openSection === 'discount-codes'} onOpenChange={() => toggleSection('discount-codes')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" data-testid="section-header-discount-codes">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Discount Code Management</CardTitle>
                      <CardDescription>
                        Create and manage discount codes for free class registrations
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {discountCodes.length} codes
                    </Badge>
                    {openSection === 'discount-codes' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discount codes by code or description..."
                  value={discountCodeSearchTerm}
                  onChange={(e) => setDiscountCodeSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-discount-codes"
                />
              </div>
              <Button 
                onClick={handleAddDiscountCode}
                data-testid="button-add-discount-code"
              >
                <Ticket className="mr-2 h-4 w-4" />
                Add Discount Code
              </Button>
            </div>

            {/* Discount Codes Table */}
            {discountCodesLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-muted-foreground">Loading discount codes...</div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDiscountCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No discount codes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDiscountCodes.map((code) => {
                        const isExpired = new Date() > new Date(code.expiresAt);
                        const isMaxedOut = code.maxUses && code.usedCount >= code.maxUses;
                        
                        return (
                          <TableRow key={code.id} data-testid={`row-discount-code-${code.id}`}>
                            <TableCell className="font-mono font-medium">
                              <div className="flex items-center gap-2">
                                {code.code}
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => copyDiscountCode(code.code)}
                                  data-testid={`button-copy-${code.code}`}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  !code.isActive ? 'secondary' : 
                                  isExpired ? 'destructive' : 
                                  isMaxedOut ? 'secondary' : 
                                  'default'
                                }
                              >
                                {!code.isActive ? 'Inactive' : 
                                 isExpired ? 'Expired' : 
                                 isMaxedOut ? 'Max Used' : 
                                 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={isExpired ? 'text-destructive' : ''}>
                                {new Date(code.expiresAt).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span>
                                {code.usedCount}
                                {code.maxUses ? ` / ${code.maxUses}` : ' / ∞'}
                              </span>
                            </TableCell>
                            <TableCell>{code.createdBy}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {code.description || '-'}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" data-testid={`button-actions-${code.id}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditDiscountCode(code)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteDiscountCode(code.id)}
                                    className="text-destructive"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Class Type Management */}
        <Collapsible open={openSection === 'class-types'} onOpenChange={() => toggleSection('class-types')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Class Type Management</CardTitle>
                      <CardDescription>
                        Manage available class types and categories
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="hidden sm:inline-flex">
                      {filteredClassTypes.length} types
                    </Badge>
                    {openSection === 'class-types' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search class types..."
                      value={classTypeSearchTerm}
                      onChange={(e) => setClassTypeSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-class-types"
                    />
                  </div>
                  <Button 
                    onClick={handleAddClassType}
                    disabled={createClassTypeMutation.isPending}
                    data-testid="button-add-class-type"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Class Type
                  </Button>
                </div>

                {classTypesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading class types...</p>
                    </div>
                  </div>
                ) : filteredClassTypes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No class types found</p>
                    {classTypeSearchTerm && (
                      <p className="text-sm mt-2">Try adjusting your search criteria</p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Display Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClassTypes.map((classType) => (
                          <TableRow key={classType.id}>
                            <TableCell className="font-medium" data-testid={`text-class-type-name-${classType.id}`}>
                              {classType.name}
                            </TableCell>
                            <TableCell>{classType.displayName}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {classType.description || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={classType.isActive ? 'default' : 'secondary'}>
                                {classType.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(classType.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" data-testid={`button-actions-${classType.id}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditClassType(classType)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteClassType(classType.id)}
                                    className="text-destructive"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Email Configuration */}
        <Collapsible open={openSection === 'email-settings'} onOpenChange={() => toggleSection('email-settings')}>
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" data-testid="section-header-email-settings">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-lg">Email Configuration</CardTitle>
                      <CardDescription>
                        Manage email settings and test email delivery
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant={emailSettings.enableEmailConfirmations ? "default" : "secondary"} className="hidden sm:inline-flex">
                      {emailSettings.enableEmailConfirmations ? "Enabled" : "Disabled"}
                    </Badge>
                    {openSection === 'email-settings' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-6">
                {emailSettingsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading email settings...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Email Settings Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="senderEmail" data-testid="label-sender-email">
                            Sender Email Address 
                            <Badge variant="outline" className="ml-2 text-xs">
                              ENFORCED BY SYSTEM
                            </Badge>
                          </Label>
                          <Input
                            id="senderEmail"
                            type="email"
                            placeholder="Automatically uses Gmail authentication email"
                            value={emailSettings.senderEmail}
                            disabled
                            className="opacity-75 cursor-not-allowed"
                            data-testid="input-sender-email"
                          />
                          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                            <div className="flex">
                              <div className="flex-shrink-0">
                                <Shield className="h-5 w-5 text-amber-600" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-amber-800">
                                  Security Enforcement Active
                                </p>
                                <p className="text-sm text-amber-700 mt-1">
                                  For security and deliverability, the From address is automatically set to your authenticated Gmail account. This prevents email spoofing and ensures reliable delivery.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="replyToEmail" data-testid="label-reply-to-email">Reply-to Email Address (Optional)</Label>
                          <Input
                            id="replyToEmail"
                            type="email"
                            placeholder="support@example.com"
                            value={emailSettings.replyToEmail || ''}
                            onChange={(e) => {
                              updateEmailSettingsMutation.mutate({
                                replyToEmail: e.target.value || null
                              });
                            }}
                            data-testid="input-reply-to-email"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Use your business email here. Replies will be sent to this address instead of the sender address.
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="businessName" data-testid="label-business-name">Business/Sender Name</Label>
                          <Input
                            id="businessName"
                            placeholder="CPR Training Center"
                            value={emailSettings.businessName}
                            onChange={(e) => {
                              updateEmailSettingsMutation.mutate({
                                businessName: e.target.value
                              });
                            }}
                            data-testid="input-business-name"
                          />
                        </div>

                        <div>
                          <Label htmlFor="businessPhone" data-testid="label-business-phone">Business Phone Number (Optional)</Label>
                          <Input
                            id="businessPhone"
                            placeholder="(555) 123-4567"
                            value={emailSettings.businessPhone || ''}
                            onChange={(e) => {
                              updateEmailSettingsMutation.mutate({
                                businessPhone: e.target.value || null
                              });
                            }}
                            data-testid="input-business-phone"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="businessAddress" data-testid="label-business-address">Business Address/Location (Optional)</Label>
                          <Textarea
                            id="businessAddress"
                            placeholder="123 Main Street&#10;City, State 12345"
                            value={emailSettings.businessAddress || ''}
                            onChange={(e) => {
                              updateEmailSettingsMutation.mutate({
                                businessAddress: e.target.value || null
                              });
                            }}
                            rows={3}
                            data-testid="textarea-business-address"
                          />
                        </div>

                        <div>
                          <Label htmlFor="emailSignature" data-testid="label-email-signature">Email Signature</Label>
                          <Textarea
                            id="emailSignature"
                            placeholder="Thank you for choosing our professional CPR training services!"
                            value={emailSettings.emailSignature || ''}
                            onChange={(e) => {
                              updateEmailSettingsMutation.mutate({
                                emailSignature: e.target.value
                              });
                            }}
                            rows={3}
                            data-testid="textarea-email-signature"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="enableEmailConfirmations"
                            checked={emailSettings.enableEmailConfirmations}
                            onCheckedChange={(checked) => {
                              updateEmailSettingsMutation.mutate({
                                enableEmailConfirmations: checked
                              });
                            }}
                            data-testid="switch-enable-email-confirmations"
                          />
                          <Label htmlFor="enableEmailConfirmations" data-testid="label-enable-email-confirmations">
                            Enable Email Confirmations
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Email Template Customization */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Email Template Customization</h3>
                      <div>
                        <Label htmlFor="confirmationEmailTemplate" data-testid="label-confirmation-template">
                          Custom Confirmation Email Template (Optional)
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Leave empty to use the default template. You can use placeholders like {'{'}firstName{'}'}, {'{'}className{'}'}, {'{'}date{'}'}, {'{'}time{'}'}
                        </p>
                        <Textarea
                          id="confirmationEmailTemplate"
                          placeholder="Custom email template with placeholders..."
                          value={emailSettings.confirmationEmailTemplate || ''}
                          onChange={(e) => {
                            updateEmailSettingsMutation.mutate({
                              confirmationEmailTemplate: e.target.value || null
                            });
                          }}
                          rows={6}
                          data-testid="textarea-confirmation-template"
                        />
                      </div>
                    </div>

                    {/* Email Testing */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Email Testing</h3>
                      <div className="flex items-end space-x-4">
                        <div className="flex-1">
                          <Label htmlFor="testEmailRecipient" data-testid="label-test-recipient">Test Email Recipient</Label>
                          <Input
                            id="testEmailRecipient"
                            type="email"
                            placeholder="admin@example.com"
                            value={testEmailRecipient}
                            onChange={(e) => setTestEmailRecipient(e.target.value)}
                            data-testid="input-test-recipient"
                          />
                        </div>
                        <Button 
                          onClick={() => {
                            if (testEmailRecipient) {
                              setIsTestEmailLoading(true);
                              sendTestEmailMutation.mutate({ testRecipient: testEmailRecipient });
                            }
                          }}
                          disabled={!testEmailRecipient || isTestEmailLoading || sendTestEmailMutation.isPending}
                          data-testid="button-send-test-email"
                        >
                          <Send className="mr-2 h-4 w-4" />
                          {isTestEmailLoading || sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Send a sample registration confirmation email to test your configuration
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Class Details Dialog */}
        <Dialog open={isClassDetailsDialogOpen} onOpenChange={setIsClassDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-class-details">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Class Details
              </DialogTitle>
              <DialogDescription>
                View class information and enrolled students
              </DialogDescription>
            </DialogHeader>
            
            {classDetailsData && (
              <div className="space-y-6">
                {/* Class Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Class Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Title:</span>
                        <p className="font-medium">{classDetailsData.classData.title}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Type:</span>
                        <Badge variant={classDetailsData.classData.type === 'BLS' ? 'default' : 'secondary'} className="ml-2">
                          {classDetailsData.classData.type}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Date:</span>
                        <p className="font-medium">{new Date(classDetailsData.classData.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Time:</span>
                        <p className="font-medium">{classDetailsData.classData.time}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Duration:</span>
                        <p className="font-medium">{classDetailsData.classData.duration}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Price:</span>
                        <p className="font-medium">${classDetailsData.classData.price}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Enrollment Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Capacity:</span>
                        <p className="font-medium">{classDetailsData.classData.capacity} students</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Enrolled:</span>
                        <p className="font-medium">{classDetailsData.registrations.length} students</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Available:</span>
                        <Badge variant={classDetailsData.classData.available > 0 ? 'default' : 'destructive'}>
                          {classDetailsData.classData.available} remaining
                        </Badge>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Paid Registrations:</span>
                        <p className="font-medium">
                          {classDetailsData.registrations.filter(r => r.paymentIntentId).length} students
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Discount Codes Used:</span>
                        <p className="font-medium">
                          {classDetailsData.registrations.filter(r => (r as any).discountCode).length} students
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Total Revenue:</span>
                        <p className="font-medium">
                          ${(classDetailsData.registrations.reduce((sum, r) => sum + (r.amountPaid || 0), 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enrolled Students */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Enrolled Students ({classDetailsData.registrations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {classDetailsData.registrations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No students enrolled yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Mobile Layout */}
                        <div className="md:hidden space-y-3">
                          {classDetailsData.registrations.map((registration, index) => (
                            <Card key={registration.id} className="p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium" data-testid={`text-student-name-${index}`}>
                                      {registration.firstName} {registration.lastName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{registration.email}</p>
                                    {registration.phone && (
                                      <p className="text-sm text-muted-foreground">{registration.phone}</p>
                                    )}
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    #{index + 1}
                                  </Badge>
                                </div>
                                <div className="pt-2 border-t">
                                  <div className="flex flex-col gap-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Payment:</span>
                                      <span className="font-medium">
                                        {(registration as any).discountCode 
                                          ? `Discount Applied`
                                          : registration.paymentIntentId 
                                            ? `$${((registration.amountPaid || 0) / 100).toFixed(2)}`
                                            : 'Pending'
                                        }
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status:</span>
                                      <Badge 
                                        variant={
                                          registration.paymentIntentId || (registration as any).discountCode 
                                            ? 'default' 
                                            : 'secondary'
                                        }
                                        className="text-xs"
                                      >
                                        {registration.paymentIntentId || (registration as any).discountCode ? 'Confirmed' : 'Pending'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>

                        {/* Desktop Table Layout */}
                        <div className="hidden md:block">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>#</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Phone</TableHead>
                                  <TableHead>Payment Method</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {classDetailsData.registrations.map((registration, index) => (
                                  <TableRow key={registration.id} data-testid={`row-student-${index}`}>
                                    <TableCell className="font-medium">#{index + 1}</TableCell>
                                    <TableCell className="font-medium">
                                      {registration.firstName} {registration.lastName}
                                    </TableCell>
                                    <TableCell>{registration.email}</TableCell>
                                    <TableCell>{registration.phone || 'N/A'}</TableCell>
                                    <TableCell>
                                      {(registration as any).discountCode ? (
                                        <div className="flex items-center gap-2">
                                          <Ticket className="h-4 w-4" />
                                          <span>Discount Code: {(registration as any).discountCode.code}</span>
                                        </div>
                                      ) : registration.paymentIntentId ? (
                                        <div className="flex items-center gap-2">
                                          <DollarSign className="h-4 w-4" />
                                          <span>${((registration.amountPaid || 0) / 100).toFixed(2)}</span>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">Pending Payment</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge 
                                        variant={
                                          registration.paymentIntentId || (registration as any).discountCode 
                                            ? 'default' 
                                            : 'secondary'
                                        }
                                      >
                                        {registration.paymentIntentId || (registration as any).discountCode ? 'Confirmed' : 'Pending'}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update client information and manage their account.
              </DialogDescription>
            </DialogHeader>
            
            {selectedClient && (
              <Form {...editClientForm}>
                <form onSubmit={editClientForm.handleSubmit(onEditClientSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editClientForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-firstName" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editClientForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-lastName" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editClientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-edit-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editClientForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} type="tel" data-testid="input-edit-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editClientForm.control}
                      name="registrationDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-edit-registrationDate" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editClientForm.control}
                      name="lastCourseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Course Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-edit-lastCourseDate" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editClientForm.control}
                    name="completedCourses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completed Courses</FormLabel>
                        <FormDescription>
                          Select all courses this client has completed
                        </FormDescription>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                          {classes.map((classItem) => (
                            <div key={classItem.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit-course-${classItem.id}`}
                                checked={field.value?.includes(classItem.id) || false}
                                onChange={(e) => {
                                  const current = field.value || [];
                                  if (e.target.checked) {
                                    // Only add if not already present
                                    if (!current.includes(classItem.id)) {
                                      field.onChange([...current, classItem.id]);
                                    }
                                  } else {
                                    // Remove the course
                                    field.onChange(current.filter(c => c !== classItem.id));
                                  }
                                }}
                                data-testid={`checkbox-edit-course-${classItem.id}`}
                              />
                              <Label htmlFor={`edit-course-${classItem.id}`} className="text-sm leading-tight">
                                {classItem.title}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  
                  <DialogFooter>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      data-testid="button-cancel-edit-client"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateClientMutation.isPending}
                      data-testid="button-save-client"
                    >
                      {updateClientMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Class Dialog */}
        <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Class</DialogTitle>
              <DialogDescription>
                Create a new training class for your students.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addClassForm}>
              <form onSubmit={addClassForm.handleSubmit(onAddClassSubmit)} className="space-y-4">
                <FormField
                  control={addClassForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. BLS Provider Course" data-testid="input-add-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addClassForm.control}
                  name="classTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                        <FormControl>
                          <SelectTrigger data-testid="select-add-classtype">
                            <SelectValue placeholder="Select detailed class type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classTypesLoading ? (
                            <SelectItem value="" disabled>Loading class types...</SelectItem>
                          ) : classTypes.filter(ct => ct.isActive).length > 0 ? (
                            classTypes.filter(ct => ct.isActive).map((classType) => (
                              <SelectItem key={classType.id} value={classType.id}>
                                {classType.displayName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>No active class types available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addClassForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value || ''} 
                          placeholder="Enter a detailed description of the class content, requirements, and objectives..." 
                          className="min-h-[100px]"
                          data-testid="textarea-add-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addClassForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-add-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addClassForm.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <TimeInput 
                            value={field.value} 
                            onChange={field.onChange} 
                            placeholder="9:00 AM" 
                            data-testid="input-add-time" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addClassForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 4 hours" data-testid="input-add-duration" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addClassForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1"
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              field.onChange(value);
                              // Auto-set available to match capacity
                              addClassForm.setValue('available', value);
                            }}
                            data-testid="input-add-capacity" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addClassForm.control}
                    name="available"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" data-testid="input-add-available" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addClassForm.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" step="0.01" data-testid="input-add-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <ImageSelector
                  control={addClassForm.control}
                  name="image"
                  label="Class Image"
                  placeholder="Select an image for this class"
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createClassMutation.isPending}
                    data-testid="button-submit-add-class"
                  >
                    {createClassMutation.isPending ? 'Creating...' : 'Create Class'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Class Dialog */}
        <Dialog open={isEditClassDialogOpen} onOpenChange={setIsEditClassDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update class information and settings.
              </DialogDescription>
            </DialogHeader>
            
            {selectedClass && (
              <Form {...editClassForm}>
                <form onSubmit={editClassForm.handleSubmit(onEditClassSubmit)} className="space-y-4">
                  <FormField
                    control={editClassForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-title" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editClassForm.control}
                    name="classTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-classtype">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classTypesLoading ? (
                              <SelectItem value="" disabled>Loading class types...</SelectItem>
                            ) : classTypes.filter(ct => ct.isActive).length > 0 ? (
                              classTypes.filter(ct => ct.isActive).map((classType) => (
                                <SelectItem key={classType.id} value={classType.id}>
                                  {classType.displayName}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled>No active class types available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editClassForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            value={field.value || ''} 
                            placeholder="Enter a detailed description of the class content, requirements, and objectives..." 
                            className="min-h-[100px]"
                            data-testid="textarea-edit-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editClassForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" data-testid="input-edit-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editClassForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <TimeInput 
                              value={field.value} 
                              onChange={field.onChange} 
                              data-testid="input-edit-time" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editClassForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-duration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editClassForm.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacity</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" data-testid="input-edit-capacity" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editClassForm.control}
                      name="available"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="0" data-testid="input-edit-available" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={editClassForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" step="0.01" data-testid="input-edit-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <ImageSelector
                    control={editClassForm.control}
                    name="image"
                    label="Class Image"
                    placeholder="Select an image for this class"
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={updateClassMutation.isPending}
                      data-testid="button-submit-edit-class"
                    >
                      {updateClassMutation.isPending ? 'Updating...' : 'Update Class'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Discount Code Dialog */}
        <Dialog open={isAddDiscountCodeDialogOpen} onOpenChange={setIsAddDiscountCodeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Discount Code</DialogTitle>
              <DialogDescription>
                Create a new discount code to provide free class access
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addDiscountCodeForm}>
              <form onSubmit={addDiscountCodeForm.handleSubmit(onAddDiscountCodeSubmit)} className="space-y-4">
                <FormField
                  control={addDiscountCodeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABCD-EFGH" 
                          {...field} 
                          className="font-mono"
                          data-testid="input-add-discount-code"
                        />
                      </FormControl>
                      <FormDescription>
                        8 characters in ABCD-EFGH format (letters and numbers only)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addDiscountCodeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Promotional code for January" 
                          {...field} 
                          value={field.value || ''}
                          data-testid="input-add-discount-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addDiscountCodeForm.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-add-discount-expires"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addDiscountCodeForm.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Uses (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Leave empty for unlimited" 
                          {...field} 
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          data-testid="input-add-discount-max-uses"
                        />
                      </FormControl>
                      <FormDescription>
                        Leave empty for unlimited uses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDiscountCodeDialogOpen(false)}
                    data-testid="button-cancel-add-discount"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createDiscountCodeMutation.isPending}
                    data-testid="button-create-discount"
                  >
                    {createDiscountCodeMutation.isPending ? "Creating..." : "Create Code"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Discount Code Dialog */}
        <Dialog open={isEditDiscountCodeDialogOpen} onOpenChange={setIsEditDiscountCodeDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Discount Code</DialogTitle>
              <DialogDescription>
                Update the discount code settings
              </DialogDescription>
            </DialogHeader>
            
            {selectedDiscountCode && (
              <Form {...editDiscountCodeForm}>
                <form onSubmit={editDiscountCodeForm.handleSubmit(onEditDiscountCodeSubmit)} className="space-y-4">
                  <FormField
                    control={editDiscountCodeForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ABCD-EFGH" 
                            {...field} 
                            className="font-mono"
                            data-testid="input-edit-discount-code"
                          />
                        </FormControl>
                        <FormDescription>
                          8 characters in ABCD-EFGH format (letters and numbers only)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editDiscountCodeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Promotional code for January" 
                            {...field} 
                            value={field.value || ''}
                            data-testid="input-edit-discount-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editDiscountCodeForm.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-edit-discount-expires"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editDiscountCodeForm.control}
                    name="maxUses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Uses (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Leave empty for unlimited" 
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            data-testid="input-edit-discount-max-uses"
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty for unlimited uses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editDiscountCodeForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active Status</FormLabel>
                          <FormDescription>
                            Enable or disable this discount code
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-edit-discount-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEditDiscountCodeDialogOpen(false)}
                      data-testid="button-cancel-edit-discount"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateDiscountCodeMutation.isPending}
                      data-testid="button-update-discount"
                    >
                      {updateDiscountCodeMutation.isPending ? "Updating..." : "Update Code"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Client Dialog */}
        <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client record for tracking CPR training and certifications.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addClientForm}>
              <form onSubmit={addClientForm.handleSubmit(onAddClientSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addClientForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="John" data-testid="input-add-firstName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addClientForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Doe" data-testid="input-add-lastName" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addClientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="john.doe@example.com" data-testid="input-add-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addClientForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} type="tel" placeholder="(555) 123-4567" data-testid="input-add-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addClientForm.control}
                    name="registrationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-add-registrationDate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addClientForm.control}
                    name="lastCourseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Course Date</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" data-testid="input-add-lastCourseDate" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addClientForm.control}
                  name="completedCourses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completed Courses</FormLabel>
                      <FormDescription>
                        Select all courses this client has completed
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {classes.map((classItem) => (
                          <div key={classItem.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`add-course-${classItem.id}`}
                              checked={field.value?.includes(classItem.id) || false}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) {
                                  // Only add if not already present
                                  if (!current.includes(classItem.id)) {
                                    field.onChange([...current, classItem.id]);
                                  }
                                } else {
                                  // Remove the course
                                  field.onChange(current.filter(c => c !== classItem.id));
                                }
                              }}
                              data-testid={`checkbox-add-course-${classItem.id}`}
                            />
                            <Label htmlFor={`add-course-${classItem.id}`} className="text-sm leading-tight">
                              {classItem.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                
                <DialogFooter>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddClientDialogOpen(false)}
                    data-testid="button-cancel-add-client"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createClientMutation.isPending}
                    data-testid="button-submit-add-client"
                  >
                    {createClientMutation.isPending ? 'Creating...' : 'Create Client'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Add Class Type Dialog */}
        <Dialog open={isAddClassTypeDialogOpen} onOpenChange={setIsAddClassTypeDialogOpen}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Class Type</DialogTitle>
              <DialogDescription>
                Create a new class type for organizing your training classes.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addClassTypeForm}>
              <form onSubmit={addClassTypeForm.handleSubmit(onAddClassTypeSubmit)} className="space-y-4">
                <FormField
                  control={addClassTypeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. BLS, Heartsaver, FirstAid" data-testid="input-add-classtype-name" />
                      </FormControl>
                      <FormDescription>
                        Short, unique identifier for this class type
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addClassTypeForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Basic Life Support, Heartsaver CPR/AED" data-testid="input-add-classtype-displayname" />
                      </FormControl>
                      <FormDescription>
                        Full name shown to users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addClassTypeForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value || ''} 
                          placeholder="Describe this class type and its purpose..." 
                          className="min-h-[80px]"
                          data-testid="textarea-add-classtype-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={addClassTypeForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <FormDescription>
                          Active class types are available for creating new classes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-add-classtype-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addClassTypeForm.control}
                  name="badgeLabel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Label</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. BLS, CPR, ACLS"
                          {...field} 
                          data-testid="input-badge-label"
                        />
                      </FormControl>
                      <FormDescription>
                        Short text displayed on the badge (e.g., "BLS", "CPR")
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addClassTypeForm.control}
                  name="badgeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Badge Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-badge-color">
                            <SelectValue placeholder="Select badge color" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Red (Default)</SelectItem>
                          <SelectItem value="secondary">Gray (Secondary)</SelectItem>
                          <SelectItem value="destructive">Red (Destructive)</SelectItem>
                          <SelectItem value="success">Green (Success)</SelectItem>
                          <SelectItem value="warning">Yellow (Warning)</SelectItem>
                          <SelectItem value="info">Blue (Info)</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="pink">Pink</SelectItem>
                          <SelectItem value="teal">Teal</SelectItem>
                          <SelectItem value="outline">Outlined</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Color theme for the badge display
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddClassTypeDialogOpen(false)}
                    data-testid="button-cancel-add-classtype"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createClassTypeMutation.isPending}
                    data-testid="button-submit-add-classtype"
                  >
                    {createClassTypeMutation.isPending ? 'Creating...' : 'Create Class Type'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Class Type Dialog */}
        <Dialog open={isEditClassTypeDialogOpen} onOpenChange={setIsEditClassTypeDialogOpen}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Class Type</DialogTitle>
              <DialogDescription>
                Update class type information and settings.
              </DialogDescription>
            </DialogHeader>
            
            {selectedClassType && (
              <Form {...editClassTypeForm}>
                <form onSubmit={editClassTypeForm.handleSubmit(onEditClassTypeSubmit)} className="space-y-4">
                  <div className="space-y-4">
                  <FormField
                    control={editClassTypeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-classtype-name" />
                        </FormControl>
                        <FormDescription>
                          Short, unique identifier for this class type
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editClassTypeForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-edit-classtype-displayname" />
                        </FormControl>
                        <FormDescription>
                          Full name shown to users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editClassTypeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            value={field.value || ''} 
                            placeholder="Describe this class type and its purpose..." 
                            className="resize-none min-h-[80px] max-h-32"
                            rows={3}
                            data-testid="textarea-edit-classtype-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editClassTypeForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <FormDescription>
                            Active class types are available for creating new classes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-edit-classtype-active"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editClassTypeForm.control}
                    name="badgeLabel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge Label</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. BLS, CPR, ACLS"
                            {...field} 
                            data-testid="input-edit-badge-label"
                          />
                        </FormControl>
                        <FormDescription>
                          Short text displayed on the badge (e.g., "BLS", "CPR")
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editClassTypeForm.control}
                    name="badgeColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Badge Color</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-badge-color">
                              <SelectValue placeholder="Select badge color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="default">Red (Default)</SelectItem>
                            <SelectItem value="secondary">Gray (Secondary)</SelectItem>
                            <SelectItem value="destructive">Red (Destructive)</SelectItem>
                            <SelectItem value="success">Green (Success)</SelectItem>
                            <SelectItem value="warning">Yellow (Warning)</SelectItem>
                            <SelectItem value="info">Blue (Info)</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="pink">Pink</SelectItem>
                            <SelectItem value="teal">Teal</SelectItem>
                            <SelectItem value="outline">Outlined</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Color theme for the badge display
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditClassTypeDialogOpen(false)}
                      data-testid="button-cancel-edit-classtype"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateClassTypeMutation.isPending}
                      data-testid="button-submit-edit-classtype"
                    >
                      {updateClassTypeMutation.isPending ? 'Updating...' : 'Update Class Type'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete User Confirmation Dialog */}
        <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
          <DialogContent data-testid="dialog-delete-user-confirmation">
            <DialogHeader>
              <DialogTitle>Delete User Account</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUserForDeletion?.firstName && selectedUserForDeletion?.lastName 
                  ? `${selectedUserForDeletion.firstName} ${selectedUserForDeletion.lastName}'s` 
                  : selectedUserForDeletion?.email || 'this user\'s'} account?
                <br />
                <strong>This action cannot be undone.</strong>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDeleteUserDialogOpen(false);
                  setSelectedUserForDeletion(null);
                }}
                data-testid="button-cancel-delete-user"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                variant="destructive"
                onClick={() => {
                  if (selectedUserForDeletion?.id) {
                    deleteUserMutation.mutate(selectedUserForDeletion.id);
                  }
                }}
                disabled={deleteUserMutation.isPending}
                data-testid="button-confirm-delete-user"
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
            </div>
          </main>
        </SidebarInset>
      </div>
  );
}

// Outer component that provides SidebarProvider context
export default function AdminDashboard() {
  const isMobile = useIsMobile();
  
  // Custom sidebar width for better stats display
  const sidebarStyle = {
    "--sidebar-width": "20rem",       // 320px for better content
    "--sidebar-width-icon": "4rem",   // default icon width
  };

  return (
    <SidebarProvider 
      style={sidebarStyle as React.CSSProperties}
      defaultOpen={false}
      className="min-h-screen"
    >
      <AdminDashboardContent />
    </SidebarProvider>
  );
}