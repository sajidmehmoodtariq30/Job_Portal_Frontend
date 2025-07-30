import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  BarChart3,
  MessageSquare,
  FileBarChart,
  AlertCircle,
  ArrowRight,
  Building,
  User,
  RefreshCw,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Plus,
  BriefcaseIcon,
  ClockIcon,
  FileIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/UI/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/UI/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/UI/dropdown-menu";
import { Badge } from "@/components/UI/badge";
import { Progress } from "@/components/UI/progress";
import { Skeleton } from "@/components/UI/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '@/lib/apiConfig';
import { getWelcomeMessage } from '@/utils/clientUtils';
import { useNotifications } from '@/context/NotificationContext';
import { useClientAssignment } from '@/context/ClientAssignmentContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useToast } from "@/hooks/use-toast"
import { uploadAttachment } from '../../services/attachmentService';

const ClientHome = () => {
  const navigate = useNavigate();
  const { notifications: contextNotifications, unreadCount, clearAll, markAsRead } = useNotifications();
  const { hasValidAssignment, getClientId } = useClientAssignment();
  const { toast } = useToast();

  // State variables - all at the top
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    jobs: [],
    upcomingServices: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome back');
  const [clientName, setClientName] = useState('');
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  // Job request states
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [requestStep, setRequestStep] = useState('selection'); // 'selection', 'form'
  const [requestType, setRequestType] = useState(''); // 'quote', 'job', 'order'
  const [newJobFile, setNewJobFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('Preparing upload...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sites, setSites] = useState([]);
  const [siteSearchTerm, setSiteSearchTerm] = useState('');
  const [sitesLoading, setSitesLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({
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

  // Get client data from localStorage
  const getClientData = () => {
    const clientData = localStorage.getItem('user_data');
    if (clientData) {
      try {
        return JSON.parse(clientData);
      } catch (error) {
        console.error('Error parsing client data:', error);
        return null;
      }
    }
    return null;
  };

  const clientData = getClientData();
  const clientId = clientData?.assignedClientUuid || clientData?.uuid || localStorage.getItem('client_id') || localStorage.getItem('clientId') || localStorage.getItem('userId') || localStorage.getItem('client_uuid');

  // Mock data function
  const loadMockData = useCallback(() => {
    console.warn('⚠️ DASHBOARD: Using mock data (DEVELOPMENT ONLY)');

    localStorage.setItem('using_mock_dashboard_data', 'true');

    const mockData = {
      stats: {
        activeJobs: 2,
        inProgressJobs: 1,
        completedJobs: 1,
        completedJobsLast30Days: 1,
        upcomingServices: 2,
        nextServiceDate: "2025-04-20",
        statusBreakdown: {
          inProgress: "50.0",
          scheduled: "25.0",
          completed: "25.0"
        },
        quotes: 3 // Add quotes count
      },
      jobs: [
        {
          id: 'JOB-2025-0423',
          jobNumber: 'JOB-2025-0423',
          title: 'Network Installation',
          status: 'In Progress',
          date: '2025-04-15',
          dueDate: '2025-04-20',
          type: 'Work Order',
          description: 'Install new network infrastructure including switches and access points',
          assignedTech: 'Alex Johnson',
          location: 'Main Office',
          site_name: 'SkinKandy Australia',
          attachments: 2,
          clientId: clientId
        },
        {
          id: 'QUOTE-2025-0421',
          jobNumber: 'QUOTE-2025-0421',
          title: 'Office Renovation Quote',
          status: 'Quote',
          date: '2025-04-18',
          type: 'Quote',
          description: 'Quote for complete office renovation',
          location: 'Branch Office',
          site_name: 'SkinKandy Carousel',
          clientId: clientId
        },
        {
          id: 'JOB-2025-0418',
          jobNumber: 'JOB-2025-0418',
          title: 'Digital Signage Installation',
          status: 'Completed',
          date: '2025-04-10',
          completedDate: '2025-04-12',
          type: 'Work Order',
          description: 'Install 3 digital signage displays in reception area',
          assignedTech: 'Mike Wilson',
          location: 'Reception Area',
          site_name: 'SkinKandy Bendigo',
          attachments: 1,
          clientId: clientId
        }
      ],
      upcomingServices: [
        {
          id: 'SVC-001',
          title: 'Network Maintenance',
          date: '2025-04-20',
          time: '10:00 AM',
          location: 'Main Office',
          tech: 'Alex Johnson',
          clientId: clientId
        },
        {
          id: 'SVC-002',
          title: 'Security Check',
          date: '2025-04-22',
          time: '2:00 PM',
          location: 'Branch Office',
          tech: 'Sarah Davis',
          clientId: clientId
        }
      ],
      recentActivity: [
        {
          id: 1,
          type: 'job_status_update',
          title: 'Job Update - In Progress',
          description: 'JOB-2025-0423',
          date: '2025-04-15',
          site_name: 'SkinKandy Australia',
          status: 'In Progress',
          jobNumber: 'JOB-2025-0423',
          clientId: clientId
        },
        {
          id: 2,
          type: 'job_status_update',
          title: 'Job Update - Quote',
          description: 'QUOTE-2025-0421',
          date: '2025-04-18',
          site_name: 'SkinKandy Carousel',
          status: 'Quote',
          jobNumber: 'QUOTE-2025-0421',
          clientId: clientId
        },
        {
          id: 3,
          type: 'job_status_update',
          title: 'Job Update - Completed',
          description: 'JOB-2025-0418',
          date: '2025-04-12',
          site_name: 'SkinKandy Bendigo',
          status: 'Completed',
          jobNumber: 'JOB-2025-0418',
          clientId: clientId
        },
        {
          id: 4,
          type: 'document_uploaded',
          title: 'Document Uploaded',
          description: 'Network Diagram.pdf',
          date: '2025-04-11',
          clientId: clientId
        },
        {
          id: 5,
          type: 'invoice_paid',
          title: 'Invoice Paid',
          description: 'INV-2025-0056',
          date: '2025-04-08',
          clientId: clientId
        },
        {
          id: 6,
          type: 'service_scheduled',
          title: 'Service Scheduled',
          description: 'Network Maintenance',
          date: '2025-04-07',
          clientId: clientId
        }
      ]
    };

    setDashboardData(mockData);
    setLastUpdated(new Date());

    console.warn('⚠️ DASHBOARD: Mock data loaded for client:', clientId);
  }, [clientId]);

  // Fetch dashboard data from the backend
  const fetchDashboardData = useCallback(async (showRefreshIndicator = true) => {
    if (showRefreshIndicator) {
      setDataRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      // Make sure we have a valid client ID
      if (!clientId || !hasValidAssignment) {
        throw new Error('No valid client assignment found');
      }

      console.log(`🔄 DASHBOARD: Fetching dashboard data for client: ${clientId}`);
      const response = await axios.get(`${API_URL}/fetch/dashboard-stats/${clientId}`);
      console.log('📊 DASHBOARD: Data received:', response.data);
      setDashboardData(response.data);

      setLastUpdated(new Date());

    } catch (err) {
      console.error('❌ DASHBOARD: Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing.');

      // Use mock data in development environment
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        console.warn('⚠️ DASHBOARD: Using mock data for development purposes only');
        loadMockData();
      } else {
        setDashboardData({
          stats: {},
          jobs: [],
          upcomingServices: [],
          recentActivity: []
        });
      }
    } finally {
      setLoading(false);
      setDataRefreshing(false);
    }
  }, [clientId, hasValidAssignment, loadMockData]);

  // Debugging - check what client ID we have
  useEffect(() => {
    console.log('🏠 DASHBOARD: Current clientData:', clientData);
    console.log('🎯 DASHBOARD: Final clientId used:', clientId);
    console.log('🔒 DASHBOARD: hasValidAssignment:', hasValidAssignment);
    if (clientData?.name) {
      console.log(`👤 DASHBOARD: Client name: ${clientData.name}`);
    }
  }, [clientData, clientId, hasValidAssignment]);

  // Fetch client name and welcome message
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (clientData) {
        setClientName(clientData.name || 'Client');

        if (clientId) {
          try {
            const welcome = await getWelcomeMessage(clientId);
            setWelcomeMessage(welcome);
          } catch (error) {
            console.error('Error fetching welcome message:', error);
            setWelcomeMessage(`Welcome back, ${clientData.name || 'Client'}`);
          }
        }
      } else {
        setWelcomeMessage('Welcome back');
        setClientName('');
      }
    };

    fetchClientInfo();
  }, [clientData, clientId]);

  // Initial data loading
  useEffect(() => {
    if (hasValidAssignment && clientId) {
      fetchDashboardData(false);
    }
  }, [fetchDashboardData, hasValidAssignment, clientId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!hasValidAssignment || !clientId) return;

    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData, hasValidAssignment, clientId]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Navigate to jobs page with filters
  const handleJobClick = (job) => {
    navigate('/client/jobs', {
      state: {
        filterByJobNumber: job.jobNumber,
        filterByStatus: job.status
      }
    });
  };

  // Navigate to jobs page with specific filters
  const navigateToJobsWithFilter = (filterType, filterValue, additionalFilters = {}) => {
    const state = {
      [filterType]: filterValue,
      ...additionalFilters
    };

    navigate('/client/jobs', { state });
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'job_created': return <FileText className="text-blue-500" />;
      case 'job_status_update': return <CheckCircle className="text-green-500" />;
      case 'job_completed': return <CheckCircle className="text-green-500" />;
      case 'document_uploaded': return <FileBarChart className="text-purple-500" />;
      case 'invoice_paid': return <BarChart3 className="text-green-500" />;
      case 'service_scheduled': return <Calendar className="text-purple-500" />;
      default: return <AlertCircle className="text-gray-500" />;
    }
  };

  // Get status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'quote': return 'secondary';
      case 'work order': return 'default';
      case 'in progress': return 'default';
      case 'completed': return 'default';
      case 'complete': return 'default';
      default: return 'outline';
    }
  };

  // Get status color for text
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'quote': return 'text-orange-600';
      case 'work order': return 'text-blue-600';
      case 'in progress': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'complete': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Job request functions
  const handleRequestTypeSelect = (type) => {
    setRequestType(type);
    setRequestStep('form');
    setNewRequest(prev => ({ ...prev, type }));

    // Fetch sites when moving to form step
    if (type === 'quote' || type === 'job') {
      fetchSites();
    }
  };

  const fetchSites = async () => {
    setSitesLoading(true);
    try {
      if (!clientId) {
        console.warn('No clientId available for fetching sites');
        return;
      }

      console.log('Fetching sites for client:', clientId);

      // Try multiple endpoints to find sites
      const endpoints = [
        `${API_URL}/api/clients/${clientId}/sites`,
        `${API_URL}/fetch/clients/${clientId}/sites`,
        `${API_URL}/api/sites/clients/${clientId}`
      ];

      let sitesData = [];
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);

          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
              'Content-Type': 'application/json',
              'x-client-uuid': clientId
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('Sites response:', data);

            // Handle different response formats
            if (Array.isArray(data)) {
              sitesData = data;
            } else if (data.sites && Array.isArray(data.sites)) {
              sitesData = data.sites;
            } else if (data.data && Array.isArray(data.data)) {
              sitesData = data.data;
            }

            if (sitesData.length > 0) {
              console.log(`Successfully fetched ${sitesData.length} sites from ${endpoint}`);
              break;
            }
          } else {
            console.warn(`Endpoint ${endpoint} returned status:`, response.status);
          }
        } catch (endpointError) {
          console.warn(`Error with endpoint ${endpoint}:`, endpointError.message);
          lastError = endpointError;
        }
      }

      // If no sites found, create mock sites for development
      if (sitesData.length === 0) {
        console.warn('No sites found from API, using mock data for development');
        sitesData = [
          {
            uuid: 'site-1',
            name: 'Main Office',
            address: '123 Business Street, City, State 12345',
            type: 'Office'
          },
          {
            uuid: 'site-2',
            name: 'Warehouse Location',
            address: '456 Industrial Ave, City, State 12345',
            type: 'Warehouse'
          },
          {
            uuid: 'site-3',
            name: 'Branch Office',
            address: '789 Corporate Blvd, City, State 12345',
            type: 'Office'
          }
        ];
      }

      setSites(sitesData);
      console.log('Final sites set:', sitesData);

    } catch (error) {
      console.error('Error fetching sites:', error);
      toast({
        title: 'Warning',
        description: 'Could not load sites. Using default options.',
        variant: 'default'
      });

      // Set mock sites as fallback
      setSites([
        {
          uuid: 'site-default',
          name: 'Default Site',
          address: 'Main Location',
          type: 'Office'
        }
      ]);
    } finally {
      setSitesLoading(false);
    }
  };

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

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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

      // Create FormData for multipart request if file is present
      let requestBody;
      let requestHeaders = {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'x-client-uuid': clientId
      };

      if (newJobFile) {
        // Send as multipart/form-data with file
        const formData = new FormData();
        
        // Add all job data fields to FormData
        Object.keys(requestPayload).forEach(key => {
          if (requestPayload[key] !== null && requestPayload[key] !== undefined) {
            formData.append(key, requestPayload[key]);
          }
        });
        
        // Add the file
        formData.append('file', newJobFile);
        
        requestBody = formData;
        // Don't set Content-Type header - let browser set it with boundary
        console.log('📎 Including file in job creation request:', newJobFile.name);
      } else {
        // Send as JSON if no file
        requestHeaders['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(requestPayload);
        console.log('📄 Sending JSON request (no file)');
      }

      const response = await fetch(`${API_URL}/fetch/jobs/create`, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Job creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to submit request');
      }

      const data = await response.json();
      console.log('✅ Job created successfully:', data);

      // Show success message for job creation
      toast({
        title: 'Success',
        description: `${requestType.charAt(0).toUpperCase() + requestType.slice(1)} request submitted successfully`
      });

      // Refresh dashboard data immediately
      fetchDashboardData(true);

      // Handle attachment upload (check if already uploaded during job creation)
      if (newJobFile && data.data && data.data.uuid) {
        if (data.data.attachment) {
          console.log('✅ Attachment already uploaded during job creation:', data.data.attachment);
          
          setUploadMessage('Upload completed successfully!');
          
          toast({
            title: 'Success',
            description: 'Job created and attachment uploaded successfully'
          });

          // Close all dialogs after a brief delay
          setTimeout(() => {
            resetRequestFlow();
          }, 1500);
        } else {
          // Fallback: Upload attachment separately if it wasn't included in job creation
          try {
            // Show upload progress dialog
            setUploadProgress(true);
            setUploadMessage('Uploading attachment...');
            
            console.log(`📎 Uploading attachment separately for job ${data.data.uuid}:`, newJobFile.name);
            
            const uploadResult = await uploadAttachment(
              data.data.uuid,
              newJobFile,
              'client',
              'Client User'
            );
            
            console.log('✅ Attachment uploaded successfully:', uploadResult);
            
            setUploadMessage('Upload completed successfully!');
            
            toast({
              title: 'Success',
              description: 'Attachment uploaded successfully'
            });

            // Close all dialogs after a brief delay
            setTimeout(() => {
              resetRequestFlow();
            }, 1500);
            
          } catch (uploadError) {
            console.error('❌ Failed to upload attachment:', uploadError);
            setUploadMessage('Upload failed. Please try again.');
            
            toast({
              title: 'Upload Error',
              description: `Failed to upload attachment: ${uploadError.message}`,
              variant: 'destructive'
            });

            // Close dialogs after showing error
            setTimeout(() => {
              resetRequestFlow();
            }, 3000);
          }
        }
      } else {
        // No attachment, close immediately
        resetRequestFlow();
      }

      // Refresh dashboard data
      fetchDashboardData(true);

    } catch (error) {
      console.error('❌ Failed to submit job request:', error);
      setIsSubmitting(false);
      toast({
        title: 'Error',
        description: `Failed to submit request: ${error.message}`,
        variant: 'destructive'
      });
    }
  };

  const resetRequestFlow = () => {
    setUploadProgress(false);
    setUploadMessage('Preparing upload...');
    setIsSubmitting(false);
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
    setSitesLoading(false);
    setIsNewJobDialogOpen(false);
  };

  // Filter sites based on search term
  // Filter sites based on search term with enhanced search functionality
  const filteredSites = (Array.isArray(sites) ? sites : []).filter(site => {
    if (!siteSearchTerm) return true;

    const searchTerm = siteSearchTerm.toLowerCase();
    const name = site.name?.toLowerCase() || '';
    const address = site.address?.toLowerCase() || '';
    const type = site.type?.toLowerCase() || '';

    // Search in name, address, and type
    return name.includes(searchTerm) ||
      address.includes(searchTerm) ||
      type.includes(searchTerm);
  });

  // Early return if not assigned to a client
  if (!hasValidAssignment || !clientId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Access Restricted</h3>
          <p className="text-muted-foreground mt-2">
            You need to be assigned to a client to view the dashboard.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Access
          </Button>
        </div>
      </div>
    );
  }

  // Extract data from the dashboard data object for easier use
  const { stats, jobs, quotes, upcomingServices, recentActivity } = dashboardData;

  // Calculate quotes count - use the quotes array from backend, fallback to stats
  console.log('ClientHome: All jobs data:', jobs);
  console.log('ClientHome: Jobs count:', jobs.length);
  console.log('ClientHome: Quotes data:', quotes);
  console.log('ClientHome: Quotes count from array:', quotes?.length || 0);
  console.log('ClientHome: Stats data:', stats);

  // Debug: Log all unique statuses found in jobs
  const uniqueStatuses = [...new Set(jobs.map(job => job.status))];
  console.log('ClientHome: Unique job statuses found:', uniqueStatuses);

  const quotesCount = quotes?.length || stats?.pendingQuotes || stats?.quotes || 0;

  console.log('ClientHome: Final quotes count:', quotesCount);

  // Filter recent activity to show relevant updates
  const displayedActivity = showAllUpdates ? recentActivity : recentActivity.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header with welcome message, notifications and site selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{welcomeMessage}</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your services today
            {lastUpdated && !loading && (
              <span className="text-xs ml-2 text-muted-foreground">
                (Last updated: {lastUpdated.toLocaleTimeString()})
                {dataRefreshing && <Loader2 className="ml-1 h-3 w-3 inline animate-spin" />}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Request New Job Button */}
          <Dialog open={isNewJobDialogOpen} onOpenChange={(open) => {
            setIsNewJobDialogOpen(open);
            if (!open) resetRequestFlow();
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Request Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Submit Order'
                      )}
                    </Button>
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
                      />
                      {filteredSites.length > 0 ? (
                        <Select
                          value={newRequest.site_uuid}
                          onValueChange={(value) => setNewRequest(prev => ({ ...prev, site_uuid: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select site" />
                          </SelectTrigger>
                          <SelectContent>
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
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        `Submit ${requestType.charAt(0).toUpperCase() + requestType.slice(1)}`
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => contextNotifications.forEach(n => !n.read && markAsRead(n.id))}>
                    Mark all read
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear all
                  </Button>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {contextNotifications.length > 0 ? (
                contextNotifications.slice(0, 5).map(notification => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`p-3 ${!notification.read ? 'bg-muted/50' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex gap-3 items-start">
                      {notification.type?.includes('job') && <CheckCircle className="text-green-500" size={20} />}
                      {notification.type?.includes('attachment') && <FileText className="text-blue-500" size={20} />}
                      {notification.type?.includes('note') && <MessageSquare className="text-purple-500" size={20} />}
                      {notification.type?.includes('chat') && <MessageSquare className="text-blue-500" size={20} />}
                      {notification.type?.includes('service') && <Calendar className="text-purple-500" size={20} />}
                      <div>
                        <p className="font-medium text-sm">{notification.title || notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No new notifications
                </div>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center" onClick={() => alert('View all notifications')}>
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={dataRefreshing}
            className={dataRefreshing ? 'animate-pulse' : ''}
            title="Refresh dashboard"
          >
            {dataRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>

          <Button onClick={() => navigate('/client/jobs')}>View All Jobs</Button>
        </div>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      )}

      {/* Warning for mock data (development only) */}
      {localStorage.getItem('using_mock_dashboard_data') === 'true' && typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
        <div className="p-4 border border-yellow-200 rounded-md bg-yellow-50 text-yellow-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>Using mock data for development purposes only.</p>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => {
            localStorage.removeItem('using_mock_dashboard_data');
            handleRefresh();
          }}>
            Try Real Data
          </Button>
        </div>
      )}

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 w-full">
        {/* Active Jobs Card - Work Orders Only */}
        {(loading || jobs.filter(job => job.status !== 'Completed' && (job.type === 'Work Order' || job.status === 'Work Order')).length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <div className="text-5xl font-bold">
                    {jobs.filter(job => job.status !== 'Completed' && (job.type === 'Work Order' || job.status === 'Work Order')).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">

                  </p>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="link"
                className="p-0 hover:text-primary transition-colors"
                onClick={() => navigateToJobsWithFilter('filterByType', 'Work Order', { filterByStatus: 'In Progress' })}
              >
                View all jobs <ArrowRight size={16} className="ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Quotes Box */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-5xl font-bold text-black">
                  {quotesCount}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Active quotes
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              className="p-0 hover:text-primary transition-colors"
              onClick={() => navigateToJobsWithFilter('filterByStatus', 'Quote')}
            >
              View all quotes <ArrowRight size={16} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Completed Jobs Card - Work Orders Only */}
        {(loading || jobs.filter(job => job.status === 'Completed' && (job.type === 'Work Order' || job.status === 'Work Order')).length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold">
                    {jobs.filter(job => job.status === 'Completed' && (job.type === 'Work Order' || job.status === 'Work Order')).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Completed Jobs
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="link"
                className="p-0 hover:text-primary transition-colors"
                onClick={() => navigateToJobsWithFilter('filterByStatus', 'Completed', { filterByType: 'Work Order' })}
              >
                View completed jobs <ArrowRight size={16} className="ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Services */}
          {(loading || upcomingServices.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Services</CardTitle>
                <CardDescription>Scheduled services for your locations</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(index => (
                      <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingServices.map(service => (
                      <div key={service.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="bg-blue-50 dark:bg-blue-950 rounded-full p-3 flex-shrink-0">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{service.title}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{service.time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Building className="h-3.5 w-3.5" />
                              <span>{service.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3.5 w-3.5" />
                              <span>{service.tech}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/25 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap">
                          {new Date(service.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {upcomingServices.length > 3 && (
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Scheduled Services
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          {/* Recent Job Updates */}
          {(loading || recentActivity.length > 0) && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Updates</CardTitle>
                  <CardDescription>Latest updates on your jobs and services</CardDescription>
                </div>
                {dataRefreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-5">
                    {[1, 2, 3, 4, 5].map(index => (
                      <div key={index} className="flex items-start gap-4 pb-5 border-b last:border-0 last:pb-0">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                        <Skeleton className="h-3 w-14" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {displayedActivity.map(activity => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 pb-5 border-b last:border-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded-md -m-2"
                        onClick={() => {
                          if (activity.type === 'job_status_update' && activity.jobNumber) {
                            handleJobClick({ jobNumber: activity.jobNumber, status: activity.status });
                          }
                        }}
                      >
                        <div className="bg-muted rounded-full p-2">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">
                              {activity.type === 'job_status_update'
                                ? 'Job Update - '
                                : activity.title
                              }
                            </h4>
                            {activity.type === 'job_status_update' && activity.status && (
                              <span className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                                {activity.status}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activity.type === 'job_status_update' ? activity.jobNumber : activity.description}
                          </p>
                          {activity.site_name && (
                            <p className="text-xs text-muted-foreground mt-1">{activity.site_name}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              {recentActivity.length > 5 && (
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowAllUpdates(!showAllUpdates)}
                  >
                    {showAllUpdates ? 'Hide' : 'Show More'}
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Client Profile Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Client Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-28 mx-auto" />
                  <Skeleton className="h-3 w-40 mx-auto" />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg">{clientName}</h3>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;
