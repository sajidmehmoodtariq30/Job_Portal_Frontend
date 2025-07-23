// src/pages/admin/ApiPlugin.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/UI/tabs";
import { Switch } from "@/components/UI/switch";
import { Database, Puzzle, RefreshCw, Download, Clock } from "lucide-react";
import { API_URL } from "@/lib/apiConfig";
import axios from 'axios';
import { Badge } from "@/components/UI/badge";

const ApiPlugin = () => {
  const [integrations, setIntegrations] = useState({
    servicem8: true,
    fusion: false,
    hikvision: false,
    msOffice: false
  });
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Fetch activity logs when component mounts
    fetchActivityLogs();
    
    // Set up polling for real-time updates
    const pollingInterval = setInterval(fetchActivityLogs, 1800000); // Fetch every 30 minutes
    
    // Clean up interval on component unmount
    return () => clearInterval(pollingInterval);
  }, []);

  const fetchActivityLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call (replace with real API call when backend is ready)
      // const response = await fetch(`${API_URL}/api/activity-logs`);
      
      // For now, we'll simulate a fetch with mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate some random realistic logs with current timestamp
      const now = new Date();
      const randomLogs = generateRandomLogs(now, 15);
      
      setActivityLogs(randomLogs);
      setLastUpdated(now.toLocaleTimeString());
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setError("Failed to load activity logs. Using fallback data.");
      
      // Fallback to mock data if API fails
      const mockLogs = [
        { id: 1, timestamp: formatTimestamp(new Date()), endpoint: '/api/v1/jobs', status: '200 OK', source: '192.168.1.1', method: 'GET' },
        { id: 2, timestamp: formatTimestamp(new Date(new Date().getTime() - 60000)), endpoint: '/api/v1/clients', status: '200 OK', source: '192.168.1.1', method: 'GET' },
        { id: 3, timestamp: formatTimestamp(new Date(new Date().getTime() - 120000)), endpoint: '/api/v1/quotes', status: '401 Unauthorized', source: '203.0.113.1', method: 'POST' },
        { id: 4, timestamp: formatTimestamp(new Date(new Date().getTime() - 180000)), endpoint: '/api/v1/auth', status: '200 OK', source: '192.168.1.1', method: 'POST' },
        { id: 5, timestamp: formatTimestamp(new Date(new Date().getTime() - 240000)), endpoint: '/api/v1/invoices', status: '200 OK', source: '192.168.1.1', method: 'GET' },
      ];
      setActivityLogs(mockLogs);
      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoading(false);
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (date) => {
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  // Generate random realistic logs for demo
  const generateRandomLogs = (currentDate, count) => {
    const endpoints = [
      '/api/v1/jobs',
      '/api/v1/clients',
      '/api/v1/quotes',
      '/api/v1/invoices',
      '/api/v1/auth',
      '/api/v1/users',
      '/api/v1/notifications',
      '/api/v1/settings'
    ];
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    
    const statuses = [
      '200 OK', 
      '201 Created',
      '204 No Content',
      '400 Bad Request',
      '401 Unauthorized',
      '403 Forbidden',
      '404 Not Found',
      '500 Server Error'
    ];
    
    const sources = [
      '192.168.1.1', 
      '192.168.1.5',
      '192.168.2.10',
      '10.0.0.15',
      '203.0.113.1',
      '127.0.0.1'
    ];
    
    const logs = [];
    
    for (let i = 0; i < count; i++) {
      const timeOffset = i * Math.floor(Math.random() * 60000) + 1000; // Random time between 1s and 60s ago
      const timestamp = new Date(currentDate.getTime() - timeOffset);
      
      const method = methods[Math.floor(Math.random() * methods.length)];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      
      // Weight the statuses to make 200 more common
      const statusIndex = Math.random() < 0.8 ? 
        Math.floor(Math.random() * 3) : // 80% chance of success (200, 201, 204)
        Math.floor(Math.random() * 5) + 3; // 20% chance of error
      
      const status = statuses[statusIndex];
      const source = sources[Math.floor(Math.random() * sources.length)];
      
      logs.push({
        id: i + 1,
        timestamp: formatTimestamp(timestamp),
        endpoint,
        status,
        source,
        method
      });
    }
    
    // Sort by timestamp (newest first)
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const handleToggleIntegration = (integration) => {
    if (integration === 'servicem8') {
      setIntegrations(prev => ({
        ...prev,
        [integration]: !prev[integration]
      }));
    } else {
      // Do nothing for integrations that are coming soon
      alert('This integration is coming soon and cannot be enabled yet.');
    }
  };

  const exportLogs = () => {
    // Create CSV content
    const headers = ['Timestamp', 'Method', 'Endpoint', 'Status', 'Source'];
    const csvContent = [
      headers.join(','),
      ...activityLogs.map(log => 
        [log.timestamp, log.method, log.endpoint, log.status, log.source].join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up and trigger download
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeClass = (status) => {
    if (status.startsWith('2')) return 'bg-green-100 text-green-800';
    if (status.startsWith('4')) return 'bg-amber-100 text-amber-800';
    if (status.startsWith('5')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  const getMethodBadgeClass = (method) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold">Plugin Management</h1>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Puzzle className="mr-2 h-5 w-5" /> API Integrations
              </CardTitle>
              <CardDescription>
                Configure third-party service integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">ServiceM8</h3>
                  <p className="text-sm text-muted-foreground">
                    Integration with ServiceM8 API for job management
                  </p>
                </div>
                <Switch 
                  checked={integrations.servicem8} 
                  onCheckedChange={() => handleToggleIntegration('servicem8')} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Fusion API</h3>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integration with Fusion API for digital signage
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={true}
                >
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Hikvision API</h3>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integration with Hikvision API for surveillance
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={true}
                >
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Microsoft Office API</h3>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integration with Microsoft Office APIs for workflow and productivity
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={true}
                >
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" /> Activity Logs
              </CardTitle>
              <CardDescription>
                Monitor system activity and integrations in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Real-Time Activity</h3>
                      {lastUpdated && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Last updated: {lastUpdated}
                        </div>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchActivityLogs}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Loading...' : 'Refresh'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={exportLogs}
                        disabled={activityLogs.length === 0}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Export Logs
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="mt-2 p-2 text-sm bg-amber-50 text-amber-800 rounded border border-amber-200">
                      {error}
                    </div>
                  )}
                </div>
                <div className="p-4 overflow-x-auto">
                  {isLoading && activityLogs.length === 0 ? (
                    <div className="text-center py-4">Loading activity logs...</div>
                  ) : activityLogs.length === 0 ? (
                    <div className="text-center py-4">No activity logs found</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="pb-2 font-medium">Timestamp</th>
                          <th className="pb-2 font-medium">Method</th>
                          <th className="pb-2 font-medium">Endpoint</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Source</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {activityLogs.map((log) => (
                          <tr key={log.id} className="border-t border-gray-100">
                            <td className="py-2">{log.timestamp}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodBadgeClass(log.method)}`}>
                                {log.method}
                              </span>
                            </td>
                            <td className="py-2">{log.endpoint}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(log.status)}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2">{log.source}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiPlugin;
