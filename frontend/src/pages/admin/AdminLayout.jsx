import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, CalendarCheck, ClipboardList, LogOut, ArrowLeft, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin.css';

const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/admin',            icon: LayoutDashboard },
  { label: 'Reservas',    path: '/admin/bookings',   icon: ClipboardList },
  { label: 'Asistencia',  path: '/admin/attendance', icon: CalendarCheck },
  { label: 'Reportes',    path: '/admin/reports',    icon: BarChart2 },
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, profile } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-wrapper">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <Zap size={22} style={{ color: 'var(--primary-color)', flexShrink: 0 }} />
          <span>Golparche</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              className={`sidebar-link ${location.pathname === path ? 'active' : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span>👤 {profile?.nombre || 'Admin'}</span>
          </div>
          <button className="sidebar-link" onClick={() => navigate('/')} style={{ color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
            <ArrowLeft size={18} />
            <span>Volver al inicio</span>
          </button>
          <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--danger-color)' }}>
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
