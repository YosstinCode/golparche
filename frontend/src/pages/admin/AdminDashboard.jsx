import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Clock, CheckCircle, Clock3, XCircle,
  AlertCircle, Ban, RotateCcw, TrendingUp
} from 'lucide-react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = 'http://localhost:3001';

const STATUS_CONFIG = {
  pendiente:    { label: 'Pendiente',    color: 'rgba(252,163,17,0.2)',   text: '#f59e0b', icon: Clock3 },
  pagado:       { label: 'Pagado',       color: 'rgba(96,165,250,0.2)',   text: '#60a5fa', icon: CheckCircle },
  confirmado:   { label: 'Confirmado',   color: 'rgba(74,222,128,0.2)',   text: '#4ade80', icon: CheckCircle },
  completada:   { label: 'Completada',   color: 'rgba(74,222,128,0.12)',  text: '#22c55e', icon: TrendingUp },
  cancelada:    { label: 'Cancelada',    color: 'rgba(239,68,68,0.15)',   text: '#ef4444', icon: Ban },
  inasistencia: { label: 'Inasistencia', color: 'rgba(239,68,68,0.1)',    text: '#f97316', icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'rgba(255,255,255,0.1)', text: 'inherit' };
  const Icon = cfg.icon || AlertCircle;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.25rem 0.6rem', borderRadius: '6px',
      background: cfg.color, color: cfg.text,
      fontSize: '0.75rem', fontWeight: 600,
    }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/admin/stats`).then(r => r.json()),
      fetch(`${API_BASE_URL}/admin/bookings?fecha=${today}`).then(r => r.json()),
    ]).then(([statsData, bookingsData]) => {
      setStats(statsData);
      setTodayBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [today]);

  const formattedToday = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const STAT_CARDS = stats ? [
    { label: 'Total Reservas',  value: stats.total_reservas, icon: CalendarDays, bg: 'rgba(96,165,250,0.1)',  color: '#60a5fa' },
    { label: 'Reservas Hoy',    value: stats.reservas_hoy,   icon: Clock,        bg: 'rgba(74,222,128,0.1)', color: 'var(--primary-color)' },
    { label: 'Pendientes',      value: stats.pendientes,      icon: Clock3,       bg: 'rgba(252,163,17,0.1)', color: '#f59e0b' },
    { label: 'Confirmadas',     value: stats.confirmadas,     icon: CheckCircle,  bg: 'rgba(74,222,128,0.1)', color: 'var(--primary-color)' },
    { label: 'Pagadas',         value: stats.pagadas,         icon: TrendingUp,   bg: 'rgba(96,165,250,0.1)', color: '#60a5fa' },
  ] : [];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle" style={{ textTransform: 'capitalize' }}>{formattedToday}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="admin-stats-grid">
            {STAT_CARDS.map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="stat-card">
                <div className="stat-card-icon" style={{ background: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="stat-card-value">{value}</div>
                <div className="stat-card-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Today's agenda */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={18} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Agenda de Hoy</h2>
          </div>

          <div className="admin-table-wrapper">
            {todayBookings.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <CalendarDays size={40} style={{ opacity: 0.2, margin: '0 auto 0.75rem' }} />
                <p>No hay reservas programadas para hoy.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Cancha</th>
                    <th>Cliente</th>
                    <th>Código</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {todayBookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.hora?.substring(0, 5)}</strong></td>
                      <td>{b.canchas?.nombre}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{b.profiles?.nombre || '—'}</td>
                      <td>
                        {b.codigo_reserva
                          ? <code style={{ color: 'var(--primary-color)', background: 'rgba(74,222,128,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{b.codigo_reserva}</code>
                          : <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>—</span>
                        }
                      </td>
                      <td><StatusBadge status={b.estado} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
