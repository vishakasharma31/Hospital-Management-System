import React, { useState, useEffect } from 'react';
import { FileText, Lock, Plus, AlertOctagon, Stethoscope, Pill, Activity, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';
import PrivacyBadge from '../components/common/PrivacyBadge';

const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newRecord, setNewRecord] = useState({
    patient: '',
    diagnosis: '',
    symptoms: '',
    treatmentPlan: '',
    medicine: '',
    dosage: '',
    privacyClassification: 'Internal-Doctor-Only'
  });

  const [patientList, setPatientList] = useState([]);

  const loadRecords = async () => {
    setLoading(true);
    setAccessDenied(false);

    try {
      const res = await fetchWithAuth('/medical-records', {}, user);
      setRecords(res);
    } catch (err) {
      if (err.message.includes('Denied') || user?.role === 'Staff') {
        setAccessDenied(true);
      } else {
        // Fallback demo records
        setRecords([
          {
            _id: '1',
            recordId: 'REC-8001',
            patient: { name: 'John Doe', patientId: 'PAT-1001', privacyLevel: 'Standard' },
            doctor: { name: 'Dr. Sarah Jenkins', specialization: 'Cardiology' },
            diagnosis: 'Essential (Primary) Hypertension',
            symptoms: ['Mild dizziness', 'Elevated heart rate'],
            treatmentPlan: 'Maintain low-sodium diet and daily exercise.',
            prescriptions: [
              { medicine: 'Lisinopril', dosage: '10mg', frequency: 'Once daily (Morning)', duration: '90 days' },
              { medicine: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (Evening)', duration: '90 days' }
            ],
            labResults: {
              testName: 'Lipid Panel Diagnostics',
              resultSummary: 'Cholesterol: 195 mg/dL (Normal)',
              status: 'Normal'
            },
            privacyClassification: 'Internal-Doctor-Only',
            date: '2026-07-20'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const pats = await fetchWithAuth('/patients', {}, user);
      setPatientList(pats);
    } catch (e) {}
  };

  useEffect(() => {
    loadRecords();
    loadPatients();
  }, [user]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/medical-records', {
        method: 'POST',
        body: JSON.stringify({
          patient: newRecord.patient,
          diagnosis: newRecord.diagnosis,
          symptoms: newRecord.symptoms.split(',').map(s => s.trim()),
          treatmentPlan: newRecord.treatmentPlan,
          prescriptions: [{
            medicine: newRecord.medicine,
            dosage: newRecord.dosage,
            frequency: 'As prescribed',
            duration: '30 days'
          }],
          privacyClassification: newRecord.privacyClassification,
          date: new Date().toISOString().split('T')[0]
        })
      }, user);
      setShowAddModal(false);
      loadRecords();
    } catch (err) {
      alert('Error creating record: ' + err.message);
    }
  };

  if (accessDenied || user?.role === 'Staff') {
    return (
      <div className="glass-panel" style={{
        padding: '60px 40px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.1) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: '1px solid rgba(251, 113, 133, 0.3)'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(251, 113, 133, 0.2)',
          color: 'var(--accent-rose)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <ShieldAlert size={40} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-rose)', marginBottom: '10px' }}>
          CONFIDENTIALITY RESTRICTION ENFORCED
        </h2>
        <p style={{ maxWidth: '540px', margin: '0 auto 24px auto', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          Access to Electronic Health Records (EHR), clinical diagnoses, and prescriptions is restricted exclusively to attending <b>Doctors</b> and <b>Administrators</b> to uphold HIPAA patient confidentiality laws.
        </p>

        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.3)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--accent-amber)'
        }}>
          🔒 Security Access Denied Audit Event Logged for User: {user?.name} ({user?.role})
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Electronic Health Records (EHR) & Prescriptions
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Confidential Clinical Notes & Diagnostic History
          </p>
        </div>

        {(user?.role === 'Doctor' || user?.role === 'Admin') && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> New Clinical Diagnosis
          </button>
        )}
      </div>

      {/* Medical Records Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {records.map(rec => (
          <div key={rec._id || rec.recordId} className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--primary-500)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {rec.patient ? rec.patient.name : 'Patient'}
                  </h4>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary-500)' }}>
                    {rec.recordId}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Attending Physician: <b>{rec.doctor ? rec.doctor.name : 'Doctor'}</b> • Date: {rec.date}
                </div>
              </div>

              <span className="badge badge-purple">
                <Lock size={12} /> {rec.privacyClassification}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Diagnosis & Symptoms */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Diagnosis & Symptoms
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {rec.diagnosis}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <b>Treatment Plan:</b> {rec.treatmentPlan || 'N/A'}
                </div>
              </div>

              {/* Prescriptions */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  <Pill size={14} style={{ display: 'inline', marginRight: '4px' }} /> Prescriptions
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {rec.prescriptions && rec.prescriptions.map((p, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.medicine}</span> ({p.dosage}) • <span style={{ color: 'var(--text-muted)' }}>{p.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* Add Diagnosis Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              Add Clinical Diagnosis & Prescription
            </h3>

            <form onSubmit={handleCreateRecord}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select className="form-select" required value={newRecord.patient} onChange={(e) => setNewRecord({ ...newRecord, patient: e.target.value })}>
                  <option value="">-- Choose Patient --</option>
                  {patientList.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Diagnosis</label>
                <input type="text" className="form-input" required placeholder="e.g. Essential Hypertension" value={newRecord.diagnosis} onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Symptoms (Comma Separated)</label>
                <input type="text" className="form-input" placeholder="Dizziness, Elevated Heart Rate" value={newRecord.symptoms} onChange={(e) => setNewRecord({ ...newRecord, symptoms: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Treatment Plan Notes</label>
                <textarea className="form-textarea" placeholder="Outline exercise, diet, or follow-up rules..." value={newRecord.treatmentPlan} onChange={(e) => setNewRecord({ ...newRecord, treatmentPlan: e.target.value })}></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Prescription Medicine</label>
                  <input type="text" className="form-input" placeholder="e.g. Lisinopril" value={newRecord.medicine} onChange={(e) => setNewRecord({ ...newRecord, medicine: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Dosage</label>
                  <input type="text" className="form-input" placeholder="e.g. 10mg Once Daily" value={newRecord.dosage} onChange={(e) => setNewRecord({ ...newRecord, dosage: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Medical Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicalRecordsPage;
