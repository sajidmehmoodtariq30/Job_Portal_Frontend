import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { Search, UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import SearchableClientSelect from '@/components/UI/SearchableClientSelect';

const EditUsernameDialog = ({ clients, isLoading, onSuccess }) => {  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedClientUuid, setSelectedClientUuid] = useState('');
  const [emailAutoPopulated, setEmailAutoPopulated] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.uuid?.toLowerCase().includes(searchLower) ||
      client.address?.toLowerCase().includes(searchLower)
    );
  });
  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setFormData({
        email: '',
        username: '',
        displayName: ''
      });
      setSelectedClientUuid('');
      setSearchTerm('');
      setErrors({});
      setSuccess('');
      setEmailAutoPopulated(false);
    }
  }, [isDialogOpen]);
  // Auto-populate display name and email when client is selected
  useEffect(() => {
    if (selectedClientUuid) {
      const selectedClient = clients.find(client => client.uuid === selectedClientUuid);
      if (selectedClient) {
        // Auto-populate display name if not already filled
        if (!formData.displayName) {
          setFormData(prev => ({
            ...prev,
            displayName: selectedClient.name || ''
          }));
        }
        
        // Try to find existing mapping for this client to auto-populate email
        checkExistingMapping(selectedClientUuid);
      }
    }
  }, [selectedClientUuid, clients, formData.displayName]);  // Function to check for existing client mappings and auto-populate email
  const checkExistingMapping = async (clientUuid) => {
    try {
      const response = await axios.get(API_ENDPOINTS.CLIENTS.MAPPINGS.GET_ALL);
      const mappings = response.data.data || [];
      
      // Find existing mapping for this client
      const existingMapping = mappings.find(mapping => 
        mapping.clientUuid === clientUuid && mapping.isActive
      );
      
      if (existingMapping && existingMapping.clientEmail) {
        setFormData(prev => ({
          ...prev,
          email: existingMapping.clientEmail
        }));
        setEmailAutoPopulated(true);
      } else {
        setEmailAutoPopulated(false);
      }
    } catch (error) {
      console.error('Error checking existing mappings:', error);
      setEmailAutoPopulated(false);
      // Continue without auto-populating email
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear auto-populated flag if user manually edits email
    if (name === 'email' && emailAutoPopulated) {
      setEmailAutoPopulated(false);
    }
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };const handleClientSelect = (clientUuid) => {
    setSelectedClientUuid(clientUuid);
    const selectedClient = clients.find(client => client.uuid === clientUuid);
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        displayName: selectedClient.name || '',
        email: '' // Clear email when switching clients, will be auto-populated by useEffect
      }));
      setEmailAutoPopulated(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedClientUuid) {
      newErrors.client = 'Please select a client';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await axios.post(API_ENDPOINTS.CLIENTS.ASSIGN_USERNAME(selectedClientUuid), {
        email: formData.email,
        username: formData.username,
        displayName: formData.displayName
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(response.data.data);
        }

        // Close dialog after a short delay to show success message
        setTimeout(() => {
          setIsDialogOpen(false);
        }, 2000);
      } else {
        setErrors({ submit: response.data.error || 'Failed to assign username' });
      }
    } catch (error) {
      console.error('Error assigning username:', error);
      
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: 'An error occurred while assigning username. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus size={16} />
          Edit Username
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus size={20} />
            Assign Username to Client
          </DialogTitle>
          <DialogDescription>
            Select an existing client and assign them a username. They will receive an email with instructions to set up their password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="clientSelect">Select Client *</Label>
            <div className="space-y-3">
              
              {/* Client dropdown */}
              <SearchableClientSelect
                clients={filteredClients}
                value={selectedClientUuid}
                onValueChange={handleClientSelect}
                placeholder={isLoading ? "Loading clients..." : `Select from ${filteredClients.length} clients...`}
                isLoading={isLoading}
              />
              
              {/* Show total count */}
              <p className="text-sm text-gray-500">
                {searchTerm ? `Showing ${filteredClients.length} of ${clients.length} clients` : `${clients.length} total clients`}
              </p>
            </div>
            {errors.client && <p className="text-sm text-red-600">{errors.client}</p>}
          </div>          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="client@example.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            {emailAutoPopulated && (
              <p className="text-xs text-blue-600 flex items-center gap-1">
                <CheckCircle size={12} />
                Email auto-populated from existing client mapping
              </p>
            )}
            <p className="text-xs text-gray-500">
              This email will be used for login and will receive the password setup instructions
            </p>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              name="username"
              placeholder="johnsmith123"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
            <p className="text-xs text-gray-500">
              Must be at least 3 characters. Only letters, numbers, hyphens, and underscores allowed.
            </p>
          </div>

          {/* Display Name Input */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              name="displayName"
              placeholder="John Smith"
              value={formData.displayName}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
            {errors.displayName && <p className="text-sm text-red-600">{errors.displayName}</p>}
            <p className="text-xs text-gray-500">
              This name will be displayed in the system
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle size={16} className="text-red-600" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || success}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Success!
                </>
              ) : (
                'Assign Username'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUsernameDialog;
