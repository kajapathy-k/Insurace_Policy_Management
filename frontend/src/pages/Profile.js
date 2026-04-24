import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name, phone: user?.phone || '', address: user?.address || '' });
  const [pwForm, setPwForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put('/users/me', form);
      login(token, res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSubmitting(false); }
  };

  const handlePw = async (e) => {
    e.preventDefault();
    setPwError(''); setPwMsg('');
    if (pwForm.new_password !== pwForm.confirm) { setPwError('Passwords do not match'); return; }
    try {
      await api.post('/users/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      });
      setPwMsg('Password changed successfully');
      setPwForm({});
    } catch (err) {
      setPwError(err.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-subtitle">Manage your account details</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700 }}>
              {user?.full_name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.full_name}</div>
              <div style={{ fontSize: 13, color: '#6b7280', textTransform: 'capitalize' }}>{user?.role} · {user?.email}</div>
            </div>
          </div>

          {saved && <div className="alert alert-success">Profile updated successfully!</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-control" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" value={user?.email} disabled style={{ background: '#f9fafb', color: '#6b7280' }} />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" value={user?.username} disabled style={{ background: '#f9fafb', color: '#6b7280' }} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={form.phone} placeholder="+1 234 567 8900" onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea className="form-control" rows={3} value={form.address} placeholder="Your address" onChange={e => set('address', e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Change Password</h3>
          {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
          {pwError && <div className="alert alert-error">{pwError}</div>}
          <form onSubmit={handlePw}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" className="form-control" required
                value={pwForm.current_password || ''}
                onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-control" required
                value={pwForm.new_password || ''}
                onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" className="form-control" required
                value={pwForm.confirm || ''}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary">Change Password</button>
          </form>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Account Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Account Status</span>
                <span className="badge badge-active">Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Role</span>
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{user?.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6b7280' }}>Member Since</span>
                <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
