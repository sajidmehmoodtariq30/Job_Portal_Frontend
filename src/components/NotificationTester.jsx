import React from 'react';
import { Button } from '@/components/UI/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { useNotifications } from '@/context/NotificationContext';
import { Badge } from '@/components/UI/badge';

const NotificationTester = () => {
  const { triggerNotification, notifications, unreadCount, clearAll } = useNotifications();

  const testNotifications = [
    {
      type: 'job_created',
      message: 'New job created for testing',
      data: {
        jobId: 'test-job-123',
        jobDescription: 'Security System Installation',
        client: 'Acme Corp',
        clientUuid: 'client-123'
      }
    },
    {
      type: 'job_status_update',
      message: 'Job status has been updated',
      data: {
        jobId: 'test-job-123',
        jobDescription: 'Security System Installation',
        oldStatus: 'Quote',
        newStatus: 'Work Order',
        clientUuid: 'client-123'
      }
    },
    {
      type: 'quote_accepted',
      message: 'Quote has been accepted',
      data: {
        jobId: 'test-job-123',
        jobDescription: 'Security System Installation',
        amount: 2500,
        clientUuid: 'client-123'
      }
    },
    {
      type: 'quote_declined',
      message: 'Quote has been declined',
      data: {
        jobId: 'test-job-124',
        jobDescription: 'Network Setup',
        clientUuid: 'client-124'
      }
    },    {
      type: 'note_added',
      message: 'New note added to job',
      data: {
        jobId: 'test-job-123',
        jobDescription: 'Security System Installation',
        clientUuid: 'client-123'
      }
    },
    {
      type: 'chat_message',
      message: 'New chat message received',
      data: {
        jobId: 'test-job-123',
        jobDescription: 'Security System Installation',
        sender: 'John Doe',
        senderType: 'client',
        messagePreview: 'When will the technician arrive?',
        clientUuid: 'client-123'
      }
    },
    {
      type: 'attachment_added',
      message: 'New attachment added to job',
      data: {
        jobId: 'test-job-123',
        jobDescription: 'Security System Installation',
        fileName: 'blueprint.pdf',
        clientUuid: 'client-123'
      }
    }
  ];

  const handleTestNotification = (notification) => {
    triggerNotification(notification.type, notification.message, notification.data);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🔔 Notification System Tester</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {unreadCount} unread
              </Badge>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testNotifications.map((notification, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold capitalize">
                    {notification.type.replace('_', ' ')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => handleTestNotification(notification)}
                    className="w-full"
                  >
                    Test This
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.slice(0, 10).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 border rounded ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium">{notification.title}</h5>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationTester;
