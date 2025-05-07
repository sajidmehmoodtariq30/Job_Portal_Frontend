import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search,
  Plus,
  Clipboard,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  UploadCloud,
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
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [visibleJobs, setVisibleJobs] = useState(PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  
  // Form state for new job creation
  const [jobForm, setJobForm] = useState({
    uuid: '',
    title: '',
    description: '',
    location: 'Main Office',
    jobType: 'Installation',
    priority: 'Normal',
    company_uuid: '', // Will be filled automatically based on the logged-in client
    job_address: '',
    status: 'Quote', // Default to Quote
  });
  
  // Mock locations and job types (can be replaced with real data from API)
  const locations = ['Main Office', 'Warehouse', 'Branch Office'];
  const jobTypes = ['Installation', 'Repair', 'Maintenance', 'Consultation'];
  const priorities = ['Low', 'Normal', 'High', 'Urgent'];
  
  // Fetch jobs on mount and when active tab changes
  useEffect(() => {
    fetchJobs(1, activeTab);
  }, [activeTab]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm({
      ...jobForm,
      [name]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setJobForm({
      ...jobForm,
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
    setJobForm({ 
      ...jobForm, 
      uuid,
      generated_job_id: uuid // Set generated_job_id to match UUID automatically
    });
  };
  
  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase().trim();
    
    // Only check fields that exist to improve performance
    return (
      (job.uuid && job.uuid.toLowerCase().includes(searchLower)) ||
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
  
  // Handle add attachment button
  const handleAddAttachment = (jobId) => {
    setCurrentJobId(jobId);
    setShowAttachmentDialog(true);
  };
  
  // Handle create new job form submission
  const handleCreateJob = async () => {
    // Validate required fields
    if (!jobForm.uuid || !jobForm.description || !jobForm.job_address) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      // Prepare payload to match ServiceM8 API format
      const payload = {
        active: 1,
        uuid: jobForm.uuid,
        created_by_staff_uuid: jobForm.uuid, // Used as staff UUID
        company_uuid: localStorage.getItem('clientId') || jobForm.uuid, // Client ID should be in localStorage
        date: new Date().toISOString().split('T')[0],
        job_description: jobForm.description,
        job_address: jobForm.job_address || jobForm.location,
        status: 'Quote', // Default to Quote for client requests
        work_done_description: '',
        generated_job_id: jobForm.uuid,
      };
      
      console.log('Creating job with payload:', payload);
      const response = await axios.post(API_ENDPOINTS.JOBS.CREATE, payload);
      console.log('Job created successfully:', response.data);
      
      // Force refresh jobs list with the current tab
      await fetchJobs(1, activeTab, true);
      setShowNewJobDialog(false);
      
      // Reset form for next use
      setJobForm({
        uuid: '',
        title: '',
        description: '',
        location: 'Main Office',
        jobType: 'Installation',
        priority: 'Normal',
        job_address: '',
        status: 'Quote',
      });
      
      // Show success message
      alert("Your service request has been submitted successfully!");
    } catch (error) {
      console.error('Error creating job:', error);
      alert(`Error creating job: ${error.response?.data?.message || error.message}`);
    }
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    // This would handle file upload and then send to ServiceM8 API
    alert(`File uploaded to job ${currentJobId} - would scan and send to ServiceM8 API`);
    setShowAttachmentDialog(false);
  };

  // Convert job data for JobCard component
  const prepareJobForCard = (job) => {
    return {
      id: job.generated_job_id || job.uuid,
      uuid: job.uuid,
      title: job.job_description?.slice(0, 50) || 'No description',
      status: job.status || 'Unknown',
      date: job.date || 'Unknown date',
      dueDate: job.work_order_date || job.date,
      completedDate: job.completion_date,
      type: job.status === 'Quote' ? 'Quote' : 'Work Order',
      description: job.job_description || 'No description',
      location: job.job_address || 'No address',
      attachments: 0 // Placeholder since we don't have attachment count
    };
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
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="uuid">Request ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="uuid"
                      name="uuid"
                      value={jobForm.uuid}
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
                  <Label htmlFor="title">Request Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Brief title for your request" 
                    value={jobForm.title} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Please describe what you need..." 
                  rows={4} 
                  value={jobForm.description} 
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
                  value={jobForm.job_address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="jobType">Job Type</Label>
                  <Select 
                    value={jobForm.jobType} 
                    onValueChange={(value) => handleSelectChange('jobType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={jobForm.priority} 
                    onValueChange={(value) => handleSelectChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewJobDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateJob}>Submit Request</Button>
            </DialogFooter>
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
                    onAddAttachment={handleAddAttachment}
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

      {/* File Upload Dialog */}
      <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Attachment</DialogTitle>
            <DialogDescription>
              Upload files related to job {currentJobId}. All files will be scanned for viruses before being processed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-center mb-2">Drag and drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground text-center">Max file size: 25MB</p>
                <Button variant="outline" className="mt-4">Browse Files</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttachmentDialog(false)}>Cancel</Button>
            <Button onClick={handleFileUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientJobs;