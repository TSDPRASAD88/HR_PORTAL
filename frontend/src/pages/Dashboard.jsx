import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BarChart2, Clock, Calendar, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    if (user?.id) {
      api.get(`/employees/${user.id}/stats`).then(r => setStats(r.data)).catch(() => {});
      api.get('/attendance/today').then(r => setTodayAttendance(r.data)).catch(() => {});
    }
  }, [user]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-sub">{dateStr} • {timeStr}</p>
      </div>

      {/* Today's Status */}
      <div className="checkin-card">
        <div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Today's Status</div>
          {todayAttendance ? (
            <div>
              <span className={`badge ${todayAttendance.checkOut ? 'badge-green' : 'badge-blue'}`}>
                {todayAttendance.checkOut ? '✓ Day Complete' : '● Currently Working'}
              </span>
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text2)' }}>
                Check-in: <strong style={{ color: 'var(--text)' }}>
                  {new Date(todayAttendance.checkIn).toLocaleTimeString()}
                </strong>
                {todayAttendance.checkOut && (
                  <> &nbsp;·&nbsp; Check-out: <strong style={{ color: 'var(--text)' }}>
                    {new Date(todayAttendance.checkOut).toLocaleTimeString()}
                  </strong></>
                )}
              </div>
              {todayAttendance.lopDeducted && (
                <div style={{ marginTop: 6 }}>
                  <span className="badge badge-orange">Half-day LOP Applied</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <span className="badge badge-gray">Not checked in yet</span>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
                Go to Attendance to check in
              </div>
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>
            {timeStr}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>{dateStr}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Present Days</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{stats?.presentDays ?? '—'}</div>
          <div className="stat-sub">This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">LOP Days</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{stats?.lopDays ?? '—'}</div>
          <div className="stat-sub">This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Late Arrivals</div>
          <div className="stat-value" style={{ color: 'var(--orange)' }}>{stats?.lateDays ?? '—'}</div>
          <div className="stat-sub">This month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Rating</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.avgRating ?? '—'}</div>
          <div className="stat-sub">Performance score</div>
        </div>
      </div>

      {/* Recent Feedbacks */}
      {stats?.feedbacks?.length > 0 && (
        <div className="card">
          <div className="card-title">Recent Feedback</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.feedbacks.map(fb => (
              <div key={fb._id} style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className={`badge badge-${fb.type === 'achievement' ? 'green' : fb.type === 'improvement' ? 'orange' : 'blue'}`}>
                    {fb.type}
                  </span>
                  <span style={{ color: 'var(--orange)', fontSize: 13 }}>{'★'.repeat(fb.rating)}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>{fb.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;