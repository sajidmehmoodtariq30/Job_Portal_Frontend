import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search,
  Plus,
  Clipboard,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/UI/tabs";
import {
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/UI/card";
import { Textarea } from "@/components/UI/textarea";
import { Label } from "@/components/UI/label";
import JobCard from "@/components/UI/client/JobCard";
import { useJobContext } from '@/components/JobContext';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apiConfig';

// Helper to determine page size
const PAGE_SIZE = 10;

const ClientJobs = () => {
  // Use the JobContext to access jobs data and methods
  const {
    jobs,
    totalJobs,
    loading,
    fetchJobs,
    resetJobs,
    activeTab,
    setActiveTab
  } = useJobContext();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [visibleJobs, setVisibleJobs] = useState(PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [clients, setClients] = useState([]);
  
  // New job form state modeled after the admin version
  const [newJob, setNewJob] = useState({
    uuid: '',
    created_by_staff_uuid: '', 
    date: new Date().toISOString().split('T')[0], 
    company_uuid: '',
    job_description: '',
    job_address: '',
    status: 'Quote', // Client requests always start as quote
    work_done_description: '',
    generated_job_id: '',
  });
  
  // Fetch jobs on mount and when active tab changes
  useEffect(() => {
    fetchJobs(1, activeTab);
    fetchClients(); // Fetch clients for company_uuid
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
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({
      ...newJob,
      [name]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setNewJob({
      ...newJob,
      [name]: value
    });
  };
  
  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetJobs();
    fetchJobs(1, tab);
    // Reset search term and visible jobs count when changing tabs for better performance
    setSearchQuery('');
    setVisibleJobs(PAGE_SIZE);
  };
  
  // Generate UUID for new job
  const generateUUID = () => {
    const uuid = crypto.randomUUID();
    setNewJob({ 
      ...newJob, 
      uuid,
      generated_job_id: uuid // Set generated_job_id to match UUID automatically
    });
  };
  
  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase().trim();
    
    // Only check fields that exist to improve performance
    // Check both description and job_description fields to handle different API response formats
    return (
      (job.uuid && job.uuid.toLowerCase().includes(searchLower)) ||
      (job.description && job.description.toLowerCase().includes(searchLower)) ||
      (job.job_description && job.job_description.toLowerCase().includes(searchLower)) ||
      (job.generated_job_id && job.generated_job_id.toLowerCase().includes(searchLower)) ||
      (job.job_address && job.job_address.toLowerCase().includes(searchLower))
    );
  });
  
  // Get jobs to display based on pagination
  const displayedJobs = filteredJobs.slice(0, visibleJobs);
  
  // Show more jobs
  const handleShowMore = () => {
    setVisibleJobs(prev => prev + PAGE_SIZE);
  };
  
  // Show less jobs
  const handleShowLess = () => {
    setVisibleJobs(prev => Math.max(prev - PAGE_SIZE, PAGE_SIZE));
  };
  
  // Refresh jobs data
  const handleRefresh = async () => {
    setConfirmRefresh(true);
  };
  
  // Confirm refresh data
  const confirmRefreshData = async () => {
    try {
      setIsRefreshing(true);
      console.log("Manually refreshing job data...");
      
      // Reset search query
      setSearchQuery('');
      
      // Force reload with timestamp to prevent caching
      await fetchJobs(1, activeTab, true);
      
      // Reset visible jobs to default
      setVisibleJobs(PAGE_SIZE);
      
      console.log("Job data refreshed successfully");
      setConfirmRefresh(false);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    } finally {
      setIsRefreshing(false);
      setConfirmRefresh(false);
    }
  };
  
  // Status color function
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-600 text-white';
      case 'Quote': return 'bg-amber-500 text-white';
      case 'Work Order': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-600 text-white';
      case 'Scheduled': return 'bg-purple-600 text-white';
      case 'On Hold': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  
  // Handle quote actions
  const handleQuoteAction = (quoteId, action) => {
    // This would integrate with ServiceM8 API to accept/reject quotes
    alert(`${action} quote ${quoteId} - would send to ServiceM8 API`);
  };
  
  // Handle view job details
  const handleViewDetails = (job) => {
    setSelectedJob(job);
  };
  
  // Handle create new job form submission - updated to match admin version more closely
  const handleCreateJob = async (e) => {
    if (e) e.preventDefault();
    
    // Validate required fields
    if (!newJob.uuid || !newJob.job_description || !newJob.job_address || !newJob.company_uuid) {
      alert("Please fill in all required fields including selecting a client");
      return;
    }
    
    try {
      // Prepare payload to match ServiceM8 API format
      const payload = {
        active: 1,
        uuid: newJob.uuid,
        created_by_staff_uuid: newJob.created_by_staff_uuid || newJob.company_uuid, 
        company_uuid: newJob.company_uuid, // Use selected client UUID
        date: newJob.date,
        // Use job_description since the API doesn't accept "description" field
        job_description: newJob.job_description, 
        job_address: newJob.job_address,
        status: 'Quote', // Default to Quote for client requests
        work_done_description: newJob.work_done_description || '',
        generated_job_id: newJob.generated_job_id || newJob.uuid,
      };
      
      console.log('Creating job with payload:', payload);
      const response = await axios.post(API_ENDPOINTS.JOBS.CREATE, payload);
      console.log('Job created successfully:', response.data);
      
      // Force refresh jobs list with the current tab - use true to force refresh
      await fetchJobs(1, activeTab, true);
      
      // Reset search to ensure new job is visible
      setSearchQuery('');
      
      // Close the dialog
      setShowNewJobDialog(false);
      
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
      });
      
      // Show success message
      alert("Your service request has been submitted successfully!");
    } catch (error) {
      console.error('Error creating job:', error);
      alert(`Error creating job: ${error.response?.data?.message || error.message}`);
    }
  };

  // Convert job data for JobCard component
  const prepareJobForCard = (job) => {
    return {
      id: job.generated_job_id || job.uuid,
      uuid: job.uuid,
      title: job.job_description || job.description || 'No description',
      status: job.status || 'Unknown',
      date: job.date || 'Unknown date',
      dueDate: job.work_order_date || job.date,
      completedDate: job.completion_date,
      type: job.status === 'Quote' ? 'Quote' : 'Work Order',
      description: job.job_description || job.description || 'No description',
      location: job.job_address || 'No address',
      attachments: 0 // Placeholder since we don't have attachment count
    };
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
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-lg mt-1">View and manage all your service jobs</p>
        </div>
        <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Service Request</DialogTitle>
              <DialogDescription>
                Submit a new service request to our team. We'll review it and get back to you promptly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="overflow-y-auto">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="uuid">Request ID</Label>
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
                  <Label htmlFor="job_description">Job Description</Label>
                  <Textarea
                    id="job_description"
                    name="job_description"
                    placeholder="Please describe what you need..."
                    rows={4}
                    value={newJob.job_description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="job_address">Service Address</Label>
                  <Input
                    id="job_address"
                    name="job_address"
                    placeholder="Enter the address where service is needed"
                    value={newJob.job_address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="work_done_description">Additional Notes</Label>
                  <Textarea
                    id="work_done_description"
                    name="work_done_description"
                    placeholder="Any additional information or special requirements..."
                    value={newJob.work_done_description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Client selection - new feature */}
                <div className="grid gap-2">
                  <Label htmlFor="client">Select Client</Label>
                  <Select
                    id="client"
                    name="client"
                    onValueChange={handleClientChange}
                    defaultValue={newJob.company_uuid}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.uuid} value={client.uuid}>
                          {client.company_name} ({client.uuid})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewJobDialog(false)}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
  
      {/* Tabs and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Service Jobs</CardTitle>
          <CardDescription>View and track your service requests</CardDescription>
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  className="pl-10"
                  placeholder="Search jobs by ID, description, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Jobs List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-muted rounded col-span-2"></div>
                      <div className="h-2 bg-muted rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredJobs.length > 0 ? (
            <div>
              <div className="space-y-4">
                {displayedJobs.map(job => (
                  <JobCard 
                    key={job.uuid} 
                    job={prepareJobForCard(job)} 
                    onQuoteAction={handleQuoteAction}
                    statusColor={getStatusColor}
                  />
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={handleShowLess}
                  disabled={visibleJobs <= PAGE_SIZE}
                  className="flex items-center gap-2"
                >
                  <ChevronUp size={16} />
                  Show Less
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShowMore}
                  disabled={filteredJobs.length <= visibleJobs}
                  className="flex items-center gap-2"
                >
                  <ChevronDown size={16} />
                  Show More
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Clipboard size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search or create a new request</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Confirm Refresh Dialog */}
      <Dialog open={confirmRefresh} onOpenChange={setConfirmRefresh}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refresh Job Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to refresh all job data? This may take a moment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRefresh(false)}>Cancel</Button>
            <Button onClick={confirmRefreshData}>Refresh Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl">Job Details - {selectedJob.generated_job_id || selectedJob.uuid?.slice(-4)}</DialogTitle>
              <DialogDescription>
                Detailed information about your service request
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
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
                  <Label className="font-bold">Created Date</Label>
                  <p className="text-sm">{selectedJob.date}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Service Address</Label>
                <p className="text-sm">{selectedJob.job_address}</p>
              </div>

              {selectedJob.work_done_description && (
                <div className="space-y-2">
                  <Label className="font-bold">Work Notes</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedJob.work_done_description}</p>
                </div>
              )}

              {selectedJob.completion_date && (
                <div className="space-y-2">
                  <Label className="font-bold">Completion Date</Label>
                  <p className="text-sm">{selectedJob.completion_date}</p>
                </div>
              )}
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClientJobs;