import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

export const useSites = (clientId) => {
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sites for a client
  const fetchSites = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.SITES.GET_ALL(clientId));
      
      if (response.data.success) {
        const sitesData = response.data.sites || [];
        setSites(sitesData);
        
        // Set default site as current if none selected
        if (!currentSite && sitesData.length > 0) {
          const defaultSite = sitesData.find(site => site.isDefault) || sitesData[0];
          setCurrentSite(defaultSite);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch sites');
      }
    } catch (err) {
      console.error('Error fetching sites:', err);
      setError(err.message || 'Failed to fetch sites');
      
      // Fallback to default site if API fails
      const fallbackSite = {
        id: 'default',
        name: 'Main Office',
        address: '',
        isDefault: true,
        active: true
      };
      setSites([fallbackSite]);
      setCurrentSite(fallbackSite);
    } finally {
      setLoading(false);
    }
  }, [clientId, currentSite]);

  // Create a new site
  const createSite = async (siteData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.SITES.CREATE(clientId), siteData);
      
      if (response.data.success) {
        await fetchSites(); // Refresh the sites list
        return response.data.site;
      } else {
        throw new Error(response.data.message || 'Failed to create site');
      }
    } catch (err) {
      console.error('Error creating site:', err);
      throw err;
    }
  };

  // Update an existing site
  const updateSite = async (siteId, siteData) => {
    try {
      const response = await axios.put(API_ENDPOINTS.SITES.UPDATE(clientId, siteId), siteData);
      
      if (response.data.success) {
        await fetchSites(); // Refresh the sites list
        return response.data.site;
      } else {
        throw new Error(response.data.message || 'Failed to update site');
      }
    } catch (err) {
      console.error('Error updating site:', err);
      throw err;
    }
  };

  // Delete a site
  const deleteSite = async (siteId) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.SITES.DELETE(clientId, siteId));
      
      if (response.data.success) {
        await fetchSites(); // Refresh the sites list
        
        // If deleted site was current, switch to default or first available
        if (currentSite && currentSite.id === siteId) {
          const remainingSites = sites.filter(site => site.id !== siteId);
          if (remainingSites.length > 0) {
            const newCurrent = remainingSites.find(site => site.isDefault) || remainingSites[0];
            setCurrentSite(newCurrent);
          }
        }
        
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to delete site');
      }
    } catch (err) {
      console.error('Error deleting site:', err);
      throw err;
    }
  };

  // Set a site as default
  const setDefaultSite = async (siteId) => {
    try {
      const response = await axios.put(API_ENDPOINTS.SITES.SET_DEFAULT(clientId, siteId));
      
      if (response.data.success) {
        await fetchSites(); // Refresh the sites list
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to set default site');
      }
    } catch (err) {
      console.error('Error setting default site:', err);
      throw err;
    }
  };

  // Change current site
  const changeSite = (site) => {
    setCurrentSite(site);
  };

  // Initialize sites when clientId changes
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  return {
    sites,
    currentSite,
    loading,
    error,
    fetchSites,
    createSite,
    updateSite,
    deleteSite,
    setDefaultSite,
    changeSite
  };
};

export default useSites;
