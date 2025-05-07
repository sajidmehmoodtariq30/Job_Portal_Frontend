// src/pages/admin/settings/NotificationsSettings.jsx
import React, { useState } from 'react';
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
import { Mail, Bell, FileText, ClipboardList, UserPlus, Users } from "lucide-react";
import EmailVerification from './EmailVerification';
import { API_URL } from "@/lib/apiConfig";
import axios from 'axios';

const NotificationsSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
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

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleTypeToggle = (type) => {
    setSettings(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
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
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Configure how you'd like to receive notifications from the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <Switch 
              id="email-notifications" 
              checked={settings.emailNotifications} 
              onCheckedChange={() => handleToggle('emailNotifications')} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Select which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <UserPlus className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="client-creation" className="text-base font-medium">Client Creation</Label>
                <p className="text-sm text-gray-500">When a new client is created</p>
              </div>
            </div>
            <Switch 
              id="client-creation" 
              checked={settings.types.clientCreation} 
              onCheckedChange={() => handleTypeToggle('clientCreation')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="client-update" className="text-base font-medium">Client Update</Label>
                <p className="text-sm text-gray-500">When client details are updated</p>
              </div>
            </div>
            <Switch 
              id="client-update" 
              checked={settings.types.clientUpdate} 
              onCheckedChange={() => handleTypeToggle('clientUpdate')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <ClipboardList className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="job-creation" className="text-base font-medium">Job Creation</Label>
                <p className="text-sm text-gray-500">When a new job is created</p>
              </div>
            </div>
            <Switch 
              id="job-creation" 
              checked={settings.types.jobCreation} 
              onCheckedChange={() => handleTypeToggle('jobCreation')} 
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <ClipboardList className="h-5 w-5 text-gray-500" />
              <div>
                <Label htmlFor="job-update" className="text-base font-medium">Job Update</Label>
                <p className="text-sm text-gray-500">When a job status is updated</p>
              </div>
            </div>
            <Switch 
              id="job-update" 
              checked={settings.types.jobUpdate} 
              onCheckedChange={() => handleTypeToggle('jobUpdate')} 
            />
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSettings;