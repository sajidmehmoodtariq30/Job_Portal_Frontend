// src/pages/admin/AdminClientDetails.jsx
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

import { Input } from "@/components/UI/input"
import { Label } from "@/components/UI/label"

// Mock client data - in production would fetch from ServiceM8 API
const mockClientDetails = {
    'CL001': {
        id: 'CL001',
        name: 'Acme Corp',
        contactName: 'John Smith',
        email: 'john@acmecorp.com',
        phone: '(212) 555-1234',
        address: '123 Business Ave, Suite 101, New York, NY 10001',
        createdAt: '2024-10-15',
        notes: [
            { id: 1, text: 'Client requires detailed invoices with itemized costs', createdAt: '2024-10-15', author: 'Admin' },
            { id: 2, text: 'Prefer email communication over phone calls', createdAt: '2024-12-20', author: 'Admin' }
        ],
        jobs: [
            { id: 'JOB-2025-042', description: 'Network installation and setup', status: 'Quote', createdAt: '2025-04-09', amount: 2500.00 },
            { id: 'JOB-2025-038', description: 'Annual maintenance contract', status: 'Completed', createdAt: '2025-03-15', amount: 1800.00 },
            { id: 'JOB-2025-025', description: 'Office relocation tech support', status: 'Completed', createdAt: '2025-02-08', amount: 3200.00 }
        ]
    },
    'CL002': {
        id: 'CL002',
        name: 'TechSolutions Inc',
        contactName: 'Sara Johnson',
        email: 'sara@techsolutions.com',
        phone: '(415) 555-6789',
        address: '456 Tech Road, San Francisco, CA 94107',
        createdAt: '2024-12-03',
        notes: [
            { id: 1, text: 'VIP client, prioritize service requests', createdAt: '2024-12-03', author: 'Admin' }
        ],
        jobs: [
            { id: 'JOB-2025-041', description: 'Server maintenance and updates', status: 'Work Order', createdAt: '2025-04-08', amount: 1200.00 },
            { id: 'JOB-2025-033', description: 'Cybersecurity assessment', status: 'Completed', createdAt: '2025-03-01', amount: 2400.00 }
        ]
    },
    'CL003': {
        id: 'CL003',
        name: 'Global Enterprises',
        contactName: 'Mike Wilson',
        email: 'mike@globalent.com',
        phone: '(312) 555-9876',
        address: '789 Corporate Drive, Chicago, IL 60611',
        createdAt: '2025-01-22',
        notes: [
            { id: 1, text: 'Billing goes to accounting department', createdAt: '2025-01-22', author: 'Admin' },
            { id: 2, text: 'Service windows only available on weekends', createdAt: '2025-02-15', author: 'Admin' }
        ],
        jobs: [
            { id: 'JOB-2025-040', description: 'Security camera installation', status: 'In Progress', createdAt: '2025-04-07', amount: 3750.00 },
            { id: 'JOB-2025-032', description: 'Door access control system', status: 'Completed', createdAt: '2025-02-28', amount: 2950.00 }
        ]
    },
    'CL004': {
        id: 'CL004',
        name: 'Data Systems Ltd',
        contactName: 'Lisa Brown',
        email: 'lisa@datasystems.com',
        phone: '(512) 555-4321',
        address: '321 Data Lane, Austin, TX 78701',
        createdAt: '2025-02-14',
        notes: [
            { id: 1, text: 'New client referred by Global Enterprises', createdAt: '2025-02-14', author: 'Admin' }
        ],
        jobs: [
            { id: 'JOB-2025-039', description: 'Data recovery and backup setup', status: 'Completed', createdAt: '2025-04-06', amount: 950.00 }
        ]
    },
    'CL005': {
        id: 'CL005',
        name: 'Innovation Labs',
        contactName: 'Alex Chen',
        email: 'alex@innovationlabs.com',
        phone: '(206) 555-8765',
        address: '654 Research Blvd, Seattle, WA 98101',
        createdAt: '2025-03-08',
        notes: [],
        jobs: []
    }
}

const AdminClientDetails = () => {
    const { clientId } = useParams()
    const navigate = useNavigate()
    const [client, setClient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditMode, setIsEditMode] = useState(false)
    const [editedClient, setEditedClient] = useState(null)
    const [newNote, setNewNote] = useState('')
    const [isAddingNote, setIsAddingNote] = useState(false)

    useEffect(() => {
        // In production, this would fetch from ServiceM8 API
        const fetchClientDetails = () => {
            setLoading(true)

            // Simulate API call
            setTimeout(() => {
                if (mockClientDetails[clientId]) {
                    setClient(mockClientDetails[clientId])
                    setEditedClient(mockClientDetails[clientId])
                }
                setLoading(false)
            }, 500)
        }

        fetchClientDetails()
    }, [clientId])

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditedClient({ ...editedClient, [name]: value })
    }

    const handleSaveEdits = () => {
        // In production, this would call the ServiceM8 API
        setClient(editedClient)
        setIsEditMode(false)
    }

    // src/pages/admin/AdminClientDetails.jsx (continued)

    const handleAddNote = () => {
        if (!newNote.trim()) return

        // In production, this would call the ServiceM8 API
        const note = {
            id: Date.now(),
            text: newNote,
            createdAt: new Date().toISOString().split('T')[0],
            author: 'Admin'
        }

        setClient(prev => ({
            ...prev,
            notes: [note, ...prev.notes]
        }))

        setNewNote('')
        setIsAddingNote(false)
    }

    const handleViewJob = (jobId) => {
        navigate(`/admin/jobs/${jobId}`)
    }

    const handleCreateJob = () => {
        // In a real application, this would navigate to job creation with the client pre-selected
        navigate('/admin/jobs/new', { state: { preselectedClient: client.id } })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading client details...</p>
            </div>
        )
    }

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
                <p className="mb-4">The client you're looking for doesn't exist or has been deleted.</p>
                <Button onClick={() => navigate('/admin/clients')}>
                    Return to Clients
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{client.name}</h1>
                    <p className="text-muted-foreground">Client ID: {client.id}</p>
                </div>
                <div className="flex gap-2">
                    {!isEditMode ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditMode(true)}>
                                Edit Client
                            </Button>
                            <Button onClick={() => navigate('/admin/clients')}>
                                Back to Clients
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setIsEditMode(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveEdits}>
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                    <CardDescription>Contact details and general information</CardDescription>
                </CardHeader>
                <CardContent>
                    {!isEditMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Contact Name</h3>
                                <p>{client.contactName}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Email</h3>
                                <p>{client.email}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Phone</h3>
                                <p>{client.phone}</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Client Since</h3>
                                <p>{client.createdAt}</p>
                            </div>
                            <div className="md:col-span-2">
                                <h3 className="font-medium text-sm text-muted-foreground mb-1">Address</h3>
                                <p>{client.address}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Company Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={editedClient.name}
                                        onChange={handleEditChange}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="contactName">Contact Name</Label>
                                    <Input
                                        id="contactName"
                                        name="contactName"
                                        value={editedClient.contactName}
                                        onChange={handleEditChange}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        value={editedClient.email}
                                        onChange={handleEditChange}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={editedClient.phone}
                                        onChange={handleEditChange}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={editedClient.address}
                                    onChange={handleEditChange}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Jobs</CardTitle>
                            <CardDescription>Jobs associated with this client</CardDescription>
                        </div>
                        <Button onClick={handleCreateJob}>Create New Job</Button>
                    </CardHeader>
                    <CardContent>
                        {client.jobs.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-muted-foreground">This client has no jobs yet.</p>
                                <Button className="mt-4" variant="outline" onClick={handleCreateJob}>
                                    Create First Job
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-3 text-left">Job ID</th>
                                            <th className="py-3 text-left">Description</th>
                                            <th className="py-3 text-left">Status</th>
                                            <th className="py-3 text-left">Created</th>
                                            <th className="py-3 text-left">Amount</th>
                                            <th className="py-3 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {client.jobs.map(job => (
                                            <tr key={job.id} className="border-b">
                                                <td className="py-3">{job.id}</td>
                                                <td className="py-3">{job.description}</td>
                                                <td className="py-3">
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
                                                </td>
                                                <td className="py-3">{job.createdAt}</td>
                                                <td className="py-3">${job.amount.toFixed(2)}</td>
                                                <td className="py-3">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewJob(job.id)}
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Notes</CardTitle>
                            <CardDescription>Client-specific notes</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setIsAddingNote(true)}>
                            Add Note
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isAddingNote && (
                            <div className="mb-4 p-3 border rounded-md">
                                <Label htmlFor="newNote" className="mb-2 block">New Note</Label>
                                <Input
                                    id="newNote"
                                    placeholder="Enter your note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="mb-3"
                                />
                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setIsAddingNote(false)}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleAddNote}>
                                        Add Note
                                    </Button>
                                </div>
                            </div>
                        )}

                        {client.notes.length === 0 ? (
                            <p className="text-muted-foreground text-center py-6">No notes added yet</p>
                        ) : (
                            <div className="space-y-3">
                                {client.notes.map(note => (
                                    <div key={note.id} className="p-3 border rounded-md">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium">{note.author}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {note.createdAt}
                                            </span>
                                        </div>
                                        <p className="text-sm">{note.text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AdminClientDetails