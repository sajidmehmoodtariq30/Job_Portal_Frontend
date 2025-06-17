import React, { useState, useEffect } from 'react';
import { 
  Building, 
  MapPin, 
  AlertCircle,
  Loader2,
  AlertTriangle,
  RefreshCw
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

  // Fetch sites based on job addresses
  const fetchSitesFromJobs = async () => {
    if (!clientUuid) {
      console.error('No client UUID available for fetching sites');
      setError('No client data available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch jobs for this client
      const response = await fetch(`${API_URL}/fetch/jobs/client/${clientUuid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'x-client-uuid': clientUuid
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }      const jobsData = await response.json();
      const jobs = jobsData.data || jobsData || [];
      
      console.log('🔍 Fetched jobs for sites:', jobs.length);

      // Filter jobs to only include those for the current client
      const clientJobs = jobs.filter(job => {
        // Check if job belongs to current client using company_uuid
        const belongsToClient = job.company_uuid === clientUuid || 
                               job.created_by_staff_uuid === clientUuid ||
                               job.client_uuid === clientUuid;
        
        if (belongsToClient) {
          console.log('✅ Job belongs to client:', job.generated_job_id || job.uuid);
        }
        
        return belongsToClient;
      });
      
      console.log(`🏢 Filtered jobs for client ${clientUuid}: ${clientJobs.length} out of ${jobs.length} total jobs`);

      // Extract unique addresses from client jobs only
      const addressMap = new Map();
      
      clientJobs.forEach((job, index) => {
        // Get address from various possible fields
        const jobAddress = job.job_address || job.billing_address;
        const geoAddress = job.geo_street && job.geo_city ? 
          `${job.geo_number ? job.geo_number + ' ' : ''}${job.geo_street}, ${job.geo_city}, ${job.geo_state || ''} ${job.geo_postcode || ''}`.trim() : 
          null;
        
        const primaryAddress = jobAddress || geoAddress;
        
        if (primaryAddress) {
          const addressKey = primaryAddress.toLowerCase().trim();
          
          if (!addressMap.has(addressKey)) {
            // Create a site object from the job address
            const site = {
              id: `site-${index}`,
              uuid: `site-${Date.now()}-${index}`,
              name: primaryAddress.split(',')[0] || primaryAddress, // Use first part as name
              address: primaryAddress,
              // Parse geo components if available
              suburb: job.geo_city,
              city: job.geo_city,
              state: job.geo_state,
              postcode: job.geo_postcode,
              // Additional info
              jobCount: 1,
              coordinates: job.lat && job.lng ? { lat: job.lat, lng: job.lng } : null
            };
            
            addressMap.set(addressKey, site);
          } else {
            // Increment job count for existing address
            const existingSite = addressMap.get(addressKey);
            existingSite.jobCount += 1;
          }
        }
      });

      const uniqueSites = Array.from(addressMap.values());
      
      console.log('🏢 Generated sites from job addresses:', uniqueSites.length);
      
      setSites(uniqueSites);
      setTotalSites(uniqueSites.length);
      
    } catch (error) {
      console.error('Error fetching sites from jobs:', error);
      setError('Failed to load sites. Please try again.');
      setSites([]);
      setTotalSites(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSitesFromJobs();
  }, [clientUuid]);
  // Refresh handler
  const handleRefresh = () => {
    fetchSitesFromJobs();
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
            <h1 className="text-3xl font-bold">Site Management</h1>            <p className="text-muted-foreground mt-1">
              View your business locations and sites ({totalSites} total)
            </p>
          </div>
        
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site) => (
            <Card key={site.uuid || site.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">                  {/* Site Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary flex-shrink-0" />
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {site.name || 'Unnamed Site'}
                      </h3>
                    </div>
                    {site.jobCount && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {site.jobCount} job{site.jobCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                    {/* Site Address */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {site.address && <div>{site.address}</div>}
                      {(site.suburb || site.city || site.state || site.postcode) && (
                        <div>
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

        {sites.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sites found</h3>
              <p className="text-muted-foreground mb-4">
                No site contacts are associated with your client account.
              </p>
              {!clientUuid && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">                  <div className="flex items-center">
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
      </div>
    </PermissionProtectedClientPage>
  );
};

export default SiteManagement;
