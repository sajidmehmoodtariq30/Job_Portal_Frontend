import React, { useState } from 'react';
import { AlertTriangle, UserX, Mail, Phone, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/UI/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";

const ClientAssignmentAlert = ({ userName, userEmail, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleContactSupport = () => {
    // You can customize this to open email client or contact form
    window.location.href = `mailto:support@yourcompany.com?subject=Client Assignment Request&body=Hello,%0D%0A%0D%0AI need to be assigned to a client account.%0D%0A%0D%0AUser Details:%0D%0AName: ${userName || 'Not provided'}%0D%0AEmail: ${userEmail || 'Not provided'}%0D%0A%0D%0AThank you.`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <UserX className="w-10 h-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
            Client Assignment Required
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Your account needs to be linked to a client before you can access the portal
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="text-orange-800 ml-2">
              <strong>Access Restricted:</strong> You're not currently assigned to any client account. 
              Please contact your administrator or support team to get assigned to a client.
            </AlertDescription>
          </Alert>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <p className="text-gray-700">Contact your administrator or support team</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <p className="text-gray-700">Request to be assigned to a client account</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <p className="text-gray-700">Once assigned, click "Check Access" or refresh the page</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">Your Account Details:</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Name:</strong> {userName || 'Not provided'}</p>
              <p><strong>Email:</strong> {userEmail || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleContactSupport}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              className="flex-1"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isRefreshing ? 'Checking...' : 'Check Access'}
            </Button>
          </div>          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>If you believe this is an error, please contact your system administrator.</p>
            <p className="mt-1">Access is checked automatically every 5 minutes.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAssignmentAlert;
