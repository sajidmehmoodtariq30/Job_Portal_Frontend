// src/pages/admin/AdminClients.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/UI/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { Label } from "@/components/UI/label";
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Skeleton } from "@/components/UI/skeleton";

const AdminClients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    uuid: '',
    name: '',
    address: '',
    email: '',
    address_city: '',
    address_state: '',
    address_postcode: '',
    address_country: '',
  });
  const [clients, setClients] = useState([]);  // Ensure this is initialized as an empty array
  const [visibleClients, setVisibleClients] = useState(5);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(API_ENDPOINTS.CLIENTS.FETCH_ALL);
        console.log('Client data received:', response);
        setClients(response.data || []);  // We're expecting an array directly
        console.log('Clients state after setting:', response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]); // Ensure clients is set to empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const response = await axios.post(API_ENDPOINTS.CLIENTS.CREATE, {
            uuid: newClient.uuid,
            name: newClient.name,
            address: newClient.address,
            email: newClient.email,
            address_city: newClient.address_city,
            address_state: newClient.address_state,
            address_postcode: newClient.address_postcode,
            address_country: newClient.address_country,
            active: 1
        });
        console.log('Client created:', response.data);
        setClients((prevClients) => [...prevClients, response.data]);
        setIsDialogOpen(false);

        // Reset form
        setNewClient({
            uuid: '',
            name: '',
            address: '',
            email: '',
            address_city: '',
            address_state: '',
            address_postcode: '',
            address_country: ''
        });
    } catch (error) {
        console.error('Error creating client:', error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleShowMore = () => {
    setVisibleClients((prev) => prev + 5);
  };

  const handleShowLess = () => {
    setVisibleClients((prev) => Math.max(prev - 5, 5));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.CLIENTS.FETCH_ALL);
      console.log('Refreshed client data:', response);
      setClients(response.data || []);
      console.log('Clients state after refresh:', response.data);
    } catch (error) {
      console.error('Error refreshing clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
  };

  const filteredClients = Array.isArray(clients) ? clients.filter(client => {
    if (!client || searchTerm === '') return true;

    return (
      (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.contactName && client.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.uuid && client.uuid.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }) : [];

  const displayedClients = filteredClients.slice(0, visibleClients);

  const handleViewClient = (clientId) => {
    navigate(`/admin/clients/${clientId}`);
  };

  return (
    <div className="space-y-6">
      <div className='flex flex-col gap-4'>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Client Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Client</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
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
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={newClient.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={newClient.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address_city">City</Label>
                    <Input
                      id="address_city"
                      name="address_city"
                      value={newClient.address_city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address_state">State</Label>
                    <Input
                      id="address_state"
                      name="address_state"
                      value={newClient.address_state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address_postcode">Postcode</Label>
                    <Input
                      id="address_postcode"
                      name="address_postcode"
                      value={newClient.address_postcode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address_country">Country</Label>
                    <Input
                      id="address_country"
                      name="address_country"
                      value={newClient.address_country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                        Creating...
                      </>
                    ) : (
                      'Create Client'
                    )}
                  </Button>
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
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <table className="hidden md:table w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 text-left">Client ID</th>
                        <th className="py-3 text-left">Name</th>
                        <th className="py-3 text-left">Address</th>
                        <th className="py-3 text-left">Edit Date</th>
                        <th className="py-3 text-left">Active</th>
                        <th className="py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedClients.map((client) => (
                        <tr key={client.uuid} className="border-b">
                          <td className="py-3">{client.uuid ? client.uuid.slice(-4) : '...'}</td>
                          <td className="py-3">{client.name || '...'}</td>
                          <td className="py-3">{client.address || '...'}</td>
                          <td className="py-3">{client.edit_date || '...'}</td>
                          <td className="py-3">{client.active ? 'Yes' : 'No'}</td>
                          <td className="py-3">
                            <Button onClick={() => handleViewDetails(client)}>
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {displayedClients.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-4 text-center text-muted-foreground">
                            No clients found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="md:hidden space-y-4">
                    {displayedClients.map((client) => (
                      <div key={client.uuid} className="border p-4 rounded shadow">
                        <p><strong>Client ID:</strong> {client.uuid ? client.uuid.slice(-4) : '...'}</p>
                        <p><strong>Name:</strong> {client.name || '...'}</p>
                        <p><strong>Address:</strong> {client.address || '...'}</p>
                        <p><strong>Edit Date:</strong> {client.edit_date || '...'}</p>
                        <p><strong>Active:</strong> {client.active ? 'Yes' : 'No'}</p>
                        <Button className="mt-2" onClick={() => handleViewDetails(client)}>
                          Details
                        </Button>
                      </div>
                    ))}
                    {displayedClients.length === 0 && (
                      <p className="text-center text-muted-foreground">No clients found</p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-between mt-4">
              {visibleClients > 5 && (
                <Button onClick={handleShowLess}>Show Less</Button>
              )}
              {visibleClients < filteredClients.length && (
                <Button onClick={handleShowMore}>Show More</Button>
              )}
              <Button onClick={handleRefresh}>Refresh Data</Button>
            </div>
          </CardContent>
        </Card>

        {selectedClient && (
          <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Client Details</DialogTitle>
                <DialogDescription>View all the details of the selected client.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Client ID:</span>
                  <span className="text-gray-900">{selectedClient.uuid || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Name:</span>
                  <span className="text-gray-900">{selectedClient.name || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Address:</span>
                  <span className="text-gray-900">{selectedClient.address || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">City:</span>
                  <span className="text-gray-900">{selectedClient.address_city || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">State:</span>
                  <span className="text-gray-900">{selectedClient.address_state || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Country:</span>
                  <span className="text-gray-900">{selectedClient.address_country || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Edit Date:</span>
                  <span className="text-gray-900">{selectedClient.edit_date || 'Not Provided'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Active:</span>
                  <span className="text-gray-900">{selectedClient.active ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedClient(null)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminClients;