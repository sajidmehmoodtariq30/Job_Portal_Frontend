import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search,
  Plus,
  Clipboard,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from "../../components/UI/button";
import { Input } from "../../components/UI/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/UI/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/UI/select";
import { Textarea } from "../../components/UI/textarea";
import { Label } from "../../components/UI/label";
import JobCard from "../../components/UI/client/JobCard";

const ClientJobs = () => {
  // State for jobs data
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewJobDialog, setShowNewJobDialog] = useState(false);
  const [showAttachmentDialog, setShowAttachmentDialog] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [visibleJobsCount, setVisibleJobsCount] = useState(10); // Default to showing 10 jobs
  const [showAllJobs, setShowAllJobs] = useState(false);
  
  // Form state for new job creation
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    location: 'Main Office',
    jobType: 'Installation',
    priority: 'Normal'
  });
  
  // Mock locations and job types
  const locations = ['Main Office', 'Warehouse', 'Branch Office'];
  const jobTypes = ['Installation', 'Repair', 'Maintenance', 'Consultation'];
  const priorities = ['Low', 'Normal', 'High', 'Urgent'];
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm({
      ...jobForm,
      [name]: value
    });
  };
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setJobForm({
      ...jobForm,
      [name]: value
    });
  };
  
  // Load jobs data
  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      // Generate more mock data to demonstrate the pagination feature
      const generateMockJobs = (count) => {
        const baseJobs = [
          {
            id: 'JOB-2025-0423',
            title: 'Network Installation',
            status: 'In Progress',
            date: 'Apr 15, 2025',
            dueDate: 'Apr 20, 2025',
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
            date: 'Apr 14, 2025',
            dueDate: 'Apr 25, 2025',
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
            date: 'Apr 10, 2025',
            completedDate: 'Apr 12, 2025',
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
            date: 'Apr 20, 2025',
            type: 'Work Order',
            description: 'Routine maintenance check on surveillance system',
            assignedTech: 'Miguel Rodriguez',
            location: 'Branch Office',
            attachments: 0
          },
          {
            id: 'JOB-2025-0410',
            title: 'Router Configuration',
            status: 'On Hold',
            date: 'Apr 8, 2025',
            type: 'Work Order',
            description: 'Configure new router for guest network',
            location: 'Main Office',
            attachments: 1
          }
        ];

        // Generate additional jobs if requested count is more than base jobs
        if (count <= baseJobs.length) return baseJobs.slice(0, count);

        const additionalJobs = [];
        const statuses = ['In Progress', 'Quote', 'Completed', 'Scheduled', 'On Hold'];
        const titles = ['Server Maintenance', 'Printer Setup', 'Workstation Installation', 'Firewall Configuration', 
                        'Software Installation', 'Data Recovery', 'Network Troubleshooting', 'UPS Installation', 
                        'VoIP Phone Setup', 'Email Migration'];
        const locations = ['Main Office', 'Warehouse', 'Branch Office', 'Remote Site', 'Data Center'];
        const techs = ['Alex Johnson', 'Sarah Davis', 'Miguel Rodriguez', 'Emily Wong', 'Carlos Menendez'];
        
        for (let i = baseJobs.length; i < count; i++) {
          const randomDate = new Date(2025, 3, Math.floor(Math.random() * 30) + 1);
          const formattedDate = randomDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          
          additionalJobs.push({
            id: `JOB-2025-0${400 + i}`,
            title: titles[Math.floor(Math.random() * titles.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            date: formattedDate,
            dueDate: new Date(randomDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000)
                      .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            type: Math.random() > 0.3 ? 'Work Order' : 'Quote',
            description: `Job ${i+1} description goes here with detailed information about the requested services and scope of work.`,
            assignedTech: Math.random() > 0.2 ? techs[Math.floor(Math.random() * techs.length)] : null,
            location: locations[Math.floor(Math.random() * locations.length)],
            attachments: Math.floor(Math.random() * 5)
          });
        }
        
        return [...baseJobs, ...additionalJobs];
      };
      
      const mockJobs = generateMockJobs(25); // Generate 25 mock jobs to demonstrate pagination
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => 
    (job.title && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (job.id && job.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (job.status && job.status.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (job.description && job.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Get jobs to display based on show all toggle
  const visibleJobs = showAllJobs ? 
    filteredJobs : 
    filteredJobs.slice(0, visibleJobsCount);
  
  // Toggle show all jobs
  const toggleShowAllJobs = () => {
    setShowAllJobs(!showAllJobs);
  };
  
  // Status color function
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
  
  // Handle quote actions
  const handleQuoteAction = (quoteId, action) => {
    // This would integrate with ServiceM8 API to accept/reject quotes
    alert(`${action} quote ${quoteId} - would send to ServiceM8 API`);
  };
  
  // Handle add attachment button
  const handleAddAttachment = (jobId) => {
    setCurrentJobId(jobId);
    setShowAttachmentDialog(true);
  };
  
  // Handle create new job form submission
  const handleCreateJob = () => {
    // This would integrate with ServiceM8 API to create a new job
    
    // For demo purposes, add it to the local state
    const newJob = {
      id: `JOB-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      title: jobForm.title,
      status: 'New',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: 'Request',
      description: jobForm.description,
      location: jobForm.location,
      attachments: 0
    };
    
    setJobs([newJob, ...jobs]);
    setShowNewJobDialog(false);
    
    // Reset form
    setJobForm({
      title: '',
      description: '',
      location: 'Main Office',
      jobType: 'Installation',
      priority: 'Normal'
    });
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    // This would handle file upload and then send to ServiceM8 API
    alert(`File uploaded to job ${currentJobId} - would scan and send to ServiceM8 API`);
    setShowAttachmentDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Jobs</h1>
        <p className="text-lg mt-1">View and manage all your service jobs</p>
      </div>
  
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search jobs by ID, title, or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            Filter
          </Button>
          <Dialog open={showNewJobDialog} onOpenChange={setShowNewJobDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Service Request</DialogTitle>
                <DialogDescription>
                  Submit a new service request to our team. We'll review it and get back to you promptly.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Request Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Brief title for your request" 
                    value={jobForm.title} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Please describe what you need..." 
                    rows={4} 
                    value={jobForm.description} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Select 
                      value={jobForm.location} 
                      onValueChange={(value) => handleSelectChange('location', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select 
                      value={jobForm.jobType} 
                      onValueChange={(value) => handleSelectChange('jobType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={jobForm.priority} 
                    onValueChange={(value) => handleSelectChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewJobDialog(false)}>Cancel</Button>
                <Button onClick={handleCreateJob}>Submit Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-muted rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-muted rounded col-span-2"></div>
                    <div className="h-2 bg-muted rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div>
            <div className="space-y-4">
              {visibleJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onQuoteAction={handleQuoteAction} 
                  onAddAttachment={handleAddAttachment}
                  statusColor={getStatusColor} 
                />
              ))}
            </div>
            
            {/* Show More/Less Button */}
            {filteredJobs.length > 10 && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  onClick={toggleShowAllJobs}
                  className="flex items-center gap-2"
                >
                  {showAllJobs ? (
                    <>
                      <ChevronUp size={16} />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      Show All ({filteredJobs.length - visibleJobsCount} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Clipboard size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or create a new request</p>
          </div>
        )}
      </div>

      {/* File Upload Dialog */}
      <Dialog open={showAttachmentDialog} onOpenChange={setShowAttachmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Attachment</DialogTitle>
            <DialogDescription>
              Upload files related to job {currentJobId}. All files will be scanned for viruses before being processed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Select File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm text-center mb-2">Drag and drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground text-center">Max file size: 25MB</p>
                <Button variant="outline" className="mt-4">Browse Files</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttachmentDialog(false)}>Cancel</Button>
            <Button onClick={handleFileUpload}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Custom UploadCloud component
const UploadCloud = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  );
};

export default ClientJobs;