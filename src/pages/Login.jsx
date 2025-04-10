import React, { useState } from "react";
import { NavLink } from "react-router-dom";

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
        <div className="w-[50%] h-full bg-blue-500"></div>
      </div>
    </div>
  );
};

export default LoginPage;
