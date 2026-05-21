import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getActivityMembers, saveAttendance } from '../api/attendanceApi';
import './MarkAttendance.css';

const OFFLINE_KEY = (id) => `attendance_offline_${id}`;

export default function MarkAttendance() {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Load members from API
  useEffect(() => {
    getActivityMembers(activityId)
      .then((res) => {
        setActivity(res.data.activity);
        // Each member: { id, name, household, status: 'PENDING' | 'PRESENT' | 'ABSENT' }
        const saved = JSON.parse(localStorage.getItem(OFFLINE_KEY(activityId)) || '[]');
        if (saved.length) {
          // Merge offline saved statuses into fetched members
          const map = Object.fromEntries(saved.map((r) => [r.memberId, r.status]));
          setMembers(res.data.members.map((m) => ({ ...m, status: map[m.id] || m.status })));
        } else {
          setMembers(res.data.members);
        }
      })
      .catch(() => {
        // Offline — try to load from localStorage
        const saved = JSON.parse(localStorage.getItem(OFFLINE_KEY(activityId)) || '[]');
        if (saved.length) {
          setMembers(saved.map((r) => ({ id: r.memberId, name: r.name, household: r.household, status: r.status })));
        } else {
          setError('Could not load members. Check your connection.');
        }
      })
      .finally(() => setLoading(false));
  }, [activityId]);

  // Track online/offline
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => { setIsOffline(false); syncOfflineData(); };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, [members]);

  const saveToOfflineQueue = (updatedMembers) => {
    const records = updatedMembers
      .filter((m) => m.status !== 'PENDING')
      .map((m) => ({ memberId: m.id, name: m.name, household: m.household, status: m.status }));
    localStorage.setItem(OFFLINE_KEY(activityId), JSON.stringify(records));
  };

  const syncOfflineData = useCallback(async () => {
    const saved = JSON.parse(localStorage.getItem(OFFLINE_KEY(activityId)) || '[]');
    if (!saved.length) return;
    setSyncing(true);
    try {
      await saveAttendance(activityId, saved);
      localStorage.removeItem(OFFLINE_KEY(activityId));
      setSyncMessage('Offline data synced successfully.');
      setTimeout(() => setSyncMessage(''), 4000);
    } catch {
      setSyncMessage('Sync failed. Will retry when connection is stable.');
    } finally {
      setSyncing(false);
    }
  }, [activityId]);

  const markMember = async (memberId, status) => {
    const updatedMembers = members.map((m) =>
      m.id === memberId ? { ...m, status } : m
    );
    setMembers(updatedMembers);

    if (isOffline) {
      saveToOfflineQueue(updatedMembers);
      return;
    }

    try {
      await saveAttendance(activityId, [{ memberId, status }]);
    } catch {
      // If save fails mid-session, queue it offline
      saveToOfflineQueue(updatedMembers);
    }
  };

  const marked = members.filter((m) => m.status !== 'PENDING').length;
  const present = members.filter((m) => m.status === 'PRESENT').length;
  const absent = members.filter((m) => m.status === 'ABSENT').length;

  if (loading) return <div className="ma-loading">Loading members…</div>;

  return (
    <div className="ma-container">
      {/* Offline banner */}
      {isOffline && (
        <div className="ma-banner ma-banner--offline">
          You are offline. Attendance is saved locally and will sync when you reconnect.
        </div>
      )}
      {syncing && (
        <div className="ma-banner ma-banner--syncing">Syncing offline data…</div>
      )}
      {syncMessage && (
        <div className="ma-banner ma-banner--success">{syncMessage}</div>
      )}

      {/* Header */}
      <div className="ma-header">
        <div>
          <h1 className="ma-title">Mark Attendance</h1>
          {activity && (
            <p className="ma-subtitle">
              {activity.name} · {activity.date} · {activity.location}
            </p>
          )}
        </div>
        <button
          className="ma-logout"
          onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
        >
          Sign Out
        </button>
      </div>

      {/* Summary bar */}
      <div className="ma-summary">
        <div className="ma-stat">
          <span className="ma-stat-value">{members.length}</span>
          <span className="ma-stat-label">Total</span>
        </div>
        <div className="ma-stat">
          <span className="ma-stat-value ma-stat-value--present">{present}</span>
          <span className="ma-stat-label">Present</span>
        </div>
        <div className="ma-stat">
          <span className="ma-stat-value ma-stat-value--absent">{absent}</span>
          <span className="ma-stat-label">Absent</span>
        </div>
        <div className="ma-stat">
          <span className="ma-stat-value ma-stat-value--pending">{members.length - marked}</span>
          <span className="ma-stat-label">Pending</span>
        </div>
      </div>

      {error && <div className="ma-error">{error}</div>}

      {/* Members list */}
      <ul className="ma-list">
        {members.map((member) => (
          <li key={member.id} className={`ma-item ${member.status === 'ABSENT' ? 'ma-item--absent' : ''}`}>
            <div className="ma-member-info">
              <span className="ma-member-name">{member.name}</span>
              <span className="ma-member-household">Household: {member.household}</span>
              {member.status === 'ABSENT' && (
                <span className="ma-flag">⚑ Flagged for penalty review</span>
              )}
            </div>
            <div className="ma-actions">
              <button
                className={`ma-btn ma-btn--present ${member.status === 'PRESENT' ? 'ma-btn--active' : ''}`}
                onClick={() => markMember(member.id, 'PRESENT')}
              >
                ✓ Present
              </button>
              <button
                className={`ma-btn ma-btn--absent ${member.status === 'ABSENT' ? 'ma-btn--active' : ''}`}
                onClick={() => markMember(member.id, 'ABSENT')}
              >
                ✗ Absent
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
