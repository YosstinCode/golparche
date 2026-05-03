import React, { useState, useEffect } from 'react';
import {
  CalendarDays, Clock, CheckCircle, Clock3, XCircle,
  AlertCircle, Ban, TrendingUp, DollarSign, Users,
  Activity
} from 'lucide-react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = 'http://localhost:3001';

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
    { label: 'Total Reservas',  value: stats.total_reservas, icon: Activity, color: '#00d2ff', bg: 'rgba(0, 210, 255, 0.1)' },
    { label: 'Reservas Hoy',    value: stats.reservas_hoy,   icon: Clock, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Pendientes',      value: stats.pendientes,      icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Ingresos Est.',   value: `$${(stats.confirmadas * 50000).toLocaleString()}`, icon: DollarSign, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
  ] : [];

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.5rem' }}>Panel de Control</h1>
          <p className="admin-page-subtitle" style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{formattedToday}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {STAT_CARDS.map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="stat-card modern-stat-card">
                <div className="stat-icon-circle" style={{ background: bg, color, width: '42px', height: '42px' }}>
                  <Icon size={20} />
                </div>
                <div className="stat-info">
                  <span className="stat-label" style={{ fontSize: '0.75rem' }}>{label}</span>
                  <span className="stat-value" style={{ fontSize: '1.2rem' }}>{value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-dashboard-grid">
            <div className="admin-card agenda-card">
              <div className="admin-card-header" style={{ padding: '1rem 1.5rem' }}>
                <h3 className="card-header-title" style={{ fontSize: '1rem' }}>
                  <CalendarDays size={18} /> Agenda de Hoy
                </h3>
                <div className="live-indicator" style={{ fontSize: '0.65rem' }}>
                  <span className="dot" style={{ width: '6px', height: '6px' }}></span> En Vivo
                </div>
              </div>
              
              <div className="admin-table-container">
                {todayBookings.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <CalendarDays size={32} className="empty-icon" />
                    <p style={{ fontSize: '0.85rem' }}>No hay reservas para hoy.</p>
                  </div>
                ) : (
                  <table className="admin-table mini-table">
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Cancha</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayBookings.map((b) => (
                        <tr key={b.id}>
                          <td><div className="time-pill" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>{b.hora?.substring(0, 5)}</div></td>
                          <td><span className="font-600" style={{ fontSize: '0.85rem' }}>{b.canchas?.nombre}</span></td>
                          <td className="text-secondary" style={{ fontSize: '0.8rem' }}>{b.profiles?.nombre || '—'}</td>
                          <td><span className={`badge ${b.estado}`} style={{ fontSize: '0.65rem' }}>{b.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="admin-card help-card" style={{ padding: '1.25rem' }}>
              <h3 className="card-header-title" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Acciones</h3>
              <div className="quick-actions-list" style={{ gap: '1rem' }}>
                <div className="action-tip">
                  <Users size={16} />
                  <div>
                    <strong style={{ fontSize: '0.8rem' }}>Acceso</strong>
                    <p style={{ fontSize: '0.7rem' }}>Valida códigos QR en puerta.</p>
                  </div>
                </div>
                <div className="action-tip">
                  <Activity size={16} />
                  <div>
                    <strong style={{ fontSize: '0.8rem' }}>Reportes</strong>
                    <p style={{ fontSize: '0.7rem' }}>Cierre de caja diario.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .modern-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }
        
        .stat-icon-circle {
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .stat-label { font-weight: 600; color: var(--admin-text-secondary); margin-bottom: 0.1rem; }
        .stat-value { font-weight: 800; color: #1e293b; font-family: 'Outfit', sans-serif; }

        .admin-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 1.5rem;
          align-items: start;
        }

        .card-header-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; }
        .live-indicator { display: flex; align-items: center; gap: 0.4rem; font-weight: 800; color: #ef4444; }
        .live-indicator .dot { background: #ef4444; border-radius: 50%; animation: pulse-red 1.5s infinite; }

        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(239, 68, 68, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .time-pill { background: #f1f5f9; border-radius: 8px; font-weight: 700; color: #475569; }
        .mini-table { font-size: 0.85rem; }
        .font-600 { font-weight: 600; }
        .text-secondary { color: var(--admin-text-secondary); }
        .quick-actions-list { display: grid; gap: 1rem; }
        .action-tip { display: flex; gap: 0.75rem; color: #475569; }
        .action-tip svg { color: var(--admin-primary); flex-shrink: 0; }
        .empty-state { text-align: center; color: #94a3b8; }
        .empty-icon { opacity: 0.1; margin-bottom: 0.5rem; }

        @media (max-width: 1024px) {
          .admin-dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminDashboard;
