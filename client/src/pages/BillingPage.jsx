import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Plus, Printer, ShieldCheck, FileCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';

const BillingPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newInvoice, setNewInvoice] = useState({
    patient: '',
    description: 'Consultation & Diagnostics',
    cost: '250',
    dueDate: '2026-08-30'
  });

  const [patientList, setPatientList] = useState([]);

  const loadBilling = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/billing', {}, user);
      setInvoices(res);
    } catch (err) {
      setInvoices([
        {
          _id: '1',
          invoiceId: 'INV-5001',
          patient: { name: 'John Doe', patientId: 'PAT-1001' },
          items: [
            { description: 'Cardiology Consultation Fee', cost: 150 },
            { description: 'ECG Electrocardiogram Diagnostics', cost: 250 },
            { description: 'Laboratory Blood Work', cost: 120 }
          ],
          totalAmount: 520,
          insuranceClaimed: true,
          insuranceAmountCovered: 400,
          amountPaid: 120,
          paymentStatus: 'Paid',
          dueDate: '2026-08-30'
        },
        {
          _id: '2',
          invoiceId: 'INV-5002',
          patient: { name: 'Eleanor Vance', patientId: 'PAT-1002' },
          items: [
            { description: 'Neurology Specialist Consultation', cost: 220 },
            { description: 'Brain MRI Imaging Scan', cost: 1100 }
          ],
          totalAmount: 1320,
          insuranceClaimed: true,
          insuranceAmountCovered: 1000,
          amountPaid: 0,
          paymentStatus: 'Pending',
          dueDate: '2026-09-15'
        }
      ]);
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
    loadBilling();
    loadPatients();
  }, [user]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await fetchWithAuth('/billing', {
        method: 'POST',
        body: JSON.stringify({
          patient: newInvoice.patient,
          items: [{ description: newInvoice.description, cost: Number(newInvoice.cost) }],
          totalAmount: Number(newInvoice.cost),
          dueDate: newInvoice.dueDate
        })
      }, user);
      setShowAddModal(false);
      loadBilling();
    } catch (err) {
      alert('Failed to generate invoice: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Patient Billing & Insurance Claims
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Itemized Medical Invoices & Payment Ledger
          </p>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Staff') && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} /> Generate Invoice
          </button>
        )}
      </div>

      {/* Invoices Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Invoices...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Total Amount</th>
                  <th>Insurance Claim</th>
                  <th>Amount Paid</th>
                  <th>Payment Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id || inv.invoiceId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--primary-500)' }}>
                      {inv.invoiceId}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{inv.patient ? inv.patient.name : 'Patient'}</div>
                    </td>
                    <td style={{ fontWeight: '800', color: 'var(--text-main)' }}>${inv.totalAmount}</td>
                    <td>
                      {inv.insuranceClaimed ? (
                        <span className="badge badge-info"><FileCheck size={12} /> Claimed (${inv.insuranceAmountCovered})</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Direct Patient Pay</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>${inv.amountPaid}</td>
                    <td>
                      <span className={`badge ${inv.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelectedInvoice(inv)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                        <Printer size={12} /> Printable Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', pb: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>ST. JUDE MEDICAL CENTER</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Itemized Billing Invoice • {selectedInvoice.invoiceId}</p>
              </div>
              <span className={`badge ${selectedInvoice.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                {selectedInvoice.paymentStatus}
              </span>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
              <div>Billed To: <b>{selectedInvoice.patient?.name}</b></div>
              <div>Due Date: <b>{selectedInvoice.dueDate}</b></div>
            </div>

            <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: '700', marginBottom: '8px' }}>ITEMIZED CHARGES</div>
              {selectedInvoice.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>{item.description}</span>
                  <b>${item.cost}</b>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '800' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--primary-500)' }}>${selectedInvoice.totalAmount}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => window.print()} className="btn btn-primary"><Printer size={14} /> Print Receipt</button>
              <button onClick={() => setSelectedInvoice(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '16px', color: 'var(--text-main)' }}>Generate Medical Invoice</h3>
            <form onSubmit={handleCreateInvoice}>
              <div className="form-group">
                <label className="form-label">Select Patient</label>
                <select className="form-select" required value={newInvoice.patient} onChange={(e) => setNewInvoice({ ...newInvoice, patient: e.target.value })}>
                  <option value="">-- Choose Patient --</option>
                  {patientList.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <input type="text" className="form-input" required value={newInvoice.description} onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Total Cost ($)</label>
                  <input type="number" className="form-input" required value={newInvoice.cost} onChange={(e) => setNewInvoice({ ...newInvoice, cost: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Due Date</label>
                  <input type="date" className="form-input" required value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillingPage;
