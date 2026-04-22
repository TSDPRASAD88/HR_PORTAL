import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const Performance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (user?.id) {
      api.get('/attendance/my').then(r => setAttendance(r.data)).catch(() => {});
      api.get(`/feedback/employee/${user.id}`).then(r => setFeedbacks(r.data)).catch(() => {});
    }
  }, [user]);

  // Process last 4 weeks of attendance
  const weeklyData = (() => {
    const weeks = {};
    attendance.forEach(a => {
      const d = new Date(a.date);
      const wk = `Week ${Math.ceil(d.getDate() / 7)}`;
      if (!weeks[wk]) weeks[wk] = { week: wk, present: 0, lop: 0, hours: 0 };
      if (a.status === 'present') weeks[wk].present++;
      if (a.lopDeducted) weeks[wk].lop++;
      weeks[wk].hours += a.workHours || 0;
    });
    return Object.values(weeks).slice(-4);
  })();

  // Monthly rating trend from feedbacks
  const ratingData = (() => {
    const byMonth = {};
    feedbacks.forEach(f => {
      const m = f.month || f.createdAt?.slice(0, 7);
      if (!byMonth[m]) byMonth[m] = { month: m, rating: [], count: 0 };
      byMonth[m].rating.push(f.rating);
      byMonth[m].count++;
    });
    return Object.entries(byMonth).map(([m, v]) => ({
      month: m,
      avg: parseFloat((v.rating.reduce((a, b) => a + b, 0) / v.rating.length).toFixed(1)),
      count: v.count
    })).slice(-6);
  })();

  const totalPresent = attendance.filter(a => a.status === 'present').length;
  const totalLOP = attendance.filter(a => a.lopDeducted).length;
  const totalHours = attendance.reduce((s, a) => s + (a.workHours || 0), 0).toFixed(1);
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Performance Overview</h1>
        <p className="page-sub">Your attendance trends and performance ratings</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Present</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{totalPresent}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total LOP</div>
          <div className="stat-value" style={{ color: 'var(--red)' }}>{totalLOP}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Work Hours</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{totalHours}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Rating</div>
          <div className="stat-value" style={{ color: 'var(--orange)' }}>{avgRating}/5</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title">Weekly Attendance</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="present" fill="var(--green)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="lop" fill="var(--red)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title">Rating Trend</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ratingData}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="avg" stroke="var(--accent)" fill="url(#rg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All feedbacks */}
      <div className="card">
        <div className="card-title">All Feedback</div>
        {feedbacks.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>No feedback received yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {feedbacks.map(fb => (
              <div key={fb._id} style={{ padding: 14, background: 'var(--bg3)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge badge-${fb.type === 'achievement' ? 'green' : fb.type === 'improvement' ? 'orange' : 'blue'}`}>
                      {fb.type}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>by {fb.givenBy?.name}</span>
                  </div>
                  <span style={{ color: 'var(--orange)' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)' }}>{fb.comment}</p>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                  {new Date(fb.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance;