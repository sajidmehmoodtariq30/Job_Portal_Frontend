// src/pages/client/ClientUserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/UI/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/UI/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/UI/dialog";
import { Badge } from "@/components/UI/badge";
import { Trash2, UserPlus, Users, Mail, Phone, Building, Shield, Edit2, MoreVertical, Eye, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/UI/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from '@/lib/apiConfig';

const ClientUserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [clientInfo, setClientInfo] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    email: '',
    contactNumber: '',
    permissionLevel: '',
    password: '',
    confirmPassword: '',
    assignedClientUuid: '' // Will be auto-filled with current client
  });

  // Permission levels
  const permissionLevels = [
    { value: 'management', label: 'Management', description: 'Full access to manage jobs, users, and settings' },
    { value: 'maintenance', label: 'Maintenance', description: 'Access to view and update job statuses' },
    { value: 'basic', label: 'Basic', description: 'View-only access to jobs and schedules' }
  ];

  // Fetch users for current client
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const clientData = JSON.parse(localStorage.getItem('client_data') || localStorage.getItem('user_data') || '{}');
      const clientUuid = clientData.assignedClientUuid || clientData.uuid || clientData.userUuid;
      
      if (!clientUuid) {
        throw new Error('No client UUID found');
      }

      const response = await fetch(API_ENDPOINTS.USERS.GET_BY_CLIENT(clientUuid), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientUuid
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get current client info
  useEffect(() => {
    const getClientInfo = () => {
      try {
        const clientData = localStorage.getItem('client_data') || localStorage.getItem('user_data');
        if (clientData) {
          const parsed = JSON.parse(clientData);
          setClientInfo(parsed);
          setNewUser(prev => ({ 
            ...prev, 
            assignedClientUuid: parsed.assignedClientUuid || parsed.uuid || parsed.userUuid 
          }));
        }
      } catch (error) {
        console.error('Error parsing client data:', error);
        toast({
          title: "Error",
          description: "Failed to load client information",
          variant: "destructive"
        });
      }
    };

    getClientInfo();
    fetchUsers();
  }, [toast, fetchUsers]);

  // Handle create user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.email.trim() || 
        !newUser.contactNumber.trim() || !newUser.permissionLevel || !newUser.password.trim()) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    // Password validation
    if (newUser.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    // Confirm password validation
    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(newUser.contactNumber)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid contact number",
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading('create');
      
      const userData = {
        ...newUser,
        name: newUser.name.trim(),
        username: newUser.username.trim().toLowerCase(),
        email: newUser.email.trim().toLowerCase(),
        contactNumber: newUser.contactNumber.trim(),
        password: newUser.password, // Include password
        permissions: [newUser.permissionLevel], // Convert to array format
        createdBy: 'client', // Flag to indicate client-created user
        clientCreated: true
      };

      const response = await fetch(API_ENDPOINTS.USERS.CREATE_BY_CLIENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': newUser.assignedClientUuid
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "User created successfully!",
        });
        
        // Reset form and close dialog
        setNewUser({
          name: '',
          username: '',
          email: '',
          contactNumber: '',
          permissionLevel: '',
          password: '',
          confirmPassword: '',
          assignedClientUuid: clientInfo?.assignedClientUuid || clientInfo?.uuid || ''
        });
        setIsCreateDialogOpen(false);
        
        // Refresh users list
        fetchUsers();
      } else {
        throw new Error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userUuid) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(`delete-${userUuid}`);
      
      const response = await fetch(API_ENDPOINTS.USERS.DELETE(userUuid), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': newUser.assignedClientUuid
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setActionLoading('');
    }
  };

  // Handle resend setup email
  const handleResendSetup = async (userUuid) => {
    try {
      setActionLoading(`resend-${userUuid}`);
      
      const response = await fetch(API_ENDPOINTS.USERS.RESEND_SETUP(userUuid), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': newUser.assignedClientUuid
        }
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Setup email sent successfully",
        });
      } else {
        throw new Error(data.message || 'Failed to send setup email');
      }
    } catch (error) {
      console.error('Error sending setup email:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send setup email",
        variant: "destructive"
      });
    } finally {
      setActionLoading('');
    }
  };

  // Get permission level display
  const getPermissionDisplay = (permissions) => {
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return 'No Permissions';
    }
    
    const level = permissions[0]; // Take first permission as primary
    const permissionObj = permissionLevels.find(p => p.value === level);
    return permissionObj ? permissionObj.label : level;
  };

  // Get permission badge color
  const getPermissionBadgeColor = (permissions) => {
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return 'secondary';
    }
    
    const level = permissions[0];
    switch (level) {
      case 'management':
        return 'destructive';
      case 'maintenance':
        return 'default';
      case 'basic':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users for {clientInfo?.name || 'your organization'}
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Access for New User</DialogTitle>
              <DialogDescription>
                Create a new user account for your organization. Set up their login credentials including username and password.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={newUser.contactNumber}
                  onChange={(e) => setNewUser(prev => ({ ...prev, contactNumber: e.target.value }))}
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Company Requesting Access</Label>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                  {clientInfo?.name || 'Current Organization'}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="permissionLevel">Permission Level Requesting *</Label>
                <Select 
                  value={newUser.permissionLevel} 
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, permissionLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission level" />
                  </SelectTrigger>
                  <SelectContent>
                    {permissionLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{level.label}</span>
                          <span className="text-xs text-muted-foreground">{level.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password (minimum 6 characters)"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={actionLoading === 'create'}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Users associated with your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No Users Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by adding your first team member
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.uuid} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{user.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.contactNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.contactNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getPermissionBadgeColor(user.permissions)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getPermissionDisplay(user.permissions)}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewUser(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {user.passwordSetupRequired && (
                          <DropdownMenuItem 
                            onClick={() => handleResendSetup(user.uuid)}
                            disabled={actionLoading === `resend-${user.uuid}`}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {actionLoading === `resend-${user.uuid}` ? 'Sending...' : 'Resend Setup Email'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user.uuid)}
                          disabled={actionLoading === `delete-${user.uuid}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {actionLoading === `delete-${user.uuid}` ? 'Deleting...' : 'Delete User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xl font-medium text-primary">
                    {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">@{selectedUser.username}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
                
                {selectedUser.contactNumber && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                    <p className="text-sm">{selectedUser.contactNumber}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Permission Level</Label>
                  <div className="mt-1">
                    <Badge variant={getPermissionBadgeColor(selectedUser.permissions)}>
                      {getPermissionDisplay(selectedUser.permissions)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                  <p className="text-sm">
                    {selectedUser.passwordSetupRequired ? (
                      <span className="text-yellow-600">Pending Setup</span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </p>
                </div>

                {selectedUser.createdAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientUserManagement;
