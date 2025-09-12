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
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Class, InsertClass, insertClassSchema } from '@shared/schema';
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
  BookOpen
} from 'lucide-react';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  registrationDate: string;
  completedCourses: string[];
  status: 'Active' | 'Inactive';
}

// TODO: Remove mock data - replace with real client data from backend
const mockClients: Client[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    username: 'jsmith',
    registrationDate: '2024-01-15',
    completedCourses: ['BLS Provider', 'Heartsaver CPR'],
    status: 'Active'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 234-5678',
    username: 'sjohnson',
    registrationDate: '2024-02-20',
    completedCourses: ['Heartsaver CPR'],
    status: 'Active'
  },
  {
    id: '3',
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike.wilson@email.com',
    phone: '(555) 345-6789',
    username: 'mwilson',
    registrationDate: '2024-01-08',
    completedCourses: ['BLS Provider'],
    status: 'Inactive'
  }
];

export default function AdminDashboard() {
  const { toast } = useToast();
  
  // Client state
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Class state
  const [classSearchTerm, setClassSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false);
  const [isEditClassDialogOpen, setIsEditClassDialogOpen] = useState(false);
  
  // React Query hooks for classes
  const { data: classesData, isLoading: classesLoading } = useQuery<ClassesResponse>({
    queryKey: ['/api/classes'],
  });
  
  const classes: Class[] = classesData?.classes || [];
  
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
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete class: ${error.message}`, variant: "destructive" });
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

  const filteredClients = clients.filter(client =>
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredClasses = classes.filter(classItem =>
    classItem.title.toLowerCase().includes(classSearchTerm.toLowerCase()) ||
    classItem.type.toLowerCase().includes(classSearchTerm.toLowerCase())
  );

  // Client handlers
  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsEditDialogOpen(true);
    console.log('Edit client:', `${client.firstName} ${client.lastName}`);
  };

  const handleDelete = (clientId: string) => {
    setClients(clients.filter(c => c.id !== clientId));
    console.log('Delete client:', clientId);
    // TODO: Implement delete functionality
  };

  const handleAddClient = () => {
    console.log('Add new client');
    // TODO: Implement add client functionality
  };

  const handleSaveClient = () => {
    setIsEditDialogOpen(false);
    console.log('Save client changes');
    // TODO: Implement save functionality
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

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'Active').length,
    totalCertifications: clients.reduce((sum, client) => sum + client.completedCourses.length, 0),
    totalClasses: classes.length,
    availableSpots: classes.reduce((sum, classItem) => sum + classItem.available, 0),
    monthlyRevenue: 2450 // TODO: Calculate from actual data
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
          <div className="flex gap-2">
            <Button onClick={handleAddClient} data-testid="button-add-client">
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
            <Button onClick={handleAddClass} data-testid="button-add-class">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Client Management */}
        <Card>
          <CardHeader>
            <CardTitle>Client Management</CardTitle>
            <CardDescription>View and manage all registered clients</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-clients"
              />
            </div>

            {/* Clients Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                      <TableCell className="font-medium">{client.firstName} {client.lastName}</TableCell>
                      <TableCell>{client.username}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Badge variant={client.status === 'Active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Class Management */}
        <Card>
          <CardHeader>
            <CardTitle>Class Management</CardTitle>
            <CardDescription>View and manage all training classes</CardDescription>
          </CardHeader>
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
                                <DropdownMenuItem onClick={() => handleEditClass(classItem)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
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
        </Card>

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update client information and manage their account.
              </DialogDescription>
            </DialogHeader>
            
            {selectedClient && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-firstName" className="text-right">First Name</Label>
                  <Input 
                    id="edit-firstName" 
                    value={selectedClient.firstName} 
                    className="col-span-3"
                    data-testid="input-edit-firstName"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-lastName" className="text-right">Last Name</Label>
                  <Input 
                    id="edit-lastName" 
                    value={selectedClient.lastName} 
                    className="col-span-3"
                    data-testid="input-edit-lastName"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-username" className="text-right">Username</Label>
                  <Input 
                    id="edit-username" 
                    value={selectedClient.username} 
                    className="col-span-3"
                    data-testid="input-edit-username"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">Email</Label>
                  <Input 
                    id="edit-email" 
                    value={selectedClient.email} 
                    className="col-span-3"
                    data-testid="input-edit-email"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                  <Input 
                    id="edit-phone" 
                    value={selectedClient.phone} 
                    className="col-span-3"
                    data-testid="input-edit-phone"
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                onClick={handleSaveClient}
                data-testid="button-save-client"
              >
                Save Changes
              </Button>
            </DialogFooter>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
      </div>
    </div>
  );
}