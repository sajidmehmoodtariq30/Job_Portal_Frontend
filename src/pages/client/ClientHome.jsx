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

const ClientHome = () => {
  const navigate = useNavigate();
  const { notifications: contextNotifications, unreadCount, clearAll, markAsRead } = useNotifications();
  const { hasValidAssignment } = useClientAssignment();
  
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
  const { stats, jobs, upcomingServices, recentActivity } = dashboardData;

  // Calculate quotes count
  const quotesCount = jobs.filter(job => job.status === 'Quote').length || stats.quotes || 0;

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
                  <div className="text-3xl font-bold">
                    {jobs.filter(job => job.status !== 'Completed' && (job.type === 'Work Order' || job.status === 'Work Order')).length}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {jobs.filter(job => (job.status === 'In Progress' || job.status === 'Work Order') && (job.type === 'Work Order' || job.status === 'Work Order')).length} in progress
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0" onClick={() => navigate('/client/jobs', { state: { filterByStatus: 'Work Order', filterByType: 'Work Order' } })}>
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
                <div className="text-3xl font-bold text-orange-600">
                  {quotesCount}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Active quotes
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="link" className="p-0" onClick={() => navigate('/client/jobs', { state: { filterByStatus: 'Quote' } })}>
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
                    Work orders completed
                  </p>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="link" className="p-0" onClick={() => navigate('/client/jobs', { state: { filterByStatus: 'Completed', filterByType: 'Work Order' } })}>
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
                          <h4 className="text-sm font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {activity.type === 'job_status_update' ? activity.description : activity.description}
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
