import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const AdminPanel = () => {
  const [tab, setTab] = useState('employees');
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee', department: '', position: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/employees').then(r => setEmployees(r.data)).catch(() => {});
    api.get('/leaves/all').then(r => setLeaves(r.data)).catch(() => {});
    api.get('/attendance/all').then(r => setAllAttendance(r.data)).catch(() => {});
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', newUser);
      toast.success('Employee created!');
      setNewUser({ name: '', email: '', password: '', role: 'employee', department: '', position: '' });
      api.get('/employees').then(r => setEmployees(r.data));
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create');
    } finally { setLoading(false); }
  };

  const handleLeaveAction = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status}!`);
      api.get('/leaves/all').then(r => setLeaves(r.data));
    } catch {
      toast.error('Failed to update');
    }
  };

  const statusBadge = (s) => {
    const m = { pending: 'badge-orange', approved: 'badge-green', rejected: 'badge-red' };
    return <span className={`badge ${m[s]}`}>{s}</span>;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-sub">Manage employees, leaves, and attendance</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'employees' ? 'active' : ''}`} onClick={() => setTab('employees')}>Employees ({employees.length})</button>
        <button className={`tab ${tab === 'leaves' ? 'active' : ''}`} onClick={() => setTab('leaves')}>Leave Requests ({leaves.filter(l => l.status === 'pending').length})</button>
        <button className={`tab ${tab === 'attendance' ? 'active' : ''}`} onClick={() => setTab('attendance')}>Attendance</button>
        <button className={`tab ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>+ Add Employee</button>
      </div>

      {tab === 'employees' && (
        <div className="card">
          <div className="card-title">All Employees</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Position</th><th>Joined</th></tr></thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e._id}>
                    <td><strong>{e.name}</strong></td>
                    <td style={{ color: 'var(--text2)' }}>{e.email}</td>
                    <td><span className="badge badge-blue">{e.role}</span></td>
                    <td>{e.department || '—'}</td>
                    <td>{e.position || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(e.joiningDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'leaves' && (
        <div className="card">
          <div className="card-title">Leave Requests</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l._id}>
                    <td><strong>{l.employee?.name}</strong><br /><span style={{ fontSize: 11, color: 'var(--text3)' }}>{l.employee?.department}</span></td>
                    <td><span className="badge badge-blue">{l.leaveType}</span></td>
                    <td>{new Date(l.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(l.toDate).toLocaleDateString()}</td>
                    <td>{l.days}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                    <td>{statusBadge(l.status)}</td>
                    <td>
                      {l.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => handleLeaveAction(l._id, 'approved')}>Approve</button>
                          <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 11 }} onClick={() => handleLeaveAction(l._id, 'rejected')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'attendance' && (
        <div className="card">
          <div className="card-title">All Attendance Records</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>LOP</th></tr></thead>
              <tbody>
                {allAttendance.slice(0, 50).map(a => (
                  <tr key={a._id}>
                    <td><strong>{a.employee?.name}</strong></td>
                    <td style={{ fontFamily: 'JetBrains Mono', fontSize: 12 }}>{a.date}</td>
                    <td>{a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'}</td>
                    <td>{a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}</td>
                    <td>{a.workHours > 0 ? `${a.workHours}h` : '—'}</td>
                    <td><span className={`badge badge-${a.status === 'present' ? 'green' : a.status === 'absent' ? 'red' : 'orange'}`}>{a.status}</span></td>
                    <td>{a.lopDeducted ? <span className="badge badge-red">Yes</span> : <span className="badge badge-green">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'add' && (
        <div className="card" style={{ maxWidth: 540 }}>
          <div className="card-title"><UserPlus size={16} style={{ marginRight: 8 }} />Add New Employee</div>
          <form onSubmit={handleCreateUser}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Position</label>
                <input className="form-input" value={newUser.position} onChange={e => setNewUser({ ...newUser, position: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;