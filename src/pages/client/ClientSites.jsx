import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  MapPin, 
  AlertCircle,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Button } from "@/components/UI/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import PermissionProtectedClientPage from '@/components/client/PermissionProtectedClientPage';
import { PERMISSIONS } from '@/context/PermissionsContext';
import { useSession } from '@/context/SessionContext';
import { API_URL } from '@/lib/apiConfig';

const SiteManagement = () => {
  const { user } = useSession();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalSites, setTotalSites] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedJobCountRange, setSelectedJobCountRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get client data from session/localStorage
  const getClientData = () => {
    // Try session first, then localStorage
    if (user?.assignedClientUuid) {
      return { assignedClientUuid: user.assignedClientUuid };
    }
    
    const clientData = localStorage.getItem('user_data');
    if (clientData) {
      try {
        return JSON.parse(clientData);
      } catch (error) {
        console.error('Error parsing client data:', error);
        return null;
      }
    }
    return null;
  };
  
  const clientData = getClientData();
  
  // Get client UUID for filtering sites
  const clientUuid = clientData?.assignedClientUuid || 
                     clientData?.uuid || 
                     clientData?.clientUuid || 
                     localStorage.getItem('client_uuid') ||
                     localStorage.getItem('client_id') ||
                     localStorage.getItem('clientId') ||
                     localStorage.getItem('userId');

  console.log('🏢 ClientSites - Using client UUID:', clientUuid);

  // Fetch sites using hierarchical company structure
  const fetchSitesFromCompanies = async () => {
    if (!clientUuid) {
      console.error('No client UUID available for fetching sites');
      setError('No client data available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🏢 Fetching hierarchical company sites for client:', clientUuid);
      
      // Fetch hierarchical company sites for this client
      const response = await fetch(`${API_URL}/api/clients/${clientUuid}/sites`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch sites');
      }
      
      let sitesData = data.sites || [];
      
      console.log('🏢 RAW COMPANY SITES:', sitesData.length);
      console.log('🏢 DATA SOURCE:', data.source);
      console.log('🏢 SAMPLE SITE:', sitesData[0]);
      
      // Apply business filtering rules
      // 1. Exclude sites with 'shop' or 'Shop' in the name
      const filteredSites = sitesData.filter(site => {
        const hasShop = site.name && (site.name.includes('Shop') || site.name.includes('shop'));
        return !hasShop;
      });
      
      // 2. Sort sites: Parent companies first, then SkinKandy sites, then alphabetically
      filteredSites.sort((a, b) => {
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
      
      console.log('🏢 FILTERED COMPANY SITES:', filteredSites.length);
      console.log('🏢 PARENT COMPANIES:', filteredSites.filter(site => !site.parent_company_uuid).length);
      console.log('🏢 CHILD COMPANIES:', filteredSites.filter(site => site.parent_company_uuid).length);
      
      setSites(filteredSites);
      setTotalSites(filteredSites.length);
      
    } catch (error) {
      console.error('❌ Error fetching company sites:', error);
      setError(`Failed to fetch sites: ${error.message}`);
      setSites([]);
      setTotalSites(0);
    } finally {
      setLoading(false);
    }
  };

  // Constants for site limiting
  const SITE_DISPLAY_LIMIT = 80;

  // Filter and search logic
  const filteredSites = useMemo(() => {
    let filtered = sites;

    // Apply filters first
    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(site => 
        (site.name || '').toLowerCase().includes(search) ||
        (site.address || '').toLowerCase().includes(search) ||
        (site.suburb || '').toLowerCase().includes(search) ||
        (site.city || '').toLowerCase().includes(search) ||
        (site.postcode || '').toLowerCase().includes(search)
      );
      // When searching, don't apply the 80-site limit to allow finding sites beyond the limit
    } else {
      // When not searching, apply the 80-site limit
      filtered = filtered.slice(0, SITE_DISPLAY_LIMIT);
    }

    // State filter
    if (selectedState) {
      filtered = filtered.filter(site => 
        (site.state || '').toLowerCase() === selectedState.toLowerCase()
      );
    }

    // Job count range filter
    if (selectedJobCountRange) {
      filtered = filtered.filter(site => {
        const jobCount = site.jobCount || 0;
        switch (selectedJobCountRange) {
          case '1':
            return jobCount === 1;
          case '2-5':
            return jobCount >= 2 && jobCount <= 5;
          case '6-10':
            return jobCount >= 6 && jobCount <= 10;
          case '10+':
            return jobCount > 10;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [sites, searchTerm, selectedState, selectedJobCountRange]);

  // Calculate display counts
  const isSearchActive = searchTerm.trim() || selectedState || selectedJobCountRange;
  const actualDisplayedCount = filteredSites.length;
  const totalCount = sites.length;
  const isLimited = !isSearchActive && totalCount > SITE_DISPLAY_LIMIT;
  
  // For display purposes, ALWAYS hide the real total when it's above 80
  // Also limit the displayed count to never exceed 80
  const displayTotalCount = totalCount > SITE_DISPLAY_LIMIT ? SITE_DISPLAY_LIMIT : totalCount;
  const displayedCount = actualDisplayedCount > SITE_DISPLAY_LIMIT ? SITE_DISPLAY_LIMIT : actualDisplayedCount;

  // Get unique states for filter dropdown
  const availableStates = useMemo(() => {
    const states = sites
      .map(site => site.state)
      .filter(Boolean)
      .filter((state, index, arr) => arr.indexOf(state) === index)
      .sort();
    return states;
  }, [sites]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('');
    setSelectedJobCountRange('');
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || selectedState || selectedJobCountRange;

  // Initial load
  useEffect(() => {
    fetchSitesFromCompanies();
  }, [clientUuid]);
  
  // Refresh handler
  const handleRefresh = () => {
    fetchSitesFromCompanies();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading sites...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">Error loading sites</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }
  return (
    <PermissionProtectedClientPage permission={PERMISSIONS.VIEW_SITES} title="Sites">
      <div className="space-y-6">
        <div className="flex justify-between items-center">        
          <div>
            <h1 className="text-3xl font-bold">Site Management</h1>            
            <p className="text-muted-foreground mt-1">
              View your business locations and sites ({displayedCount} of {displayTotalCount} total)
            </p>
          </div>
        
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => setShowFilters(!showFilters)} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                  {[searchTerm, selectedState, selectedJobCountRange].filter(Boolean).length}
                </span>
              )}
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar - Always visible */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search sites by name, address, suburb, or postcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Advanced Filters - Collapsible */}
          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Territory
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All States</option>
                    {availableStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Job Count Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Count
                  </label>
                  <select
                    value={selectedJobCountRange}
                    onChange={(e) => setSelectedJobCountRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Counts</option>
                    <option value="1">1 job</option>
                    <option value="2-5">2-5 jobs</option>
                    <option value="6-10">6-10 jobs</option>
                    <option value="10+">10+ jobs</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    disabled={!hasActiveFilters}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {searchTerm && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm('')} className="hover:text-blue-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedState && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        State: {selectedState}
                        <button onClick={() => setSelectedState('')} className="hover:text-green-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {selectedJobCountRange && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        Jobs: {selectedJobCountRange}
                        <button onClick={() => setSelectedJobCountRange('')} className="hover:text-purple-600">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSites.map((site) => (
            <Card key={site.uuid || site.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">                  {/* Site Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Building className="h-5 w-5 text-primary flex-shrink-0" />
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {site.name || 'Unnamed Site'}
                      </h3>
                    </div>
                  </div>
                    {/* Site Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-600 leading-relaxed min-w-0 flex-1">
                      {site.address && (
                        <div className="break-words">{site.address}</div>
                      )}
                      {(site.suburb || site.city || site.state || site.postcode) && (
                        <div className="break-words">
                          {[site.suburb, site.city, site.state, site.postcode]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                      )}
                      {!site.address && !site.suburb && !site.city && (
                        <span className="text-gray-400 italic">No address provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredSites.length === 0 && sites.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sites found</h3>
              <p className="text-muted-foreground mb-4">
                No site contacts are associated with your client account.
              </p>
              {!clientUuid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Client information not found. Please ensure you are properly logged in.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Results After Filtering */}
        {filteredSites.length === 0 && sites.length > 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sites match your filters</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters to find sites.
              </p>
              <Button onClick={clearFilters} variant="outline" className="flex items-center gap-2 mx-auto">
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PermissionProtectedClientPage>
  );
};

export default SiteManagement;
