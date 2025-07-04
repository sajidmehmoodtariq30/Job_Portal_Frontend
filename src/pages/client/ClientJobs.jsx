import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/card';
import { Button } from '../../components/UI/button';
import { Badge } from '../../components/UI/badge';
import { Input } from '../../components/UI/input';
import { Label } from '../../components/UI/label';
import { Textarea } from '../../components/UI/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/UI/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/UI/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/UI/select';
import SearchableSelect from '../../components/UI/SearchableSelect';
import { Separator } from '../../components/UI/separator';
import { ScrollArea } from '../../components/UI/scroll-area';
import { Alert, AlertDescription } from '../../components/UI/alert';
import { useToast } from '../../hooks/use-toast';
import { useClientAssignment } from '../../context/ClientAssignmentContext';
import ClientAssignmentGuard from '../../components/ClientAssignmentGuard';
import { API_URL, API_ENDPOINTS } from '../../lib/apiConfig';
import ChatRoom from '../../components/UI/client/ChatRoom';
import NotesTab from '../../components/UI/NotesTab';
import { 
  PlusIcon, 
  CalendarIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  DollarSignIcon,
  ClockIcon,
  EyeIcon,
  UploadIcon,
  FileIcon,
  Trash2Icon,
  InfoIcon,
  MessageSquareIcon,
  StickyNoteIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react';

const ClientJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [isJobDetailsDialogOpen, setIsJobDetailsDialogOpen] = useState(false);
  const [newJobFile, setNewJobFile] = useState(null);  const [detailsJobFile, setDetailsJobFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
    // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all'); // New site filter
  const [filteredJobs, setFilteredJobs] = useState([]);
  
  // Request flow states
  const [requestStep, setRequestStep] = useState('selection'); // 'selection', 'form'
  const [requestType, setRequestType] = useState(''); // 'quote', 'job', 'order'
  const [sites, setSites] = useState([]);
  const [siteSearchTerm, setSiteSearchTerm] = useState('');

const { toast } = useToast();
  const { getClientId, hasValidAssignment } = useClientAssignment();
  
  // Updated form state for new request flow
  const [newRequest, setNewRequest] = useState({
    // For Order (basic info)
    basic_description: '',
    
    // For Quote/Job (detailed form)
    site_uuid: '',
    description: '',
    site_contact_name: '',
    site_contact_number: '',
    email: '',
    purchase_order_number: '',
    work_start_date: '',
    work_completion_date: '',
    job_name: '',
    type: '' // quote, job, order
  });
  
  // Keep old newJob state for compatibility (if needed elsewhere)
  const [newJob, setNewJob] = useState({
    date: new Date().toISOString().split('T')[0], // Default to today
    job_description: '',
    work_done_description: '',
    location_uuid: '',
    category_uuid: '',
    status: 'Quote' // Default status
  });  useEffect(() => {
    console.log('🔄 ClientJobs useEffect - hasValidAssignment:', hasValidAssignment);
    if (hasValidAssignment) {
      console.log('✅ Client assignment is valid, fetching data...');
      fetchJobs();
      fetchCategories();
      fetchLocations();
      fetchSites(); // Now using backend endpoint, so we can fetch immediately
    } else {
      console.log('⏳ Waiting for valid client assignment...');
    }
  }, [hasValidAssignment]);

  // Debug sites state changes
  useEffect(() => {
    console.log('🏢 Sites state changed:', sites.length, 'sites available');
    if (sites.length > 0) {
      console.log('📍 First site:', sites[0]);
    }
  }, [sites]);

  // Filter jobs based on search term and status filter
  useEffect(() => {
    if (!Array.isArray(jobs)) {
      setFilteredJobs([]);
      return;
    }
    
    let filtered = jobs.filter(job => job && job.uuid); // Filter out null/undefined jobs

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        (job.job_name?.toLowerCase() || '').includes(search) ||
        (job.name?.toLowerCase() || '').includes(search) ||
        (job.job_description?.toLowerCase() || '').includes(search) ||
        (job.description?.toLowerCase() || '').includes(search) ||
        (job.location_address?.toLowerCase() || '').includes(search) ||
        (job.job_address?.toLowerCase() || '').includes(search) ||
        (job.job_number?.toString() || '').includes(search)
      );
    }

    // Apply status filter - exclude "Unsuccessful" from all filters
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => {
        const status = job.status?.toLowerCase() || '';
        
        // Always exclude unsuccessful jobs
        if (status === 'unsuccessful' || status === 'cancelled' || status === 'rejected') {
          return false;
        }
          switch (statusFilter) {
          case 'site':
            return status === 'site' || status === 'on site' || status === 'at site';
          case 'workorders':
            return status === 'work order' || status === 'workorder' || status === 'work-order';
          case 'quotes':
            return status === 'quote';
          case 'completed':
            return status === 'completed' || status === 'complete';
          default:
            return true;
        }
      });    } else {
      // Even for "all", exclude unsuccessful jobs
      filtered = filtered.filter(job => {
        const status = job.status?.toLowerCase() || '';
        return status !== 'unsuccessful' && status !== 'cancelled' && status !== 'rejected';
      });
    }

    // Apply site filter
    if (siteFilter !== 'all') {
      filtered = filtered.filter(job => {
        const jobAddress = job.location_address || job.job_address || '';
        const jobSiteName = getSiteName(job);
        
        // Find the selected site
        const selectedSite = sites.find(site => site.uuid === siteFilter || site.id === siteFilter);
        if (!selectedSite) return false;
        
        // Match by address or site name
        return jobAddress.toLowerCase().includes(selectedSite.address?.toLowerCase() || '') ||
               jobAddress.toLowerCase().includes(selectedSite.name?.toLowerCase() || '') ||
               jobSiteName.toLowerCase().includes(selectedSite.name?.toLowerCase() || '');
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, siteFilter, sites]);const fetchJobs = async () => {
    try {
      const clientId = getClientId();
      const response = await fetch(`${API_URL}/fetch/jobs/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
        if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      setJobs(data || []);
    } catch (error) {
      setError('Failed to load jobs');
      toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };  const fetchCategories = async () => {
    try {
      const clientId = getClientId();
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId || undefined
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };  const fetchLocations = async () => {
    try {
      const clientId = getClientId();
      console.log('🔍 Fetching locations - Client ID:', clientId);
      
      if (!clientId) {
        console.error('No client ID available for fetching locations');
        return;
      }
      
      console.log('📍 Making request to:', `${API_URL}/fetch/locations/client/${clientId}`);
      const response = await fetch(`${API_URL}/fetch/locations/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        }
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };  const fetchSites = async () => {
    try {
      const clientId = getClientId();
      console.log('🔍 Fetching sites from jobs - Client ID:', clientId);
      
      if (!clientId) {
        console.error('No client ID available for fetching sites');
        return;
      }
      
      const response = await fetch(API_ENDPOINTS.SITES.GET_FROM_JOBS(clientId), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch sites from jobs');
      const data = await response.json();
      console.log('🏢 Sites extracted from jobs:', data);
      
      setSites(data.sites || []);
      console.log('🏢 Sites state updated:', data.sites || []);
    } catch (error) {
      console.error('Failed to fetch sites from jobs:', error);
      setSites([]); // Ensure sites is always an array
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      const clientId = getClientId();
      const formData = new FormData();
      
      // Add job data
      Object.keys(newJob).forEach(key => {
        formData.append(key, newJob[key]);      });
      formData.append('clientId', clientId);
      formData.append('userId', clientId); // Add userId for backend compatibility
        // Add file if selected
      if (newJobFile) {
        formData.append('file', newJobFile);
      }      const response = await fetch(`${API_URL}/fetch/jobs/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        },
        body: formData
      });if (!response.ok) throw new Error('Failed to create job');

      const data = await response.json();
      setJobs(prev => [data.data, ...prev]);
        // Reset form
      setNewJob({
        date: new Date().toISOString().split('T')[0], // Default to today
        job_description: '',
        work_done_description: '',
        location_uuid: '',
        category_uuid: '',
        status: 'Quote' // Default status
      });
      setNewJobFile(null);
      setIsNewJobDialogOpen(false);
      
      toast({ title: 'Success', description: 'Job request submitted successfully' });    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit job request', variant: 'destructive' });
    }
  };

  // New request flow handlers
  const handleRequestTypeSelect = (type) => {
    setRequestType(type);
    setRequestStep('form');
    setNewRequest({
      basic_description: '',
      site_uuid: '',
      description: '',
      site_contact_name: '',
      site_contact_number: '',
      email: '',
      purchase_order_number: '',
      work_start_date: '',
      work_completion_date: '',
      job_name: '',
      type: type
    });
  };
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const clientId = getClientId();
      const formData = new FormData();
      
      // Find the selected site to get its address
      let selectedSite = null;
      if (newRequest.site_uuid) {
        selectedSite = sites.find(site => site.uuid === newRequest.site_uuid || site.id === newRequest.site_uuid);
      }
      
      // Add request data based on type
      if (requestType === 'order') {
        formData.append('type', 'order');
        formData.append('description', newRequest.basic_description);
        // Add site address if available
        if (selectedSite?.address) {
          formData.append('job_address', selectedSite.address);
          formData.append('location_address', selectedSite.address);
        }
      } else {
        // For quote and job - send all data but convert site_uuid to address
        Object.keys(newRequest).forEach(key => {
          if (newRequest[key] && key !== 'site_uuid') { // Skip site_uuid
            formData.append(key, newRequest[key]);
          }
        });
        
        // Add site address information instead of site_uuid
        if (selectedSite) {
          formData.append('job_address', selectedSite.address || selectedSite.name);
          formData.append('location_address', selectedSite.address || selectedSite.name);
          // Also add site name for reference
          formData.append('site_name', selectedSite.name);
        }
      }      formData.append('clientId', clientId);
      formData.append('userId', clientId); // Add userId for backend compatibility
      
      // Debug: Log site information being sent
      if (selectedSite) {
        console.log('🏢 Selected site for job request:', selectedSite);
        console.log('📍 Site address being sent:', selectedSite.address || selectedSite.name);
      }
      
      // Create JSON payload instead of FormData for now (TODO: Add file upload later)
      const requestPayload = {};
      
      // Convert FormData to JSON object
      for (let [key, value] of formData.entries()) {
        requestPayload[key] = value;
      }
      
      console.log('📤 Sending job request payload:', requestPayload);

      const response = await fetch(`${API_URL}/fetch/jobs/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'x-client-uuid': clientId
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) throw new Error('Failed to submit request');

      const data = await response.json();
      setJobs(prev => [data.data, ...prev]);
      
      // Reset everything
      setNewRequest({
        basic_description: '',
        site_uuid: '',
        description: '',
        site_contact_name: '',
        site_contact_number: '',
        email: '',
        purchase_order_number: '',
        work_start_date: '',
        work_completion_date: '',
        job_name: '',
        type: ''
      });
      setNewJobFile(null);
      setRequestStep('selection');
      setRequestType('');
      setIsNewJobDialogOpen(false);
      
      toast({ title: 'Success', description: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request submitted successfully` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit request', variant: 'destructive' });
    }
  };

  const resetRequestFlow = () => {
    setRequestStep('selection');
    setRequestType('');
    setNewRequest({
      basic_description: '',
      site_uuid: '',
      description: '',
      site_contact_name: '',
      site_contact_number: '',
      email: '',
      purchase_order_number: '',
      work_start_date: '',
      work_completion_date: '',
      job_name: '',
      type: ''
    });
    setNewJobFile(null);
    setSiteSearchTerm('');
  };  // Filter sites based on search term
  const filteredSites = (Array.isArray(sites) ? sites : []).filter(site => 
    site.name?.toLowerCase().includes(siteSearchTerm.toLowerCase()) ||
    site.address?.toLowerCase().includes(siteSearchTerm.toLowerCase())
  );
  
  // Debug logging for sites
  console.log('🏢 Sites state:', sites);
  console.log('🔍 Filtered sites:', filteredSites);

  const handleNewJobFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      setUploadError('');
      setNewJobFile(file);
    }
  };

  const handleDetailsFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedJob) return;

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }    setIsUploading(true);
    setUploadError('');

    try {
      const clientId = getClientId();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/attachments/upload/${selectedJob.uuid}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');      const data = await response.json();
      
      // Update the selected job with new attachment
      setSelectedJob(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), data.data]      }));

      // Update jobs list
      setJobs(prev => prev.map(job => 
        job.uuid === selectedJob.uuid 
          ? { ...job, attachments: [...(job.attachments || []), data.data] }
          : job
      ));      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);

      // Refresh attachments to ensure we have the latest data
      await fetchAttachments(selectedJob.uuid);

      toast({ title: 'Success', description: 'File uploaded successfully' });
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      setUploadError('Failed to upload file');
      toast({ title: 'Error', description: 'Failed to upload file', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  const handleDeleteAttachment = async (attachmentId) => {
    if (!selectedJob) return;

    try {
      const clientId = getClientId();
      const response = await fetch(
        `${API_URL}/api/attachments/${attachmentId}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'x-client-uuid': clientId
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete attachment');      // Update selected job
      setSelectedJob(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => (att.id || att._id) !== attachmentId)      }));

      // Update jobs list
      setJobs(prev => prev.map(job => 
        job.uuid === selectedJob.uuid 
          ? { ...job, attachments: job.attachments.filter(att => (att.id || att._id) !== attachmentId) }
          : job
      ));// Trigger refresh
      setRefreshTrigger(prev => prev + 1);

      // Refresh attachments to ensure we have the latest data
      await fetchAttachments(selectedJob.uuid);

      toast({ title: 'Success', description: 'Attachment deleted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete attachment', variant: 'destructive' });
    }  };

  // Function to refresh a specific job's data including attachments and notes
  const refreshJobData = async (jobId) => {
    try {
      const clientId = getClientId();
      if (!clientId) {
        console.error('No client ID available');
        return;
      }

      const response = await fetch(`${API_URL}/fetch/jobs/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const refreshedJob = result.find(job => job.uuid === jobId);
        if (refreshedJob) {
          setSelectedJob(refreshedJob);
          // Also update the job in the jobs list
          setJobs(prev => prev.map(job => 
            job.uuid === jobId ? refreshedJob : job
          ));
        }
      }    } catch (error) {
      console.error('Error refreshing job data:', error);
    }
  };
  // Fetch attachments for selected job
  const fetchAttachments = async (jobId) => {
    if (!jobId) return;

    try {
      setAttachmentsLoading(true);
      const clientId = getClientId();
      const response = await fetch(`${API_URL}/api/attachments/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Update the selected job with attachments
          setSelectedJob(prev => prev ? { ...prev, attachments: result.data } : null);
            // Also update the job in the jobs list
          setJobs(prev => prev.map(job => 
            job.uuid === jobId ? { ...job, attachments: result.data } : job
          ));
        }
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  // Function to handle opening job details dialog
  const handleViewJobDetails = async (job) => {
    setSelectedJob(job);
    setIsJobDetailsDialogOpen(true);
    // Trigger refresh for notes and attachments
    setRefreshTrigger(prev => prev + 1);
    // Fetch attachments for this specific job
    await fetchAttachments(job.uuid);
    // Refresh job data to ensure other data is current
    await refreshJobData(job.uuid);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return `$${parseInt(salary).toLocaleString()}`;
  };
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'quote': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'on hold': return 'bg-orange-100 text-orange-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  // Helper function to get site name for a job
  const getSiteName = (job) => {
    // Check if job exists
    if (!job) {
      return 'Site';
    }
    
    // First, check if the job already has a site name
    if (job.location_name || job.site_name) {
      return job.location_name || job.site_name;
    }
    
    // Try to find matching site by UUID
    if (job.location_uuid && sites.length > 0) {
      const matchingSite = sites.find(site => site.uuid === job.location_uuid || site.id === job.location_uuid);
      if (matchingSite) {
        return matchingSite.name;
      }
    }
      // Try to find matching site by address
    if (job.location_address && sites.length > 0) {
      const matchingSite = sites.find(site => 
        site.address === job.location_address || 
        site.name?.toLowerCase().includes(job.location_address?.toLowerCase())
      );
      if (matchingSite) {
        return matchingSite.name;
      }
    }
    
    // For ServiceM8 data, extract location from job_address
    if (job.job_address) {
      // Try to extract a meaningful site name from the address
      const addressParts = job.job_address.split(',');
      if (addressParts.length > 0) {
        // Use the first part as site name (usually building/location name)
        const siteName = addressParts[0].trim();
        if (siteName && siteName.length > 2) {
          return siteName;
        }
      }
    }
    
    // Try geo components for site name
    if (job.geo_city) {
      return job.geo_city;
    }

    // Fallback to job address or generic site name
    return job.location_address || job.job_address || 'Site';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="w-96">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ClientAssignmentGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600 mt-2">View & Manage all your jobs. </p>
          </div>
          
          <Dialog open={isNewJobDialogOpen} onOpenChange={(open) => {
            setIsNewJobDialogOpen(open);
            if (!open) resetRequestFlow();
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Request
              </Button>
            </DialogTrigger>            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {requestStep === 'selection' ? 'Select Request Type' : `New ${requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request`}
                </DialogTitle>
              </DialogHeader>              
              {requestStep === 'selection' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                    onClick={() => handleRequestTypeSelect('quote')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Quote</h3>
                      <p className="text-gray-600 text-sm">Request a detailed quote for your project</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500"
                    onClick={() => handleRequestTypeSelect('job')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BriefcaseIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Job</h3>
                      <p className="text-gray-600 text-sm">Submit a new job request with full details</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-500"
                    onClick={() => handleRequestTypeSelect('order')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClockIcon className="h-6 w-6 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Order</h3>
                      <p className="text-gray-600 text-sm">Quick order with basic information</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {requestStep === 'form' && requestType === 'order' && (
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="basic_description">How can we help? *</Label>
                    <Textarea
                      id="basic_description"
                      value={newRequest.basic_description}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, basic_description: e.target.value }))}
                      rows={4}
                      required
                      placeholder="Describe what you need help with..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order-file">Attach Files (Optional)</Label>
                    <Input
                      id="order-file"
                      type="file"
                      onChange={handleNewJobFileChange}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    {newJobFile && (
                      <p className="text-sm text-green-600">
                        Selected: {newJobFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setRequestStep('selection')}
                    >
                      Back
                    </Button>
                    <Button type="submit">Submit Order</Button>
                  </div>
                </form>
              )}

              {requestStep === 'form' && (requestType === 'quote' || requestType === 'job') && (
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="site_uuid">Site *</Label>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search sites..."
                        value={siteSearchTerm}
                        onChange={(e) => setSiteSearchTerm(e.target.value)}
                        className="w-full"
                      />                      {filteredSites.length > 0 ? (
                        <Select 
                          value={newRequest.site_uuid} 
                          onValueChange={(value) => setNewRequest(prev => ({ ...prev, site_uuid: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select site" />
                          </SelectTrigger>                          <SelectContent>
                            {filteredSites.map((site, index) => (
                              <SelectItem key={site.uuid || site._id || `site-${index}`} value={site.uuid || site._id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{site.name}</span>
                                  {site.address && <span className="text-sm text-gray-500">{site.address}</span>}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center justify-center p-3 border border-gray-200 rounded-md bg-gray-50">
                          <p className="text-gray-500 text-sm">
                            {siteSearchTerm ? 'No sites found matching search' : 'No sites available'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">How can we help? *</Label>
                    <Textarea
                      id="description"
                      value={newRequest.description}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                      placeholder="Describe the work needed..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site_contact_name">Site Contact Name</Label>
                      <Input
                        id="site_contact_name"
                        value={newRequest.site_contact_name}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, site_contact_name: e.target.value }))}
                        placeholder="Contact person name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="site_contact_number">Site Contact Number</Label>
                      <Input
                        id="site_contact_number"
                        value={newRequest.site_contact_number}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, site_contact_number: e.target.value }))}
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newRequest.email}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="purchase_order_number">Purchase Order Number</Label>
                      <Input
                        id="purchase_order_number"
                        value={newRequest.purchase_order_number}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, purchase_order_number: e.target.value }))}
                        placeholder="PO Number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="work_start_date">Work Request Start Date</Label>
                      <Input
                        id="work_start_date"
                        type="date"
                        value={newRequest.work_start_date}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, work_start_date: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="work_completion_date">Work Request Completion Date</Label>
                      <Input
                        id="work_completion_date"
                        type="date"
                        value={newRequest.work_completion_date}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, work_completion_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job_name">Job Name</Label>
                    <Input
                      id="job_name"
                      value={newRequest.job_name}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, job_name: e.target.value }))}
                      placeholder="Name for this job"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="request-file">Attach Files (Optional)</Label>
                    <Input
                      id="request-file"
                      type="file"
                      onChange={handleNewJobFileChange}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    />
                    {newJobFile && (
                      <p className="text-sm text-green-600">
                        Selected: {newJobFile.name}
                      </p>
                    )}
                    {uploadError && (
                      <p className="text-sm text-red-600">{uploadError}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setRequestStep('selection')}
                    >
                      Back
                    </Button>
                    <Button type="submit">Submit {requestType.charAt(0).toUpperCase() + requestType.slice(1)}</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog></div>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search jobs by title, description, location, or job number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
              {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-gray-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="site">Site</SelectItem>
                  <SelectItem value="workorders">Work Orders</SelectItem>
                  <SelectItem value="quotes">Quotes</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>            {/* Site Filter */}
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-600" />
              <SearchableSelect
                value={siteFilter}
                onValueChange={setSiteFilter}
                placeholder="Filter by site"
                searchPlaceholder="Search sites..."
                className="w-64"
                displayKey="name"
                valueKey="value"
                searchKeys={['name', 'address']}
                items={[
                  { value: 'all', name: 'All Sites', address: '' },
                  ...sites.map((site) => {
                    // Count jobs for this site
                    const jobCount = jobs.filter(job => {
                      const jobAddress = job.location_address || job.job_address || '';
                      const jobSiteName = getSiteName(job);
                      return jobAddress.toLowerCase().includes(site.address?.toLowerCase() || '') ||
                             jobAddress.toLowerCase().includes(site.name?.toLowerCase() || '') ||
                             jobSiteName.toLowerCase().includes(site.name?.toLowerCase() || '');
                    }).length;
                    
                    return {
                      value: site.uuid || site.id,
                      name: site.name,
                      address: site.address || '',
                      jobCount: jobCount
                    };
                  })
                ]}
                renderItem={(item) => (
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      {item.address && <span className="text-xs text-gray-500">{item.address}</span>}
                    </div>
                    {item.jobCount !== undefined && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.jobCount}
                      </Badge>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
            {/* Results Summary */}          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {filteredJobs.length} of {jobs.filter(job => {
                const status = job.status?.toLowerCase() || '';
                return status !== 'unsuccessful' && status !== 'cancelled' && status !== 'rejected';
              }).length} jobs
              {searchTerm && ` matching "${searchTerm}"`}
              {statusFilter !== 'all' && ` with status "${
                statusFilter === 'workorders' ? 'Work Orders' :
                statusFilter === 'quotes' ? 'Quotes' :
                statusFilter === 'site' ? 'Site' :
                statusFilter === 'completed' ? 'Completed' :
                statusFilter
              }"`}
              {siteFilter !== 'all' && ` at "${
                sites.find(site => site.uuid === siteFilter || site.id === siteFilter)?.name || 'Selected Site'
              }"`}
            </p>
            {(searchTerm || statusFilter !== 'all' || siteFilter !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSiteFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>        {filteredJobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              {jobs.length === 0 ? (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-600 mb-4">Start by creating your first job posting</p>
                  <Button onClick={() => setIsNewJobDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs match your criteria</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? `No jobs found matching "${searchTerm}"` : 'No jobs found with the selected filters'}
                  </p>                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSiteFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>        ) : (          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">            {filteredJobs.filter(job => job && job.uuid).map((job) => {
              // Debug log to check job data
              console.log('Job data:', job);
              console.log('PO Number:', job.purchase_order_number);
              
              return (
              <Card key={job.uuid} className="hover:shadow-lg transition-shadow"><CardHeader className="pb-3">
                  {/* Site Name prominently at top */}
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    {getSiteName(job)}
                  </div>
                  <div className="flex justify-between items-start">                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {job.customfield_job_name || job.job_name || job.name || job.job_description?.substring(0, 40) + '...' || `Job #${job.generated_job_id || job.job_number}` || 'New Job'}
                    </CardTitle>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status || 'Active'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Job Description */}
                  <p className="text-gray-600 line-clamp-3 text-sm">
                    {job.job_description || job.description || 'No description available'}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    {/* Site Location */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="line-clamp-1">{job.location_address || job.job_address || 'Location not specified'}</span>
                    </div>                    {/* PO Number (always show for debugging) */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileIcon className="h-4 w-4 flex-shrink-0" />
                      <span>PO: {job.purchase_order_number || job.po_number || 'Not specified'}</span>
                    </div>
                    
                    {/* Job Number */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <BriefcaseIcon className="h-4 w-4 flex-shrink-0" />
                      <span>Job: {job.generated_job_id || job.job_number || job.uuid?.substring(0, 8) || 'N/A'}</span>
                    </div>
                    
                    {/* Created Date */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                      <span>Created {formatDate(job.date || job.created_date || job.createdAt)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewJobDetails(job)}
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>                </CardContent>
              </Card>
              );
            })}
          </div>
        )}

        {/* Job Details Dialog */}
        <Dialog open={isJobDetailsDialogOpen} onOpenChange={setIsJobDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                <div className="space-y-1">
                  <div className="text-sm text-blue-600 font-medium">
                    {getSiteName(selectedJob)}
                  </div>
                  <div>
                    {selectedJob?.job_name || selectedJob?.title || selectedJob?.name || 'Job Details'}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedJob && (              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="notes">
                    <div className="flex items-center gap-2">
                      <StickyNoteIcon className="h-4 w-4" />
                      Notes
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="chat">
                    <div className="flex items-center gap-2">
                      <MessageSquareIcon className="h-4 w-4" />
                      Chat
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="attachments">
                    Attachments ({selectedJob.attachments?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Job Information</h3>                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-gray-500" />
                            <span>{selectedJob.location_address || selectedJob.job_address || 'Location not specified'}</span>
                          </div>
                          
                          {/* Job Number */}
                          <div className="flex items-center gap-2">
                            <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                            <span>Job: {selectedJob.generated_job_id || selectedJob.job_number || selectedJob.uuid?.substring(0, 8) || 'N/A'}</span>
                          </div>
                          
                          {/* PO Number (if available) */}
                          {(selectedJob.purchase_order_number || selectedJob.po_number) && (
                            <div className="flex items-center gap-2">
                              <FileIcon className="h-4 w-4 text-gray-500" />
                              <span>PO: {selectedJob.purchase_order_number || selectedJob.po_number}</span>
                            </div>
                          )}
                          
                          {/* Total Amount (if available) */}
                          {(selectedJob.total_amount || selectedJob.salary) && (
                            <div className="flex items-center gap-2">
                              <DollarSignIcon className="h-4 w-4 text-gray-500" />
                              <span>{formatSalary(selectedJob.total_amount || selectedJob.salary)}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span>Created {formatDate(selectedJob.date || selectedJob.created_date || selectedJob.createdAt)}</span>
                          </div>
                        </div>
                      </div><div>
                        <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                        <Badge variant="secondary">{selectedJob.category || 'General'}</Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                        <Badge className={getStatusColor(selectedJob.status)}>
                          {selectedJob.status || 'Active'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                        <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg border">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedJob.job_description || selectedJob.description || 'No description available'}
                          </p>
                        </div>
                      </div>

                      {selectedJob.requirements && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedJob.requirements}
                          </p>
                        </div>
                      )}                      {selectedJob.benefits && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Benefits</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedJob.benefits}
                            </p>
                          </div>
                        </div>                      )}

                      {/* Location Details */}
                      {(selectedJob.geo_street || selectedJob.geo_city) && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Location Details</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border">                            <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
                              {selectedJob.geo_street && (
                                <p key="street"><span className="font-medium">Street:</span> {selectedJob.geo_number ? `${selectedJob.geo_number} ${selectedJob.geo_street}` : selectedJob.geo_street}</p>
                              )}
                              {selectedJob.geo_city && <p key="city"><span className="font-medium">City:</span> {selectedJob.geo_city}</p>}
                              {selectedJob.geo_state && <p key="state"><span className="font-medium">State:</span> {selectedJob.geo_state}</p>}
                              {selectedJob.geo_postcode && <p key="postcode"><span className="font-medium">Postcode:</span> {selectedJob.geo_postcode}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>                <TabsContent value="notes" className="space-y-4">
                  <NotesTab 
                    jobId={selectedJob.uuid || selectedJob.id} 
                    userType="client" 
                    refreshTrigger={refreshTrigger}
                  />
                </TabsContent>

                <TabsContent value="chat" className="space-y-4">
                  <ChatRoom jobId={selectedJob.uuid || selectedJob.id} />
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="details-file-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">
                            Click to upload
                          </span>
                          <span className="text-gray-600"> or drag and drop</span>
                        </Label>
                        <Input
                          id="details-file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleDetailsFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          disabled={isUploading}
                        />
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {uploadError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {uploadError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {isUploading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </div>                  )}

                  {attachmentsLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading attachments...</p>
                    </div>
                  )}

                  {!attachmentsLoading && selectedJob.attachments?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                      <ScrollArea className="max-h-60">                        <div className="space-y-2">                          {selectedJob.attachments && selectedJob.attachments.length > 0 ? selectedJob.attachments.map((attachment, index) => (
                            <div
                              key={attachment.id || attachment._id || `attachment-${index}`}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileIcon className="h-5 w-5 text-gray-500" />                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {attachment.fileName || attachment.originalName || attachment.filename || 'Unknown file'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)}KB` : attachment.size ? `${Math.round(attachment.size / 1024)}KB` : 'File size unknown'}
                                  </p>
                                </div>
                              </div>                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAttachment(attachment.id || attachment._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          )) : (
                            <div className="text-center py-4">
                              <FileIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No attachments</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>                    </div>
                  )}

                  {!attachmentsLoading && (!selectedJob.attachments || selectedJob.attachments.length === 0) && (
                    <div className="text-center py-8">
                      <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No attachments uploaded yet</p>
                      <p className="text-sm text-gray-400 mt-2">Upload files using the form above</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ClientAssignmentGuard>
  );
};

export default ClientJobs;
