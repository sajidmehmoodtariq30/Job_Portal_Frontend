// src/pages/admin/AdminJobDetails.jsx
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

// Mock job data - in production would fetch from ServiceM8 API
const mockJobDetails = {
    'JOB-2025-042': {
        id: 'JOB-2025-042',
        client: 'Acme Corp',
        clientId: 'CL001',
        status: 'Quote',
        createdAt: '2025-04-09',
        description: 'Network installation and setup',
        amount: 2500.00,
        address: '123 Business Ave, Suite 101, New York, NY 10001',
        contactName: 'John Smith',
        contactEmail: 'john@acmecorp.com',
        contactPhone: '(212) 555-1234',
        notes: [
            { id: 1, text: 'Initial consultation completed', createdAt: '2025-04-09', author: 'Admin' },
            { id: 2, text: 'Client requested additional information on network security', createdAt: '2025-04-10', author: 'John Smith' }
        ],
        attachments: [
            { id: 1, name: 'site-plan.pdf', size: '2.4 MB', uploadedAt: '2025-04-09', uploadedBy: 'Admin' },
            { id: 2, name: 'quote-details.docx', size: '1.1 MB', uploadedAt: '2025-04-10', uploadedBy: 'Admin' }
        ]
    },
    'JOB-2025-041': {
        id: 'JOB-2025-041',
        client: 'TechSolutions Inc',
        clientId: 'CL002',
        status: 'Work Order',
        createdAt: '2025-04-08',
        description: 'Server maintenance and updates',
        amount: 1200.00,
        address: '456 Tech Road, San Francisco, CA 94107',
        contactName: 'Sara Johnson',
        contactEmail: 'sara@techsolutions.com',
        contactPhone: '(415) 555-6789',
        notes: [
            { id: 1, text: 'Quote approved by client', createdAt: '2025-04-08', author: 'Admin' },
            { id: 2, text: 'Scheduled for April 15', createdAt: '2025-04-09', author: 'Admin' }
        ],
        attachments: [
            { id: 1, name: 'server-specs.pdf', size: '3.2 MB', uploadedAt: '2025-04-08', uploadedBy: 'Sara Johnson' }
        ]
    },
    'JOB-2025-040': {
        id: 'JOB-2025-040',
        client: 'Global Enterprises',
        clientId: 'CL003',
        status: 'In Progress',
        createdAt: '2025-04-07',
        description: 'Security camera installation',
        amount: 3750.00,
        address: '789 Corporate Drive, Chicago, IL 60611',
        contactName: 'Mike Wilson',
        contactEmail: 'mike@globalent.com',
        contactPhone: '(312) 555-9876',
        notes: [
            { id: 1, text: 'Work started on April 10', createdAt: '2025-04-10', author: 'Admin' },
            { id: 2, text: 'Initial cameras installed on first floor', createdAt: '2025-04-11', author: 'Admin' }
        ],
        attachments: [
            { id: 1, name: 'camera-locations.pdf', size: '4.7 MB', uploadedAt: '2025-04-07', uploadedBy: 'Admin' }
        ]
    },
    'JOB-2025-039': {
        id: 'JOB-2025-039',
        client: 'Data Systems Ltd',
        clientId: 'CL004',
        status: 'Completed',
        createdAt: '2025-04-06',
        description: 'Data recovery and backup setup',
        amount: 950.00,
        address: '321 Data Lane, Austin, TX 78701',
        contactName: 'Lisa Brown',
        contactEmail: 'lisa@datasystems.com',
        contactPhone: '(512) 555-4321',
        notes: [
            { id: 1, text: 'Recovery completed successfully', createdAt: '2025-04-06', author: 'Admin' },
            { id: 2, text: 'Backup system configured and tested', createdAt: '2025-04-06', author: 'Admin' },
            { id: 3, text: 'Client confirmed data integrity', createdAt: '2025-04-07', author: 'Lisa Brown' }
        ],
        attachments: [
            { id: 1, name: 'recovery-report.pdf', size: '1.8 MB', uploadedAt: '2025-04-06', uploadedBy: 'Admin' },
            { id: 2, name: 'backup-config.pdf', size: '0.9 MB', uploadedAt: '2025-04-06', uploadedBy: 'Admin' }
        ]
    }
}

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

    // src/pages/admin/AdminJobDetails.jsx (continued)

    useEffect(() => {
        // In production, this would fetch from ServiceM8 API
        const fetchJobDetails = () => {
            setLoading(true)

            // Simulate API call
            setTimeout(() => {
                if (mockJobDetails[jobId]) {
                    setJob(mockJobDetails[jobId])
                    setSelectedStatus(mockJobDetails[jobId].status)
                }
                setLoading(false)
            }, 500)
        }

        fetchJobDetails()
    }, [jobId])

    const handleAddNote = () => {
        if (!newNote.trim()) return

        // In production, this would call the ServiceM8 API
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

        // In production, this would call the ServiceM8 API to upload the file
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
        // In production, this would call the ServiceM8 API
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
                    <h1 className="text-3xl font-bold">{job.id}</h1>
                    <p className="text-muted-foreground">{job.description}</p>
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
                                <p>{job.client}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Status</h3>
                                <span className={`px-2 py-1 rounded text-xs ${job.status === 'Quote'
                                        ? 'bg-blue-100 text-blue-800'
                                        : job.status === 'Work Order'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : job.status === 'In Progress'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                    }`}>
                                    {job.status}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Created Date</h3>
                                <p>{job.createdAt}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Amount</h3>
                                <p>{job.amount}</p>
                            </div>
                            <div className="col-span-2">
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Address</h3>
                                <p>{job.address}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Name</h3>
                                <p>{job.contactName}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Phone</h3>
                                <p>{job.contactPhone}</p>
                            </div>
                            <div className="col-span-2">
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Email</h3>
                                <p>{job.contactEmail}</p>
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
                </TabsList>

                <TabsContent value="notes" className="p-0 mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Job Notes</CardTitle>
                                <Button size="sm" onClick={() => setIsAddingNote(true)}>Add Note</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isAddingNote && (
                                <div className="mb-6 p-4 border rounded-md">
                                    <Label htmlFor="newNote" className="mb-2 block">New Note</Label>
                                    <Input
                                        id="newNote"
                                        placeholder="Enter your note..."
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        className="mb-4"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setIsAddingNote(false)}>Cancel</Button>
                                        <Button onClick={handleAddNote}>Add Note</Button>
                                    </div>
                                </div>
                            )}

                            {job.notes.length === 0 ? (
                                <p className="text-muted-foreground text-center py-6">No notes added yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {job.notes.map(note => (
                                        <div key={note.id} className="p-4 border rounded-md">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium">{note.author}</span>
                                                <span className="text-sm text-muted-foreground">{note.createdAt}</span>
                                            </div>
                                            <p>{note.text}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
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

                            {job.attachments.length === 0 ? (
                                <p className="text-muted-foreground text-center py-6">No attachments added yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {job.attachments.map(file => (
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
            </Tabs>
        </div>
    )
}

export default AdminJobDetails