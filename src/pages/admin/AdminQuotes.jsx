// src/pages/admin/AdminQuotes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/UI/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { Label } from "@/components/UI/label";
import SearchableJobSelect from "@/components/UI/SearchableJobSelect";
import { PlusCircle, Search, RefreshCw, AlertCircle, Eye, Send, FileText, DollarSign, CheckCircle, XCircle } from "lucide-react";
import axios from 'axios';
import { API_URL } from '@/lib/apiConfig';

const AdminQuotes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [visibleQuotes, setVisibleQuotes] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newQuote, setNewQuote] = useState({
    jobId: '',
    clientId: '',
    clientName: '',
    title: '',
    description: '',
    price: '',
    location: '',
    items: [{ description: '', quantity: 1, price: 0 }]
  });

  // Fetch quotes, jobs, and clients on mount
  useEffect(() => {
    fetchQuotes();
    fetchJobs();
    fetchClients();
  }, []);

  // Fetch quotes from our API
  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/quotes`);
      setQuotes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setError('Failed to fetch quotes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs for job selection
  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_URL}/fetch/jobs`);
      setJobs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  // Fetch clients for client selection
  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/fetch/client`);
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Filter quotes by search term and status
  const filteredQuotes = quotes.filter(quote => {
    // Apply status filter
    if (statusFilter !== 'all' && quote.status !== statusFilter) {
      return false;
    }
    
    // Apply search filter
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (quote.id?.toLowerCase().includes(searchLower)) ||
      (quote.title?.toLowerCase().includes(searchLower)) ||
      (quote.description?.toLowerCase().includes(searchLower)) ||
      (quote.clientName?.toLowerCase().includes(searchLower)) ||
      (quote.jobId?.toLowerCase().includes(searchLower))
    );
  });

  // Sorted quotes - newest first
  const sortedQuotes = [...filteredQuotes].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Display quotes with pagination
  const displayedQuotes = sortedQuotes.slice(0, visibleQuotes);

  const handleShowMore = () => {
    setVisibleQuotes(prev => prev + 10);
  };

  const handleShowLess = () => {
    setVisibleQuotes(prev => Math.max(prev - 10, 10));
  };

  const handleRefresh = async () => {
    setError(null);
    setSuccess(null);
    await fetchQuotes();
    await fetchJobs();
    await fetchClients();
    setSuccess('Data refreshed successfully');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setIsViewDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuote({ ...newQuote, [name]: value });
  };

  // Handle select changes for job and client
  const handleJobChange = (jobId) => {
    const selectedJob = jobs.find(job => job.uuid === jobId);
    
    if (selectedJob) {
      // Get client information if available
      const client = clients.find(client => client.uuid === selectedJob.company_uuid);
      
      setNewQuote({
        ...newQuote,
        jobId: jobId,
        clientId: selectedJob.company_uuid || '',
        clientName: client?.name || 'Unknown Client',
        location: selectedJob.job_address || '',
        description: selectedJob.job_description || ''
      });
    }
  };

  // Add a new line item to the quote
  const handleAddLineItem = () => {
    setNewQuote({
      ...newQuote,
      items: [...newQuote.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  // Update a line item
  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...newQuote.items];
    updatedItems[index][field] = value;
    
    // Calculate total price
    const totalPrice = updatedItems.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.price));
    }, 0);
    
    setNewQuote({
      ...newQuote,
      items: updatedItems,
      price: totalPrice.toFixed(2)
    });
  };

  // Remove a line item
  const handleRemoveLineItem = (index) => {
    const updatedItems = newQuote.items.filter((_, i) => i !== index);
    
    // Calculate total price
    const totalPrice = updatedItems.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.price));
    }, 0);
    
    setNewQuote({
      ...newQuote,
      items: updatedItems,
      price: totalPrice.toFixed(2)
    });
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Create and send a quote
  const handleCreateQuote = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!newQuote.jobId || !newQuote.clientId || !newQuote.title || !newQuote.description || !newQuote.price) {
      setError("Please fill in all required fields");
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/api/quotes`, {
        jobId: newQuote.jobId,
        clientId: newQuote.clientId,
        clientName: newQuote.clientName,
        title: newQuote.title,
        description: newQuote.description,
        price: parseFloat(newQuote.price),
        location: newQuote.location,
        items: newQuote.items
      });
      
      setSuccess("Quote created successfully!");
      fetchQuotes();
      setIsDialogOpen(false);
      
      // Reset form
      setNewQuote({
        jobId: '',
        clientId: '',
        clientName: '',
        title: '',
        description: '',
        price: '',
        location: '',
        items: [{ description: '', quantity: 1, price: 0 }]
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error creating quote:', error);
      setError(`Error creating quote: ${error.response?.data?.message || error.message}`);
    }
  };

  // Update quote status
  const handleUpdateQuoteStatus = async (quoteId, newStatus, reasonText) => {
    setError(null);
    
    try {
      let endpoint = `${API_URL}/api/quotes/${quoteId}`;
      let payload = { status: newStatus };
      
      if (reasonText) {
        payload.rejectionReason = reasonText;
      }
      
      const response = await axios.put(endpoint, payload);
      
      setSuccess(`Quote ${newStatus.toLowerCase()} successfully`);
      fetchQuotes();
      setIsViewDialogOpen(false);
      setSelectedQuote(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(`Error updating quote status:`, error);
      setError(`Error updating quote status: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quote Management</h1>
        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2">
          <PlusCircle size={16} /> Create New Quote
        </Button>
      </div>
      
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
      
      <Card>
        <CardHeader className="space-y-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle>Quotes</CardTitle>
              <CardDescription>Create and manage quotes for clients</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCw size={16} /> Refresh
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              className="pl-10"
              placeholder="Search quotes by ID, title, client or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Quote ID</th>
                  <th className="py-3 text-left">Client</th>
                  <th className="py-3 text-left">Title</th>
                  <th className="py-3 text-left">Amount</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="py-4 text-center">Loading quotes...</td></tr>
                ) : displayedQuotes.length > 0 ? (
                  displayedQuotes.map((quote) => (
                    <tr key={quote.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{quote.id}</td>
                      <td className="py-3">{quote.clientName}</td>
                      <td className="py-3">{quote.title}</td>
                      <td className="py-3">{formatCurrency(quote.price)}</td>
                      <td className="py-3">{formatDate(quote.createdAt)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          quote.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          quote.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                          quote.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewQuote(quote)}
                          className="flex items-center gap-1"
                        >
                          <Eye size={14} /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText size={24} className="text-gray-400" />
                        <p>No quotes found</p>
                        <Button 
                          variant="link" 
                          onClick={() => setIsDialogOpen(true)}
                          className="mt-1"
                        >
                          Create your first quote
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {displayedQuotes.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowLess}
                disabled={visibleQuotes <= 10}
              >
                Show Less
              </Button>
              <span className="text-sm text-gray-500">
                Showing {Math.min(visibleQuotes, filteredQuotes.length)} of {filteredQuotes.length} quotes
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowMore}
                disabled={filteredQuotes.length <= visibleQuotes}
              >
                Show More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Quote Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quote</DialogTitle>
            <DialogDescription>
              Create a detailed quote for your client based on a job
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateQuote} className="space-y-6 my-2">            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobId" className="font-medium">
                  Select Job <span className="text-red-500">*</span>
                </Label>                <SearchableJobSelect
                  jobs={jobs}
                  value={newQuote.jobId}
                  onValueChange={handleJobChange}
                  placeholder="Search and select a job..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName" className="font-medium">Client</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={newQuote.clientName}
                  onChange={handleInputChange}
                  disabled
                  placeholder="Client will be determined by job"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium">
                Quote Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={newQuote.title}
                onChange={handleInputChange}
                placeholder="Provide a concise title for this quote"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newQuote.description}
                onChange={handleInputChange}
                placeholder="Detailed description of the quoted work"
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-medium">Location</Label>
              <Input
                id="location"
                name="location"
                value={newQuote.location}
                onChange={handleInputChange}
                placeholder="Job location"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="font-medium">Line Items</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddLineItem}
                  className="flex items-center gap-1"
                >
                  <PlusCircle size={14} /> Add Item
                </Button>
              </div>

              <div className="border rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="py-2 px-3 text-left">Description</th>
                      <th className="py-2 px-3 text-right w-24">Quantity</th>
                      <th className="py-2 px-3 text-right w-32">Unit Price</th>
                      <th className="py-2 px-3 text-right w-32">Amount</th>
                      <th className="py-2 px-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newQuote.items.map((item, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="p-2">
                          <Input
                            value={item.description}
                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                            className="text-right"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => handleLineItemChange(index, 'price', e.target.value)}
                            className="text-right"
                          />
                        </td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(item.quantity * item.price)}
                        </td>
                        <td className="p-2 text-center">
                          {newQuote.items.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLineItem(index)}
                            >
                              <XCircle size={16} className="text-red-500" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t bg-gray-50">
                      <td colSpan="3" className="py-2 px-3 text-right font-medium">Total:</td>
                      <td className="py-2 px-3 text-right font-medium">{formatCurrency(newQuote.price || 0)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex items-center gap-2">
                <FileText size={16} /> Create Quote
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Quote Dialog */}
      {selectedQuote && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Quote {selectedQuote.id}</DialogTitle>
              <DialogDescription>
                Created on {formatDate(selectedQuote.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 my-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{selectedQuote.title}</h3>
                  <p className="text-sm text-gray-500">Job ID: {selectedQuote.jobId}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedQuote.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedQuote.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                    selectedQuote.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedQuote.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-gray-500">Client</h4>
                  <p>{selectedQuote.clientName}</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-gray-500">Location</h4>
                  <p>{selectedQuote.location || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-gray-500">Created</h4>
                  <p>{formatDate(selectedQuote.createdAt)}</p>
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-medium text-sm text-gray-500">Expires</h4>
                  <p>{formatDate(selectedQuote.expiryDate)}</p>
                </div>
                
                {selectedQuote.status === 'Accepted' && (
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm text-gray-500">Accepted On</h4>
                    <p>{formatDate(selectedQuote.acceptedAt)}</p>
                  </div>
                )}
                
                {selectedQuote.status === 'Rejected' && (
                  <>
                    <div className="space-y-1">
                      <h4 className="font-medium text-sm text-gray-500">Rejected On</h4>
                      <p>{formatDate(selectedQuote.rejectedAt)}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <h4 className="font-medium text-sm text-gray-500">Rejection Reason</h4>
                      <p>{selectedQuote.rejectionReason || 'No reason provided'}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Description</h4>
                <p className="whitespace-pre-line">{selectedQuote.description}</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-500">Quote Items</h4>
                {selectedQuote.items && selectedQuote.items.length > 0 ? (
                  <div className="border rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="py-2 px-3 text-left">Description</th>
                          <th className="py-2 px-3 text-right">Quantity</th>
                          <th className="py-2 px-3 text-right">Unit Price</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedQuote.items.map((item, index) => (
                          <tr key={index} className="border-b last:border-b-0">
                            <td className="py-2 px-3">{item.description}</td>
                            <td className="py-2 px-3 text-right">{item.quantity}</td>
                            <td className="py-2 px-3 text-right">{formatCurrency(item.price)}</td>
                            <td className="py-2 px-3 text-right font-medium">
                              {formatCurrency(item.quantity * item.price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-gray-50">
                          <td colSpan="3" className="py-2 px-3 text-right font-medium">Total:</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(selectedQuote.price)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No line items available</p>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-between">
              {selectedQuote.status === 'Pending' && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'Expired')}
                    className="flex items-center gap-1 text-gray-700"
                  >
                    Mark as Expired
                  </Button>
                </div>
              )}
              <Button 
                type="button" 
                onClick={() => setIsViewDialogOpen(false)}
                variant="outline"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminQuotes;