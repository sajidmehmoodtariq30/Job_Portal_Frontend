import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import Illustration from "@/assets/illustration.jpg";
import { MoveRight } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/apiConfig";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for admin token in URL parameters
    const params = new URLSearchParams(window.location.search);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const expires_in = params.get('expires_in');
    const token_type = params.get('token_type');
    const scope = params.get('scope');
    
    if (access_token && refresh_token && expires_in && token_type && scope) {
      const tokenData = {
        access_token,
        refresh_token,
        expires_in,
        token_type,
        scope: decodeURIComponent(scope)
      };
      localStorage.setItem('admin_token', JSON.stringify(tokenData));
      // Remove tokens from URL for cleanliness
      window.history.replaceState({}, document.title, window.location.pathname);
      // Redirect to admin dashboard
      navigate('/admin');
      return;
    }
    
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      navigate('/admin');
      return;
    }
      // Check if client is already logged in
    const clientData = localStorage.getItem('client_data');
    if (clientData) {
      // Client already logged in, redirect to client dashboard
      navigate('/client');
    }
  }, [navigate]);

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    window.location.href = API_ENDPOINTS.AUTH.SERVICE_M8;
  };
  const handleClientSubmit = async (e) => {
    e.preventDefault();
    if (email === "" || password === "") {
      alert("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.CLIENT_AUTH, {
        email,
        password
      });
      
      if (response.status === 200 && response.data.success) {
        // Store client data in localStorage for persistent login
        localStorage.setItem('client_data', JSON.stringify(response.data.client));
        localStorage.setItem('client_email', email);
        navigate("/client");
      } else {
        alert("Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      if (error.response?.status === 401) {
        alert("Invalid email or password. Please try again.");
      } else {
        alert("An error occurred during login. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl min-h-[600px] rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden bg-white">
        <div className="w-full md:w-[50%] h-64 md:h-auto bg-white">
          <img
            src={Illustration}
            alt="Illustration"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-[50%] flex flex-col items-center justify-center p-6 md:p-8 gap-4">
          <h1 className="text-2xl font-semibold text-center mb-2">Authentication</h1>
          
          <form className="w-full flex flex-col items-center gap-4" onSubmit={handleClientSubmit}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full md:w-[60%] cursor-pointer" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In as Client"}
            </Button>
          </form>
          
          <div className="flex items-center w-full md:w-[60%] gap-2 my-2">
            <hr className="flex-grow border-gray-300" />
            <p className="text-center text-gray-500 text-sm">or</p>
            <hr className="flex-grow border-gray-300" />
          </div>
          
          <Button 
            onClick={(e) => handleAdminSubmit(e)} 
            className="w-full md:w-[60%] bg-blue-600 hover:bg-blue-600/80 cursor-pointer"
          >
            Continue as Admin
            <MoveRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
