import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, ShieldCheck, Lock, AlertTriangle, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePrivacy } from '../context/PrivacyContext';
import { fetchWithAuth } from '../services/api';
import PrivacyBadge from '../components/common/PrivacyBadge';

const PatientsPage = () => {
  const { user } = useAuth();
  const { globalAnonymization, maskSSN, maskPhone, maskAddress } = usePrivacy();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState('All');
  
  // Modals
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    ssn: '',
    phone: '',
    email: '',
    address: '',
    privacyLevel: 'Standard',
    medicalHistorySummary: ''
  });

  const loadPatients = async () => {
    setLoading(true);
    try {
      let endpoint = '/patients';
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (privacyFilter !== 'All') params.append('privacyLevel', privacyFilter);
      if (params.toString()) endpoint += `?${params.toString()}`;

      const res = await fetchWithAuth(endpoint, {}, user);
      setPatients(res);
    } catch (err) {
      // Fallback mock patients
      setPatients([
        {
          _id: '1',
          patientId: 'PAT-1001',
          name: 'John Doe',
          age: 42,
          gender: 'Male',
          bloodGroup: 'O+',
          ssn: '123-45-6789',
          phone: '+1 (555) 234-5678',
          email: 'john.doe@email.com',
          address: '742 Evergreen Terrace, Springfield, OR',
          privacyLevel: 'Standard',
          medicalHistorySummary: 'Hypertension, Seasonal Allergies'
        },
        {
          _id: '2',
          patientId: 'PAT-1002',
          name: 'Eleanor Vance',
          age: 68,
          gender: 'Female',
          bloodGroup: 'A-',
          ssn: '987-65-4321',
          phone: '+1 (555) 345-6789',
          email: 'eleanor.vance@email.com',
          address: '128 Hill House Lane, Boston, MA',
          privacyLevel: 'Confidential',
          medicalHistorySummary: 'Parkinson Tremor Evaluation'
        },
        {
          _id: '3',
          patientId: 'PAT-1003',
          name: 'Marcus Brody',
          age: 29,
          gender: 'Male',
          bloodGroup: 'B+',
          ssn: '456-78-9012',
          phone: '+1 (555) 456-7890',
          email: 'm.brody@museum.org',
          address: '42 Archeology Way, New York, NY',
          privacyLevel: 'Restricted',
          medicalHistorySummary: 'Post-op Cardiac Valve Replacement'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [user, privacyFilter, searchTerm]);

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient)
      }, user);
      setShowAddModal(false);
      loadPatients();
    } catch (err) {
      alert('Error creating patient: ' + err.message);
    }
  };

  // Determine if PII should be masked on client UI
  const isPIIMasked = (patient) => {
    if (globalAnonymization) return true;
    if (user?.role === 'Staff') return true;
    if (user?.role === 'Patient') return false; // Patient views own
    return false;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Patient Management Directory
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Role Access Level: <b>{user?.role}</b> • PII Masking: {user?.role === 'Staff' || globalAnonymization ? 'ENFORCED (Masked SSN & Contacts)' : 'FULL CLEARANCE'}
          </p>
        </div>

        {user?.role !== 'Patient' && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Register New Patient
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search patient name or Patient ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Privacy Level:</span>
          <select 
            className="form-select" 
            value={privacyFilter} 
            onChange={(e) => setPrivacyFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="All">All Privacy Tags</option>
            <option value="Standard">Standard</option>
            <option value="Confidential">Confidential</option>
            <option value="Restricted">Restricted Access</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Patient Records...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient ID & Name</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>SSN (PII)</th>
                  <th>Phone Number</th>
                  <th>Privacy Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No matching patient records found.
                    </td>
                  </tr>
                ) : (
                  patients.map((pat) => {
                    const masked = isPIIMasked(pat);
                    return (
                      <tr key={pat._id || pat.patientId}>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{pat.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontFamily: 'var(--font-mono)' }}>{pat.patientId}</div>
                        </td>
                        <td>{pat.age} yrs / {pat.gender}</td>
                        <td><span className="badge badge-purple">{pat.bloodGroup}</span></td>
                        <td>
                          {masked ? (
                            <span className="pii-masked">{maskSSN(pat.ssn)}</span>
                          ) : (
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{pat.ssn}</span>
                          )}
                        </td>
                        <td>
                          {masked ? (
                            <span className="pii-masked">{maskPhone(pat.phone)}</span>
                          ) : (
                            <span>{pat.phone}</span>
                          )}
                        </td>
                        <td>
                          <PrivacyBadge level={pat.privacyLevel} />
                        </td>
                        <td>
                          <button 
                            onClick={() => setSelectedPatient(pat)} 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            <Eye size={14} /> Dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedPatient.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-500)', fontFamily: 'var(--font-mono)' }}>{selectedPatient.patientId}</div>
              </div>
              <PrivacyBadge level={selectedPatient.privacyLevel} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: '600' }}>DEMOGRAPHICS</div>
                <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>Age: <b>{selectedPatient.age}</b> • Gender: <b>{selectedPatient.gender}</b></div>
                <div style={{ fontSize: '0.9rem', marginTop: '2px' }}>Blood Group: <b>{selectedPatient.bloodGroup}</b></div>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: '600' }}>PII CONTACT INFO</div>
                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                  Phone: {isPIIMasked(selectedPatient) ? <span className="pii-masked">{maskPhone(selectedPatient.phone)}</span> : selectedPatient.phone}
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>
                  Address: {isPIIMasked(selectedPatient) ? <span className="pii-masked">{maskAddress(selectedPatient.address)}</span> : selectedPatient.address}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>MEDICAL HISTORY SUMMARY</div>
              <div style={{
                padding: '14px',
                borderRadius: '8px',
                background: user?.role === 'Staff' && selectedPatient.privacyLevel !== 'Standard' ? 'rgba(251, 113, 133, 0.1)' : 'var(--bg-primary)',
                border: user?.role === 'Staff' && selectedPatient.privacyLevel !== 'Standard' ? '1px solid rgba(251, 113, 133, 0.3)' : '1px solid var(--border-color)',
                fontSize: '0.9rem',
                color: user?.role === 'Staff' && selectedPatient.privacyLevel !== 'Standard' ? 'var(--accent-rose)' : 'var(--text-main)'
              }}>
                {user?.role === 'Staff' && selectedPatient.privacyLevel !== 'Standard' 
                  ? '🔒 [RESTRICTED MEDICAL DATA - DOCTOR CLEARANCE REQUIRED]' 
                  : (selectedPatient.medicalHistorySummary || 'No chronic history logged.')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedPatient(null)} className="btn btn-secondary">Close Dossier</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              Register New Patient Record
            </h3>

            <form onSubmit={handleAddPatientSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input type="number" className="form-input" required value={newPatient.age} onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input type="text" className="form-input" required placeholder="O+, A-, etc." value={newPatient.bloodGroup} onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Privacy Tag</label>
                  <select className="form-select" value={newPatient.privacyLevel} onChange={(e) => setNewPatient({ ...newPatient, privacyLevel: e.target.value })}>
                    <option value="Standard">Standard</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted Access</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">SSN / National ID (PII)</label>
                  <input type="text" className="form-input" required placeholder="XXX-XX-XXXX" value={newPatient.ssn} onChange={(e) => setNewPatient({ ...newPatient, ssn: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="text" className="form-input" required placeholder="+1 (555) 000-0000" value={newPatient.phone} onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" required value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input type="text" className="form-input" required value={newPatient.address} onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Medical History Summary</label>
                <textarea className="form-textarea" value={newPatient.medicalHistorySummary} onChange={(e) => setNewPatient({ ...newPatient, medicalHistorySummary: e.target.value })}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Patient Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientsPage;
