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
    <div>
      <div className="wrapper flex items-center justify-center">
        <div className="bg-[#0F0D23] shadow-lg rounded-lg p-8 max-w-md w-full ">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="placeholder:text-white w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-white">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="placeholder:text-white w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white font-semibold py-2 rounded-lg transition duration-300"
            >
              Login
            </button>
          </form>
          <p className="text-gray-600 text-center mt-4">
            Don't have an account? <NavLink to="/signup" className="text-white hover:underline">Sign Up</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
