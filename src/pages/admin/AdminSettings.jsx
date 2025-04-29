import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Label } from '@/components/UI/label';

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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 1000);
  };

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

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your admin account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={saving} />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={saving} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={saving || !password || password !== confirmPassword}>
              {saving ? 'Saving...' : 'Change Password'}
            </Button>
            {password && confirmPassword && password !== confirmPassword && (
              <span className="ml-4 text-red-600 text-sm">Passwords do not match</span>
            )}
            {saved && <span className="ml-4 text-green-600 text-sm">Saved!</span>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminSettings;
