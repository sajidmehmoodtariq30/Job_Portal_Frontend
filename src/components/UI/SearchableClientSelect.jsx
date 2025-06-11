import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

const SearchableClientSelect = ({ clients, value, onValueChange, placeholder = "Select a client...", isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.uuid?.toLowerCase().includes(searchLower)
    );
  });

  // Get selected client for display
  const selectedClient = clients.find(client => client.uuid === value);

  // Handle selection
  const handleSelect = (client) => {
    onValueChange(client.uuid);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onValueChange('');
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
          {selectedClient 
            ? selectedClient.name
            : placeholder
          }
        </span>
        <div className="flex items-center gap-2">
          {selectedClient && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Clear selection"
            >
              ×
            </button>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 opacity-50" />
          ) : (
            <ChevronDown className="h-4 w-4 opacity-50" />
          )}
        </div>
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
                placeholder="Search by client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>

          {/* Client List */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Loading clients...
                </div>
              </div>
            ) : (
              <>
                {/* Clear option */}
                <div
                  onClick={() => handleClear({})}
                  className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 text-gray-500 italic"
                >
                  No client selected
                </div>
                
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <div
                      key={client.uuid}
                      onClick={() => handleSelect(client)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                        value === client.uuid ? 'bg-blue-50 text-blue-900' : ''
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-gray-900">
                          {client.name || 'Unnamed Client'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {client.uuid.slice(-8)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {searchTerm ? 'No clients found matching your search' : 'No clients available'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableClientSelect;
