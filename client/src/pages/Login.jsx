import React, { useState } from 'react';
import { HeartPulse, Lock, ShieldCheck, UserCheck, Stethoscope, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onLoginSuccess }) => {
  const { login, DEMO_USERS } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      login(data.user, data.token);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (roleKey) => {
    const demoUser = DEMO_USERS[roleKey];
    login(demoUser, `demo-token-${roleKey.toLowerCase()}`);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-surface)'
      }}>
        {/* Left Side: Healthcare & Privacy Branding */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--border-color)'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(20, 184, 166, 0.15)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              color: 'var(--primary-500)',
              fontSize: '0.8rem',
              fontWeight: '700',
              marginBottom: '28px'
            }}>
              <ShieldCheck size={16} /> PRIVACY-ENFORCED MIS PLATFORM
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.25', marginBottom: '16px', color: '#fff' }}>
              St. Jude Hospital Information System
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
              Advanced Zero-Trust Hospital MIS engineered for college demonstration. Features role-based authorization, dynamic PII masking, EHR confidentiality, and immutable security audit logs.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              ⚡ Quick Demo Role Logins (Single-Click)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                onClick={() => handleQuickDemoLogin('Admin')} 
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                👑 <b>Admin</b>
              </button>
              <button 
                onClick={() => handleQuickDemoLogin('Doctor')} 
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                🩺 <b>Doctor</b>
              </button>
              <button 
                onClick={() => handleQuickDemoLogin('Staff')} 
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                📋 <b>Staff/Rec.</b>
              </button>
              <button 
                onClick={() => handleQuickDemoLogin('Patient')} 
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem' }}
              >
                👤 <b>Patient</b>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>
            Sign In to Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
            Enter your system credentials or use the quick role buttons.
          </p>

          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(251, 113, 133, 0.15)',
              border: '1px solid rgba(251, 113, 133, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleCustomLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="form-input" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, dr_jenkins, receptionist, john_doe"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to MIS Portal'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            🔒 End-to-End SSL & RBAC Permission Shield Active
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
