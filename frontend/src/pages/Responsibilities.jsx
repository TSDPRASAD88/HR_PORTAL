import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

const Responsibilities = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      api.get(`/employees/${user.id}`).then(r => {
        setProfile(r.data);
        setItems(r.data.responsibilities || []);
      }).catch(() => {});
    }
  }, [user]);

  const save = async (updated) => {
    setLoading(true);
    try {
      await api.put(`/employees/${user.id}/responsibilities`, { responsibilities: updated });
      toast.success('Responsibilities updated!');
    } catch {
      toast.error('Failed to save');
    } finally { setLoading(false); }
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = [...items, newItem.trim()];
    setItems(updated);
    setNewItem('');
    save(updated);
  };

  const removeItem = (i) => {
    const updated = items.filter((_, idx) => idx !== i);
    setItems(updated);
    save(updated);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Responsibilities</h1>
        <p className="page-sub">Manage your job responsibilities and tasks</p>
      </div>

      {profile && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>NAME</div><div style={{ fontWeight: 600 }}>{profile.name}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>DEPARTMENT</div><div style={{ fontWeight: 600 }}>{profile.department || '—'}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>POSITION</div><div style={{ fontWeight: 600 }}>{profile.position || '—'}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>JOINED</div><div style={{ fontWeight: 600 }}>{new Date(profile.joiningDate).toLocaleDateString()}</div></div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Responsibilities List</div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input
            className="form-input"
            placeholder="Add new responsibility..."
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={addItem} disabled={loading}>
            <Plus size={15} /> Add
          </button>
        </div>

        {items.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 13 }}>No responsibilities added yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 8 }}>
                <CheckCircle size={16} color="var(--green)" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13 }}>{item}</span>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}
                  onClick={() => removeItem(i)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Responsibilities;