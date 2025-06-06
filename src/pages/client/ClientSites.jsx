import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  AlertCircle,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { Button } from "@/components/UI/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/UI/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/UI/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/UI/alert-dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import { Badge } from "@/components/UI/badge";
import { Switch } from "@/components/UI/switch";
import { useSites } from '@/hooks/useSites';

const SiteManagement = () => {
  const clientId = localStorage.getItem('client_id') || localStorage.getItem('clientId') || localStorage.getItem('userId') || localStorage.getItem('client_uuid');
  
  const { 
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
  } = useSites(clientId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const [newSiteData, setNewSiteData] = useState({
    name: '',
    address: '',
    description: '',
    isDefault: false
  });

  const [editSiteData, setEditSiteData] = useState({
    name: '',
    address: '',
    description: '',
    isDefault: false,
    active: true
  });

  // Handle input changes for new site
  const handleNewSiteChange = (field, value) => {
    setNewSiteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle input changes for edit site
  const handleEditSiteChange = (field, value) => {
    setEditSiteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Create new site
  const handleCreateSite = async (e) => {
    e.preventDefault();
    
    if (!newSiteData.name.trim()) {
      alert('Site name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createSite(newSiteData);
      setIsCreateDialogOpen(false);
      setNewSiteData({
        name: '',
        address: '',
        description: '',
        isDefault: false
      });
    } catch (error) {
      alert(`Failed to create site: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit site
  const handleEditSite = async (e) => {
    e.preventDefault();
    
    if (!editSiteData.name.trim()) {
      alert('Site name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSite(editingSite.id, editSiteData);
      setIsEditDialogOpen(false);
      setEditingSite(null);
    } catch (error) {
      alert(`Failed to update site: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (site) => {
    setEditingSite(site);
    setEditSiteData({
      name: site.name,
      address: site.address || '',
      description: site.description || '',
      isDefault: site.isDefault,
      active: site.active
    });
    setIsEditDialogOpen(true);
  };

  // Delete site
  const handleDeleteSite = async (siteId) => {
    setActionLoading(prev => ({ ...prev, [`delete-${siteId}`]: true }));
    try {
      await deleteSite(siteId);
    } catch (error) {
      alert(`Failed to delete site: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${siteId}`]: false }));
    }
  };

  // Set site as default
  const handleSetDefault = async (siteId) => {
    setActionLoading(prev => ({ ...prev, [`default-${siteId}`]: true }));
    try {
      await setDefaultSite(siteId);
    } catch (error) {
      alert(`Failed to set default site: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`default-${siteId}`]: false }));
    }
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
        <Button onClick={fetchSites} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Site Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your business locations and sites
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Site</DialogTitle>
              <DialogDescription>
                Create a new site for your business locations.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Site Name *</Label>
                <Input
                  id="name"
                  value={newSiteData.name}
                  onChange={(e) => handleNewSiteChange('name', e.target.value)}
                  placeholder="e.g., Main Office, Warehouse, Branch Office"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newSiteData.address}
                  onChange={(e) => handleNewSiteChange('address', e.target.value)}
                  placeholder="Full address of the site"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSiteData.description}
                  onChange={(e) => handleNewSiteChange('description', e.target.value)}
                  placeholder="Optional description of this site"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={newSiteData.isDefault}
                  onCheckedChange={(checked) => handleNewSiteChange('isDefault', checked)}
                />
                <Label htmlFor="isDefault">Set as default site</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Site'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <Card key={site.id} className={`relative ${site.id === currentSite?.id ? 'ring-2 ring-primary' : ''}`}>
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
                  {site.id === currentSite?.id && (
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
                {site.id !== currentSite?.id && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => changeSite(site)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Select
                  </Button>
                )}
                
                {!site.isDefault && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSetDefault(site.id)}
                    disabled={actionLoading[`default-${site.id}`]}
                  >
                    {actionLoading[`default-${site.id}`] ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Star className="h-3 w-3 mr-1" />
                    )}
                    Set Default
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => openEditDialog(site)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                
                {sites.length > 1 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={actionLoading[`delete-${site.id}`]}
                      >
                        {actionLoading[`delete-${site.id}`] ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Site</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{site.name}"? This action cannot be undone.
                          {site.isDefault && " This is your default site."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteSite(site.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete Site
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Site Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Site</DialogTitle>
            <DialogDescription>
              Update the details for "{editingSite?.name}".
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Site Name *</Label>
              <Input
                id="edit-name"
                value={editSiteData.name}
                onChange={(e) => handleEditSiteChange('name', e.target.value)}
                placeholder="e.g., Main Office, Warehouse, Branch Office"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editSiteData.address}
                onChange={(e) => handleEditSiteChange('address', e.target.value)}
                placeholder="Full address of the site"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editSiteData.description}
                onChange={(e) => handleEditSiteChange('description', e.target.value)}
                placeholder="Optional description of this site"
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isDefault"
                  checked={editSiteData.isDefault}
                  onCheckedChange={(checked) => handleEditSiteChange('isDefault', checked)}
                />
                <Label htmlFor="edit-isDefault">Set as default site</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editSiteData.active}
                  onCheckedChange={(checked) => handleEditSiteChange('active', checked)}
                />
                <Label htmlFor="edit-active">Site is active</Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Site'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {sites.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No sites found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first site to get started with managing your business locations.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Site
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SiteManagement;
