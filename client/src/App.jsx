import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrivacyProvider } from './context/PrivacyContext';

import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PatientsPage from './pages/PatientsPage';
import StaffPage from './pages/StaffPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalRecordsPage from './pages/MedicalRecordsPage';
import BillingPage from './pages/BillingPage';
import ReportsPage from './pages/ReportsPage';
import PrivacySecurityPage from './pages/PrivacySecurityPage';
import AuditLogsPage from './pages/AuditLogsPage';

const MainLayout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar activeTab={activeTab} />

        <main style={{ flex: 1, padding: '28px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {activeTab === 'dashboard' && <AdminDashboard setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <PatientsPage />}
          {activeTab === 'staff' && <StaffPage />}
          {activeTab === 'appointments' && <AppointmentsPage />}
          {activeTab === 'records' && <MedicalRecordsPage />}
          {activeTab === 'billing' && <BillingPage />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'privacy' && <PrivacySecurityPage />}
          {activeTab === 'audit' && <AuditLogsPage />}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <MainLayout />
      </PrivacyProvider>
    </AuthProvider>
  );
};

export default App;
