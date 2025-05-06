// src/pages/admin/ApiPlugin.jsx
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/UI/tabs";
import { Switch } from "@/components/UI/switch";
import { Clipboard, RefreshCw, Key, Check, Copy, Database, Puzzle } from "lucide-react";

const ApiPlugin = () => {
  const [apiKey, setApiKey] = useState('sk_live_3x4mp13_4p1_k3y_f0r_d3m0');
  const [copySuccess, setCopySuccess] = useState(false);
  const [integrations, setIntegrations] = useState({
    servicem8: true,
    fusion: false,
    hikvision: false,
    msOffice: false
  });

  const handleToggleIntegration = (integration) => {
    setIntegrations(prev => ({
      ...prev,
      [integration]: !prev[integration]
    }));
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const generateNewApiKey = () => {
    // In a real app, this would call your backend to generate a new API key
    setApiKey(`sk_live_${Math.random().toString(36).substring(2, 15)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h1 className="text-3xl font-bold">API Plugin Management</h1>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" /> API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys to interact with the ServiceM8 portal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="api-key">Your API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="api-key" 
                    value={apiKey} 
                    readOnly 
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleCopyApiKey}
                    className="min-w-10"
                  >
                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Keep this key secure. It provides full access to your account.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button 
                onClick={generateNewApiKey} 
                variant="outline" 
                className="flex items-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate API Key
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Reference documentation for integrating with our API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Quick Start</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Use the following endpoint to authenticate:
                  </p>
                  <pre className="bg-slate-950 text-slate-50 p-2 rounded text-xs overflow-auto">
                    POST https://api.servicem8portal.com/v1/auth
                  </pre>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="link" className="text-primary">
                    View Full Documentation →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
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
                <div>
                  <h3 className="font-medium">Fusion API</h3>
                  <p className="text-sm text-muted-foreground">
                    Integration with Fusion API for digital signage
                  </p>
                </div>
                <Switch 
                  checked={integrations.fusion} 
                  onCheckedChange={() => handleToggleIntegration('fusion')} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Hikvision API</h3>
                  <p className="text-sm text-muted-foreground">
                    Integration with Hikvision API for surveillance
                  </p>
                </div>
                <Switch 
                  checked={integrations.hikvision} 
                  onCheckedChange={() => handleToggleIntegration('hikvision')} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Microsoft Office API</h3>
                  <p className="text-sm text-muted-foreground">
                    Integration with Microsoft Office APIs for workflow and productivity
                  </p>
                </div>
                <Switch 
                  checked={integrations.msOffice} 
                  onCheckedChange={() => handleToggleIntegration('msOffice')} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" /> API Activity Logs
              </CardTitle>
              <CardDescription>
                Monitor API usage and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Recent API Calls</h3>
                    <Button variant="outline" size="sm">Export Logs</Button>
                  </div>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="pb-2 font-medium">Timestamp</th>
                        <th className="pb-2 font-medium">Endpoint</th>
                        <th className="pb-2 font-medium">Status</th>
                        <th className="pb-2 font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr>
                        <td className="py-2">2025-05-06 11:23:45</td>
                        <td className="py-2">/api/v1/jobs</td>
                        <td className="py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">200 OK</span></td>
                        <td className="py-2">192.168.1.1</td>
                      </tr>
                      <tr>
                        <td className="py-2">2025-05-06 11:20:32</td>
                        <td className="py-2">/api/v1/clients</td>
                        <td className="py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">200 OK</span></td>
                        <td className="py-2">192.168.1.1</td>
                      </tr>
                      <tr>
                        <td className="py-2">2025-05-06 11:15:18</td>
                        <td className="py-2">/api/v1/quotes</td>
                        <td className="py-2"><span className="bg-red-100 text-red-800 px-2 py-1 rounded-full">401 Unauthorized</span></td>
                        <td className="py-2">203.0.113.1</td>
                      </tr>
                      <tr>
                        <td className="py-2">2025-05-06 11:09:51</td>
                        <td className="py-2">/api/v1/auth</td>
                        <td className="py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">200 OK</span></td>
                        <td className="py-2">192.168.1.1</td>
                      </tr>
                    </tbody>
                  </table>
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