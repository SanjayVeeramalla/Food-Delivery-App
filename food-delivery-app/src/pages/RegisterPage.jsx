import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return false;
    }
    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError('Enter a valid 10 digit mobile number starting with 6, 7, 8, or 9.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        name,
        email,
        password,
        phone,
      });
      setSuccess('Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const messages = Object.values(data.errors).flat();
        setError(messages[0] || 'Registration failed.');
      } else if (data?.message) {
        setError(data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Your full name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Minimum 6 characters"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                // Only allow digits
                const val = e.target.value.replace(/\D/g, '');
                setPhone(val);
                setError('');
              }}
              placeholder="10 digit mobile number"
              maxLength={10}
              disabled={loading}
            />
            {phone.length > 0 && phone.length < 10 && (
              <small style={{ color: '#e74c3c', fontSize: '12px' }}>
                {10 - phone.length} more digits needed
              </small>
            )}
            {phone.length === 10 && !/^[6-9]/.test(phone) && (
              <small style={{ color: '#e74c3c', fontSize: '12px' }}>
                Number must start with 6, 7, 8, or 9
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;