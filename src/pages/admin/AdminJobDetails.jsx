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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/UI/select"
import { MessageSquare } from 'lucide-react'
import AdminChatRoom from "@/components/UI/admin/AdminChatRoom"
import NotesTab from "@/components/UI/NotesTab"
import axios from 'axios'
import { API_ENDPOINTS } from '@/lib/apiConfig'

const statusOptions = ['Quote', 'Work Order', 'In Progress', 'Completed']

const AdminJobDetails = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const [job, setJob] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newNote, setNewNote] = useState('')
    const [isAddingNote, setIsAddingNote] = useState(false)
    const [isUploadingFile, setIsUploadingFile] = useState(false)
    const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)

    useEffect(() => {        const fetchJobDetails = async () => {
            setLoading(true)
            
            try {
                const response = await axios.get(`${API_ENDPOINTS.JOBS.FETCH_BY_ID}/${jobId}`)
                
                if (response.data && response.data.data) {
                    const jobData = response.data.data
                    // Ensure notes and attachments arrays exist
                    jobData.notes = jobData.notes || []
                    jobData.attachments = jobData.attachments || []
                    setJob(jobData)
                    setSelectedStatus(jobData.status)
                } else {
                    console.error('No job data found')
                    setJob(null)
                }
            } catch (error) {
                console.error('Error fetching job details:', error)
                setJob(null)
            } finally {
                setLoading(false)
            }
        }

        if (jobId) {
            fetchJobDetails()
        }
    }, [jobId])

    const handleAddNote = () => {
        if (!newNote.trim()) return

        const note = {
            id: Date.now(),
            text: newNote,
            createdAt: new Date().toISOString().split('T')[0],
            author: 'Admin'
        }

        setJob(prev => ({
            ...prev,
            notes: [note, ...prev.notes]
        }))

        setNewNote('')
        setIsAddingNote(false)
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleFileUpload = () => {
        if (!selectedFile) return

        const attachment = {
            id: Date.now(),
            name: selectedFile.name,
            size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: new Date().toISOString().split('T')[0],
            uploadedBy: 'Admin'
        }

        setJob(prev => ({
            ...prev,
            attachments: [attachment, ...prev.attachments]
        }))

        setSelectedFile(null)
        setIsUploadingFile(false)
    }

    const handleUpdateStatus = () => {
        setJob(prev => ({
            ...prev,
            status: selectedStatus
        }))

        setIsUpdateStatusOpen(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading job details...</p>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                <p className="mb-4">The job you're looking for doesn't exist or has been deleted.</p>
                <Button onClick={() => navigate('/admin/jobs')}>
                    Return to Jobs
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">
                        {job.generated_job_id || `Job ${job.uuid?.slice(0, 8)}`}
                    </h1>
                    <p className="text-muted-foreground">{job.job_description || job.description}</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Update Status</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Update Job Status</DialogTitle>
                                <DialogDescription>
                                    Change the status of this job in ServiceM8.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Label htmlFor="status" className="mb-2 block">Status</Label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map(status => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleUpdateStatus}>Update Status</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={() => navigate('/admin/jobs')}>Back to Jobs</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Job Information</CardTitle>
                        <CardDescription>Details about this job</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Client</h3>
                                <p>{job.client || 'Unknown Client'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                                <span className={`px-2 py-1 rounded text-xs ${job.status === 'Quote'
                                        ? 'bg-orange-100 text-orange-800'
                                        : job.status === 'Work Order'
                                            ? 'bg-blue-100 text-blue-800'
                                            : job.status === 'In Progress'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                    }`}>
                                    {job.status}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Created Date</h3>
                                <p>{job.date || job.createdAt || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Amount</h3>
                                <p>${job.quote_amount || job.amount || '0.00'}</p>
                            </div>
                            <div className="col-span-2">
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                                <p>{job.job_description || job.description || 'No description'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Job Number</h3>
                                <p>{job.generated_job_id || job.uuid?.slice(0, 8) || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Category</h3>
                                <p>{job.category_name || 'Uncategorized'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Location Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location Details</CardTitle>
                        <CardDescription>Service location information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Street</h3>
                                <p>{job.location_street || job.geo_street || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">City</h3>
                                    <p>{job.location_city || job.geo_city || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">State</h3>
                                    <p>{job.location_state || job.geo_state || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Postcode</h3>
                                    <p>{job.location_postcode || job.geo_postcode || 'N/A'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Country</h3>
                                    <p>{job.location_country || job.geo_country || 'N/A'}</p>
                                </div>
                            </div>
                            {job.location_address && (
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Full Address</h3>
                                    <p className="text-sm">{job.location_address}</p>
                                </div>
                            )}
                            {job.location_uuid && (
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Location ID</h3>
                                    <p className="text-xs text-muted-foreground">{job.location_uuid}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                        <CardDescription>Client contact details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Name</h3>
                                <p>{job.contactName || job.contact_name || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Phone</h3>
                                <p>{job.contactPhone || job.contact_phone || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Email</h3>
                                <p>{job.contactEmail || job.contact_email || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                        <CardDescription>Quick actions for this job</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full" onClick={() => window.alert("Send email functionality")}>
                            Email Client
                        </Button>
                        <Button className="w-full" variant="outline" onClick={() => window.alert("Schedule functionality")}>
                            Schedule Visit
                        </Button>
                        {job.status === 'Quote' && (
                            <Button className="w-full" variant="secondary" onClick={() => window.alert("Convert quote functionality")}>
                                Convert to Work Order
                            </Button>
                        )}
                        {job.status === 'Work Order' && (
                            <Button className="w-full" variant="secondary" onClick={() => window.alert("Start job functionality")}>
                                Start Job
                            </Button>
                        )}
                        {job.status === 'In Progress' && (
                            <Button className="w-full" variant="secondary" onClick={() => window.alert("Complete job functionality")}>
                                Complete Job
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="notes">
                <TabsList>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="attachments">Attachments</TabsTrigger>
                    <TabsTrigger value="chat" className="relative">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                    </TabsTrigger>
                </TabsList>                <TabsContent value="notes" className="p-0 mt-6">
                    <NotesTab jobId={job.id || job.uuid} userType="admin" />
                </TabsContent>

                <TabsContent value="attachments" className="p-0 mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Attachments</CardTitle>
                                <Button size="sm" onClick={() => setIsUploadingFile(true)}>Upload File</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isUploadingFile && (
                                <div className="mb-6 p-4 border rounded-md">
                                    <Label htmlFor="fileUpload" className="mb-2 block">Upload File</Label>
                                    <Input
                                        id="fileUpload"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="mb-4"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsUploadingFile(false)}>Cancel</Button>
                                        <Button onClick={handleFileUpload} disabled={!selectedFile}>Upload</Button>
                                    </div>
                                </div>
                            )}

                            {job.attachments && job.attachments.length === 0 ? (
                                <p className="text-muted-foreground text-center py-6">No attachments added yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {job.attachments && job.attachments.map(file => (
                                        <div key={file.id} className="flex justify-between items-center p-3 border rounded-md">
                                            <div className="flex items-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="mr-2"
                                                >
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                    <polyline points="14 2 14 8 20 8"></polyline>
                                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                                    <polyline points="10 9 9 9 8 9"></polyline>
                                                </svg>
                                                <div>
                                                    <p className="font-medium">{file.name}</p>
                                                    <div className="flex text-xs text-muted-foreground">
                                                        <span>{file.uploadedBy} • {file.uploadedAt} • {file.size}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="ml-2">
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="chat" className="p-0 mt-6">
                    <AdminChatRoom jobId={job.id || job.uuid} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdminJobDetails
