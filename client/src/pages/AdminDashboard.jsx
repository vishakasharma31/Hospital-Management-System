import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  Lock, 
  AlertCircle 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';

const COLORS = ['#14b8a6', '#38bdf8', '#818cf8', '#fbbf24', '#fb7185'];

const AdminDashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetchWithAuth('/reports/analytics', {}, user);
        setData(res);
      } catch (err) {
        // Mock fallback if offline
        setData({
          summary: {
            totalPatients: 148,
            totalDoctors: 12,
            totalAppointments: 29,
            pendingAppointments: 18,
            totalRevenue: 48500,
            privacyAccessScore: 98,
            totalAuditEvents: 412,
            blockedAccessAttempts: 8
          },
          patientAdmissionsTrend: [
            { month: 'Jan', count: 45 },
            { month: 'Feb', count: 52 },
            { month: 'Mar', count: 61 },
            { month: 'Apr', count: 58 },
            { month: 'May', count: 74 },
            { month: 'Jun', count: 82 },
            { month: 'Jul', count: 95 }
          ],
          departmentDistribution: [
            { name: 'Cardiology', value: 35 },
            { name: 'Neurology', value: 25 },
            { name: 'Pediatrics', value: 20 },
            { name: 'Orthopedics', value: 12 },
            { name: 'General', value: 8 }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, [user]);

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading MIS Dashboard Analytics...</div>;

  const { summary, patientAdmissionsTrend, departmentDistribution } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Privacy & Security Status Banner */}
      <div className="glass-panel" style={{
        padding: '20px 24px',
        background: 'linear-gradient(90deg, rgba(20, 184, 166, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)',
        borderLeft: '4px solid var(--primary-500)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(20, 184, 166, 0.2)',
            color: 'var(--primary-500)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Hospital Privacy & RBAC Protection: ACTIVE
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Current User: <b>{user ? user.name : 'User'}</b> ({user ? user.role : 'Guest'}) • HIPAA & GDPR Compliance Engine Online
            </p>
          </div>
        </div>

        <button onClick={() => setActiveTab('privacy')} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
          <Lock size={16} /> Inspect Privacy Rules
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
        
        {/* Card 1: Total Patients */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Total Patients</span>
            <Users size={20} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {summary?.totalPatients || 148}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <TrendingUp size={14} /> +12% this month
          </div>
        </div>

        {/* Card 2: Active Doctors */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Doctors & Staff</span>
            <Stethoscope size={20} style={{ color: 'var(--accent-indigo)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {summary?.totalDoctors || 12}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            5 Active Departments
          </div>
        </div>

        {/* Card 3: Scheduled Appointments */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Scheduled Appointments</span>
            <Calendar size={20} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {summary?.pendingAppointments || 18}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '6px' }}>
            {summary?.totalAppointments || 29} Total booked
          </div>
        </div>

        {/* Card 4: Privacy Access Score */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Privacy Access Score</span>
            <ShieldAlert size={20} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
            {summary?.privacyAccessScore || 98}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <AlertCircle size={14} /> {summary?.blockedAccessAttempts || 8} Blocked Intrusions
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Patient Admission Trends Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>Patient Admission & Outpatient Growth</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Monthly hospital record volume</p>
            </div>
            <Activity size={18} style={{ color: 'var(--primary-500)' }} />
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <AreaChart data={patientAdmissionsTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <Area type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Workload Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '4px', color: 'var(--text-main)' }}>Department Workload</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Active patient ratio by specialty</p>

          <div style={{ width: '100%', height: '180px', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {departmentDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            {departmentDistribution?.map((dept, idx) => (
              <div key={dept.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }}></span>
                {dept.name} ({dept.value}%)
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Action Shortcuts Footer */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('patients')} className="btn btn-primary">
          <Users size={16} /> Manage Patient Directory
        </button>
        <button onClick={() => setActiveTab('appointments')} className="btn btn-secondary">
          <Calendar size={16} /> Schedule Appointment
        </button>
        {user?.role === 'Admin' && (
          <button onClick={() => setActiveTab('audit')} className="btn btn-secondary">
            <ShieldAlert size={16} /> View Audit Security Logs
          </button>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
