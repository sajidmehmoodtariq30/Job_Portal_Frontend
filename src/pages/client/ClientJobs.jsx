import React, { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/UI/card';
import { Button } from '../../components/UI/button';
import { Badge } from '../../components/UI/badge';
import { Input } from '../../components/UI/input';
import { Label } from '../../components/UI/label';
import { Textarea } from '../../components/UI/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/UI/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/UI/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/UI/select';
import { Separator } from '../../components/UI/separator';
import { ScrollArea } from '../../components/UI/scroll-area';
import { Alert, AlertDescription } from '../../components/UI/alert';
import { useToast } from '../../hooks/use-toast';
import { useClientAssignment } from '../../context/ClientAssignmentContext';
import ClientAssignmentGuard from '../../components/ClientAssignmentGuard';
import { API_URL } from '../../lib/apiConfig';
import ChatRoom from '../../components/UI/client/ChatRoom';
import NotesTab from '../../components/UI/NotesTab';
import { 
  PlusIcon, 
  CalendarIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  DollarSignIcon,
  ClockIcon,
  EyeIcon,
  UploadIcon,
  FileIcon,
  Trash2Icon,
  InfoIcon,
  MessageSquareIcon,
  StickyNoteIcon
} from 'lucide-react';

const ClientJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isNewJobDialogOpen, setIsNewJobDialogOpen] = useState(false);
  const [isJobDetailsDialogOpen, setIsJobDetailsDialogOpen] = useState(false);
  const [newJobFile, setNewJobFile] = useState(null);  const [detailsJobFile, setDetailsJobFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);const { toast } = useToast();
  const { getClientId, hasValidAssignment } = useClientAssignment();

  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    salary: '',
    employmentType: 'full-time',
    requirements: '',
    benefits: ''
  });
  useEffect(() => {
    console.log('🔄 ClientJobs useEffect - hasValidAssignment:', hasValidAssignment);
    if (hasValidAssignment) {
      console.log('✅ Client assignment is valid, fetching data...');
      fetchJobs();
      fetchCategories();
      fetchLocations();
    } else {
      console.log('⏳ Waiting for valid client assignment...');
    }
  }, [hasValidAssignment]);const fetchJobs = async () => {
    try {
      const clientId = getClientId();
      const response = await fetch(`${API_URL}/fetch/jobs/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
        if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      setJobs(data || []);
    } catch (error) {
      setError('Failed to load jobs');
      toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };  const fetchCategories = async () => {
    try {
      const clientId = getClientId();
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId || undefined
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };  const fetchLocations = async () => {
    try {
      const clientId = getClientId();
      console.log('🔍 Fetching locations - Client ID:', clientId);
      
      if (!clientId) {
        console.error('No client ID available for fetching locations');
        return;
      }
      
      console.log('📍 Making request to:', `${API_URL}/fetch/locations/client/${clientId}`);
      const response = await fetch(`${API_URL}/fetch/locations/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        }
      });
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      const clientId = getClientId();
      const formData = new FormData();
      
      // Add job data
      Object.keys(newJob).forEach(key => {
        formData.append(key, newJob[key]);
      });
      formData.append('clientId', clientId);
        // Add file if selected
      if (newJobFile) {
        formData.append('file', newJobFile);
      }      const response = await fetch(`${API_URL}/fetch/jobs/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        },
        body: formData
      });if (!response.ok) throw new Error('Failed to create job');

      const data = await response.json();
      setJobs(prev => [data.data, ...prev]);
      
      // Reset form
      setNewJob({
        title: '',
        description: '',
        category: '',
        location: '',
        salary: '',
        employmentType: 'full-time',
        requirements: '',
        benefits: ''
      });
      setNewJobFile(null);
      setIsNewJobDialogOpen(false);
      
      toast({ title: 'Success', description: 'Job created successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create job', variant: 'destructive' });
    }
  };

  const handleNewJobFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      setUploadError('');
      setNewJobFile(file);
    }
  };

  const handleDetailsFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedJob) return;

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }    setIsUploading(true);
    setUploadError('');

    try {
      const clientId = getClientId();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/attachments/upload/${selectedJob.uuid}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');      const data = await response.json();
      
      // Update the selected job with new attachment
      setSelectedJob(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), data.data]      }));

      // Update jobs list
      setJobs(prev => prev.map(job => 
        job.uuid === selectedJob.uuid 
          ? { ...job, attachments: [...(job.attachments || []), data.data] }
          : job
      ));      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);

      // Refresh attachments to ensure we have the latest data
      await fetchAttachments(selectedJob.uuid);

      toast({ title: 'Success', description: 'File uploaded successfully' });
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      setUploadError('Failed to upload file');
      toast({ title: 'Error', description: 'Failed to upload file', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };
  const handleDeleteAttachment = async (attachmentId) => {
    if (!selectedJob) return;

    try {
      const clientId = getClientId();
      const response = await fetch(
        `${API_URL}/api/attachments/${attachmentId}`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'x-client-uuid': clientId
          }
        }
      );

      if (!response.ok) throw new Error('Failed to delete attachment');      // Update selected job
      setSelectedJob(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => (att.id || att._id) !== attachmentId)      }));

      // Update jobs list
      setJobs(prev => prev.map(job => 
        job.uuid === selectedJob.uuid 
          ? { ...job, attachments: job.attachments.filter(att => (att.id || att._id) !== attachmentId) }
          : job
      ));// Trigger refresh
      setRefreshTrigger(prev => prev + 1);

      // Refresh attachments to ensure we have the latest data
      await fetchAttachments(selectedJob.uuid);

      toast({ title: 'Success', description: 'Attachment deleted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete attachment', variant: 'destructive' });
    }  };

  // Function to refresh a specific job's data including attachments and notes
  const refreshJobData = async (jobId) => {
    try {
      const clientId = getClientId();
      if (!clientId) {
        console.error('No client ID available');
        return;
      }

      const response = await fetch(`${API_URL}/fetch/jobs/client/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const refreshedJob = result.find(job => job.uuid === jobId);
        if (refreshedJob) {
          setSelectedJob(refreshedJob);
          // Also update the job in the jobs list
          setJobs(prev => prev.map(job => 
            job.uuid === jobId ? refreshedJob : job
          ));
        }
      }    } catch (error) {
      console.error('Error refreshing job data:', error);
    }
  };

  // Fetch attachments for selected job
  const fetchAttachments = async (jobId) => {
    if (!jobId) return;

    try {
      setAttachmentsLoading(true);
      const clientId = getClientId();
      const response = await fetch(`${API_URL}/api/attachments/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientId
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Update the selected job with attachments
          setSelectedJob(prev => prev ? { ...prev, attachments: result.data } : null);
          
          // Also update the job in the jobs list
          setJobs(prev => prev.map(job => 
            job.uuid === jobId ? { ...job, attachments: result.data } : job
          ));
        }
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setAttachmentsLoading(false);
    }  };

  // Function to handle opening job details dialog
  const handleViewJobDetails = async (job) => {
    setSelectedJob(job);
    setIsJobDetailsDialogOpen(true);
    // Trigger refresh for notes and attachments
    setRefreshTrigger(prev => prev + 1);
    // Fetch attachments for this specific job
    await fetchAttachments(job.uuid);
    // Refresh job data to ensure other data is current
    await refreshJobData(job.uuid);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return `$${parseInt(salary).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="w-96">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ClientAssignmentGuard>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Job Posts</h1>
            <p className="text-gray-600 mt-2">Manage your job postings and applications</p>
          </div>
          
          <Dialog open={isNewJobDialogOpen} onOpenChange={setIsNewJobDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job Posting</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleCreateJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={newJob.category} 
                      onValueChange={(value) => setNewJob(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat._id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Select 
                      value={newJob.location} 
                      onValueChange={(value) => setNewJob(prev => ({ ...prev, location: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map(loc => (
                          <SelectItem key={loc._id} value={loc.name}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary (Annual)</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={newJob.salary}
                      onChange={(e) => setNewJob(prev => ({ ...prev, salary: e.target.value }))}
                      placeholder="e.g., 75000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select 
                    value={newJob.employmentType} 
                    onValueChange={(value) => setNewJob(prev => ({ ...prev, employmentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={newJob.description}
                    onChange={(e) => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={newJob.requirements}
                    onChange={(e) => setNewJob(prev => ({ ...prev, requirements: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={newJob.benefits}
                    onChange={(e) => setNewJob(prev => ({ ...prev, benefits: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-job-file">Attachment (Optional)</Label>
                  <Input
                    id="new-job-file"
                    type="file"
                    onChange={handleNewJobFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  {newJobFile && (
                    <p className="text-sm text-green-600">
                      Selected: {newJobFile.name}
                    </p>
                  )}
                  {uploadError && (
                    <p className="text-sm text-red-600">{uploadError}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewJobDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Job</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {jobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BriefcaseIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first job posting</p>
              <Button onClick={() => setIsNewJobDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Card key={job.uuid} className="hover:shadow-lg transition-shadow">                <CardHeader>
                  <div className="flex justify-between items-start">                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {job.job_name || job.name || job.description?.substring(0, 30) + '...' || `Job #${job.job_number}` || 'New Job Posting'}
                    </CardTitle>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status || 'Active'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 line-clamp-3">{job.job_description || job.description || 'No description available'}</p>
                    <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{job.location_address || job.job_address || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSignIcon className="h-4 w-4" />
                      <span>{formatSalary(job.total_amount || job.salary)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span className="capitalize">{job.employmentType?.replace('-', ' ') || 'Full Time'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Posted {formatDate(job.created_date || job.createdAt || job.date)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{job.applicationsCount || 0}</span> applications
                    </div>                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewJobDetails(job)}
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job Details Dialog */}
        <Dialog open={isJobDetailsDialogOpen} onOpenChange={setIsJobDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {selectedJob?.title}
              </DialogTitle>
            </DialogHeader>

            {selectedJob && (              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="notes">
                    <div className="flex items-center gap-2">
                      <StickyNoteIcon className="h-4 w-4" />
                      Notes
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="chat">
                    <div className="flex items-center gap-2">
                      <MessageSquareIcon className="h-4 w-4" />
                      Chat
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="attachments">
                    Attachments ({selectedJob.attachments?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Job Information</h3>                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-gray-500" />
                            <span>{selectedJob.location_address || selectedJob.job_address || 'Location not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSignIcon className="h-4 w-4 text-gray-500" />
                            <span>{formatSalary(selectedJob.total_amount || selectedJob.salary)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-gray-500" />
                            <span className="capitalize">
                              {selectedJob.employmentType?.replace('-', ' ') || 'Full Time'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-gray-500" />
                            <span>Created {formatDate(selectedJob.created_date || selectedJob.createdAt || selectedJob.date)}</span>
                          </div>
                        </div>
                      </div>                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Category</h3>
                        <Badge variant="secondary">{selectedJob.category || 'General'}</Badge>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                        <Badge className={getStatusColor(selectedJob.status)}>
                          {selectedJob.status || 'Active'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                        <div className="max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-lg border">
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedJob.job_description || selectedJob.description || 'No description available'}
                          </p>
                        </div>
                      </div>

                      {selectedJob.requirements && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {selectedJob.requirements}
                          </p>
                        </div>
                      )}                      {selectedJob.benefits && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Benefits</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedJob.benefits}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Job ID Information */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Job Reference</h3>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 font-mono">
                            {selectedJob.generated_job_id || selectedJob.uuid || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Location Details */}
                      {(selectedJob.geo_street || selectedJob.geo_city) && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Location Details</h3>
                          <div className="bg-gray-50 p-3 rounded-lg border">
                            <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
                              {selectedJob.geo_street && (
                                <p><span className="font-medium">Street:</span> {selectedJob.geo_number ? `${selectedJob.geo_number} ${selectedJob.geo_street}` : selectedJob.geo_street}</p>
                              )}
                              {selectedJob.geo_city && <p><span className="font-medium">City:</span> {selectedJob.geo_city}</p>}
                              {selectedJob.geo_state && <p><span className="font-medium">State:</span> {selectedJob.geo_state}</p>}
                              {selectedJob.geo_postcode && <p><span className="font-medium">Postcode:</span> {selectedJob.geo_postcode}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>                <TabsContent value="notes" className="space-y-4">
                  <NotesTab 
                    jobId={selectedJob.uuid || selectedJob.id} 
                    userType="client" 
                    refreshTrigger={refreshTrigger}
                  />
                </TabsContent>

                <TabsContent value="chat" className="space-y-4">
                  <ChatRoom jobId={selectedJob.uuid || selectedJob.id} />
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <UploadIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="details-file-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">
                            Click to upload
                          </span>
                          <span className="text-gray-600"> or drag and drop</span>
                        </Label>
                        <Input
                          id="details-file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleDetailsFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          disabled={isUploading}
                        />
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {uploadError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {uploadError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {isUploading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </div>                  )}

                  {attachmentsLoading && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading attachments...</p>
                    </div>
                  )}

                  {!attachmentsLoading && selectedJob.attachments?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Uploaded Files</h4>
                      <ScrollArea className="max-h-60">
                        <div className="space-y-2">                          {selectedJob.attachments.map((attachment) => (
                            <div
                              key={attachment.id || attachment._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileIcon className="h-5 w-5 text-gray-500" />                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {attachment.fileName || attachment.originalName || attachment.filename || 'Unknown file'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)}KB` : attachment.size ? `${Math.round(attachment.size / 1024)}KB` : 'File size unknown'}
                                  </p>
                                </div>
                              </div>                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAttachment(attachment.id || attachment._id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2Icon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>                    </div>
                  )}

                  {!attachmentsLoading && (!selectedJob.attachments || selectedJob.attachments.length === 0) && (
                    <div className="text-center py-8">
                      <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No attachments uploaded yet</p>
                      <p className="text-sm text-gray-400 mt-2">Upload files using the form above</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ClientAssignmentGuard>
  );
};

export default ClientJobs;
