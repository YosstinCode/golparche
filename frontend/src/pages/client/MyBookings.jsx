import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, ChevronRight, 
  Search, Filter, Trash2, History, 
  LayoutGrid, List, AlertCircle, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetch(`${API_BASE_URL}/bookings/user/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setBookings(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  const getStatusClass = (status) => {
    switch(status) {
      case 'confirmado': return 'status-success';
      case 'pagado': return 'status-pending';
      case 'cancelada': return 'status-danger';
      case 'completada': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="my-bookings-page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis <span className="text-gradient">Reservas</span></h1>
          <p className="page-subtitle">Gestiona tus partidos y revisa tu historial</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Nueva Reserva <Calendar size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando tu historial...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-icon-wrapper">
            <History size={48} className="empty-icon" />
          </div>
          <h2>Aún no tienes reservas</h2>
          <p>Parece que no has programado ningún partido todavía. ¡Es hora de saltar a la cancha!</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Ver canchas disponibles</button>
        </div>
      ) : (
        <div className="bookings-container">
          <div className="bookings-grid">
            {bookings.map(b => (
              <div key={b.id} className="booking-card glass-card">
                <div className="card-header">
                  <div className="court-info">
                    <h3 className="court-name">{b.canchas?.nombre}</h3>
                    <span className="court-type">{b.canchas?.tipo}</span>
                  </div>
                  <span className={`status-badge ${getStatusClass(b.estado)}`}>
                    {b.estado}
                  </span>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <Calendar size={16} />
                    <span>{b.fecha}</span>
                  </div>
                  <div className="info-row">
                    <Clock size={16} />
                    <span>{b.hora.substring(0, 5)} - 60 min</span>
                  </div>
                  <div className="info-row">
                    <MapPin size={16} />
                    <span>Sede Principal, Girardot</span>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="booking-price">
                    <span className="price-label">Total</span>
                    <span className="price-value">${b.precio_total?.toLocaleString('es-CO')}</span>
                  </div>
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/confirmation', { state: { booking: b } })}
                  >
                    Ver Ticket <ChevronRight size={16} />
                  </button>
                </div>

                {b.estado === 'cancelada' && b.precio_total > 0 && (
                  <div className="card-notice">
                    <AlertCircle size={14} />
                    <span>Reembolso pendiente en sede física</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bookings-notice">
            <Info size={18} />
            <p>Para cancelar o reprogramar una reserva confirmada, por favor contacta directamente con la administración.</p>
          </div>
        </div>
      )}

      <style>{`
        .my-bookings-page { padding-bottom: 6rem; }
        .page-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
          margin-bottom: 4rem; 
          flex-wrap: wrap; 
          gap: 2rem; 
        }
        .page-title { font-size: 3rem; margin-bottom: 0.5rem; }
        .page-subtitle { color: var(--text-muted); font-size: 1.1rem; }

        .loading-state { text-align: center; padding: 6rem 0; color: var(--text-muted); }

        .empty-state {
          text-align: center;
          padding: 6rem 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          max-width: 600px;
          margin: 0 auto;
        }
        .empty-icon-wrapper {
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.03);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .empty-icon { color: var(--text-dim); }
        .empty-state h2 { font-size: 2rem; }
        .empty-state p { color: var(--text-muted); max-width: 400px; line-height: 1.6; }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .booking-card {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          transition: var(--transition);
        }
        .booking-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 210, 255, 0.3);
        }

        .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .court-name { font-size: 1.5rem; margin-bottom: 0.25rem; }
        .court-type { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }

        .card-body { display: flex; flex-direction: column; gap: 0.75rem; }
        .info-row { display: flex; align-items: center; gap: 0.75rem; color: var(--text-muted); font-size: 0.9rem; }
        .info-row svg { color: var(--primary); }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .price-label { display: block; font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; margin-bottom: 0.2rem; }
        .price-value { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 800; color: var(--text-main); }

        .btn-sm { padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 10px; }

        .card-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 10px;
          color: var(--warning);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .bookings-notice {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(0, 210, 255, 0.05);
          padding: 1.5rem;
          border-radius: 20px;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .bookings-notice svg { color: var(--primary); flex-shrink: 0; }

        @media (max-width: 640px) {
          .bookings-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
