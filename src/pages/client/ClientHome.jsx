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

const ClientHome = () => {
  const navigate = useNavigate();
  // State variables
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataRefreshing, setDataRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [currentSite, setCurrentSite] = useState('Main Office');
  const [sites, setSites] = useState(['Main Office', 'Warehouse', 'Branch Office']);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Client ID would come from auth context in a real app, using a placeholder for now
  const clientId = 'client123'; // This should be replaced with actual client ID from auth
  
  // Fetch all data function that can be reused
  const fetchAllData = useCallback(async (showRefreshIndicator = true) => {
    if (showRefreshIndicator) {
      setDataRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      // Use Promise.all to fetch data in parallel
      const [jobsResponse, notificationsResponse, activitiesResponse, servicesResponse, invoicesResponse] = await Promise.all([
        axios.get(`${API_URL}/api/jobs?clientId=${clientId}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/notifications?clientId=${clientId}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/activities?clientId=${clientId}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/services/upcoming?clientId=${clientId}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/api/invoices?clientId=${clientId}`).catch(() => ({ data: [] })),
      ]);
      
      // Process data
      const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
      setJobs(jobsData);
      setQuotes(jobsData.filter(job => job.type === 'Quote'));
      setWorkOrders(jobsData.filter(job => job.type === 'Work Order'));
      
      setNotifications(Array.isArray(notificationsResponse.data) ? notificationsResponse.data : []);
      setRecentActivity(Array.isArray(activitiesResponse.data) ? activitiesResponse.data : []);
      setUpcomingServices(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);
      setInvoices(Array.isArray(invoicesResponse.data) ? invoicesResponse.data : []);
      
      // Set last updated timestamp
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load some dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
      setDataRefreshing(false);
    }
  }, [clientId]);
  
  // Initial data loading
  useEffect(() => {
    fetchAllData(false);
    
    // Set up interval for real-time updates
    const intervalId = setInterval(() => {
      fetchAllData(true);
    }, 60000); // Refresh every minute
    
    return () => clearInterval(intervalId);
  }, [fetchAllData]);
  
  // For demo purposes, if API is not available, load mock data
  useEffect(() => {
    if (loading && !jobs.length) {
      // Simulate API fetch delay
      const timeoutId = setTimeout(() => {
        const mockJobs = [
          {
            id: 'JOB-2025-0423',
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
            id: 'JOB-2025-0422',
            title: 'Security System Upgrade',
            status: 'Quote',
            date: '2025-04-14',
            dueDate: '2025-04-25',
            type: 'Quote',
            price: '$4,850.00',
            description: 'Upgrade existing security cameras to 4K resolution',
            location: 'Warehouse',
            attachments: 1
          },
          {
            id: 'JOB-2025-0418',
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
            title: 'Surveillance System Maintenance',
            status: 'Scheduled',
            date: '2025-04-20',
            type: 'Work Order',
            description: 'Routine maintenance check on surveillance system',
            assignedTech: 'Miguel Rodriguez',
            location: 'Branch Office',
            attachments: 0
          }
        ];
        
        setJobs(mockJobs);
        setQuotes(mockJobs.filter(job => job.type === 'Quote'));
        setWorkOrders(mockJobs.filter(job => job.type === 'Work Order'));
        
        // Add notifications
        setNotifications([
          { id: 1, type: 'quote', message: 'New quote available for Security System Upgrade', time: '2 hours ago', read: false },
          { id: 2, type: 'schedule', message: 'Technician scheduled for Apr 20', time: '1 day ago', read: true },
          { id: 3, type: 'job', message: 'Digital Signage Installation completed', time: '2 days ago', read: true },
        ]);

        // Add recent activity
        setRecentActivity([
          { id: 1, type: 'job_created', title: 'New Job Request Created', description: 'Network Installation', date: '2025-04-15' },
          { id: 2, type: 'quote_received', title: 'New Quote Received', description: 'Security System Upgrade', date: '2025-04-14' },
          { id: 3, type: 'job_completed', title: 'Job Completed', description: 'Digital Signage Installation', date: '2025-04-12' },
          { id: 4, type: 'document_uploaded', title: 'Document Uploaded', description: 'Network Diagram.pdf', date: '2025-04-11' },
          { id: 5, type: 'invoice_paid', title: 'Invoice Paid', description: 'INV-2025-0056', date: '2025-04-08' }
        ]);

        // Add upcoming services
        setUpcomingServices([
          { id: 1, title: 'Surveillance System Maintenance', date: '2025-04-20', technician: 'Miguel Rodriguez', location: 'Branch Office' },
          { id: 2, title: 'Network Performance Review', date: '2025-04-28', technician: 'Alex Johnson', location: 'Main Office' }
        ]);

        // Add invoices
        setInvoices([
          { id: 'INV-2025-0056', jobId: 'JOB-2025-0405', amount: 1250.00, status: 'Paid', dueDate: '2025-04-05', paidDate: '2025-04-08' },
          { id: 'INV-2025-0042', jobId: 'JOB-2025-0389', amount: 3200.00, status: 'Paid', dueDate: '2025-03-25', paidDate: '2025-03-24' },
          { id: 'INV-2025-0068', jobId: 'JOB-2025-0418', amount: 2750.00, status: 'Due', dueDate: '2025-04-25' }
        ]);
        
        setLastUpdated(new Date());
        setLoading(false);
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [loading, jobs.length]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchAllData(true);
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-600 text-white';
      case 'Quote': return 'bg-amber-500 text-white';
      case 'Completed': return 'bg-green-600 text-white';
      case 'Scheduled': return 'bg-purple-600 text-white';
      case 'On Hold': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'job_created': return <FileText className="text-blue-500" />;
      case 'quote_received': return <FileText className="text-amber-500" />;
      case 'job_completed': return <CheckCircle className="text-green-500" />;
      case 'document_uploaded': return <FileBarChart className="text-purple-500" />;
      case 'invoice_paid': return <BarChart3 className="text-green-500" />;
      default: return <AlertCircle className="text-gray-500" />;
    }
  };
  
  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      {/* Header with welcome message, notifications and site selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, TechSolutions Inc</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <CardTitle className="text-lg">Scheduled Services</CardTitle>
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
                  {jobs.filter(job => job.status === 'Scheduled').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Next: {jobs.find(job => job.status === 'Scheduled')?.date || 'None scheduled'}
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="link" className="p-0" onClick={() => navigate('/client/jobs')}>
              View schedule <ArrowRight size={16} className="ml-1" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Open Invoices</CardTitle>
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
                  {invoices.filter(inv => inv.status === 'Due').length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  ${invoices.filter(inv => inv.status === 'Due').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()} outstanding
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="link" className="p-0" onClick={() => navigate('/client/invoices')}>
              View invoices <ArrowRight size={16} className="ml-1" />
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

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Upcoming Services */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Services</CardTitle>
              {dataRefreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(index => (
                    <div key={index} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  ))}
                </div>
              ) : upcomingServices.length > 0 ? (
                <div className="space-y-4">
                  {upcomingServices.map(service => (
                    <div key={service.id} className="flex flex-col space-y-2 pb-4 border-b last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{service.title}</h4>
                        <Badge variant="outline" className="font-normal">{service.location}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar size={14} className="mr-2" />
                        {new Date(service.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User size={14} className="mr-2" />
                        Technician: {service.technician}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No upcoming services</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    You have no scheduled services at this time.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/client/jobs')}>
                View Full Schedule
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/client/quotes')}>
                <FileText className="mr-2 h-4 w-4" />
                Request a Quote
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/client/jobs')}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Report an Issue
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/client/support')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/client/invoices')}>
                <FileBarChart className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
            </CardContent>
          </Card>

          {/* Most Recent Invoice */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Invoice</CardTitle>
              {dataRefreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ) : invoices.length > 0 ? (
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{invoices[0].id}</div>
                    <Badge variant={invoices[0].status === 'Paid' ? 'success' : 'secondary'}>
                      {invoices[0].status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Job: {invoices[0].jobId}
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <div className="text-muted-foreground">Amount:</div>
                    <div className="font-medium">${invoices[0].amount.toLocaleString()}</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="text-muted-foreground">
                      {invoices[0].status === 'Paid' ? 'Paid on:' : 'Due by:'}
                    </div>
                    <div>
                      {invoices[0].status === 'Paid' 
                        ? new Date(invoices[0].paidDate).toLocaleDateString() 
                        : new Date(invoices[0].dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent invoices
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/client/invoices')}>
                View All Invoices
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientHome;