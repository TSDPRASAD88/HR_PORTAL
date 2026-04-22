import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Feedback = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ employee: '', type: 'performance', rating: 0, comment: '' });
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('give');

  useEffect(() => {
    api.get('/employees').then(r => setEmployees(r.data)).catch(() => {});
    if (user?.id) api.get(`/feedback/employee/${user.id}`).then(r => setMyFeedbacks(r.data)).catch(() => {});
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) return toast.error('Please select a rating');
    setLoading(true);
    try {
      await api.post('/feedback', form);
      toast.success('Feedback submitted!');
      setForm({ employee: '', type: 'performance', rating: 0, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit feedback');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Feedback</h1>
        <p className="page-sub">Give feedback to colleagues and view yours</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'give' ? 'active' : ''}`} onClick={() => setTab('give')}>Give Feedback</button>
        <button className={`tab ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>My Feedback ({myFeedbacks.length})</button>
      </div>

      {tab === 'give' && (
        <div className="card">
          <div className="card-title">Submit Feedback</div>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Employee</label>
                <select className="form-select" value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} required>
                  <option value="">Select employee</option>
                  {employees.filter(e => e._id !== user?.id).map(e => (
                    <option key={e._id} value={e._id}>{e.name} — {e.department}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Feedback Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="performance">Performance</option>
                  <option value="behavior">Behavior</option>
                  <option value="achievement">Achievement</option>
                  <option value="improvement">Needs Improvement</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(n => (
                  <span
                    key={n}
                    className="star"
                    style={{ color: n <= form.rating ? 'var(--orange)' : 'var(--border)', fontSize: 28 }}
                    onClick={() => setForm({ ...form, rating: n })}
                  >★</span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea
                className="form-textarea"
                value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })}
                placeholder="Share your feedback in detail..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      )}

      {tab === 'mine' && (
        <div className="card">
          <div className="card-title">Feedback Received</div>
          {myFeedbacks.length === 0 ? (
            <p style={{ color: 'var(--text3)', fontSize: 13 }}>No feedback yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myFeedbacks.map(fb => (
                <div key={fb._id} style={{ padding: 14, background: 'var(--bg3)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className={`badge badge-${fb.type === 'achievement' ? 'green' : fb.type === 'improvement' ? 'orange' : 'blue'}`}>{fb.type}</span>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>from {fb.givenBy?.name}</span>
                    </div>
                    <span style={{ color: 'var(--orange)' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text2)' }}>{fb.comment}</p>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{new Date(fb.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Feedback;