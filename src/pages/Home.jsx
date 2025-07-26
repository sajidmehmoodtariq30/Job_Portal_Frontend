import React, { useState } from 'react';
import { Link } from "react-router-dom";
import DashboardImg from "@/assets/Dashboard.jpg"
import logo from "@/assets/logo.png"
import { Search, BellRing, FileText, Calendar, X, MapPin, User, Phone, Mail, Clock } from 'lucide-react';

export default function CustomerPortal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [jobs, setJobs] = useState([
    {
      id: 'JOB-2025-0423',
      title: 'Network Installation',
      status: 'In Progress',
      date: 'Apr 15, 2025',
      client: 'Acme Corp',
      type: 'Work Order',
      description: 'Complete network infrastructure installation for new office building including fiber optic cabling, switches, and wireless access points.',
      address: '123 Business Park Drive, Sydney NSW 2000',
      contactName: 'John Smith',
      contactEmail: 'john.smith@acmecorp.com',
      contactPhone: '+61 2 9876 5432',
      scheduledDate: 'Apr 18, 2025',
      workDescription: 'Installation of Cat6 cabling throughout 3 floors, configuration of network switches, and setup of enterprise-grade WiFi system.'
    },
    {
      id: 'JOB-2025-0422',
      title: 'Security System Upgrade',
      status: 'Quote',
      date: 'Apr 14, 2025',
      client: 'TechSolutions Inc',
      type: 'Quote',
      description: 'Upgrade existing security system with modern IP cameras, access control, and monitoring capabilities.',
      address: '456 Technology Street, Melbourne VIC 3000',
      contactName: 'Sarah Johnson',
      contactEmail: 'sarah.johnson@techsolutions.com',
      contactPhone: '+61 3 8765 4321',
      workDescription: 'Replace 12 analog cameras with 4K IP cameras, install new access control system, and integrate with existing alarm system.'
    },
    {
      id: 'JOB-2025-0418',
      title: 'Digital Signage Installation',
      status: 'Completed',
      date: 'Apr 10, 2025',
      client: 'Modern Retail',
      type: 'Work Order',
      description: 'Installation of digital signage displays throughout retail store for advertising and customer information.',
      address: '789 Shopping Center, Brisbane QLD 4000',
      contactName: 'Mike Wilson',
      contactEmail: 'mike.wilson@modernretail.com',
      contactPhone: '+61 7 7654 3210',
      completedDate: 'Apr 12, 2025',
      workDescription: 'Installed 8 digital displays, configured content management system, and provided staff training on system operation.'
    },
    {
      id: 'JOB-2025-0415',
      title: 'Surveillance System Maintenance',
      status: 'Scheduled',
      date: 'Apr 20, 2025',
      client: 'City Bank',
      type: 'Work Order',
      description: 'Routine maintenance and inspection of surveillance system including camera cleaning and software updates.',
      address: '321 Financial District, Perth WA 6000',
      contactName: 'Lisa Chen',
      contactEmail: 'lisa.chen@citybank.com',
      contactPhone: '+61 8 6543 2109',
      scheduledDate: 'Apr 22, 2025',
      workDescription: 'Comprehensive system check, camera lens cleaning, software updates, and backup verification.'
    }
  ]);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-600';
      case 'Quote': return 'bg-gray-700';
      case 'Completed': return 'bg-green-600';
      case 'Scheduled': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setTimeout(() => setIsModalAnimating(true), 10);
  };

  const closeJobModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedJob(null);
    }, 300);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full text-white" style={{ backgroundColor: 'var(--color-gray-900)' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center w-full">
            <div className="w-full md:w-1/2 mb-8 md:mb-0 pr-0 md:pr-8">
              <div className="flex items-center space-x-4 mb-8">
                <h1 className="text-2xl font-bold">Commercial Electricians Australia</h1>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">National Leader in Electrical Solutions</h2>
              <p className="text-lg text-gray-300 mb-8">
                Founded in 2011, we specialize in commercial, retail, and medical fitouts and maintenance across Australia.
                Track your services, get quotes, and manage projects through our secure client portal.
              </p>
              <div className="flex justify-start">
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out font-medium"
                >
                  Access Client Portal
                  <Search className="ml-2" size={20} />
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <img
                src={DashboardImg}
                alt="Client Portal Dashboard"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Stay Updated Stay Organised</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-gray-50">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <BellRing className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Get instant notifications about your service requests and project status changes.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <FileText className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Digital Documentation</h3>
              <p className="text-gray-600">Access all your quotes, invoices, and project documentation in one secure place.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Schedule Management</h3>
              <p className="text-gray-600">View and manage upcoming appointments and maintenance schedules.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs Section */}
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
                <Search size={16} />
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
                        <button
                          onClick={() => openJobModal(job)}
                          className="self-end flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View details <Search size={16} />
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
                          <button
                            onClick={() => openJobModal(job)}
                            className="flex items-center justify-end space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-200"
                          >
                            <span>Details</span>
                            <Search size={16} />
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
              <Search size={18} className="mr-2" />
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
          </div
          >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 shadow-md transition duration-300 hover:shadow-lg border border-gray-100">
              <div className="mb-6 w-full flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <svg width="60" height="60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="160" height="160" x="20" y="20" rx="10" fill="none" stroke="black" strokeWidth="6" />
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
                    <circle cx="100" cy="100" r="80" fill="none" stroke="black" strokeWidth="6" />
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
                    <path d="M40,60 L160,60 L160,160 L40,160 Z" fill="none" stroke="black" strokeWidth="6" />
                    <path d="M70,30 L190,30 L190,130 L170,130 L170,50 L70,50 Z" fill="#e5e5e5" stroke="black" strokeWidth="6" />
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
      <section className="w-full text-white py-16" style={{ backgroundColor: 'var(--color-gray-900)' }}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-lg text-gray-300 mb-6">Log in to access your complete job history, approve quotes, and communicate with our team directly.</p>
              <Link to="/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out shadow-md">
                <Search size={18} className="mr-2" />
                <span className="font-medium">Login to Your Account</span>
              </Link>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <img src={DashboardImg} alt="Dashboard preview" className="rounded-lg shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Job Details Modal */}
      {isModalOpen && selectedJob && (
        <div
          className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ease-out flex items-center justify-center z-50 p-4 ${isModalAnimating ? 'bg-black/20' : 'bg-black/0'
            }`}
          onClick={closeJobModal}
        >
          <div
            className={`bg-white/95 backdrop-blur-md rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl border border-white/20 transform transition-all duration-300 ease-out ${isModalAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto max-h-[80vh]">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 z-10">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedJob.id}</h2>
                      <p className="text-gray-600 text-sm">{selectedJob.title}</p>
                    </div>
                    <span className={`${getStatusColor(selectedJob.status)} px-3 py-1 rounded-full text-white text-xs font-semibold`}>
                      {selectedJob.status}
                    </span>
                  </div>
                  <button
                    onClick={closeJobModal}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-all duration-200"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Job Information */}
                  <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-200/50">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                      <FileText className="w-4 h-4 text-blue-600 mr-2" />
                      Job Information
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white/70 rounded-md p-3 border border-gray-100/50">
                        <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                        <p className="mt-1 text-sm text-gray-800">{selectedJob.description}</p>
                      </div>
                      <div className="bg-white/70 rounded-md p-3 border border-gray-100/50">
                        <label className="text-xs font-medium text-gray-500 uppercase">Created Date</label>
                        <p className="mt-1 flex items-center text-sm text-gray-800">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          {formatDate(selectedJob.date)}
                        </p>
                      </div>
                      {selectedJob.scheduledDate && (
                        <div className="bg-white/70 rounded-md p-3 border border-gray-100/50">
                          <label className="text-xs font-medium text-gray-500 uppercase">Scheduled Date</label>
                          <p className="mt-1 flex items-center text-sm text-gray-800">
                            <Clock className="w-4 h-4 mr-2 text-purple-500" />
                            {formatDate(selectedJob.scheduledDate)}
                          </p>
                        </div>
                      )}
                      {selectedJob.completedDate && (
                        <div className="bg-white/70 rounded-md p-3 border border-gray-100/50">
                          <label className="text-xs font-medium text-gray-500 uppercase">Completed Date</label>
                          <p className="mt-1 flex items-center text-sm text-gray-800">
                            <Calendar className="w-4 h-4 mr-2 text-green-500" />
                            {formatDate(selectedJob.completedDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location & Contact */}
                  <div className="bg-gray-50/80 rounded-lg p-4 border border-gray-200/50">
                    <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                      <MapPin className="w-4 h-4 text-green-600 mr-2" />
                      Location & Contact
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white/70 rounded-md p-3 border border-gray-100/50">
                        <label className="text-xs font-medium text-gray-500 uppercase">Job Address</label>
                        <p className="mt-1 flex items-start text-sm text-gray-800">
                          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-red-500" />
                          {selectedJob.address}
                        </p>
                      </div>
                      <div className="bg-white/70 rounded-md p-3 border border-gray-100/50">
                        <label className="text-xs font-medium text-gray-500 uppercase">Contact Name</label>
                        <p className="mt-1 flex items-center text-sm text-gray-800">
                          <User className="w-4 h-4 mr-2 text-blue-500" />
                          {selectedJob.contactName}
                        </p>
                      </div>
                      <div className="bg-white/70 rounded-md p-3 border border-gray-100/50">
                        <label className="text-xs font-medium text-gray-500 uppercase">Contact Email</label>
                        <p className="mt-1 flex items-center text-sm text-gray-800">
                          <Mail className="w-4 h-4 mr-2 text-orange-500" />
                          <a href={`mailto:${selectedJob.contactEmail}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                            {selectedJob.contactEmail}
                          </a>
                        </p>
                      </div>
                      <div className="bg-white/70 rounded-md p-3 border border-gray-100/50">
                        <label className="text-xs font-medium text-gray-500 uppercase">Contact Phone</label>
                        <p className="mt-1 flex items-center text-sm text-gray-800">
                          <Phone className="w-4 h-4 mr-2 text-green-500" />
                          <a href={`tel:${selectedJob.contactPhone}`} className="text-blue-600 hover:text-blue-800 hover:underline">
                            {selectedJob.contactPhone}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Demo Notice */}
                <div className="bg-amber-50/80 border border-amber-200/50 rounded-lg p-3">
                  <div className="flex items-center">
                    <BellRing className="w-4 h-4 text-amber-600 mr-2" />
                    <p className="text-sm text-amber-700">
                      Demo data - <Link to="/login" className="font-medium underline hover:no-underline">Login</Link> for real job details
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-200/50 p-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Job ID: <span className="font-mono font-medium text-gray-700">{selectedJob.id}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={closeJobModal}
                      className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
                    >
                      Close
                    </button>
                    <Link
                      to="/login"
                      className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200"
                    >
                      Access Portal
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}