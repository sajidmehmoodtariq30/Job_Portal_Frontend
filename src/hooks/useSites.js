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
      setCurrentSite(fallbackSite);    } finally {
      setLoading(false);
    }
  }, [clientId]);
  // Create a new site (DISABLED - ServiceM8 site data is read-only)
  const createSite = async (siteData) => {
    throw new Error('Site creation has been disabled. ServiceM8 site data is read-only.');
  };

  // Update an existing site (DISABLED - ServiceM8 site data is read-only)
  const updateSite = async (siteId, siteData) => {
    throw new Error('Site updates have been disabled. ServiceM8 site data is read-only.');
  };
  // Delete a site (DISABLED - ServiceM8 site data is read-only)
  const deleteSite = async (siteId) => {
    throw new Error('Site deletion has been disabled. ServiceM8 site data is read-only.');
  };
  // Set a site as default (DISABLED - ServiceM8 site data is read-only)
  const setDefaultSite = async (siteId) => {
    throw new Error('Setting default site has been disabled. ServiceM8 site data is read-only.');
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
