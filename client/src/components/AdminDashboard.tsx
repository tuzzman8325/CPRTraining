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
import { Class, InsertClass, insertClassSchema, Registration, DiscountCode, InsertDiscountCode, insertDiscountCodeSchema, Client, InsertClient, insertClientSchema, User } from '@shared/schema';
import { z } from 'zod';

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
  registrations: Registration[];
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
  ChevronRight as ChevronRightIcon
} from 'lucide-react';


export default function AdminDashboard() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  // Collapsible section state - only one section open at a time
  const [openSection, setOpenSection] = useState<string>('clients');
  
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
  const { data: registrationsData, isLoading: registrationsLoading } = useQuery<RegistrationsResponse>({
    queryKey: ['/api/registrations'],
  });

  // React Query hooks for discount codes
  const { data: discountCodesData, isLoading: discountCodesLoading } = useQuery<DiscountCodesResponse>({
    queryKey: ['/api/discount-codes'],
  });

  // React Query hooks for users
  const { data: usersData, isLoading: usersLoading } = useQuery<UsersResponse>({
    queryKey: ['/api/users'],
  });
  
  const clients: Client[] = clientsData?.clients || [];
  const classes: Class[] = classesData?.classes || [];
  const discountCodes: DiscountCode[] = discountCodesData?.discountCodes || [];
  const users: User[] = usersData?.users || [];
  
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
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsEditDialogOpen(false);
      setSelectedClient(null);
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
  
  // Form setup for adding classes
  const addClassForm = useForm<InsertClass>({
    resolver: zodResolver(insertClassSchema.extend({
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

  // Client handlers
  const handleEdit = (client: Client) => {
    // Always find the latest client data from the current clients list
    // to ensure we have the most up-to-date information
    const latestClient = clients.find(c => c.id === client.id) || client;
    setSelectedClient(latestClient);
    editClientForm.reset({
      firstName: latestClient.firstName,
      lastName: latestClient.lastName,
      email: latestClient.email,
      phone: latestClient.phone || '',
      registrationDate: latestClient.registrationDate,
      lastCourseDate: latestClient.lastCourseDate || '',
      completedCourses: latestClient.completedCourses
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
      price: classItem.price
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
      const response = await fetch(`/api/classes/${classItem.id}/roster`);
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
    monthlyRevenue: 2450 // TODO: Calculate from actual data
  };

  // Toggle collapsible sections
  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your CPR training clients, classes and records</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeClients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableSpots}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certifications</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCertifications}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRegistrations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Collapsible open={openSection === 'users'} onOpenChange={() => toggleSection('users')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover-elevate" data-testid="section-header-users">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {openSection === 'users' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-users"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="header-name">Name</TableHead>
                        <TableHead data-testid="header-email">Email</TableHead>
                        <TableHead data-testid="header-role">Current Role</TableHead>
                        <TableHead data-testid="header-actions">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8" data-testid="loading-users">
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
                              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground" data-testid="no-users-found">
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
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {user.firstName && user.lastName ? 
                                    `${user.firstName} ${user.lastName}` : 
                                    user.email || 'Unknown User'
                                  }
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="text-xs" data-testid="badge-current-user">
                                      You
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{user.email || 'No email'}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={user.role === 'admin' ? 'default' : 'secondary'}
                                  className={user.role === 'admin' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}
                                  data-testid={`badge-role-${user.role}`}
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {user.role === 'user' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateUserRoleMutation.mutate({ id: user.id, role: 'admin' })}
                                      disabled={updateUserRoleMutation.isPending}
                                      data-testid={`button-promote-${user.id}`}
                                    >
                                      Promote to Admin
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (isCurrentUser) {
                                          const confirmed = window.confirm(
                                            'Warning: You are about to demote yourself from admin. This will remove your admin privileges. Are you sure you want to continue?'
                                          );
                                          if (!confirmed) return;
                                        }
                                        updateUserRoleMutation.mutate({ id: user.id, role: 'user' });
                                      }}
                                      disabled={updateUserRoleMutation.isPending}
                                      data-testid={`button-demote-${user.id}`}
                                      className={isCurrentUser ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground' : ''}
                                    >
                                      {isCurrentUser ? 'Demote Yourself' : 'Demote to User'}
                                    </Button>
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
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Client Management */}
        <Collapsible open={openSection === 'clients'} onOpenChange={() => toggleSection('clients')}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover-elevate" data-testid="section-header-clients">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Client Management
                    </CardTitle>
                    <CardDescription>View and manage all registered clients</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddClient();
                      }} 
                      size="sm"
                      data-testid="button-add-client"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                    {openSection === 'clients' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            {/* Search and Filters */}
            <div className="space-y-4 mb-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients by name or email..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    resetPagination();
                  }}
                  className="pl-10"
                  data-testid="input-search-clients"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Filters:</span>
                </div>

                {/* Certification Status Filter */}
                <Select 
                  value={clientFilters.certificationStatus} 
                  onValueChange={(value) => {
                    setClientFilters(prev => ({ ...prev, certificationStatus: value }));
                    resetPagination();
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-certification">
                    <SelectValue placeholder="Certification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                {/* Course Type Filter */}
                <Select 
                  value={clientFilters.courseType} 
                  onValueChange={(value) => {
                    setClientFilters(prev => ({ ...prev, courseType: value }));
                    resetPagination();
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-course">
                    <SelectValue placeholder="Course Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    <SelectItem value="bls">BLS Only</SelectItem>
                    <SelectItem value="heartsaver">Heartsaver Only</SelectItem>
                    <SelectItem value="both">Both Courses</SelectItem>
                    <SelectItem value="none">No Courses</SelectItem>
                  </SelectContent>
                </Select>

                {/* Registration Date Filter */}
                <Select 
                  value={clientFilters.registrationDateRange} 
                  onValueChange={(value) => {
                    setClientFilters(prev => ({ ...prev, registrationDateRange: value }));
                    resetPagination();
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44" data-testid="select-filter-registration-date">
                    <SelectValue placeholder="Registration Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                    <SelectItem value="last6Months">Last 6 Months</SelectItem>
                    <SelectItem value="last30Days">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>

                {/* Last Course Date Filter */}
                <Select 
                  value={clientFilters.lastCourseDateRange} 
                  onValueChange={(value) => {
                    setClientFilters(prev => ({ ...prev, lastCourseDateRange: value }));
                    resetPagination();
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44" data-testid="select-filter-last-course-date">
                    <SelectValue placeholder="Last Course Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                    <SelectItem value="last6Months">Last 6 Months</SelectItem>
                    <SelectItem value="last30Days">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Active Filters Summary */}
              {(clientFilters.certificationStatus !== 'all' || 
                clientFilters.courseType !== 'all' ||
                clientFilters.registrationDateRange !== 'all' ||
                clientFilters.lastCourseDateRange !== 'all') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Active filters:</span>
                  {clientFilters.certificationStatus !== 'all' && (
                    <Badge variant="secondary">{clientFilters.certificationStatus}</Badge>
                  )}
                  {clientFilters.courseType !== 'all' && (
                    <Badge variant="secondary">
                      {clientFilters.courseType === 'bls' ? 'BLS' : 
                       clientFilters.courseType === 'heartsaver' ? 'Heartsaver' :
                       clientFilters.courseType === 'both' ? 'Both Courses' : 'No Courses'}
                    </Badge>
                  )}
                  {clientFilters.registrationDateRange !== 'all' && (
                    <Badge variant="secondary">
                      Registered: {clientFilters.registrationDateRange === 'thisYear' ? 'This Year' :
                                   clientFilters.registrationDateRange === 'last6Months' ? 'Last 6M' : 'Last 30D'}
                    </Badge>
                  )}
                  {clientFilters.lastCourseDateRange !== 'all' && (
                    <Badge variant="secondary">
                      Last Course: {clientFilters.lastCourseDateRange === 'thisYear' ? 'This Year' :
                                    clientFilters.lastCourseDateRange === 'last6Months' ? 'Last 6M' : 'Last 30D'}
                    </Badge>
                  )}
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
                    data-testid="button-clear-filters"
                  >
                    Clear All
                  </Button>
                </div>
              )}
              
              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                Showing {paginatedClients.length} of {filteredClients.length} clients
                {filteredClients.length !== clients.length && (
                  <span> (filtered from {clients.length} total)</span>
                )}
              </div>
            </div>

            {/* Clients Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Last Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Loading clients...
                      </TableCell>
                    </TableRow>
                  ) : paginatedClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {filteredClients.length === 0 ? 'No clients found' : 'No clients on this page'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedClients.map((client) => (
                      <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                        <TableCell className="font-medium">{client.firstName} {client.lastName}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phone || 'N/A'}</TableCell>
                        <TableCell>{client.registrationDate}</TableCell>
                        <TableCell>{client.lastCourseDate}</TableCell>
                        <TableCell>
                          <Badge variant={
                            client.certificationStatus === 'active' ? 'success' : 
                            client.certificationStatus === 'update' ? 'warning' : 
                            'destructive'
                          }>
                            {client.certificationStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {client.completedCourses.map((course, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {course}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${client.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(client)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(client.id)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-previous-page"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                          data-testid={`button-page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
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
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover-elevate" data-testid="section-header-classes">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Class Management
                    </CardTitle>
                    <CardDescription>View and manage all training classes</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddClass();
                      }} 
                      size="sm"
                      data-testid="button-add-class"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Class
                    </Button>
                    {openSection === 'classes' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes by title or type..."
                value={classSearchTerm}
                onChange={(e) => setClassSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-classes"
              />
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
                            <Badge variant={classItem.type === 'BLS' ? 'default' : 'secondary'}>
                              {classItem.type}
                            </Badge>
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
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover-elevate" data-testid="section-header-registrations">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5" />
                      Registration Management
                    </CardTitle>
                    <CardDescription>View and manage all class registrations</CardDescription>
                  </div>
                  {openSection === 'registrations' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
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
                              {registration.amountPaid ? `$${(registration.amountPaid / 100).toFixed(2)}` : 'N/A'}
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
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover-elevate" data-testid="section-header-discount-codes">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5" />
                      Discount Code Management
                    </CardTitle>
                    <CardDescription>Create and manage discount codes for free class registrations</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddDiscountCode();
                      }} 
                      size="sm"
                      data-testid="button-add-discount-code"
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      Add Discount Code
                    </Button>
                    {openSection === 'discount-codes' ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discount codes by code or description..."
                value={discountCodeSearchTerm}
                onChange={(e) => setDiscountCodeSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-discount-codes"
              />
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
                          {classDetailsData.registrations.filter(r => r.discountCodeId).length} students
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
                                        {registration.discountCodeId 
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
                                          registration.paymentIntentId || registration.discountCodeId 
                                            ? 'default' 
                                            : 'secondary'
                                        }
                                        className="text-xs"
                                      >
                                        {registration.paymentIntentId || registration.discountCodeId ? 'Confirmed' : 'Pending'}
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
                                      {registration.discountCodeId ? (
                                        <div className="flex items-center gap-2">
                                          <Ticket className="h-4 w-4" />
                                          <span>Discount Applied</span>
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
                                          registration.paymentIntentId || registration.discountCodeId 
                                            ? 'default' 
                                            : 'secondary'
                                        }
                                      >
                                        {registration.paymentIntentId || registration.discountCodeId ? 'Confirmed' : 'Pending'}
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
                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="course-bls"
                              checked={field.value?.includes('BLS') || false}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...current.filter(c => c !== 'BLS'), 'BLS']);
                                } else {
                                  field.onChange(current.filter(c => c !== 'BLS'));
                                }
                              }}
                              data-testid="checkbox-course-bls"
                            />
                            <Label htmlFor="course-bls">BLS Provider</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="course-heartsaver"
                              checked={field.value?.includes('Heartsaver') || false}
                              onChange={(e) => {
                                const current = field.value || [];
                                if (e.target.checked) {
                                  field.onChange([...current.filter(c => c !== 'Heartsaver'), 'Heartsaver']);
                                } else {
                                  field.onChange(current.filter(c => c !== 'Heartsaver'));
                                }
                              }}
                              data-testid="checkbox-course-heartsaver"
                            />
                            <Label htmlFor="course-heartsaver">Heartsaver CPR</Label>
                          </div>
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
          <DialogContent className="max-w-md">
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-add-type">
                            <SelectValue placeholder="Select class type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BLS">BLS Provider</SelectItem>
                          <SelectItem value="Heartsaver">Heartsaver CPR</SelectItem>
                        </SelectContent>
                      </Select>
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
          <DialogContent className="max-w-md">
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BLS">BLS Provider</SelectItem>
                            <SelectItem value="Heartsaver">Heartsaver CPR</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="add-course-bls"
                            checked={field.value?.includes('BLS') || false}
                            onChange={(e) => {
                              const current = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...current.filter(c => c !== 'BLS'), 'BLS']);
                              } else {
                                field.onChange(current.filter(c => c !== 'BLS'));
                              }
                            }}
                            data-testid="checkbox-add-course-bls"
                          />
                          <Label htmlFor="add-course-bls">BLS Provider</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="add-course-heartsaver"
                            checked={field.value?.includes('Heartsaver') || false}
                            onChange={(e) => {
                              const current = field.value || [];
                              if (e.target.checked) {
                                field.onChange([...current.filter(c => c !== 'Heartsaver'), 'Heartsaver']);
                              } else {
                                field.onChange(current.filter(c => c !== 'Heartsaver'));
                              }
                            }}
                            data-testid="checkbox-add-course-heartsaver"
                          />
                          <Label htmlFor="add-course-heartsaver">Heartsaver CPR</Label>
                        </div>
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
      </div>
    </div>
  );
}