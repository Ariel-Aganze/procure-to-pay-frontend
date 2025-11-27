import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import CreateRequestForm from './pages/requests/CreateRequestForm';
import MyRequests from './pages/requests/MyRequests';
import AllRequests from './pages/requests/AllRequests';
import PendingApprovalsPage from './pages/requests/PendingApprovalsPage';
import ApprovedRequests from './pages/requests/ApprovedRequests';
import RequestDetailView from './pages/requests/RequestDetailView';
import RequestEditForm from './pages/requests/RequestEditForm';
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/settings/Settings';

// TEMPORARY: Mock user for demo purposes
const MockAuthProvider = ({ children }) => {
  const mockUser = {
    id: 1,
    username: 'demo_user',
    email: 'demo@company.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'staff', // Change this to test different roles: 'staff', 'approver_level_1', 'finance', 'admin'
  };

  const mockAuthValue = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: () => Promise.resolve({ success: true }),
    register: () => Promise.resolve({ success: true }),
    logout: () => {},
    updateUser: () => {},
    clearError: () => {},
    loadUser: () => {},
  };

  return (
    <div>
      {React.cloneElement(children, { authValue: mockAuthValue })}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* DEMO: Direct access to dashboard */}
            <Route path="/demo" element={
              <MockAuthProvider>
                <DashboardLayout />
              </MockAuthProvider>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="requests" element={<div className="p-8">All Requests - Coming Soon</div>} />
              <Route path="requests/my" element={<div className="p-8">My Requests - Coming Soon</div>} />
              <Route path="requests/create" element={<div className="p-8">Create Request - Coming Soon</div>} />
              <Route path="approvals" element={<div className="p-8">Pending Approvals - Coming Soon</div>} />
              <Route path="analytics" element={<div className="p-8">Analytics - Coming Soon</div>} />
              <Route path="users" element={<div className="p-8">Users - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-8">Settings - Coming Soon</div>} />
            </Route>
            
            {/* Protected dashboard routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="requests" element={<AllRequests />} />
              <Route path="requests/my" element={<MyRequests />} />
              <Route path="requests/create" element={<CreateRequestForm />} />
              <Route path="requests/approved" element={<ApprovedRequests />} />
              <Route path="requests/:id/view" element={<RequestDetailView />} />
              <Route path="requests/:id/edit" element={<RequestEditForm />} />
              <Route path="approvals" element={<PendingApprovalsPage />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;