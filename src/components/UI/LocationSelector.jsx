import React, { useState, useEffect } from 'react';
import SearchableSelect from './SearchableSelect';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import axios from 'axios';

const LocationSelector = ({ 
  clientUuid, 
  selectedLocationUuid, 
  onLocationSelect, 
  refreshTrigger = 0,
  disabled = false,
  placeholder = "Select a location..."
}) => {  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  // Fetch all locations on mount and when refresh is triggered
  useEffect(() => {
    fetchLocations();
  }, [refreshTrigger]);  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      console.log('Fetching locations from:', API_ENDPOINTS.SITES.GET_ALL_GLOBAL);
      const response = await axios.get(API_ENDPOINTS.SITES.GET_ALL_GLOBAL);
      console.log('Locations API response:', response.data);
      
      // Handle the response format from the backend
      if (response.data && response.data.success && Array.isArray(response.data.sites)) {
        console.log(`Found ${response.data.sites.length} locations`);
        setLocations(response.data.sites);
        setError(null);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct array response
        console.log(`Found ${response.data.length} locations (direct array)`);
        setLocations(response.data);
        setError(null);
      } else {
        console.warn('Unexpected response format:', response.data);
        setLocations([]);
        setError('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to load locations';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed - please log in again';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error - please try again later';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error - check your connection';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      setLocations([]);    } finally {
      setIsLoading(false);
    }
  };

  // Custom render for location items
  const renderLocationItem = (location) => (
    <div className="flex flex-col">
      <span className="font-medium">{location.name}</span>
      {location.address && (
        <span className="text-sm text-muted-foreground">{location.address}</span>
      )}
      {(location.city || location.state) && (
        <span className="text-xs text-muted-foreground">
          {[location.city, location.state].filter(Boolean).join(', ')}
        </span>
      )}
    </div>
  );

  // Custom render for selected location
  const renderSelectedLocation = (location) => (
    <span>{location.name}</span>
  );
  return (
    <SearchableSelect
      items={locations}
      value={selectedLocationUuid}
      onValueChange={onLocationSelect}
      placeholder={placeholder}
      searchPlaceholder="Search locations..."
      isLoading={isLoading}
      disabled={disabled}
      displayKey="name"
      valueKey="uuid"
      searchKeys={['name', 'address', 'city', 'state']}
      renderItem={renderLocationItem}
      renderSelected={renderSelectedLocation}
      noItemsText={error || "No locations available"}
      noResultsText="No locations match your search"
    />
  );
};

export default LocationSelector;
