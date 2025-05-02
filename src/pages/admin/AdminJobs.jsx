// src/pages/admin/AdminJobs.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/UI/button"
import { Input } from "@/components/UI/input"
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
  DialogTrigger,
} from "@/components/UI/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select"
import { Label } from "@/components/UI/label"
import { useEffect } from 'react'
import axios from 'axios'


// Mock data - in production would come from ServiceM8 API
const mockJobs = [
  { 
    id: 'JOB-2025-042', 
    client: 'Acme Corp', 
    clientId: 'CL001',
    status: 'Quote', 
    createdAt: '2025-04-09',
    description: 'Network installation and setup',
    amount: 2500.00,
    address: '123 Business Ave, Suite 101, New York, NY 10001',
  },
  { 
    id: 'JOB-2025-041', 
    client: 'TechSolutions Inc', 
    clientId: 'CL002',
    status: 'Work Order', 
    createdAt: '2025-04-08',
    description: 'Server maintenance and updates',
    amount: 1200.00,
    address: '456 Tech Road, San Francisco, CA 94107',
  },
  { 
    id: 'JOB-2025-040', 
    client: 'Global Enterprises', 
    clientId: 'CL003',
    status: 'In Progress', 
    createdAt: '2025-04-07',
    description: 'Security camera installation',
    amount: 3750.00,
    address: '789 Corporate Drive, Chicago, IL 60611',
  },
  { 
    id: 'JOB-2025-039', 
    client: 'Data Systems Ltd', 
    clientId: 'CL004',
    status: 'Completed', 
    createdAt: '2025-04-06',
    description: 'Data recovery and backup setup',
    amount: 950.00,
    address: '321 Data Lane, Austin, TX 78701',
  },
]

// Sample clients for the dropdown
const mockClients = [
  { id: 'CL001', name: 'Acme Corp' },
  { id: 'CL002', name: 'TechSolutions Inc' },
  { id: 'CL003', name: 'Global Enterprises' },
  { id: 'CL004', name: 'Data Systems Ltd' },
  { id: 'CL005', name: 'Innovation Labs' },
]

const AdminJobs = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newJob, setNewJob] = useState({
    client: '',
    description: '',
    address: '',
    amount: '',
  })

  // Fetch jobs from the backend
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/fetch/jobs')
        console.log('Token', response.data)
      } catch (error) {
        console.error('Error fetching jobs:', error)
      }
    }
  
    fetchJobs()
  }, [])
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewJob({ ...newJob, [name]: value })
  }
  
  const handleClientChange = (value) => {
    setNewJob({ ...newJob, client: value })
  }
  
  const handleCreateJob = (e) => {
    e.preventDefault()
    
    // In production, this would call the ServiceM8 API
    console.log('Creating job:', newJob)
    setIsDialogOpen(false)
    
    // Reset form
    setNewJob({
      client: '',
      description: '',
      address: '',
      amount: '',
    })
  }
  
  const filteredJobs = mockJobs.filter(job => {
    // Filter by tab
    if (activeTab !== 'all' && job.status.toLowerCase() !== activeTab) {
      return false
    }
    
    // Filter by search term
    if (searchTerm && 
        !job.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !job.client.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !job.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    return true
  })
  
  const handleViewJob = (jobId) => {
    navigate(`/admin/jobs/${jobId}`)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Job Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Enter the details for the new job. This will create a quote in ServiceM8.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateJob}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={newJob.client}
                    onValueChange={handleClientChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newJob.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Service Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newJob.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Quote Amount ($)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={newJob.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Job</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>View and manage all jobs in the system</CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Jobs</TabsTrigger>
                <TabsTrigger value="quote">Quotes</TabsTrigger>
                <TabsTrigger value="work order">Work Orders</TabsTrigger>
                <TabsTrigger value="in progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex-1">
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Job ID</th>
                  <th className="py-3 text-left">Client</th>
                  <th className="py-3 text-left">Description</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Created</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b">
                    <td className="py-3">{job.id}</td>
                    <td className="py-3">{job.client}</td>
                    <td className="py-3">{job.description}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        job.status === 'Quote' 
                          ? 'bg-blue-100 text-blue-800' 
                          : job.status === 'Work Order' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : job.status === 'In Progress'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3">{job.createdAt}</td>
                    <td className="py-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewJob(job.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-muted-foreground">
                      No jobs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminJobs