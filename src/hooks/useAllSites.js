import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

/**
 * Hook for managing sites across all clients (global sites view)
 * Now uses ServiceM8 hierarchical companies instead of job extraction
 * This is different from useSites which only shows sites for a specific client
 * Implements a 80-site display limit with search functionality to access all sites
 * Applies shop filtering and skinkandy prioritization for better UX
 */
export const useAllSites = () => {
  const [allSites, setAllSites] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Constants for site limiting
  const SITE_DISPLAY_LIMIT = 80;

  // Fetch all sites from all clients globally - now uses hierarchical companies
  const fetchAllSites = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching all sites globally from hierarchical companies...');
      
      const response = await axios.get(API_ENDPOINTS.SITES.GET_ALL_GLOBAL);
      
      if (response.data.success) {
        const sitesData = response.data.sites || [];
        
        // 🔍 DEBUG: Log the data source and structure
        console.log('🏢 SITES DATA SOURCE:', response.data.source);
        console.log('🏢 TOTAL SITES RECEIVED:', sitesData.length);
        console.log('🏢 SAMPLE SITE DATA:', sitesData[0]);
        console.log('🏢 HIERARCHICAL CHECK - Sites with parent_company_uuid:', 
          sitesData.filter(site => site.parent_company_uuid).length);
        
        // Apply filtering and sorting for companies
        let filteredSites = sitesData.filter(site => {
          // Exclude sites with 'shop' or 'Shop' in the name
          const hasShop = site.name && (site.name.includes('Shop') || site.name.includes('shop'));
          return !hasShop;
        });
        
        // Sort sites: SkinKandy/skinkandy sites first, then alphabetically
        filteredSites.sort((a, b) => {
          const aHasSkinKandy = a.name && a.name.toLowerCase().includes('skinkandy');
          const bHasSkinKandy = b.name && b.name.toLowerCase().includes('skinkandy');
          
          // SkinKandy sites come first
          if (aHasSkinKandy && !bHasSkinKandy) return -1;
          if (!aHasSkinKandy && bHasSkinKandy) return 1;
          
          // Within each group, sort alphabetically
          return (a.name || '').localeCompare(b.name || '');
        });
        
        setAllSites(filteredSites);
        // Initially show only the first 80 sites
        setSites(filteredSites.slice(0, SITE_DISPLAY_LIMIT));
        console.log(`Successfully loaded ${sitesData.length} companies, filtered to ${filteredSites.length} sites`);
        console.log(`Displaying first ${Math.min(filteredSites.length, SITE_DISPLAY_LIMIT)} sites`);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch all sites');
      }
    } catch (err) {
      console.error('Error fetching all sites:', err);
      setError(err.message || 'Failed to fetch all sites');
      setAllSites([]);
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter sites by client ID
  const getSitesByClient = useCallback((clientId) => {
    return allSites.filter(site => site.clientId === clientId);
  }, [allSites]);

  // Get sites by search term - searches through all sites, not just the displayed 80
  const searchSites = useCallback((searchTerm) => {
    if (!searchTerm) return sites; // Return limited sites when no search
    
    const term = searchTerm.toLowerCase();
    return allSites.filter(site => 
      (site.name && site.name.toLowerCase().includes(term)) ||
      (site.address && site.address.toLowerCase().includes(term)) ||
      (site.description && site.description.toLowerCase().includes(term)) ||
      (site.clientId && site.clientId.toLowerCase().includes(term))
    );
  }, [allSites, sites]);

  // Group sites by client
  const getSitesGroupedByClient = useCallback(() => {
    const grouped = {};
    allSites.forEach(site => {
      const clientId = site.clientId || 'unknown';
      if (!grouped[clientId]) {
        grouped[clientId] = [];
      }
      grouped[clientId].push(site);
    });
    return grouped;
  }, [allSites]);

  // Get active sites only
  const getActiveSites = useCallback(() => {
    return allSites.filter(site => site.active !== false);
  }, [allSites]);

  // Initialize sites on mount
  useEffect(() => {
    fetchAllSites();
  }, [fetchAllSites]);

  return {
    sites, // Limited to first 80 sites for display
    allSites, // All sites for search and other operations
    loading,
    error,
    fetchAllSites,
    getSitesByClient,
    searchSites,
    getSitesGroupedByClient,
    getActiveSites,
    totalSites: allSites.length,
    displayedSites: sites.length,
    isLimited: allSites.length > SITE_DISPLAY_LIMIT
  };
};

export default useAllSites;
