import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Star, 
  AlertCircle,
  Loader2,
  Plus,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/UI/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { useClientSites } from '@/hooks/useClientSites';
import PermissionProtectedClientPage from '@/components/client/PermissionProtectedClientPage';
import PermissionGuard from '@/components/PermissionGuard';
import { PERMISSIONS } from '@/context/PermissionsContext';
import { useSession } from '@/context/SessionContext';

const SiteManagement = () => {
  const { user } = useSession();
  
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

  // Use the new contact-based sites hook
  const { 
    sites, 
    loading, 
    error, 
    fetchClientSites,
    totalSites
  } = useClientSites(clientUuid);
  // Handle request work functionality
  const handleRequestWork = (site) => {
    // For now, show a simple alert. In a real implementation, this would open a dialog
    // or navigate to a work request form
    alert(`Request work functionality for site: ${site.name}\n\nThis would typically open a form to:\n- Describe the work needed\n- Set priority\n- Attach files\n- Submit the request to administrators`);
    
    // TODO: Implement actual work request functionality
    // This could include:
    // - Opening a modal dialog with a work request form
    // - Navigating to a dedicated work request page
    // - Making an API call to create a work request
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchClientSites();
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
        </div>

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <Card key={site.uuid || site.id} className="relative">
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
                    <Badge variant="outline" className="text-xs">
                      Site
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {(site.address || site.suburb || site.city) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p>{site.address}</p>
                      {(site.suburb || site.city) && (
                        <p>{[site.suburb, site.city, site.state, site.postcode].filter(Boolean).join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {(site.email || site.phone) && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    {site.email && <p>📧 {site.email}</p>}
                    {site.phone && <p>📞 {site.phone}</p>}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <PermissionGuard permission={PERMISSIONS.REQUEST_WORK}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleRequestWork(site)}
                    >
                      <Plus className="h-4 w-4" />
                      Request Work
                    </Button>
                  </PermissionGuard>
                  
                  {/* Contact-based site indicator */}
                  <Badge variant="secondary" className="text-xs">
                    Contact Site
                  </Badge>
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
