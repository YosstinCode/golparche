import React, { useState, useEffect } from 'react';
import { Search, Ban, CalendarDays, Filter, ChevronDown, CheckCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = 'http://localhost:3001';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('');
  
  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filterState]);

  const fetchBookings = () => {
    setLoading(true);
    const url = filterState 
      ? `${API_BASE_URL}/admin/bookings?estado=${filterState}`
      : `${API_BASE_URL}/admin/bookings`;
      
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) return;
    setCanceling(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${selectedBooking.id}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: cancelReason })
      });
      
      if (res.ok) {
        setShowCancelModal(false);
        fetchBookings(); // Reload list
      } else {
        alert('Error al cancelar la reserva');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCanceling(false);
    }
  };

  const confirmPayment = async (booking) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${booking.id}/confirm`, {
        method: 'PATCH'
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert('Error al confirmar el pago');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestión de Reservas</h1>
          <p className="admin-page-subtitle">Visualiza, filtra y cancela reservas del sistema</p>
        </div>
      </div>

      <div className="admin-filters">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-secondary)' }} />
          <select 
            className="admin-filter-input" 
            style={{ paddingLeft: '2.2rem', appearance: 'none', paddingRight: '2rem' }}
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagado">Pagadas</option>
            <option value="confirmado">Confirmadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
            <option value="inasistencia">Inasistencias</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      <div className="admin-table-wrapper">
        {loading ? (
          <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center' }}>
            <div className="spinner"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Search size={40} style={{ opacity: 0.2, margin: '0 auto 0.75rem' }} />
            <p>No se encontraron reservas con los filtros actuales.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Cancha</th>
                <th>Cliente</th>
                <th>Código / Total</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.fecha}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.hora?.substring(0, 5)}</div>
                  </td>
                  <td>{b.canchas?.nombre}</td>
                  <td>{b.profiles?.nombre || 'Usuario'}</td>
                  <td>
                    {b.codigo_reserva ? (
                      <code style={{ color: 'var(--primary-color)' }}>{b.codigo_reserva}</code>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>—</span>
                    )}
                    <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                      ${b.precio_total?.toLocaleString('es-CO')}
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ fontSize: '0.7rem' }}>{b.estado}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="admin-action-group" style={{ justifyContent: 'flex-end' }}>
                      {b.estado === 'pagado' && (
                        <button className="btn-xs success" onClick={() => confirmPayment(b)}>
                          <CheckCircle size={12} /> Confirmar Pago
                        </button>
                      )}
                      {/* Solo se pueden cancelar si no están completadas/canceladas */}
                      {!['cancelada', 'completada', 'inasistencia'].includes(b.estado) && (
                        <button className="btn-xs danger" onClick={() => handleCancelClick(b)}>
                          <Ban size={12} /> Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal Cancelación ── */}
      {showCancelModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3 style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ban size={20} /> Cancelar Reserva
            </h3>
            <p>¿Estás seguro de cancelar la reserva del <strong>{selectedBooking?.fecha}</strong> a las <strong>{selectedBooking?.hora?.substring(0, 5)}</strong> en <strong>{selectedBooking?.canchas?.nombre}</strong>?</p>
            
            <div className="input-group" style={{ marginBottom: '0' }}>
              <label className="input-label">Motivo de cancelación (Obligatorio)</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Ej. Mantenimiento, cruce de horarios, etc."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <div className="admin-modal-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
              >
                Cerrar
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                onClick={confirmCancel}
                disabled={canceling || !cancelReason.trim()}
              >
                {canceling ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
