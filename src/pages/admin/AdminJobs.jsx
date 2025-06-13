// src/pages/admin/AdminJobs.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/UI/button"
import { Input } from "@/components/UI/input"
import { Textarea } from "@/components/UI/textarea"
import { MessageSquare, FileText, Download, Upload } from 'lucide-react'
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
import LocationSelector from "@/components/UI/LocationSelector"
import axios from 'axios'
import { useJobContext } from '@/components/JobContext';
import { API_ENDPOINTS, API_URL } from '@/lib/apiConfig';
import AdminChatRoom from "@/components/UI/admin/AdminChatRoom";
import JobFilters from "@/components/UI/admin/JobFilters";
import { getClientNamesByUuids } from '@/utils/clientUtils';

// Helper to determine page size
const PAGE_SIZE = 10;

const AdminJobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  // Role-based filtering state
  const [userRole, setUserRole] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    status: '',
    category_uuid: '',
    type: ''
  });  const [useRoleBasedFiltering, setUseRoleBasedFiltering] = useState(false);
  // Filter state for JobFilters component
  const [filterLoading, setFilterLoading] = useState(false);
    const [newJob, setNewJob] = useState({
    created_by_staff_uuid: '',
    date: new Date().toISOString().split('T')[0],
    company_uuid: '',
    job_description: '',
    location_uuid: '', // Changed from job_address
    status: 'Quote',
    work_done_description: '',
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
  const [selectedLocationUuid, setSelectedLocationUuid] = useState('');
  const [locationRefreshTrigger, setLocationRefreshTrigger] = useState(0);  const [visibleJobs, setVisibleJobs] = useState(10);  const [selectedJob, setSelectedJob] = useState(null);
  const [jobClientName, setJobClientName] = useState("Unknown Client");
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUploading, setFileUploading] = useState(false);  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

  // State for client names in table rows
  const [jobClientNames, setJobClientNames] = useState({});

  // New state for job status update
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // New state for date sorting
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first

  // Loading states for various actions
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [deletingFiles, setDeletingFiles] = useState(new Set());
  const {
    jobs,
    totalJobs,
    loading,
    fetchJobs,
    fetchJobsByRole,
    fetchCategoriesByRole,
    resetJobs,
    activeTab,
    setActiveTab
  } = useJobContext();  // Fetch jobs on mount and when tab changes
  useEffect(() => {
    // Get user role from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const role = userInfo.role || 'Administrator';
    setUserRole(role);

    // Use role-based filtering for non-admin roles
    if (role !== 'Administrator' && role !== 'Office Manager') {
      setUseRoleBasedFiltering(true);
      fetchJobsByRole(role, { ...activeFilters, status: activeTab !== 'all' ? activeTab : '' });
    } else {
      fetchJobs(1, activeTab);
    }
    fetchClients(); // Fetch clients for the dropdown
    fetchCategories(); // Fetch categories for the dropdown
  }, [activeTab]);

  // Fetch jobs when filters change (for role-based filtering)
  useEffect(() => {
    if (useRoleBasedFiltering && userRole) {
      const filters = { ...activeFilters };
      if (activeTab !== 'all') {
        filters.status = activeTab;
      }
      fetchJobsByRole(userRole, filters);
    }
  }, [activeFilters, useRoleBasedFiltering, userRole]);
  // Set selected status when job changes
  useEffect(() => {
    if (selectedJob) {
      setSelectedStatus(selectedJob.status);
    }
  }, [selectedJob]);

  // Fetch client names when jobs change
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      fetchClientNamesForJobs(jobs);
    }
  }, [jobs]);// Fetch clients for the dropdown
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

  // Fetch client names for table display
  const fetchClientNamesForJobs = async (jobsData) => {
    if (!Array.isArray(jobsData) || jobsData.length === 0) return;

    // Extract unique client UUIDs from jobs
    const clientUuids = [...new Set(
      jobsData.map(job => job.company_uuid || job.created_by_staff_uuid)
        .filter(Boolean)
    )];

    if (clientUuids.length === 0) return;

    try {
      // Fetch client names using the utility function
      const clientNamesMap = await getClientNamesByUuids(clientUuids);
      setJobClientNames(clientNamesMap);
    } catch (error) {
      console.error('Error fetching client names for jobs:', error);
    }
  };  // Helper function to get job number - now uses ServiceM8's generated_job_id
  const getJobNumber = (job) => {
    // Use ServiceM8's generated job ID if available, otherwise fallback to UUID formatting
    if (job.generated_job_id) {
      return job.generated_job_id;
    }
    
    // Fallback for old data or missing generated_job_id
    if (!job.uuid) return 'N/A';
    
    // Extract only numeric digits from UUID as last resort
    const numericDigits = job.uuid.replace(/[^0-9]/g, '');
    const jobNumber = numericDigits.padStart(8, '0').slice(0, 8);
    return jobNumber;
  };

  // Helper function to format job address
  const formatJobAddress = (job) => {
    if (!job) return 'No address';

    // Try location fields first (new structure)
    if (job.location_address) {
      return job.location_address;
    }

    // Try geo fields
    const geoParts = [];
    if (job.geo_street) geoParts.push(job.geo_street);
    if (job.geo_city) geoParts.push(job.geo_city);
    if (job.geo_state) geoParts.push(job.geo_state);
    
    if (geoParts.length > 0) {
      return geoParts.join(', ');
    }

    // Fallback to job_address
    return job.job_address || 'No address';
  };

  // Fetch categories for the dropdown
  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CATEGORIES.FETCH_ALL);
      console.log('Categories data response:', response.data);
      if (response.data && response.data.success) {
        setCategories(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };
  // Reset jobs when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetJobs();

    if (useRoleBasedFiltering && userRole) {
      const filters = { ...activeFilters };
      if (tab !== 'all') {
        filters.status = tab;
      } else {
        delete filters.status;
      }
      fetchJobsByRole(userRole, filters);
    } else {
      fetchJobs(1, tab);
    }

    // Reset search term and visible jobs count when changing tabs for better performance
    setSearchTerm('');
    setVisibleJobs(10);
  };
  // Handle filter changes from JobFilters component
  const handleFiltersChange = async (newFilters) => {
    setActiveFilters(newFilters);
    setFilterLoading(true);

    try {
      // Apply filters to current jobs or fetch new filtered jobs
      if (useRoleBasedFiltering && userRole) {
        await fetchJobsByRole(userRole, newFilters);
      } else {
        // For backward compatibility, we'll use local filtering
        setSearchTerm(newFilters.search || '');
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setFilterLoading(false);
    }

    // Reset visible jobs when filters change
    setVisibleJobs(10);
  };
  // Handle search term changes (for backward compatibility with basic search)
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (useRoleBasedFiltering) {
      setActiveFilters(prev => ({ ...prev, search: value }));
    }
  };
  // Function to enrich jobs with category names
  const enrichJobsWithCategoryNames = (jobList) => {
    if (!Array.isArray(jobList) || !Array.isArray(categories)) {
      return jobList;
    }
    
    return jobList.map(job => {
      if (job.category_uuid && !job.category_name) {
        const category = categories.find(cat => cat.uuid === job.category_uuid);
        return {
          ...job,
          category_name: category ? category.name : null
        };
      }
      return job;
    });
  };
  // Compute filtered jobs based on search term and active filters
  const filteredJobs = useRoleBasedFiltering ? enrichJobsWithCategoryNames(jobs) : enrichJobsWithCategoryNames(jobs).filter(job => {
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      const jobNumber = getJobNumber(job).toLowerCase();
      const matchesSearch = (
        (job.uuid && job.uuid.toLowerCase().includes(searchLower)) ||
        (jobNumber.includes(searchLower)) ||
        (job.job_description && job.job_description.toLowerCase().includes(searchLower)) ||
        (job.job_address && job.job_address.toLowerCase().includes(searchLower)) ||
        (job.category_name && job.category_name.toLowerCase().includes(searchLower))
      );
      if (!matchesSearch) return false;
    }

    // Status filter (when not using role-based filtering but filters are applied)
    if (activeFilters.status && activeFilters.status !== '' && job.status !== activeFilters.status) {
      return false;
    }

    // Category filter
    if (activeFilters.category && activeFilters.category !== '' && job.category_uuid !== activeFilters.category) {
      return false;
    }

    // Type filter (if you have a type field)
    if (activeFilters.type && activeFilters.type !== '' && job.type !== activeFilters.type) {
      return false;
    }

    return true;
  });

  // Sort the filtered jobs based on sortOrder
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    const dateA = new Date(a.date || a.created_at || 0);
    const dateB = new Date(b.date || b.created_at || 0);
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });
  
  // Limit visible jobs for pagination AFTER filtering and sorting
  const displayedJobs = sortedJobs.slice(0, visibleJobs);

  const handleShowMore = () => {
    setVisibleJobs(prev => prev + 10);
  };
  const handleShowLess = () => {
    setVisibleJobs(prev => Math.max(prev - 10, 10));
  };

  // Handle toggling the sort order between newest and oldest
  const handleToggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };
  
  const handleRefresh = async () => {
    // Show confirmation dialog first
    setConfirmRefresh(true);
  };

  const confirmRefreshData = async () => {
      try {
        setIsRefreshing(true);
        console.log("Manually refreshing job data...");

        // Reset any search term to show all jobs
        setSearchTerm('');
        setActiveFilters({ search: '', status: '', category_uuid: '', type: '' });

        // Force reload with timestamp to prevent caching
        if (useRoleBasedFiltering && userRole) {
          const filters = activeTab !== 'all' ? { status: activeTab } : {};
          await fetchJobsByRole(userRole, filters, true);
        } else {
          await fetchJobs(1, activeTab, true);
        }

        // Reset visible jobs to default
        setVisibleJobs(10);

        console.log("Job data refreshed successfully");

        // Close the confirmation dialog
        setConfirmRefresh(false);
      } catch (error) {
        console.error('Error refreshing jobs:', error);
        setConfirmRefresh(false);
      } finally {
        setIsRefreshing(false);
      }
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewJob({ ...newJob, [name]: value });
    };    // Fixed handler for select dropdowns
    const handleSelectChange = (name, value) => {
      setNewJob({ ...newJob, [name]: value });
    };    // Handler for location selection
    const handleLocationSelect = (locationUuid) => {
      setSelectedLocationUuid(locationUuid);
      setNewJob(prev => ({ ...prev, location_uuid: locationUuid }));
    };// When a client is selected, use their UUID as both company UUID and created_by_staff_uuid
    const handleClientChange = (value) => {
      setNewJob({
        ...newJob,
        company_uuid: value,
        created_by_staff_uuid: value // Using client UUID for staff UUID as requested
      });
      
      // Clear any previously selected location when client changes
      setSelectedLocationUuid('');
      setNewJob(prev => ({
        ...prev,
        location_uuid: ''
      }));
    };    const handleCreateJob = async (e) => {
      e.preventDefault();

      // Validate required fields - check both selectedLocationUuid and newJob.location_uuid
      const locationUuid = selectedLocationUuid || newJob.location_uuid;
      if (!newJob.company_uuid || !newJob.job_description || !locationUuid) {
        alert("Please fill in all required fields");
        return;
      }      try {
        setIsCreatingJob(true);

        // Use the validated location UUID
        const finalLocationUuid = selectedLocationUuid || newJob.location_uuid;

        // Prepare payload to match ServiceM8 API format - removed uuid and generated_job_id
        const payload = {
          active: 1,
          created_by_staff_uuid: newJob.created_by_staff_uuid, // This is the client UUID
          company_uuid: newJob.company_uuid,
          date: newJob.date,
          job_description: newJob.job_description,
          location_uuid: finalLocationUuid,
          status: newJob.status,
          work_done_description: newJob.work_done_description,
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
        // Add category_uuid if selected
        if (newJob.category_uuid && newJob.category_uuid !== 'none') {
          payload.category_uuid = newJob.category_uuid;
        }

        console.log('Creating job with payload:', payload);
        const response = await axios.post(API_ENDPOINTS.JOBS.CREATE, payload);
        console.log('Job created successfully:', response.data);

        // Force refresh jobs list with the current tab and close dialog
        // Use forceRefresh=true to ensure we get fresh data
        await fetchJobs(1, activeTab, true);
        setIsDialogOpen(false);

        // Clear search term to make it easier to see new job
        setSearchTerm('');        // Reset form for next use
        setNewJob({
          created_by_staff_uuid: '',
          date: new Date().toISOString().split('T')[0],
          company_uuid: '',
          job_description: '',
          location_uuid: '',
          status: 'Quote',
          work_done_description: '',
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
        
        // Clear selected location
        setSelectedLocationUuid('');
      } catch (error) {
        console.error('Error creating job:', error);
        alert(`Error creating job: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsCreatingJob(false);
      }
    };
    const handleViewJob = (jobId) => {
      navigate(`/admin/jobs/${jobId}`);
    };    const handleViewDetails = async (job) => {
      setSelectedJob(job);
      setJobClientName("Unknown Client"); // Reset client name

      // Fetch the client name who created the job
      const creatorUuid = job.company_uuid || job.created_by_staff_uuid;
      if (creatorUuid) {
        try {
          // Import and use the client utility function
          const { getClientNameByUuid } = await import('@/utils/clientUtils');
          const clientName = await getClientNameByUuid(creatorUuid);
          setJobClientName(clientName);
        } catch (error) {
          console.error("Error fetching client name:", error);
          setJobClientName("Unknown Client");
        }
      }

      // Fetch attachments for the selected job
      const jobId = job.uuid || job.id;
      if (jobId) {
        fetchAttachments(jobId);
      }
    };// Handle job status update
    const handleStatusUpdate = async () => {
      if (!selectedJob || !selectedStatus || selectedStatus === selectedJob.status) {
        return;
      } try {
        setIsUpdatingStatus(true);
        const response = await axios.put(
          `${API_URL}/fetch/jobs/${selectedJob.uuid}/status`,
          {
            status: selectedStatus,
            userId: 'admin-user'
          }
        );

        if (response.data.success) {
          // Update the job in the local state
          setSelectedJob(prev => ({ ...prev, status: selectedStatus }));

          // Refresh the jobs list to reflect the change
          await fetchJobs(1, activeTab, true);

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
    // Remove the generateUUID function since ServiceM8 will handle job ID generation

    // Format file size
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date for display - removes the time part (00:00:00)
    const formatDate = (dateString) => {
      if (!dateString) return '...';
      // Format date with month, day, and year but no time/seconds
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

    // Handle file upload
    const handleFileUpload = async () => {
      if (!selectedFile || !selectedJob) return;

      try {
        setFileUploading(true);

        // Get admin info for the upload
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userName = userInfo.name || userInfo.email || 'Admin';

        // Create form data
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userType', 'admin');
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
        }
      } catch (error) {
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
        // Add this file to downloading set
        setDownloadingFiles(prev => new Set(prev).add(attachmentId));

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
      } finally {
        // Remove from downloading set
        setDownloadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(attachmentId);
          return newSet;
        });
      }
    };

    // Handle delete attachment
    const handleDeleteAttachment = async (attachmentId) => {
      if (!attachmentId || !selectedJob) return;

      if (!confirm('Are you sure you want to delete this attachment? This action cannot be undone.')) {
        return;
      }

      try {
        const response = await axios.delete(API_ENDPOINTS.ATTACHMENTS.DELETE(attachmentId));

        if (response.data && response.data.success) {
          // Refresh attachments list
          await fetchAttachments(selectedJob.uuid || selectedJob.id);
        }
      } catch (error) {
        console.error('Error deleting attachment:', error);
        alert('Failed to delete attachment. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Job Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (open) {
              // Increment trigger to refresh locations when dialog opens
              setLocationRefreshTrigger(prev => prev + 1);
              // Clear any previously selected location
              setSelectedLocationUuid('');
            }
          }}>
            <DialogTrigger asChild>
              <Button>Create New Job</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
                <DialogDescription>
                  Enter the details for the new job. This will create a job in ServiceM8.
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
                  </div>                  <div className="grid gap-2">
                    <Label htmlFor="location_uuid">Service Location</Label>
                    <LocationSelector
                      clientUuid={newJob.company_uuid}
                      selectedLocationUuid={selectedLocationUuid}
                      onLocationSelect={handleLocationSelect}
                      refreshTrigger={locationRefreshTrigger}
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
                  </div>                <div className="grid gap-2">
                    <Label htmlFor="category_uuid">Category</Label>
                    <Select
                      value={newJob.category_uuid}
                      onValueChange={(value) => handleSelectChange('category_uuid', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.uuid} value={category.uuid}>
                            {category.name} ({category.category_type || 'General'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            <div className="flex flex-col space-y-4 mt-2">            {useRoleBasedFiltering ? (
              // Use advanced JobFilters for role-based filtering
              <JobFilters
                userRole={userRole}
                onFiltersChange={handleFiltersChange}
                currentFilters={activeFilters}
                className="mb-4"
                showSavedFilters={true}
              />
            ) : (
              // Use simple tabs and search for Administrators
              <>
                <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="all">All Jobs</TabsTrigger>
                    <TabsTrigger value="Quote">Quotes</TabsTrigger>
                    <TabsTrigger value="Work Order">Work Orders</TabsTrigger>
                    <TabsTrigger value="In Progress">In Progress</TabsTrigger>
                    <TabsTrigger value="Completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="w-full">                  <Input
                    className="w-full"
                    placeholder="Search jobs by job number, description, or address..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </>
            )}
            </div>
          </CardHeader>
          <CardContent>            <div className="overflow-x-auto">              <table className="w-full text-sm">                <thead>                <tr className="border-b">
                  <th className="py-3 text-left">Job Number</th>
                  <th className="py-3 text-left">Client Name</th>
                  <th className="py-3 text-left">Description</th>
                  <th className="py-3 text-left">Address</th>
                  <th className="py-3 text-left">Category</th>
                  <th className="py-3 text-left">Status</th>
                  <th 
                    className="py-3 text-left cursor-pointer hover:bg-gray-50"
                    onClick={handleToggleSortOrder}
                  >
                    Created {sortOrder === 'desc' ? '▼' : '▲'}
                  </th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>              <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="py-4 text-center">Loading...</td></tr>
                  ) : filteredJobs.length > 0 ? (
                    displayedJobs.map((job, index) => {
                      const clientUuid = job.company_uuid || job.created_by_staff_uuid;
                      const clientName = jobClientNames[clientUuid] || 'Loading...';
                      
                      return (
                        <tr key={job.uuid} className="border-b">
                          <td className="py-3">                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {getJobNumber(job)}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="font-medium text-blue-700">
                              {clientName}
                            </span>
                          </td>
                          <td className="py-3">{job.job_description?.slice(0, 40)}...</td>
                          <td className="py-3">
                            <span className="text-gray-600 text-xs">
                              {formatJobAddress(job).slice(0, 30)}...
                            </span>
                          </td>
                          <td className="py-3">
                            {job.category_name ? (
                              <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                {job.category_name}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">No Category</span>
                            )}
                          </td>
                          <td className="py-3">                            <span className={`px-2 py-1 rounded text-xs ${job.status === 'Quote'
                                ? 'bg-orange-100 text-orange-800'
                                : job.status === 'Work Order'
                                  ? 'bg-blue-100 text-blue-800'
                                  : job.status === 'In Progress'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-green-100 text-green-800'
                              }`}>                              {job.status}
                            </span>
                          </td>
                          <td className="py-3">{formatDate(job.date)}</td>
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
                      );
                    })                  ) : (
                    <tr>
                      <td colSpan="8" className="py-4 text-center text-muted-foreground">
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
        </Card>      {selectedJob && (<Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>          <DialogContent className="max-h-[95vh] overflow-y-auto max-w-[98vw] md:max-w-6xl lg:max-w-7xl w-full p-3 md:p-6 rounded-lg">            <DialogHeader className="border-b pb-3 md:pb-4">
            <DialogTitle className="text-lg md:text-2xl font-bold truncate">
              Job by {jobClientName}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              {selectedJob.job_description || 'No description available'}
            </DialogDescription>
          </DialogHeader>
            <Tabs defaultValue="details" className="mt-3 md:mt-4">
              <TabsList className="w-full flex-wrap gap-1">
                <TabsTrigger value="details" className="text-xs md:text-base flex-1 md:flex-none">Details</TabsTrigger>
                <TabsTrigger value="chat" className="relative text-xs md:text-base flex-1 md:flex-none">
                  <div className="flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Chat
                  </div>
                </TabsTrigger>
                <TabsTrigger value="attachments" className="text-xs md:text-base flex-1 md:flex-none">Attachments</TabsTrigger>
              </TabsList>                <TabsContent value="details" className="p-0 mt-3 md:mt-4">                <div className="grid gap-3 md:gap-5">                <div className="space-y-1 md:space-y-2 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Label className="font-bold text-sm md:text-base text-blue-800">Client Information</Label>
                  <p className="text-sm md:text-base font-medium bg-white p-2 rounded border">{jobClientName}</p>
                  <div className="mt-1">
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                  <Label className="font-bold text-xs md:text-sm">Job Description</Label>
                  <div className="max-h-28 md:max-h-48 overflow-y-auto bg-white p-2 rounded border border-gray-200">
                    <p className="text-xs md:text-sm whitespace-pre-wrap">{selectedJob.job_description}</p>
                  </div>
                </div><div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                  <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                    <Label className="font-bold text-xs md:text-sm">Status</Label>                    <span className={`px-2 py-1 rounded text-xs inline-block ${selectedJob.status === 'Quote'
                        ? 'bg-orange-100 text-orange-800'
                        : selectedJob.status === 'Work Order'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedJob.status === 'In Progress'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                      {selectedJob.status}
                    </span>
                  </div>
                  <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                    <Label className="font-bold text-xs md:text-sm">Active</Label>
                    <p className="text-xs md:text-sm">{selectedJob.active ? 'Yes' : 'No'}</p>
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
                </div><div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                  <Label className="font-bold text-xs md:text-sm">Service Address</Label>
                  <p className="text-xs md:text-sm break-words">{selectedJob.job_address || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-5">
                  <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                    <Label className="font-bold text-xs md:text-sm">Created Date</Label>
                    <p className="text-xs md:text-sm">{formatDate(selectedJob.date)}</p>
                  </div>
                  <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                    <Label className="font-bold text-xs md:text-sm">Edit Date</Label>
                    <p className="text-xs md:text-sm">{selectedJob.edit_date || 'N/A'}</p>
                  </div>
                </div>

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

                <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                  <Label className="font-bold text-xs md:text-sm">Payment Details</Label>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                      <p><span className="font-semibold">Amount:</span> ${selectedJob.payment_amount || '0.00'}</p>
                      <p><span className="font-semibold">Method:</span> {selectedJob.payment_method || 'N/A'}</p>
                      <p><span className="font-semibold">Date:</span> {selectedJob.payment_date && selectedJob.payment_date !== '0000-00-00 00:00:00' ? formatDate(selectedJob.payment_date) : 'N/A'}</p>
                      <p><span className="font-semibold">Status:</span> {selectedJob.payment_processed ? 'Processed' : 'Not Processed'}</p>
                    </div>
                  </div>
                </div>

                {selectedJob.purchase_order_number && (
                  <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                    <Label className="font-bold text-xs md:text-sm">Purchase Order Number</Label>
                    <p className="text-xs md:text-sm break-words">{selectedJob.purchase_order_number}</p>
                  </div>
                )}
              </div>
              </TabsContent>

              <TabsContent value="chat" className="p-0 mt-6">
                <AdminChatRoom jobId={selectedJob.uuid || selectedJob.id} />
              </TabsContent>
              <TabsContent value="attachments" className="p-0 mt-3 md:mt-4">
                <Card className="border rounded-lg shadow-sm">
                  <CardHeader className="py-3 px-3 md:px-4 md:py-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <CardTitle className="flex items-center text-base md:text-lg">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                        Attachments
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={() => setIsUploadingFile(true)}
                        className="text-xs md:text-sm h-8"
                      >
                        Upload File
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 py-2 md:p-4">
                    {isUploadingFile && (
                      <div className="mb-4 md:mb-6 p-2 md:p-4 border rounded-md bg-gray-50">
                        <Label htmlFor="fileUpload" className="mb-1 md:mb-2 block text-xs md:text-sm font-medium">Upload File</Label>
                        <Input
                          id="fileUpload"
                          type="file"
                          onChange={handleFileChange}
                          className="mb-3 md:mb-4 text-xs md:text-sm"
                        />
                        <div className="text-xs md:text-sm text-amber-600 mb-3 md:mb-4 flex items-center bg-amber-50 p-2 rounded-md">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 flex-shrink-0">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                          <span>File size must be less than 9MB to ensure successful upload</span>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsUploadingFile(false);
                              setSelectedFile(null);
                            }}
                            disabled={fileUploading}
                            className="text-xs md:text-sm h-8"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleFileUpload}
                            disabled={!selectedFile || fileUploading}
                            className="text-xs md:text-sm h-8"
                          >
                            {fileUploading ? 'Uploading...' : 'Upload'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {attachmentsLoading ? (
                      <div className="py-6 md:py-8 flex justify-center">
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded"></div>
                              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : attachments.length > 0 ? (
                      <div className="space-y-3 md:space-y-4">
                        {attachments.map((file) => {
                          const getFileColor = () => {
                            const ext = file.fileName.split('.').pop().toLowerCase();
                            if (['pdf'].includes(ext)) return 'text-red-600';
                            if (['doc', 'docx'].includes(ext)) return 'text-blue-600';
                            if (['xls', 'xlsx'].includes(ext)) return 'text-green-600';
                            if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'text-purple-600';
                            if (['zip', 'rar'].includes(ext)) return 'text-amber-600';
                            return 'text-gray-600';
                          };

                          return (
                            <div
                              key={file.id}
                              className="p-3 md:p-4 border rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                            >
                              <div className="flex items-start gap-3 w-full md:w-auto">
                                <FileText className={`h-6 w-6 md:h-8 md:w-8 flex-shrink-0 ${getFileColor()}`} />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-sm md:text-base break-all">{file.fileName}</p>
                                  <p className="text-xs md:text-sm text-muted-foreground">
                                    {formatFileSize(file.fileSize)} •
                                    Uploaded by {file.uploadedBy} •
                                    {new Date(file.uploadTimestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 w-full md:w-auto">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1 flex-1 md:flex-none justify-center"
                                  onClick={() => handleDownloadFile(file.id, file.fileName)}
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="hidden md:inline">Download</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="flex items-center gap-1 flex-1 md:flex-none justify-center"
                                  onClick={() => handleDeleteAttachment(file.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 md:py-12 text-center">
                        <FileText className="h-8 w-8 md:h-12 md:w-12 mx-auto text-gray-400 mb-2 md:mb-3" />
                        <p className="text-sm md:text-base text-muted-foreground">No attachments found for this job</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 md:mt-4"
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

            <DialogFooter className="border-t pt-4 mt-4">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
            </DialogFooter>          </DialogContent>
        </Dialog>
        )}

        {/* Refresh Confirmation Dialog */}
        <Dialog open={confirmRefresh} onOpenChange={setConfirmRefresh}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refresh Job Data</DialogTitle>
              <DialogDescription>
                This will reload all job data from the server. This may take a moment.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmRefresh(false)}>
                Cancel
              </Button>
              <Button onClick={confirmRefreshData} disabled={isRefreshing}>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </DialogFooter>
          </DialogContent>        </Dialog>
      </div>
    );
};

export default AdminJobs;