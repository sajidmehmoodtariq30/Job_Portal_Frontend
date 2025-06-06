import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search,
  FileText,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from "../../components/UI/button";
import { Input } from "../../components/UI/input";
import { Textarea } from "../../components/UI/textarea";
import QuoteCard from "../../components/UI/client/QuoteCard";
import ClientQuoteFilters from "../../components/UI/client/ClientQuoteFilters";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/UI/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/UI/dialog";
import { Label } from "../../components/UI/label";
import SearchableJobSelect from "@/components/UI/SearchableJobSelect";
import PermissionGuard from "../../components/client/PermissionGuard";
import { useClientPermissions } from "@/hooks/useClientPermissions";
import { CLIENT_PERMISSIONS } from "../../types/clientPermissions";
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';

const ClientQuotes = () => {
  // Permission checking hook
  const { hasPermission } = useClientPermissions();
  
  // State for quotes data
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState({ id: null, action: null });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);  const [activeFilters, setActiveFilters] = useState({
    search: '',
    status: 'all',
    dateRange: 'all',
    amountRange: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: ''
  });
  const [filterLoading, setFilterLoading] = useState(false);
    // Loading states for quote actions
  const [loadingQuotes, setLoadingQuotes] = useState({});
  
  // Quote creation states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [newQuote, setNewQuote] = useState({
    jobId: '',
    title: '',
    description: '',
    items: [{ description: '', quantity: 1, price: 0 }]
  });
  
  // Get client ID from localStorage
  const clientId = localStorage.getItem('client_id');
  
  // Load quotes data
  useEffect(() => {
    if (clientId) {
      fetchQuotes();
    } else {
      setError('Client ID not found. Please log in again.');
      setLoading(false);
    }
  }, [clientId]);

  // Sync search query with activeFilters.search
  useEffect(() => {
    if (activeFilters.search !== searchQuery) {
      setSearchQuery(activeFilters.search || '');
    }
  }, [activeFilters.search]);
  
  // Fetch quotes from API
  const fetchQuotes = async () => {
    if (!clientId) {
      setError('Client ID not found. Please log in again.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/quotes?clientId=${clientId}`);
      setQuotes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Failed to load quotes. Please try again later.');
    } finally {
      setLoading(false);
    }  };
    // Fetch jobs for quote creation
  const fetchJobs = async () => {
    if (!clientId) return;
    
    setJobsLoading(true);
    try {
      // Fetch jobs for this specific client
      const response = await axios.get(`${API_URL}/fetch/jobs/client/${clientId}`);
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs for quote creation.');
    } finally {
      setJobsLoading(false);
    }
  };

  // Handle job selection for new quote
  const handleJobChange = (jobId) => {
    const selectedJob = jobs.find(job => job.uuid === jobId);
    
    if (selectedJob) {
      setNewQuote({
        ...newQuote,
        jobId: jobId,
        title: `Quote for ${selectedJob.job_description || 'Job'}`,
        description: selectedJob.job_description || ''
      });
    }
  };

  // Handle input changes for new quote form
  const handleQuoteInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuote({ ...newQuote, [name]: value });
  };

  // Handle line item changes
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...newQuote.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewQuote({ ...newQuote, items: updatedItems });
  };

  // Add new line item
  const handleAddLineItem = () => {
    setNewQuote({
      ...newQuote,
      items: [...newQuote.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  // Remove line item
  const handleRemoveLineItem = (index) => {
    if (newQuote.items.length > 1) {
      const updatedItems = newQuote.items.filter((_, i) => i !== index);
      setNewQuote({ ...newQuote, items: updatedItems });
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return newQuote.items.reduce((total, item) => {
      return total + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
    }, 0).toFixed(2);
  };

  // Handle quote creation submission
  const handleCreateQuote = async (e) => {
    e.preventDefault();
    
    if (!newQuote.jobId || !newQuote.title) {
      setError('Please select a job and provide a title for the quote.');
      return;
    }

    setLoading(true);
    try {      const quoteData = {
        ...newQuote,
        clientId,
        price: calculateTotal(),
        status: 'Pending'
      };

      await axios.post(`${API_URL}/api/quotes`, quoteData);
      
      setSuccess('Quote request submitted successfully!');
      setShowCreateDialog(false);
      setNewQuote({
        jobId: '',
        title: '',
        description: '',
        items: [{ description: '', quantity: 1, price: 0 }]
      });
      
      // Refresh quotes list
      await fetchQuotes();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error creating quote:', error);
      setError(`Failed to create quote: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open create quote dialog and fetch jobs
  const openCreateDialog = () => {
    setShowCreateDialog(true);
    fetchJobs();
  };

  // Handle filter changes from ClientQuoteFilters component
  const handleFiltersChange = async (newFilters) => {
    setActiveFilters(newFilters);
    setFilterLoading(true);
    
    try {
      // Update search query if it's part of the filters
      if (newFilters.search !== undefined) {
        setSearchQuery(newFilters.search);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setFilterLoading(false);
    }
  };
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };  // Get count of active filters
  const getActiveFiltersCount = () => {
    return Object.entries(activeFilters).filter(([key, value]) => 
      value && value !== '' && value !== 'all'
    ).length;
  };// Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      dateRange: 'all',
      amountRange: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: ''
    };
    // Use handleFiltersChange to properly sync with ClientQuoteFilters component
    handleFiltersChange(clearedFilters);
  };
  
  // Enhanced filter function for quotes
  const filteredQuotes = quotes.filter(quote => {
    // Search filter (from both searchQuery and activeFilters.search)
    const searchTerm = activeFilters.search || searchQuery;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = (
        (quote.id && quote.id.toLowerCase().includes(searchLower)) ||
        (quote.title && quote.title.toLowerCase().includes(searchLower)) ||
        (quote.description && quote.description.toLowerCase().includes(searchLower)) ||
        (quote.status && quote.status.toLowerCase().includes(searchLower))
      );
      if (!matchesSearch) return false;
    }    // Status filter
    if (activeFilters.status && activeFilters.status !== 'all' && quote.status !== activeFilters.status) {
      return false;
    }
      // Date range filter
    if (activeFilters.dateFrom && activeFilters.dateFrom !== '') {
      const quoteDate = new Date(quote.createdAt || quote.date);
      const fromDate = new Date(activeFilters.dateFrom);
      if (quoteDate < fromDate) return false;
    }
    
    if (activeFilters.dateTo && activeFilters.dateTo !== '') {
      const quoteDate = new Date(quote.createdAt || quote.date);
      const toDate = new Date(activeFilters.dateTo);
      if (quoteDate > toDate) return false;
    }
    
    // Amount range filter
    if (activeFilters.amountMin !== undefined && activeFilters.amountMin !== '' && activeFilters.amountMin !== null) {
      const quoteAmount = parseFloat(quote.price) || 0;
      if (quoteAmount < parseFloat(activeFilters.amountMin)) return false;
    }
    
    if (activeFilters.amountMax !== undefined && activeFilters.amountMax !== '' && activeFilters.amountMax !== null) {
      const quoteAmount = parseFloat(quote.price) || 0;
      if (quoteAmount > parseFloat(activeFilters.amountMax)) return false;
    }
    
    return true;
  });
  
  // Filter quotes based on search query (legacy support - now using enhanced filtering above)
  // const filteredQuotes = quotes.filter(quote => 
  //   quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   quote.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   quote.description.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  
  // Status color function
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-amber-500 text-white';
      case 'Accepted': return 'bg-green-600 text-white';
      case 'Rejected': return 'bg-red-600 text-white';
      case 'Expired': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
    // Handle quote actions with confirmation
  const handleQuoteAction = (quoteId, action) => {
    // Check permissions before allowing action
    if (action === 'Accept' && !hasPermission(CLIENT_PERMISSIONS.QUOTES_ACCEPT)) {
      setError('You do not have permission to accept quotes.');
      return;
    }
    
    if (action === 'Reject' && !hasPermission(CLIENT_PERMISSIONS.QUOTES_REJECT)) {
      setError('You do not have permission to reject quotes.');
      return;
    }
    
    setSelectedAction({ id: quoteId, action });
    
    if (action === 'Reject') {
      setRejectionReason('');
      setShowRejectionDialog(true);
    } else {
      setShowDialog(true);
    }
  };
    // Confirm quote action
  const confirmQuoteAction = async () => {
    setError(null);
    setSuccess(null);
    
    // Set loading state for this specific quote
    setLoadingQuotes(prev => ({ ...prev, [selectedAction.id]: selectedAction.action }));
    
    try {
      if (selectedAction.action === 'Accept') {
        await axios.post(`${API_URL}/api/quotes/${selectedAction.id}/accept`, {
          userId: clientId
        });
        
        setSuccess('Quote accepted successfully. The provider will be notified.');
      } else {
        // Close the confirmation dialog immediately, rejection will be handled in handleConfirmRejection
        setShowDialog(false);
        setLoadingQuotes(prev => ({ ...prev, [selectedAction.id]: false }));
        return;
      }
      
      // Refresh quotes list
      await fetchQuotes();
      
      // Close dialog
      setShowDialog(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error processing quote action:', error);
      setError(`Failed to ${selectedAction.action.toLowerCase()} quote: ${error.response?.data?.message || error.message}`);
    } finally {
      // Clear loading state for this quote
      setLoadingQuotes(prev => ({ ...prev, [selectedAction.id]: false }));
    }
  };
    // Handle rejection confirmation
  const handleConfirmRejection = async () => {
    setError(null);
    setSuccess(null);
    
    // Set loading state for this specific quote
    setLoadingQuotes(prev => ({ ...prev, [selectedAction.id]: 'Reject' }));
    
    try {
      await axios.post(`${API_URL}/api/quotes/${selectedAction.id}/reject`, {
        userId: clientId,
        rejectionReason: rejectionReason || 'No reason provided'
      });
      
      setSuccess('Quote rejected successfully. The provider will be notified.');
      
      // Refresh quotes list
      await fetchQuotes();
      
      // Close dialogs
      setShowRejectionDialog(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error rejecting quote:', error);
      setError(`Failed to reject quote: ${error.response?.data?.message || error.message}`);
    } finally {
      // Clear loading state for this quote
      setLoadingQuotes(prev => ({ ...prev, [selectedAction.id]: false }));
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setError(null);
    setSuccess(null);
    await fetchQuotes();
    setSuccess('Quotes refreshed successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quotes</h1>
        <p className="text-lg mt-1">View and manage quotes for your services</p>
      </div>
      
      {/* Status messages */}
      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md flex items-start gap-2 border border-red-200">
          <AlertCircle size={18} className="mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 text-green-800 rounded-md flex items-start gap-2 border border-green-200">
          <CheckCircle size={18} className="mt-0.5" />
          <p>{success}</p>
        </div>
      )}
  
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search quotes by ID, title, or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>        <div className="flex gap-2 w-full md:w-auto">
          <PermissionGuard permission={CLIENT_PERMISSIONS.QUOTES_REQUEST}>
            <Button 
              onClick={openCreateDialog}
              className="flex items-center gap-2"
            >
              <FileText size={16} />
              Create Quote
            </Button>
          </PermissionGuard>
          <Button 
            variant="outline" 
            onClick={toggleFilters}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      {showFilters && (
        <div className="mt-4">
          <ClientQuoteFilters
            onFiltersChange={handleFiltersChange}
            currentFilters={activeFilters}
            className="mb-4"
            showSavedFilters={true}
          />
        </div>
      )}
        {/* Quote List */}
      <PermissionGuard
        permission={CLIENT_PERMISSIONS.QUOTES_VIEW}
        fallback={
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <XCircle size={48} className="text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-gray-600">Access Restricted</h3>
            <p className="text-gray-500 text-center max-w-md">
              You do not have permission to view quotes. Please contact your administrator to request access to quote management features.
            </p>
          </div>
        }
      >
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-muted rounded col-span-2"></div>
                      <div className="h-2 bg-muted rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : filteredQuotes.length > 0 ? (
            <div className="space-y-4">
              {filteredQuotes.map(quote => (
                <QuoteCard 
                  key={quote.id} 
                  quote={{
                    id: quote.id,
                    title: quote.title,
                    description: quote.description,
                    date: formatDate(quote.createdAt),
                    price: formatCurrency(quote.price),
                    status: quote.status,
                    location: quote.location,
                    attachments: quote.attachments?.length || 0,
                    expiryDate: formatDate(quote.expiryDate),
                    acceptedDate: quote.acceptedAt ? formatDate(quote.acceptedAt) : null,
                    rejectedDate: quote.rejectedAt ? formatDate(quote.rejectedAt) : null
                  }}
                  onQuoteAction={handleQuoteAction}
                  statusColor={getStatusColor}
                  loadingQuotes={loadingQuotes}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No quotes found</h3>
              <p className="text-muted-foreground">
                {getActiveFiltersCount() > 0 
                  ? "No quotes match your current filters. Try adjusting your search criteria."
                  : "Try adjusting your search or contact your service provider for a quote"
                }
              </p>
              {getActiveFiltersCount() > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </PermissionGuard>

      {/* Create Quote Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quote Request</DialogTitle>
            <DialogDescription>
              Submit a quote request for one of your jobs
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateQuote} className="space-y-6 my-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Selection */}
              <div className="space-y-2">
                <Label htmlFor="jobId" className="font-medium">
                  Select Job <span className="text-red-500">*</span>
                </Label>
                <SearchableJobSelect
                  jobs={jobs}
                  value={newQuote.jobId}
                  onValueChange={handleJobChange}
                  placeholder="Search and select a job..."
                  isLoading={jobsLoading}
                />
              </div>

              {/* Quote Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-medium">
                  Quote Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={newQuote.title}
                  onChange={handleQuoteInputChange}
                  placeholder="Brief description of what you need quoted"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newQuote.description}
                onChange={handleQuoteInputChange}
                placeholder="Detailed description of the work required..."
                rows={3}
              />
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-medium">Quote Items</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddLineItem}
                >
                  Add Item
                </Button>
              </div>
              
              {newQuote.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md">
                  <div className="md:col-span-2">
                    <Label htmlFor={`item-desc-${index}`} className="text-sm">Item Description</Label>
                    <Input
                      id={`item-desc-${index}`}
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      placeholder="Description of item/service"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`item-qty-${index}`} className="text-sm">Quantity</Label>
                    <Input
                      id={`item-qty-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`item-price-${index}`} className="text-sm">Estimated Price</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => handleLineItemChange(index, 'price', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    {newQuote.items.length > 1 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveLineItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Total */}
              <div className="flex justify-end">
                <div className="text-lg font-semibold">
                  Estimated Total: ${calculateTotal()}
                </div>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateQuote}
              disabled={loading || !newQuote.jobId || !newQuote.title}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Submit Quote Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedAction.action === 'Accept' ? 'Accept Quote' : 'Reject Quote'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction.action === 'Accept' 
                ? 'Are you sure you want to accept this quote? This will notify our team to proceed with the work.'
                : 'Are you sure you want to reject this quote? If you have feedback, please consider adding a note.'}
            </AlertDialogDescription>
          </AlertDialogHeader>          <AlertDialogFooter>
            <AlertDialogCancel disabled={selectedAction?.id && loadingQuotes[selectedAction.id]}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmQuoteAction}
              disabled={selectedAction?.id && loadingQuotes[selectedAction.id]}
            >
              {selectedAction?.id && loadingQuotes[selectedAction.id] === 'Accept' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Accepting...
                </>
              ) : (
                selectedAction?.action === 'Accept' ? 'Accept' : 'Reject'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Rejection Reason Dialog */}
      <AlertDialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this quote to help the service provider understand your decision.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Optional: Provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>          <AlertDialogFooter>
            <AlertDialogCancel disabled={selectedAction?.id && loadingQuotes[selectedAction.id]}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRejection}
              disabled={selectedAction?.id && loadingQuotes[selectedAction.id]}
            >
              {selectedAction?.id && loadingQuotes[selectedAction.id] === 'Reject' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting...
                </>
              ) : (
                'Reject Quote'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientQuotes;