import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Label } from '@/components/UI/label';

const mockAdminProfile = {
  name: 'Admin User',
  email: 'admin@company.com',
  role: 'Administrator',
  phone: '+61 2 8765 4321',
};

const AdminProfile = () => {
  const [profile, setProfile] = useState(mockAdminProfile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 1500);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-2">Profile</h1>
      <p className="text-muted-foreground mb-6">View and update your admin profile information</p>
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
            <CardDescription>Your admin account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={profile.name} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleChange} disabled={!editing} />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" value={profile.role} onChange={handleChange} disabled />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" value={profile.phone} onChange={handleChange} disabled={!editing} />
            </div>
          </CardContent>
          <CardFooter>
            {editing ? (
              <>
                <Button type="submit" className="w-full" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                <Button type="button" variant="outline" className="w-full ml-2" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              </>
            ) : (
              <Button type="button" className="w-full" onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
            {saved && <span className="ml-4 text-green-600 text-sm">Saved!</span>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminProfile;
