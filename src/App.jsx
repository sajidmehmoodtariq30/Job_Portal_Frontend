// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from '@/pages/Login'
import SignUp from '@/pages/SignUp'
import AppLayout from './components/Layout/AppLayout'
import AdminLayout from './components/Layout/AdminLayout'
import ClientLayout from './components/Layout/ClientLayout'
import AdminJobs from '@/pages/admin/AdminJobs'
import AdminJobDetails from '@/pages/admin/AdminJobDetails'
import AdminClients from '@/pages/admin/AdminClients'
import AdminClientDetails from '@/pages/admin/AdminClientDetails'
import Home from './pages/Home'
import ClientHome from './pages/client/ClientHome'
import AdminHome from './pages/admin/AdminHome'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/SignUp" element={<SignUp />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/:jobId" element={<AdminJobDetails />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="clients/:clientId" element={<AdminClientDetails />} />
        </Route>

        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<ClientHome />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  )
}

export default App