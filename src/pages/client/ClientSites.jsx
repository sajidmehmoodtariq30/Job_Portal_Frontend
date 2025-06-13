import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Star, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/UI/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Switch } from "@/components/UI/switch";
import { Label } from "@/components/UI/label";
import { useSites } from '@/hooks/useSites';
import { useAllSites } from '@/hooks/useAllSites';

const SiteManagement = () => {
  // Toggle between client-specific and global sites view
  const [showAllSites, setShowAllSites] = useState(false);
  
  // Get client data from localStorage (same method as ClientHome)
  const getClientData = () => {
    const clientData = localStorage.getItem('client_data');
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
  // Get client ID from localStorage with fallbacks (same as ClientHome)
  const clientId = clientData?.uuid || localStorage.getItem('client_id') || localStorage.getItem('clientId') || localStorage.getItem('userId') || localStorage.getItem('client_uuid');
    // Client-specific sites hook (read-only)
  const { 
    sites: clientSites, 
    currentSite, 
    loading: clientSitesLoading, 
    error: clientSitesError, 
    fetchSites
  } = useSites(clientId);

  // Global sites hook (read-only)
  const {
    sites: allSites,
    loading: allSitesLoading,
    error: allSitesError,
    fetchAllSites,
    totalSites
  } = useAllSites();

  // Use appropriate data based on toggle
  const sites = showAllSites ? allSites : clientSites;
  const loading = showAllSites ? allSitesLoading : clientSitesLoading;
  const error = showAllSites ? allSitesError : clientSitesError;
  const refreshSites = showAllSites ? fetchAllSites : fetchSites;

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
        <Button onClick={refreshSites} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">        <div>
          <h1 className="text-3xl font-bold">Site Management</h1>
          <p className="text-muted-foreground mt-1">
            {showAllSites 
              ? `Viewing all sites from all clients (${totalSites} total)` 
              : 'View your business locations and sites'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle between client sites and all sites - Read only */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-all-sites"
              checked={showAllSites}
              onCheckedChange={setShowAllSites}
            />
            <Label htmlFor="show-all-sites" className="text-sm">
              Show all sites
            </Label>
          </div>
        </div>
      </div>      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Card key={`${site.clientId || 'unknown'}-${site.id}`} className={`relative ${!showAllSites && site.id === currentSite?.id ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  {site.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                  {!showAllSites && site.id === currentSite?.id && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {site.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{site.address}</p>
                </div>
              )}
              
              {site.description && (
                <p className="text-sm text-muted-foreground">{site.description}</p>
              )}
                <div className="flex flex-wrap gap-2 pt-2">
                {/* Read-only view - no action buttons */}
                <Badge variant="secondary" className="text-xs">
                  Read Only
                </Badge>
              </div>
            </CardContent>
          </Card>        ))}
      </div>

      {sites.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {showAllSites ? 'No sites found across all clients' : 'No sites found'}
            </h3>
            <p className="text-muted-foreground">
              {showAllSites 
                ? 'There are no sites created by any clients yet.' 
                : 'No sites are available to view.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SiteManagement;
