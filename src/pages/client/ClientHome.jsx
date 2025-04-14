import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  FileText, 
  Filter, 
  Search,
  Plus,
  Clipboard,
} from 'lucide-react';
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/UI/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/UI/dropdown-menu"
import JobCard from "../../components/UI/client/JobCard";
import QuoteCard from "../../components/UI/client/QuoteCard";

const ClientHome = () => {
  // In a real implementation, you would fetch these from the ServiceM8 API
  const [jobs, setJobs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [currentSite, setCurrentSite] = useState('Main Office');
  const [sites, setSites] = useState(['Main Office', 'Warehouse', 'Branch Office']);
  
  // Mock data - in production, this would come from ServiceM8 APIs
  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => {
      const mockJobs = [
        {
          id: 'JOB-2025-0423',
          title: 'Network Installation',
          status: 'In Progress',
          date: 'Apr 15, 2025',
          dueDate: 'Apr 20, 2025',
          type: 'Work Order',
          description: 'Install new network infrastructure including switches and access points',
          assignedTech: 'Alex Johnson',
          location: 'Main Office',
          attachments: 2
        },
        {
          id: 'JOB-2025-0422',
          title: 'Security System Upgrade',
          status: 'Quote',
          date: 'Apr 14, 2025',
          dueDate: 'Apr 25, 2025',
          type: 'Quote',
          price: '$4,850.00',
          description: 'Upgrade existing security cameras to 4K resolution',
          location: 'Warehouse',
          attachments: 1
        },
        {
          id: 'JOB-2025-0418',
          title: 'Digital Signage Installation',
          status: 'Completed',
          date: 'Apr 10, 2025',
          completedDate: 'Apr 12, 2025',
          type: 'Work Order',
          description: 'Install 3 digital signage displays in reception area',
          assignedTech: 'Sarah Davis',
          location: 'Main Office',
          attachments: 3
        },
        {
          id: 'JOB-2025-0415',
          title: 'Surveillance System Maintenance',
          status: 'Scheduled',
          date: 'Apr 20, 2025',
          type: 'Work Order',
          description: 'Routine maintenance check on surveillance system',
          assignedTech: 'Miguel Rodriguez',
          location: 'Branch Office',
          attachments: 0
        }
      ];
      
      setJobs(mockJobs);
      setQuotes(mockJobs.filter(job => job.type === 'Quote'));
      setWorkOrders(mockJobs.filter(job => job.type === 'Work Order'));
      
      setNotifications([
        { id: 1, type: 'quote', message: 'New quote available for Security System Upgrade', time: '2 hours ago', read: false },
        { id: 2, type: 'schedule', message: 'Technician scheduled for Apr 20', time: '1 day ago', read: true },
        { id: 3, type: 'job', message: 'Digital Signage Installation completed', time: '2 days ago', read: true },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': return 'bg-blue-600 text-white';
      case 'Quote': return 'bg-amber-500 text-white';
      case 'Completed': return 'bg-green-600 text-white';
      case 'Scheduled': return 'bg-purple-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };
  
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleCreateNewJob = () => {
    // This would integrate with ServiceM8 API to create a new job
    alert('Creating new job request - would send to ServiceM8 API');
  };
  
  const handleQuoteAction = (quoteId, action) => {
    // This would integrate with ServiceM8 API to accept/reject quotes
    alert(`${action} quote ${quoteId} - would send to ServiceM8 API`);
  };
  
  const handleAddAttachment = (jobId) => {
    // This would handle file upload and then send to ServiceM8 API
    alert(`Adding attachment to job ${jobId} - would upload and send to ServiceM8 API`);
  };

  return (
    <div className="space-y-6">
      {/* Header with notifications and site selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-lg mt-1">Manage your services and requests</p>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative">
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <DropdownMenuItem key={notification.id} className={`p-3 ${!notification.read ? 'bg-muted/50' : ''}`}>
                    <div className="flex gap-3 items-start">
                      {notification.type === 'quote' && <FileText className="text-amber-500" size={20} />}
                      {notification.type === 'schedule' && <Calendar className="text-purple-500" size={20} />}
                      {notification.type === 'job' && <CheckCircle className="text-green-500" size={20} />}
                      <div className="flex-1">
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{currentSite}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select Site</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sites.map(site => (
                <DropdownMenuItem key={site} onClick={() => setCurrentSite(site)}>
                  {site}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : jobs.filter(job => job.status !== 'Completed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : quotes.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : jobs.filter(job => job.status === 'Scheduled').length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search jobs by ID or title..."
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
          <Button onClick={handleCreateNewJob} className="flex items-center gap-2">
            <Plus size={16} />
            New Request
          </Button>
        </div>
      </div>
      
      {/* Tabs for different job types */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="workOrders">Work Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
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
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onQuoteAction={handleQuoteAction} 
                  onAddAttachment={handleAddAttachment}
                  statusColor={getStatusColor} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Search size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : quotes.filter(job => job.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
            <div className="space-y-4">
              {quotes
                .filter(job => job.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(job => (
                  <QuoteCard 
                    key={job.id} 
                    quote={job} 
                    onQuoteAction={handleQuoteAction} 
                    statusColor={getStatusColor} 
                  />
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No quotes found</h3>
              <p className="text-muted-foreground">You don't have any pending quotes at the moment</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="workOrders" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : workOrders.filter(job => 
              job.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
              job.status !== 'Completed'
            ).length > 0 ? (
            <div className="space-y-4">
              {workOrders
                .filter(job => 
                  job.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
                  job.status !== 'Completed'
                )
                .map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onAddAttachment={handleAddAttachment}
                    statusColor={getStatusColor} 
                  />
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Clipboard size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No active work orders</h3>
              <p className="text-muted-foreground">All your work orders are complete or you don't have any</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 bg-muted rounded"></div>
                  <div className="space-y-3">
                    <div className="h-2 bg-muted rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : jobs.filter(job => 
              job.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
              job.status === 'Completed'
            ).length > 0 ? (
            <div className="space-y-4">
              {jobs
                .filter(job => 
                  job.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
                  job.status === 'Completed'
                )
                .map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onAddAttachment={handleAddAttachment}
                    statusColor={getStatusColor} 
                  />
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle size={48} className="text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No completed jobs</h3>
              <p className="text-muted-foreground">You don't have any completed jobs matching your filters</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientHome;