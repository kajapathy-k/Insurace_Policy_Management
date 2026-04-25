import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function PolicyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [policy, setPolicy] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const getErrorMessage = (err, fallback) => {
    const detail = err?.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d?.msg || String(d)).join(", ");
    }
    return detail || err?.response?.data?.message || fallback;
  };

  const load = async () => {
    try {
      const [pRes, payRes] = await Promise.all([
        api.get(`/policies/${id}`),
        api.get(`/payments/policy/${id}`),
      ]);
      setPolicy(pRes.data);
      setPayments(payRes.data);
      setPageError("");
    } catch (err) {
      setPageError(getErrorMessage(err, "Failed to load policy details"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatusChange = async (status) => {
    setActionLoading(true);
    setPageError("");
    try {
      await api.put(`/policies/${id}`, { status });
      await load();
    } catch (err) {
      setPageError(getErrorMessage(err, "Unable to update policy status"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setPageError("");
    try {
      await api.post(`/policies/${id}/approve`);
      await load();
    } catch (err) {
      setPageError(getErrorMessage(err, "Unable to approve policy"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Reject this policy application?")) return;
    setActionLoading(true);
    setPageError("");
    try {
      await api.post(`/policies/${id}/reject`);
      await load();
    } catch (err) {
      setPageError(getErrorMessage(err, "Unable to reject policy"));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setPageError("");
    try {
      await api.post("/payments", {
        policy_id: parseInt(id),
        payment_type: "premium",
        amount: parseFloat(payForm.amount || policy.premium_amount),
        payment_method: payForm.payment_method || "bank_transfer",
        notes: payForm.notes,
      });
      setShowPayModal(false);
      await load();
    } catch (err) {
      setPageError(getErrorMessage(err, "Payment failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this policy?")) return;
    setPageError("");
    try {
      await api.delete(`/policies/${id}`);
      navigate("/policies");
    } catch (err) {
      setPageError(getErrorMessage(err, "Unable to cancel policy"));
    }
  };

  if (loading) return <div className="spinner" />;
  if (!policy) return <div>Policy not found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/policies")}
            style={{ marginBottom: 8 }}
          >
            ← Back
          </button>
          <div className="page-title">{policy.policy_number}</div>
          <div
            className="page-subtitle"
            style={{ textTransform: "capitalize" }}
          >
            {policy.policy_type} Insurance
          </div>
        </div>
        <div className="actions-bar">
          {policy.status === "active" && (
            <button
              className="btn btn-primary"
              onClick={() => setShowPayModal(true)}
            >
              Pay Premium
            </button>
          )}
          {user?.role === "admin" && policy.status === "pending" && (
            <>
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "✓ Approve"}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? "..." : "✗ Reject"}
              </button>
            </>
          )}
          {policy.status !== "cancelled" && policy.status !== "inactive" && (
            <button className="btn btn-danger" onClick={handleCancel}>
              Cancel Policy
            </button>
          )}
        </div>
      </div>

      {pageError && <div className="alert alert-error">{pageError}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Policy Details
          </h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Policy Type</label>
              <span style={{ textTransform: "capitalize" }}>
                {policy.policy_type}
              </span>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <span className={`badge badge-${policy.status}`}>
                {policy.status}
              </span>
            </div>
            <div className="detail-item">
              <label>Coverage Amount</label>
              <span>
                ${parseFloat(policy.coverage_amount).toLocaleString()}
              </span>
            </div>
            <div className="detail-item">
              <label>Premium Amount</label>
              <span>
                ${parseFloat(policy.premium_amount).toLocaleString()} /{" "}
                {policy.premium_frequency}
              </span>
            </div>
            <div className="detail-item">
              <label>Start Date</label>
              <span>{policy.start_date}</span>
            </div>
            <div className="detail-item">
              <label>End Date</label>
              <span>{policy.end_date}</span>
            </div>
            <div className="detail-item">
              <label>Beneficiary</label>
              <span>{policy.beneficiary_name || "-"}</span>
            </div>
            <div className="detail-item">
              <label>Relation</label>
              <span>{policy.beneficiary_relation || "-"}</span>
            </div>
          </div>
          {policy.description && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <label
                style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}
              >
                Description
              </label>
              <p style={{ fontSize: 14, color: "#374151", marginTop: 4 }}>
                {policy.description}
              </p>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
            Summary
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Total Payments
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {payments.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Total Paid</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>
                $
                {payments
                  .filter((p) => p.status === "completed")
                  .reduce((s, p) => s + parseFloat(p.amount), 0)
                  .toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Created</div>
              <div style={{ fontSize: 14 }}>
                {new Date(policy.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div
          style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb" }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <div className="empty-state">
            <p>No payments yet</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Payment #</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.payment_number}</strong>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {p.payment_type.replace("_", " ")}
                    </td>
                    <td>${parseFloat(p.amount).toLocaleString()}</td>
                    <td style={{ textTransform: "capitalize" }}>
                      {p.payment_method.replace("_", " ")}
                    </td>
                    <td>
                      <span className={`badge badge-${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {p.paid_date
                        ? new Date(p.paid_date).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Pay Premium</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPayModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    defaultValue={policy.premium_amount}
                    onChange={(e) =>
                      setPayForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    className="form-control"
                    onChange={(e) =>
                      setPayForm((f) => ({
                        ...f,
                        payment_method: e.target.value,
                      }))
                    }
                  >
                    {["credit_card", "debit_card", "bank_transfer", "upi"].map(
                      (m) => (
                        <option key={m} value={m}>
                          {m.replace("_", " ")}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    onChange={(e) =>
                      setPayForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPayModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
