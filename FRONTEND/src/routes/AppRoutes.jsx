import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ExamLayout from '../layouts/ExamLayout';

// Components
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import UploadPDF from '../pages/UploadPDF';
import GenerateTest from '../pages/GenerateTest';
import TakeTest from '../pages/TakeTest';
import Results from '../pages/Results';
import Analytics from '../pages/Analytics';
import Profile from '../pages/Profile';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Public Routes - Login / Register */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Routes - Dashboard Views */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload-pdf" element={<UploadPDF />} />
          <Route path="/generate-test" element={<GenerateTest />} />
          <Route path="/results/:id" element={<Results />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Protected Routes - Distraction-Free Exam View */}
        <Route element={<ExamLayout />}>
          <Route path="/take-test/:id" element={<TakeTest />} />
        </Route>
      </Route>

      {/* Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
