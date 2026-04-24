import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.payment_type = filterType;
    api.get('/payments', { params }).then(r => setPayments(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterType]);

  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(p.amount), 0);
  const premiums = payments.filter(p => p.payment_type === 'premium' && p.status === 'completed');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-subtitle">View all premium and claim payment history</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-label">Total Payments</div>
          <div className="stat-value">{payments.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Paid</div>
          <div className="stat-value">${totalPaid.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Premium Payments</div>
          <div className="stat-value">{premiums.length}</div>
          <div className="stat-sub">${premiums.reduce((s, p) => s + parseFloat(p.amount), 0).toLocaleString()} total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Claim Payouts</div>
          <div className="stat-value">{payments.filter(p => p.payment_type === 'claim_payout').length}</div>
        </div>
      </div>

      <div className="filters">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending','completed','failed','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="premium">Premium</option>
          <option value="claim_payout">Claim Payout</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={load}>Refresh</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? <div className="spinner" /> : payments.length === 0 ? (
          <div className="empty-state">
            <h3>No Payments Found</h3>
            <p>Pay a premium from your policy detail page to see transactions here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Payment #</th><th>Policy ID</th><th>Type</th>
                  <th>Amount</th><th>Method</th><th>Transaction ID</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.payment_number}</strong></td>
                    <td>Policy #{p.policy_id}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.payment_type.replace('_', ' ')}</td>
                    <td><strong>${parseFloat(p.amount).toLocaleString()}</strong></td>
                    <td style={{ textTransform: 'capitalize', fontSize: 13 }}>{p.payment_method?.replace(/_/g, ' ')}</td>
                    <td style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>{p.transaction_id || '-'}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td style={{ fontSize: 13 }}>{p.paid_date ? new Date(p.paid_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
