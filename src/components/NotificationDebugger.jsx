import React, { useState } from 'react';
import { Button } from "@/components/UI/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { API_URL } from "@/lib/apiConfig";

const NotificationDebugger = () => {
  const [debugResults, setDebugResults] = useState('');
  const [loading, setLoading] = useState(false);

  const getUserInfo = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
      const adminToken = localStorage.getItem('admin_token');
      
      return {
        ...userInfo,
        ...userData,
        isAdmin: userInfo.role === 'Administrator' || userInfo.role === 'admin' || !!adminToken,
        isClient: !!userData.uuid && !adminToken,
        clientId: userData.assignedClientUuid || userData.clientUuid || userData.uuid
      };
    } catch (error) {
      console.error('Error parsing user info:', error);
      return {};
    }
  };

  const testPolling = async () => {
    setLoading(true);
    try {
      const userInfo = getUserInfo();
      const userId = userInfo.isAdmin ? 'admin' : (userInfo.clientId || userInfo.uuid || 'default');
      const userType = userInfo.isAdmin ? 'admin' : 'client';
      
      const url = `${API_URL}/api/notifications/poll?userId=${userId}&userType=${userType}`;
      
      setDebugResults(`Testing polling...\nUser Info: ${JSON.stringify(userInfo, null, 2)}\nURL: ${url}\n\n`);
      
      const response = await fetch(url);
      const result = await response.json();
      
      setDebugResults(prev => prev + `Response Status: ${response.status}\nResponse: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setDebugResults(prev => prev + `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAllNotifications = async () => {
    setLoading(true);
    try {
      const url = `${API_URL}/api/notifications/debug-all`;
      setDebugResults(`Testing all notifications endpoint...\nURL: ${url}\n\n`);
      
      const response = await fetch(url);
      const result = await response.json();
      
      setDebugResults(prev => prev + `Response Status: ${response.status}\nAll Notifications: ${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      setDebugResults(prev => prev + `Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Notification Debug Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testPolling} disabled={loading}>
            Test Polling Endpoint
          </Button>
          <Button onClick={testAllNotifications} disabled={loading} variant="outline">
            Show All Stored Notifications
          </Button>
          <Button onClick={() => setDebugResults('')} variant="outline">
            Clear
          </Button>
        </div>
        
        {debugResults && (
          <div className="bg-gray-100 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {debugResults}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationDebugger;
