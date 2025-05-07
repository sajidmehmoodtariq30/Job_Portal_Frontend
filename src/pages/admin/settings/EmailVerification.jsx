import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { BadgeCheck, Mail, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/apiConfig";
import axios from 'axios';

const EmailVerification = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // User's verified emails
  const [verifiedEmails, setVerifiedEmails] = useState([]);
  const [primaryEmail, setPrimaryEmail] = useState(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  
  // Get current user ID from localStorage
  const getUserId = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) return null;
    
    try {
      const tokenData = JSON.parse(token);
      // In a real app, you'd extract user ID from the token or user data
      // For this demo, we'll use a simple string
      return tokenData.user_id || 'admin-user';
    } catch (e) {
      return 'admin-user'; // Fallback user ID for demo
    }
  };
  
  const userId = getUserId();
  
  // Load verified emails on component mount
  useEffect(() => {
    if (userId) {
      fetchUserEmails();
    }
  }, [userId]);
  
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
  };

  return (
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
            <div className="space-y-2">
              {verifiedEmails.map((emailAddress) => (
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
        {(verifiedEmails.length === 0 || (isVerified === false && email)) && (
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
  );
};

export default EmailVerification;