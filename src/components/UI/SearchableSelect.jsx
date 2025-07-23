import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Skeleton } from './skeleton';

const SearchableSelect = ({ 
  items = [], 
  value, 
  onValueChange, 
  placeholder = "Select an item...", 
  searchPlaceholder = "Search...",
  isLoading = false,
  allowClear = true,
  displayKey = 'name',
  valueKey = 'uuid',
  searchKeys = ['name'],
  renderItem = null,
  renderSelected = null,
  noItemsText = "No items available",
  noResultsText = "No items found matching your search",
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter items based on search term
  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return searchKeys.some(key => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });

  // Get selected item for display
  const selectedItem = items.find(item => item[valueKey] === value);

  // Handle selection
  const handleSelect = (item) => {
    // Don't allow selection of search prompt items or disabled items
    if (item.isSearchPrompt || item.disabled) {
      return;
    }
    
    onValueChange(item[valueKey]);
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

  // Default render functions
  const defaultRenderItem = (item) => (
    <div className="flex flex-col gap-1">
      <div className="text-sm font-medium text-gray-900">
        {item[displayKey] || 'Unnamed Item'}
      </div>
      {valueKey !== displayKey && (
        <div className="text-xs text-gray-500">
          ID: {item[valueKey]?.toString().slice(-8)}
        </div>
      )}
    </div>
  );

  const defaultRenderSelected = (item) => item[displayKey];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between text-left font-normal"
      >
        <span className="truncate">
          {selectedItem 
            ? (renderSelected ? renderSelected(selectedItem) : defaultRenderSelected(selectedItem))
            : placeholder
          }
        </span>
        <div className="flex items-center gap-2">
          {selectedItem && allowClear && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              title="Clear selection"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          {!disabled && (
            isOpen ? (
              <ChevronUp className="h-4 w-4 opacity-50" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )
          )}
        </div>
      </Button>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
          </div>          {/* Items List */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Clear option */}
                {allowClear && (
                  <div
                    onClick={() => handleClear({})}
                    className="p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-50 text-gray-500 italic"
                  >
                    No selection
                  </div>
                )}
                
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div
                      key={item[valueKey]}
                      onClick={() => handleSelect(item)}
                      className={`p-3 ${
                        item.isSearchPrompt || item.disabled 
                          ? 'text-gray-500 italic cursor-default' 
                          : 'cursor-pointer hover:bg-gray-50'
                      } border-b border-gray-50 last:border-b-0 ${
                        value === item[valueKey] ? 'bg-blue-50 text-blue-900' : ''
                      }`}
                    >
                      {renderItem ? renderItem(item) : defaultRenderItem(item)}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {searchTerm ? noResultsText : noItemsText}
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

export default SearchableSelect;
