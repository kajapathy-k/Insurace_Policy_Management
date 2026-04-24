import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CLAIM_TYPES = ['Accident', 'Medical', 'Property Damage', 'Theft', 'Natural Disaster', 'Death', 'Disability', 'Other'];

export default function Claims() {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    const params = filterStatus ? { status: filterStatus } : {};
    Promise.all([
      api.get('/claims', { params }),
      api.get('/policies', { params: { status: 'active' } }),
    ]).then(([c, p]) => { setClaims(c.data); setPolicies(p.data); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await api.post('/claims', {
        policy_id: parseInt(form.policy_id),
        claim_type: form.claim_type,
        claim_amount: parseFloat(form.claim_amount),
        description: form.description,
        incident_date: form.incident_date,
      });
      setShowModal(false); setForm({}); load();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to file claim');
    } finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Claims</div>
          <div className="page-subtitle">File and track insurance claims</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setError(''); setForm({}); }}>
          + File Claim
        </button>
      </div>

      <div className="filters">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['submitted','under_review','approved','rejected','paid'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={load}>Refresh</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? <div className="spinner" /> : claims.length === 0 ? (
          <div className="empty-state">
            <h3>No Claims Found</h3>
            <p>File a claim when you need to report an incident.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowModal(true)}>+ File Claim</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Claim #</th><th>Policy ID</th><th>Type</th>
                  <th>Amount</th><th>Incident Date</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.claim_number}</strong></td>
                    <td>Policy #{c.policy_id}</td>
                    <td>{c.claim_type}</td>
                    <td>${parseFloat(c.claim_amount).toLocaleString()}</td>
                    <td style={{ fontSize: 13 }}>{c.incident_date}</td>
                    <td><span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/claims/${c.id}`)}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">File a Claim</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label>Policy *</label>
                  <select className="form-control" required onChange={e => set('policy_id', e.target.value)}>
                    <option value="">Select active policy</option>
                    {policies.map(p => (
                      <option key={p.id} value={p.id}>{p.policy_number} ({p.policy_type})</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Claim Type *</label>
                    <select className="form-control" required onChange={e => set('claim_type', e.target.value)}>
                      <option value="">Select type</option>
                      {CLAIM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Claim Amount ($) *</label>
                    <input type="number" className="form-control" placeholder="5000" required onChange={e => set('claim_amount', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Incident Date *</label>
                  <input type="date" className="form-control" required onChange={e => set('incident_date', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-control" rows={4} placeholder="Describe the incident in detail..." required onChange={e => set('description', e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Filing...' : 'File Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
