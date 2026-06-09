import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingAssistant from '../components/FloatingAssistant';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-darkBg text-brand-textPrimary font-sans">
      {/* Header navigation bar */}
      <Navbar />

      {/* Content pane */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto flex flex-col">
        <Outlet />
      </main>

      {/* Global Floating AI Assistant Widget */}
      <FloatingAssistant />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;
