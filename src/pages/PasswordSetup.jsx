import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/UI/card";
import { Eye, EyeOff, Shield, Check, X } from "lucide-react";
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const PasswordSetup = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userType, setUserType] = useState('client'); // 'client' or 'user'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Password strength requirements
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });  // Validate token on component mount
  useEffect(() => {
    const validateSetupToken = async () => {
      const typeFromParams = searchParams.get('type');
      if (typeFromParams === 'user') {
        setUserType('user');
      }

      try {
        setValidatingToken(true);
        setError('');        console.log('Validating token:', token);
        console.log('Validation endpoint:', API_ENDPOINTS.AUTH.VALIDATE_USER_SETUP_TOKEN(token));
        const response = await fetch(API_ENDPOINTS.AUTH.VALIDATE_USER_SETUP_TOKEN(token));
        const data = await response.json();
        console.log('Token validation response:', data);

        if (data.success) {
          console.log('Token valid, user info:', data.data);
          setTokenValid(true);
          setUserInfo(data.data);
        } else {
          setTokenValid(false);
          setError('Invalid or expired setup link. Please contact support for assistance.');
        }
      } catch (error) {
        console.error('Error validating setup token:', error);
        setTokenValid(false);
        setError('Error validating setup link. Please try again or contact support.');
      } finally {
        setValidatingToken(false);
      }
    };

    if (token) {
      validateSetupToken();
    }
  }, [token, searchParams]);

  // Update password requirements as user types
  useEffect(() => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [password]);

  const validateSetupToken = async () => {
    try {
      // First try to determine type from URL params
      const typeFromParams = searchParams.get('type');
      
      if (typeFromParams === 'user') {
        // Try user token validation first
        try {
          const response = await axios.get(API_ENDPOINTS.AUTH.VALIDATE_USER_SETUP_TOKEN(token));
          if (response.data.valid) {
            setTokenValid(true);
            setUserInfo(response.data);
            setUserType('user');
            return;
          }
        } catch (userError) {
          console.log('User token validation failed, trying client...');
        }
      }

      // Try client token validation (default or fallback)
      try {
        const response = await axios.get(API_ENDPOINTS.AUTH.VALIDATE_SETUP_TOKEN(token));
        if (response.data.valid) {
          setTokenValid(true);
          setUserInfo(response.data);
          setUserType('client');
          return;
        }
      } catch (clientError) {
        console.log('Client token validation failed');
      }

      // If both failed and no type specified, try user validation as fallback
      if (!typeFromParams) {
        try {
          const response = await axios.get(API_ENDPOINTS.AUTH.VALIDATE_USER_SETUP_TOKEN(token));
          if (response.data.valid) {
            setTokenValid(true);
            setUserInfo(response.data);
            setUserType('user');
            return;
          }
        } catch (userError) {
          console.log('Fallback user token validation also failed');
        }
      }

      setError('Invalid or expired setup link. Please contact support for assistance.');
    } catch (error) {
      console.error('Token validation error:', error);
      setError('Invalid or expired setup link. Please contact support for assistance.');
    } finally {
      setValidatingToken(false);
    }
  };

  const isPasswordValid = () => {
    return Object.values(passwordRequirements).every(req => req);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isPasswordValid()) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use appropriate endpoint based on user type
      const endpoint = userType === 'user' 
        ? API_ENDPOINTS.AUTH.USER_PASSWORD_SETUP 
        : API_ENDPOINTS.AUTH.PASSWORD_SETUP;

      const response = await axios.post(endpoint, {
        token,
        password
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login?setup=complete');
        }, 3000);
      } else {
        setError(response.data.message || 'Failed to set up password. Please try again.');
      }
    } catch (error) {
      console.error('Password setup error:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 400) {
        setError('Invalid request. Please check your information and try again.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <Check size={16} /> : <X size={16} />}
      <span>{text}</span>
    </div>
  );

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Validating setup link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Setup Link</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => navigate('/login')}
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="text-green-600" size={32} />
            </div>
            <CardTitle className="text-green-600">Password Set Successfully!</CardTitle>
            <CardDescription>
              Your account is now ready. You'll be redirected to the login page shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="w-full">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="text-blue-600" size={32} />
            </div>            <div>
              <CardTitle className="text-xl">Set Up Your Password</CardTitle>              <CardDescription className="mt-2">
                Welcome{userInfo?.clientName || userInfo?.name ? `, ${userInfo?.clientName || userInfo?.name}` : ''}! Please create a secure password for your {userType === 'user' ? 'user' : 'client'} account.
              </CardDescription>
            </div>
          </CardHeader>          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Form Fields */}
                <div className="space-y-6">                  {/* Email Display */}
                  {userInfo?.email && (                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input 
                        type="email" 
                        value={userInfo?.email || ''}
                        disabled 
                        className="bg-gray-50 text-gray-600"
                      />
                    </div>
                  )}

                  {/* Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {password && confirmPassword && password !== confirmPassword && (
                      <p className="text-sm text-red-600">Passwords do not match</p>
                    )}
                  </div>
                </div>

                {/* Right Column - Password Requirements */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Password Requirements</Label>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                      <RequirementItem met={passwordRequirements.length} text="At least 8 characters" />
                      <RequirementItem met={passwordRequirements.uppercase} text="One uppercase letter" />
                      <RequirementItem met={passwordRequirements.lowercase} text="One lowercase letter" />
                      <RequirementItem met={passwordRequirements.number} text="One number" />
                      <RequirementItem met={passwordRequirements.special} text="One special character (!@#$%^&*)" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-8 flex justify-center">
                <Button 
                  type="submit" 
                  className="w-full max-w-md py-3 text-lg" 
                  disabled={loading || !isPasswordValid() || password !== confirmPassword}
                >
                  {loading ? 'Setting up...' : 'Set Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PasswordSetup;
