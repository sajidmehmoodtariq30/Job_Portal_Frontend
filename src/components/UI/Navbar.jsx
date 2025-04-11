import React from "react";
import { Link } from "react-router-dom";
import { Search, CheckCircle, Calendar, Briefcase, Clock, Filter, ChevronRight, User, Lock, BellRing, FileText, Settings } from 'lucide-react';


const Navbar = () => {
  return (
    <header className="w-full bg-white shadow-lg text-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Briefcase className="text-[#d6d6d6]" size={24} />
          <h1 className="text-xl text-black font-bold">Job Portal</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-md hover:bg-gray-100 transition duration-200 ease-in-out shadow-sm"
          >
            <User size={18} />
            <span className="font-medium">Get Started</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
