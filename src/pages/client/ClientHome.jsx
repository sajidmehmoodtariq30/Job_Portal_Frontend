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
  Activity
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/UI/select";
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
import { API_URL } from '@/lib/apiConfig';
import { getWelcomeMessage, getClientNameByUuid } from '@/utils/clientUtils';
import { useSites } from '@/hooks/useSites';
import { useAllSites } from '@/hooks/useAllSites';
import { useNotifications } from '@/context/NotificationContext';
import { useSession } from '@/context/SessionContext';
import { useClientAssignment } from '@/context/ClientAssignmentContext';

const ClientHome = () => {
  const navigate = useNavigate();
  const { notifications: contextNotifications, unreadCount, clearAll, markAsRead, triggerNotification } = useNotifications();
  const { } = useSession();
  const { hasValidAssignment } = useClientAssignment();
  // State variables
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    jobs: [],
    upcomingServices: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome back');
  const [clientName, setClientName] = useState('');

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

  // Get client ID from localStorage only - this should be the assigned client UUID
  const clientId = clientData?.assignedClientUuid || clientData?.uuid || localStorage.getItem('client_id') || localStorage.getItem('clientId') || localStorage.getItem('userId') || localStorage.getItem('client_uuid');

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

  // Use the global sites hook to show all sites in dropdown
  const {
    sites: allSites,
    loading: sitesLoading,
    error: sitesError,
    fetchAllSites
  } = useAllSites();

  // Keep track of current site selection
  const [currentSite, setCurrentSite] = useState(null);

  // Change site function
  const changeSite = (site) => {
    setCurrentSite(site);
  };

  // Use all sites for the dropdown
  const sites = allSites;
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
  // FOR DEVELOPMENT ONLY - Mock data for development and testing purposes
  const loadMockData = () => {
    console.warn('⚠️ DASHBOARD: Using mock data (DEVELOPMENT ONLY)');
    
    // Clear mock data flag in localStorage to remember this is mock data
    localStorage.setItem('using_mock_dashboard_data', 'true');
      // Mock data structure to match our backend API response
    const mockData = {
      stats: {
        activeJobs: 3,
        inProgressJobs: 1,
        completedJobs: 1,
        completedJobsLast30Days: 1,
        upcomingServices: 2,
        nextServiceDate: "2025-04-20",
        statusBreakdown: {
          inProgress: "33.3",
          scheduled: "33.3",
          completed: "33.3"
        }
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
          attachments: 2,
          clientId: clientId // Make sure it's associated with this client
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
          assignedTech: 'Sarah Davis',
          location: 'Main Office',
          attachments: 3,
          clientId: clientId
        },
        {
          id: 'JOB-2025-0415',
          jobNumber: 'JOB-2025-0415',
          title: 'Surveillance System Maintenance',
          status: 'Scheduled',
          date: '2025-04-20',
          type: 'Work Order',
          description: 'Routine maintenance check on surveillance system',
          assignedTech: 'Miguel Rodriguez',          location: 'Branch Office',
          attachments: 0,
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
      recentActivity: [        { id: 1, type: 'job_created', title: 'New Job Request Created', description: 'Network Installation', date: '2025-04-15', clientId: clientId },
        { id: 3, type: 'job_completed', title: 'Job Completed', description: 'Digital Signage Installation', date: '2025-04-12', clientId: clientId },
        { id: 4, type: 'document_uploaded', title: 'Document Uploaded', description: 'Network Diagram.pdf', date: '2025-04-11', clientId: clientId },
        { id: 5, type: 'invoice_paid', title: 'Invoice Paid', description: 'INV-2025-0056', date: '2025-04-08', clientId: clientId },
        { id: 6, type: 'service_scheduled', title: 'Service Scheduled', description: 'Network Maintenance', date: '2025-04-07', clientId: clientId }
      ]
    };

    setDashboardData(mockData);
    setLastUpdated(new Date());
    
    // Display a warning in the console that this is mock data
    console.warn('⚠️ DASHBOARD: Mock data loaded for client:', clientId);
  };
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
      
      // Call our backend endpoint for dashboard stats with the assigned client ID
      console.log(`🔄 DASHBOARD: Fetching dashboard data for client: ${clientId}`);
      const response = await axios.get(`${API_URL}/fetch/dashboard-stats/${clientId}`);
      console.log('📊 DASHBOARD: Data received:', response.data);
      setDashboardData(response.data);

      // Set last updated timestamp
      setLastUpdated(new Date());

    } catch (err) {
      console.error('❌ DASHBOARD: Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
      
      // Only use mock data in development environment and if explicitly allowed
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ DASHBOARD: Using mock data for development purposes only');
        loadMockData();
      } else {        // In production, show empty data instead of mock data
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
  }, [clientId, hasValidAssignment]);
  // Initial data loading
  useEffect(() => {
    // Only fetch data if we have a valid client assignment
    if (hasValidAssignment && clientId) {
      console.log('🔄 DASHBOARD: Initial data loading for client:', clientId);
      fetchDashboardData(false);
        // Set up interval for real-time updates (reduced frequency)
      const intervalId = setInterval(() => {
        // Only refresh if we still have a valid assignment
        if (hasValidAssignment && clientId) {
          fetchDashboardData(true);
        }
      }, 600000); // Refresh every 10 minutes
      
      return () => clearInterval(intervalId);
    }
  }, [fetchDashboardData, hasValidAssignment, clientId]);

  // Add visibility change listener to refresh sites when user navigates back to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is now visible, refresh sites data
        fetchAllSites();
      }
    };

    const handleFocus = () => {
      // Window regained focus, refresh sites data
      fetchAllSites();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAllSites]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-purple-600 text-white';      case 'Work Order': return 'bg-blue-600 text-white';
      case 'Completed': return 'bg-green-600 text-white';
      case 'Scheduled': return 'bg-purple-600 text-white';
      case 'On Hold': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  const getActivityIcon = (type) => {
    switch (type) {
      case 'job_created': return <FileText className="text-blue-500" />;
      case 'job_completed': return <CheckCircle className="text-green-500" />;
      case 'document_uploaded': return <FileBarChart className="text-purple-500" />;
      case 'invoice_paid': return <BarChart3 className="text-green-500" />;
      case 'service_scheduled': return <Calendar className="text-purple-500" />;
      default: return <AlertCircle className="text-gray-500" />;
    }
  };// Extract data from the dashboard data object for easier use
  const { stats, jobs, upcomingServices, recentActivity } = dashboardData;

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
          <Select
            value={currentSite?.id || ''}
            onValueChange={(siteId) => {
              const selectedSite = sites.find(site => site.id === siteId);
              if (selectedSite) changeSite(selectedSite);
            }}
            disabled={sitesLoading}
          >
            <SelectTrigger className="w-[180px]">
              <Building size={16} className="mr-2" />
              <SelectValue placeholder={sitesLoading ? "Loading sites..." : "Select site"} />
            </SelectTrigger>
            <SelectContent>
              {sitesLoading ? (
                <SelectItem value="loading" disabled>Loading sites...</SelectItem>
              ) : sites.length > 0 ? (
                sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>
                    <div className="flex items-center gap-2">
                      <span>{site.name}</span>
                      {site.clientId && site.clientId !== clientId && (
                        <Badge variant="outline" className="text-xs">
                          Other Client
                        </Badge>
                      )}
                      {site.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>No sites available</SelectItem>
              )}
            </SelectContent>          </Select>

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
                  >                  <div className="flex gap-3 items-start">
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
      </div>      {/* Error message if any */}
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
      {localStorage.getItem('using_mock_dashboard_data') === 'true' && process.env.NODE_ENV === 'development' && (
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
      )}      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {/* Active Jobs Card */}
        {(loading || jobs.filter(job => job.status !== 'Completed').length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Jobs</CardTitle>
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
                    {jobs.filter(job => job.status !== 'Completed').length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {jobs.filter(job => job.status === 'In Progress').length} in progress
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0" onClick={() => navigate('/client/jobs')}>
                View all jobs <ArrowRight size={16} className="ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}
        {/* Completed Jobs Card */}
        {(loading || jobs.filter(job => job.status === 'Completed').length > 0) && (
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
                    {jobs.filter(job => job.status === 'Completed').length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    In the last 30 days
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0" onClick={() => navigate('/client/jobs')}>
                View completed jobs <ArrowRight size={16} className="ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Upcoming Services Card */}
        {(loading || upcomingServices.length > 0) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Services</CardTitle>
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
                    {upcomingServices.length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Next: {upcomingServices.length > 0 ?
                      new Date(upcomingServices[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                      'None scheduled'}
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0" onClick={() => navigate('/client/schedule')}>
                View schedule <ArrowRight size={16} className="ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>{/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
            {/* Job Timeline Charts */}
          <div className="grid grid-cols-1 gap-6">
              {/* Job Completion Trend - Now Full Width */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Job Status Timeline</CardTitle>
                <CardDescription>Recent job status changes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[180px] w-full" />
                ) : (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold flex items-center">
                        <Activity className="h-5 w-5 text-blue-500 mr-1" />
                        {jobs.filter(job => job.status === 'Completed').length}
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                        {stats.completedJobsLast30Days || 0} last 30 days
                      </Badge>
                    </div>                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart
                        data={recentActivity
                          .filter(activity => activity.type === 'job_created' || activity.type === 'job_completed')
                          .map((activity, index) => ({
                            date: new Date(activity.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}),
                            value: activity.type === 'job_completed' ? 1 : 0,
                            type: activity.type === 'job_completed' ? 'Completed' : 'Created'
                          }))}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis hide />
                        <Tooltip 
                          formatter={(value, name) => [name === 'Completed' ? 'Completed' : 'Created']}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="Completed"
                          stroke="#10b981" 
                          strokeWidth={2}
                          dot={{ stroke: '#10b981', strokeWidth: 2, fill: '#10b981', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>{/* Service Status Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Overview of your current services by status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[240px] w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Status Distribution - Pie Chart */}
                  <div>
                    <h4 className="text-sm font-medium mb-4 text-center">Status Distribution</h4>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie                          data={[
                            { name: 'In Progress', value: jobs.filter(j => j.status === 'In Progress').length, fill: '#8b5cf6' },
                            { name: 'Scheduled', value: jobs.filter(j => j.status === 'Scheduled').length, fill: '#3b82f6' },
                            { name: 'Completed', value: jobs.filter(j => j.status === 'Completed').length, fill: '#10b981' }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >                          {[
                            { name: 'In Progress', color: '#8b5cf6' },
                            { name: 'Scheduled', color: '#3b82f6' },
                            { name: 'Completed', color: '#10b981' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} job${value !== 1 ? 's' : ''}`]} 
                          labelFormatter={(label) => label}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Service Status - Bar Chart */}
                  <div>
                    <h4 className="text-sm font-medium mb-4 text-center">Service Status</h4>
                    <ResponsiveContainer width="100%" height={220}>                        <BarChart
                        data={[
                          { name: 'In Progress', value: jobs.filter(j => j.status === 'In Progress').length },
                          { name: 'Scheduled', value: jobs.filter(j => j.status === 'Scheduled').length },
                          { name: 'Completed', value: jobs.filter(j => j.status === 'Completed').length },
                        ]}
                        margin={{ top: 5, right: 0, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          formatter={(value) => [`${value} job${value !== 1 ? 's' : ''}`]}
                          labelFormatter={(name) => `${name} Jobs`}
                        />                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {[
                            { name: 'In Progress', color: '#8b5cf6' },
                            { name: 'Scheduled', color: '#3b82f6' },
                            { name: 'Completed', color: '#10b981' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>          {/* Upcoming Services */}
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
          )}          {/* Recent Job Updates */}
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
                    {recentActivity.map(activity => (
                      <div key={activity.id} className="flex items-start gap-4 pb-5 border-b last:border-0 last:pb-0">
                        <div className="bg-muted rounded-full p-2">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
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
                  <Button variant="outline" className="w-full">
                    View All Updates
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}</div>

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
              ) : (                <div className="text-center">
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