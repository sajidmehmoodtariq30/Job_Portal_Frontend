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

const mockClients = [
  { id: 'CL001', name: 'Acme Corp' },
  { id: 'CL002', name: 'TechSolutions Inc' },
  { id: 'CL003', name: 'Global Enterprises' },
  { id: 'CL004', name: 'Data Systems Ltd' },
  { id: 'CL005', name: 'Innovation Labs' },
]

const AdminJobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    company_uuid: '',
    job_description: '',
    job_address: '',
    status: 'Quote',
    amount: ''
  });
  const [visibleJobs, setVisibleJobs] = useState(10);
  const [selectedJob, setSelectedJob] = useState(null);
  const {
    jobs,
    totalJobs,
    loading,
    fetchJobs,
    resetJobs,
    activeTab,
    setActiveTab
  } = useJobContext();

  // Fetch jobs on mount and when tab changes
  useEffect(() => {
    fetchJobs(1, activeTab);
  }, [activeTab]);

  // Reset jobs when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetJobs();
    fetchJobs(1, tab);
  };

  // Update visible jobs logic
  const displayedJobs = jobs.slice(0, visibleJobs);

  // Filter by search term
  const filteredJobs = displayedJobs.filter(job => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (job.uuid?.toLowerCase().includes(searchLower)) ||
      (job.job_description?.toLowerCase().includes(searchLower)) ||
      (job.generated_job_id?.toLowerCase().includes(searchLower))
    );
  });

  const handleShowMore = () => {
    setVisibleJobs(prev => prev + 10);
  };

  const handleShowLess = () => {
    setVisibleJobs(prev => Math.max(prev - 10, 10));
  };

  const handleRefresh = async () => {
    try {
      await fetchJobs(1, activeTab);
      setVisibleJobs(10);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };
  
  const handleClientChange = (value) => {
    setNewJob({ ...newJob, company_uuid: value });
  };
  
  const handleStatusChange = (value) => {
    setNewJob({ ...newJob, status: value });
  };
  
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            ...newJob,
            active: 1
        };
        const response = await axios.post('http://localhost:5000/fetch/jobs', payload);
        fetchJobs(1, activeTab);
        setIsDialogOpen(false);
        setNewJob({
            company_uuid: '',
            job_description: '',
            job_address: '',
            status: 'Quote',
            amount: ''
        });
    } catch (error) {
        console.error('Error creating job:', error);
    }
};
  
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
                  <Label htmlFor="company_uuid">Client</Label>
                  <Select
                    value={newJob.company_uuid}
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
                  <Label htmlFor="job_description">Job Description</Label>
                  <Input
                    id="job_description"
                    name="job_description"
                    value={newJob.job_description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="job_address">Service Address</Label>
                  <Input
                    id="job_address"
                    name="job_address"
                    value={newJob.job_address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newJob.status}
                    onValueChange={handleStatusChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quote">Quote</SelectItem>
                      <SelectItem value="Work Order">Work Order</SelectItem>
                    </SelectContent>
                  </Select>
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
            <Tabs defaultValue={activeTab} className="w-full" onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="all">All Jobs</TabsTrigger>
                <TabsTrigger value="Quote">Quotes</TabsTrigger>
                <TabsTrigger value="Work Order">Work Orders</TabsTrigger>
                <TabsTrigger value="In Progress">In Progress</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
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
                  <th className="py-3 text-left">Generated ID</th>
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
                    <tr key={job.uuid} className="border-b">
                      <td className="py-3">{job.uuid ? job.uuid.slice(-4) : '...'}</td>
                      <td className="py-3">{job.generated_job_id || '...'}</td>
                      <td className="py-3">{job.job_description?.slice(0, 50)}...</td>
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
                      <td className="py-3">{job.date || '...'}</td>
                      <td className="py-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(job)}
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
              onClick={handleShowLess}
              disabled={visibleJobs <= 10}
            >
              Show Less
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
            <Button
              variant="outline"
              onClick={handleShowMore}
              disabled={filteredJobs.length < visibleJobs}
            >
              Show More
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Job Details - {selectedJob.generated_job_id || selectedJob.uuid?.slice(-4)}</DialogTitle>
              <DialogDescription>
                Detailed information about the job.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Job ID</Label>
                <p className="text-sm">{selectedJob.uuid}</p>
              </div>
              <div className="grid gap-2">
                <Label>Generated Job ID</Label>
                <p className="text-sm">{selectedJob.generated_job_id}</p>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedJob.job_description}</p>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <span className={`px-2 py-1 rounded text-xs w-fit ${
                  selectedJob.status === 'Quote' 
                    ? 'bg-blue-100 text-blue-800' 
                    : selectedJob.status === 'Work Order' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedJob.status === 'In Progress'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                }`}>
                  {selectedJob.status}
                </span>
              </div>
              <div className="grid gap-2">
                <Label>Service Address</Label>
                <p className="text-sm">{selectedJob.job_address}</p>
              </div>
              <div className="grid gap-2">
                <Label>Invoice Amount</Label>
                <p className="text-sm">${selectedJob.total_invoice_amount || '0.00'}</p>
              </div>
              <div className="grid gap-2">
                <Label>Created Date</Label>
                <p className="text-sm">{selectedJob.date}</p>
              </div>
              <div className="grid gap-2">
                <Label>Location</Label>
                <p className="text-sm">
                  {[
                    selectedJob.geo_number,
                    selectedJob.geo_street,
                    selectedJob.geo_city,
                    selectedJob.geo_state,
                    selectedJob.geo_postcode,
                    selectedJob.geo_country
                  ].filter(Boolean).join(', ') || 'Not available'}
                </p>
              </div>
              {selectedJob.work_done_description && (
                <div className="grid gap-2">
                  <Label>Work Done Description</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedJob.work_done_description}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedJob(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminJobs;