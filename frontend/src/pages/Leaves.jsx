import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' });
  const [loading, setLoading] = useState(false);

  const fetchLeaves = () => api.get('/leaves/my').then(r => setLeaves(r.data)).catch(() => {});

  useEffect(() => { fetchLeaves(); }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/leaves/apply', form);
      if (res.data.isLOP) {
        toast('Casual leave exhausted — applied as LOP', { icon: '⚠️' });
      } else {
        toast.success('Leave applied successfully!');
      }
      setShowForm(false);
      setForm({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to apply leave');
    } finally { setLoading(false); }
  };

  const statusBadge = (s) => {
    const m = { pending: 'badge-orange', approved: 'badge-green', rejected: 'badge-red' };
    return <span className={`badge ${m[s]}`}>{s}</span>;
  };

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-sub">1 casual leave per year · Remaining are LOP · Late login = half-day LOP</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={15} /> Apply Leave
        </button>
      </div>

      {/* Policy notice */}
      <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: 'var(--orange)' }}>
        📋 <strong>Leave Policy:</strong> You get 1 casual leave. All other leaves (including extra casual) are Loss of Pay (LOP). Late check-in (after 10:00 AM) = half-day LOP.
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Apply for Leave</div>
          <form onSubmit={handleApply}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select className="form-select" value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave (LOP)</option>
                  <option value="emergency">Emergency Leave (LOP)</option>
                  <option value="lop">Loss of Pay</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input type="date" className="form-input" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">To Date</label>
                <input type="date" className="form-input" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <textarea className="form-textarea" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Describe your reason..." required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Leave History */}
      <div className="card">
        <div className="card-title">Leave History</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>LOP</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>No leave records</td></tr>
              )}
              {leaves.map(l => (
                <tr key={l._id}>
                  <td><span className="badge badge-blue">{l.leaveType}</span></td>
                  <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                  <td>{new Date(l.toDate).toLocaleDateString()}</td>
                  <td>{l.days}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                  <td>{statusBadge(l.status)}</td>
                  <td>{l.isLOP ? <span className="badge badge-red">LOP</span> : <span className="badge badge-green">Paid</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaves;