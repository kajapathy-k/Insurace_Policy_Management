import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];

// ─── Admin Dashboard ────────────────────────────────────────────────────────
function AdminDashboard({ policyStats, claimStats, paymentStats, navigate }) {
  const policyChartData = [
    { name: "Active", value: policyStats?.active || 0 },
    { name: "Pending", value: policyStats?.pending || 0 },
    { name: "Expired", value: policyStats?.expired || 0 },
    { name: "Cancelled", value: policyStats?.cancelled || 0 },
  ];
  const claimChartData = [
    { name: "Submitted", value: claimStats?.submitted || 0 },
    { name: "Under Review", value: claimStats?.under_review || 0 },
    { name: "Approved", value: claimStats?.approved || 0 },
    { name: "Paid", value: claimStats?.paid || 0 },
    { name: "Rejected", value: claimStats?.rejected || 0 },
  ];

  const pendingClaims =
    (claimStats?.submitted || 0) + (claimStats?.under_review || 0);
  const pendingPolicies = policyStats?.pending || 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">
            System-wide overview — all users, policies & operations
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/claims")}
          >
            Review Claims{" "}
            {pendingClaims > 0 && (
              <span
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  borderRadius: 12,
                  padding: "1px 7px",
                  fontSize: 11,
                  marginLeft: 6,
                }}
              >
                {pendingClaims}
              </span>
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/policies")}
          >
            Approve Policies{" "}
            {pendingPolicies > 0 && (
              <span
                style={{
                  background: "#fff",
                  color: "#6366f1",
                  borderRadius: 12,
                  padding: "1px 7px",
                  fontSize: 11,
                  marginLeft: 6,
                }}
              >
                {pendingPolicies}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Alert bar for pending actions */}
      {(pendingClaims > 0 || pendingPolicies > 0) && (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 20,
            display: "flex",
            gap: 24,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: "#92400e", fontSize: 13 }}>
              Action Required
            </strong>
            <div style={{ fontSize: 12, color: "#78350f", marginTop: 2 }}>
              {pendingClaims > 0 && (
                <span style={{ marginRight: 16 }}>
                  🔴 {pendingClaims} claim(s) awaiting review
                </span>
              )}
              {pendingPolicies > 0 && (
                <span>
                  🟡 {pendingPolicies} policy application(s) awaiting approval
                </span>
              )}
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/claims")}
          >
            Go to Claims →
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: "4px solid #2563eb" }}>
          <div className="stat-label">Total Policies (All Users)</div>
          <div className="stat-value">{policyStats?.total || 0}</div>
          <div className="stat-sub">
            {policyStats?.active || 0} active · {policyStats?.pending || 0}{" "}
            pending approval
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #dc2626" }}>
          <div className="stat-label">Claims Needing Review</div>
          <div
            className="stat-value"
            style={{ color: pendingClaims > 0 ? "#dc2626" : "#1f2937" }}
          >
            {pendingClaims}
          </div>
          <div className="stat-sub">
            {claimStats?.total || 0} total claims in system
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #059669" }}>
          <div className="stat-label">Total Coverage Issued</div>
          <div className="stat-value">
            ${(policyStats?.total_coverage || 0).toLocaleString()}
          </div>
          <div className="stat-sub">Across all active policies</div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #7c3aed" }}>
          <div className="stat-label">Revenue Collected</div>
          <div className="stat-value">
            ${(paymentStats?.total_paid || 0).toLocaleString()}
          </div>
          <div className="stat-sub">
            {paymentStats?.completed || 0} completed transactions
          </div>
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            Policy Status Distribution
          </h3>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
            All policies across all users
          </p>
          {policyStats?.total > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={policyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {policyChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No policies in system</p>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            Claims Pipeline
          </h3>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
            Claims by status — identify bottlenecks
          </p>
          {claimStats?.total > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={claimChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {claimChartData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No claims yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom summary row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: 16,
        }}
      >
        {[
          {
            label: "Approved Claims ($)",
            value: `$${(claimStats?.total_approved || 0).toLocaleString()}`,
            color: "#059669",
            sub: "Total approved amount",
            path: "/claims",
          },
          {
            label: "Claims Paid Out ($)",
            value: `$${(claimStats?.total_paid_amount || 0).toLocaleString()}`,
            color: "#2563eb",
            sub: "Disbursed to customers",
            path: "/claims",
          },
          {
            label: "Premiums Collected",
            value: `$${(paymentStats?.premium_paid || 0).toLocaleString()}`,
            color: "#7c3aed",
            sub: "All-time premium payments",
            path: "/payments",
          },
          {
            label: "Pending Payments",
            value: `$${(paymentStats?.pending_amount || 0).toLocaleString()}`,
            color: "#d97706",
            sub: `${paymentStats?.pending || 0} transactions pending`,
            path: "/payments",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(item.path)}
          >
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              {item.label}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: item.color,
                margin: "6px 0 2px",
              }}
            >
              {item.value}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Customer / Agent Dashboard ─────────────────────────────────────────────
function UserDashboard({
  policyStats,
  claimStats,
  paymentStats,
  navigate,
  user,
}) {
  const policyChartData = [
    { name: "Active", value: policyStats?.active || 0 },
    { name: "Pending", value: policyStats?.pending || 0 },
    { name: "Expired", value: policyStats?.expired || 0 },
    { name: "Cancelled", value: policyStats?.cancelled || 0 },
  ];

  const hasPolicies = (policyStats?.total || 0) > 0;
  const hasClaims = (claimStats?.total || 0) > 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">My Dashboard</div>
          <div className="page-subtitle">
            Welcome back, {user?.full_name || user?.username} — your personal
            insurance overview
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/claims")}
          >
            + File a Claim
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/policies")}
          >
            Browse Plans
          </button>
        </div>
      </div>

      {/* Onboarding nudge if no policies */}
      {!hasPolicies && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ color: "#1e40af", fontSize: 14 }}>
              You don't have any policies yet
            </strong>
            <p style={{ fontSize: 12, color: "#3b82f6", margin: "2px 0 0" }}>
              Browse our health, life, auto, home & travel plans and apply in
              minutes.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/policies")}
          >
            Browse Plans →
          </button>
        </div>
      )}

      {/* KPI cards — personal */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: "4px solid #2563eb" }}>
          <div className="stat-label">My Policies</div>
          <div className="stat-value">{policyStats?.total || 0}</div>
          <div className="stat-sub">
            {policyStats?.active || 0} active · {policyStats?.pending || 0}{" "}
            pending
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #7c3aed" }}>
          <div className="stat-label">My Claims</div>
          <div className="stat-value">{claimStats?.total || 0}</div>
          <div className="stat-sub">
            {claimStats?.approved || 0} approved · {claimStats?.submitted || 0}{" "}
            submitted
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #059669" }}>
          <div className="stat-label">My Coverage</div>
          <div className="stat-value">
            ${(policyStats?.total_coverage || 0).toLocaleString()}
          </div>
          <div className="stat-sub">Total active coverage</div>
        </div>
        <div className="stat-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div className="stat-label">Premiums Paid</div>
          <div className="stat-value">
            ${(paymentStats?.total_paid || 0).toLocaleString()}
          </div>
          <div className="stat-sub">
            {paymentStats?.completed || 0} payments made
          </div>
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            My Policy Breakdown
          </h3>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
            Status of your insurance policies
          </p>
          {hasPolicies ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={policyChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {policyChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <p>No policies yet</p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => navigate("/policies")}
              >
                Browse Plans
              </button>
            </div>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            My Claims Status
          </h3>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
            Track the progress of your claims
          </p>
          {hasClaims ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginTop: 8,
              }}
            >
              {[
                {
                  label: "Submitted",
                  val: claimStats?.submitted || 0,
                  color: "#6b7280",
                },
                {
                  label: "Under Review",
                  val: claimStats?.under_review || 0,
                  color: "#d97706",
                },
                {
                  label: "Approved",
                  val: claimStats?.approved || 0,
                  color: "#059669",
                },
                { label: "Paid", val: claimStats?.paid || 0, color: "#2563eb" },
                {
                  label: "Rejected",
                  val: claimStats?.rejected || 0,
                  color: "#dc2626",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <span style={{ width: 90, fontSize: 12, color: "#6b7280" }}>
                    {row.label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      background: "#f3f4f6",
                      borderRadius: 6,
                      height: 14,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${claimStats?.total ? (row.val / claimStats.total) * 100 : 0}%`,
                        background: row.color,
                        height: "100%",
                        borderRadius: 6,
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      color: row.color,
                    }}
                  >
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No claims filed yet</p>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 12 }}
                onClick={() => navigate("/claims")}
              >
                File a Claim
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick-action bottom row */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
      >
        <div
          className="card"
          style={{ cursor: "pointer", borderTop: "3px solid #2563eb" }}
          onClick={() => navigate("/policies")}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>📋</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>My Policies</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            View, manage or apply for new coverage
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#2563eb",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            Monthly premium: $
            {(policyStats?.total_premium || 0).toLocaleString()}
          </div>
        </div>
        <div
          className="card"
          style={{ cursor: "pointer", borderTop: "3px solid #7c3aed" }}
          onClick={() => navigate("/claims")}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>📂</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>My Claims</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Track status or file a new claim
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#059669",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            Approved: ${(claimStats?.total_approved || 0).toLocaleString()}
          </div>
        </div>
        <div
          className="card"
          style={{ cursor: "pointer", borderTop: "3px solid #d97706" }}
          onClick={() => navigate("/payments")}
        >
          <div style={{ fontSize: 22, marginBottom: 6 }}>💳</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>My Payments</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            View history or make a premium payment
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#d97706",
              marginTop: 8,
              fontWeight: 500,
            }}
          >
            Total paid: ${(paymentStats?.total_paid || 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [policyStats, setPolicyStats] = useState(null);
  const [claimStats, setClaimStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/policies/stats/summary"),
      api.get("/claims/stats/summary"),
      api.get("/payments/stats/summary"),
    ])
      .then(([p, c, pay]) => {
        setPolicyStats(p.data);
        setClaimStats(c.data);
        setPaymentStats(pay.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  if (user?.role === "admin") {
    return (
      <AdminDashboard
        policyStats={policyStats}
        claimStats={claimStats}
        paymentStats={paymentStats}
        navigate={navigate}
      />
    );
  }
  return (
    <UserDashboard
      policyStats={policyStats}
      claimStats={claimStats}
      paymentStats={paymentStats}
      navigate={navigate}
      user={user}
    />
  );
}
