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
  Loader2
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
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';
import { getWelcomeMessage, getClientNameByUuid } from '@/utils/clientUtils';

const ClientHome = () => {
  const navigate = useNavigate();
  // State variables
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    jobs: [],
    quotes: [],
    upcomingServices: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [currentSite, setCurrentSite] = useState('Main Office');
  const [sites, setSites] = useState(['Main Office', 'Warehouse', 'Branch Office']);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome back');
  const [clientName, setClientName] = useState('');
    // Get client data from localStorage
  const getClientData = () => {
    const clientData = localStorage.getItem('client_data');
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
  const clientId = clientData?.uuid;

  // Debugging - check what client data we have
  useEffect(() => {
    console.log('Current clientData:', clientData);
    console.log('Current clientId:', clientId);
  }, [clientData, clientId]);
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
  
  // Fetch dashboard data from the backend
  const fetchDashboardData = useCallback(async (showRefreshIndicator = true) => {
    if (showRefreshIndicator) {
      setDataRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Call our new backend endpoint for dashboard stats with the correct path prefix '/fetch'
      // Fall back to a generic endpoint if no clientId is available
      const response = await axios.get(`${API_URL}/fetch/dashboard-stats/${clientId || 'default'}`);
      setDashboardData(response.data);
      
      // Only fetch notifications if we have a valid clientId
      if (clientId) {
        try {
          const notificationsResponse = await axios.get(`${API_URL}/api/notifications?clientId=${clientId}`);
          setNotifications(Array.isArray(notificationsResponse.data) ? notificationsResponse.data : []);
        } catch (notificationErr) {
          console.warn('Error fetching notifications:', notificationErr);
          // Don't let notification failure block the whole dashboard
        }
      }
      
      // Set last updated timestamp
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
      
      // If API fails, load mock data for development purposes
      loadMockData();
    } finally {
      setLoading(false);
      setDataRefreshing(false);
    }
  }, [clientId]);
  
  // Initial data loading
  useEffect(() => {
    fetchDashboardData(false);
    
    // Set up interval for real-time updates
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [fetchDashboardData]);
  
  // For demo purposes, if API is not available, load mock data
  const loadMockData = () => {
    // Mock data structure to match our backend API response
    const mockData = {
      stats: {
        activeJobs: 3,
        inProgressJobs: 1,
        pendingQuotes: 1,
        quotesTotalValue: "4850.00",
        completedJobs: 1,
        completedJobsLast30Days: 1,
        upcomingServices: 2,
        nextServiceDate: "2025-04-20",
        statusBreakdown: {
          quotes: "25.0",
          inProgress: "25.0",
          scheduled: "25.0",
          completed: "25.0"
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
          attachments: 2
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
          attachments: 3
        },
        {
          id: 'JOB-2025-0415',
          jobNumber: 'JOB-2025-0415',
          title: 'Surveillance System Maintenance',
          status: 'Scheduled',
          date: '2025-04-20',
          type: 'Work Order',
          description: 'Routine maintenance check on surveillance system',
          assignedTech: 'Miguel Rodriguez',
          location: 'Branch Office',
          attachments: 0
        }
      ],
      quotes: [
        {
          id: 'JOB-2025-0422',
          quoteNumber: 'QUOTE-2025-0422',
          title: 'Security System Upgrade',
          status: 'Quote',
          date: '2025-04-14',
          dueDate: '2025-04-25',
          type: 'Quote',
          price: "4850.00",
          description: 'Upgrade existing security cameras to 4K resolution',
          location: 'Warehouse',
          attachments: 1
        }
      ],
      upcomingServices: [
        { 
          id: 1, 
          title: 'Surveillance System Maintenance', 
          date: '2025-04-20', 
          technician: 'Miguel Rodriguez', 
          location: 'Branch Office' 
        },
        { 
          id: 2, 
          title: 'Network Performance Review', 
          date: '2025-04-28', 
          technician: 'Alex Johnson', 
          location: 'Main Office' 
        }
      ],
      recentActivity: [
        { id: 1, type: 'job_created', title: 'New Job Request Created', description: 'Network Installation', date: '2025-04-15' },
        { id: 2, type: 'quote_received', title: 'New Quote Received', description: 'Security System Upgrade', date: '2025-04-14' },
        { id: 3, type: 'job_completed', title: 'Job Completed', description: 'Digital Signage Installation', date: '2025-04-12' },
        { id: 4, type: 'document_uploaded', title: 'Document Uploaded', description: 'Network Diagram.pdf', date: '2025-04-11' },
        { id: 5, type: 'invoice_paid', title: 'Invoice Paid', description: 'INV-2025-0056', date: '2025-04-08' }
      ]
    };
    
    setDashboardData(mockData);
    
    // Mock notifications
    setNotifications([
      { id: 1, type: 'quote', message: 'New quote available for Security System Upgrade', time: '2 hours ago', read: false },
      { id: 2, type: 'schedule', message: 'Technician scheduled for Apr 20', time: '1 day ago', read: true },
      { id: 3, type: 'job', message: 'Digital Signage Installation completed', time: '2 days ago', read: true },
    ]);
    
    setLastUpdated(new Date());
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData(true);
  };
    const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'bg-purple-600 text-white';
      case 'Quote': return 'bg-orange-500 text-white';
      case 'Work Order': return 'bg-blue-600 text-white';
      case 'Completed': return 'bg-green-600 text-white';
      case 'Scheduled': return 'bg-purple-600 text-white';
      case 'On Hold': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  const getActivityIcon = (type) => {
    switch(type) {
      case 'job_created': return <FileText className="text-blue-500" />;
      case 'quote_received': return <FileText className="text-orange-500" />;
      case 'job_completed': return <CheckCircle className="text-green-500" />;
      case 'document_uploaded': return <FileBarChart className="text-purple-500" />;
      case 'invoice_paid': return <BarChart3 className="text-green-500" />;
      default: return <AlertCircle className="text-gray-500" />;
    }
  };
  
  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Extract data from the dashboard data object for easier use
  const { stats, jobs, quotes, upcomingServices, recentActivity } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header with welcome message, notifications and site selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">        <div>
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
          <Select value={currentSite} onValueChange={setCurrentSite}>
            <SelectTrigger className="w-[180px]">
              <Building size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sites.map(site => (
                <SelectItem key={site} value={site}>{site}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex justify-between items-center">
                <span>Notifications</span>
                <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                  Mark all read
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <DropdownMenuItem key={notification.id} className={`p-3 ${!notification.read ? 'bg-muted/50' : ''}`}>
                    <div className="flex gap-3 items-start">
                      {notification.type === 'quote' && <FileText className="text-amber-500" size={20} />}
                      {notification.type === 'schedule' && <Calendar className="text-purple-500" size={20} />}
                      {notification.type === 'job' && <CheckCircle className="text-green-500" size={20} />}
                      <div>
                        <p className="font-medium text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
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
          
          <Button onClick={() => navigate('/client/quotes')}>Request Quote</Button>
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
      
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Quotes</CardTitle>
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
                  {quotes.length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${quotes.reduce((sum, quote) => sum + parseFloat(quote.price?.replace(/[$,]/g, '') || 0), 0).toLocaleString()} total value
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="link" className="p-0" onClick={() => navigate('/client/quotes')}>
              View all quotes <ArrowRight size={16} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>
        
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
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Overview of your current services by status</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(index => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Quotes</div>
                      <div className="text-sm text-muted-foreground">
                        {quotes.length}/{jobs.length} ({jobs.length ? Math.round(quotes.length/jobs.length*100) : 0}%)
                      </div>
                    </div>
                    <Progress value={jobs.length ? quotes.length/jobs.length*100 : 0} className="h-2 bg-muted" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">In Progress</div>
                      <div className="text-sm text-muted-foreground">
                        {jobs.filter(j => j.status === 'In Progress').length}/{jobs.length} 
                        ({jobs.length ? Math.round(jobs.filter(j => j.status === 'In Progress').length/jobs.length*100) : 0}%)
                      </div>
                    </div>
                    <Progress 
                      value={jobs.length ? jobs.filter(j => j.status === 'In Progress').length/jobs.length*100 : 0} 
                      className="h-2 bg-muted" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Scheduled</div>
                      <div className="text-sm text-muted-foreground">
                        {jobs.filter(j => j.status === 'Scheduled').length}/{jobs.length} 
                        ({jobs.length ? Math.round(jobs.filter(j => j.status === 'Scheduled').length/jobs.length*100) : 0}%)
                      </div>
                    </div>
                    <Progress 
                      value={jobs.length ? jobs.filter(j => j.status === 'Scheduled').length/jobs.length*100 : 0} 
                      className="h-2 bg-muted" 
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">Completed</div>
                      <div className="text-sm text-muted-foreground">
                        {jobs.filter(j => j.status === 'Completed').length}/{jobs.length} 
                        ({jobs.length ? Math.round(jobs.filter(j => j.status === 'Completed').length/jobs.length*100) : 0}%)
                      </div>
                    </div>
                    <Progress 
                      value={jobs.length ? jobs.filter(j => j.status === 'Completed').length/jobs.length*100 : 0} 
                      className="h-2 bg-muted" 
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Job Updates */}
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
              ) : recentActivity.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No recent updates</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    When there are updates to your jobs and services, they will appear here.
                  </p>
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
        </div>
      </div>
    </div>
  );
};

export default ClientHome;