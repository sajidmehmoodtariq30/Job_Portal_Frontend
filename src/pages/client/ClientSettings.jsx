import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Label } from '@/components/UI/label';

const mockProfile = {
  company: 'TechSolutions Inc',
  name: 'Client User',
  email: 'client@company.com',
};

const ClientSettings = () => {
  const [profile, setProfile] = useState(mockProfile);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
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
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-muted-foreground mb-6">Manage your profile and account settings</p>

      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your company and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" value={profile.company} onChange={handleProfileChange} required disabled={saving} />
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={profile.name} onChange={handleProfileChange} required disabled={saving} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleProfileChange} required disabled={saving} />
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
            <CardDescription>Change your account password</CardDescription>
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

export default ClientSettings;