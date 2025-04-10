import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/UI/button"
import { Input } from "@/components/UI/input"
import { Label } from "@/components/UI/label"

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here (e.g., API call)
    console.log("Logging in with:", { email, password });
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[70%] h-[80%] bg-amber-900 rounded-lg flex overflow-hidden">
        <div className="w-[50%] h-full bg-amber-500"></div>
        <div className="w-[50%] h-full bg-blue-500">
          <h1>Authentication</h1>
          <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
    <Button>Button</Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
