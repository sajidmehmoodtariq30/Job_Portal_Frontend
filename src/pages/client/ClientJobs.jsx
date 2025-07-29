import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/card';
import { Button } from '../../components/UI/button';
import { Badge } from '../../components/UI/badge';
import { Input } from '../../components/UI/input';
import { Label } from '../../components/UI/label';
import { Textarea } from '../../components/UI/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/UI/dialog';
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
  FilterIcon,
  GridIcon,
  ListIcon
} from 'lucide-react';

// Import new attachment system
import { getAttachmentSystemName } from '../../config/attachmentConfig';
import { 
  uploadAttachment, 
  getJobAttachments, 
  triggerDownload, 
  deleteAttachment,
  validateFile,
  formatFileSize 
} from '../../services/attachmentService';

const ClientJobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [isJobDetailsDialogOpen, setIsJobDetailsDialogOpen] = useState(false);
  const [newJobFile, setNewJobFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false); const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [siteFilter, setSiteFilter] = useState(''); // Site filter from Sites page

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

  // Handle filters from navigation state (coming from Dashboard or Sites page)
  useEffect(() => {
    if (location.state?.siteFilter) {
      setSiteFilter(location.state.siteFilter);
      setSearchTerm(''); // Clear search term when site filter is applied
      console.log('🔍 Site filter set from navigation:', location.state.siteFilter);
    }

    // Handle dashboard navigation filters
    if (location.state?.filterByStatus) {
      const status = location.state.filterByStatus.toLowerCase();
      switch (status) {
        case 'quote':
          setStatusFilter('quotes');
          break;
        case 'work order':
        case 'in progress':
          setStatusFilter('workorders');
          break;
        case 'completed':
        case 'complete':
          setStatusFilter('completed');
          break;
        default:
          setStatusFilter('all');
      }
    }

    // Handle job number filter (for specific job navigation)
    if (location.state?.filterByJobNumber) {
      setSearchTerm(location.state.filterByJobNumber);
    }
  }, [location.state]);

  // Debug sites state changes
  useEffect(() => {
    console.log('🏢 Sites state changed:', sites.length, 'sites available');
    if (sites.length > 0) {
      console.log('📍 First site:', sites[0]);
    }
  }, [sites]);

  // Helper function to get site name for a job
  const getSiteName = useCallback((job) => {
    if (!job) return 'Site';

    console.log('🔍 getSiteName called for job:', {
      jobId: job.uuid || job.id,
      location_name: job.location_name,
      site_name: job.site_name,
      location_address: job.location_address,
      job_address: job.job_address,
      location_uuid: job.location_uuid,
      sitesAvailable: sites.length
    });

    // First, try to match with sites data using various job location fields
    if (sites.length > 0) {
      console.log('🏢 Available sites for matching:', sites.map(s => ({ uuid: s.uuid, name: s.name, address: s.address })));
      
      // Try to match by UUID first
      if (job.location_uuid) {
        const matchingSite = sites.find(site => site.uuid === job.location_uuid || site.id === job.location_uuid);
        if (matchingSite && matchingSite.name) {
          console.log('🎯 Found site by UUID:', matchingSite.name, 'for job:', job.uuid);
          return matchingSite.name;
        } else {
          console.log('❌ No site found by UUID:', job.location_uuid);
        }
      }

      // Try to match by comparing job's location data with site names and addresses
      const jobLocationFields = [
        job.location_name,
        job.site_name,
        job.location_address,
        job.job_address,
        job.billing_address
      ].filter(Boolean);

      console.log('🔍 Job location fields to match:', jobLocationFields);

      for (const field of jobLocationFields) {
        const matchingSite = sites.find(site => {
          if (!site.name && !site.address) return false;
          
          // Try exact match with site name
          if (site.name && site.name.toLowerCase() === field.toLowerCase()) {
            return true;
          }
          
          // Try exact match with site address
          if (site.address && site.address.toLowerCase() === field.toLowerCase()) {
            return true;
          }
          
          // Try partial matches with site name
          if (site.name && (
            site.name.toLowerCase().includes(field.toLowerCase()) || 
            field.toLowerCase().includes(site.name.toLowerCase())
          )) {
            return true;
          }
          
          // Try partial matches with site address
          if (site.address && (
            site.address.toLowerCase().includes(field.toLowerCase()) || 
            field.toLowerCase().includes(site.address.toLowerCase())
          )) {
            return true;
          }
          
          return false;
        });
        
        if (matchingSite && matchingSite.name) {
          console.log('🎯 Found site by field match:', matchingSite.name, 'from field:', field, 'for job:', job.uuid);
          return matchingSite.name;
        } else {
          console.log('❌ No site found for field:', field);
        }
      }
      
      console.log('❌ No site match found for job:', job.uuid, 'falling back to job fields');
    } else {
      console.log('⚠️ No sites available for matching, using job fields directly');
    }

    // Fallback to direct job fields if no site match found
    if (job.location_name) {
      console.log('📍 Using job.location_name:', job.location_name);
      return job.location_name;
    }
    if (job.site_name) {
      console.log('📍 Using job.site_name:', job.site_name);
      return job.site_name;
    }

    // Try to extract site name from job_address
    if (job.job_address) {
      const addressParts = job.job_address.split(',');
      if (addressParts.length > 0) {
        const siteName = addressParts[0].trim();
        if (siteName && siteName.length > 2) {
          console.log('📍 Extracted from job_address:', siteName);
          return siteName;
        }
      }
    }

    // Try other location fields
    if (job.geo_city) {
      console.log('📍 Using job.geo_city:', job.geo_city);
      return job.geo_city;
    }
    if (job.billing_address) {
      const addressParts = job.billing_address.split(',');
      if (addressParts.length > 0) {
        const siteName = addressParts[0].trim();
        if (siteName && siteName.length > 2) {
          console.log('📍 Extracted from billing_address:', siteName);
          return siteName;
        }
      }
    }

    // Fallback to available address fields
    const fallback = job.location_address || job.job_address || job.billing_address || 'Site';
    console.log('📍 Using fallback:', fallback);
    return fallback;
  }, [sites]);

  // Filter jobs based on search term and status filter
  useEffect(() => {
    if (!Array.isArray(jobs)) {
      setFilteredJobs([]);
      return;
    }

    let filtered = jobs.filter(job => job && job.uuid); // Filter out null/undefined jobs

    // Debug: Log all jobs and their site names
    console.log('🔍 All Jobs Debug:', jobs.map(job => ({
      id: job.uuid || job.id,
      siteName: getSiteName(job),
      status: job.status,
      location_address: job.location_address,
      job_address: job.job_address,
      site_name: job.site_name,
      location_name: job.location_name
    })));

    console.log('🔍 Filter State:', {
      siteFilter,
      searchTerm,
      statusFilter,
      totalJobs: jobs.length,
      filteredAfterNull: filtered.length
    });

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      const beforeSearch = filtered.length;
      filtered = filtered.filter(job =>
        (job.job_name?.toLowerCase() || '').includes(search) ||
        (job.name?.toLowerCase() || '').includes(search) ||
        (job.job_description?.toLowerCase() || '').includes(search) ||
        (job.description?.toLowerCase() || '').includes(search) ||
        (job.location_address?.toLowerCase() || '').includes(search) ||
        (job.job_address?.toLowerCase() || '').includes(search) ||
        (job.job_number?.toString() || '').includes(search)
      );
      console.log('🔍 After search filter:', { beforeSearch, afterSearch: filtered.length, searchTerm });
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
          case 'workorders':
            return status === 'work order' || status === 'workorder' || status === 'work-order' || status === 'in progress';
          case 'quotes':
            return status === 'quote' || status === 'pending';
          case 'completed':
            return status === 'completed' || status === 'complete' || status === 'finished' || status === 'done';
          default:
            return true;
        }
      });
      console.log('🔍 After status filter:', { statusFilter, afterStatus: filtered.length });
    } else {
      // For "all", only exclude truly unsuccessful jobs, but include completed ones
      const beforeStatus = filtered.length;
      filtered = filtered.filter(job => {
        const status = job.status?.toLowerCase() || '';
        return status !== 'unsuccessful' && status !== 'cancelled' && status !== 'rejected';
      });
      console.log('🔍 After status filter (all):', { beforeStatus, afterStatus: filtered.length });
    }

    // Apply site filter (from Sites page navigation)
    if (siteFilter) {
      const beforeSiteFilter = filtered.length;
      filtered = filtered.filter(job => {
        const jobSiteName = getSiteName(job).toLowerCase();
        const filterTerm = siteFilter.toLowerCase();

        // More flexible matching - check multiple job fields for site information
        const jobFields = [
          job.location_name?.toLowerCase() || '',
          job.site_name?.toLowerCase() || '',
          job.location_address?.toLowerCase() || '',
          job.job_address?.toLowerCase() || '',
          job.billing_address?.toLowerCase() || '',
          job.geo_city?.toLowerCase() || '',
          jobSiteName
        ].filter(field => field.length > 0); // Remove empty fields

        // Check if any job field contains the filter term or vice versa
        // Also try partial word matching for better flexibility
        const matches = jobFields.some(field => {
          // Exact matches
          if (field === filterTerm || field.includes(filterTerm) || filterTerm.includes(field)) {
            return true;
          }
          
          // Word-based matching - split both field and filter into words
          const fieldWords = field.split(/\s+/).filter(word => word.length > 2);
          const filterWords = filterTerm.split(/\s+/).filter(word => word.length > 2);
          
          // Check if any significant words match
          const wordMatch = fieldWords.some(fieldWord => 
            filterWords.some(filterWord => 
              fieldWord.includes(filterWord) || filterWord.includes(fieldWord)
            )
          );
          
          if (wordMatch) {
            console.log('🔍 Site Filter Word Match Found:', {
              jobId: job.uuid || job.id,
              matchingField: field,
              fieldWords,
              filterWords,
              filterTerm,
              jobSiteName
            });
            return true;
          }
          
          return false;
        });

        // Debug logging for jobs that don't match
        if (!matches) {
          console.log('🔍 Site Filter No Match:', {
            jobId: job.uuid || job.id,
            jobSiteName,
            filterTerm,
            availableFields: jobFields,
            job: {
              location_name: job.location_name,
              site_name: job.site_name,
              location_address: job.location_address,
              job_address: job.job_address,
              billing_address: job.billing_address,
              geo_city: job.geo_city
            }
          });
        }

        return matches;
      });
      console.log('🔍 After site filter:', { 
        siteFilter, 
        beforeSiteFilter, 
        afterSiteFilter: filtered.length,
        filteredOut: beforeSiteFilter - filtered.length
      });
      
      // If no jobs match the site filter, try a more lenient approach
      if (filtered.length === 0 && beforeSiteFilter > 0) {
        console.log('🔍 No exact site matches found, trying lenient matching...');
        
        // Reset to original filtered jobs and try a more lenient filter
        filtered = jobs.filter(job => job && job.uuid);
        
        // Apply status filter again
        filtered = filtered.filter(job => {
          const status = job.status?.toLowerCase() || '';
          return status !== 'unsuccessful' && status !== 'cancelled' && status !== 'rejected';
        });
        
        // Try very lenient site matching - just check if any part of the site name appears anywhere
        const filterWords = siteFilter.toLowerCase().split(/\s+/).filter(word => word.length > 2);
        
        filtered = filtered.filter(job => {
          const allJobText = [
            job.location_name,
            job.site_name,
            job.location_address,
            job.job_address,
            job.billing_address,
            job.geo_city,
            job.job_name,
            job.description,
            job.job_description
          ].filter(Boolean).join(' ').toLowerCase();
          
          return filterWords.some(word => allJobText.includes(word));
        });
        
        console.log('🔍 After lenient site filter:', filtered.length);
      }
    }

    // Sort by newest first (highest job number)
    filtered.sort((a, b) => {
      const jobNumA = parseInt(a.generated_job_id || a.job_number || '0');
      const jobNumB = parseInt(b.generated_job_id || b.job_number || '0');
      return jobNumB - jobNumA; // Descending order (newest first)
    });

    console.log('🔍 Final filtered jobs:', filtered.length);
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, statusFilter, siteFilter, getSiteName]);

  const fetchJobs = useCallback(async () => {
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
    } catch {
      setError('Failed to load jobs');
      toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [getClientId, toast]);

  const fetchSites = useCallback(async () => {
    try {
      const clientId = getClientId();
      console.log('🔍 Fetching sites for client - Client ID:', clientId);

      if (!clientId) {
        console.error('No client ID available for fetching sites');
        return;
      }

      // Use the same endpoint as ClientSites.jsx for consistency
      console.log('🔍 Using sites endpoint:', `${API_URL}/api/clients/${clientId}/sites`);

      const response = await fetch(`${API_URL}/api/clients/${clientId}/sites`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🏢 Sites API response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch sites');
      }

      let sitesData = data.sites || [];
      console.log('🏢 Raw sites data:', sitesData.length, sitesData);

      // Apply the same filtering as ClientSites.jsx - exclude shops but keep ones that match our jobs
      const filteredSites = sitesData.filter(site => {
        // Keep sites that don't have "Shop" in name, OR sites that have "Shop" followed by numbers (like "Shop 129")
        const hasShop = site.name && site.name.includes('Shop');
        const hasShopWithNumber = site.name && /Shop\s+\d+/.test(site.name);
        
        // Keep if no "Shop" or if it's "Shop" with numbers
        return !hasShop || hasShopWithNumber;
      });

      // Sort sites like ClientSites.jsx
      filteredSites.sort((a, b) => {
        // Parent companies (no parent_company_uuid) come first
        if (!a.parent_company_uuid && b.parent_company_uuid) return -1;
        if (a.parent_company_uuid && !b.parent_company_uuid) return 1;
        
        // Within each group, SkinKandy sites come first
        const aHasSkinKandy = a.name && a.name.toLowerCase().includes('skinkandy');
        const bHasSkinKandy = b.name && b.name.toLowerCase().includes('skinkandy');
        
        if (aHasSkinKandy && !bHasSkinKandy) return -1;
        if (!aHasSkinKandy && bHasSkinKandy) return 1;
        
        // Finally, sort alphabetically
        return (a.name || '').localeCompare(b.name || '');
      });

      console.log('🏢 Filtered and sorted sites:', filteredSites.length, filteredSites);
      setSites(filteredSites);
    } catch (error) {
      console.error('❌ Failed to fetch sites:', error);

      // Set empty array as fallback instead of mock data
      setSites([]);
      console.log('🏢 Using empty sites array due to error');
    }
  }, [getClientId]);

  useEffect(() => {
    console.log('🔄 ClientJobs useEffect - hasValidAssignment:', hasValidAssignment);
    if (hasValidAssignment) {
      console.log('✅ Client assignment is valid, fetching data...');
      fetchJobs();
      fetchSites(); // Now using backend endpoint, so we can fetch immediately
    } else {
      console.log('⏳ Waiting for valid client assignment...');
    }
  }, [hasValidAssignment, fetchJobs, fetchSites]);
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

    // Fetch sites when moving to form step for quote or job requests
    if (type === 'quote' || type === 'job') {
      console.log('🔄 Fetching sites for job creation form...');
      fetchSites();
    }
  };
  const handleRequestSubmit = async (e) => {
    e.preventDefault();

    try {
      const clientId = getClientId();

      // Find the selected site to get its information
      let selectedSite = null;
      if (newRequest.site_uuid) {
        selectedSite = sites.find(site => site.uuid === newRequest.site_uuid || site.id === newRequest.site_uuid);
      }

      console.log('🏢 Selected site for job request:', selectedSite);

      // Create proper ServiceM8 job payload with correct field mappings
      const requestPayload = {
        clientId: clientId,
        userId: clientId,
        type: requestType,
        
        // Basic job information
        job_name: newRequest.job_name,
        job_description: newRequest.description, // ServiceM8 uses job_description not description
        description: newRequest.description, // Keep both for compatibility
        
        // ServiceM8 company/site information
        company_uuid: selectedSite?.uuid || clientId, // Link to the site/company
        company_name: selectedSite?.name || '', // Company name field in ServiceM8
        
        // ServiceM8 location fields - these are critical for proper display
        location_uuid: selectedSite?.uuid || '',
        location_name: selectedSite?.name || '',
        location_address: selectedSite?.address || '',
        job_address: selectedSite?.address || '', // Fallback field
        
        // ServiceM8 site-specific fields
        site_name: selectedSite?.name || newRequest.site_name || '',
        site_address: selectedSite?.address || '',
        
        // ServiceM8 contact information - map to proper ServiceM8 contact fields
        primary_contact_name: newRequest.site_contact_name,
        primary_contact_phone: newRequest.site_contact_number,
        primary_contact_email: newRequest.email,
        
        // ServiceM8 job contact fields - Critical for ServiceM8 integration
        job_contact_first_name: newRequest.site_contact_name?.split(' ')[0] || '',
        job_contact_email: newRequest.email,
        
        // Site contact information for Job Contact creation
        site_contact_name: newRequest.site_contact_name,
        site_contact_number: newRequest.site_contact_number,
        site_contact_email: newRequest.email,
        
        // Additional contact fields that ServiceM8 uses
        contact_first_name: newRequest.site_contact_name?.split(' ')[0] || '',
        contact_last_name: newRequest.site_contact_name?.split(' ').slice(1).join(' ') || '',
        contact_phone: newRequest.site_contact_number,
        contact_mobile: newRequest.site_contact_number,
        contact_email: newRequest.email,
        
        // Legacy email field for compatibility
        email: newRequest.email,
        
        // Purchase order and project information
        purchase_order_number: newRequest.purchase_order_number,
        po_number: newRequest.purchase_order_number, // ServiceM8 PO field
        
        // Date fields
        work_start_date: newRequest.work_start_date,
        work_completion_date: newRequest.work_completion_date,
        date: new Date().toISOString().split('T')[0], // Job creation date
        
        // ServiceM8 status and workflow
        status: 'Work Order', // Set appropriate ServiceM8 status
        job_status: 'Work Order',
        active: 1, // Required by ServiceM8
        
        // Geographic information if available
        geo_street: selectedSite?.address?.split(',')[0] || '',
        geo_city: selectedSite?.city || '',
        geo_state: selectedSite?.state || '',
        geo_postcode: selectedSite?.postcode || '',
        
        // Additional ServiceM8 fields for better integration
        created_by_staff_uuid: clientId,
        billing_address: selectedSite?.address || '',
        
        // Custom fields that might be used by ServiceM8
        customfield_site_name: selectedSite?.name || '',
        customfield_company_name: selectedSite?.name || '',
        
        // ServiceM8 custom fields - as shown in UI
        customfield_rough_in_date: newRequest.work_start_date,
        customfield_handover_date: newRequest.work_completion_date,
        customfield_job_name: newRequest.job_name
      };

      // Add basic description for order type
      if (requestType === 'order') {
        requestPayload.job_description = newRequest.basic_description;
        requestPayload.description = newRequest.basic_description;
        requestPayload.job_name = newRequest.basic_description;
      }

      console.log('📤 Sending ServiceM8 job request payload:', requestPayload);

      const response = await fetch(`${API_URL}/fetch/jobs/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
          'x-client-uuid': clientId
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Job creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to submit request');
      }

      const data = await response.json();
      console.log('✅ Job created successfully:', data);
      
      // Add the new job to the jobs list immediately
      setJobs(prev => [data.data, ...prev]);

      // Upload attachment if one was selected
      if (newJobFile && data.data && data.data.uuid) {
        try {
          // Show upload progress dialog
          setUploadProgress(true);
          setUploadMessage(`Uploading ${newJobFile.name}...`);
          
          console.log(`📎 Uploading attachment for new job ${data.data.uuid}:`, newJobFile.name);
          
          const uploadResult = await uploadAttachment(
            data.data.uuid,
            newJobFile,
            'client',
            'Client User'
          );
          
          console.log('✅ Attachment uploaded successfully:', uploadResult);
          
          // Update the job data with attachment information
          setJobs(prev => prev.map(job => 
            job.uuid === data.data.uuid 
              ? { ...job, attachments: [uploadResult.data] }
              : job
          ));
          
          setUploadMessage('Attachment uploaded successfully!');
          
          // Wait a moment to show success message
          setTimeout(() => {
            setUploadProgress(false);
            setUploadMessage('');
            
            // Reset form and close dialogs
            resetRequestFlow();
            setIsNewJobDialogOpen(false);
            
            toast({ 
              title: 'Success', 
              description: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request submitted successfully with attachment` 
            });
          }, 1500);
          
        } catch (uploadError) {
          console.error('❌ Failed to upload attachment:', uploadError);
          setUploadMessage('Attachment upload failed');
          
          // Wait a moment to show error message
          setTimeout(() => {
            setUploadProgress(false);
            setUploadMessage('');
            
            // Reset form and close dialogs even if upload failed
            resetRequestFlow();
            setIsNewJobDialogOpen(false);
            
            toast({ 
              title: 'Partial Success', 
              description: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} created successfully, but attachment upload failed: ${uploadError.message}`,
              variant: 'destructive'
            });
          }, 2000);
        }
      } else {
        // No attachment to upload, close immediately
        resetRequestFlow();
        setIsNewJobDialogOpen(false);
        
        toast({ 
          title: 'Success', 
          description: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request submitted successfully` 
        });
      }

    } catch (error) {
      console.error('❌ Failed to submit job request:', error);
      toast({ title: 'Error', description: `Failed to submit request: ${error.message}`, variant: 'destructive' });
    }
  };

  const resetRequestFlow = () => {
    setUploadProgress(false);
    setUploadMessage('Preparing upload...');
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
    setIsNewJobDialogOpen(false);
  };

  // Filter sites based on search term
  const filteredSites = (Array.isArray(sites) ? sites : []).filter(site =>
    site.name?.toLowerCase().includes(siteSearchTerm.toLowerCase()) ||
    site.address?.toLowerCase().includes(siteSearchTerm.toLowerCase())
  );

  // Helper function to get job number - uses ServiceM8's generated_job_id
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

    // Validate file using new service
    const validation = validateFile(file);
    if (!validation.valid) {
      setUploadError(validation.errors[0]);
      return;
    }
    
    setIsUploading(true);
    setUploadError('');

    try {
      console.log(`📤 Uploading file via ${getAttachmentSystemName()}:`, file.name);
      
      // Use new attachment service
      const result = await uploadAttachment(
        selectedJob.uuid, 
        file, 
        'client', 
        'Client User'
      );

      // Update the selected job with new attachment
      setSelectedJob(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), result.data]
      }));

      // Update jobs list
      setJobs(prev => prev.map(job =>
        job.uuid === selectedJob.uuid
          ? { ...job, attachments: [...(job.attachments || []), result.data] }
          : job
      ));
      
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);

      // Refresh attachments to ensure we have the latest data
      await fetchAttachments(selectedJob.uuid);

      toast({ 
        title: 'Success', 
        description: `File uploaded successfully via ${getAttachmentSystemName()}` 
      });

      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError(`Failed to upload file: ${error.message}`);
      toast({ 
        title: 'Error', 
        description: `Upload failed via ${getAttachmentSystemName()}: ${error.message}`, 
        variant: 'destructive' 
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleDeleteAttachment = async (attachmentId) => {
    if (!selectedJob) return;

    try {
      console.log(`🗑️ Deleting attachment via ${getAttachmentSystemName()}:`, attachmentId);
      
      // Use new attachment service
      await deleteAttachment(attachmentId);
      
      // Update selected job
      setSelectedJob(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => (att.id || att.uuid || att._id) !== attachmentId)
      }));

      // Update jobs list
      setJobs(prev => prev.map(job =>
        job.uuid === selectedJob.uuid
          ? { ...job, attachments: job.attachments.filter(att => (att.id || att.uuid || att._id) !== attachmentId) }
          : job
      ));
      
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);

      // Refresh attachments to ensure we have the latest data
      await fetchAttachments(selectedJob.uuid);

      toast({ 
        title: 'Success', 
        description: `Attachment deleted successfully via ${getAttachmentSystemName()}` 
      });
    } catch (error) {
      console.error('Delete attachment error:', error);
      toast({ 
        title: 'Error', 
        description: `Failed to delete attachment: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  };

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
      }
    } catch (error) {
      console.error('Error refreshing job data:', error);
    }
  };
  
  // Fetch attachments for selected job
  const fetchAttachments = async (jobId) => {
    if (!jobId) return;

    try {
      setAttachmentsLoading(true);
      
      console.log(`📥 Fetching attachments via ${getAttachmentSystemName()} for job:`, jobId);
      
      // Use new attachment service
      const attachments = await getJobAttachments(jobId);
      
      // Update the selected job with attachments
      setSelectedJob(prev => prev ? { ...prev, attachments } : null);
      
      // Also update the job in the jobs list
      setJobs(prev => prev.map(job =>
        job.uuid === jobId ? { ...job, attachments } : job
      ));
      
      console.log(`✅ Retrieved ${attachments.length} attachments via ${getAttachmentSystemName()}`);
      
    } catch (error) {
      console.error(`❌ Error fetching attachments via ${getAttachmentSystemName()}:`, error);
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
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {siteFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSiteFilter('');
                  setSearchTerm('');
                  navigate('/client/sites');
                }}
                className="flex items-center gap-2"
              >
                ← Back to Sites
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {siteFilter ? `Jobs for ${siteFilter}` : 'Jobs'}
              </h1>
              <p className="text-gray-600 mt-2">
                {siteFilter
                  ? `Viewing all job history for ${siteFilter} (excluding unsuccessful jobs)`
                  : 'View & Manage all your jobs.'
                }
              </p>
            </div>
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

        {/* Upload Progress Dialog */}
        <Dialog open={uploadProgress} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Uploading Attachment</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 text-center">{uploadMessage}</p>
            </div>
          </DialogContent>
        </Dialog>

        {/* Status Filter Tabs - Admin Style */}
        <div className="mb-6">
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="all">All Jobs</TabsTrigger>
              <TabsTrigger value="quotes">Quotes</TabsTrigger>
              <TabsTrigger value="workorders">Work Orders</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

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

            {/* Site Filter Dropdown */}
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-gray-600" />
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by site" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                      <Input
                        placeholder="Search sites..."
                        value={siteSearchTerm}
                        onChange={(e) => setSiteSearchTerm(e.target.value)}
                        className="pl-7 h-8 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <SelectItem value="all">All Sites</SelectItem>
                  {filteredSites.map((site, index) => (
                    <SelectItem key={site.uuid || site.id || `site-${index}`} value={site.name || site.uuid || site.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{site.name}</span>
                        {site.address && (
                          <span className="text-xs text-gray-500">{site.address}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                  {filteredSites.length === 0 && siteSearchTerm && (
                    <div className="px-2 py-1 text-xs text-gray-500">
                      No sites found matching "{siteSearchTerm}"
                    </div>
                  )}
                  {sites.length === 0 && (
                    <div className="px-2 py-1 text-xs text-gray-500">
                      No sites available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results Summary */}          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {filteredJobs.length} of {jobs.filter(job => {
                const status = job.status?.toLowerCase() || '';
                return status !== 'unsuccessful' && status !== 'cancelled' && status !== 'rejected';
              }).length} jobs
              {searchTerm && ` matching "${searchTerm}"`}
              {statusFilter !== 'all' && ` with status "${statusFilter === 'workorders' ? 'Work Orders' :
                statusFilter === 'quotes' ? 'Quotes' :
                  statusFilter === 'completed' ? 'Completed' :
                    statusFilter
                }"`}
              {siteFilter && ` at site "${siteFilter}"`}
            </p>
            {(searchTerm || statusFilter !== 'all' || siteFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSiteFilter('');
                  setSiteSearchTerm('');
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
                      setSiteFilter('');
                      setSiteSearchTerm('');
                    }}
                  >
                    Clear filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">            {filteredJobs.filter(job => job && job.uuid).map((job) => {
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
          ) : (
          /* List View */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Job Number</th>
                      <th className="py-3 px-4 text-left">Site</th>
                      <th className="py-3 px-4 text-left">Description</th>
                      <th className="py-3 px-4 text-left">Status</th>
                      <th className="py-3 px-4 text-left">Created Date</th>
                      <th className="py-3 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.filter(job => job && job.uuid).map((job) => (
                      <tr key={job.uuid} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {job.generated_job_id || job.job_number || job.uuid?.substring(0, 8) || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-blue-600 font-medium">
                            {getSiteName(job)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="max-w-xs">
                            <div className="font-medium line-clamp-1">
                              {job.customfield_job_name || job.job_name || job.name || 'New Job'}
                            </div>
                            <div className="text-gray-600 text-xs line-clamp-2">
                              {job.job_description || job.description || 'No description available'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status || 'Active'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {formatDate(job.date || job.created_date || job.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewJobDetails(job)}
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Details Dialog */}
        {selectedJob && (
          <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
            <DialogContent className="max-h-[95vh] overflow-y-auto max-w-[98vw] md:max-w-6xl lg:max-w-7xl w-full p-3 md:p-6 rounded-lg">
              <DialogHeader className="border-b pb-3 md:pb-4">
                <DialogTitle className="text-lg md:text-2xl font-bold truncate">
                  {getSiteName(selectedJob)}
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                  {selectedJob.location_address || selectedJob.job_address || 'Location not specified'}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="mt-3 md:mt-4">
                <TabsList className="w-full flex-wrap gap-1">
                  <TabsTrigger value="details" className="text-xs md:text-base flex-1 md:flex-none">Details</TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs md:text-base flex-1 md:flex-none">
                    <div className="flex items-center justify-center">
                      <StickyNoteIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      Notes
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="relative text-xs md:text-base flex-1 md:flex-none">
                    <div className="flex items-center justify-center">
                      <MessageSquareIcon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      Chat
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="text-xs md:text-base flex-1 md:flex-none">Attachments</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="p-0 mt-3 md:mt-4">
                  <div className="grid gap-3 md:gap-5">

                    <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                      <Label className="font-bold text-xs md:text-sm">Service Location</Label>
                      <p className="text-xs md:text-sm break-words">
                        {selectedJob.location_address || selectedJob.job_address || 'Location not specified'}
                      </p>
                      {selectedJob.location_uuid && (
                        <p className="text-xs text-muted-foreground">Location ID: {selectedJob.location_uuid}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                      <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                        <Label className="font-bold text-xs md:text-sm">Status</Label>
                        <span className={`px-2 py-1 rounded text-xs inline-block ${selectedJob.status === 'Quote'
                          ? 'bg-orange-100 text-orange-800'
                          : selectedJob.status === 'Work Order'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedJob.status === 'In Progress'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                          {selectedJob.status || 'Active'}
                        </span>
                      </div>
                      <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                        <Label className="font-bold text-xs md:text-sm">Job Number</Label>
                        <p className="text-xs md:text-sm">{getJobNumber(selectedJob)}</p>
                      </div>
                    </div>

                    {/* Site/Location Information Section */}
                    {(selectedJob.site_name || selectedJob.location_name || selectedJob.job_address || selectedJob.geo_street || selectedJob.billing_address) && (
                      <div className="space-y-1 md:space-y-2 border border-blue-100 rounded-lg p-3 md:p-4 bg-blue-50">
                        <Label className="font-bold text-xs md:text-sm text-blue-800">Location Information</Label>
                        <div className="bg-white p-2 rounded border">
                          <div className="grid grid-cols-1 gap-2 text-xs md:text-sm">
                            {(selectedJob.site_name || selectedJob.location_name) && (
                              <p>
                                <span className="font-semibold">Site Name:</span>{' '}
                                {selectedJob.site_name || selectedJob.location_name}
                              </p>
                            )}
                            {selectedJob.job_address && (
                              <p>
                                <span className="font-semibold">Job Address:</span>{' '}
                                {selectedJob.job_address.replace(/\n/g, ', ').trim()}
                              </p>
                            )}
                            {selectedJob.billing_address && selectedJob.billing_address !== selectedJob.job_address && (
                              <p>
                                <span className="font-semibold">Billing Address:</span>{' '}
                                {selectedJob.billing_address.replace(/\n/g, ', ').trim()}
                              </p>
                            )}
                            {(selectedJob.geo_street || selectedJob.geo_city) && (
                              <p>
                                <span className="font-semibold">Street Address:</span>{' '}
                                {[selectedJob.geo_number, selectedJob.geo_street, selectedJob.geo_city, selectedJob.geo_state, selectedJob.geo_postcode].filter(Boolean).join(', ')}
                              </p>
                            )}
                            {selectedJob.location_uuid && (
                              <p>
                                <span className="font-semibold">Location UUID:</span>{' '}
                                <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                                  {selectedJob.location_uuid}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                      <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                        <Label className="font-bold text-xs md:text-sm">Created Date</Label>
                        <p className="text-xs md:text-sm">{formatDate(selectedJob.date || selectedJob.created_date || selectedJob.createdAt)}</p>
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
                          <p><span className="font-semibold">Street:</span> {selectedJob.geo_number && selectedJob.geo_street ? `${selectedJob.geo_number} ${selectedJob.geo_street}` : selectedJob.geo_street || 'N/A'}</p>
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
                </TabsContent>                <TabsContent value="notes" className="p-0 mt-6">
                  <NotesTab
                    jobId={selectedJob.uuid || selectedJob.id}
                    userType="client"
                    refreshTrigger={refreshTrigger}
                  />
                </TabsContent>

                <TabsContent value="chat" className="p-0 mt-6">
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
                    </div>)}

                  {attachmentsLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading attachments...</p>
                    </div>
                  )}

                  {!attachmentsLoading && selectedJob.attachments?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                      <ScrollArea className="max-h-60">
                        <div className="space-y-2">
                          {selectedJob.attachments && selectedJob.attachments.length > 0 ? selectedJob.attachments.map((attachment, index) => (
                        <div
                          key={attachment.id || attachment._id || `attachment-${index}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileIcon className="h-5 w-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {attachment.fileName || attachment.originalName || attachment.filename || 'Unknown file'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.fileSize || attachment.size || 0)} • {getAttachmentSystemName()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => triggerDownload(
                                attachment.id || attachment.uuid || attachment._id,
                                attachment.fileName || attachment.originalName || attachment.filename || 'download'
                              )}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Download file"
                            >
                              <UploadIcon className="h-4 w-4 rotate-180" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAttachment(attachment.id || attachment.uuid || attachment._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete file"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-4">
                          <FileIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No attachments</p>
                        </div>
                      )}
                      </div>
                      </ScrollArea>
                    </div>
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
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ClientAssignmentGuard>
  );
};

export default ClientJobs;
