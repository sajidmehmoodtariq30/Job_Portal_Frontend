// Client Display Name Manager Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Badge } from "@/components/UI/badge";
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Search, Edit, Save, X, UserCheck, Mail } from 'lucide-react';
import SearchableClientSelect from '@/components/UI/SearchableClientSelect';

const ClientNameManager = () => {
  const [clients, setClients] = useState([]);
  const [clientMappings, setClientMappings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingMapping, setEditingMapping] = useState(null);
  const [newMapping, setNewMapping] = useState({
    clientEmail: '',
    displayName: '',
    username: '',
    clientUuid: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchClientMappings();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CLIENTS.FETCH_ALL);
      setClients(response.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };
  const fetchClientMappings = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CLIENTS.MAPPINGS.GET_ALL);
      setClientMappings(response.data.data || []);
    } catch (error) {
      console.error('Error fetching client mappings:', error);
      setClientMappings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMapping = async () => {
    if (!newMapping.clientEmail || !newMapping.displayName || !newMapping.username) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);
        // Create mapping in backend
      const response = await axios.post(API_ENDPOINTS.CLIENTS.MAPPINGS.CREATE, {
        clientEmail: newMapping.clientEmail,
        displayName: newMapping.displayName,
        username: newMapping.username,
        clientUuid: newMapping.clientUuid
      });

      if (response.data.success) {
        setClientMappings(prev => [...prev, response.data.data]);
        
        setNewMapping({
          clientEmail: '',
          displayName: '',
          username: '',
          clientUuid: ''
        });
        
        alert('Client name mapping created successfully');
      }
    } catch (error) {
      console.error('Error creating mapping:', error);
      alert('Error creating mapping. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  const handleUpdateMapping = async (mapping) => {
    try {
      const response = await axios.put(
        API_ENDPOINTS.CLIENTS.MAPPINGS.UPDATE(mapping.id),
        mapping
      );

      if (response.data.success) {
        setClientMappings(prev => 
          prev.map(m => m.id === mapping.id ? response.data.data : m)
        );
        setEditingMapping(null);
        alert('Mapping updated successfully');
      }
    } catch (error) {
      console.error('Error updating mapping:', error);
      alert('Error updating mapping. Please try again.');
    }
  };
  const handleDeleteMapping = async (mappingId) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;

    try {
      const response = await axios.delete(
        API_ENDPOINTS.CLIENTS.MAPPINGS.DELETE(mappingId)
      );

      if (response.data.success) {
        setClientMappings(prev => prev.filter(m => m.id !== mappingId));
        alert('Mapping deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting mapping:', error);
      alert('Error deleting mapping. Please try again.');
    }
  };

  const filteredMappings = clientMappings.filter(mapping =>
    mapping.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Name Management</h1>
          <p className="text-gray-600">Manage client usernames and display names</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Create Name Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Client Name Mapping</DialogTitle>
              <DialogDescription>
                Assign a display name and username to a client email address
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newMapping.clientEmail}
                  onChange={(e) => setNewMapping({...newMapping, clientEmail: e.target.value})}
                  placeholder="client@example.com"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={newMapping.displayName}
                  onChange={(e) => setNewMapping({...newMapping, displayName: e.target.value})}
                  placeholder="John Smith"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newMapping.username}
                  onChange={(e) => setNewMapping({...newMapping, username: e.target.value})}
                  placeholder="johnsmith"
                />
              </div>              <div className="grid gap-2">
                <Label htmlFor="clientSelect">Associated Client (Optional)</Label>
                <SearchableClientSelect
                  clients={clients}
                  value={newMapping.clientUuid}
                  onValueChange={(value) => setNewMapping({...newMapping, clientUuid: value})}
                  placeholder="Select a client..."
                  isLoading={isLoading}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={handleCreateMapping}
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Mapping'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Client Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by display name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Name Mappings</CardTitle>
          <CardDescription>
            {filteredMappings.length} mapping(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading mappings...</div>
          ) : filteredMappings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No client name mappings found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Associated Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {editingMapping?.id === mapping.id ? (
                          <Input
                            value={editingMapping.clientEmail}
                            onChange={(e) => setEditingMapping({
                              ...editingMapping,
                              clientEmail: e.target.value
                            })}
                            className="w-full"
                          />
                        ) : (
                          mapping.clientEmail
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {editingMapping?.id === mapping.id ? (
                        <Input
                          value={editingMapping.displayName}
                          onChange={(e) => setEditingMapping({
                            ...editingMapping,
                            displayName: e.target.value
                          })}
                          className="w-full"
                        />
                      ) : (
                        <span className="font-medium">{mapping.displayName}</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {editingMapping?.id === mapping.id ? (
                        <Input
                          value={editingMapping.username}
                          onChange={(e) => setEditingMapping({
                            ...editingMapping,
                            username: e.target.value
                          })}
                          className="w-full"
                        />
                      ) : (
                        <Badge variant="secondary">@{mapping.username}</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {mapping.clientUuid ? (
                        <span className="text-sm text-gray-600">
                          {clients.find(c => c.uuid === mapping.clientUuid)?.name || 'Unknown Client'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">No client linked</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={mapping.isActive ? "default" : "secondary"}>
                        {mapping.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingMapping?.id === mapping.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateMapping(editingMapping)}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMapping(null)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMapping(mapping)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteMapping(mapping.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{clientMappings.length}</div>
              <div className="text-sm text-gray-600">Total Mappings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {clientMappings.filter(m => m.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Mappings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{clients.length}</div>
              <div className="text-sm text-gray-600">Total Clients</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNameManager;
