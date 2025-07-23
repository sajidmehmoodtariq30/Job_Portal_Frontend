import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

export const useSites = (clientId) => {
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sites for a client using hierarchical company structure
  const fetchSites = useCallback(async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`Fetching hierarchical sites for client: ${clientId}`);
      
      const response = await axios.get(API_ENDPOINTS.SITES.GET_ALL(clientId));
      
      if (response.data.success) {
        let sitesData = response.data.sites || [];
        
        // 🔍 DEBUG: Log client-specific hierarchical data
        console.log(`🏢 CLIENT SITES for ${clientId}:`, sitesData.length, 'sites');
        console.log('🏢 CLIENT DATA SOURCE:', response.data.source);
        console.log('🏢 SAMPLE CLIENT SITE:', sitesData[0]);
        console.log('🏢 HIERARCHICAL - Parent companies:', 
          sitesData.filter(site => !site.parent_company_uuid).length);
        console.log('🏢 HIERARCHICAL - Child companies:', 
          sitesData.filter(site => site.parent_company_uuid).length);
        
        // Apply the same filtering and sorting as the global view
        // Exclude sites with 'shop' or 'Shop' in the name
        sitesData = sitesData.filter(site => {
          const hasShop = site.name && (site.name.includes('Shop') || site.name.includes('shop'));
          return !hasShop;
        });
        
        // Sort sites: parent company first, then skinkandy sites, then alphabetically
        sitesData.sort((a, b) => {
          // Parent companies (no parent_company_uuid) come first
          if (!a.parent_company_uuid && b.parent_company_uuid) return -1;
          if (a.parent_company_uuid && !b.parent_company_uuid) return 1;
          
          // Within each group, SkinKandy sites come first
          const aHasSkinKandy = a.name && a.name.toLowerCase().includes('skinkandy');
          const bHasSkinKandy = b.name && b.name.toLowerCase().includes('skinkandy');
          
          if (aHasSkinKandy && !bHasSkinKandy) return -1;
          if (!aHasSkinKandy && bHasSkinKandy) return 1;
          
          // Finally, sort alphabetically
          return (a.name || '').localeCompare(b.name || '');
        });
        
        setSites(sitesData);
        console.log(`Successfully loaded ${sitesData.length} filtered sites for client ${clientId}`);
        
        // Set default site as current if none selected
        if (!currentSite && sitesData.length > 0) {
          // Prefer parent company as default, or first site
          const defaultSite = sitesData.find(site => !site.parent_company_uuid) || 
                             sitesData.find(site => site.isDefault) || 
                             sitesData[0];
          setCurrentSite(defaultSite);
          console.log(`Set default site: ${defaultSite.name}`);
        }
        setError(null);
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
  };  // Set a site as default (for dropdown functionality - allows switching between sites)
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
