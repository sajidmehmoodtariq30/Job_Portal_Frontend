// src/pages/admin/settings/NotificationsSettings.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/UI/card";
import { Switch } from "@/components/UI/switch";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import { Mail, Info, AlertCircle, Loader2 } from "lucide-react";
import EmailVerification from './EmailVerification';
import { API_URL } from "@/lib/apiConfig";
import axios from 'axios';

const NotificationsSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    // Setting all types to true but keeping the structure for backend compatibility
    types: {
      clientCreation: true,
      clientUpdate: true,
      jobCreation: true,
      jobUpdate: true,
      quoteCreation: true,
      invoiceGenerated: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch current notification settings on component mount
  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const fetchCurrentSettings = async () => {
    setInitialLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/notifications/settings`);
      
      if (response.status === 200 && response.data) {
        // Update the state based on the returned settings
        setSettings({
          emailNotifications: response.data.channels?.email ?? true,
          types: response.data.types || {
            clientCreation: true,
            clientUpdate: true,
            jobCreation: true,
            jobUpdate: true,
            quoteCreation: true,
            invoiceGenerated: true
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch notification settings:', err);
      // Don't show error to user, just use default settings
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggle = () => {
    setSettings(prev => ({
      ...prev,
      emailNotifications: !prev.emailNotifications
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Transform settings to match backend structure
      const payload = {
        channels: {
          email: settings.emailNotifications
        },
        // Keep all types true for backend compatibility
        types: settings.types,
        sendgrid: {
          enabled: true // Use environment variables for SendGrid credentials
        }
      };
      
      const response = await axios.post(`${API_URL}/api/notifications/settings`, payload);
      
      if (response.status === 200) {
        setSuccess('Notification settings saved successfully');
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notifications Settings</h1>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {error && (
        <div className="p-3 text-sm bg-red-50 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm bg-green-50 text-green-700 rounded border border-green-200">
          {success}
        </div>
      )}

      <EmailVerification />

      <Card>
        <CardHeader>
          <CardTitle>Email Notification Settings</CardTitle>
          <CardDescription>
            Enable or disable all email notifications from the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {initialLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading settings...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-4">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Toggle all email notifications on or off</p>
                  </div>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={settings.emailNotifications} 
                  onCheckedChange={handleToggle} 
                />
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200 flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700">
                    When email notifications are <strong>{settings.emailNotifications ? 'enabled' : 'disabled'}</strong>, the system {settings.emailNotifications ? 'will' : 'will not'} send emails for any events including job updates, client changes, quotes, and invoices.
                  </p>
                </div>
              </div>

              {!settings.emailNotifications && (
                <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200 flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-700">
                      <strong>Note:</strong> All email notifications are currently disabled. No emails will be sent for any system events.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSettings;