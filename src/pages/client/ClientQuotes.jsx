import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search,
  FileText,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from "../../components/UI/button";
import { Input } from "../../components/UI/input";
import { Textarea } from "../../components/UI/textarea";
import QuoteCard from "../../components/UI/client/QuoteCard";
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
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';

const ClientQuotes = () => {
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
    }
  };
  
  // Filter quotes based on search query
  const filteredQuotes = quotes.filter(quote => 
    quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quote.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
    
    try {
      if (selectedAction.action === 'Accept') {
        await axios.post(`${API_URL}/api/quotes/${selectedAction.id}/accept`, {
          userId: clientId
        });
        
        setSuccess('Quote accepted successfully. The provider will be notified.');
      } else {
        // Close the confirmation dialog immediately, rejection will be handled in handleConfirmRejection
        setShowDialog(false);
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
    }
  };
  
  // Handle rejection confirmation
  const handleConfirmRejection = async () => {
    setError(null);
    setSuccess(null);
    
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
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw size={16} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Quote List */}
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
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No quotes found</h3>
            <p className="text-muted-foreground">Try adjusting your search or contact your service provider for a quote</p>
          </div>
        )}
      </div>

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
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmQuoteAction}>
              {selectedAction.action === 'Accept' ? 'Accept' : 'Reject'}
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
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRejection}>
              Reject Quote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientQuotes;