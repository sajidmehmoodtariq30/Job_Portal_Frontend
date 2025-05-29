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
  'Work Order': '#82ca9d',
  'In Progress': '#ffc658',
  'Completed': '#0088FE',
}

const AdminHome = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  
  // State management for real data
  const [loading, setLoading] = useState(true)
  const [jobStatusData, setJobStatusData] = useState([])
  const [recentActivityData, setRecentActivityData] = useState([])
  const [recentJobs, setRecentJobs] = useState([])
  const [clients, setClients] = useState([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

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
        // Fetch all jobs data
        const jobsResponse = await axios.get(API_ENDPOINTS.JOBS.FETCH_ALL, {
          params: { timestamp: new Date().getTime() } // Prevent caching
        })
        
        const jobsData = Array.isArray(jobsResponse.data) ? 
          jobsResponse.data : 
          (jobsResponse.data.jobs || [])

        // Process job status data for pie chart
        const statusCounts = {
          'Quote': 0,
          'Work Order': 0,
          'In Progress': 0,
          'Completed': 0
        }
        
        jobsData.forEach(job => {
          if (job.status in statusCounts) {
            statusCounts[job.status]++
          }
        })
        
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
          
        setClients(clientsData)
        
        // Map client UUIDs to names for recent jobs
        const jobsWithClientNames = sortedJobs.map(job => {
          const client = clientsData.find(c => c.uuid === job.company_uuid) || {}
          return {
            id: job.uuid?.slice(-8),
            uuid: job.uuid,
            client: client.name || 'Unknown Client',
            status: job.status || 'Unknown',
            date: job.date || new Date().toISOString().split('T')[0]
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
        console.error('Error fetching dashboard data:', error)
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
  
  // Handle view job details
  const handleViewJob = (jobId) => {
    navigate(`/admin/jobs/${jobId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
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
            
            <Card>
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
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left">S.No</th>
                        <th className="py-3 text-left">Client</th>
                        <th className="py-3 text-left">Status</th>
                        <th className="py-3 text-left">Date</th>
                        <th className="py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>                      {recentJobs.length > 0 ? (
                        recentJobs.map((job, index) => (
                          <tr key={job.uuid} className="border-b">
                            <td className="py-3">{index + 1}</td>
                            <td className="py-3">{job.client}</td>
                            <td className="py-3">                              <span className={`px-2 py-1 rounded text-xs ${
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
                            <td className="py-3">{job.date}</td>
                            <td className="py-3">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewJob(job.uuid)}
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
        
        <TabsContent value="jobs" className="space-y-4">
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
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Invite and manage client access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-lg">Manage your clients and their access</p>
                <Button onClick={() => navigate('/admin/clients')}>View Clients</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminHome