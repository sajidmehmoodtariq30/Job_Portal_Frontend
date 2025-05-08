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
    
    // Check if client is already logged in
    const clientId = localStorage.getItem('client_id');
    if (clientId) {
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
    if (email === "") {
      alert("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.AUTH.CLIENT_LOGIN(email));
      if (response.status === 200) {
        // Store client ID in localStorage for persistent login
        localStorage.setItem('client_id', email);
        navigate("/client");
      } else {
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred (likely Client is not Affiliated with any admin). Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className=" w-full max-w-4xl h-auto md:h-[80%] rounded-lg flex flex-col md:flex-row -mt-[70px] md:mt-0 overflow-hidden">
        <div className="w-full md:w-[50%] h-64 md:h-full bg-white">
          <img
            src={Illustration}
            alt="Illustration"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-[50%] h-full flex flex-col items-center p-8 gap-5">
          <h1 className="text-2xl text-center">Authentication</h1>
          <form className="w-full flex flex-col items-center gap-5" onSubmit={handleClientSubmit}>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="ClientID">ClientID</Label>
              <Input
                type="text"
                id="ClientID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full md:w-[60%] cursor-pointer" disabled={isLoading}>
              {isLoading ? "Loading..." : "Continue as Client"}
            </Button>
          </form>
          <div className="flex items-center w-full md:w-[60%] gap-2">
            <hr className="flex-grow border-gray-300" />
            <p className="text-center text-gray-500">Instead</p>
            <hr className="flex-grow border-gray-300" />
          </div>
          <Button onClick={(e) => handleAdminSubmit(e)} className="w-full md:w-[60%] bg-blue-600 hover:bg-blue-600/80  cursor-pointer">
            Continue as Admin
            <MoveRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
