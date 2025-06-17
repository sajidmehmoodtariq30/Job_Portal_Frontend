// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import PasswordSetup from '@/pages/PasswordSetup'
import ResetPassword from '@/pages/ResetPassword'
import SignUp from '@/pages/SignUp'
import AppLayout from './components/Layout/AppLayout'
import AdminLayout from './components/Layout/AdminLayout'
import ClientLayout from './components/Layout/ClientLayout'
import AdminJobs from '@/pages/admin/AdminJobs'
import AdminJobDetails from '@/pages/admin/AdminJobDetails'
import AdminClientDetails from '@/pages/admin/AdminClientDetails.jsx'
import AdminClients from '@/pages/admin/AdminClients'
import AdminCategories from '@/pages/admin/AdminCategories'
import Home from './pages/Home'
import ClientHome from './pages/client/ClientHome'
import AdminHome from './pages/admin/AdminHome'
import AdminUser from './pages/admin/AdminUser'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminTeam from './pages/admin/AdminTeam'
import ClientJobs from './pages/client/ClientJobs.jsx'
import ClientJobDetails from './pages/client/ClientJobDetails.jsx'
import ClientSupport from './pages/client/ClientSupport.jsx'
import ClientSettings from './pages/client/ClientSettings.jsx'
import ClientSchedule from './pages/client/ClientSchedule.jsx'
import ClientReports from './pages/client/ClientReports.jsx'
import ClientMessages from './pages/client/ClientMessages.jsx'
import ClientInvoices from './pages/client/ClientInvoices.jsx'
import ClientSites from './pages/client/ClientSites.jsx'
import AdminProfile from '@/pages/admin/AdminProfile';
import ClientProfile from '@/pages/client/ClientProfile';
import AdminSettings from '@/pages/admin/AdminSettings';
import NotificationsSettings from '@/pages/admin/settings/NotificationsSettings';
import ApiPlugin from '@/pages/admin/ApiPlugin';
import { JobProvider } from './components/JobContext';
import { NotificationProvider } from './context/NotificationContext';
import { SessionProvider } from './context/SessionContext';
import { PermissionsProvider } from './context/PermissionsContext';
import { useToast } from '@/hooks/use-toast';
import { ToastContainer } from '@/components/UI/toast';
import { AdminProtectedRoute, ClientProtectedRoute } from './components/ProtectedRoute';
import TokenHandler from './components/TokenHandler';
import SessionWarningModal from './components/SessionWarningModal';
import ClientLinkingNotification from './components/ClientLinkingNotification';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { toasts, dismiss } = useToast();
  return (
    <ErrorBoundary>
      <Router>        <SessionProvider>
          <PermissionsProvider>
            <NotificationProvider>
              <JobProvider>
                <TokenHandler />
                <Routes>
              {/* Public Routes */}
              <Route element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/password-setup/:token" element={<PasswordSetup />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/SignUp" element={<SignUp />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }>                <Route index element={<AdminHome />} />
                <Route path="users" element={<AdminUser />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="jobs/:jobId" element={<AdminJobDetails />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="clients/:clientId" element={<AdminClientDetails />} />
                <Route path="api-plugin" element={<ApiPlugin />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="settings/notifications" element={<NotificationsSettings />} />
                
                {/* Legacy routes to maintain compatibility */}
                <Route path="schedule" element={<AdminSchedule />} />
                <Route path="team" element={<AdminTeam />} />
              </Route>              {/* Client Protected Routes */}
              <Route path="/client" element={
                <ClientProtectedRoute>
                  <ClientLayout />
                </ClientProtectedRoute>
              }>
                <Route index element={<ClientHome />} />
                <Route path="jobs" element={<ClientJobs />} />
                <Route path="jobs/:jobId" element={<ClientJobDetails />} />
                <Route path="sites" element={<ClientSites />} />
                <Route path="invoices" element={<ClientInvoices />} />
                <Route path="schedule" element={<ClientSchedule />} />
                <Route path="reports" element={<ClientReports />} />
                <Route path="messages" element={<ClientMessages />} />
                <Route path="support" element={<ClientSupport />} />
                <Route path="settings" element={<ClientSettings />} />
                <Route path="profile" element={<ClientProfile />} />
              </Route>

              {/* Default Redirects */}
              <Route path="*" element={<Navigate to="/login" replace />} />            </Routes>
            <SessionWarningModal />
            <ClientLinkingNotification />              <ToastContainer toasts={toasts} onDismiss={dismiss} />
            </JobProvider>
          </NotificationProvider>
        </PermissionsProvider>
      </SessionProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App