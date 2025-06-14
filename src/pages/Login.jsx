import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Alert, AlertDescription } from "@/components/UI/alert";
import Illustration from "@/assets/illustration.jpg";
import { MoveRight, Mail, ArrowLeft } from "lucide-react";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/apiConfig";
import { useSession } from "@/context/SessionContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [oauthProcessed, setOauthProcessed] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleAdminLogin, handleUserLogin, isAuthenticated, isAdmin, isUser, admin, user } = useSession();  useEffect(() => {
    console.log('🔄 Login useEffect triggered');
    console.log('📊 Current state:', { 
      isAuthenticated: isAuthenticated(), 
      isAdmin: isAdmin(), 
      isUser: isUser(),
      isProcessingOAuth,
      oauthProcessed
    });

    // Skip processing if we've already processed OAuth or are currently processing
    if (oauthProcessed || isProcessingOAuth) {
      console.log('⏭️ Skipping - OAuth already processed or in progress');
      return;
    }

    // Check for admin OAuth callback tokens in URL parameters first
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    const expires_in = searchParams.get('expires_in');
    const token_type = searchParams.get('token_type');
    const scope = searchParams.get('scope');
    
    console.log('🔍 OAuth parameters:', { 
      access_token: !!access_token, 
      refresh_token: !!refresh_token, 
      expires_in, 
      token_type, 
      scope: !!scope
    });

    if (access_token && refresh_token && expires_in && token_type && scope) {
      console.log('✅ Processing OAuth callback...');
      
      // Mark as processed immediately to prevent re-processing
      setOauthProcessed(true);
      setIsProcessingOAuth(true);
      
      const tokenData = {
        access_token,
        refresh_token,
        expires_in: parseInt(expires_in),
        token_type,
        scope: decodeURIComponent(scope)
      };
      
      console.log('🔑 Processing token data');
      
      // Clean up URL immediately
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      console.log('🧹 URL cleaned to:', cleanUrl);
      
      // Handle admin login
      handleAdminLogin(tokenData, () => {
        console.log('✅ Admin login successful, navigating...');
        setIsProcessingOAuth(false);
        navigate('/admin', { replace: true });
      });
      
      return;
    }

    // Check if user is already authenticated (only if no OAuth processing)
    if (isAuthenticated()) {
      console.log('👤 User already authenticated, redirecting...');
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        console.log('↩️ Redirecting to return path:', returnTo);
        navigate(returnTo, { replace: true });
      } else if (isAdmin()) {
        console.log('🏢 Redirecting admin to dashboard');
        navigate('/admin', { replace: true });
      } else if (isUser()) {
        console.log('👥 Redirecting user to dashboard');
        navigate('/client', { replace: true });
      }
    } else {
      console.log('🔐 No authentication found, staying on login page');
    }
  }, [navigate, searchParams, handleAdminLogin, isAuthenticated, isAdmin, isUser, isProcessingOAuth, oauthProcessed]);

  // Cleanup effect to reset OAuth processing state
  useEffect(() => {
    return () => {
      // Reset OAuth processing state when component unmounts
      setOauthProcessed(false);
      setIsProcessingOAuth(false);
    };
  }, []);

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    window.location.href = API_ENDPOINTS.AUTH.SERVICE_M8;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setError("Please enter your email address.");
      return;
    }

    setForgotPasswordLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: forgotPasswordEmail
      });

      if (response.data.success) {
        setMessage("Password reset instructions have been sent to your email.");
        setForgotPasswordEmail("");
        // Optionally, go back to login form after a few seconds
        setTimeout(() => {
          setShowForgotPassword(false);
          setMessage("");
        }, 3000);
      } else {
        setError(response.data.message || "Failed to send reset email. Please try again.");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      if (error.response?.status === 404) {
        setError("No account found with this email address.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (email === "" || password === "") {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.USER_LOGIN, {
        email,
        password
      });

      if (response.status === 200 && response.data.success) {
        // Use session management to handle user login
        handleUserLogin(response.data.user, email);
        
        // Check for return path
        const returnTo = searchParams.get('returnTo');
        if (returnTo && returnTo.startsWith('/client')) {
          navigate(returnTo);
        }
      } else {
        setError("Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      
      // Handle specific error codes for deactivated accounts
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_DEACTIVATED') {
        setError("Your account has been deactivated. Please contact support for assistance.");
      } else if (error.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred during login. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  // Show processing screen if handling OAuth callback
  if (isProcessingOAuth) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Login...</h2>
          <p className="text-gray-600">Please wait while we complete your authentication.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl min-h-[600px] rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden bg-white">
        <div className="w-full md:w-[50%] h-64 md:h-auto bg-white">
          <img
            src={Illustration}
            alt="Illustration"
            className="w-full h-full object-cover"
          />
        </div>        <div className="w-full md:w-[50%] p-8 flex flex-col justify-center">
          {!showForgotPassword ? (
            // Login Form
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
                <p className="text-gray-600">Please login to continue.</p>
              </div>

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full" 
                  variant="default"
                >
                  {isLoading ? "Loading..." : "Login as User"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot your password?
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">or</p>
              </div>

              <Button
                onClick={handleAdminSubmit}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                variant="default"
              >
                Login as Admin
              </Button>
            </>
          ) : (
            // Forgot Password Form
            <>
              <div className="mb-6">
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError("");
                    setMessage("");
                    setForgotPasswordEmail("");
                  }}
                  className="flex items-center text-blue-600 hover:underline mb-4"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Back to Login
                </button>
                <h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
                <p className="text-gray-600">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {message && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <Mail className="h-4 w-4" />
                  <AlertDescription className="text-green-800">{message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="forgotEmail">Email Address</Label>
                  <Input
                    type="email"
                    id="forgotEmail"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={forgotPasswordLoading} 
                  className="w-full"
                >
                  {forgotPasswordLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
