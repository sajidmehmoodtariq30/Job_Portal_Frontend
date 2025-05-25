import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, 
  Search,
  Plus,
  Clipboard,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  MessageSquare
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
import { Badge } from "@/components/UI/badge";
import JobCard from "@/components/UI/client/JobCard";
import ChatRoom from "@/components/UI/client/ChatRoom";
import { useJobContext } from '@/components/JobContext';
import axios from 'axios';
import API_ENDPOINTS, { API_URL as API_BASE_URL } from '@/lib/apiConfig';

// Helper to determine page size
const PAGE_SIZE = 10;

const ClientJobs = () => {
  const navigate = useNavigate();
    // Use the JobContext to access jobs data and methods  const {
      const {
    jobs,
    totalJobs,
    loading,
    fetchJobsByClient,
    resetJobs,
    activeTab,
    setActiveTab
  } = useJobContext();// Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [visibleJobs, setVisibleJobs] = useState(PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmRefresh, setConfirmRefresh] = useState(false);
    // Quotes state
  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
    // Attachment counts state
  const [attachmentCounts, setAttachmentCounts] = useState({});
  const [attachmentCountsLoading, setAttachmentCountsLoading] = useState(false);
  
  // New state for job details dialog
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetailsDialog, setShowJobDetailsDialog] = useState(false);
  const [jobDetailsLoading, setJobDetailsLoading] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  
  // New state for job status update
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
      // Get client UUID from localStorage
  const clientUuid = localStorage.getItem('client_id') || localStorage.getItem('clientId') || localStorage.getItem('userId') || localStorage.getItem('client_uuid');

  // Set selected status when job changes
  useEffect(() => {
    if (selectedJob) {
      setSelectedStatus(selectedJob.status);
    }
  }, [selectedJob]);
  // New job form state modeled after the admin version
  const [newJob, setNewJob] = useState({
    created_by_staff_uuid: clientUuid || '', 
    date: new Date().toISOString().split('T')[0], 
    company_uuid: clientUuid || '',
    job_description: '',
    job_address: '',
    status: 'Quote', // Client requests always start as quote
    work_done_description: '',
  });// Fetch jobs on mount and when active tab changes - using client-specific fetch for better performance
  useEffect(() => {
    if (!clientUuid) {
      console.error('No client UUID found in localStorage');
      return;
    }
    // Use server-side filtering for better performance
    fetchJobsByClient(clientUuid, activeTab);
    fetchQuotes(); // Fetch quotes when component mounts
  }, [activeTab, clientUuid]);// Fetch attachment counts when jobs change
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      // Use the optimized approach for smaller datasets, full fetch for larger ones
      if (jobs.length <= 20) {
        fetchAttachmentCounts();
      }
    }
  }, [jobs]);// Fetch quotes for the client
  const fetchQuotes = async () => {
    if (!clientUuid) return;
    
    try {
      setQuotesLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.QUOTES.GET_ALL}?clientId=${clientUuid}`);
      setQuotes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setQuotes([]);
    } finally {
      setQuotesLoading(false);
    }
  };  // Fetch attachment counts for all jobs with rate limiting
  const fetchAttachmentCounts = async () => {
    if (!jobs || jobs.length === 0) return;
    
    try {
      setAttachmentCountsLoading(true);
      const counts = {};
      const BATCH_SIZE = 3; // Process 3 jobs at a time to prevent overwhelming the browser
      const DELAY_BETWEEN_BATCHES = 100; // 100ms delay between batches
      
      // Helper function to delay execution
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      
      console.log(`Fetching attachment counts for ${jobs.length} jobs in batches of ${BATCH_SIZE}...`);
      
      // Process jobs in batches
      for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);
        
        // Process current batch
        await Promise.all(
          batch.map(async (job) => {
            try {
              const jobId = job.uuid || job.id;
              if (jobId) {
                const response = await axios.get(API_ENDPOINTS.ATTACHMENTS.GET_BY_JOB(jobId));
                if (response.data && response.data.success) {
                  counts[jobId] = response.data.data ? response.data.data.length : 0;
                } else {
                  counts[jobId] = 0;
                }
              }
            } catch (error) {
              // If there's an error fetching attachments for a specific job, set count to 0
              console.error(`Error fetching attachments for job ${job.uuid || job.id}:`, error);
              counts[job.uuid || job.id] = 0;
            }
          })
        );
        
        // Update state with current progress
        setAttachmentCounts(prevCounts => ({ ...prevCounts, ...counts }));
        
        // Add delay between batches (except for the last batch)
        if (i + BATCH_SIZE < jobs.length) {
          await delay(DELAY_BETWEEN_BATCHES);
        }
      }
      
      console.log('Attachment counts fetching completed:', counts);
    } catch (error) {
      console.error('Error fetching attachment counts:', error);
    } finally {
      setAttachmentCountsLoading(false);
    }
  };
    // Optimized version: Fetch attachment counts only for visible jobs
  const fetchAttachmentCountsForVisibleJobs = async (visibleJobList) => {
    if (!visibleJobList || visibleJobList.length === 0) return;
    
    try {
      setAttachmentCountsLoading(true);
      const counts = { ...attachmentCounts }; // Keep existing counts
      
      // Only fetch for jobs that don't have counts yet
      const jobsToFetch = visibleJobList.filter(job => {
        const jobId = job.uuid || job.id;
        return jobId && !(jobId in counts);
      });
      
      if (jobsToFetch.length === 0) {
        setAttachmentCountsLoading(false);
        return;
      }
      
      console.log(`Fetching attachment counts for ${jobsToFetch.length} visible jobs...`);
      
      // Process all visible jobs at once since there are fewer of them
      const fetchPromises = jobsToFetch.map(async (job) => {
        try {
          const jobId = job.uuid || job.id;
          if (jobId) {
            // Add timeout to prevent hanging requests
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), 10000)
            );
            
            const requestPromise = axios.get(API_ENDPOINTS.ATTACHMENTS.GET_BY_JOB(jobId));
            
            const response = await Promise.race([requestPromise, timeoutPromise]);
            
            if (response.data && response.data.success) {
              counts[jobId] = response.data.data ? response.data.data.length : 0;
            } else {
              counts[jobId] = 0;
            }
          }
        } catch (error) {
          const jobId = job.uuid || job.id;
          console.error(`Error fetching attachments for job ${jobId}:`, error);
          counts[jobId] = 0;
        }
      });
      
      await Promise.all(fetchPromises);
      
      setAttachmentCounts(counts);
      console.log('Visible jobs attachment counts updated:', counts);
    } catch (error) {
      console.error('Error fetching attachment counts for visible jobs:', error);
    } finally {
      setAttachmentCountsLoading(false);
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
    });  };
  
  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetJobs();
    fetchJobsByClient(clientUuid, tab);
    // Reset search term and visible jobs count when changing tabs for better performance
    setSearchQuery('');
    setVisibleJobs(PAGE_SIZE);
  };
  
  // Remove the generateUUID function since ServiceM8 will handle job ID generation
  
  // Filter jobs based on search query only (server-side filtering already applied for client ownership)
  const filteredJobs = jobs.filter(job => {
    // Only search query filter since client filtering is handled server-side
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase().trim();
    
    // Check fields that exist to improve performance
    // Check both description and job_description fields to handle different API response formats
    return (
      (job.uuid && job.uuid.toLowerCase().includes(searchLower)) ||
      (job.description && job.description.toLowerCase().includes(searchLower)) ||
      (job.job_description && job.job_description.toLowerCase().includes(searchLower)) ||
      (job.job_address && job.job_address.toLowerCase().includes(searchLower))
    );
  });
  
  // Get jobs to display based on pagination
  const displayedJobs = filteredJobs.slice(0, visibleJobs);
  
  // Fetch attachment counts for visible jobs when they change (effect placed after filteredJobs definition)
  useEffect(() => {
    if (jobs && jobs.length > 20 && filteredJobs && filteredJobs.length > 0) {
      // Only use optimized approach for larger datasets
      const visibleJobsList = filteredJobs.slice(0, visibleJobs);
      fetchAttachmentCountsForVisibleJobs(visibleJobsList);
    }
  }, [jobs, searchQuery, visibleJobs]); // Dependencies include searchQuery to refetch when filter changes

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
  };  // Confirm refresh data
  const confirmRefreshData = async () => {
    try {
      setIsRefreshing(true);
      console.log("Manually refreshing job data...");
      
      // Reset search query
      setSearchQuery('');
      
      // Force reload with timestamp to prevent caching - using client-specific fetch
      await fetchJobsByClient(clientUuid, activeTab, true);
      
      // Also refresh quotes data
      await fetchQuotes();
      
      // Refresh attachment counts after jobs are fetched
      setTimeout(() => {
        fetchAttachmentCounts();
      }, 500); // Small delay to ensure jobs are updated first
      
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
      case 'On Hold': return 'bg-gray-600 text-white';      default: return 'bg-gray-600 text-white';
    }
  };
  
  // Handle view job details - updated to open dialog instead of navigating
  const handleViewDetails = async (job) => {
    try {
      setJobDetailsLoading(true);
      setSelectedJob(null); // Reset selected job
      
      // Fetch full job details if we only have partial data
      if (!job.job_description && job.uuid) {
        const response = await axios.get(`${API_ENDPOINTS.JOBS.FETCH_BY_ID}/${job.uuid}`);
        if (response.data && response.data.data) {
          setSelectedJob(response.data.data);
        } else if (response.data) {
          setSelectedJob(response.data);
        } else {
          setSelectedJob(job); // Fallback to the job we already have
        }
      } else {
        setSelectedJob(job);
      }
      
      // Open the dialog
      setShowJobDetailsDialog(true);
      
      // Fetch attachments for this job
      const jobId = job.uuid || job.id;
      if (jobId) {
        fetchAttachments(jobId);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      // Fallback to existing job data
      setSelectedJob(job);
      setShowJobDetailsDialog(true);
    } finally {
      setJobDetailsLoading(false);
    }
  };

  // Handle adding note to job
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      // In a real implementation, this would call an API to add the note
      alert('Adding note functionality would be implemented here');
      setNewNote('');
      setIsAddingNote(false);    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  // Handle job status update
  const handleStatusUpdate = async () => {
    if (!selectedJob || !selectedStatus || selectedStatus === selectedJob.status) {
      return;
    }    try {      setIsUpdatingStatus(true);
        const response = await axios.put(
        `${API_BASE_URL}/fetch/jobs/${selectedJob.uuid}/status`,
        { status: selectedStatus }
      );

      if (response.data.success) {
        // Update the job in the local state
        setSelectedJob(prev => ({ ...prev, status: selectedStatus }));
          // Refresh the jobs list to reflect the change
        await fetchJobsByClient(clientUuid, activeTab, true);
        
        alert('Job status updated successfully!');
      } else {
        alert('Failed to update job status: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Error updating job status: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Fetch attachments for selected job
  const fetchAttachments = async (jobId) => {
    if (!jobId) return;
    
    try {
      setAttachmentsLoading(true);
      const response = await axios.get(API_ENDPOINTS.ATTACHMENTS.GET_BY_JOB(jobId));
      
      if (response.data && response.data.success) {
        setAttachments(response.data.data || []);
      } else {
        setAttachments([]);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setAttachments([]);
    } finally {
      setAttachmentsLoading(false);
    }
  };
    // Handle file selection with size validation
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 9 * 1024 * 1024; // 9MB in bytes
      
      if (file.size > maxSize) {
        alert(`File is too large. Please upload a file less than 9MB. Current file size: ${formatFileSize(file.size)}`);
        e.target.value = ''; // Clear the file input
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile || !selectedJob) return;
    
    try {
      setFileUploading(true);
      
      // Get user info for the upload
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userName = userInfo.name || userInfo.email || 'Client';
      
      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userType', 'client');
      formData.append('userName', userName);
      
      const response = await axios.post(
        API_ENDPOINTS.ATTACHMENTS.UPLOAD(selectedJob.uuid || selectedJob.id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Refresh attachments list
        await fetchAttachments(selectedJob.uuid || selectedJob.id);
        setSelectedFile(null);
        setIsUploadingFile(false);
      }    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Check for common errors and provide specific messages
      if (error.response) {
        if (error.response.status === 413) {
          alert('File is too large. Please upload a file less than 9MB.');
        } else if (error.response.data && error.response.data.message) {
          alert(`Upload failed: ${error.response.data.message}`);
        } else {
          alert(`Upload failed: ${error.response.statusText}`);
        }
      } else if (error.message && error.message.includes('network')) {
        alert('Network error. Please check your connection and try again.');
      } else {
        alert('Failed to upload file. Please try again.');
      }
    } finally {
      setFileUploading(false);
    }
  };
  
  // Handle file download
  const handleDownloadFile = async (attachmentId, fileName) => {
    try {
      // Using axios to get the file with responseType blob
      const response = await axios.get(API_ENDPOINTS.ATTACHMENTS.DOWNLOAD(attachmentId), {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      
      // Add to document, click and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    }
  };    // Handle create new job form submission - updated to remove manual UUID generation
  const handleCreateJob = async (e) => {
    if (e) e.preventDefault();
    
    // Ensure client UUID is set automatically
    if (!newJob.company_uuid) {
      setNewJob(prev => ({
        ...prev,
        company_uuid: clientUuid,
        created_by_staff_uuid: clientUuid
      }));
    }
    
    // Validate required fields (removed uuid check since ServiceM8 will generate it)
    if (!newJob.job_description || !newJob.job_address) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {      // Prepare payload to match ServiceM8 API format - removed uuid and generated_job_id
      const payload = {
        active: 1,
        created_by_staff_uuid: clientUuid, // Always use logged-in client UUID
        company_uuid: clientUuid, // Always use logged-in client UUID
        date: newJob.date,
        // Use job_description since the API doesn't accept "description" field
        job_description: newJob.job_description, 
        job_address: newJob.job_address,
        status: 'Quote', // Default to Quote for client requests
        work_done_description: newJob.work_done_description || '',
      };
      
      console.log('Creating job with payload:', payload);
      const response = await axios.post(API_ENDPOINTS.JOBS.CREATE, payload);      console.log('Job created successfully:', response.data);
      
      // Force refresh jobs list with the current tab - use true to force refresh
      await fetchJobsByClient(clientUuid, activeTab, true);
      
      // Reset search to ensure new job is visible
      setSearchQuery('');
      
      // Close the dialog
      setShowNewJobDialog(false);
        // Reset form for next use with client UUID automatically populated
      setNewJob({
        created_by_staff_uuid: clientUuid, // Automatically set to logged-in client
        date: new Date().toISOString().split('T')[0],
        company_uuid: clientUuid, // Automatically set to logged-in client
        job_description: '',
        job_address: '',
        status: 'Quote',
        work_done_description: '',
      });
      
      // Show success message
      alert("Your service request has been submitted successfully!");
    } catch (error) {
      console.error('Error creating job:', error);
      alert(`Error creating job: ${error.response?.data?.message || error.message}`);
    }
  };  // Convert job data for JobCard component
  const prepareJobForCard = (job) => {
    const jobId = job.uuid || job.id;
    const attachmentCount = attachmentCounts[jobId];
    
    return {
      id: job.uuid, // Use ServiceM8-generated UUID as the primary ID
      uuid: job.uuid,
      title: job.job_description || job.description || 'No description',
      status: job.status || 'Unknown',
      date: job.date || 'Unknown',
      dueDate: job.work_order_date || job.date,
      completedDate: job.completion_date,
      type: job.status === 'Quote' ? 'Quote' : 'Work Order',
      description: job.job_description || job.description || 'No description',
      location: job.job_address || 'No address',
      attachments: attachmentCount !== undefined ? attachmentCount : '...' // Show loading indicator if count not yet loaded
    };
  };  // Reset form with client UUID - ServiceM8 will generate job ID automatically
  const resetJobForm = () => {
    setNewJob({
      created_by_staff_uuid: clientUuid,
      company_uuid: clientUuid,
      date: new Date().toISOString().split('T')[0],
      job_description: '',
      job_address: '',
      status: 'Quote',
      work_done_description: '',
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-lg mt-1">View and manage all your service jobs</p>
        </div>        <Dialog open={showNewJobDialog} onOpenChange={(open) => {
          setShowNewJobDialog(open);
          if (open) {
            // Reset and populate form with client UUID when dialog opens
            resetJobForm();
          }
        }}>
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
            </DialogHeader>            <form onSubmit={handleCreateJob} className="overflow-y-auto">
              <div className="grid gap-4 py-4">
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
                </div>              </div>
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
            <div>              <div className="space-y-4">
                {displayedJobs.map(job => (
                  <JobCard 
                    key={job.uuid} 
                    job={prepareJobForCard(job)} 
                    onViewDetails={handleViewDetails}
                    statusColor={getStatusColor}
                    quotes={quotes}
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
      <Dialog open={showJobDetailsDialog} onOpenChange={setShowJobDetailsDialog}>
        <DialogContent className="max-h-[95vh] overflow-y-auto max-w-[98vw] md:max-w-6xl lg:max-w-7xl w-full p-3 md:p-6 rounded-lg">
          {jobDetailsLoading || !selectedJob ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading job details...</p>
            </div>
          ) : (
            <>
              <DialogHeader className="border-b pb-3 md:pb-4">
                <div className="flex justify-between items-center">                  <div>
                    <DialogTitle className="text-lg md:text-2xl font-bold truncate">
                      {selectedJob.uuid || selectedJob.id}
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm">
                      {selectedJob.job_description || selectedJob.description || 'No description available'}
                    </DialogDescription>
                  </div>
                  <Badge className={getStatusColor(selectedJob.status)}>
                    {selectedJob.status}
                  </Badge>
                </div>
              </DialogHeader>
                <div className="py-4">                <Tabs defaultValue="details" className="mt-3 md:mt-4">
                  <TabsList className="w-full flex-wrap gap-1">
                    <TabsTrigger value="details" className="text-xs md:text-base flex-1 md:flex-none">Job Details</TabsTrigger>
                    <TabsTrigger value="chat" className="text-xs md:text-base flex-1 md:flex-none">
                      <div className="flex items-center justify-center">
                        <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Chat Room
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="attachments" className="text-xs md:text-base flex-1 md:flex-none">Attachments</TabsTrigger>
                  </TabsList>                  <TabsContent value="details" className="p-0 mt-3 md:mt-4">
                    <div className="grid gap-3 md:gap-5">                      <div className="grid grid-cols-1 gap-3 md:gap-5 p-3 md:p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-1 md:space-y-2 overflow-hidden">
                          <Label className="font-bold text-xs md:text-sm text-gray-600">Job ID</Label>
                          <p className="text-xs md:text-sm font-medium break-all overflow-auto">{selectedJob.uuid || selectedJob.id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                        <Label className="font-bold text-xs md:text-sm">Job Description</Label>
                        <div className="max-h-28 md:max-h-48 overflow-y-auto bg-white p-2 rounded border border-gray-200">
                          <p className="text-xs md:text-sm whitespace-pre-wrap">{selectedJob.job_description || selectedJob.description || 'No description available'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">                        <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                          <Label className="font-bold text-xs md:text-sm">Status</Label>
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
                        <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                          <Label className="font-bold text-xs md:text-sm">Active</Label>
                          <p className="text-xs md:text-sm">{selectedJob.active === 1 || selectedJob.active === true ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      {/* Job Status Update Section */}
                      <div className="space-y-3 border border-gray-200 rounded-lg p-3 md:p-4 bg-blue-50">
                        <Label className="font-bold text-sm md:text-base text-gray-800">Update Job Status</Label>
                        <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
                          <div className="flex-1 space-y-2">
                            <Label className="text-xs md:text-sm text-gray-600">Select New Status</Label>
                            <Select 
                              value={selectedStatus || selectedJob.status} 
                              onValueChange={setSelectedStatus}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Quote">Quote</SelectItem>
                                <SelectItem value="Work Order">Work Order</SelectItem>
                                <SelectItem value="Unsuccessful">Unsuccessful</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={handleStatusUpdate}
                            disabled={isUpdatingStatus || !selectedStatus || selectedStatus === selectedJob.status}
                            className="w-full md:w-auto"
                          >
                            {isUpdatingStatus ? 'Updating...' : 'Save Changes'}
                          </Button>
                        </div>
                        {selectedStatus && selectedStatus !== selectedJob.status && (
                          <p className="text-xs text-gray-600">
                            Status will be updated from <strong>{selectedJob.status}</strong> to <strong>{selectedStatus}</strong>
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                        <Label className="font-bold text-xs md:text-sm">Service Address</Label>
                        <p className="text-xs md:text-sm break-words">{selectedJob.job_address || 'N/A'}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                        <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                          <Label className="font-bold text-xs md:text-sm">Created Date</Label>
                          <p className="text-xs md:text-sm">{selectedJob.date || 'N/A'}</p>
                        </div>
                        <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                          <Label className="font-bold text-xs md:text-sm">Work Order Date</Label>
                          <p className="text-xs md:text-sm">{selectedJob.work_order_date || 'N/A'}</p>
                        </div>
                        <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                          <Label className="font-bold text-xs md:text-sm">Completion Date</Label>
                          <p className="text-xs md:text-sm">{selectedJob.completion_date || 'N/A'}</p>
                        </div>
                      </div>

                      {(selectedJob.geo_street || selectedJob.geo_city || selectedJob.geo_state || selectedJob.geo_country) && (
                        <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                          <Label className="font-bold text-xs md:text-sm">Location Details</Label>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                              <p><span className="font-semibold">Street:</span> {selectedJob.geo_number || ''} {selectedJob.geo_street || 'N/A'}</p>
                              <p><span className="font-semibold">City:</span> {selectedJob.geo_city || 'N/A'}</p>
                              <p><span className="font-semibold">State:</span> {selectedJob.geo_state || 'N/A'}</p>
                              <p><span className="font-semibold">Postcode:</span> {selectedJob.geo_postcode || 'N/A'}</p>
                              <p><span className="font-semibold">Country:</span> {selectedJob.geo_country || 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {(selectedJob.contact_name || selectedJob.contact_email || selectedJob.contact_phone) && (
                        <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                          <Label className="font-bold text-xs md:text-sm">Contact Information</Label>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                              {selectedJob.contact_name && <p><span className="font-semibold">Name:</span> {selectedJob.contact_name}</p>}
                              {selectedJob.contact_email && (
                                <p><span className="font-semibold">Email:</span> <a href={`mailto:${selectedJob.contact_email}`} className="text-blue-600 hover:underline">{selectedJob.contact_email}</a></p>
                              )}
                              {selectedJob.contact_phone && (
                                <p><span className="font-semibold">Phone:</span> <a href={`tel:${selectedJob.contact_phone}`} className="text-blue-600 hover:underline">{selectedJob.contact_phone}</a></p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {(selectedJob.payment_amount || selectedJob.payment_method || selectedJob.payment_date) && (
                        <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                          <Label className="font-bold text-xs md:text-sm">Payment Details</Label>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                              <p><span className="font-semibold">Amount:</span> ${selectedJob.payment_amount || '0.00'}</p>
                              <p><span className="font-semibold">Method:</span> {selectedJob.payment_method || 'N/A'}</p>
                              <p><span className="font-semibold">Date:</span> {selectedJob.payment_date && selectedJob.payment_date !== '0000-00-00 00:00:00' ? selectedJob.payment_date : 'N/A'}</p>
                              <p><span className="font-semibold">Status:</span> {selectedJob.payment_processed ? 'Processed' : 'Not Processed'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedJob.purchase_order_number && (
                        <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                          <Label className="font-bold text-xs md:text-sm">Purchase Order Number</Label>
                          <p className="text-xs md:text-sm break-words">{selectedJob.purchase_order_number}</p>
                        </div>
                      )}

                      {/* Quote information if available */}
                      {(selectedJob.quote_date || selectedJob.quote_sent) && (
                        <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                          <Label className="font-bold text-xs md:text-sm">Quote Information</Label>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                              {selectedJob.quote_date && <p><span className="font-semibold">Quote Date:</span> {selectedJob.quote_date}</p>}
                              {selectedJob.quote_sent && <p><span className="font-semibold">Quote Sent:</span> {selectedJob.quote_sent === "1" ? 'Yes' : 'No'}</p>}
                              {selectedJob.quote_sent_stamp && <p><span className="font-semibold">Sent On:</span> {selectedJob.quote_sent_stamp}</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Invoice information if available */}
                      {(selectedJob.invoice_sent || selectedJob.total_invoice_amount) && (
                        <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                          <Label className="font-bold text-xs md:text-sm">Invoice Information</Label>
                          <div className="bg-gray-50 p-2 rounded">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                              {selectedJob.total_invoice_amount && <p><span className="font-semibold">Total Amount:</span> ${selectedJob.total_invoice_amount}</p>}
                              {selectedJob.invoice_sent && <p><span className="font-semibold">Invoice Sent:</span> {selectedJob.invoice_sent === "1" ? 'Yes' : 'No'}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Work Description */}
                      {selectedJob.work_done_description && (
                        <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                          <Label className="font-bold text-xs md:text-sm">Work Description</Label>
                          <div className="max-h-28 md:max-h-48 overflow-y-auto bg-white p-2 rounded border border-gray-200">
                            <p className="text-xs md:text-sm whitespace-pre-wrap">{selectedJob.work_done_description}</p>
                          </div>
                        </div>
                      )}
                    </div></TabsContent>
                  <TabsContent value="chat" className="space-y-4">
                    <ChatRoom jobId={selectedJob.uuid || selectedJob.id} />
                  </TabsContent>                    <TabsContent value="attachments" className="p-0 mt-3 md:mt-4">
                    <Card className="border rounded-lg">
                      <CardHeader className="p-3 md:p-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm md:text-base flex items-center">
                            <FileText className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                            Attachments
                          </CardTitle>
                          <Button 
                            size="sm" 
                            className="text-xs md:text-sm h-8 md:h-9"
                            onClick={() => setIsUploadingFile(true)}
                          >
                            Upload File
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4">                        {isUploadingFile && (                          <div className="mb-4 p-3 md:p-4 border border-gray-200 rounded-md bg-gray-50">
                            <Label htmlFor="fileUpload" className="text-xs md:text-sm font-medium mb-2 block">Upload File</Label>
                            <Input
                              id="fileUpload"
                              type="file"
                              onChange={handleFileChange}
                              className="mb-3 text-xs md:text-sm"
                            />
                            <div className="text-xs md:text-sm text-amber-600 mb-3 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                              </svg>
                              File size must be less than 9MB to ensure successful upload
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                className="text-xs md:text-sm h-8 md:h-9"
                                onClick={() => {
                                  setIsUploadingFile(false);
                                  setSelectedFile(null);
                                }}
                                disabled={fileUploading}
                              >
                                Cancel
                              </Button>
                              <Button 
                                className="text-xs md:text-sm h-8 md:h-9"
                                onClick={handleFileUpload} 
                                disabled={!selectedFile || fileUploading}
                              >
                                {fileUploading ? 'Uploading...' : 'Upload'}
                              </Button>
                            </div>
                          </div>
                        )}
                          {attachmentsLoading ? (
                          <div className="py-4 md:py-6 flex justify-center">
                            <div className="animate-pulse flex space-x-3 md:space-x-4 w-full">
                              <div className="flex-1 space-y-2 md:space-y-4 py-1">
                                <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="space-y-1 md:space-y-2">
                                  <div className="h-3 md:h-4 bg-gray-200 rounded"></div>
                                  <div className="h-3 md:h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : attachments.length > 0 ? (
                          <div className="space-y-2 md:space-y-4">
                            {attachments.map((file) => {
                              // Determine icon color based on file type
                              const getFileColor = () => {
                                const ext = file.fileName.split('.').pop().toLowerCase();
                                if (['pdf'].includes(ext)) return 'text-red-600';
                                if (['doc', 'docx'].includes(ext)) return 'text-blue-600';
                                if (['xls', 'xlsx'].includes(ext)) return 'text-green-600';
                                if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'text-purple-600';
                                if (['zip', 'rar'].includes(ext)) return 'text-amber-600';
                                return 'text-gray-600';
                              };
                              
                              return (                                <div 
                                  key={file.id} 
                                  className="p-2 md:p-4 border border-gray-200 rounded-md flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0"
                                >
                                  <div className="flex items-center gap-2 md:gap-3">
                                    <FileText className={`h-6 w-6 md:h-8 md:w-8 ${getFileColor()}`} />
                                    <div className="overflow-hidden">
                                      <p className="font-medium text-xs md:text-sm truncate">{file.fileName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {formatFileSize(file.fileSize)} • 
                                        <span className="hidden xs:inline">Uploaded by </span>{file.uploadedBy} • 
                                        {new Date(file.uploadTimestamp).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex items-center gap-1 text-xs md:text-sm h-8 md:h-9 mt-1 md:mt-0"
                                    onClick={() => handleDownloadFile(file.id, file.fileName)}
                                  >
                                    <Download className="h-3 w-3 md:h-4 md:w-4" />
                                    Download
                                  </Button>
                                </div>
                              );
                            })}
                          </div>                        ) : (
                          <div className="py-8 md:py-10 text-center">
                            <FileText className="h-10 w-10 md:h-12 md:w-12 mx-auto text-gray-400 mb-2 md:mb-3" />
                            <p className="text-xs md:text-sm text-muted-foreground">No attachments found for this job</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3 md:mt-4 text-xs md:text-sm h-8 md:h-9"
                              onClick={() => setIsUploadingFile(true)}
                            >
                              Upload First Attachment
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>              <DialogFooter className="mt-4 border-t pt-4 flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className="text-xs md:text-sm h-8 md:h-9"
                  onClick={() => setShowJobDetailsDialog(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientJobs;