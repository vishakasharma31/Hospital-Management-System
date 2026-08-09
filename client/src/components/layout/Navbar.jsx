import React from 'react';
import { ShieldCheck, Eye, EyeOff, LogOut, User, RefreshCw, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePrivacy } from '../../context/PrivacyContext';

const Navbar = ({ activeTab }) => {
  const { user, switchRole, logout } = useAuth();
  const { globalAnonymization, toggleAnonymization } = usePrivacy();

  return (
    <header style={{
      height: '70px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Title / Path indicator */}
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700', textTransform: 'capitalize', color: 'var(--text-main)' }}>
          {activeTab.replace('-', ' ')}
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          St. Jude Medical Center • Confidential MIS Platform
        </p>
      </div>

      {/* Right Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Interactive Presentation Role Switcher Dropdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '6px 14px',
          borderRadius: '8px'
        }}>
          <RefreshCw size={14} style={{ color: 'var(--accent-blue)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-blue)' }}>Demo Switch Role:</span>
          <select 
            value={user ? user.role : 'Admin'} 
            onChange={(e) => switchRole(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="Admin" style={{ background: '#1e293b', color: '#fff' }}>👑 Admin (Alex Rivera)</option>
            <option value="Doctor" style={{ background: '#1e293b', color: '#fff' }}>🩺 Doctor (Dr. Jenkins)</option>
            <option value="Staff" style={{ background: '#1e293b', color: '#fff' }}>📋 Receptionist/Staff (Mark)</option>
            <option value="Patient" style={{ background: '#1e293b', color: '#fff' }}>👤 Patient (John Doe)</option>
          </select>
        </div>

        {/* Global PII Anonymization Toggle */}
        <button
          onClick={toggleAnonymization}
          title="Toggle Global PII Masking & Data Anonymization"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '8px',
            background: globalAnonymization ? 'rgba(251, 191, 36, 0.15)' : 'var(--bg-surface-hover)',
            border: globalAnonymization ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
            color: globalAnonymization ? 'var(--accent-amber)' : 'var(--text-muted)',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {globalAnonymization ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{globalAnonymization ? 'PII MASKED (ANONYMOUS MODE)' : 'Standard Privacy Shield'}</span>
        </button>

        {/* User Info & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
          <img 
            src={user ? user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
            alt="User avatar" 
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }}
          />
          <div style={{ lineHeight: '1.2' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{user ? user.name : 'User'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{user ? user.department : 'Hospital Staff'}</div>
          </div>
          <button 
            onClick={logout} 
            title="Sign out"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '6px', marginLeft: '4px' }}
          >
            <LogOut size={18} />
          </button>
        </div>

      </div>
    </header>
  );
};

export default Navbar;
