import React from 'react';
import { ShieldCheck, Lock, EyeOff, CheckCircle2, XCircle, AlertTriangle, Key, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';

const PrivacySecurityPage = () => {
  const { user } = useAuth();
  const { globalAnonymization, toggleAnonymization } = usePrivacy();

  const rbacMatrix = [
    { module: 'Overall Hospital Dashboard', admin: 'FULL', doctor: 'LIMITED', staff: 'LIMITED', patient: 'PERSONAL' },
    { module: 'Patient Directory', admin: 'FULL', doctor: 'FULL', staff: 'MASKED PII', patient: 'SELF ONLY' },
    { module: 'Staff & Doctor Roster', admin: 'FULL VIEW / EDIT', doctor: 'VIEW ONLY', staff: 'VIEW ONLY', patient: 'NO ACCESS' },
    { module: 'Appointments & Scheduling', admin: 'FULL', doctor: 'ASSIGNED ONLY', staff: 'BOOK & MANAGE', patient: 'BOOK MY OWN' },
    { module: 'Medical Records (EHR)', admin: 'FULL', doctor: 'CREATE & VIEW', staff: 'BLOCKED 🔒', patient: 'MY RECORDS' },
    { module: 'Prescription Writing', admin: 'VIEW', doctor: 'CREATE & EDIT', staff: 'BLOCKED 🔒', patient: 'MY PRESCRIPTIONS' },
    { module: 'Billing & Invoices', admin: 'FULL', doctor: 'NO ACCESS', staff: 'GENERATE & PAY', patient: 'MY INVOICES' },
    { module: 'Security Audit Logs', admin: 'FULL AUDIT READ', doctor: 'NO ACCESS', staff: 'NO ACCESS', patient: 'NO ACCESS' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%)', borderLeft: '4px solid var(--primary-500)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-500)' }}>
              <ShieldCheck size={16} /> PRIVACY ARCHITECTURE & ZERO-TRUST SECURITY
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>
              Role-Based Access Control (RBAC) & Data Shield
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Protects sensitive patient health information (PHI) and PII using granular access permissions and dynamic masking.
            </p>
          </div>

          <button onClick={toggleAnonymization} className={`btn ${globalAnonymization ? 'btn-danger' : 'btn-primary'}`}>
            <EyeOff size={16} /> {globalAnonymization ? 'Disable Anonymization' : 'Enable Global PII Anonymization'}
          </button>
        </div>
      </div>

      {/* RBAC Matrix */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} style={{ color: 'var(--accent-amber)' }} /> Granular Permission Matrix (By Role)
        </h4>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>MIS Module / Resource</th>
                <th>👑 Admin Role</th>
                <th>🩺 Doctor Role</th>
                <th>📋 Receptionist / Staff</th>
                <th>👤 Patient Role</th>
              </tr>
            </thead>
            <tbody>
              {rbacMatrix.map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', color: 'var(--text-main)' }}>{row.module}</td>
                  <td><span className="badge badge-danger">{row.admin}</span></td>
                  <td><span className="badge badge-info">{row.doctor}</span></td>
                  <td><span className={row.staff.includes('BLOCKED') ? 'badge badge-danger' : 'badge badge-warning'}>{row.staff}</span></td>
                  <td><span className="badge badge-success">{row.patient}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HIPAA & Security Guarantees Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-emerald)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> PII Data Masking Rules
          </h5>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            SSN (`•••-••-1234`), Phone (`+1 (•••) •••-5678`), and Residential Addresses are automatically sanitized for non-clinical roles.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> Zero-Trust Access Logger
          </h5>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Every API endpoint access, patient dossier inspection, and blocked access attempt is logged with IP, role, and status.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-indigo)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} /> Patient Consent Control
          </h5>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Patients can explicitly grant or revoke consent for anonymized research data sharing under GDPR compliance rules.
          </p>
        </div>

      </div>

    </div>
  );
};

export default PrivacySecurityPage;
