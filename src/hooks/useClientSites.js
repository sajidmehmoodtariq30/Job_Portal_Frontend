import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

/**
 * Hook for managing client-specific sites using ServiceM8 contact endpoint
 * Fetches contacts where Type == "Site" and ParentUUID == client's UUID
 */
export const useClientSites = (clientUuid) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sites for a specific client using contact endpoint
  const fetchClientSites = useCallback(async () => {
    if (!clientUuid) {
      setLoading(false);
      setSites([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🏢 Fetching sites for client UUID:', clientUuid);
      console.log('🔗 API Endpoint:', API_ENDPOINTS.CONTACTS.GET_CLIENT_SITES(clientUuid));
      
      const response = await axios.get(API_ENDPOINTS.CONTACTS.GET_CLIENT_SITES(clientUuid));
      
      if (response.data.success) {
        const sitesData = response.data.sites || [];
        setSites(sitesData);
        
        console.log(`✅ Successfully loaded ${sitesData.length} sites for client ${clientUuid}`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch client sites');
      }
    } catch (err) {
      console.error('❌ Error fetching client sites:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        config: err.config
      });
      
      // Enhanced error message for 404
      if (err.response?.status === 404) {
        setError(`Contact endpoint not found (404). The backend may need to be restarted to recognize the new /api/contacts route. Attempted URL: ${API_ENDPOINTS.CONTACTS.GET_CLIENT_SITES(clientUuid)}`);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch client sites');
      }
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, [clientUuid]);

  // Fetch sites when component mounts or clientUuid changes
  useEffect(() => {
    fetchClientSites();
  }, [fetchClientSites]);

  // Filter sites by search term
  const searchSites = useCallback((searchTerm) => {
    if (!searchTerm) return sites;
    
    const term = searchTerm.toLowerCase();
    return sites.filter(site => 
      (site.name && site.name.toLowerCase().includes(term)) ||
      (site.address && site.address.toLowerCase().includes(term)) ||
      (site.city && site.city.toLowerCase().includes(term)) ||
      (site.suburb && site.suburb.toLowerCase().includes(term))
    );
  }, [sites]);

  return {
    sites,
    loading,
    error,
    fetchClientSites,
    searchSites,
    totalSites: sites.length
  };
};
