// src/pages/client/ClientJobDetails.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/UI/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/UI/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/UI/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/UI/dialog"
import { Input } from "@/components/UI/input"
import { Label } from "@/components/UI/label"
import { Textarea } from "@/components/UI/textarea"
import { Badge } from "@/components/UI/badge"
import { 
    ArrowLeft, 
    Calendar, 
    MapPin, 
    User, 
    Phone, 
    Mail, 
    FileText, 
    Download,
    MessageSquare,
    Plus
} from 'lucide-react'
import axios from 'axios'
import API_ENDPOINTS from '@/lib/apiConfig'

const ClientJobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
    const [newNote, setNewNote] = useState('');
    
    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);
    
    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            console.log(`Fetching job details for ID: ${jobId}`);
            const response = await axios.get(`${API_ENDPOINTS.JOBS.FETCH_BY_ID}/${jobId}`);
            console.log('Response:', response.data);
            if (response.data && response.data.data) {
                setJob(response.data.data);
            } else if (response.data) {
                // Handle case where data is not nested under "data" property
                setJob(response.data);
            } else {
                setError('Job not found');
            }
        } catch (error) {
            console.error('Error fetching job details:', error);
            setError('Failed to fetch job details');        } finally {
            setLoading(false);
        }
    };
      const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            // Add note logic here - you might need to create an API endpoint for this
            console.log('Adding note:', newNote);
            setNewNote('');
            setShowAddNoteDialog(false);
            // Refresh job details to show new note
            // await fetchJobDetails();
        } catch (error) {
            console.error('Error adding note:', error);
        }
    };
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'In Progress': return 'bg-blue-600 text-white';
            case 'Quote': return 'bg-amber-500 text-white';
            case 'Work Order': return 'bg-yellow-100 text-yellow-800';
            case 'Completed': return 'bg-green-600 text-white';
            case 'Scheduled': return 'bg-purple-600 text-white';
            case 'On Hold': return 'bg-gray-600 text-white';
            default: return 'bg-gray-600 text-white';
        }
    };    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading job details...</div>
            </div>
        );
    }    if (error || !job) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="text-lg text-red-600">{error || 'Job not found'}</div>
                <Button onClick={() => navigate('/client/jobs')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Jobs
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/client/jobs')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Jobs
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {job.generated_job_id || job.uuid}
                        </h1>
                        <p className="text-gray-600">{job.job_description || job.description}</p>
                    </div>
                </div>
                <Badge className={getStatusColor(job.status)}>
                    {job.status}
                </Badge>
            </div>

            <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="details">Job Details</TabsTrigger>
                    <TabsTrigger value="notes">Notes & Updates</TabsTrigger>
                    <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Job Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Job Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Job ID</Label>
                                    <p>{job.generated_job_id || job.uuid}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                                    <p>{job.job_description || job.description || 'No description available'}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Created Date</Label>
                                    <p className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {formatDate(job.date)}
                                    </p>
                                </div>
                                {job.work_order_date && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Scheduled Date</Label>
                                        <p className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {formatDate(job.work_order_date)}
                                        </p>
                                    </div>
                                )}
                                {job.completion_date && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Completed Date</Label>
                                        <p className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {formatDate(job.completion_date)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Location & Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    Location & Contact
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Job Address</Label>
                                    <p className="flex items-start">
                                        <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                                        {job.job_address || 'No address specified'}
                                    </p>
                                </div>
                                {job.contact_name && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Contact Name</Label>
                                        <p className="flex items-center">
                                            <User className="w-4 h-4 mr-2" />
                                            {job.contact_name}
                                        </p>
                                    </div>
                                )}
                                {job.contact_email && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Contact Email</Label>
                                        <p className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2" />
                                            <a href={`mailto:${job.contact_email}`} className="text-blue-600 hover:underline">
                                                {job.contact_email}
                                            </a>
                                        </p>
                                    </div>
                                )}
                                {job.contact_phone && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Contact Phone</Label>
                                        <p className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2" />
                                            <a href={`tel:${job.contact_phone}`} className="text-blue-600 hover:underline">
                                                {job.contact_phone}
                                            </a>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Work Description */}
                    {job.work_done_description && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Work Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{job.work_done_description}</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Notes & Updates</h3>
                        <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Note
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Note</DialogTitle>
                                    <DialogDescription>
                                        Add a note or update about this job.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="note">Note</Label>
                                        <Textarea
                                            id="note"
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Enter your note here..."
                                            rows={4}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowAddNoteDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleAddNote}>
                                        Add Note
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="space-y-4">
                        {/* Notes would be displayed here */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <MessageSquare className="w-5 h-5 mt-1 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">No notes available for this job yet.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Attachments</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Attachments would be displayed here */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <FileText className="w-5 h-5 mt-1 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">No attachments available for this job yet.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>            </Tabs>
        </div>
    );
};

export default ClientJobDetails
