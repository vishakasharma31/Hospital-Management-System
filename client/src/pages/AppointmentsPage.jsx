import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, CheckCircle2, XCircle, Stethoscope, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newAppt, setNewAppt] = useState({
    patient: '',
    doctor: '',
    date: '2026-08-15',
    time: '10:00 AM',
    department: 'Cardiology',
    type: 'Consultation',
    reason: ''
  });

  const [patientList, setPatientList] = useState([]);
  const [doctorList, setDoctorList] = useState([]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/appointments', {}, user);
      setAppointments(res);
    } catch (err) {
      setAppointments([
        {
          _id: '1',
          appointmentId: 'APT-2026-001',
          patient: { name: 'John Doe', patientId: 'PAT-1001' },
          doctor: { name: 'Dr. Sarah Jenkins', department: 'Cardiology' },
          date: '2026-08-12',
          time: '10:00 AM',
          department: 'Cardiology',
          type: 'Routine Checkup',
          status: 'Scheduled',
          reason: 'Blood pressure evaluation'
        },
        {
          _id: '2',
          appointmentId: 'APT-2026-002',
          patient: { name: 'Eleanor Vance', patientId: 'PAT-1002' },
          doctor: { name: 'Dr. Robert Chen', department: 'Neurology' },
          date: '2026-08-12',
          time: '11:30 AM',
          department: 'Neurology',
          type: 'Consultation',
          status: 'Scheduled',
          reason: 'Tremor assessment'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const pats = await fetchWithAuth('/patients', {}, user);
      const docs = await fetchWithAuth('/staff', {}, user);
      setPatientList(pats);
      setDoctorList(docs.filter(d => d.role === 'Doctor'));
    } catch (e) {}
  };

  useEffect(() => {
    loadAppointments();
    loadDropdowns();
  }, [user]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await fetchWithAuth(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      }, user);
      loadAppointments();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/appointments', {
        method: 'POST',
        body: JSON.stringify(newAppt)
      }, user);
      setShowAddModal(false);
      loadAppointments();
    } catch (err) {
      alert('Failed to create appointment: ' + err.message);
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    statusFilter === 'All' ? true : apt.status === statusFilter
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Appointment Scheduling & Workflow
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            View & Manage Hospital Consultations ({filteredAppointments.length} Appointments)
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Filter Status:</span>
        {['All', 'Scheduled', 'In-Progress', 'Completed', 'Cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Appointments List / Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Appointments...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient</th>
                  <th>Assigned Doctor</th>
                  <th>Date & Time</th>
                  <th>Department / Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No appointments matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map(apt => (
                    <tr key={apt._id || apt.appointmentId}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary-500)' }}>
                        {apt.appointmentId}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{apt.patient ? apt.patient.name : 'Patient'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{apt.reason}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{apt.doctor ? apt.doctor.name : 'Doctor'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{apt.department}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                          <Calendar size={14} style={{ color: 'var(--primary-500)' }} /> {apt.date}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                          <Clock size={12} /> {apt.time}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-purple">{apt.type || 'Consultation'}</span>
                      </td>
                      <td>
                        <span className={`badge ${apt.status === 'Completed' ? 'badge-success' : apt.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        {apt.status === 'Scheduled' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleUpdateStatus(apt._id, 'Completed')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                              <CheckCircle2 size={12} /> Complete
                            </button>
                            <button onClick={() => handleUpdateStatus(apt._id, 'Cancelled')} className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                              <XCircle size={12} /> Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>
              Book Hospital Appointment
            </h3>

            <form onSubmit={handleCreateAppointment}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select className="form-select" required value={newAppt.patient} onChange={(e) => setNewAppt({ ...newAppt, patient: e.target.value })}>
                  <option value="">-- Choose Patient --</option>
                  {patientList.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Doctor</label>
                <select className="form-select" required value={newAppt.doctor} onChange={(e) => setNewAppt({ ...newAppt, doctor: e.target.value })}>
                  <option value="">-- Choose Attending Physician --</option>
                  {doctorList.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input type="text" className="form-input" required placeholder="e.g. 10:30 AM" value={newAppt.time} onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Visit</label>
                <textarea className="form-textarea" required placeholder="Describe symptoms or purpose..." value={newAppt.reason} onChange={(e) => setNewAppt({ ...newAppt, reason: e.target.value })}></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AppointmentsPage;
