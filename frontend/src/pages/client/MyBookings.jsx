import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, CheckCircle, Clock3, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    
    fetch(`${API_BASE_URL}/bookings/mine?user_id=${user.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
      })
      .then(data => {
        setBookings(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('No pudimos cargar tus reservas. Intenta más tarde.');
        setLoading(false);
      });
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmado':
        return <span className="badge badge-success"><CheckCircle size={12} /> Confirmada</span>;
      case 'pagado':
        return <span className="badge badge-success"><CheckCircle size={12} /> Pagada</span>;
      case 'pendiente':
        return <span className="badge badge-warning" style={{ background: 'rgba(252, 163, 17, 0.2)', color: 'var(--accent-color)' }}><Clock3 size={12} /> Pendiente</span>;
      case 'cancelada':
      case 'inasistencia':
        return <span className="badge badge-error" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)' }}><XCircle size={12} /> {status === 'cancelada' ? 'Cancelada' : 'Inasistencia'}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }} onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
        </button>
        <h2 style={{ margin: 0 }}>Mis Reservas</h2>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div style={{ color: 'var(--danger-color)', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
          <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <h3>No tienes reservas aún</h3>
          <p>¡Anímate y reserva tu primera cancha para jugar con tus amigos!</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
            Ver canchas disponibles
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 grid-cols-1" style={{ gap: '1.5rem' }}>
          {bookings.map((booking) => {
            const court = booking.canchas;
            const date = new Date(booking.fecha + 'T12:00:00').toLocaleDateString('es-CO', {
              weekday: 'short', month: 'short', day: 'numeric'
            });

            return (
              <div key={booking.id} className="court-card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative' }}>
                  <img src={court?.imagen_url} alt={court?.nombre} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px 12px 0 0' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    {getStatusBadge(booking.estado)}
                  </div>
                </div>
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{court?.nombre}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} /> <span style={{ textTransform: 'capitalize' }}>{date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} /> {booking.hora} (1 hora)
                    </div>
                    {booking.codigo_reserva && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>Código: {booking.codigo_reserva}</span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                    {booking.estado === 'pendiente' ? (
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        onClick={() => navigate('/payment', { state: { booking } })}
                      >
                        Pagar ahora (${booking.precio_total?.toLocaleString('es-CO')})
                      </button>
                    ) : booking.estado === 'pagado' ? (
                      <button 
                        className="btn btn-outline" 
                        style={{ width: '100%' }}
                        onClick={() => navigate('/confirmation', { state: { confirmedBooking: booking } })}
                      >
                        Ver confirmación
                      </button>
                    ) : (
                      <div style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Total: ${booking.precio_total?.toLocaleString('es-CO')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
