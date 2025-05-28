import React, { useState, useEffect } from 'react';
import { FileBarChart, Search, Download } from 'lucide-react';
import { Button } from "../../components/UI/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Input } from "@/components/UI/input";
import PermissionGuard from '@/components/client/PermissionGuard';
import { CLIENT_PERMISSIONS } from '@/types/clientPermissions';
import { useClientPermissions } from '@/hooks/useClientPermissions';

const mockInvoices = [
  { id: 'INV-2025-0056', jobId: 'JOB-2025-0405', amount: 1250.00, status: 'Paid', dueDate: '2025-04-05', paidDate: '2025-04-08' },
  { id: 'INV-2025-0042', jobId: 'JOB-2025-0389', amount: 3200.00, status: 'Paid', dueDate: '2025-03-25', paidDate: '2025-03-24' },
  { id: 'INV-2025-0068', jobId: 'JOB-2025-0418', amount: 2750.00, status: 'Due', dueDate: '2025-04-25', paidDate: null },
];

const statusBadge = (status) => {
  switch (status) {
    case 'Paid':
      return <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
    case 'Due':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Due</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const ClientInvoices = () => {
  const { hasPermission } = useClientPermissions();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = invoices.filter(inv =>
    inv.id.toLowerCase().includes(search.toLowerCase()) ||
    inv.jobId.toLowerCase().includes(search.toLowerCase()) ||
    inv.status.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadInvoice = (invoiceId) => {
    console.log('Downloading invoice:', invoiceId);
  };

  const handlePayInvoice = (invoiceId) => {
    console.log('Paying invoice:', invoiceId);
  };
  return (
    <PermissionGuard 
      permission={CLIENT_PERMISSIONS.INVOICES_VIEW}
      fallback={
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <FileBarChart size={48} className="text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2 text-gray-600">Access Restricted</h3>
          <p className="text-gray-500 text-center max-w-md">
            You do not have permission to view invoices. Please contact your administrator to request access to invoice management features.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileBarChart className="text-blue-600" size={28} />
          <h1 className="text-3xl font-bold">Invoices</h1>
        </div>
        <div className="w-full max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by invoice, job, or status..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading invoices...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No invoices found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-3 px-4 text-left">Invoice ID</th>
                    <th className="py-3 px-4 text-left">Job ID</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Due/Paid</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(inv => (
                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{inv.id}</td>
                      <td className="py-3 px-4">{inv.jobId}</td>
                      <td className="py-3 px-4">${inv.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">{statusBadge(inv.status)}</td>
                      <td className="py-3 px-4">
                        {inv.status === 'Paid' && inv.paidDate ? (
                          <span className="text-green-700">Paid {new Date(inv.paidDate).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-yellow-700">Due {new Date(inv.dueDate).toLocaleDateString()}</span>
                        )}
                      </td>                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {hasPermission(CLIENT_PERMISSIONS.INVOICES_DOWNLOAD) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => handleDownloadInvoice(inv.id)}
                            >
                              <Download size={16} /> Download
                            </Button>
                          )}
                          {inv.status !== 'Paid' && hasPermission(CLIENT_PERMISSIONS.INVOICES_PAY) && (
                            <Button 
                              size="sm" 
                              className="flex items-center gap-1"
                              onClick={() => handlePayInvoice(inv.id)}
                            >
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}        </CardContent>
      </Card>
    </div>
    </PermissionGuard>
  );
};

export default ClientInvoices;