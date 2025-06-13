import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/UI/card';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import { Label } from '@/components/UI/label';
import { Skeleton } from '@/components/UI/skeleton';
import { getClientNameByUuid } from '@/utils/clientUtils';
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';

const ClientProfile = () => {
  const [profile, setProfile] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    address_city: '',
    address_state: '',
    address_postcode: '',
    address_country: ''
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);  // Get client data from localStorage
  const getClientData = () => {
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
  const clientId = clientData?.assignedClientUuid || clientData?.uuid || clientData?.clientUuid;

  // Fetch client profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!clientData || !clientId) {
        setError('No client data found. Please log in again.');
        setLoading(false);
        return;
      }      try {
        // Initialize profile data with stored client data
        setProfile({
          uuid: clientData.uuid,
          company: clientData.name || '',
          name: clientData.contact_name || clientData.name || '',
          email: clientData.email || '',
          phone: clientData.phone || '',
          address: clientData.address || '',
          address_city: clientData.address_city || '',
          address_state: clientData.address_state || '',
          address_postcode: clientData.address_postcode || '',
          address_country: clientData.address_country || ''
        });
      } catch (error) {
        console.error('Error setting profile data:', error);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };    fetchProfile();
  }, [clientData, clientId]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Update client profile via ServiceM8
      const updateData = {
        name: profile.company,
        address: profile.address,
        address_city: profile.address_city,
        address_state: profile.address_state,
        address_postcode: profile.address_postcode,
        address_country: profile.address_country,
        phone: profile.phone,
        email: profile.email
      };

      await axios.put(`${API_URL}/fetch/clients/${clientId}`, updateData);
      
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-2">Profile</h1>
      <p className="text-muted-foreground mb-6">View and update your client profile information</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Your company and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              // Loading state
              <>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input 
                    id="company" 
                    name="company" 
                    value={profile.company} 
                    onChange={handleChange} 
                    disabled={!editing} 
                  />
                </div>
                <div>
                  <Label htmlFor="name">Contact Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={profile.name} 
                    onChange={handleChange} 
                    disabled={!editing} 
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={profile.email} 
                    onChange={handleChange} 
                    disabled={!editing} 
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleChange} 
                    disabled={!editing} 
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    value={profile.address} 
                    onChange={handleChange} 
                    disabled={!editing} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address_city">City</Label>
                    <Input 
                      id="address_city" 
                      name="address_city" 
                      value={profile.address_city} 
                      onChange={handleChange} 
                      disabled={!editing} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_state">State</Label>
                    <Input 
                      id="address_state" 
                      name="address_state" 
                      value={profile.address_state} 
                      onChange={handleChange} 
                      disabled={!editing} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address_postcode">Postcode</Label>
                    <Input 
                      id="address_postcode" 
                      name="address_postcode" 
                      value={profile.address_postcode} 
                      onChange={handleChange} 
                      disabled={!editing} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="address_country">Country</Label>
                    <Input 
                      id="address_country" 
                      name="address_country" 
                      value={profile.address_country} 
                      onChange={handleChange} 
                      disabled={!editing} 
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            {!loading && (
              editing ? (
                <div className="flex w-full space-x-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => setEditing(false)} 
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button" 
                  className="w-full" 
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              )
            )}
            {saved && (
              <div className="text-green-600 text-sm text-center">
                Profile updated successfully!
              </div>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ClientProfile;
