import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Label } from '@/components/UI/label';
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';

const mockSettings = {
  company: 'MH IT Solutions',
  businessEmail: 'info@mhitsolutions.com',
  phone: '+61 2 1234 5678',
  address: '123 Business Ave, Suite 100, Sydney, NSW 2000',
  abn: '12 345 678 901',
  timezone: 'Australia/Sydney',
};

const timezones = [
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Darwin',
  'Australia/Hobart',
  'UTC',
];

const AdminSettings = () => {
  const [settings, setSettings] = useState(mockSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings from backend on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/admin/settings`);
        if (response.data && response.data.success) {
          setSettings({ ...mockSettings, ...response.data.settings });
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
        // Use mock settings as fallback
        setSettings(mockSettings);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put(`${API_URL}/api/admin/settings`, settings);

      if (response.data && response.data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving admin settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
        <p className="text-muted-foreground mb-6">Loading settings...</p>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your business and account settings</p>

      <Card>
        <form className='flex flex-col gap-4' onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Update your company and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className='flex flex-col gap-2'>
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" name="company" value={settings.company} onChange={handleChange} required disabled={saving} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor="businessEmail">Business Email</Label>
              <Input id="businessEmail" name="businessEmail" type="email" value={settings.businessEmail} onChange={handleChange} required disabled={saving} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={settings.phone} onChange={handleChange} required disabled={saving} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" value={settings.address} onChange={handleChange} required disabled={saving} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor="abn">ABN</Label>
              <Input id="abn" name="abn" value={settings.abn} onChange={handleChange} required disabled={saving} />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                name="timezone"
                className="w-full border rounded px-3 py-2 mt-1"
                value={settings.timezone}
                onChange={handleChange}
                disabled={saving}
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            {saved && <span className="ml-4 text-green-600 text-sm">Saved!</span>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminSettings;
