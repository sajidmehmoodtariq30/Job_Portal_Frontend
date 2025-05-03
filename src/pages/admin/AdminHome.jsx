import React, { useState, useEffect } from 'react'
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

// Mock data - in production, this would come from ServiceM8 API
const jobStatusData = [
  { name: 'Quotes', value: 12, color: '#8884d8' },
  { name: 'Work Orders', value: 8, color: '#82ca9d' },
  { name: 'In Progress', value: 15, color: '#ffc658' },
  { name: 'Completed', value: 23, color: '#0088FE' },
]

const recentActivityData = [
  { day: 'Mon', quotes: 4, workOrders: 2, completed: 5 },
  { day: 'Tue', quotes: 3, workOrders: 5, completed: 2 },
  { day: 'Wed', quotes: 2, workOrders: 3, completed: 7 },
  { day: 'Thu', quotes: 5, workOrders: 1, completed: 4 },
  { day: 'Fri', quotes: 6, workOrders: 4, completed: 3 },
]

const recentJobs = [
  { id: 'JOB-2025-042', client: 'Acme Corp', status: 'Quote', date: '2025-04-09' },
  { id: 'JOB-2025-041', client: 'TechSolutions Inc', status: 'Work Order', date: '2025-04-08' },
  { id: 'JOB-2025-040', client: 'Global Enterprises', status: 'In Progress', date: '2025-04-07' },
  { id: 'JOB-2025-039', client: 'Data Systems Ltd', status: 'Completed', date: '2025-04-06' },
]

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState("overview")

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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button>Refresh Data</Button>
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
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Job activity over the past 5 days</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentActivityData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quotes" name="Quotes" fill="#8884d8" />
                    <Bar dataKey="workOrders" name="Work Orders" fill="#82ca9d" />
                    <Bar dataKey="completed" name="Completed" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Latest job updates in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Job ID</th>
                      <th className="py-3 text-left">Client</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-left">Date</th>
                      <th className="py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentJobs.map((job) => (
                      <tr key={job.id} className="border-b">
                        <td className="py-3">{job.id}</td>
                        <td className="py-3">{job.client}</td>
                        <td className="py-3">{job.status}</td>
                        <td className="py-3">{job.date}</td>
                        <td className="py-3">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <p className="text-lg">Jobs management interface will be implemented here</p>
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
              <p className="text-lg">User management interface will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminHome