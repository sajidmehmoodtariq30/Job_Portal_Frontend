import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

const SearchableJobSelect = ({ jobs, value, onValueChange, placeholder = "Select related job" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      job.job_description?.toLowerCase().includes(searchLower) ||
      job.uuid?.toLowerCase().includes(searchLower) ||
      job.generated_job_id?.toLowerCase().includes(searchLower)
    );
  });

  // Get selected job for display
  const selectedJob = jobs.find(job => job.uuid === value);

  // Handle selection
  const handleSelect = (job) => {
    onValueChange(job.uuid);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between text-left font-normal"
      >
        <span className="truncate">
          {selectedJob 
            ? `${selectedJob.job_description?.slice(0, 40)}... - ${selectedJob.uuid.slice(-6)}`
            : placeholder
          }
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search by description or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* Job List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job.uuid}
                  onClick={() => handleSelect(job)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                    value === job.uuid ? 'bg-blue-50 text-blue-900' : ''
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {job.job_description || 'No description'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>ID: {job.uuid.slice(-8)}</span>
                      {job.generated_job_id && (
                        <span>• Job ID: {job.generated_job_id}</span>
                      )}
                      {job.status && (
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          job.status === 'Quote' 
                            ? 'bg-blue-100 text-blue-800' 
                            : job.status === 'Work Order' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : job.status === 'In Progress'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-green-100 text-green-800'
                        }`}>
                          {job.status}
                        </span>
                      )}
                    </div>
                    {job.job_address && (
                      <div className="text-xs text-gray-400 truncate">
                        📍 {job.job_address}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? 'No jobs found matching your search' : 'No jobs available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableJobSelect;
