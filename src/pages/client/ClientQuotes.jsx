import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Search,
  FileText,
  Mail
} from 'lucide-react';
import { Button } from "../../components/UI/button";
import { Input } from "../../components/UI/input";
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

const ClientQuotes = () => {
  // State for quotes data
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState({ id: null, action: null });
  
  // Load quotes data
  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      const mockQuotes = [
        {
          id: 'QUO-2025-0422',
          title: 'Security System Upgrade',
          status: 'Pending',
          date: 'Apr 14, 2025',
          dueDate: 'Apr 25, 2025',
          price: '$4,850.00',
          description: 'Upgrade existing security cameras to 4K resolution with advanced motion detection and AI recognition features. Includes installation and configuration.',
          location: 'Warehouse',
          attachments: 1
        },
        {
          id: 'QUO-2025-0419',
          title: 'Network Restructuring',
          status: 'Pending',
          date: 'Apr 12, 2025',
          dueDate: 'Apr 30, 2025',
          price: '$7,200.00',
          description: 'Complete network restructuring with new switches, routers, and access points to improve coverage and performance.',
          location: 'Main Office',
          attachments: 2
        },
        {
          id: 'QUO-2025-0415',
          title: 'Digital Signage Package',
          status: 'Accepted',
          date: 'Apr 8, 2025',
          acceptedDate: 'Apr 10, 2025',
          price: '$2,350.00',
          description: 'Three digital signage displays with content management system for reception area.',
          location: 'Main Office',
          attachments: 1
        },
        {
          id: 'QUO-2025-0409',
          title: 'Access Control System',
          status: 'Rejected',
          date: 'Apr 4, 2025',
          rejectedDate: 'Apr 6, 2025',
          price: '$5,100.00',
          description: 'Building-wide access control system with key cards and biometric options.',
          location: 'Branch Office',
          attachments: 1
        },
        {
          id: 'QUO-2025-0401',
          title: 'Server Upgrade Package',
          status: 'Expired',
          date: 'Apr 1, 2025',
          expiryDate: 'Apr 10, 2025',
          price: '$8,950.00',
          description: 'Upgrade server hardware and migrate to new system with minimal downtime.',
          location: 'Main Office',
          attachments: 2
        }
      ];
      
      setQuotes(mockQuotes);
      setLoading(false);
    }, 1000);
  }, []);
  
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
  
  // Handle quote actions with confirmation
  const handleQuoteAction = (quoteId, action) => {
    setSelectedAction({ id: quoteId, action });
    setShowDialog(true);
  };
  
  // Confirm quote action
  const confirmQuoteAction = () => {
    // This would integrate with ServiceM8 API to accept/reject quotes
    if (selectedAction.action === 'Accept') {
      // Update local state for demo purposes
      setQuotes(quotes.map(quote => 
        quote.id === selectedAction.id 
          ? { ...quote, status: 'Accepted', acceptedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } 
          : quote
      ));
    } else {
      // Update local state for demo purposes
      setQuotes(quotes.map(quote => 
        quote.id === selectedAction.id 
          ? { ...quote, status: 'Rejected', rejectedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } 
          : quote
      ));
    }
    
    setShowDialog(false);
  };
  
  // Download quote function
  const downloadQuote = (quoteId) => {
    // This would integrate with ServiceM8 API to download quote PDF
    alert(`Downloading quote ${quoteId} - would fetch from ServiceM8 API`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Quotes</h1>
        <p className="text-lg mt-1">View and manage quotes for your services</p>
      </div>
  
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
          <Button variant="outline" className="flex items-center gap-2">
            <Mail size={16} />
            Request New Quote
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
                quote={quote} 
                onQuoteAction={handleQuoteAction}
                statusColor={getStatusColor} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <FileText size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No quotes found</h3>
            <p className="text-muted-foreground">Try adjusting your search or request a new quote</p>
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
    </div>
  );
};

export default ClientQuotes;