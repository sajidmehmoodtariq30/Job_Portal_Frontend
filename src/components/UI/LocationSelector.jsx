import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './dialog';
import { Plus, MapPin } from 'lucide-react';
import axios from 'axios';

const LocationSelector = ({ 
  selectedLocationUuid, 
  onLocationSelect, 
  clientUuid, 
  placeholder = "Select a location...", 
  required = false,
  refreshTrigger = 0 
}) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newLocation, setNewLocation] = useState({
    location_name: '',
    line1: '',
    line2: '',
    line3: '',
    city: '',
    state: '',
    post_code: '',
    country: 'Australia'
  });

  // Fetch locations when clientUuid or refreshTrigger changes
  useEffect(() => {
    if (clientUuid) {
      fetchLocations();
    } else {
      setLocations([]);
    }
  }, [clientUuid, refreshTrigger]);

  const fetchLocations = async () => {
    if (!clientUuid) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/fetch/locations/client/${clientUuid}`);
      const locationData = Array.isArray(response.data) ? response.data : [];
      setLocations(locationData);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };  const handleCreateLocation = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newLocation.location_name?.trim()) {
      alert('Location name is required');
      return;
    }
    
    if (!newLocation.line1?.trim()) {
      alert('Address Line 1 is required');
      return;
    }
    
    if (!newLocation.city?.trim()) {
      alert('City is required');
      return;
    }
      if (!newLocation.state?.trim()) {
      alert('State is required');
      return;
    }
    
    // Validate Australian state code
    const validStates = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'];
    if (!validStates.includes(newLocation.state.toUpperCase().trim())) {
      alert(`Invalid state code "${newLocation.state}". Please select a valid Australian state.`);
      return;
    }
    
    if (!newLocation.post_code?.trim()) {
      alert('Postcode is required');
      return;
    }
    
    // Validate Australian postcode format (4 digits)
    if (!/^\d{4}$/.test(newLocation.post_code)) {
      alert('Invalid postcode format. Australian postcodes must be 4 digits (e.g., 2000)');
      return;
    }
    
    setIsCreating(true);
      try {
      const locationData = {
        ...newLocation
      };
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/fetch/locations`, locationData);
      
      if (response.data && response.data.success) {
        // Refresh locations list
        await fetchLocations();
        
        // Auto-select the newly created location
        const newLocationUuid = response.data.data?.uuid;
        if (newLocationUuid && onLocationSelect) {
          onLocationSelect(newLocationUuid);
        }
        
        // Reset form
        setNewLocation({
          location_name: '',
          line1: '',
          line2: '',
          line3: '',
          city: '',
          state: '',
          post_code: '',
          country: 'Australia'
        });
        
        // Close dialog (this will be handled by the Dialog component)
        document.querySelector('[data-dialog-close]')?.click();
      }    } catch (error) {
      console.error('Error creating location:', error);
      
      // Display appropriate error message based on the server response
      if (error.response?.data?.message) {
        let errorMessage = `Failed to create location: ${error.response.data.message}`;
        
        // Add validation help if available
        if (error.response.data.validationHelp) {
          errorMessage += `\n\nTip: ${error.response.data.validationHelp}`;
        }
        
        alert(errorMessage);
      } else if (error.response?.status === 400) {
        alert('Invalid location data. Please check all fields and try again.');
      } else if (error.response?.status === 401) {
        alert('Session expired. Please refresh the page and try again.');
      } else {
        alert('Failed to create location. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const selectedLocation = locations.find(loc => loc.uuid === selectedLocationUuid);

  return (
    <div className="space-y-2">
      <Select
        value={selectedLocationUuid || ''}
        onValueChange={onLocationSelect}
        disabled={!clientUuid || loading}
        required={required}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={loading ? "Loading locations..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem value="loading" disabled>Loading locations...</SelectItem>
          ) : locations.length === 0 ? (
            <SelectItem value="empty" disabled>No locations found</SelectItem>
          ) : (
            locations.map((location) => (
              <SelectItem key={location.uuid} value={location.uuid}>
                <div className="flex items-center space-x-2">
                  <MapPin size={14} />
                  <div>
                    <div className="font-medium">{location.location_name || 'Unnamed Location'}</div>
                    <div className="text-xs text-gray-500">
                      {[location.line1, location.city, location.state].filter(Boolean).join(', ')}
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))
          )}
          
          {/* Add New Location Option */}
          {clientUuid && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative flex w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground border-t border-gray-100 mt-1">
                  <Plus size={14} className="mr-2" />
                  <span>Add New Location</span>
                </div>
              </DialogTrigger>              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Location</DialogTitle>
                  <DialogDescription>
                    Create a new location for the selected client. All required fields must be filled.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateLocation} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location_name">Location Name *</Label>
                      <Input
                        id="location_name"
                        name="location_name"
                        value={newLocation.location_name}
                        onChange={handleInputChange}
                        placeholder="e.g., Main Office, Warehouse"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="line1">Address Line 1 *</Label>
                      <Input
                        id="line1"
                        name="line1"
                        value={newLocation.line1}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="line2">Address Line 2</Label>
                      <Input
                        id="line2"
                        name="line2"
                        value={newLocation.line2}
                        onChange={handleInputChange}
                        placeholder="Suite, unit, etc. (optional)"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={newLocation.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          required
                        />
                      </div>                      <div className="grid gap-2">
                        <Label htmlFor="state">State *</Label>
                        <Select
                          name="state"
                          value={newLocation.state}
                          onValueChange={(value) => setNewLocation(prev => ({ ...prev, state: value }))}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Australian state/territory" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NSW">NSW - New South Wales</SelectItem>
                            <SelectItem value="VIC">VIC - Victoria</SelectItem>
                            <SelectItem value="QLD">QLD - Queensland</SelectItem>
                            <SelectItem value="WA">WA - Western Australia</SelectItem>
                            <SelectItem value="SA">SA - South Australia</SelectItem>
                            <SelectItem value="TAS">TAS - Tasmania</SelectItem>
                            <SelectItem value="NT">NT - Northern Territory</SelectItem>
                            <SelectItem value="ACT">ACT - Australian Capital Territory</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500">
                          Select the Australian state or territory
                        </div>
                      </div>
                    </div>
                      <div className="grid gap-2">
                      <Label htmlFor="post_code">Postcode * (4 digits)</Label>
                      <Input
                        id="post_code"
                        name="post_code"
                        value={newLocation.post_code}
                        onChange={handleInputChange}
                        placeholder="e.g. 2000"
                        pattern="[0-9]{4}"
                        maxLength={4}
                        title="Australian postcode must be 4 digits"
                        required
                      />
                      <div className="text-xs text-gray-500">
                        Must be a 4-digit Australian postcode
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.querySelector('[data-dialog-close]')?.click()}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Location'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </SelectContent>
      </Select>
      
      {/* Display selected location details */}
      {selectedLocation && (
        <div className="text-sm text-gray-600 mt-1">
          <MapPin size={12} className="inline mr-1" />
          {[
            selectedLocation.line1,
            selectedLocation.line2,
            selectedLocation.city,
            selectedLocation.state,
            selectedLocation.post_code
          ].filter(Boolean).join(', ')}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
