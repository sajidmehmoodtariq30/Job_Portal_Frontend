import React, { useState, useEffect } from 'react'
import { Button } from "@/components/UI/button"
import { Input } from "@/components/UI/input"
import { Label } from "@/components/UI/label"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/UI/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select"
import { 
  Users, 
  MapPin, 
  Briefcase, 
  Building,
  Loader2,
  Eye
} from 'lucide-react'
import API_ENDPOINTS from "@/lib/apiConfig"

const UserDashboard = () => {
  const [users, setUsers] = useState([])
  const [clients, setClients] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [userDashboardData, setUserDashboardData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersResponse, clientsResponse] = await Promise.all([
          fetch(API_ENDPOINTS.USERS.FETCH_ALL),
          fetch(API_ENDPOINTS.CLIENTS.FETCH_ALL)
        ])

        const usersData = await usersResponse.json()
        const clientsData = await clientsResponse.json()

        setUsers(usersData.data || [])
        setClients(Array.isArray(clientsData) ? clientsData : [])
      } catch (error) {
        console.error('Error fetching initial data:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Helper function to get client name
  const getClientName = (clientUuid) => {
    if (!clientUuid || clientUuid === 'none') return 'No Client Assigned'
    const client = clients.find(c => c.uuid === clientUuid)
    return client ? client.name || client.uuid : 'Unknown Client'
  }

  // Fetch user dashboard data
  const fetchUserDashboard = async (userUuid) => {
    if (!userUuid) return

    try {
      setLoading(true)
      const user = users.find(u => u.uuid === userUuid)
      
      if (!user || !user.assignedClientUuid || user.assignedClientUuid === 'none') {
        setUserDashboardData({
          user,
          client: null,
          sites: [],
          jobs: [],
          stats: {
            totalSites: 0,
            totalJobs: 0,
            activeJobs: 0,
            completedJobs: 0
          }
        })
        return
      }

      // Fetch user's assigned client sites
      const sitesResponse = await fetch(API_ENDPOINTS.USERS.GET_CLIENT_SITES(userUuid))
      const sitesData = await sitesResponse.json()

      // Fetch jobs for the client
      const jobsResponse = await fetch(API_ENDPOINTS.JOBS.FETCH_BY_CLIENT(user.assignedClientUuid))
      const jobsData = await jobsResponse.json()

      // Get client info
      const client = clients.find(c => c.uuid === user.assignedClientUuid)

      // Calculate stats
      const jobs = Array.isArray(jobsData) ? jobsData : (jobsData.data || [])
      const sites = sitesData.data || []
      
      const stats = {
        totalSites: sites.length,
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => ['In Progress', 'Quote', 'Work Order'].includes(job.status)).length,
        completedJobs: jobs.filter(job => job.status === 'Complete').length
      }

      setUserDashboardData({
        user,
        client,
        sites,
        jobs: jobs.slice(0, 10), // Show recent 10 jobs
        stats
      })

    } catch (error) {
      console.error('Error fetching user dashboard:', error)
      setUserDashboardData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUserChange = (userUuid) => {
    setSelectedUser(userUuid)
    fetchUserDashboard(userUuid)
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select User</CardTitle>
          <CardDescription>Choose a user to view their client-specific dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="user-select">User</Label>
              <Select
                value={selectedUser}
                onValueChange={handleUserChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.uuid} value={user.uuid}>
                      {user.name} ({user.email}) - {getClientName(user.assignedClientUuid)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Content */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading user dashboard...</span>
        </div>
      )}

      {userDashboardData && !loading && (
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-lg">{userDashboardData.user.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-lg">{userDashboardData.user.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-lg">{userDashboardData.user.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Assigned Client</Label>
                  <p className="text-lg">{getClientName(userDashboardData.user.assignedClientUuid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {userDashboardData.client ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userDashboardData.stats.totalSites}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userDashboardData.stats.totalJobs}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{userDashboardData.stats.activeJobs}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
                    <Briefcase className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{userDashboardData.stats.completedJobs}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Client Sites */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Client Sites ({userDashboardData.stats.totalSites})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userDashboardData.sites.length > 0 ? (
                    <div className="grid gap-4">
                      {userDashboardData.sites.slice(0, 5).map((site, index) => (
                        <div key={site.uuid || index} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="font-semibold">{site.name || 'Unnamed Site'}</div>
                              <div className="text-sm text-gray-600">
                                {site.address || 'No address provided'}
                              </div>
                            </div>
                            <div className="text-sm">
                              <div>{site.city && site.state ? `${site.city}, ${site.state}` : 'Location not specified'}</div>
                              <div>{site.postcode || ''}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {userDashboardData.sites.length > 5 && (
                        <p className="text-sm text-gray-600 text-center">
                          ... and {userDashboardData.sites.length - 5} more sites
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No sites found for this client</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Recent Jobs (Last 10)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userDashboardData.jobs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2 text-left">Job #</th>
                            <th className="py-2 text-left">Description</th>
                            <th className="py-2 text-left">Status</th>
                            <th className="py-2 text-left">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userDashboardData.jobs.map((job, index) => (
                            <tr key={job.uuid || index} className="border-b">
                              <td className="py-2">#{job.job_number || job.uuid?.substring(0, 8) || index + 1}</td>
                              <td className="py-2">{job.job_description || 'No description'}</td>
                              <td className="py-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  job.status === 'Complete' ? 'bg-green-100 text-green-800' :
                                  job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                  job.status === 'Quote' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {job.status || 'Unknown'}
                                </span>
                              </td>
                              <td className="py-2">{job.date ? new Date(job.date).toLocaleDateString() : 'No date'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No jobs found for this client</p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">This user is not assigned to any client</p>
                <p className="text-sm text-gray-400 mt-2">
                  Assign a client to this user to view client-specific dashboard data
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default UserDashboard
