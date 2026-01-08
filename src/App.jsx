import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { AuthGuard, GuestGuard } from './auth/AuthGuard';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AddEmployeePage from './pages/AddEmployeePage';
import BranchManagementPage from './pages/BranchManagementPage';
import AddBranchPage from './pages/AddBranchPage';
import ProfilePage from './pages/ProfilePage';
import TestConnection from './pages/TestConnection';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="users/add" element={<AddEmployeePage />} />
          <Route path="users/edit/:id" element={<AddEmployeePage />} />
          <Route path="branches" element={<BranchManagementPage />} />
          <Route path="branches/add" element={<AddBranchPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="test-connection" element={<TestConnection />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
