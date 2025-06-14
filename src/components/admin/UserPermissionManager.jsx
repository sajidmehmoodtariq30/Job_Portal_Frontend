import React, { useState, useEffect } from 'react';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Label } from '@/components/UI/label';
import { Checkbox } from '@/components/UI/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/UI/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/UI/dialog';
import { Badge } from '@/components/UI/badge';
import { Alert, AlertDescription } from '@/components/UI/alert';
import { Loader2, Save, Edit, Shield, User, Mail } from 'lucide-react';
import { PERMISSIONS, PERMISSION_LABELS, PERMISSION_DESCRIPTIONS } from '@/context/PermissionsContext';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { triggerRealTimeUpdate, NOTIFICATION_TYPES } from '@/utils/realTimeUpdates';

const UserPermissionManager = ({ 
  isOpen, 
  onClose, 
  userId, 
  userName, 
  userEmail,
  currentPermissions = [],
  onPermissionsUpdate
}) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize permissions state
  useEffect(() => {
    if (isOpen) {
      const initialPermissions = {};
      Object.values(PERMISSIONS).forEach(permission => {
        initialPermissions[permission] = currentPermissions.includes(permission);
      });
      setPermissions(initialPermissions);
      setError('');
      setSuccess('');
    }
  }, [isOpen, currentPermissions]);

  const handlePermissionChange = (permission, checked) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(permissions).every(Boolean);
    const newPermissions = {};
    Object.values(PERMISSIONS).forEach(permission => {
      newPermissions[permission] = !allSelected;
    });
    setPermissions(newPermissions);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const selectedPermissions = Object.entries(permissions)
        .filter(([_, checked]) => checked)
        .map(([permission, _]) => permission);

      const response = await fetch(API_ENDPOINTS.USERS.UPDATE_PERMISSIONS(userId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions: selectedPermissions
        })
      });

      const data = await response.json();      if (data.success) {
        setSuccess('Permissions updated successfully!');
        
        // Trigger real-time update notification
        triggerRealTimeUpdate(NOTIFICATION_TYPES.PERMISSIONS_UPDATED, {
          userId,
          permissions: selectedPermissions,
          updatedBy: 'admin',
          timestamp: Date.now()
        });

        if (onPermissionsUpdate) {
          onPermissionsUpdate(userId, selectedPermissions);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.message || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      setError('Failed to update permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = Object.values(permissions).filter(Boolean).length;
  const totalCount = Object.values(PERMISSIONS).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage User Permissions
          </DialogTitle>
          <DialogDescription>
            Configure permissions for {userName} ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{userName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{userEmail}</span>
              </div>
            </CardContent>
          </Card>

          {/* Permission Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedCount} of {totalCount} permissions selected
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSelectAll}
              type="button"
            >
              {selectedCount === totalCount ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {/* Permissions List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Available Permissions</CardTitle>
              <CardDescription>
                Select the permissions you want to grant to this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(PERMISSIONS).map((permission) => (
                  <div key={permission} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={permission}
                      checked={permissions[permission] || false}
                      onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={permission}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {PERMISSION_LABELS[permission]}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        {PERMISSION_DESCRIPTIONS[permission]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Error/Success Messages */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Permissions
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserPermissionManager;
