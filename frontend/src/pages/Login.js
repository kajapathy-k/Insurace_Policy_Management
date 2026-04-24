import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', { username: form.username, password: form.password });
      login(res.data.access_token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match'); setLoading(false); return;
    }
    try {
      await api.post('/auth/register', {
        username: form.reg_username, email: form.email,
        full_name: form.full_name, password: form.password, phone: form.phone,
      });
      setTab('login');
      setForm({});
      setError('');
      alert('Registration successful! Please login.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">&#x1F6E1;</div>
          <h1>InsurePro</h1>
          <p>Insurance Policy Management System</p>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Register</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input className="form-control" placeholder="Enter username" required
                onChange={e => set('username', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-control" placeholder="Enter password" required
                onChange={e => set('password', e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 16 }}>
              Demo: admin / admin123
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" placeholder="John Doe" required onChange={e => set('full_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input className="form-control" placeholder="johndoe" required onChange={e => set('reg_username', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" placeholder="john@example.com" required onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" placeholder="+1 234 567 8900" onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" className="form-control" required onChange={e => set('password', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" className="form-control" required onChange={e => set('confirm_password', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
