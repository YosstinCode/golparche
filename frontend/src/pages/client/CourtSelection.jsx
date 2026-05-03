import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, MapPin, Search, Filter, 
  ChevronRight, Calendar, Users, 
  Star, Clock, LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001';

const CourtSelection = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Todas');

  useEffect(() => {
    fetch(`${API_BASE_URL}/fields`)
      .then(res => res.json())
      .then(data => {
        setCourts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredCourts = filterType === 'Todas' 
    ? courts 
    : courts.filter(c => c.tipo.toLowerCase().includes(filterType.toLowerCase()));

  return (
    <div className="landing-page animate-fade">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Trophy size={14} className="badge-icon" />
            <span>La mejor red de canchas de la ciudad</span>
          </div>
          <h1 className="hero-title">
            Reserva tu Cancha, <br />
            <span className="text-gradient">Domina el Juego</span>
          </h1>
          <p className="hero-subtitle">
            Encuentra el escenario perfecto para tu próximo partido. Rápido, fácil y seguro.
          </p>
          
          <div className="hero-actions">
            <a href="#canchas" className="btn btn-primary btn-lg">
              Explorar Canchas <ChevronRight size={18} />
            </a>
            {profile?.rol === 'admin' && (
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/admin')}>
                <LayoutDashboard size={18} /> Panel Admin
              </button>
            )}
          </div>
        </div>

        {/* Stats overlay */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num">4+</span>
            <span className="stat-text">Escenarios Elite</span>
          </div>
          <div className="stat-item">
            <span className="stat-num">300+</span>
            <span className="stat-text">Jugadores Activos</span>
          </div>
          <div className="stat-item">
            <span className="stat-num" style={{ fontSize: '1.8rem' }}>2PM - 11PM</span>
            <span className="stat-text">Horario de Atención</span>
          </div>
        </div>
      </section>

      {/* Courts Section */}
      <section id="canchas" className="courts-section">
        <div className="section-header">
          <div className="section-title-group">
            <h2 className="section-title">Nuestras <span className="text-gradient">Sedes</span></h2>
            <p className="section-subtitle">Selecciona la cancha que mejor se adapte a tu equipo</p>
          </div>

          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <button 
              className={`filter-btn ${filterType === 'Todas' ? 'active' : ''}`} 
              onClick={() => setFilterType('Todas')}
            >
              Todas
            </button>
            <button 
              className={`filter-btn ${filterType === 'Sintética' ? 'active' : ''}`} 
              onClick={() => setFilterType('Sintética')}
            >
              Sintética
            </button>
            <button 
              className={`filter-btn ${filterType === 'Fútbol 5' ? 'active' : ''}`} 
              onClick={() => setFilterType('Fútbol 5')}
            >
              Fútbol 5
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Cargando escenarios...</p>
          </div>
        ) : (
          <div className="courts-grid grid grid-cols-1 grid-cols-2 lg:grid-cols-3">
            {filteredCourts.map(court => (
              <div 
                key={court.id} 
                className="court-card glass-card"
                onClick={() => navigate('/checkout', { state: { court } })}
              >
                <div className="court-image-wrapper">
                  <img src={court.imagen_url} alt={court.nombre} className="court-image" />
                  <div className="court-badge">{court.tipo}</div>
                  <div className="court-rating">
                    <Star size={12} fill="var(--accent)" color="var(--accent)" />
                    <span>4.9</span>
                  </div>
                </div>

                <div className="court-card-body">
                  <h3 className="court-name">{court.nombre}</h3>
                  <div className="court-details">
                    <div className="detail-item">
                      <MapPin size={14} />
                      <span>{court.ubicacion || 'Girardot, Cundinamarca'}</span>
                    </div>
                    <div className="detail-item">
                      <Users size={14} />
                      <span>10 Jugadores</span>
                    </div>
                  </div>
                  
                  <div className="court-card-footer">
                    <div className="price-tag">
                      <span className="price-label">Desde</span>
                      <span className="price-value">${court.precio_hora.toLocaleString('es-CO')} <small>/ h</small></span>
                    </div>
                    <div className="action-hint">
                      Reservar <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .landing-page {
          padding-top: 2rem;
          padding-bottom: 6rem;
        }

        /* Hero */
        .hero-section {
          position: relative;
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          margin-bottom: 6rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 210, 255, 0.1);
          color: var(--primary);
          padding: 0.5rem 1rem;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 2rem;
          border: 1px solid rgba(0, 210, 255, 0.2);
        }

        .hero-title {
          font-size: clamp(3rem, 8vw, 5rem);
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto 3rem;
        }

        .hero-actions {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-lg {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
        }

        .hero-stats {
          display: flex;
          gap: 4rem;
          margin-top: 6rem;
          padding: 2rem 4rem;
          background: rgba(255,255,255,0.02);
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-num {
          font-family: 'Outfit', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary);
        }

        .stat-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.25rem;
        }

        /* Courts Section */
        .courts-section {
          scroll-margin-top: 4rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .section-title {
          font-size: 2.75rem;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.03);
          padding: 0.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .filter-icon {
          color: var(--text-dim);
          margin-left: 0.75rem;
        }

        .filter-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.5rem 1.25rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }

        .filter-btn:hover {
          color: var(--text-main);
        }

        .filter-btn.active {
          background: var(--primary);
          color: #000;
        }

        /* Court Card */
        .court-image-wrapper {
          position: relative;
          padding: 1.25rem;
          padding-bottom: 0;
        }

        .court-image {
          width: 100%;
          height: 240px;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        }

        .court-badge {
          position: absolute;
          top: 2.25rem;
          left: 2.25rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          color: white;
          padding: 0.35rem 0.85rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .court-rating {
          position: absolute;
          top: 2.25rem;
          right: 2.25rem;
          background: rgba(255, 255, 255, 0.95);
          color: #000;
          padding: 0.35rem 0.75rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .court-card-body {
          padding: 2rem;
        }

        .court-name {
          font-size: 1.75rem;
          margin-bottom: 1rem;
        }

        .court-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .court-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .price-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-dim);
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--accent);
          font-family: 'Outfit', sans-serif;
        }

        .price-value small {
          font-size: 0.9rem;
          font-weight: 400;
          opacity: 0.7;
        }

        .action-hint {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.95rem;
        }

        .loader-container {
          text-align: center;
          padding: 6rem 0;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .hero-stats { gap: 2rem; padding: 1.5rem 2rem; }
        }

        @media (max-width: 768px) {
          .hero-stats { display: none; }
          .section-header { flex-direction: column; align-items: flex-start; }
          .hero-title { font-size: 3.5rem; }
        }
      `}</style>
    </div>
  );
};

export default CourtSelection;
