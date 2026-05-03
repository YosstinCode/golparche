import React, { useState, useEffect } from 'react';
import { Search, Ban, Filter, ChevronDown, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import AdminLayout from './AdminLayout';

const API_BASE_URL = 'http://localhost:3001';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('');
  
  // Modal states - Cancellation
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
        fetchBookings();
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
      const data = await res.json();
      if (res.ok) {
        fetchBookings();
      } else {
        alert(data.error || 'Error al confirmar el pago');
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
          <p className="admin-page-subtitle">Visualiza y gestiona las reservas del sistema</p>
        </div>
      </div>

      <div className="admin-filters-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Filter size={16} style={{ position: 'absolute', left: '12px', color: 'var(--admin-text-secondary)' }} />
          <select 
            className="admin-filter-input" 
            style={{ paddingLeft: '2.5rem', appearance: 'none', paddingRight: '2.5rem', background: '#f8fafc' }}
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
          <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--admin-text-secondary)' }} />
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--admin-text-secondary)' }}>
          Total: <strong>{bookings.length}</strong> reservas encontradas
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          {loading ? (
            <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
              <div className="spinner"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--admin-text-secondary)' }}>
              <Search size={48} style={{ opacity: 0.1, margin: '0 auto 1rem' }} />
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
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-secondary)' }}>{b.hora?.substring(0, 5)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.canchas?.nombre}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-secondary)', textTransform: 'capitalize' }}>{b.canchas?.tipo}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.profiles?.nombre || 'Usuario'}</div>
                    </td>
                    <td>
                      {b.codigo_reserva ? (
                        <code style={{ color: 'var(--admin-primary)', fontWeight: 700 }}>{b.codigo_reserva}</code>
                      ) : (
                        <span style={{ color: 'var(--admin-text-secondary)' }}>—</span>
                      )}
                      <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--admin-text-secondary)' }}>
                        ${b.precio_total?.toLocaleString('es-CO')}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${b.estado}`}>{b.estado}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-action-group" style={{ justifyContent: 'flex-end' }}>
                        {['pendiente', 'pagado'].includes(b.estado) && (
                          <button className="btn-xs success" onClick={() => confirmPayment(b)} title="Confirmar reserva">
                            <CheckCircle size={14} /> Confirmar
                          </button>
                        )}
                        {!['cancelada', 'completada', 'inasistencia'].includes(b.estado) && (
                          <button className="btn-xs danger" onClick={() => handleCancelClick(b)} title="Cancelar">
                            <Ban size={14} /> Cancelar
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
      </div>

      {/* ── Modal Cancelación ── */}
      {showCancelModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal animate-slide">
            <h3 style={{ color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Ban size={22} /> Cancelar Reserva
            </h3>
            <p style={{ marginTop: '0.5rem' }}>¿Estás seguro de cancelar la reserva de <strong>{selectedBooking?.profiles?.nombre}</strong>?</p>
            
            <div className="input-group" style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
              <label className="input-label">Motivo de Cancelación</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="Indica el motivo de la cancelación..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ resize: 'none', background: '#f8fafc', color: '#1e293b' }}
              ></textarea>
            </div>

            {['pagado', 'confirmado', 'completada'].includes(selectedBooking?.estado) && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#991b1b', fontSize: '0.85rem', display: 'flex', gap: '0.75rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Importante:</strong> Esta reserva ya cuenta con un pago. Debes gestionar la devolución manualmente si corresponde.
                </span>
              </div>
            )}

            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setShowCancelModal(false)} disabled={canceling}>Cerrar</button>
              <button 
                className="btn btn-primary" 
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
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
