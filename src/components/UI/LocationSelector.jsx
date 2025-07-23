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
}) => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Constants for site limiting
  const LOCATION_DISPLAY_LIMIT = 80;
  
  // Fetch all locations on mount and when refresh is triggered
  useEffect(() => {
    fetchLocations();
  }, [refreshTrigger]);

  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      // Use hierarchical company data for admin create job dialog
      console.log('Fetching hierarchical company sites for admin job creation:', API_ENDPOINTS.SITES.GET_ALL_GLOBAL);
      const response = await axios.get(API_ENDPOINTS.SITES.GET_ALL_GLOBAL);
      console.log('Hierarchical sites API response:', response.data);
      
      // Handle the response format from the backend
      if (response.data && response.data.success && Array.isArray(response.data.sites)) {
        console.log(`Found ${response.data.sites.length} hierarchical company sites`);
        
        // Apply business filtering rules
        let filteredSites = response.data.sites.filter(site => {
          const hasShop = site.name && (site.name.includes('Shop') || site.name.includes('shop'));
          return !hasShop;
        });
        
        // Sort with SkinKandy sites first
        filteredSites.sort((a, b) => {
          const aHasSkinKandy = a.name && a.name.toLowerCase().includes('skinkandy');
          const bHasSkinKandy = b.name && b.name.toLowerCase().includes('skinkandy');
          
          if (aHasSkinKandy && !bHasSkinKandy) return -1;
          if (!aHasSkinKandy && bHasSkinKandy) return 1;
          
          return (a.name || '').localeCompare(b.name || '');
        });
        
        // Apply the limit but still keep all data available for search
        const allSites = filteredSites;
        const limitedSites = allSites.length > LOCATION_DISPLAY_LIMIT 
          ? allSites.slice(0, LOCATION_DISPLAY_LIMIT).concat([{
              uuid: 'search-more',
              name: `... and ${allSites.length - LOCATION_DISPLAY_LIMIT} more locations (use search to find them)`,
              isSearchPrompt: true,
              disabled: true
            }])
          : allSites;
        setLocations(limitedSites);
        setError(null);
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for direct array response
        console.log(`Found ${response.data.length} sites (direct array)`);
        const allSites = response.data;
        const limitedSites = allSites.length > LOCATION_DISPLAY_LIMIT 
          ? allSites.slice(0, LOCATION_DISPLAY_LIMIT).concat([{
              uuid: 'search-more',
              name: `... and ${allSites.length - LOCATION_DISPLAY_LIMIT} more locations (use search to find them)`,
              isSearchPrompt: true,
              disabled: true
            }])
          : allSites;
        setLocations(limitedSites);
        setError(null);
      } else {
        console.warn('Unexpected response format:', response.data);
        setLocations([]);
        setError('Unexpected response format from server');
      }
    } catch (error) {
      console.error('Error fetching sites from jobs:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = 'Failed to load sites from jobs';
      
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
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom render for location items
  const renderLocationItem = (location) => {
    if (location.isSearchPrompt) {
      return (
        <div className="flex flex-col text-gray-500 italic">
          <span className="text-sm">{location.name}</span>
        </div>
      );
    }
    
    return (
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
  };

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
