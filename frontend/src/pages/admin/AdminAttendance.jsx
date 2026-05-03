import React, { useState } from 'react';
import { Search, CalendarCheck, XCircle, CheckCircle, Clock } from 'lucide-react';
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
        // Actualizar el estado local para reflejar el cambio
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
          <h1 className="admin-page-title">Registro de Asistencia</h1>
          <p className="admin-page-subtitle">Verifica el código de la reserva cuando el cliente llegue a la cancha</p>
        </div>
      </div>

      <div className="verify-box">
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '1rem', maxWidth: '500px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ingresa el código (ej. GP-ABCD)"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              style={{ paddingLeft: '2.5rem', textTransform: 'uppercase' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !code.trim()}>
            {loading ? 'Buscando...' : 'Verificar'}
          </button>
        </form>

        {error && (
          <div className="verify-result error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '500px' }}>
            <XCircle size={18} /> {error}
          </div>
        )}

        {booking && (
          <div className="verify-result success" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} style={{ color: 'var(--primary-color)' }} />
                  ¡Reserva Encontrada!
                </h3>
                <span className="badge" style={{ fontSize: '0.75rem' }}>Estado: {booking.estado}</span>
              </div>
              <code style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                {booking.codigo_reserva}
              </code>
            </div>

            <div className="grid grid-cols-2" style={{ gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Cliente</div>
                <div style={{ fontWeight: 600 }}>{booking.profiles?.nombre || 'Usuario'}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Cancha</div>
                <div style={{ fontWeight: 600 }}>{booking.canchas?.nombre}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: '10px', gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{booking.fecha} a las {booking.hora?.substring(0,5)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Duración: 1 hora</div>
                </div>
              </div>
            </div>

            {booking.estado === 'confirmado' ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                  onClick={() => handleAction('attendance')}
                  disabled={actionLoading}
                >
                  <CalendarCheck size={18} /> Marcar Asistencia
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
                  onClick={() => handleAction('no-show')}
                  disabled={actionLoading}
                >
                  <XCircle size={18} /> Marcar Inasistencia
                </button>
              </div>
            ) : (
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                {booking.estado === 'completada' 
                  ? 'Esta reserva ya fue marcada como completada (el cliente asistió).'
                  : `Esta reserva no se puede gestionar porque su estado es "${booking.estado}".`
                }
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAttendance;
