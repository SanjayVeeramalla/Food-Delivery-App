import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';

function ProfilePage() {
  const [profile, setProfile]   = useState(null);
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [form, setForm] = useState({
    name: '', phone: '', address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/auth/profile');
      setProfile(res.data);
      setForm({
        name:    res.data.name    || '',
        phone:   res.data.phone   || '',
        address: res.data.address || '',
      });
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return false;
    }
    if (!form.phone.trim()) {
      setError('Phone number is required.');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setError('Enter a valid 10 digit Indian mobile number.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await api.put('/api/auth/profile', {
        name:    form.name.trim(),
        phone:   form.phone.trim(),
        address: form.address.trim() || null,
      });
      setProfile(res.data);
      setEditing(false);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name:    profile?.name    || '',
      phone:   profile?.phone   || '',
      address: profile?.address || '',
    });
    setEditing(false);
    setError('');
  };

  if (loading) return (
    <div className="page-center">Loading profile...</div>
  );

  return (
    <div className="page">
      <div className="profile-header">
        <h2>My Profile</h2>
        {!editing && (
          <button
            className="btn-outline"
            onClick={() => { setEditing(true); setSuccess(''); }}
          >
            Edit Profile
          </button>
        )}
      </div>

      {error   && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-card">
        {!editing ? (
          // View mode
          <div className="profile-view">
            <div className="profile-row">
              <span className="profile-label">Name</span>
              <span className="profile-value">{profile?.name}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Email</span>
              <span className="profile-value">{profile?.email}</span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Phone</span>
              <span className="profile-value">
                {profile?.phone || 'Not set'}
              </span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Address</span>
              <span className="profile-value">
                {profile?.address || 'Not set'}
              </span>
            </div>
            <div className="profile-row">
              <span className="profile-label">Member since</span>
              <span className="profile-value">
                {new Date(profile?.createdAt)
                  .toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
              </span>
            </div>
          </div>
        ) : (
          // Edit mode
          <div className="profile-edit">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  setError('');
                }}
                placeholder="Your full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                style={{ background: '#f5f5f5', color: '#999' }}
              />
              <small style={{ color: '#999', fontSize: '12px' }}>
                Email cannot be changed
              </small>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, phone: val });
                  setError('');
                }}
                placeholder="10 digit mobile number"
                maxLength={10}
              />
              {form.phone.length > 0 &&
               form.phone.length < 10 && (
                <small style={{ color: '#e74c3c', fontSize: '12px' }}>
                  {10 - form.phone.length} more digits needed
                </small>
              )}
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })}
                placeholder="Your default delivery address"
              />
            </div>

            <div className="profile-actions">
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '10px 28px' }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="btn-outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;