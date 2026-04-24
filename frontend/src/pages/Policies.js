import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const TYPE_ICONS = {
  health: "🏥",
  life: "❤️",
  auto: "🚗",
  home: "🏠",
  travel: "✈️",
};

export default function Policies() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatalog, setShowCatalog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    if (filterType) params.policy_type = filterType;
    api
      .get("/policies", { params })
      .then((r) => setPolicies(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterStatus, filterType]);
  useEffect(() => {
    api.get("/policy-plans").then((r) => setPlans(r.data));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleApply = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/policies", {
        plan_id: selectedPlan.id,
        start_date: form.start_date,
        end_date: form.end_date,
        beneficiary_name: form.beneficiary_name,
        beneficiary_relation: form.beneficiary_relation,
      });
      setShowCatalog(false);
      setSelectedPlan(null);
      setForm({});
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to apply for policy");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Policies</div>
          <div className="page-subtitle">
            {user?.role === "admin"
              ? "Manage all insurance policies"
              : "Your insurance policies"}
          </div>
        </div>
        {user?.role !== "admin" && (
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowCatalog(true);
              setSelectedPlan(null);
              setForm({});
              setError("");
            }}
          >
            + Apply for Policy
          </button>
        )}
      </div>

      <div className="filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {["active", "pending", "inactive", "expired", "cancelled"].map(
            (s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ),
          )}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {["health", "life", "auto", "home", "travel"].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="spinner" />
        ) : policies.length === 0 ? (
          <div className="empty-state">
            <h3>No Policies Found</h3>
            {user?.role !== "admin" && (
              <>
                <p>
                  Browse our plans and apply for your first insurance policy.
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 16 }}
                  onClick={() => setShowCatalog(true)}
                >
                  Browse Plans
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Policy #</th>
                  <th>Type</th>
                  <th>Coverage</th>
                  <th>Premium</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.policy_number}</strong>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      {TYPE_ICONS[p.policy_type]} {p.policy_type}
                    </td>
                    <td>${parseFloat(p.coverage_amount).toLocaleString()}</td>
                    <td>
                      ${parseFloat(p.premium_amount).toLocaleString()}/
                      {p.premium_frequency.replace("semi-annual", "6mo")}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {p.start_date} → {p.end_date}
                    </td>
                    <td>
                      <span className={`badge badge-${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/policies/${p.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Plan Catalog Modal */}
      {showCatalog && !selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowCatalog(false)}>
          <div
            className="modal"
            style={{ maxWidth: 780 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">Choose an Insurance Plan</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowCatalog(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
                Select a plan to apply. All plan terms are fixed — coverage,
                premium, and type are set by the insurer. Your application will
                be reviewed and approved by an admin.
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    style={{
                      border: "1.5px solid #e5e7eb",
                      borderRadius: 10,
                      padding: 16,
                      cursor: "pointer",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(99,102,241,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>
                        {TYPE_ICONS[plan.policy_type]}
                      </span>
                      <span
                        className={`badge badge-active`}
                        style={{ fontSize: 11 }}
                      >
                        {plan.policy_type}
                      </span>
                    </div>
                    <div
                      style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}
                    >
                      {plan.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        marginBottom: 10,
                        lineHeight: 1.5,
                      }}
                    >
                      {plan.description}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px solid #f3f4f6",
                        paddingTop: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          Coverage
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>
                          ${plan.coverage_amount.toLocaleString()}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          Premium
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#6366f1",
                          }}
                        >
                          ${plan.premium_amount}/
                          {plan.premium_frequency === "annual" ? "yr" : "mo"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCatalog(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {showCatalog && selectedPlan && (
        <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Apply — {selectedPlan.name}</span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedPlan(null)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div
                  style={{
                    background: "#f8f9fa",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    fontSize: 13,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div>
                      <span style={{ color: "#6b7280" }}>Type:</span>{" "}
                      <strong style={{ textTransform: "capitalize" }}>
                        {selectedPlan.policy_type}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280" }}>Coverage:</span>{" "}
                      <strong>
                        ${selectedPlan.coverage_amount.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#6b7280" }}>Premium:</span>{" "}
                      <strong style={{ color: "#6366f1" }}>
                        ${selectedPlan.premium_amount}/
                        {selectedPlan.premium_frequency === "annual"
                          ? "yr"
                          : "mo"}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      onChange={(e) => set("start_date", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      onChange={(e) => set("end_date", e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Beneficiary Name</label>
                    <input
                      className="form-control"
                      placeholder="Jane Doe"
                      onChange={(e) => set("beneficiary_name", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Beneficiary Relation</label>
                    <input
                      className="form-control"
                      placeholder="Spouse"
                      onChange={(e) =>
                        set("beneficiary_relation", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div
                  style={{
                    background: "#fffbeb",
                    border: "1px solid #fcd34d",
                    borderRadius: 8,
                    padding: 10,
                    fontSize: 12,
                    color: "#92400e",
                    marginTop: 8,
                  }}
                >
                  ⏳ Your application will be submitted as{" "}
                  <strong>pending</strong> and must be approved by an admin
                  before becoming active.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedPlan(null)}
                >
                  ← Back to Plans
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
