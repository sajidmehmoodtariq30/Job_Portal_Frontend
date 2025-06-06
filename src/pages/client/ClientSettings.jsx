import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/UI/card';
import { Button } from '@/components/UI/button';
import { Label } from '@/components/UI/label';
import { Switch } from "@/components/UI/switch";
import { Input } from "@/components/UI/input";
import { Mail, Info, AlertCircle, Loader2, BadgeCheck, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/apiConfig";
import axios from 'axios';

const ClientSettings = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Email verification states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  // User's verified emails
  const [verifiedEmails, setVerifiedEmails] = useState([]);
  const [primaryEmail, setPrimaryEmail] = useState(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
    // Flag to control the display of the add email form
  const [showAddEmailForm, setShowAddEmailForm] = useState(false);
  
  // Get current user ID from localStorage
  const getUserId = () => {
    const clientData = localStorage.getItem('client_data');
    if (clientData) {
      try {
        const parsedData = JSON.parse(clientData);
        return `client-${parsedData.uuid}`;
      } catch (error) {
        console.error('Error parsing client data:', error);
        return null;
      }
    }
    return null;
  };
  
  const userId = getUserId();

  // Fetch current notification settings on component mount
  useEffect(() => {
    fetchCurrentSettings();
    if (userId) {
      fetchUserEmails();
    }
  }, [userId]);

  const fetchCurrentSettings = async () => {
    setInitialLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/notifications/settings`);
      
      if (response.status === 200 && response.data) {
        // Update the state based on the returned settings
        setNotificationSettings({
          emailNotifications: response.data.channels?.email ?? true
        });
      }
    } catch (err) {
      console.error('Failed to fetch notification settings:', err);
      // Don't show error to user, just use default settings
    } finally {
      setInitialLoading(false);
    }
  };
  
  const fetchUserEmails = async () => {
    if (!userId) return;
    
    setIsLoadingEmails(true);
    try {
      const response = await axios.get(`${API_URL}/api/user-emails/${userId}`);
      
      if (response.status === 200 && response.data.success) {
        setVerifiedEmails(response.data.data.verifiedEmails || []);
        setPrimaryEmail(response.data.data.primaryEmail || null);
        
        // If user has a verified email, show the verified status
        if (response.data.data.verifiedEmails?.length > 0) {
          setIsVerified(true);
        }
      }
    } catch (err) {
      console.error('Error fetching user emails:', err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleToggle = () => {
    setNotificationSettings(prev => ({
      ...prev,
      emailNotifications: !prev.emailNotifications
    }));
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Transform settings to match backend structure
      const payload = {
        channels: {
          email: notificationSettings.emailNotifications
        },
        // Keep all types true for backend compatibility
        types: {
          clientCreation: true,
          clientUpdate: true,
          jobCreation: true,
          jobUpdate: true,
          quoteCreation: true,
          invoiceGenerated: true
        },
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
  
  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!userId) {
      setError('User ID is required. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_URL}/api/email-verification/generate-otp`, { email });
      
      if (response.status === 200) {
        setIsOtpSent(true);
        setSuccess('Verification code sent to your email');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the verification code');
      return;
    }
    
    if (!userId) {
      setError('User ID is required. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${API_URL}/api/email-verification/verify`, { 
        email,
        otp,
        userId
      });
      
      if (response.status === 200) {
        setIsVerified(true);
        setSuccess('Email verified successfully');
        
        // Refresh the list of verified emails
        fetchUserEmails();
        
        // Reset form
        setEmail('');
        setOtp('');
        setIsOtpSent(false);
        setShowAddEmailForm(false); // Hide the form after successful verification
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetPrimaryEmail = async (emailAddress) => {
    if (!userId) {
      setError('User ID is required. Please log in again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/user-emails/set-primary`, {
        userId,
        email: emailAddress
      });
      
      if (response.status === 200) {
        setPrimaryEmail(emailAddress);
        setSuccess('Primary email updated successfully');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update primary email');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form to add a new email
  const handleAddNewEmail = () => {
    setEmail('');
    setOtp('');
    setIsOtpSent(false);
    setIsVerified(false);
    setError(null);
    setSuccess(null);
    
    // Show the form to add a new email
    setShowAddEmailForm(true);
  };

  const handleRemoveEmail = async (emailAddress) => {
    if (!userId) {
      setError('User ID is required. Please log in again.');
      return;
    }

    // Don't allow removing the last email
    if (verifiedEmails.length <= 1) {
      setError('Cannot remove the last verified email address. You must have at least one verified email.');
      return;
    }

    // Confirm removal
    if (!window.confirm(`Are you sure you want to remove "${emailAddress}" from your verified emails?`)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.delete(`${API_URL}/api/user-emails/remove`, {
        data: {
          userId,
          email: emailAddress
        }
      });

      if (response.status === 200) {
        setSuccess('Email address removed successfully');
        // Refresh the list of verified emails
        fetchUserEmails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove email address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>

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
      
      {/* Email Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" /> Email Verification
          </CardTitle>
          <CardDescription>
            Verify your email address to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display list of verified emails */}
          {verifiedEmails.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Your verified email addresses:</h3>
              <div className="space-y-2">                {verifiedEmails.map((emailAddress) => (
                  <div 
                    key={emailAddress} 
                    className={`flex items-center justify-between p-3 rounded border ${primaryEmail === emailAddress ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{emailAddress}</span>
                      {primaryEmail === emailAddress && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Primary</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {primaryEmail !== emailAddress && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleSetPrimaryEmail(emailAddress)}
                          disabled={isLoading}
                        >
                          Set as Primary
                        </Button>
                      )}
                      {verifiedEmails.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveEmail(emailAddress)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleAddNewEmail}
              >
                Add Another Email
              </Button>
            </div>
          )}
          
          {/* Verification form for new emails */}
          {(verifiedEmails.length === 0 || showAddEmailForm) && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isOtpSent || isLoading}
                />
              </div>

              {isOtpSent && (
                <div className="grid gap-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your email. The code will expire in 5 minutes.
                  </p>
                </div>
              )}

              {isOtpSent ? (
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button onClick={handleVerifyOtp} disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  <Button 
                    variant="outline" 
                    disabled={isLoading}
                    onClick={handleSendOtp}
                  >
                    Resend Code
                  </Button>
                </div>
              ) : (
                <Button onClick={handleSendOtp} disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Notification Settings Card */}
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
                  checked={notificationSettings.emailNotifications} 
                  onCheckedChange={handleToggle} 
                />
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200 flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700">
                    When email notifications are <strong>{notificationSettings.emailNotifications ? 'enabled' : 'disabled'}</strong>, you {notificationSettings.emailNotifications ? 'will' : 'will not'} receive emails for any events including job updates, quotes, and other important notifications.
                  </p>
                </div>
              </div>

              {!notificationSettings.emailNotifications && (
                <div className="mt-4 p-4 bg-amber-50 rounded-md border border-amber-200 flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-amber-700">
                      <strong>Note:</strong> All email notifications are currently disabled. You will not receive any emails for system events.
                    </p>
                  </div>
                </div>
              )}
              
              <Button onClick={handleSaveNotifications} disabled={isLoading} className="w-full mt-4">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  'Save Notification Settings'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientSettings;