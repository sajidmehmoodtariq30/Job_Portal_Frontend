// src/pages/admin/AdminClients.jsx
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog"
import { Label } from "@/components/UI/label"

// Mock data - in production would come from ServiceM8 API
const mockClients = [
  { 
    id: 'CL001', 
    name: 'Acme Corp', 
    contactName: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '(212) 555-1234',
    address: '123 Business Ave, Suite 101, New York, NY 10001',
    createdAt: '2024-10-15',
    jobCount: 8
  },
  { 
    id: 'CL002', 
    name: 'TechSolutions Inc', 
    contactName: 'Sara Johnson',
    email: 'sara@techsolutions.com',
    phone: '(415) 555-6789',
    address: '456 Tech Road, San Francisco, CA 94107',
    createdAt: '2024-12-03',
    jobCount: 5
  },
  { 
    id: 'CL003', 
    name: 'Global Enterprises', 
    contactName: 'Mike Wilson',
    email: 'mike@globalent.com',
    phone: '(312) 555-9876',
    address: '789 Corporate Drive, Chicago, IL 60611',
    createdAt: '2025-01-22',
    jobCount: 3
  },
  { 
    id: 'CL004', 
    name: 'Data Systems Ltd', 
    contactName: 'Lisa Brown',
    email: 'lisa@datasystems.com',
    phone: '(512) 555-4321',
    address: '321 Data Lane, Austin, TX 78701',
    createdAt: '2025-02-14',
    jobCount: 2
  },
  { 
    id: 'CL005', 
    name: 'Innovation Labs', 
    contactName: 'Alex Chen',
    email: 'alex@innovationlabs.com',
    phone: '(206) 555-8765',
    address: '654 Research Blvd, Seattle, WA 98101',
    createdAt: '2025-03-08',
    jobCount: 0
  },
]

const AdminClients = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  })
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewClient({ ...newClient, [name]: value })
  }
  
  const handleCreateClient = (e) => {
    e.preventDefault()
    
    // In production, this would call the ServiceM8 API
    console.log('Creating client:', newClient)
    setIsDialogOpen(false)
    
    // Reset form
    setNewClient({
      name: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
    })
  }
  
  const filteredClients = mockClients.filter(client => {
    if (searchTerm === '') return true
    
    return (
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })
  
  const handleViewClient = (clientId) => {
    navigate(`/admin/clients/${clientId}`)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Enter the client details to create a new record in ServiceM8.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClient}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newClient.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    value={newClient.contactName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newClient.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newClient.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={newClient.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Client</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>View and manage all clients in the system</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search clients..."
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
                  <th className="py-3 text-left">Client ID</th>
                  <th className="py-3 text-left">Name</th>
                  <th className="py-3 text-left">Contact</th>
                  <th className="py-3 text-left">Email</th>
                  <th className="py-3 text-left">Phone</th>
                  <th className="py-3 text-left">Jobs</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b">
                    <td className="py-3">{client.id}</td>
                    <td className="py-3">{client.name}</td>
                    <td className="py-3">{client.contactName}</td>
                    <td className="py-3">{client.email}</td>
                    <td className="py-3">{client.phone}</td>
                    <td className="py-3">{client.jobCount}</td>
                    <td className="py-3">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewClient(client.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-muted-foreground">
                      No clients found
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

export default AdminClients