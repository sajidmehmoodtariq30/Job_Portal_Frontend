import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from "@/components/UI/button"
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
} from "@/components/UI/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select"
import { Label } from "@/components/UI/label"
import { FileText, MessageSquare, StickyNote, Bell, CheckCircle, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu"
import AdminChatRoom from "@/components/UI/admin/AdminChatRoom"
import NotesTab from "@/components/UI/NotesTab"
import NotificationDebugger from "@/components/NotificationDebugger"
import { useNotifications } from '@/context/NotificationContext'
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts'
import { Skeleton } from "@/components/UI/skeleton"
import { API_ENDPOINTS } from '@/lib/apiConfig'
import { format, subDays } from 'date-fns'

// Default color scheme for charts
const COLORS = {
  'Quote': '#8884d8',
  'Quotes': '#8884d8', // Handle plural form
  'Work Order': '#82ca9d',
  'Work Orders': '#82ca9d', // Handle plural form
  'In Progress': '#ffc658',
  'Completed': '#0088FE',
}

const AdminHome = () => {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications()
  // State for job request dialog
  const [isJobRequestOpen, setIsJobRequestOpen] = useState(false)
    // State management for real data
  const [loading, setLoading] = useState(true)
  const [jobStatusData, setJobStatusData] = useState([])
  const [recentActivityData, setRecentActivityData] = useState([])
  const [recentJobs, setRecentJobs] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedJob, setSelectedJob] = useState(null)
  const [jobClientName, setJobClientName] = useState("Unknown Client")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')

  // Handle refresh button click
  const handleRefresh = () => {
    setLoading(true)
    setRefreshTrigger(prev => prev + 1)
  }

  // Process ServiceM8 tokens from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');
    const token_type = params.get('token_type');
    const scope = params.get('scope');
    if (access_token && refresh_token && expires_in && token_type && scope) {
      const tokenData = {
        access_token,
        refresh_token,
        expires_in,
        token_type,
        scope: decodeURIComponent(scope)
      };
      localStorage.setItem('admin_token', JSON.stringify(tokenData));
      // Remove tokens from URL for cleanliness
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        console.log('AdminHome: Fetching dashboard data...')
        // Fetch all jobs data
        const jobsResponse = await axios.get(API_ENDPOINTS.JOBS.FETCH_ALL, {
          params: { timestamp: new Date().getTime() } // Prevent caching
        })
        
        console.log('AdminHome: Jobs response received:', jobsResponse)
        console.log('AdminHome: Jobs response data:', jobsResponse.data)
        console.log('AdminHome: Jobs response data type:', typeof jobsResponse.data)
        console.log('AdminHome: Is jobs response data an array?', Array.isArray(jobsResponse.data))
        
        // Handle different response structures
        let jobsData;
        if (Array.isArray(jobsResponse.data)) {
          jobsData = jobsResponse.data;
        } else if (jobsResponse.data && Array.isArray(jobsResponse.data.jobs)) {
          jobsData = jobsResponse.data.jobs;
        } else if (jobsResponse.data && jobsResponse.data.data && Array.isArray(jobsResponse.data.data)) {
          jobsData = jobsResponse.data.data;
        } else {
          console.error('AdminHome: Unexpected response structure:', jobsResponse.data);
          jobsData = [];
        }
        
        console.log('AdminHome: Processed jobs data:', jobsData)
        console.log('AdminHome: Jobs count:', jobsData.length)

        // Process job status data for pie chart
        const statusCounts = {
          'Quote': 0,
          'Work Order': 0,
          'In Progress': 0,
          'Completed': 0
        }
        
        // Debug: Log all jobs and their statuses
        console.log('AdminHome: All jobs data:', jobsData);
        console.log('AdminHome: Jobs count:', jobsData.length);
        
        // Debug: Log all unique statuses found in jobs
        const uniqueStatuses = [...new Set(jobsData.map(job => job.status))];
        console.log('AdminHome: Unique job statuses found:', uniqueStatuses);
        
        jobsData.forEach((job, index) => {
          console.log(`AdminHome: Job ${index + 1}:`, {
            uuid: job.uuid,
            status: job.status,
            description: job.job_description || job.description,
            client: job.client_name || job.company_name
          });
          
          // Handle both singular and plural forms, and normalize status values
          let normalizedStatus = job.status;
          
          // Map common ServiceM8 status variations to our expected values
          if (job.status === 'Quotes') {
            normalizedStatus = 'Quote';
          } else if (job.status === 'Work Orders') {
            normalizedStatus = 'Work Order';
          }
          
          if (normalizedStatus in statusCounts) {
            statusCounts[normalizedStatus]++
            console.log(`AdminHome: Counted job with status "${job.status}" as "${normalizedStatus}"`);
          } else {
            console.log(`AdminHome: Unknown status found: "${job.status}" -> normalized to: "${normalizedStatus}"`);
          }
        })
        
        console.log('AdminHome: Final status counts:', statusCounts);
        
        const formattedStatusData = Object.keys(statusCounts).map(status => ({
          name: status,
          value: statusCounts[status],
          color: COLORS[status]
        }))
        
        setJobStatusData(formattedStatusData)
        
        // Sort jobs by date to get the most recent ones
        const sortedJobs = [...jobsData].sort((a, b) => {
          return new Date(b.date) - new Date(a.date)
        }).slice(0, 5) // Get 5 most recent jobs        // Fetch clients data to display client names
        const clientsResponse = await axios.get(API_ENDPOINTS.CLIENTS.FETCH_ALL)
        const clientsData = Array.isArray(clientsResponse.data) ?
          clientsResponse.data : 
          (clientsResponse.data.data || [])
          
        // Map client UUIDs to names for recent jobs - keep the full job data
        const jobsWithClientNames = sortedJobs.map(job => {
          const client = clientsData.find(c => c.uuid === job.company_uuid) || {}
          return {
            ...job, // Keep all original job data
            client: client.name || 'Unknown Client',
          }
        })
        
        setRecentJobs(jobsWithClientNames)
        
        // Create activity data for last 5 days
        const activityData = []
        for (let i = 4; i >= 0; i--) {
          const date = subDays(new Date(), i)
          const dayStr = format(date, 'EEE') // Mon, Tue, etc.
          const dateStr = format(date, 'yyyy-MM-dd')
          
          // Count jobs by status for this day
          const dayJobs = jobsData.filter(job => job.date?.includes(dateStr))
          
          activityData.push({
            day: dayStr,
            date: dateStr,
            quotes: dayJobs.filter(job => job.status === 'Quote').length,
            workOrders: dayJobs.filter(job => job.status === 'Work Order').length,
            completed: dayJobs.filter(job => job.status === 'Completed').length
          })
        }
          setRecentActivityData(activityData)
      } catch (error) {
        console.error('AdminHome: Error fetching dashboard data:', error)
        console.error('AdminHome: Error details:', error.response?.data || error.message)
        console.error('AdminHome: Error status:', error.response?.status)
        // Set empty defaults if fetch fails
        setJobStatusData([])
        setRecentJobs([])
        setRecentActivityData([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [refreshTrigger]) // Re-fetch when refresh is triggered
  
  // Render skeleton loading components
  const renderSkeletonCard = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <div className="h-[220px] pt-4">
        <Skeleton className="h-full w-full rounded-md" />
      </div>
    </div>
  )
  
  const renderSkeletonTable = () => (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    if (dateString === '0000-00-00 00:00:00') return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };  // Helper function to get job number - now uses ServiceM8's generated_job_id
  const getJobNumber = (job) => {
    // Use ServiceM8's generated job ID if available, otherwise fallback to UUID formatting
    if (job.generated_job_id) {
      return job.generated_job_id;
    }
    
    // Fallback for old data or missing generated_job_id
    if (!job.uuid) return 'N/A';
    
    // If we already have a formatted job ID (numeric format), use it directly
    if (/^\d+$/.test(job.uuid)) {
      return job.uuid;
    }
    
    // Extract only numeric digits from UUID as last resort
    const numericDigits = job.uuid.replace(/[^0-9]/g, '');
    const jobNumber = numericDigits.padStart(8, '0').slice(0, 8);
    return jobNumber;
  };

  // Helper function to format job address
  const formatJobAddress = (job) => {
    if (!job) return 'No location specified';

    // Try site name first (if available from our enrichment)
    if (job.site_name || job.location_name) {
      const siteName = job.site_name || job.location_name;
      if (job.location_address) {
        return `${siteName} - ${job.location_address}`;
      }
      return siteName;
    }

    // Try job_address field first (this is what ServiceM8 uses)
    if (job.job_address) {
      return job.job_address.replace(/\n/g, ', ').trim();
    }

    // Try location_address field
    if (job.location_address) {
      return job.location_address;
    }

    // Build address from geo fields
    const geoParts = [];
    if (job.geo_number) geoParts.push(job.geo_number);
    if (job.geo_street) geoParts.push(job.geo_street);
    if (job.geo_city) geoParts.push(job.geo_city);
    if (job.geo_state) geoParts.push(job.geo_state);
    if (job.geo_postcode) geoParts.push(job.geo_postcode);
    
    if (geoParts.length > 0) {
      return geoParts.join(', ');
    }

    // Check for other possible location fields
    const possibleLocationFields = [
      'address', 'street_address', 'service_address', 
      'site_address', 'work_address', 'job_location', 'billing_address'
    ];
    
    for (const field of possibleLocationFields) {
      if (job[field]) {
        return job[field].replace(/\n/g, ', ').trim();
      }
    }

    // If we have location_uuid but no address, show that with note
    if (job.location_uuid) {
      return `Location UUID: ${job.location_uuid} (Address not loaded)`;
    }

    return 'No location specified';
  };// Set selected status when job changes
  useEffect(() => {
    if (selectedJob) {
      setSelectedStatus(selectedJob.status);
    }
  }, [selectedJob]);

  // Function to update job status
  const handleStatusUpdate = async () => {
    if (!selectedJob || !selectedStatus || selectedJob.status === selectedStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const jobId = selectedJob.uuid;
      const response = await axios.put(`${API_ENDPOINTS.JOBS.UPDATE.replace(':id', jobId)}`, {
        status: selectedStatus
      });
      
      if (response.data.success) {
        // Update the job in state
        setSelectedJob(prev => ({...prev, status: selectedStatus}));
        
        // Update the job in the recentJobs array
        setRecentJobs(prevJobs => 
          prevJobs.map(job => job.uuid === jobId ? {...job, status: selectedStatus} : job)
        );
        
        // Also update status counts for the pie chart
        const updatedStatusData = [...jobStatusData];
        
        // Decrement old status count
        const oldStatusIndex = updatedStatusData.findIndex(item => item.name === selectedJob.status);
        if (oldStatusIndex >= 0) {
          updatedStatusData[oldStatusIndex] = {
            ...updatedStatusData[oldStatusIndex],
            value: Math.max(0, updatedStatusData[oldStatusIndex].value - 1)
          };
        }
        
        // Increment new status count
        const newStatusIndex = updatedStatusData.findIndex(item => item.name === selectedStatus);
        if (newStatusIndex >= 0) {
          updatedStatusData[newStatusIndex] = {
            ...updatedStatusData[newStatusIndex],
            value: updatedStatusData[newStatusIndex].value + 1
          };
        }
        
        setJobStatusData(updatedStatusData);
      } else {
        console.error('Failed to update job status:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };
  // Handle view job details - show dialog instead of navigating
  const handleViewJob = async (job) => {
    // Set the job immediately with all available data
    setSelectedJob(job);
    
    // Set the client name we already have
    if (job.client) {
      setJobClientName(job.client);
    } else {
      setJobClientName("Unknown Client");
    }

    // If we already have comprehensive job data, no need to fetch again
    if (job.job_description || job.job_address || job.location_address || job.geo_street) {
      return;
    }

    // Only fetch if we don't have detailed data
    try {
      const jobId = job.uuid;
      const response = await axios.get(`${API_ENDPOINTS.JOBS.FETCH_BY_ID.replace(':id', jobId)}`);
      
      if (response.data && (response.data.success || response.data.uuid)) {
        const fullJobData = response.data.data || response.data;
        
        // Update with complete data while preserving client name
        setSelectedJob({
          ...fullJobData,
          client: job.client || fullJobData.client || "Unknown Client"
        });
      }
    } catch (error) {
      console.error('Error fetching complete job details:', error);
      // Keep the job data we already have
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          {/* Request Job Button */}
          <Button variant="default" onClick={() => setIsJobRequestOpen(true)}>
            Request Job
          </Button>
          {/* Notification Button */}
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
                  <Button variant="ghost" size="sm" onClick={() => notifications.forEach(n => !n.read && markAsRead(n.id))}>
                    Mark all read
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear all
                  </Button>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.slice(0, 5).map(notification => (
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
                      {notification.type?.includes('quote') && <FileText className="text-orange-500" size={20} />}
                      <div>
                        <p className="font-medium text-sm">{notification.title || notification.message}</p>
                        <p className="text-xs text-muted-foreground">
      {/* Job Request Dialog */}
      <Dialog open={isJobRequestOpen} onOpenChange={setIsJobRequestOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Request a New Job</DialogTitle>
            <DialogDescription>
              Fill out the form below to request a new job. (Form fields can be added here.)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">Job request form coming soon.</p>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsJobRequestOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  <div className="text-center py-4 text-muted-foreground">
                    No notifications yet
                  </div>
                </DropdownMenuItem>
              )}
              {notifications.length > 5 && (
                <DropdownMenuSeparator />
              )}
              {notifications.length > 5 && (
                <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700">
                  View all notifications
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>          <Button onClick={handleRefresh} disabled={loading} className="admin-btn-primary admin-focus">
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">`
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
          <TabsContent value="overview" className="space-y-4 admin-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Job Status Overview</CardTitle>
                <CardDescription>Current status of all jobs in the system</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {loading ? (
                  renderSkeletonCard()
                ) : jobStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}`}
                      >
                        {jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} Jobs`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No job status data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quotes Box */}
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Quotes</CardTitle>
                <CardDescription>Active quotes in the system</CardDescription>
              </CardHeader>
              <CardContent className="h-64 flex flex-col items-center justify-center">
                {loading ? (
                  renderSkeletonCard()
                ) : (
                  <>
                    <div className="text-5xl font-bold text-orange-600">
                      {Array.isArray(jobStatusData)
                        ? (jobStatusData.find(s => s.name === 'Quote')?.value || 0)
                        : 0}
                    </div>
                    <div className="mt-2 text-lg text-muted-foreground">Active Quotes</div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Job activity over the past 5 days</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {loading ? (
                  renderSkeletonCard()
                ) : recentActivityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentActivityData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip labelFormatter={(day) => {
                        const dayData = recentActivityData.find(d => d.day === day);
                        return `${day} (${dayData?.date || 'Unknown date'})`;
                      }} />
                      <Legend />
                      <Bar dataKey="quotes" name="Quotes" fill="#8884d8" />
                      <Bar dataKey="workOrders" name="Work Orders" fill="#82ca9d" />
                      <Bar dataKey="completed" name="Completed" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No activity data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Latest job updates in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                renderSkeletonTable()
              ) : (                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left">Job Number</th>
                        <th className="py-3 text-left">Client</th>
                        <th className="py-3 text-left">Status</th>
                        <th className="py-3 text-left">Date</th>
                        <th className="py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.length > 0 ? (
                        recentJobs.map((job, index) => (
                          <tr key={job.uuid} className="border-b">
                            <td className="py-3">
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                {getJobNumber(job) || `JOB-${index + 1}`}
                              </span>
                            </td>
                            <td className="py-3">{job.client}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                job.status === 'Quote' 
                                  ? 'bg-orange-100 text-orange-800' 
                                  : job.status === 'Work Order' 
                                    ? 'bg-blue-100 text-blue-800'
                                    : job.status === 'In Progress'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-green-100 text-green-800'
                              }`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="py-3">{job.date.split(" ")[0]}</td>
                            <td className="py-3">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewJob(job)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-4 text-center text-muted-foreground">
                            No recent jobs found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4 admin-content">
          <Card>
            <CardHeader>
              <CardTitle>Job Management</CardTitle>
              <CardDescription>Handle all job-related operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-lg">Manage your jobs and workflow</p>
                <Button onClick={() => navigate('/admin/jobs')}>View All Jobs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4 admin-content">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Invite and manage client access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-lg">Manage your clients and their access</p>
                <Button onClick={() => navigate('/admin/clients')}>View Clients</Button>
              </div>            </CardContent>
          </Card>
          
          {/* Debug Tools */}
          <NotificationDebugger />
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-h-[95vh] overflow-y-auto max-w-[98vw] md:max-w-6xl lg:max-w-7xl w-full p-3 md:p-6 rounded-lg">
              <DialogHeader className="border-b pb-3 md:pb-4">
              <DialogTitle className="text-lg md:text-2xl font-bold truncate">
                {jobClientName}
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm">
                {formatJobAddress(selectedJob)}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="mt-3 md:mt-4">              <TabsList className="w-full flex-wrap gap-1">
                <TabsTrigger value="details" className="text-xs md:text-base flex-1 md:flex-none">Details</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs md:text-base flex-1 md:flex-none">
                  <div className="flex items-center justify-center">
                    <StickyNote className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Notes
                  </div>
                </TabsTrigger>
                <TabsTrigger value="chat" className="relative text-xs md:text-base flex-1 md:flex-none">
                  <div className="flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Chat
                  </div>
                </TabsTrigger>
                <TabsTrigger value="attachments" className="text-xs md:text-base flex-1 md:flex-none">Attachments</TabsTrigger>
              </TabsList>
                <TabsContent value="details" className="p-0 mt-3 md:mt-4">
                <div className="grid gap-3 md:gap-5">
                  <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                    <Label className="font-bold text-xs md:text-sm">Service Location</Label>
                    <p className="text-xs md:text-sm break-words">{formatJobAddress(selectedJob)}</p>
                    {selectedJob.location_uuid && (
                      <p className="text-xs text-muted-foreground">Location ID: {selectedJob.location_uuid}</p>
                    )}
                  </div>

                  <div className="space-y-1 md:space-y-2 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Label className="font-bold text-sm md:text-base text-blue-800">Client Information</Label>
                    <p className="text-sm md:text-base font-medium bg-white p-2 rounded border">{jobClientName}</p>
                    <div className="mt-1">
                    </div>
                  </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                    <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                      <Label className="font-bold text-xs md:text-sm">Status</Label>
                      <span className={`px-2 py-1 rounded text-xs inline-block ${
                        selectedJob.status === 'Quote'
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
                      <Label className="font-bold text-xs md:text-sm">Job Number</Label>
                      <p className="text-xs md:text-sm">{getJobNumber(selectedJob)}</p>
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
                            <SelectItem value="In Progress">In Progress</SelectItem>
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
                  
                  {selectedJob.work_done_description && (
                    <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                      <Label className="font-bold text-xs md:text-sm">Work Done Description</Label>
                      <div className="max-h-28 md:max-h-48 overflow-y-auto bg-white p-2 rounded border border-gray-200">
                        <p className="text-xs md:text-sm whitespace-pre-wrap">{selectedJob.work_done_description}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                    <Label className="font-bold text-xs md:text-sm">Location Details</Label>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                        <p><span className="font-semibold">Address:</span> {selectedJob.job_address || selectedJob.location_address || 'N/A'}</p>
                        {selectedJob.geo_street && <p><span className="font-semibold">Street:</span> {selectedJob.geo_number || ''} {selectedJob.geo_street}</p>}
                        {selectedJob.geo_city && <p><span className="font-semibold">City:</span> {selectedJob.geo_city}</p>}
                        {selectedJob.geo_state && <p><span className="font-semibold">State:</span> {selectedJob.geo_state}</p>}
                        {selectedJob.geo_postcode && <p><span className="font-semibold">Postcode:</span> {selectedJob.geo_postcode}</p>}
                        {selectedJob.geo_country && <p><span className="font-semibold">Country:</span> {selectedJob.geo_country}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                    <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                      <Label className="font-bold text-xs md:text-sm">Created Date</Label>
                      <p className="text-xs md:text-sm">{formatDate(selectedJob.date)}</p>
                    </div>
                    <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                      <Label className="font-bold text-xs md:text-sm">Edit Date</Label>
                      <p className="text-xs md:text-sm">{formatDate(selectedJob.edit_date) || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {(selectedJob.payment_amount || selectedJob.payment_method || selectedJob.payment_date) && (
                    <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4">
                      <Label className="font-bold text-xs md:text-sm">Payment Details</Label>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                          {selectedJob.payment_amount && <p><span className="font-semibold">Amount:</span> ${selectedJob.payment_amount}</p>}
                          {selectedJob.payment_method && <p><span className="font-semibold">Method:</span> {selectedJob.payment_method}</p>}
                          {selectedJob.payment_date && <p><span className="font-semibold">Date:</span> {formatDate(selectedJob.payment_date)}</p>}
                          <p><span className="font-semibold">Status:</span> {selectedJob.payment_processed ? 'Processed' : 'Not Processed'}</p>
                          {selectedJob.total_invoice_amount && <p><span className="font-semibold">Invoice Amount:</span> ${selectedJob.total_invoice_amount}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedJob.category_uuid && (
                    <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                      <Label className="font-bold text-xs md:text-sm">Category</Label>
                      <p className="text-xs md:text-sm">{selectedJob.category_name || selectedJob.category_uuid}</p>
                    </div>
                  )}

                  {selectedJob.purchase_order_number && (
                    <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                      <Label className="font-bold text-xs md:text-sm">Purchase Order Number</Label>
                      <p className="text-xs md:text-sm break-words">{selectedJob.purchase_order_number}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedJob.quote_date && (
                      <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                        <Label className="font-bold text-xs md:text-sm">Quote Date</Label>
                        <p className="text-xs md:text-sm">{formatDate(selectedJob.quote_date)}</p>
                      </div>
                    )}
                    
                    {selectedJob.work_order_date && (
                      <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                        <Label className="font-bold text-xs md:text-sm">Work Order Date</Label>
                        <p className="text-xs md:text-sm">{formatDate(selectedJob.work_order_date)}</p>
                      </div>
                    )}
                    
                    {selectedJob.completion_date && (
                      <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                        <Label className="font-bold text-xs md:text-sm">Completion Date</Label>
                        <p className="text-xs md:text-sm">{formatDate(selectedJob.completion_date)}</p>
                      </div>
                    )}
                    
                    <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                      <Label className="font-bold text-xs md:text-sm">Quote Sent</Label>
                      <p className="text-xs md:text-sm">{selectedJob.quote_sent === '1' ? 'Yes' : 'No'}</p>
                    </div>
                    
                    <div className="space-y-1 md:space-y-2 bg-gray-50 p-3 rounded-lg">
                      <Label className="font-bold text-xs md:text-sm">Invoice Sent</Label>
                      <p className="text-xs md:text-sm">{selectedJob.invoice_sent === '1' ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  {/* Display any additional fields that might be available in the job object */}
                  <div className="space-y-1 md:space-y-2 border border-gray-100 rounded-lg p-3 md:p-4 bg-gray-50">
                    <Label className="font-bold text-xs md:text-sm">Additional Information</Label>
                    <div className="bg-white p-2 rounded border border-gray-200 max-h-48 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap overflow-x-auto">
                        {Object.entries(selectedJob)
                          .filter(([key, value]) => 
                            ![
                              'uuid', 'id', 'client', 'status', 'date', 'job_description', 'geo_street',
                              'geo_city', 'geo_state', 'geo_postcode', 'geo_country', 'payment_amount',
                              'payment_method', 'payment_date', 'category_uuid', 'category_name',
                              'purchase_order_number', 'quote_date', 'work_order_date', 'completion_date',
                              'quote_sent', 'invoice_sent', 'edit_date', 'company_uuid',
                              'work_done_description', 'job_address', 'location_address', 'payment_processed',
                              'total_invoice_amount', 'quote_sent_stamp'
                            ].includes(key) && 
                            value !== null && 
                            value !== undefined && 
                            value !== ''
                          )
                          .map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {
                                typeof value === 'object' ? JSON.stringify(value) : value.toString()
                              }
                            </div>
                          ))}
                      </pre>
                    </div>
                  </div>
                </div>              </TabsContent>
              
              <TabsContent value="notes" className="p-0 mt-6">
                <NotesTab jobId={selectedJob.uuid || selectedJob.id} userType="admin" />
              </TabsContent>
              
              <TabsContent value="chat" className="p-0 mt-6">
                <AdminChatRoom jobId={selectedJob.uuid || selectedJob.id} />
              </TabsContent>
              
              <TabsContent value="attachments" className="p-0 mt-3 md:mt-4">
                <Card className="admin-card">
                  <CardHeader className="py-3 px-3 md:px-4 md:py-4">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <CardTitle className="flex items-center text-base md:text-lg">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                        Attachments
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 py-2 md:p-4">
                    <div className="py-8 md:py-12 text-center">
                      <FileText className="h-8 w-8 md:h-12 md:w-12 mx-auto text-gray-400 mb-2 md:mb-3" />
                      <p className="text-sm md:text-base text-muted-foreground">View attachments in job management</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 md:mt-4"
                        onClick={() => {
                          setSelectedJob(null);
                          navigate(`/admin/jobs/${selectedJob.uuid}`);
                        }}
                      >
                        Go to Job Management
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="border-t pt-4 mt-4">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
    </div>
  )
}

export default AdminHome