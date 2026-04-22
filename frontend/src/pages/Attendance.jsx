import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MapPin, LogIn, LogOut } from 'lucide-react';

const Attendance = () => {
  const { user } = useAuth();
  const [today, setToday] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [location, setLocation] = useState(null);

  const fetchData = async () => {
    const [t, r] = await Promise.all([
      api.get('/attendance/today').catch(() => ({ data: null })),
      api.get('/attendance/my').catch(() => ({ data: [] }))
    ]);
    setToday(t.data);
    setRecords(r.data);
  };

  useEffect(() => { fetchData(); }, []);

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const d = await r.json();
          setLocation({ lat, lng, address: d.display_name });
          setLocLoading(false);
          resolve({ lat, lng, address: d.display_name });
        } catch {
          setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          setLocLoading(false);
          resolve({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      },
      (err) => { setLocLoading(false); reject(err); }
    );
  });

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const loc = location || await getLocation();
      const res = await api.post('/attendance/checkin', loc);
      toast.success('Checked in successfully!');
      if (res.data.record.lopDeducted) toast('Late login — half-day LOP applied', { icon: '⚠️' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || 'Check-in failed');
    } finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      const loc = location || await getLocation();
      await api.post('/attendance/checkout', loc);
      toast.success('Checked out successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Check-out failed');
    } finally { setLoading(false); }
  };

  const statusBadge = (s) => {
    const m = { present: 'badge-green', absent: 'badge-red', late: 'badge-orange', 'half-day': 'badge-orange', lop: 'badge-red' };
    return <span className={`badge ${m[s] || 'badge-gray'}`}>{s}</span>;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-sub">Check in/out with live location tracking</p>
      </div>

      {/* Check-in Panel */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">Today's Attendance</div>

        {/* Location */}
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-outline" onClick={async () => { try { await getLocation(); toast.success('Location detected!'); } catch { toast.error('Location access denied'); } }} disabled={locLoading}>
            <MapPin size={15} />
            {locLoading ? 'Detecting...' : location ? 'Location Detected' : 'Detect My Location'}
          </button>
          {location && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)', padding: '8px 12px', background: 'var(--bg3)', borderRadius: 6 }}>
              <span className="location-dot" />
              {location.address.slice(0, 80)}...
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            className="btn btn-success"
            onClick={handleCheckIn}
            disabled={loading || (today?.checkIn !== undefined && today?.checkIn !== null)}
          >
            <LogIn size={15} />
            {today?.checkIn ? 'Already Checked In' : 'Check In'}
          </button>
          <button
            className="btn btn-danger"
            onClick={handleCheckOut}
            disabled={loading || !today?.checkIn || today?.checkOut}
          >
            <LogOut size={15} />
            {today?.checkOut ? 'Already Checked Out' : 'Check Out'}
          </button>
        </div>

        {today && (
          <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg3)', borderRadius: 8 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
              <span>Status: {statusBadge(today.status)}</span>
              {today.checkIn && <span>In: <strong>{new Date(today.checkIn).toLocaleTimeString()}</strong></span>}
              {today.checkOut && <span>Out: <strong>{new Date(today.checkOut).toLocaleTimeString()}</strong></span>}
              {today.workHours > 0 && <span>Hours: <strong>{today.workHours}h</strong></span>}
              {today.lopDeducted && <span className="badge badge-orange">Half-day LOP</span>}
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="card">
        <div className="card-title">Attendance History</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>LOP</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px' }}>No records found</td></tr>
              )}
              {records.map(r => (
                <tr key={r._id}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{r.date}</td>
                  <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '—'}</td>
                  <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '—'}</td>
                  <td>{r.workHours > 0 ? `${r.workHours}h` : '—'}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td>{r.lopDeducted ? <span className="badge badge-red">Yes</span> : <span className="badge badge-green">No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;