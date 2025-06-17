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
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Skeleton } from "@/components/UI/skeleton";

const AdminClients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');  const [clients, setClients] = useState([]);  // Ensure this is initialized as an empty array
  const [visibleClients, setVisibleClients] = useState(5);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Helper function to format client number from UUID (similar to job numbers)
  const formatClientNumber = (uuid) => {
    if (!uuid) return 'N/A';
    
    // If we already have a formatted client ID (numeric format), use it directly
    if (/^\d+$/.test(uuid)) {
      return uuid;
    }
    
    // Extract only numeric digits from UUID
    const numericDigits = uuid.replace(/[^0-9]/g, '');
    
    // Create a consistent format number similar to job numbers
    const clientNumber = numericDigits.padStart(8, '0').slice(0, 8);
    return `${clientNumber}`;
  };

  // Helper function to format date for display - removes the time part
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    if (dateString === '0000-00-00 00:00:00') return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

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
    };    fetchClients();
  }, []);

  const handleShowMore = () => {
    setVisibleClients((prev) => prev + 5);
  };  const handleShowLess = () => {
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

  const displayedClients = filteredClients.slice(0, visibleClients);  const handleViewClient = (clientId) => {
    navigate(`/admin/clients/${clientId}`);
  };
  return (
    <div className="space-y-6 admin-content">
      <div className='flex flex-col gap-4'>        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Client Management</h1>
        </div>
          <Card className="admin-card">
          <CardHeader>
            <CardTitle>Clients</CardTitle>
            <CardDescription>View and manage existing clients in the system</CardDescription><div className="flex items-center gap-4 mt-4">              <div className="relative flex-1">
                <Input
                  className="admin-input admin-focus"
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
                <>                  <table className="hidden md:table w-full text-sm">
                    <thead>                      <tr className="border-b">
                        <th className="py-3 text-left">Client Number</th>
                        <th className="py-3 text-left">Name</th>
                        <th className="py-3 text-left">Address</th>
                        <th className="py-3 text-left">Edit Date</th>
                        <th className="py-3 text-left">Actions</th>
                      </tr>
                    </thead>                    <tbody>
                      {displayedClients.map((client, index) => (
                        <tr key={client.uuid} className="border-b">
                          <td className="py-3">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {formatClientNumber(client.uuid)}
                            </span>
                          </td>                          <td className="py-3">{client.name || '...'}</td>
                          <td className="py-3">{client.address || '...'}</td>
                          <td className="py-3">{formatDate(client.edit_date)}</td>
                          <td className="py-3">
                            <Button onClick={() => handleViewDetails(client)}>
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}                      {displayedClients.length === 0 && (
                        <tr>
                          <td colSpan="5" className="py-4 text-center text-muted-foreground">
                            No clients found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>                  <div className="md:hidden space-y-4">
                    {displayedClients.map((client, index) => (
                      <div key={client.uuid} className="border p-4 rounded shadow">
                        <p><strong>Client Number:</strong> 
                          <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {formatClientNumber(client.uuid)}
                          </span>
                        </p>                        <p><strong>Name:</strong> {client.name || '...'}</p>
                        <p><strong>Address:</strong> {client.address || '...'}</p>
                        <p><strong>Edit Date:</strong> {formatDate(client.edit_date)}</p>
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
              </DialogHeader>              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Client Number:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {formatClientNumber(selectedClient.uuid)}
                  </span>
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
                </div>                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Edit Date:</span>
                  <span className="text-gray-900">{formatDate(selectedClient.edit_date)}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => setSelectedClient(null)}>
                  Close
                </Button>
              </div>            </DialogContent>
          </Dialog>        )}
      </div>
    </div>
  );
};

export default AdminClients;