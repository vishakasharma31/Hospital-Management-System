import React, { useState, useEffect } from 'react';
import { UserPlus, Stethoscope, ShieldCheck, Mail, Phone, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';

const StaffPage = () => {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    username: '',
    email: '',
    role: 'Doctor',
    department: 'Cardiology',
    specialization: 'Cardiovascular Surgery',
    privacyClearance: 'High',
    password: 'password123'
  });

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/staff', {}, user);
      setStaffList(res);
    } catch (err) {
      setStaffList([
        {
          _id: '1',
          name: 'Dr. Sarah Jenkins',
          username: 'dr_jenkins',
          email: 's.jenkins@stjudehospital.org',
          role: 'Doctor',
          department: 'Cardiology',
          specialization: 'Cardiovascular Surgery',
          privacyClearance: 'High',
          avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'
        },
        {
          _id: '2',
          name: 'Dr. Robert Chen',
          username: 'dr_chen',
          email: 'r.chen@stjudehospital.org',
          role: 'Doctor',
          department: 'Neurology',
          specialization: 'Neuro-Oncology',
          privacyClearance: 'High',
          avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
        },
        {
          _id: '3',
          name: 'Nurse Mark Vance',
          username: 'receptionist',
          email: 'mark.vance@stjudehospital.org',
          role: 'Staff',
          department: 'Front Desk / Admissions',
          specialization: 'Admissions & Triage',
          privacyClearance: 'Standard',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [user]);

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/staff', {
        method: 'POST',
        body: JSON.stringify(newStaff)
      }, user);
      setShowAddModal(false);
      loadStaff();
    } catch (err) {
      alert('Error creating staff member: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Hospital Doctors & Staff Roster
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Authorized Medical Practitioners and Administrative Staff
          </p>
        </div>

        {user?.role === 'Admin' && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <UserPlus size={16} /> Add Staff Member
          </button>
        )}
      </div>

      {/* Staff Roster Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {staffList.map((member) => (
          <div key={member._id || member.username} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img 
                src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                alt={member.name}
                style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--primary-500)' }} 
              />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>{member.name}</h4>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <span className={`badge ${member.role === 'Admin' ? 'badge-danger' : member.role === 'Doctor' ? 'badge-info' : 'badge-warning'}`}>
                    {member.role}
                  </span>
                  <span className="badge badge-purple">{member.privacyClearance || 'High'} Clearance</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={14} style={{ color: 'var(--primary-500)' }} />
                <span>Department: <b>{member.department}</b></span>
              </div>
              {member.specialization && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Stethoscope size={14} style={{ color: 'var(--accent-blue)' }} />
                  <span>Specialty: <b>{member.specialization}</b></span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} style={{ color: 'var(--text-subtle)' }} />
                <span>{member.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              Add New Medical Staff Member
            </h3>

            <form onSubmit={handleAddStaffSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name & Credentials</label>
                <input type="text" className="form-input" required placeholder="e.g. Dr. Arthur Pendelton, MD" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-input" required value={newStaff.username} onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                    <option value="Doctor">Doctor</option>
                    <option value="Staff">Staff / Receptionist</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-input" required value={newStaff.department} onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input type="text" className="form-input" value={newStaff.specialization} onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StaffPage;
