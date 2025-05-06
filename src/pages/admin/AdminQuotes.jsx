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
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const AdminQuotes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [visibleQuotes, setVisibleQuotes] = useState(10);
  const [newQuote, setNewQuote] = useState({
    uuid: '',
    client_uuid: '',
    description: '',
    service_address: '',
    amount: '',
    valid_until: '',
    email_to: '',
    notes: '',
  });

  // Fetch quotes and clients on mount
  useEffect(() => {
    fetchQuotes();
    fetchClients();
  }, []);

  // Fetch quotes from ServiceM8 API via backend
  const fetchQuotes = async () => {
    setLoading(true);
    try {
      // In a real implementation, we'd have an endpoint for quotes
      // For now, we'll filter jobs with status "Quote" from the jobs endpoint
      const response = await axios.get(API_ENDPOINTS.JOBS.FETCH_ALL);
      const jobsData = Array.isArray(response.data) ? response.data : response.data.jobs || [];
      const quoteJobs = jobsData.filter(job => job.status === 'Quote');
      setQuotes(quoteJobs);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients for the client selection dropdown
  const fetchClients = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CLIENTS.FETCH_ALL);
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Filter quotes by search term
  const filteredQuotes = quotes.filter(quote => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      (quote.uuid?.toLowerCase().includes(searchLower)) ||
      (quote.job_description?.toLowerCase().includes(searchLower)) ||
      (quote.generated_job_id?.toLowerCase().includes(searchLower))
    );
  });

  // Display quotes with pagination
  const displayedQuotes = filteredQuotes.slice(0, visibleQuotes);

  const handleShowMore = () => {
    setVisibleQuotes(prev => prev + 10);
  };

  const handleShowLess = () => {
    setVisibleQuotes(prev => Math.max(prev - 5, 5));
  };

  const handleRefresh = async () => {
    await fetchQuotes();
  };

  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuote({ ...newQuote, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setNewQuote({ ...newQuote, [name]: value });
  };

  // When a client is selected, auto-fill their email and address if available
  const handleClientChange = (value) => {
    setNewQuote({ ...newQuote, client_uuid: value });
    
    const selectedClient = clients.find(client => client.uuid === value);
    if (selectedClient) {
      const formattedAddress = [
        selectedClient.address,
        selectedClient.address_city,
        selectedClient.address_state,
        selectedClient.address_postcode,
        selectedClient.address_country
      ].filter(Boolean).join(', ');
      
      setNewQuote(prev => ({
        ...prev,
        service_address: formattedAddress || prev.service_address,
        email_to: selectedClient.email || prev.email_to
      }));
    }
  };

  // Generate UUID for the new quote
  const generateUUID = () => {
    const uuid = crypto.randomUUID();
    setNewQuote({ ...newQuote, uuid });
  };

  // Create and send a quote
  const handleCreateQuote = async (e) => {
    e.preventDefault();
    
    if (!newQuote.uuid || !newQuote.client_uuid || !newQuote.description) {
      alert("Please fill in all required fields");
      return;
    }
    
    try {
      // In a real implementation, we would post to a quote-specific endpoint
      // For now, we're creating a job with status "Quote"
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        active: 1,
        uuid: newQuote.uuid,
        company_uuid: newQuote.client_uuid,
        created_by_staff_uuid: newQuote.client_uuid, // Using client UUID for staff
        date: today,
        job_description: newQuote.description,
        job_address: newQuote.service_address,
        status: 'Quote',
        total_invoice_amount: newQuote.amount,
        quote_date: today,
        quote_sent: '0', // Not sent yet
        quote_sent_stamp: '', // Will be filled when quote is sent
      };
      
      await axios.post(API_ENDPOINTS.JOBS.CREATE, payload);
      
      // Send the quote email if email_to is provided
      if (newQuote.email_to) {
        // This would be a separate API call to send the quote via email
        // await axios.post(API_ENDPOINTS.QUOTES.SEND, {
        //   uuid: newQuote.uuid,
        //   email_to: newQuote.email_to,
        //   notes: newQuote.notes
        // });
        console.log(`Quote would be sent to: ${newQuote.email_to}`);
      }
      
      alert("Quote created successfully!");
      fetchQuotes();
      setIsDialogOpen(false);
      
      // Reset form
      setNewQuote({
        uuid: '',
        client_uuid: '',
        description: '',
        service_address: '',
        amount: '',
        valid_until: '',
        email_to: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating quote:', error);
      alert(`Error creating quote: ${error.response?.data?.message || error.message}`);
    }
  };

  // Send an existing quote
  const handleSendQuote = async (quote) => {
    try {
      const selectedClient = clients.find(client => client.uuid === quote.company_uuid);
      if (!selectedClient || !selectedClient.email) {
        alert("Client email address not found. Please update client information first.");
        return;
      }
      
      // This would be a separate API call to send the quote via email
      // await axios.post(API_ENDPOINTS.QUOTES.SEND, {
      //   uuid: quote.uuid,
      //   email_to: selectedClient.email
      // });
      
      // For now, we'll just update the quote_sent status
      await axios.post(API_ENDPOINTS.JOBS.CREATE, {
        ...quote,
        quote_sent: '1',
        quote_sent_stamp: new Date().toISOString()
      });
      
      alert(`Quote would be sent to ${selectedClient.email}`);
      fetchQuotes();
    } catch (error) {
      console.error('Error sending quote:', error);
      alert(`Error sending quote: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quote Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Quote</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
              <DialogDescription>
                Enter the details for the new quote to send to your client.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateQuote} className="h-[20vh] overflow-y-auto">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="uuid">Quote ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="uuid"
                        name="uuid"
                        value={newQuote.uuid}
                        onChange={handleInputChange}
                        required
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={generateUUID}
                        className="whitespace-nowrap"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valid_until">Valid Until</Label>
                    <Input
                      id="valid_until"
                      name="valid_until"
                      type="date"
                      value={newQuote.valid_until}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="client_uuid">Client</Label>
                  <Select
                    value={newQuote.client_uuid}
                    onValueChange={(value) => handleClientChange(value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.uuid} value={client.uuid}>
                          {client.name} ({client.uuid.slice(-4)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="service_address">Service Address</Label>
                  <Input
                    id="service_address"
                    name="service_address"
                    value={newQuote.service_address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Quote Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newQuote.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Detailed description of the work to be quoted..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="amount">Quote Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newQuote.amount}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email_to">Send Quote To</Label>
                  <Input
                    id="email_to"
                    name="email_to"
                    type="email"
                    value={newQuote.email_to}
                    onChange={handleInputChange}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newQuote.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional notes to include with the quote..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create & Send Quote</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
          <CardDescription>Manage and send quotes to clients</CardDescription>
          <div className="w-full mt-4">
            <Input
              className="w-full"
              placeholder="Search quotes by ID or description..."
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
                  <th className="py-3 text-left">Description</th>
                  <th className="py-3 text-left">Amount</th>
                  <th className="py-3 text-left">Date</th>
                  <th className="py-3 text-left">Sent</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="py-4 text-center">Loading...</td></tr>
                ) : displayedQuotes.length > 0 ? (
                  displayedQuotes.map((quote) => {
                    // Find client name
                    const client = clients.find(c => c.uuid === quote.company_uuid);
                    const clientName = client ? client.name : 'Unknown Client';
                    
                    return (
                      <tr key={quote.uuid} className="border-b">
                        <td className="py-3">{quote.uuid.slice(-4)}</td>
                        <td className="py-3">{clientName}</td>
                        <td className="py-3">{quote.job_description?.slice(0, 50)}...</td>
                        <td className="py-3">${quote.total_invoice_amount || '0.00'}</td>
                        <td className="py-3">{quote.quote_date || quote.date}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            quote.quote_sent === '1' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {quote.quote_sent === '1' ? 'Sent' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3 space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewDetails(quote)}
                          >
                            View
                          </Button>
                          {quote.quote_sent !== '1' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendQuote(quote)}
                            >
                              Send
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-muted-foreground">
                      No quotes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={handleShowLess}
              disabled={visibleQuotes <= 5}
            >
              Show Less
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
            >
              Refresh Data
            </Button>
            <Button
              variant="outline"
              onClick={handleShowMore}
              disabled={filteredQuotes.length <= visibleQuotes}
            >
              Show More
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedQuote && (
        <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-xl">Quote Details - {selectedQuote.uuid.slice(-4)}</DialogTitle>
              <DialogDescription>
                Detailed information about the selected quote
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <Label className="font-bold text-sm text-gray-600">Quote ID</Label>
                  <p className="text-sm font-medium">{selectedQuote.uuid}</p>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-sm text-gray-600">Status</Label>
                  <p className="text-sm font-medium">
                    <span className={`px-2 py-1 rounded text-xs ${
                      selectedQuote.quote_sent === '1' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedQuote.quote_sent === '1' ? 'Sent' : 'Draft'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Client</Label>
                <p className="text-sm">
                  {clients.find(c => c.uuid === selectedQuote.company_uuid)?.name || 'Unknown Client'}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Quote Description</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedQuote.job_description}</p>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Service Address</Label>
                <p className="text-sm">{selectedQuote.job_address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">Quote Date</Label>
                  <p className="text-sm">{selectedQuote.quote_date || selectedQuote.date}</p>
                </div>
                {selectedQuote.quote_sent === '1' && (
                  <div className="space-y-2">
                    <Label className="font-bold">Sent Date</Label>
                    <p className="text-sm">{selectedQuote.quote_sent_stamp || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Quote Amount</Label>
                <p className="text-sm">${selectedQuote.total_invoice_amount || '0.00'}</p>
              </div>
            </div>
            <DialogFooter className="border-t pt-4 space-x-2">
              {selectedQuote.quote_sent !== '1' && (
                <Button 
                  onClick={() => {
                    handleSendQuote(selectedQuote);
                    setSelectedQuote(null);
                  }}
                >
                  Send Quote
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedQuote(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminQuotes;