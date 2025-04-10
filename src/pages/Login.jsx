import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import Illustration from "@/assets/illustration.svg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    window.location.assign("/api/auth/servicem8");

  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className=" w-full max-w-4xl h-auto md:h-[80%] rounded-lg flex flex-col md:flex-row -mt-[80px] md:mt-0 overflow-hidden">
        <div className="w-full md:w-[50%] h-64 md:h-full bg-white">
          <img
            src={Illustration}
            alt="Illustration"
            className="w-full h-full"
          />
        </div>
        <div className="w-full md:w-[50%] h-full flex flex-col items-center p-8 gap-5">
          <h1 className="text-2xl text-center">Authentication</h1>
          <form className="w-full flex flex-col items-center gap-5">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="ClientID">ClientID</Label>
              <Input
                type="text"
                id="ClientID"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="Password">Password</Label>
              <Input
                type="password"
                id="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full md:w-[60%] cursor-pointer">
              Continue as Client
            </Button>
          </form>
          <Button onClick={(e) => handleAdminSubmit(e)} className="w-full md:w-[60%] bg-purple-500 hover:bg-purple-500/80 cursor-pointer">
            Continue as Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
