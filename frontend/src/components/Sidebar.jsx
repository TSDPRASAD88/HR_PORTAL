import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Clock, Calendar, BarChart2,
  MessageSquare, ClipboardList, Settings, LogOut, Users
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/attendance', icon: <Clock size={18} />, label: 'Attendance' },
    { to: '/leaves', icon: <Calendar size={18} />, label: 'Leaves' },
    { to: '/performance', icon: <BarChart2 size={18} />, label: 'Performance' },
    { to: '/feedback', icon: <MessageSquare size={18} />, label: 'Feedback' },
    { to: '/responsibilities', icon: <ClipboardList size={18} />, label: 'Responsibilities' },
  ];

  if (user?.role === 'admin' || user?.role === 'hr') {
    navItems.push({ to: '/admin', icon: <Users size={18} />, label: 'Admin Panel' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">HR</div>
        <span className="brand-name">HRPortal</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;