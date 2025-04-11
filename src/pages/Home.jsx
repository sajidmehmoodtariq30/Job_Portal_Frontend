import React, { useState } from 'react';
import { Link } from "react-router-dom";
import DashboardImg from "@/assets/Dashboard.jpg"
import { Search, CheckCircle, Calendar, Briefcase, Clock, Filter, ChevronRight, User, Lock, BellRing, FileText, Settings } from 'lucide-react';

export default function CustomerPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([
    {
      id: 'JOB-2025-0423',
      title: 'Network Installation',
      status: 'In Progress',
      date: 'Apr 15, 2025',
      client: 'Acme Corp',
      type: 'Work Order'
    },
    {
      id: 'JOB-2025-0422',
      title: 'Security System Upgrade',
      status: 'Quote',
      date: 'Apr 14, 2025',
      client: 'TechSolutions Inc',
      type: 'Quote'
    },
    {
      id: 'JOB-2025-0418',
      title: 'Digital Signage Installation',
      status: 'Completed',
      date: 'Apr 10, 2025',
      client: 'Modern Retail',
      type: 'Work Order'
    },
    {
      id: 'JOB-2025-0415',
      title: 'Surveillance System Maintenance',
      status: 'Scheduled',
      date: 'Apr 20, 2025',
      client: 'City Bank',
      type: 'Work Order'
    }
  ]);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-600';
      case 'Quote': return 'bg-gray-700';
      case 'Completed': return 'bg-green-600';
      case 'Scheduled': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="h-full w-full flex flex-col min-h-screen bg-gray-50 text-gray-900">
      
      {/* Main Content */}
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="w-full bg-gradient-to-b from-gray-900/90 to-gray-800/80 text-white">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="flex flex-col md:flex-row items-center w-full">
              <div className="w-full md:w-1/2 mb-8 md:mb-0 pr-0 md:pr-8">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">Track Your Services with Confidence</h2>
                <p className="text-lg text-gray-300 mb-8">Real-time updates on your service requests, quotes, and project statuses in one secure portal.</p>
                <div className="w-full relative">
                  <div className="flex w-full">
                    <div className="relative flex-grow w-full">
                      <input
                        type="text"
                        placeholder="Search by job ID, title, or client..."
                        className="w-full p-4 border-2 text-white border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute right-3 top-4 text-gray-500" size={20} />
                    </div>
                    <button className="bg-blue-600 text-white p-4 rounded-r-lg hover:bg-blue-700 transition duration-200 ease-in-out font-medium">
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <svg className="w-full max-w-md" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
                  <rect width="600" height="400" x="100" y="100" rx="20" fill="#1a1a1a" stroke="white" strokeWidth="4"/>
                  <rect width="550" height="80" x="125" y="130" rx="10" fill="#0f0f0f" />
                  <rect width="550" height="60" x="125" y="230" rx="10" fill="#2a2a2a" />
                  <rect width="550" height="60" x="125" y="310" rx="10" fill="#2a2a2a" />
                  <rect width="550" height="60" x="125" y="390" rx="10" fill="#2a2a2a" />
                  <circle cx="155" cy="170" r="12" fill="white" />
                  <circle cx="195" cy="170" r="12" fill="white" />
                  <circle cx="235" cy="170" r="12" fill="white" />
                  <rect width="300" height="15" x="125" y="260" rx="5" fill="#4a4a4a" />
                  <rect width="150" height="15" x="125" y="340" rx="5" fill="#4a4a4a" />
                  <rect width="200" height="15" x="125" y="420" rx="5" fill="#4a4a4a" />
                  <circle cx="650" cy="260" r="15" fill="#3b82f6" />
                  <circle cx="650" cy="340" r="15" fill="#7c3aed" />
                  <circle cx="650" cy="420" r="15" fill="#10b981" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="w-full bg-white shadow">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center p-4 border-r border-gray-200">
                <div className="text-2xl font-bold">245+</div>
                <div className="text-sm text-gray-500">Active Jobs</div>
              </div>
              <div className="flex flex-col items-center p-4 border-r border-gray-200">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-gray-500">Satisfaction Rate</div>
              </div>
              <div className="flex flex-col items-center p-4 border-r border-gray-200">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-gray-500">Support</div>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="text-2xl font-bold">15+</div>
                <div className="text-sm text-gray-500">Years Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* Job List Section */}
        <section className="w-full py-12">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Recent Jobs</h2>
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <span>Sort by:</span>
                  <select className="border border-gray-300 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
                    <option>Date (Newest)</option>
                    <option>Date (Oldest)</option>
                    <option>Status</option>
                  </select>
                </div>
                <button className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100 transition duration-200">
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
              </div>
            </div>
            
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
              {filteredJobs.length > 0 ? (
                <div>
                  {/* Table header (desktop) */}
                  <div className="hidden md:grid grid-cols-12 bg-gray-100 text-sm font-medium p-4">
                    <div className="col-span-2">Job ID</div>
                    <div className="col-span-3">Title</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Client</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {/* Job list items */}
                  <div className="divide-y divide-gray-200">
                    {filteredJobs.map((job) => (
                      <div key={job.id} className="hover:bg-gray-50 transition duration-150">
                        {/* Mobile view */}
                        <div className="md:hidden p-4 flex flex-col space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-lg">{job.title}</span>
                            <span className={`${getStatusColor(job.status)} px-3 py-1 rounded-full text-white text-xs font-medium`}>
                              {job.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{job.id}</div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar size={14} />
                              <span>{job.date}</span>
                            </div>
                            <div>{job.client}</div>
                          </div>
                          <button className="self-end flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                            View details <ChevronRight size={16} />
                          </button>
                        </div>
                        
                        {/* Desktop view */}
                        <div className="hidden md:grid grid-cols-12 items-center p-4">
                          <div className="col-span-2 font-medium">{job.id}</div>
                          <div className="col-span-3">{job.title}</div>
                          <div className="col-span-2">
                            <span className={`${getStatusColor(job.status)} px-3 py-1 rounded-full text-white text-xs font-medium`}>
                              {job.status}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center space-x-2">
                            <Calendar size={14} />
                            <span>{job.date}</span>
                          </div>
                          <div className="col-span-2">{job.client}</div>
                          <div className="col-span-1 text-right">
                            <button className="flex items-center justify-end space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-200">
                              <span>Details</span>
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <Search size={64} className="text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No jobs found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition duration-200 ease-in-out shadow-md">
                <Lock size={18} className="mr-2" />
                <span className="font-medium">Login to view complete job history</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full bg-white py-16">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Portal Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our customer portal provides powerful tools to help you manage your IT services efficiently.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-xl p-8 shadow-md transition duration-300 hover:shadow-lg border border-gray-100">
                <div className="mb-6 w-full flex justify-center">
                  <div className="bg-blue-100 p-4 rounded-full">
                    <svg width="60" height="60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="160" height="160" x="20" y="20" rx="10" fill="none" stroke="black" strokeWidth="6"/>
                      <rect width="140" height="30" x="30" y="40" rx="4" fill="#0f0f0f" />
                      <rect width="140" height="20" x="30" y="80" rx="4" fill="#e5e5e5" />
                      <rect width="140" height="20" x="30" y="110" rx="4" fill="#e5e5e5" />
                      <rect width="140" height="20" x="30" y="140" rx="4" fill="#e5e5e5" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Job Tracking</h3>
                <p className="text-gray-600 text-center">Monitor jobs from initial quote to final completion with real-time status updates and notifications.</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-8 shadow-md transition duration-300 hover:shadow-lg border border-gray-100">
                <div className="mb-6 w-full flex justify-center">
                  <div className="bg-green-100 p-4 rounded-full">
                    <svg width="60" height="60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="100" cy="100" r="80" fill="none" stroke="black" strokeWidth="6"/>
                      <rect width="60" height="80" x="70" y="60" rx="4" fill="#0f0f0f" />
                      <rect width="4" height="40" x="100" y="40" fill="#0f0f0f" />
                      <rect width="40" height="4" x="100" y="100" transform="rotate(45, 100, 100)" fill="white" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">Notifications</h3>
                <p className="text-gray-600 text-center">Stay informed with automatic alerts for job updates, quote approvals, and scheduled service visits.</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-8 shadow-md transition duration-300 hover:shadow-lg border border-gray-100">
                <div className="mb-6 w-full flex justify-center">
                  <div className="bg-purple-100 p-4 rounded-full">
                    <svg width="60" height="60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40,60 L160,60 L160,160 L40,160 Z" fill="none" stroke="black" strokeWidth="6"/>
                      <path d="M70,30 L190,30 L190,130 L170,130 L170,50 L70,50 Z" fill="#e5e5e5" stroke="black" strokeWidth="6"/>
                      <rect width="80" height="10" x="60" y="80" rx="2" fill="#0f0f0f" />
                      <rect width="60" height="10" x="60" y="100" rx="2" fill="#0f0f0f" />
                      <rect width="80" height="10" x="60" y="120" rx="2" fill="#0f0f0f" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">File Management</h3>
                <p className="text-gray-600 text-center">Securely upload, download, and share documents related to your projects with our encrypted file system.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full bg-gray-900 text-white py-16">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="w-full md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-lg text-gray-300 mb-6">Log in to access your complete job history, approve quotes, and communicate with our team directly.</p>
                <Link to="/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-md">
                  <User size={18} className="mr-2" />
                  <span className="font-medium">Login to Your Account</span>
                </Link>
              </div>
              <div className="w-full md:w-1/2 flex justify-center">
                <img src={DashboardImg} alt="Dashboard preview" className="rounded-lg shadow-2xl" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-black text-white py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase size={24} />
                <span className="font-bold text-xl">MH IT Solutions</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">Providing integrated IT solutions for businesses with a focus on security, reliability, and customer satisfaction.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.88 2.08H7.14c-3.73 0-5.04 1.31-5.04 5.04v9.94c0 3.73 1.31 5.04 5.04 5.04h9.96c3.73 0 5.04-1.31 5.04-5.04V7.02c0-3.73-1.31-4.94-5.18-4.94zM12 5.68a6.3 6.3 0 0 1 6.3 6.3 6.3 6.3 0 0 1-6.3 6.3 6.3 6.3 0 0 1-6.3-6.3 6.3 6.3 0 0 1 6.3-6.3zm0 2.22a4.07 4.07 0 0 0-4.07 4.07 4.07 4.07 0 0 0 4.07 4.07 4.07 4.07 0 0 0 4.07-4.07 4.07 4.07 0 0 0-4.07-4.07z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Services</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition duration-200">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-start space-x-2">
                  <svg className="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span>123 Business Ave, Suite 100<br />Sydney, NSW 2000</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>+61 2 1234 5678</span>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>info@mhitsolutions.com</span>
                </li>
              </ul>
            </div>
            
          </div>
          <div className="mt-12 text-center text-gray-400 text-sm">
            &copy; 2025 MH IT Solutions. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}