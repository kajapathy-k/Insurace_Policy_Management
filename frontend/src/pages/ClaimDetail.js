import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_FLOW = ['submitted', 'under_review', 'approved', 'paid'];

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/claims/${id}`);
      setClaim(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/claims/${id}`, {
        status: reviewForm.status,
        approved_amount: reviewForm.approved_amount ? parseFloat(reviewForm.approved_amount) : undefined,
        reviewer_notes: reviewForm.reviewer_notes,
      });
      setShowReviewModal(false);
      await load();
    } finally { setSubmitting(false); }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Withdraw this claim?')) return;
    await api.delete(`/claims/${id}`);
    navigate('/claims');
  };

  if (loading) return <div className="spinner" />;
  if (!claim) return <div>Claim not found</div>;

  const stepIndex = STATUS_FLOW.indexOf(claim.status);

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/claims')} style={{ marginBottom: 8 }}>← Back</button>
          <div className="page-title">{claim.claim_number}</div>
          <div className="page-subtitle">{claim.claim_type} Claim</div>
        </div>
        <div className="actions-bar">
          {user?.role === 'admin' && claim.status !== 'paid' && claim.status !== 'rejected' && (
            <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>Review Claim</button>
          )}
          {claim.status === 'submitted' && user?.role !== 'admin' && (
            <button className="btn btn-danger" onClick={handleWithdraw}>Withdraw Claim</button>
          )}
        </div>
      </div>

      {/* Status Stepper */}
      {claim.status !== 'rejected' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
            {STATUS_FLOW.map((step, i) => (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i <= stepIndex ? '#2563eb' : '#e5e7eb',
                    color: i <= stepIndex ? '#fff' : '#9ca3af', fontWeight: 700, fontSize: 14,
                  }}>{i < stepIndex ? '✓' : i + 1}</div>
                  <span style={{ fontSize: 12, color: i <= stepIndex ? '#2563eb' : '#6b7280', fontWeight: i === stepIndex ? 600 : 400, textTransform: 'capitalize' }}>
                    {step.replace('_', ' ')}
                  </span>
                </div>
                {i < STATUS_FLOW.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < stepIndex ? '#2563eb' : '#e5e7eb', margin: '0 8px', marginBottom: 20 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      {claim.status === 'rejected' && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          This claim has been rejected. {claim.reviewer_notes && `Reason: ${claim.reviewer_notes}`}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Claim Details</h3>
          <div className="detail-grid">
            <div className="detail-item"><label>Claim Number</label><span>{claim.claim_number}</span></div>
            <div className="detail-item"><label>Policy ID</label><span>Policy #{claim.policy_id}</span></div>
            <div className="detail-item"><label>Claim Type</label><span>{claim.claim_type}</span></div>
            <div className="detail-item"><label>Status</label><span className={`badge badge-${claim.status}`}>{claim.status.replace('_', ' ')}</span></div>
            <div className="detail-item"><label>Claimed Amount</label><span>${parseFloat(claim.claim_amount).toLocaleString()}</span></div>
            <div className="detail-item"><label>Approved Amount</label><span>{claim.approved_amount ? `$${parseFloat(claim.approved_amount).toLocaleString()}` : '-'}</span></div>
            <div className="detail-item"><label>Incident Date</label><span>{claim.incident_date}</span></div>
            <div className="detail-item"><label>Filed Date</label><span>{new Date(claim.filed_date).toLocaleDateString()}</span></div>
            {claim.resolved_date && (
              <div className="detail-item"><label>Resolved Date</label><span>{new Date(claim.resolved_date).toLocaleDateString()}</span></div>
            )}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Incident Description</label>
            <p style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>{claim.description}</p>
          </div>
          {claim.reviewer_notes && (
            <div style={{ marginTop: 12, padding: 12, background: '#f0f4ff', borderRadius: 8 }}>
              <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Reviewer Notes</label>
              <p style={{ fontSize: 14, color: '#374151', marginTop: 4 }}>{claim.reviewer_notes}</p>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Amount Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Claimed Amount</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>${parseFloat(claim.claim_amount).toLocaleString()}</div>
            </div>
            {claim.approved_amount && (
              <div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Approved Amount</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>${parseFloat(claim.approved_amount).toLocaleString()}</div>
              </div>
            )}
            <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Current Status</div>
              <div style={{ marginTop: 4 }}><span className={`badge badge-${claim.status}`}>{claim.status.replace('_', ' ')}</span></div>
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Review Claim</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleReview}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Update Status *</label>
                  <select className="form-control" required onChange={e => setReviewForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="">Select new status</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Approved Amount ($)</label>
                  <input type="number" className="form-control" placeholder="Leave blank to deny" onChange={e => setReviewForm(f => ({ ...f, approved_amount: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Reviewer Notes</label>
                  <textarea className="form-control" rows={3} placeholder="Decision notes..." onChange={e => setReviewForm(f => ({ ...f, reviewer_notes: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
