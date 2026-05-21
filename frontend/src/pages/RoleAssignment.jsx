import { useState } from 'react';
import { searchUserByPhone, assignRole } from '../api/roleApi';
import './RoleAssignment.css';

const ROLES = ['Citizen', 'Isibo Leader', 'Village Leader'];

export default function RoleAssignment() {
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setUser(null);
    setSelectedRole('');
    setLoading(true);
    try {
      const res = await searchUserByPhone(phone);
      setUser(res.data);
      setSelectedRole(res.data.role || '');
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.status === 404
          ? 'No user found with that phone number.'
          : 'Search failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await assignRole(user.id, selectedRole);
      // Update the badge on the user card to reflect the new role immediately
      setUser((prev) => ({ ...prev, role: selectedRole }));
      setStatus({
        type: 'success',
        message: `Role updated to "${selectedRole}" for ${user.name} (${user.phone}).`,
      });
    } catch {
      setStatus({ type: 'error', message: 'Failed to assign role. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ra-container">
      <div className="ra-header">
        <div>
          <h1 className="ra-title">Role Assignment</h1>
          <p className="ra-subtitle">Search a registered phone number and assign or update their role.</p>
        </div>
        <button
          className="ra-logout"
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
        >
          Sign Out
        </button>
      </div>

      {/* Step 1 — Search */}
      <form className="ra-form" onSubmit={handleSearch}>
        <label htmlFor="phone">Phone Number</label>
        <div className="ra-row">
          <input
            id="phone"
            type="tel"
            placeholder="+250 7XX XXX XXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading && !user ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {/* Step 2 — User found, assign role */}
      {user && (
        <form className="ra-form ra-assign" onSubmit={handleAssign}>
          <div className="ra-user-card">
            <span className="ra-user-name">{user.name}</span>
            <span className="ra-user-meta">{user.phone} · {user.village}</span>
            <span className="ra-badge">{user.role || 'No role'}</span>
          </div>

          <label htmlFor="role">Assign Role</label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            required
          >
            <option value="" disabled>Select a role…</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <button type="submit" className="ra-btn-primary" disabled={loading || !selectedRole}>
            {loading ? 'Saving…' : 'Save Role'}
          </button>
        </form>
      )}

      {/* Feedback */}
      {status.message && (
        <div className={`ra-alert ra-alert--${status.type}`} role="alert">
          {status.message}
        </div>
      )}
    </div>
  );
}
