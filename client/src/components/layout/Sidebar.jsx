import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Calendar, 
  FileText, 
  CreditCard, 
  BarChart3, 
  ShieldCheck, 
  FileSpreadsheet, 
  Lock, 
  HeartPulse,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  const role = user ? user.role : 'Admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Doctor', 'Staff', 'Patient'] },
    { id: 'patients', label: role === 'Patient' ? 'My Profile' : 'Patients Directory', icon: Users, roles: ['Admin', 'Doctor', 'Staff', 'Patient'] },
    { id: 'staff', label: 'Doctors & Staff', icon: UserPlus, roles: ['Admin', 'Doctor', 'Staff'] },
    { id: 'appointments', label: role === 'Patient' ? 'My Appointments' : 'Appointments', icon: Calendar, roles: ['Admin', 'Doctor', 'Staff', 'Patient'] },
    { id: 'records', label: role === 'Patient' ? 'My Health Records' : 'Medical Records (EHR)', icon: FileText, roles: ['Admin', 'Doctor', 'Patient'] },
    { id: 'billing', label: role === 'Patient' ? 'Invoices & Payments' : 'Billing & Claims', icon: CreditCard, roles: ['Admin', 'Staff', 'Patient'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['Admin', 'Doctor'] },
    { id: 'privacy', label: 'Privacy & Security Center', icon: ShieldCheck, roles: ['Admin', 'Doctor', 'Staff', 'Patient'] },
    { id: 'audit', label: 'Audit Security Logs', icon: FileSpreadsheet, roles: ['Admin'] },
  ];

  const allowedItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(20, 184, 166, 0.4)'
        }}>
          <HeartPulse size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            ST. JUDE MIS
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--primary-500)', fontWeight: '700' }}>
            <Lock size={10} /> PRIVACY PROTECTED
          </div>
        </div>
      </div>

      {/* Role Pill Banner */}
      <div style={{ padding: '16px 20px 8px 20px' }}>
        <div style={{
          padding: '8px 12px',
          borderRadius: '8px',
          background: 'rgba(20, 184, 166, 0.1)',
          border: '1px solid rgba(20, 184, 166, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>ACTIVE ROLE:</span>
          <span className={`badge ${role === 'Admin' ? 'badge-danger' : role === 'Doctor' ? 'badge-info' : role === 'Staff' ? 'badge-warning' : 'badge-success'}`}>
            {role}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: isActive ? 'linear-gradient(90deg, rgba(20, 184, 166, 0.18), rgba(20, 184, 166, 0.05))' : 'transparent',
                color: isActive ? 'var(--primary-500)' : 'var(--text-muted)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.9rem',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--primary-500)' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--primary-500)' : 'var(--text-subtle)' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-subtle)',
        textAlign: 'center'
      }}>
        <div>MIS Hospital System v2.4</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', marginTop: '2px' }}>
          🔒 Zero-Trust RBAC Active
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
