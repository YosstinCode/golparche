import React, { useState } from 'react';
import { 
  Search, CalendarCheck, XCircle, CheckCircle, 
  Clock, User, MapPin, QrCode, AlertCircle,
  Loader2, CheckCircle2
} from 'lucide-react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = 'http://localhost:3001';

const AdminAttendance = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');
    setBooking(null);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/verify/${code.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Código no encontrado');
      } else {
        setBooking(data);
      }
    } catch (err) {
      setError('Error al verificar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!booking) return;
    setActionLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${booking.id}/${action}`, {
        method: 'PATCH',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al actualizar la reserva');
      } else {
        setBooking(data.reserva);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Asistencia</h1>
          <p className="admin-page-subtitle">Valida el acceso de los jugadores</p>
        </div>
      </div>

      <div className="attendance-container">
        {/* Search Section */}
        <div className="attendance-search-card admin-card">
          <form onSubmit={handleVerify} className="attendance-form">
            <div className="code-input-wrapper">
              <QrCode className="code-icon" size={20} />
              <input 
                type="text" 
                className="code-input" 
                placeholder="GP-XXXX"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary attendance-verify-btn" 
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Verificar <Search size={16} /></>
              )}
            </button>
          </form>

          {error && (
            <div className="attendance-error animate-slide">
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}
        </div>

        {/* Result Section */}
        {booking && (
          <div className="attendance-result animate-fade">
            <div className="result-grid">
              {/* Main Info */}
              <div className="booking-main-card admin-card">
                <div className="booking-header-row">
                  <span className={`status-badge ${booking.estado}`}>
                    {booking.estado === 'completada' ? 'Finalizada' : booking.estado}
                  </span>
                  <div className="booking-code-tag">
                    <span className="label">Código</span>
                    <span className="value">{booking.codigo_reserva}</span>
                  </div>
                </div>

                <h2 className="booking-title">{booking.canchas?.nombre}</h2>
                <p className="booking-subtitle">{booking.canchas?.tipo}</p>

                <div className="booking-details-list">
                  <div className="detail-row">
                    <div className="detail-icon"><User size={18} /></div>
                    <div className="detail-info">
                      <span className="label">Cliente</span>
                      <span className="value">{booking.profiles?.nombre || 'Usuario'}</span>
                    </div>
                  </div>
                  <div className="detail-row highlight">
                    <div className="detail-icon"><Clock size={18} /></div>
                    <div className="detail-info">
                      <span className="label">Horario</span>
                      <span className="value">{booking.fecha} • {booking.hora?.substring(0, 5)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Card */}
              <div className="booking-actions-card admin-card">
                <h3 className="actions-title">Acciones</h3>
                
                {booking.estado === 'confirmado' ? (
                  <div className="actions-buttons">
                    <button 
                      className="btn-action success"
                      onClick={() => handleAction('attendance')}
                      disabled={actionLoading}
                    >
                      <div className="action-icon"><CheckCircle2 size={24} /></div>
                      <div className="action-text">
                        <strong>Confirmar Entrada</strong>
                        <span>Marcar asistido</span>
                      </div>
                    </button>

                    <button 
                      className="btn-action danger"
                      onClick={() => handleAction('no-show')}
                      disabled={actionLoading}
                    >
                      <div className="action-icon"><XCircle size={24} /></div>
                      <div className="action-text">
                        <strong>Inasistencia</strong>
                        <span>Reportar falta</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="status-info-box">
                    <CheckCircle className="info-icon" size={32} />
                    <h4>Ya gestionada</h4>
                    <p>Estado actual: <strong>{booking.estado}</strong></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .attendance-container {
          max-width: 850px;
          margin: 0 auto;
        }

        /* Search Card */
        .attendance-search-card {
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 3px solid var(--admin-primary);
        }
        .attendance-form {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1rem;
        }
        .code-input-wrapper {
          position: relative;
        }
        .code-icon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--admin-primary);
        }
        .code-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3.25rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: 0.15em;
          transition: all 0.3s ease;
        }
        .code-input:focus {
          outline: none;
          border-color: var(--admin-primary);
          background: #fff;
          box-shadow: 0 5px 15px rgba(0, 153, 255, 0.08);
        }
        .attendance-verify-btn {
          padding: 0 1.75rem;
          border-radius: 12px;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .attendance-error {
          margin-top: 1rem;
          padding: 0.75rem 1rem;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 10px;
          color: #991b1b;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Result Section */
        .result-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 1.5rem;
        }

        .booking-main-card { padding: 1.5rem; }
        .booking-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        .booking-code-tag { text-align: right; }
        .booking-code-tag .label { display: block; font-size: 0.65rem; text-transform: uppercase; color: var(--admin-text-secondary); font-weight: 700; }
        .booking-code-tag .value { font-size: 1.1rem; font-weight: 900; color: var(--admin-primary); }

        .booking-title { font-size: 1.3rem; margin-bottom: 0.2rem; }
        .booking-subtitle { color: var(--admin-text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem; }

        .booking-details-list { display: grid; gap: 0.75rem; }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border-radius: 12px;
        }
        .detail-row.highlight { background: #f0f9ff; border-left: 3px solid var(--admin-primary); }
        .detail-icon { color: var(--admin-text-secondary); }
        .detail-row.highlight .detail-icon { color: var(--admin-primary); }
        .detail-info .label { display: block; font-size: 0.7rem; color: var(--admin-text-secondary); font-weight: 600; }
        .detail-info .value { font-weight: 700; color: #1e293b; font-size: 0.9rem; }

        /* Actions Card */
        .booking-actions-card { padding: 1.5rem; }
        .actions-title { font-size: 1rem; margin-bottom: 1.25rem; color: var(--admin-text-secondary); }
        .actions-buttons { display: grid; gap: 0.85rem; }
        
        .btn-action {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          border: 1.5px solid transparent;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fff;
        }
        .btn-action.success { background: #f0fdf4; border-color: #dcfce7; color: #166534; }
        .btn-action.danger { background: #fef2f2; border-color: #fee2e2; color: #991b1b; }
        
        .action-text strong { display: block; font-size: 0.95rem; }
        .action-text span { font-size: 0.75rem; opacity: 0.8; }

        .status-info-box {
          text-align: center;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 16px;
          border: 2px dashed #e2e8f0;
          color: var(--admin-text-secondary);
        }
        .info-icon { color: var(--admin-primary); margin-bottom: 0.75rem; opacity: 0.3; }
        .status-info-box h4 { font-size: 1rem; color: #1e293b; margin-bottom: 0.25rem; }
        .status-info-box p { font-size: 0.85rem; }

        @media (max-width: 800px) {
          .result-grid { grid-template-columns: 1fr; }
          .attendance-form { grid-template-columns: 1fr; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminAttendance;
