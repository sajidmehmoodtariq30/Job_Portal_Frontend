import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

/**
 * Hook for managing sites across all clients (global sites view)
 * This is different from useSites which only shows sites for a specific client
 */
export const useAllSites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all sites from all clients globally
  const fetchAllSites = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching all sites globally...');
      
      const response = await axios.get(API_ENDPOINTS.SITES.GET_ALL_GLOBAL);
      
      if (response.data.success) {
        const sitesData = response.data.sites || [];
        setSites(sitesData);
        
        console.log(`Successfully loaded ${sitesData.length} sites from ${response.data.totalClients || 0} clients`);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch all sites');
      }
    } catch (err) {
      console.error('Error fetching all sites:', err);
      setError(err.message || 'Failed to fetch all sites');
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter sites by client ID
  const getSitesByClient = useCallback((clientId) => {
    return sites.filter(site => site.clientId === clientId);
  }, [sites]);

  // Get sites by search term
  const searchSites = useCallback((searchTerm) => {
    if (!searchTerm) return sites;
    
    const term = searchTerm.toLowerCase();
    return sites.filter(site => 
      (site.name && site.name.toLowerCase().includes(term)) ||
      (site.address && site.address.toLowerCase().includes(term)) ||
      (site.description && site.description.toLowerCase().includes(term)) ||
      (site.clientId && site.clientId.toLowerCase().includes(term))
    );
  }, [sites]);

  // Group sites by client
  const getSitesGroupedByClient = useCallback(() => {
    const grouped = {};
    sites.forEach(site => {
      const clientId = site.clientId || 'unknown';
      if (!grouped[clientId]) {
        grouped[clientId] = [];
      }
      grouped[clientId].push(site);
    });
    return grouped;
  }, [sites]);

  // Get active sites only
  const getActiveSites = useCallback(() => {
    return sites.filter(site => site.active !== false);
  }, [sites]);

  // Initialize sites on mount
  useEffect(() => {
    fetchAllSites();
  }, [fetchAllSites]);

  return {
    sites,
    loading,
    error,
    fetchAllSites,
    getSitesByClient,
    searchSites,
    getSitesGroupedByClient,
    getActiveSites,
    totalSites: sites.length
  };
};

export default useAllSites;
