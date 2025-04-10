import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/Layout/AppLayout.jsx'
import AdminLayout from './components/Layout/AdminLayout.jsx'
import ClientLayout from './components/Layout/ClientLayout.jsx'
import Home from './pages/Home.jsx'
import AdminHome from './pages/admin/AdminHome.jsx'
import ClientHome from './pages/client/ClientHome.jsx'
import Login from './pages/Login.jsx'
import AdminUsers from './pages/admin/AdminUser.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<AppLayout />} >
          <Route path='' element={<Home />} />
          <Route path='login' element={<Login />} />
        </Route>
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<ClientHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App