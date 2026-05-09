import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, MapPin, ChevronRight, 
  ArrowLeft, Info, Star, Users, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

const BookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { court } = location.state || {};

  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHora, setSelectedHora] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(false);

  const ALL_HOURS = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'];

  // Redirigir si no hay cancha seleccionada
  useEffect(() => {
    if (!court) navigate('/');
  }, [court, navigate]);

  useEffect(() => {
    if (court && fecha) {
      setLoading(true);
      fetch(`${API_BASE_URL}/availability?cancha_id=${court.id}&fecha=${fecha}`)
        .then(res => res.json())
        .then(data => {
          const available = Array.isArray(data.available_hours) ? data.available_hours : [];
          // Creamos el grid completo de horas marcando disponibilidad
          const fullSchedule = ALL_HOURS.map(h => ({
            hora: h,
            disponible: available.includes(h)
          }));
          setDisponibilidad(fullSchedule);
          setLoading(false);
          setSelectedHora(null);
        })
        .catch(() => {
          setDisponibilidad([]);
          setLoading(false);
        });
    }
  }, [court, fecha]);

  if (!court) return null;

  const handleContinue = () => {
    const bookingData = {
      ...court,
      cancha_id: court.id,
      cancha_nombre: court.nombre,
      fecha,
      hora: selectedHora,
      precio_total: court.precio_hora
    };
    navigate('/payment', { state: { booking: bookingData } });
  };

  return (
    <div className="checkout-page animate-fade">
      <div className="checkout-header">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> <span>Volver a canchas</span>
        </button>
        <h1 className="checkout-title">Reserva tu <span className="text-gradient">Turno</span></h1>
      </div>

      <div className="checkout-grid">
        {/* Left: Court Info */}
        <div className="court-detail-panel glass-card">
          <div className="detail-image-wrapper">
            <img src={court.imagen_url} alt={court.nombre} className="detail-image" />
            <div className="court-type-tag">{court.tipo}</div>
          </div>
          
          <div className="detail-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 className="court-name">{court.nombre}</h2>
                <div className="location-row">
                  <MapPin size={16} /> <span>Girardot, Cundinamarca</span>
                </div>
              </div>
              <div className="rating-box">
                <Star size={14} fill="var(--accent)" color="var(--accent)" />
                <span>4.9</span>
              </div>
            </div>

            <p className="court-description">
              Cancha reglamentaria con excelente iluminación LED, grama de alta calidad y zona de hidratación. Perfecta para torneos o partidos amistosos.
            </p>

            <div className="features-grid">
              <div className="feature-item">
                <Users size={18} />
                <span>5 vs 5</span>
              </div>
              <div className="feature-item">
                <Clock size={18} />
                <span>60 min</span>
              </div>
              <div className="feature-item">
                <CheckCircle size={18} />
                <span>Iluminación</span>
              </div>
            </div>

            <div className="price-summary">
              <span className="price-label">Precio por hora</span>
              <span className="price-amount">${court.precio_hora.toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        </div>

        {/* Right: Selection Panel */}
        <div className="selection-panel glass-card">
          <div className="panel-section">
            <h3 className="panel-title"><Calendar size={20} /> Selecciona la Fecha</h3>
            <div className="date-picker-wrapper">
              <input 
                type="date" 
                className="form-input custom-date"
                value={fecha}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>

          <div className="panel-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="panel-title"><Clock size={20} /> Horarios Disponibles</h3>
              {loading && <div className="spinner-sm"></div>}
            </div>

            <div className="slots-grid">
              {disponibilidad.map(slot => (
                <button
                  key={slot.hora}
                  disabled={!slot.disponible}
                  className={`slot-btn ${selectedHora === slot.hora ? 'selected' : ''}`}
                  onClick={() => setSelectedHora(slot.hora)}
                >
                  <span className="slot-time">{slot.hora.substring(0, 5)}</span>
                  <span className="slot-status">{slot.disponible ? 'Libre' : 'Ocupado'}</span>
                </button>
              ))}
            </div>

            {!loading && disponibilidad.length === 0 && (
              <div className="empty-slots">
                <Info size={24} />
                <p>No hay turnos disponibles para esta fecha.</p>
              </div>
            )}
          </div>

          <div className="selection-footer">
            <div className="summary-info">
              {selectedHora ? (
                <p className="summary-text">
                  Reserva para el <strong>{fecha}</strong> a las <strong>{selectedHora.substring(0, 5)}</strong>
                </p>
              ) : (
                <p className="summary-hint">Por favor selecciona un horario</p>
              )}
            </div>
            
            <button 
              className="btn btn-primary btn-full" 
              disabled={!selectedHora}
              onClick={handleContinue}
            >
              Continuar al Pago <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-page { padding-bottom: 5rem; }
        .checkout-header { margin-bottom: 3rem; text-align: center; }
        .btn-back {
          background: transparent;
          border: none;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 1rem;
          transition: var(--transition);
        }
        .btn-back:hover { color: var(--primary); }
        .checkout-title { font-size: 3rem; }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2.5rem;
          align-items: start;
        }

        /* Detail Panel */
        .court-detail-panel { overflow: hidden; }
        .detail-image-wrapper { position: relative; }
        .detail-image { width: 100%; height: 300px; object-fit: cover; }
        .court-type-tag {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          background: var(--primary);
          color: #000;
          padding: 0.4rem 1rem;
          border-radius: 10px;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        .detail-content { padding: 2.5rem; }
        .court-name { font-size: 2rem; margin-bottom: 0.5rem; }
        .location-row { display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.9rem; }
        .rating-box {
          background: rgba(255,255,255,0.05);
          padding: 0.5rem 0.75rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 700;
        }
        .court-description { color: var(--text-muted); margin: 1.5rem 0 2rem; line-height: 1.6; }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.03);
          padding: 1rem;
          border-radius: 16px;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
        }
        .feature-item svg { color: var(--primary); }
        .price-summary {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .price-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem; }
        .price-amount { font-size: 2rem; font-weight: 800; color: var(--accent); font-family: 'Outfit', sans-serif; }

        /* Selection Panel */
        .selection-panel { padding: 2.5rem; }
        .panel-section { margin-bottom: 2.5rem; }
        .panel-title { display: flex; align-items: center; gap: 0.75rem; font-size: 1.25rem; margin-bottom: 1.5rem; }
        .slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 0.75rem;
        }
        .slot-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.85rem;
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
        }
        .slot-btn:hover:not(:disabled) {
          border-color: var(--primary);
          background: rgba(0, 210, 255, 0.05);
        }
        .slot-btn.selected {
          background: var(--primary);
          color: #000;
          border-color: var(--primary);
          box-shadow: 0 0 20px var(--primary-glow);
        }
        .slot-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .slot-time { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.1rem; }
        .slot-status { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.2rem; font-weight: 700; }
        
        .selection-footer {
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 2rem;
        }
        .summary-info { margin-bottom: 1.5rem; text-align: center; }
        .summary-text { font-size: 1rem; color: var(--text-main); }
        .summary-hint { color: var(--text-dim); font-size: 0.9rem; font-style: italic; }
        .btn-full { width: 100%; padding: 1.1rem; font-size: 1.1rem; }
        .custom-date {
          background: rgba(0, 210, 255, 0.05);
          border-color: var(--primary-glow);
          color: var(--text-main);
        }
        .form-input.custom-date::-webkit-calendar-picker-indicator {
          filter: brightness(0) invert(1) !important;
          cursor: pointer;
        }
        @media (max-width: 1024px) {
          .checkout-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default BookingSummary;
