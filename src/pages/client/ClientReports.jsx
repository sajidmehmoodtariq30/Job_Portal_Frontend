import React from 'react';
import PermissionGuard from '@/components/client/PermissionGuard';
import { CLIENT_PERMISSIONS } from '@/types/clientPermissions';
import { useClientPermissions } from '@/hooks/useClientPermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/UI/card';
import { Button } from '@/components/UI/button';

const ClientReports = () => {
  const { checkPermission } = useClientPermissions();
  return (
    <PermissionGuard permission={CLIENT_PERMISSIONS.REPORTS_VIEW}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View a summary of all your services for the current period.
              </p>
              {checkPermission(CLIENT_PERMISSIONS.REPORTS_DOWNLOAD) && (
                <Button variant="outline">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Report
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default ClientReports;
