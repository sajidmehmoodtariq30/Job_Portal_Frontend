// src/pages/admin/AdminJobs.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/UI/button"
import { Input } from "@/components/UI/input"
import { Textarea } from "@/components/UI/textarea"
import { MessageSquare } from 'lucide-react'
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/UI/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/UI/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select"
import { Label } from "@/components/UI/label"
import axios from 'axios'
import { useJobContext } from '@/components/JobContext';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import AdminChatRoom from "@/components/UI/admin/AdminChatRoom";

// Helper to determine page size
const PAGE_SIZE = 10;

const AdminJobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [newJob, setNewJob] = useState({
    uuid: '',
    created_by_staff_uuid: '', 
    date: new Date().toISOString().split('T')[0], 
    company_uuid: '',
    job_description: '',
    job_address: '',
    status: 'Quote',
    work_done_description: '',
    generated_job_id: '',
    payment_date: '',
    payment_method: '',
    payment_amount: '',
    total_invoice_amount: '',
    quote_date: '',
    quote_sent: '0',
    invoice_sent: '0',
    quote_sent_stamp: '',
    work_order_date: '',
    completion_date: '',
    category_uuid: '' // Ensure all form fields have initial values
  });
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [selectedJob, setSelectedJob] = useState(null);
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const {
    jobs,
    totalJobs,
    loading,
    fetchJobs,
    resetJobs,
    activeTab,
    setActiveTab
  } = useJobContext();

  // Fetch jobs on mount and when tab changes
  useEffect(() => {
    fetchJobs(1, activeTab);
    fetchClients(); // Fetch clients for the dropdown
  }, [activeTab]);

  // Fetch clients for the dropdown
  const fetchClients = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CLIENTS.FETCH_ALL);
      console.log('Client data response:', response.data);
      if (response.data && response.data.data) {
        setClients(response.data.data || []);
      } else if (response.data) {
        // Handle case where response might not have a nested data property
        setClients(response.data || []);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  // Reset jobs when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetJobs();
    fetchJobs(1, tab);
    // Reset search term and visible jobs count when changing tabs for better performance
    setSearchTerm('');
    setVisibleJobs(10);
  };

  // Improved search function that efficiently filters jobs by search term
  const filteredJobs = jobs.filter(job => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    
    // Only check fields that exist to improve performance
    return (
      (job.uuid && job.uuid.toLowerCase().includes(searchLower)) ||
      (job.job_description && job.job_description.toLowerCase().includes(searchLower)) ||
      (job.generated_job_id && job.generated_job_id.toLowerCase().includes(searchLower)) ||
      (job.job_address && job.job_address.toLowerCase().includes(searchLower))
    );
  });

  // Limit visible jobs for pagination AFTER filtering
  const displayedJobs = filteredJobs.slice(0, visibleJobs);

  const handleShowMore = () => {
    setVisibleJobs(prev => prev + 10);
  };

  const handleShowLess = () => {
    setVisibleJobs(prev => Math.max(prev - 10, 10));
  };

  const handleRefresh = async () => {
    // Show confirmation dialog first
    setConfirmRefresh(true);
  };

  const confirmRefreshData = async () => {
    try {
      console.log("Manually refreshing job data...");
      
      // Reset any search term to show all jobs
      setSearchTerm('');
      
      // Force reload with timestamp to prevent caching
      await fetchJobs(1, activeTab, true);
      
      // Reset visible jobs to default
      setVisibleJobs(10);
      
      console.log("Job data refreshed successfully");

      // Close the confirmation dialog
      setConfirmRefresh(false);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
      setConfirmRefresh(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };
  
  // Fixed handler for select dropdowns
  const handleSelectChange = (name, value) => {
    setNewJob({ ...newJob, [name]: value });
  };
  
  // When a client is selected, use their UUID as both company UUID and created_by_staff_uuid
  const handleClientChange = (value) => {
    setNewJob({ 
      ...newJob, 
      company_uuid: value,
      created_by_staff_uuid: value // Using client UUID for staff UUID as requested
    });
    
    // Optionally, pre-fill address if available
    const selectedClient = clients.find(client => client.uuid === value);
    if (selectedClient) {
      const formattedAddress = [
        selectedClient.address,
        selectedClient.address_city,
        selectedClient.address_state,
        selectedClient.address_postcode,
        selectedClient.address_country
      ].filter(Boolean).join(', ');
      
      setNewJob(prev => ({
        ...prev,
        job_address: formattedAddress || prev.job_address
      }));
    }
  };
  
  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newJob.uuid || !newJob.company_uuid || !newJob.job_description || !newJob.job_address) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
        // Prepare payload to match ServiceM8 API format
        const payload = {
            active: 1,
            uuid: newJob.uuid,
            created_by_staff_uuid: newJob.created_by_staff_uuid, // This is the client UUID
            company_uuid: newJob.company_uuid,
            date: newJob.date,
            job_description: newJob.job_description,
            job_address: newJob.job_address,
            status: newJob.status,
            work_done_description: newJob.work_done_description,
            generated_job_id: newJob.generated_job_id || newJob.uuid, // Ensure generated_job_id is set, defaulting to UUID
            payment_date: newJob.payment_date,
            payment_method: newJob.payment_method,
            payment_amount: newJob.payment_amount,
            total_invoice_amount: newJob.total_invoice_amount,
            quote_date: newJob.quote_date,
            quote_sent: newJob.quote_sent,
            invoice_sent: newJob.invoice_sent,
            quote_sent_stamp: newJob.quote_sent_stamp,
            work_order_date: newJob.work_order_date,
            completion_date: newJob.completion_date
        };
        
        // Exclude category_uuid from payload as it's optional and causing errors
        
        console.log('Creating job with payload:', payload);
        const response = await axios.post(API_ENDPOINTS.JOBS.CREATE, payload);
        console.log('Job created successfully:', response.data);
        
        // Force refresh jobs list with the current tab and close dialog
        // Use forceRefresh=true to ensure we get fresh data
        await fetchJobs(1, activeTab, true);
        setIsDialogOpen(false);
        
        // Clear search term to make it easier to see new job
        setSearchTerm('');
        
        // Reset form for next use
        setNewJob({
            uuid: '',
            created_by_staff_uuid: '',
            date: new Date().toISOString().split('T')[0],
            company_uuid: '',
            job_description: '',
            job_address: '',
            status: 'Quote',
            work_done_description: '',
            generated_job_id: '',
            payment_date: '',
            payment_method: '',
            payment_amount: '',
            category_uuid: '',
            total_invoice_amount: '',
            quote_date: '',
            quote_sent: '0',
            invoice_sent: '0',
            quote_sent_stamp: '',
            work_order_date: '',
            completion_date: ''
        });
    } catch (error) {
        console.error('Error creating job:', error);
        alert(`Error creating job: ${error.response?.data?.message || error.message}`);
    }
  };
  
  const handleViewJob = (jobId) => {
    navigate(`/admin/jobs/${jobId}`)
  }

  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };

  // Generate UUID and update generated_job_id to match
  const generateUUID = () => {
    const uuid = crypto.randomUUID();
    setNewJob({ 
      ...newJob, 
      uuid,
      generated_job_id: uuid // Set generated_job_id to match UUID automatically
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Job</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Enter the details for the new job. This will create a job in ServiceM8.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="overflow-y-auto">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="uuid">Job UUID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="uuid"
                        name="uuid"
                        value={newJob.uuid}
                        onChange={handleInputChange}
                        required
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={generateUUID}
                        className="whitespace-nowrap"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={newJob.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="company_uuid">Client</Label>
                  <Select
                    value={newJob.company_uuid}
                    onValueChange={handleClientChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.uuid} value={client.uuid}>
                          {client.name} ({client.uuid.slice(-4)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Client UUID will also be used as staff UUID for ServiceM8
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="job_address">Service Address</Label>
                  <Input
                    id="job_address"
                    name="job_address"
                    value={newJob.job_address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newJob.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quote">Quote</SelectItem>
                      <SelectItem value="Work Order">Work Order</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="job_description">Job Description</Label>
                  <Textarea
                    id="job_description"
                    name="job_description"
                    value={newJob.job_description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="work_done_description">Work Done Description</Label>
                  <Textarea
                    id="work_done_description"
                    name="work_done_description"
                    value={newJob.work_done_description}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="generated_job_id">Generated Job ID</Label>
                    <Input
                      id="generated_job_id"
                      name="generated_job_id"
                      value={newJob.generated_job_id}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category_uuid">Category UUID</Label>
                    <Input
                      id="category_uuid"
                      name="category_uuid"
                      value={newJob.category_uuid}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="total_invoice_amount">Invoice Amount</Label>
                    <Input
                      id="total_invoice_amount"
                      name="total_invoice_amount"
                      type="number"
                      step="0.01"
                      value={newJob.total_invoice_amount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="invoice_sent">Invoice Sent</Label>
                    <Select
                      value={newJob.invoice_sent}
                      onValueChange={(value) => handleSelectChange('invoice_sent', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Yes</SelectItem>
                        <SelectItem value="0">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quote_date">Quote Date</Label>
                    <Input
                      id="quote_date"
                      name="quote_date"
                      type="date"
                      value={newJob.quote_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quote_sent">Quote Sent</Label>
                    <Select
                      value={newJob.quote_sent}
                      onValueChange={(value) => handleSelectChange('quote_sent', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Yes</SelectItem>
                        <SelectItem value="0">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="work_order_date">Work Order Date</Label>
                    <Input
                      id="work_order_date"
                      name="work_order_date"
                      type="date"
                      value={newJob.work_order_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="completion_date">Completion Date</Label>
                    <Input
                      id="completion_date"
                      name="completion_date"
                      type="date"
                      value={newJob.completion_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-2">
                  <h3 className="text-lg font-medium mb-3">Payment Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="payment_date">Payment Date</Label>
                      <Input
                        id="payment_date"
                        name="payment_date"
                        type="date"
                        value={newJob.payment_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select
                        value={newJob.payment_method}
                        onValueChange={(value) => handleSelectChange('payment_method', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Credit Card">Credit Card</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="Check">Check</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="payment_amount">Payment Amount</Label>
                      <Input
                        id="payment_amount"
                        name="payment_amount"
                        type="number"
                        step="0.01"
                        value={newJob.payment_amount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Job</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>View and manage all jobs in the system</CardDescription>
          <div className="flex flex-col space-y-4 mt-2">
            <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">All Jobs</TabsTrigger>
                <TabsTrigger value="Quote">Quotes</TabsTrigger>
                <TabsTrigger value="Work Order">Work Orders</TabsTrigger>
                <TabsTrigger value="In Progress">In Progress</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="w-full">
              <Input
                className="w-full"
                placeholder="Search jobs by ID, description, or generated ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Job ID</th>
                  <th className="py-3 text-left">Generated ID</th>
                  <th className="py-3 text-left">Description</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Created</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="py-4 text-center">Loading...</td></tr>
                ) : filteredJobs.length > 0 ? (
                  displayedJobs.map((job) => (
                    <tr key={job.uuid} className="border-b">
                      <td className="py-3">{job.uuid ? job.uuid.slice(-4) : '...'}</td>
                      <td className="py-3">{job.generated_job_id || '...'}</td>
                      <td className="py-3">{job.job_description?.slice(0, 50)}...</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          job.status === 'Quote' 
                            ? 'bg-blue-100 text-blue-800' 
                            : job.status === 'Work Order' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : job.status === 'In Progress'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3">{job.date || '...'}</td>
                      <td className="py-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(job)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-muted-foreground">
                      No jobs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={handleShowLess}
              disabled={visibleJobs <= 10}
            >
              Show Less
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
            <Button
              variant="outline"
              onClick={handleShowMore}
              disabled={filteredJobs.length < visibleJobs}
            >
              Show More
            </Button>
          </div>
        </CardContent>
      </Card>      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl">Job Details - {selectedJob.generated_job_id || selectedJob.uuid?.slice(-4)}</DialogTitle>
              <DialogDescription>
                Detailed information about the selected job
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="mt-4">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="chat" className="relative">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat
                  </div>
                </TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-0 mt-6">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label className="font-bold text-sm text-gray-600">Job ID</Label>
                      <p className="text-sm font-medium">{selectedJob.uuid}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-sm text-gray-600">Generated ID</Label>
                      <p className="text-sm font-medium">{selectedJob.generated_job_id}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Job Description</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedJob.job_description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Status</Label>
                      <span className={`px-2 py-1 rounded text-xs inline-block ${
                        selectedJob.status === 'Quote' 
                          ? 'bg-blue-100 text-blue-800' 
                          : selectedJob.status === 'Work Order' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedJob.status === 'In Progress'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedJob.status}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Active</Label>
                      <p className="text-sm">{selectedJob.active ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Service Address</Label>
                    <p className="text-sm">{selectedJob.job_address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Created Date</Label>
                      <p className="text-sm">{selectedJob.date}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Edit Date</Label>
                      <p className="text-sm">{selectedJob.edit_date}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Location Details</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="font-semibold">Street:</span> {selectedJob.geo_number} {selectedJob.geo_street}</p>
                      <p><span className="font-semibold">City:</span> {selectedJob.geo_city}</p>
                      <p><span className="font-semibold">State:</span> {selectedJob.geo_state}</p>
                      <p><span className="font-semibold">Postcode:</span> {selectedJob.geo_postcode}</p>
                      <p><span className="font-semibold">Country:</span> {selectedJob.geo_country}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Payment Details</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="font-semibold">Amount:</span> ${selectedJob.payment_amount || '0.00'}</p>
                      <p><span className="font-semibold">Method:</span> {selectedJob.payment_method || 'N/A'}</p>
                      <p><span className="font-semibold">Date:</span> {selectedJob.payment_date !== '0000-00-00 00:00:00' ? selectedJob.payment_date : 'N/A'}</p>
                      <p><span className="font-semibold">Status:</span> {selectedJob.payment_processed ? 'Processed' : 'Not Processed'}</p>
                    </div>
                  </div>

                  {selectedJob.purchase_order_number && (
                    <div className="space-y-2">
                      <Label className="font-bold">Purchase Order Number</Label>
                      <p className="text-sm">{selectedJob.purchase_order_number}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="p-0 mt-6">
                <AdminChatRoom jobId={selectedJob.uuid || selectedJob.id} />
              </TabsContent>
              
              <TabsContent value="attachments" className="p-0 mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Attachments</CardTitle>
                      <Button size="sm">Upload File</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {/* Sample attachments - in production these would come from the API */}
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                          <div>
                            <p className="font-medium">Documentation.pdf</p>
                            <p className="text-xs text-muted-foreground">1.2 MB • Uploaded today</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">Download</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="border-t pt-4 mt-4">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminJobs;