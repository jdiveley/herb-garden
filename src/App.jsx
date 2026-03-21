import React from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicSite from './PublicSite.jsx'
import AdminLogin from './admin/AdminLogin.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'
import RequireAuth from './admin/RequireAuth.jsx'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <RequireAuth>
          <AdminDashboard />
        </RequireAuth>
      } />
    </Routes>
  )
}
