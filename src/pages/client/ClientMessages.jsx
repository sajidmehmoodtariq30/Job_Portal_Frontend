import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';

const ClientMessages = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      <Card>
        <CardHeader>
          <CardTitle>Chat with Support</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chat functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientMessages;
