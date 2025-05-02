// src/pages/admin/AdminJobs.jsx
import React, { useState, useEffect } from 'react'
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
import axios from 'axios'
import { useJobContext } from '@/components/JobContext';

// Helper to determine page size
const PAGE_SIZE = 10;

const AdminJobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({ client: '', description: '', address: '', amount: '' });
  const [page, setPage] = useState(1);
  const {
    jobs,
    totalJobs,
    loading,
    fetchJobs,
    resetJobs,
    lastFetchedPage,
    activeTab,
    setActiveTab
  } = useJobContext();

  // Fetch jobs on mount and when page or tab changes
  useEffect(() => {
    fetchJobs(page, activeTab);
    // eslint-disable-next-line
  }, [page, activeTab]);

  // Reset jobs when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    resetJobs();
  };

  // Calculate which jobs to show for current page
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const visibleJobs = jobs.slice(startIdx, endIdx);

  // Filter by search term
  const filteredJobs = visibleJobs.filter(job => {
    if (searchTerm &&
      !job.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !job.client.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !job.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(totalJobs / PAGE_SIZE);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewJob({ ...newJob, [name]: value })
  }
  
  const handleClientChange = (value) => {
    setNewJob({ ...newJob, client: value })
  }
  
  const handleCreateJob = (e) => {
    e.preventDefault()
    console.log('Creating job:', newJob)
    setIsDialogOpen(false)
    setNewJob({
      client: '',
      description: '',
      address: '',
      amount: '',
    })
  }
  
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
            <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
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
                {loading ? (
                  <tr><td colSpan="6" className="py-4 text-center">Loading...</td></tr>
                ) : filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-muted-foreground">
                      No jobs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminJobs